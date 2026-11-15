import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

const appFile = existsSync(new URL('../app.js', import.meta.url)) ? new URL('../app.js', import.meta.url) : new URL('../frontend/app.js', import.meta.url);
const code = readFileSync(appFile, 'utf8').replace(
  'startup().catch(e=>renderError(e.message));',
  'globalThis.__engine = {makeSeed, transform, demoAct, newDemo, loadDemo, ORDER, CHAIN};'
);
const storage = new Map();
const store = {getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const context = vm.createContext({
  window:{TEMPLE_CONFIG:{},addEventListener(){}},document:{getElementById(){return {innerHTML:''}}},
  location:{search:'',href:'https://local.example/'},
  localStorage:store,sessionStorage:store,matchMedia:()=>({matches:false}),
  URLSearchParams,crypto:webcrypto,TextEncoder,console,
  setTimeout,clearTimeout,setInterval,clearInterval,CustomEvent:class{},
});
vm.runInContext(code,context,{filename:'app.js'});
const E = context.__engine;
assert.ok(E,'Actual app engine must be exported by test harness');

for(let i=0;i<200;i++){
  const seed=E.makeSeed();
  assert.equal(seed.length,5);
  assert.notEqual(seed[1],seed[3], 'seed must satisfy the puzzle invariant');
  let state=Array.from(seed);
  for(const role of Array.from(E.CHAIN).slice(0,5))state=Array.from(E.transform(role,state));
  assert.deepEqual(state,Array.from(seed,v=>1-v),'full chain must invert starting signal');
}

const setup=E.newDemo();
const s=E.loadDemo(setup.code);
const order=Array.from(E.ORDER),chain=Array.from(E.CHAIN);
assert.equal(s.phase,'lobby');
E.demoAct(s,null,'dm.start',{});
assert.equal(s.phase,'intro');
E.demoAct(s,null,'dm.advance',{});
assert.equal(s.phase,'discover');
for(const role of order) E.demoAct(s,role,'player.stone',{index:s.stones[role]});
assert.equal(s.phase,'chain');

const initialTurn=s.turn;
assert.throws(()=>E.demoAct(s,'gnarly','player.pattern',{bits:[0,0,0,0,0]}), /wacht/);
assert.equal(s.turn,initialTurn,'wrong player cannot advance the chain');
for(const role of chain){
  const bits=s.turn===0?Array.from(s.seed):s.turn===5?Array.from(s.incoming):Array.from(E.transform(role,s.incoming));
  E.demoAct(s,role,'player.pattern',{bits});
}
assert.equal(s.phase,'seal');
assert.equal(s.history.length,6);
for(const role of order)E.demoAct(s,role,'player.seal',{});
assert.equal(s.phase,'escaped');
E.demoAct(s,null,'dm.phase',{phase:'battle'});
assert.equal(s.phase,'battle');
E.demoAct(s,null,'dm.phase',{phase:'reveal'});
assert.equal(s.phase,'reveal');

console.log('PASS 200 randomized valid seeds');
console.log('PASS complete five-player room discovery, chain, simultaneous seal, battle and book finale');
console.log('PASS wrong player cannot advance chain');