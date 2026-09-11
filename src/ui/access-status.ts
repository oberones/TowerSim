/** Translate a current access projection into a concise, truthful player-facing explanation. */
export function accessStatus(access:{accessible:boolean;reason:string}):string {return `${access.accessible?'Accessible':'Inaccessible'}: ${access.reason}.`;}
