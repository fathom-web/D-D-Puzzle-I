/** Shared deterministic puzzle engine. No secrets or tokens are stored here. */
export const ROLES=['quasar','gnarly','kagen','bryndis','vespera'];
export const NAMES={quasar:'Quasar Qadiran',gnarly:'Gnarly Glimmer',kagen:'Kagen Bloodmoon',bryndis:'Bryndis Highwind',vespera:'Vespera'};
export const ROOM={
 quasar:{name:'Het Zonneheiligdom',subtitle:'De Eerste Vlam',sigil:'☼',stone:1,clue:'De zon spreekt als eerste. Geef de vijf pulsen exact door. Wanneer de echo terugkeert, herken het omgekeerde licht.'},
 gnarly:{name:'De Kamer der Echo’s',subtitle:'De Tweede Stem',sigil:'◉',stone:0,clue:'Geen echo klinkt zoals zij werd geboren. Het laatste geluid is het eerste dat terugkeert.'},
 kagen:{name:'Het Stenen Hart',subtitle:'De Derde Verschuiving',sigil:'⬡',stone:2,clue:'De tweede en de vierde steen zijn ontrouw aan hun aard. Waar licht stond, laat donker klinken.'},
 bryndis:{name:'De Wachterskamer',subtitle:'Het Vierde Schild',sigil:'◇',stone:1,clue:'De wachter verwisselt de posten aan de uiteinden. De eerste neemt de laatste plaats; de laatste de eerste.'},
 vespera:{name:'De Fluisterkamer',subtitle:'De Vijfde Schaduw',sigil:'☾',stone:0,clue:'Alles wat deze kamer raakt, wordt zijn tegenbeeld. Kort wordt lang. Lang wordt kort.'}
};
export const START='S L S S L';
export const EXPECTED=['S L S S L','L S S L S','L L S S S','S L S S L','L S L L S','L S L L S'];
export const HINTS={
 quasar:['De eerste reeks ligt in de zonneschijf verborgen. Beluister haar zorgvuldig.','Het Zonneheiligdom zendt vijf pulsen in dezelfde volgorde als gehoord.','Vul KORT – LANG – KORT – KORT – LANG in. Bij terugkeer geef je de ontvangen reeks opnieuw door.'],
 gnarly:['Wat achter je begint, verschijnt voor je.','Draai de volgorde van de vijf ontvangen pulsen volledig om.','L – S – S – L – S is de omgekeerde reeks.'],
 kagen:['Twee stenen veranderen van gedaante, de overige blijven gelijk.','Alleen positie twee en vier worden tegengesteld: kort wordt lang, lang wordt kort.','Na de wisseling: L – L – S – S – S.'],
 bryndis:['Bewakers van de poorten kunnen van plaats wisselen.','Verwissel de eerste puls met de vijfde; verander de middelste pulsen niet.','Na de wisseling: S – L – S – S – L.'],
 vespera:['Schaduw en licht zijn tegenpolen.','Keer iedere puls om, zonder de volgorde te veranderen.','Na de omzetting: L – S – L – L – S.']
};
export const PHASES={lobby:'De poort wacht',discovery:'De Ontwakende Stenen',chain:'De Keten der Echo’s',seal:'Het Vijfvoudige Zegel',escaped:'De Poorten Geopend',reveal:'Het Testament Ontwaakt'};
export const demoId='demo';
export function newGame(id='demo'){
 return {id,phase:'lobby',paused:false,revision:0,createdAt:Date.now(),startedAt:null,discover:Object.fromEntries(ROLES.map(r=>[r,false])),turn:0,signal:START,attempts:Object.fromEntries(ROLES.map(r=>[r,0])),hints:Object.fromEntries(ROLES.map(r=>[r,0])),seal:Object.fromEntries(ROLES.map(r=>[r,false])),sealStartedAt:null,revealText:'Er liggen vier schaduwen over de verloren plaatsen. AETHER · VITAE · UMBRA · RUIN. De eerste weg wacht nog op een naam.',log:['De tempel wacht op vijf reizigers.']};
}
export function actingRole(state){return ROLES[state.turn%5];}
export function clampState(s){if(!s || !ROLES.every(r=>r in (s.discover||{})))return newGame();return s}
export function transition(state,actor,type,payload={}){
 let s=structuredClone(state);const isDM=actor==='dm';let changed=false;const say=t=>{s.log=[`${new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})} · ${t}`,...s.log].slice(0,24);changed=true};
 if(s.paused && type!=='resume' && type!=='reset')throw Error('De tempel is gepauzeerd.');
 if(type==='start'&&isDM&&s.phase==='lobby'){s.phase='discovery';s.startedAt=Date.now();say('De vijf deuren vallen dicht.');}
 else if(type==='stone'&&ROLES.includes(actor)&&s.phase==='discovery'){
  if(s.discover[actor])throw Error('Je zegel is al wakker.');
  if(payload.index!==ROOM[actor].stone){s.attempts[actor]++;say(`${NAMES[actor]} onderzoekt een zwijgende steen.`)}
  else {s.discover[actor]=true;say(`${NAMES[actor]} heeft een resonantiesteen gewekt.`);if(ROLES.every(r=>s.discover[r])){s.phase='chain';s.turn=0;s.signal=START;say('De echo begint haar reis.');}}
 }
 else if(type==='submit'&&ROLES.includes(actor)&&s.phase==='chain'){
  if(actor!==actingRole(s))throw Error('De echo is nog niet in jouw kamer.');
  let pattern=String(payload.pattern||'').trim();if(!/^[SL]( [SL]){4}$/.test(pattern))throw Error('Voer precies vijf korte of lange pulsen in.');
  if(pattern!==EXPECTED[s.turn]){s.attempts[actor]++;say(`De steen in ${ROOM[actor].name} weerstaat het antwoord.`)}
  else{s.signal=pattern;s.turn++;say(`${NAMES[actor]} zendt de juiste echo verder.`);if(s.turn>=6){s.phase='seal';s.sealStartedAt=null;s.seal=Object.fromEntries(ROLES.map(r=>[r,false]));say('Het Vijfvoudige Zegel ontwaakt.');}}
 }
 else if(type==='seal'&&ROLES.includes(actor)&&s.phase==='seal'){
  let now=Date.now();if(!s.sealStartedAt||now-s.sealStartedAt>20000){s.sealStartedAt=now;s.seal=Object.fromEntries(ROLES.map(r=>[r,false]));}
  s.seal[actor]=true;say(`${NAMES[actor]} houdt een zegel vast.`);
  if(ROLES.every(r=>s.seal[r])){s.phase='escaped';say('De vijf deuren openen zich!');}
 }
 else if(type==='pause'&&isDM){s.paused=true;say('De tijd staat stil.');}
 else if(type==='resume'&&isDM){s.paused=false;say('De tijd beweegt opnieuw.');}
 else if(type==='hint'&&isDM&&ROLES.includes(payload.role)){s.hints[payload.role]=Math.min(3,s.hints[payload.role]+1);say(`Een teken verschijnt bij ${NAMES[payload.role]}.`)}
 else if(type==='skip'&&isDM&&s.phase==='chain'){say('De Bewaker geleidt de echo voort.');s.signal=EXPECTED[s.turn];s.turn++;if(s.turn>=6){s.phase='seal';s.sealStartedAt=null;say('Het Vijfvoudige Zegel ontwaakt.')}}
 else if(type==='open'&&isDM){s.phase='escaped';say('De poorten worden door de Dungeon Master geopend.');}
 else if(type==='reveal'&&isDM&&s.phase==='escaped'){s.phase='reveal';say('Het Testament van de Eerste Wereld ontwaakt.');}
 else if(type==='text'&&isDM){let t=String(payload.text||'').trim();if(t.length>450)throw Error('De tekst mag maximaal 450 tekens bevatten.');s.revealText=t;s.log=[`De onthullingstekst is voorbereid.`,...s.log].slice(0,24);changed=true;}
 else if(type==='reset'&&isDM){s=newGame(s.id);changed=true;}
 else throw Error('Deze handeling is in deze fase niet toegestaan.');
 if(changed)s.revision=(state.revision||0)+1;
 return s;
}
export function viewFor(state,actor){
 const s=structuredClone(state);if(actor==='dm')return s;
 if(actor==='screen')return {id:s.id,phase:s.phase,revision:s.revision,discover:s.discover,seal:s.seal,paused:s.paused,turn:s.turn,revealText:s.phase==='reveal'?s.revealText:undefined};
 if(!ROLES.includes(actor))throw Error('Onbekende tempelkamer.');
 return {id:s.id,phase:s.phase,revision:s.revision,paused:s.paused,role:actor,ready:s.discover[actor],turn:s.turn,isTurn:s.phase==='chain'&&actingRole(s)===actor,received:s.phase==='chain'&&actingRole(s)===actor?s.signal:null,attempts:s.attempts[actor],hint:s.hints[actor]?HINTS[actor].slice(0,s.hints[actor]):[],sealDone:s.seal[actor],sealCount:Object.values(s.seal).filter(Boolean).length,sealStartedAt:s.sealStartedAt,startedAt:s.startedAt};
}
