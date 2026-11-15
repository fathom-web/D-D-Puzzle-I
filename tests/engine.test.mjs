import test from 'node:test';import assert from 'node:assert/strict';
import {ROLES,START,EXPECTED,transition,newGame,viewFor} from '../src/engine.js';
const play=(s,a,t,p={})=>transition(s,a,t,p);
test('all five roles are necessary and sound transformations are correct',()=>{
 let s=newGame();s=play(s,'dm','start');assert.equal(s.phase,'discovery');
 const correct={quasar:1,gnarly:0,kagen:2,bryndis:1,vespera:0};for(let r of ROLES)s=play(s,r,'stone',{index:correct[r]});
 assert.equal(s.phase,'chain');assert.equal(s.signal,START);
 assert.throws(()=>play(s,'gnarly','submit',{pattern:EXPECTED[1]}),/nog niet/);
 const turns=['quasar','gnarly','kagen','bryndis','vespera','quasar'];
 for(let i=0;i<6;i++){s=play(s,turns[i],'submit',{pattern:EXPECTED[i]});assert.equal(s.turn,i+1)}
 assert.equal(s.phase,'seal');for(let r of ROLES)s=play(s,r,'seal');assert.equal(s.phase,'escaped');
 assert.throws(()=>play(s,'quasar','reveal'),/toegestaan/);s=play(s,'dm','reveal');assert.equal(s.phase,'reveal');
});
test('wrong signals add an attempt and do not advance',()=>{let s=newGame();s=play(s,'dm','start');s=play(s,'quasar','stone',{index:0});assert.equal(s.attempts.quasar,1);assert.equal(s.discover.quasar,false)});
test('DM privileges and player view isolation',()=>{let s=newGame();assert.throws(()=>play(s,'vespera','start'));let v=viewFor(s,'vespera');assert.equal(v.signal,undefined);assert.equal(v.revealText,undefined);assert.equal(viewFor(s,'screen').log,undefined);});
test('DM reset returns to safe state',()=>{let s=newGame();s=play(s,'dm','start');s=play(s,'dm','reset');assert.equal(s.phase,'lobby');assert.equal(s.revision,2)});
