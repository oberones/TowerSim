/** Create a text-only element so player/content strings are never interpreted as markup. */
export function element<K extends keyof HTMLElementTagNameMap>(tag:K,text='',className=''):HTMLElementTagNameMap[K] {const e=document.createElement(tag);e.textContent=text;e.className=className;return e;}
/** Create one semantic button with a named action and visible keyboard focus. */
export function button(text:string,action:()=>void):HTMLButtonElement {const e=element('button',text);e.type='button';e.addEventListener('click',action);return e;}
/** Format integer minor units as player-facing money without changing accounting. */
export function money(minor:number):string {return `$${(minor/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}

/** Format scenario schedule ticks as a readable 24-hour time without assuming default windows. */
export function timeOfDay(seconds:number):string {return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}`;}
