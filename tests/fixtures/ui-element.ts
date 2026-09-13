/** Minimal event-driven DOM stand-in for control tests; layout is verified in the browser. */
export class UiElement extends EventTarget {
 children:UiElement[]=[];parentElement:UiElement|null=null;hidden=false;disabled=false;tabIndex=0;open=false;id='';textContent='';className='';style:Record<string,string>={};offsetWidth=200;offsetHeight=80;attributes=new Map<string,string>();value='';captured=new Set<number>();
 classList={toggle:(name:string,enabled:boolean)=>{const names=new Set(this.className.split(' ').filter(Boolean));if(enabled)names.add(name);else names.delete(name);this.className=[...names].join(' ');return enabled;}};
 /** Read numeric controls like a browser input. */
 get valueAsNumber():number {return this.value===''?NaN:Number(this.value);}
 /** Track pointer ownership during movable preview tests. */
 setPointerCapture(id:number):void {this.captured.add(id);}
 /** Check whether a gesture still owns capture. */
 hasPointerCapture(id:number):boolean {return this.captured.has(id);}
 /** Release a completed or canceled gesture. */
 releasePointerCapture(id:number):void {this.captured.delete(id);}
 /** Keep tag names compatible with native DOM element checks. */
 constructor(public tagName:string){super();this.tagName=tagName.toUpperCase();}
 /** Attach persistent controls while tracking their wrapper for tab visibility. */
 append(...nodes:UiElement[]):void {for(const node of nodes){node.parentElement=this;this.children.push(node);}}
 /** Replace mounted controls while releasing their old parent relationships. */
 replaceChildren(...nodes:UiElement[]):void {for(const child of this.children)child.parentElement=null;this.children=[];this.append(...nodes);}
 /** Model dialog visibility for construction-session replacement tests. */
 showModal():void {this.open=true;}
 /** Close a dialog and dispatch its native focus-restoration notification. */
 close():void {this.open=false;this.dispatchEvent(new Event('close'));}
 /** Preserve accessible control state for assertions. */
 setAttribute(name:string,value:string):void {this.attributes.set(name,value);}
 /** Read selected tool and tab semantics as the input adapters do. */
 getAttribute(name:string):string|null {return this.attributes.get(name)??null;}
 /** Native disabled buttons do not submit click actions. */
 click():void {if(!this.disabled)this.dispatchEvent(new Event('click'));}
 /** Track focus without needing a real browser window. */
 focus():void {uiDocument.activeElement=this;}
 /** Resolve containment for dismissal focus restoration. */
 contains(value:unknown):boolean {return value===this||this.children.some(child=>child.contains(value));}
 /** Supply stable CSS bounds for pointer conversion. */
 getBoundingClientRect(){return {left:0,top:0,width:900,height:600};}
}
export const uiDocument={activeElement:null as UiElement|null,createElement:(tag:string)=>new UiElement(tag)};
