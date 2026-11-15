// Supabase Edge Function: az-sahar-game. verify_jwt=false because each request is authenticated
// with a 256-bit per-session capability token; only session creation has no token.
// Deploy the deno.json and engine.js alongside this file.
import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
import {ROLES,newGame,transition,viewFor} from './engine.js';

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')||'';
const SERVER_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||Deno.env.get('SUPABASE_SECRET_KEY')||'';
if(!SUPABASE_URL||!SERVER_KEY)console.error('Missing Supabase project secrets.');
const supabase=createClient(SUPABASE_URL,SERVER_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const allowed=(Deno.env.get('AZ_SAHAR_ALLOWED_ORIGINS')||'https://fathom-web.github.io,https://novyxforge.com,http://localhost:4173,http://localhost:8000').split(',');
const encoder=new TextEncoder();
async function digest(s:string){const hash=await crypto.subtle.digest('SHA-256',encoder.encode(s));return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function token(){let b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b).map(v=>v.toString(16).padStart(2,'0')).join('')}
function originHeaders(req:Request){const origin=req.headers.get('origin')||'';const permitted=allowed.includes(origin);return {'Access-Control-Allow-Origin':permitted?origin:'null','Vary':'Origin','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'content-type,apikey,authorization,x-client-info','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}
function reply(req:Request,code:number,data:unknown){return new Response(JSON.stringify(data),{status:code,headers:originHeaders(req)})}
function error(message:string,code=400){return {message,code}}
function cleanIP(req:Request){return (req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').trim().slice(0,100)}
Deno.serve(async (req:Request)=>{
 const h=originHeaders(req);if(req.method==='OPTIONS')return new Response(null,{status:204,headers:h});
 if(req.method!=='POST')return reply(req,405,{error:'Alleen POST wordt ondersteund.'});
 const origin=req.headers.get('origin');if(origin&&!allowed.includes(origin))return reply(req,403,{error:'Deze website mag de tempel niet bedienen.'});
 if(Number(req.headers.get('content-length')||0)>7500)return reply(req,413,{error:'Bericht te groot.'});
 try{
  let body=await req.json();if(!body||typeof body!=='object')throw error('Ongeldig verzoek.');
  if(body.action==='create'){
    const ipHash=await digest(cleanIP(req));const recent=new Date(Date.now()-60*60_000).toISOString();
    const {count,error:rateErr}=await supabase.from('nom_az_sessions').select('id',{count:'exact',head:true}).eq('creator_ip_hash',ipHash).gte('created_at',recent);
    if(rateErr)throw error('Kan sessielimiet niet controleren.',503);
    if((count||0)>=10)throw error('Maximaal tien tempelsessies per uur. Probeer het later opnieuw.',429);
    const id=crypto.randomUUID(),dm=token();const dmHash=await digest(id+':'+dm),state=newGame(id);
    const {error:insertErr}=await supabase.from('nom_az_sessions').insert({id,state,revision:0,dm_token_hash:dmHash,creator_ip_hash:ipHash});
    if(insertErr)throw error('Sessies opslaan mislukt.',503);
    const members=await Promise.all([...ROLES,'screen'].map(async role=>{const t=token();return {role,token:t,session_id:id,token_hash:await digest(id+':'+t)}}));
    const {error:memberErr}=await supabase.from('nom_az_members').insert(members.map(({token,...rest})=>rest));
    if(memberErr){await supabase.from('nom_az_sessions').delete().eq('id',id);throw error('Spelerslinks aanmaken mislukt.',503)}
    return reply(req,200,{id,token:dm,links:Object.fromEntries(members.map(m=>[m.role,m.token]))});
  }
  const id=String(body.sessionId||'');const access=String(body.token||'');
  if(!/^[a-f0-9-]{36}$/.test(id)||!/^[a-f0-9]{64}$/.test(access))throw error('Ongeldige toegangscode.',403);
  const hash=await digest(id+':'+access);
  const {data:row,error:fetchErr}=await supabase.from('nom_az_sessions').select('id,state,revision,dm_token_hash').eq('id',id).maybeSingle();
  if(fetchErr)throw error('Kon deze tempel niet ophalen.',503);if(!row)throw error('Deze tempel bestaat niet.',404);
  let actor:string|null=null;
  if(row.dm_token_hash===hash)actor='dm';else{
    const {data:member,error:memErr}=await supabase.from('nom_az_members').select('role').eq('session_id',id).eq('token_hash',hash).maybeSingle();
    if(memErr)throw error('Toegang controleren mislukt.',503);if(member)actor=member.role;
  }
  if(!actor)throw error('Geen toegang tot deze tempel.',403);
  if(body.action==='get')return reply(req,200,{state:viewFor(row.state,actor)});
  if(body.action==='act'){
    if(actor==='screen')throw error('Dit presentatiescherm heeft alleen leesrechten.',403);
    const type=String(body.type||'');const payload=body.payload||{};
    const next=transition(row.state,actor,type,payload);
    const {data:updated,error:updateErr}=await supabase.from('nom_az_sessions').update({state:next,revision:next.revision,updated_at:new Date().toISOString()}).eq('id',id).eq('revision',row.revision).select('id').maybeSingle();
    if(updateErr)throw error('Actie kan niet worden opgeslagen.',503);
    if(!updated)throw error('De kamer is intussen veranderd. Herlaad je signaal en probeer opnieuw.',409);
    return reply(req,200,{state:viewFor(next,actor)});
  }
  throw error('Onbekende actie.');
 }catch(e){const x=e as {message?:string,code?:number};console.error('Temple request failed:',x.message);return reply(req,typeof x.code==='number'?x.code:400,{error:x.message||'Er ging iets mis.'})}
});
