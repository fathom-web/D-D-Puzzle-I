// Decorative vectors stay separate from the authoritative puzzle engine.
export function sigil(role, className = '') {
 const shapes = {
  quasar: '<circle cx="100" cy="100" r="27"/><circle cx="100" cy="100" r="35"/>'+Array.from({length:12},(_,i)=>`<path d="M100 48V24 M96 34L100 24L104 34" transform="rotate(${i*30} 100 100)"/>`).join(''),
  gnarly: '<circle cx="100" cy="100" r="9"/><path d="M81 78a29 29 0 0 0 0 44m38-44a29 29 0 0 1 0 44M67 63a49 49 0 0 0 0 74m66-74a49 49 0 0 1 0 74M52 48a70 70 0 0 0 0 104m96-104a70 70 0 0 1 0 104M100 19v25m0 112v25"/>',
  kagen: '<path d="M100 20l69 40v80l-69 40-69-40V60z M100 47l46 27v53l-46 27-46-27V74z M54 74l46 26 46-26M100 100v54 M31 60l23 14m92 0 23-14M100 20v27m-69 93 23-13m92 0 23 13"/>',
  bryndis: '<path d="M100 19l61 25v58q-2 43-61 78-59-35-61-78V44z M100 37l45 19v45q0 31-45 61-45-30-45-61V56z M100 55v85M76 82h48 M90 66l10-11 10 11 M81 129l19 16 19-16"/>',
  vespera: '<path d="M122 24a76 76 0 1 0 0 152 79 79 0 0 1 0-152Z M140 58l7 26 24 7-24 7-7 26-7-26-24-7 24-7Z M112 148l8 8-8 8-8-8Z"/>'
 };
 return `<svg class="sigil-svg ${className}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[role]||shapes.quasar}</svg>`;
}
export function mechanism(){
 const ticks=Array.from({length:60},(_,i)=>`<path d="M300 ${i%5?34:26}v${i%5?6:18}" transform="rotate(${i*6} 300 300)"/>`).join('');
 return `<svg class="mechanism" viewBox="0 0 600 600" fill="none" aria-hidden="true"><g class="mechanism-outer" stroke="currentColor"><circle cx="300" cy="300" r="278"/><circle cx="300" cy="300" r="266"/>${ticks}</g><g class="mechanism-inner" stroke="currentColor"><circle cx="300" cy="300" r="227"/><circle cx="300" cy="300" r="216" stroke-dasharray="2 13"/><path d="M300 73L516 367 167 475 167 125 516 233Z"/><path d="M300 73L433 475 84 233 516 233 167 475Z" opacity=".4"/><circle cx="300" cy="300" r="120"/><path d="M300 161l139 139-139 139-139-139Z"/></g><circle cx="300" cy="300" r="92" stroke="currentColor"/><circle cx="300" cy="300" r="84" stroke="currentColor" stroke-dasharray="1 8"/></svg>`;
}
export function testament(){return `<div class="testament-art" aria-hidden="true"><div class="revelation-halo">${mechanism()}</div><div class="light-column"></div><div class="sacred-book"><div class="book-page page-left"></div><div class="book-page page-right"></div><div class="book-spine"></div><span>✧</span></div><div class="book-plinth"></div></div>`;}
