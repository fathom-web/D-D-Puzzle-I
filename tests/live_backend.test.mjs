import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(fs.readFileSync('src/config.js','utf8'),context);
const cfg=context.window.AZ_SAHAR_CONFIG;
assert.ok(cfg.apiUrl && cfg.supabasePublishableKey, 'Live backend must be configured');
const roles=['quasar','gnarly','kagen','bryndis','vespera'];
const stones={quasar:1,gnarly:0,kagen:2,bryndis:1,vespera:0};
const chain=[
  ['quasar','S L S S L'],
  ['gnarly','L S S L S'],
  ['kagen','L L S S S'],
  ['bryndis','S L S S L'],
  ['vespera','L S L L S'],
  ['quasar','L S L L S']
];
let count=0;
async function request(action,args={},expectedStatus=200){
  const response=await fetch(cfg.apiUrl,{
    method:'POST',headers:{'content-type':'application/json','apikey':cfg.supabasePublishableKey,'origin':'https://fathom-web.github.io'},
    body:JSON.stringify({action,...args})
  });
  const json=await response.json().catch(()=>({}));
  assert.equal(response.status,expectedStatus,action+': HTTP '+response.status+' '+JSON.stringify(json));
  count++;
  return json;
}
const created=await request('create');
assert.match(created.id,/^[0-9a-f-]{36}$/);
assert.match(created.token,/^[0-9a-f]{64}$/);
for(const role of [...roles,'screen'])assert.match(created.links[role],/^[0-9a-f]{64}$/);
const {id}=created;
function auth(role){return {sessionId:id,token:role==='dm'?created.token:created.links[role]};}
const dm=async(type,payload={})=>request('act',{...auth('dm'),type,payload});
const act=async(role,type,payload={})=>request('act',{...auth(role),type,payload});

let seen=await request('get',auth('quasar'));
assert.equal(seen.state.role,'quasar');
assert.equal(seen.state.log,undefined);
assert.equal(seen.state.revealText,undefined);
assert.equal(seen.state.hints,undefined);
await request('get',{sessionId:id,token:'0'.repeat(64)},403);
await request('act',{...auth('screen'),type:'start'},403);

await dm('start');
seen=await request('get',auth('quasar'));
assert.equal(seen.state.phase,'discovery');
for(const role of roles)await act(role,'stone',{index:stones[role]});
seen=await request('get',auth('quasar'));
assert.equal(seen.state.phase,'chain');
for(const [role,pattern] of chain){
  seen=await request('get',auth(role));
  assert.equal(seen.state.isTurn,true);
  await act(role,'submit',{pattern});
}
seen=await request('get',auth('quasar'));
assert.equal(seen.state.phase,'seal');
for(const role of roles)await act(role,'seal');
seen=await request('get',auth('screen'));
assert.equal(seen.state.phase,'escaped');
assert.equal(seen.state.revealText,undefined);
await dm('reveal');
seen=await request('get',auth('screen'));
assert.equal(seen.state.phase,'reveal');
assert.match(seen.state.revealText,/AETHER/);
const direct=await fetch(cfg.supabaseUrl+'/rest/v1/nom_az_sessions?select=id&limit=1',{headers:{apikey:cfg.supabasePublishableKey,Authorization:'Bearer '+cfg.supabasePublishableKey}});
assert.ok([401,403,404].includes(direct.status),'Direct table access must not return data; HTTP '+direct.status);
console.log('LIVE MULTIPLAYER BACKEND PASS: '+count+' API requests; 5 player roles; 6 chained signals; 5 seals; secure role filtering; DM-only reveal; direct database read denied.');
