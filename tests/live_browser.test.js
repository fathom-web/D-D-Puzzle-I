import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root='https://fathom-web.github.io/D-D-Puzzle-I/';
const roles=['quasar','gnarly','kagen','bryndis','vespera'];
const stones=[1,0,2,1,0];
const chain=[
  ['quasar','S L S S L'],['gnarly','L S S L S'],['kagen','L L S S S'],
  ['bryndis','S L S S L'],['vespera','L S L L S'],['quasar','L S L L S']
];
const browser=await chromium.launch({headless:true});
const pages={};
let dm, cinema;
try{
  const dmContext=await browser.newContext({viewport:{width:1280,height:800}});
  dm=await dmContext.newPage();
  await dm.goto(root,{waitUntil:'domcontentloaded',timeout:30000});
  await dm.waitForSelector('text=LIVE MULTIPLAYER BESCHIKBAAR',{timeout:30000});
  await dm.click('[data-act="create"]');
  await dm.waitForSelector('.dm-layout',{timeout:30000});
  const sess=await dm.evaluate(()=>{
    const id=new URLSearchParams(location.hash.slice(1)).get('dm');
    const info=JSON.parse(sessionStorage.getItem('az_sahar_dm_'+id));
    return {id,links:info.links};
  });
  assert.ok(sess.id);
  for(const role of roles){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage();
    pages[role]=page;
    await page.goto(root+'#play='+sess.id+'&token='+sess.links[role]+'&role='+role,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('.room-scene, .lockscreen',{timeout:30000});
  }
  cinema=await browser.newPage({viewport:{width:1280,height:720}});
  await cinema.goto(root+'#screen='+sess.id+'&token='+sess.links.screen,{waitUntil:'domcontentloaded',timeout:30000});
  await cinema.waitForSelector('.center-screen',{timeout:30000});
  await dm.click('[data-act="start"]');
  for(let i=0;i<roles.length;i++){
    const p=pages[roles[i]];
    await p.waitForSelector('[data-act="stone-'+stones[i]+'"]',{timeout:20000});
    await p.click('[data-act="stone-'+stones[i]+'"]');
  }
  for(const [role,seq] of chain){
    const p=pages[role];
    await p.waitForSelector('[data-act="short"]',{timeout:30000});
    for(const letter of seq.split(' ')){
      await p.click('[data-act="'+(letter==='S'?'short':'long')+'"]');
    }
    await p.click('[data-act="submit"]');
  }
  await Promise.all(roles.map(async role=>{
    const p=pages[role];
    await p.waitForSelector('[data-act="seal"]',{timeout:30000});
  }));
  await Promise.all(roles.map(role=>pages[role].click('[data-act="seal"]')));
  await dm.waitForSelector('[data-act="reveal"]',{timeout:30000});
  await cinema.waitForSelector('text=De Poorten Geopend',{timeout:30000});
  await dm.click('[data-act="reveal"]');
  await cinema.waitForSelector('text=Het Testament Ontwaakt',{timeout:30000});
  console.log('BROWSER E2E LIVE PASS: 5 isolated mobile browser contexts + DM + cinema, six signals, concurrent seals, delayed reveal.');
}catch(e){
  console.error('BROWSER E2E LIVE FAILED:',e.message);
  if(dm)await dm.screenshot({path:'/tmp/az-sahar-live-browser-debug.png',fullPage:true}).catch(()=>{});
  throw e;
}finally{await browser.close();}
