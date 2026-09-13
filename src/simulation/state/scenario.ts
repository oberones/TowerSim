import { assertContent, assertWorld } from './content';
import type { WorldConfig, Content } from './content';
import { integer, DomainError } from '../core/values';
import { assertPlain, record, freezeDeep, clonePlain } from './plain';
/** Kernel-only input. World/content fields are introduced with their owning stories. */
export interface KernelScenario {
  readonly scenarioId:string; readonly scenarioVersion:1;
  readonly tickSeconds:1; readonly dayTicks:86400; readonly initialTick:21600;
  readonly startingFundsMinor:number; readonly capabilities:readonly never[];
  readonly world?:WorldConfig; readonly content?:Content;
}
export interface PlayableScenario extends KernelScenario {readonly world:WorldConfig;readonly content:Content}
/** Copy and freeze validated kernel or playable scenario data without accepting unknown fields. */
export function validateScenario(value:unknown):KernelScenario {
  assertPlain(value);
  const playable=!!value && typeof value==='object' && ('world' in value || 'content' in value);
  const s=record(value,['scenarioId','scenarioVersion','tickSeconds','dayTicks','initialTick','startingFundsMinor','capabilities',...(playable?['world','content']:[])]);
  if(typeof s.scenarioId!=='string' || !/^[a-z][a-z0-9-]*$/.test(s.scenarioId) || s.scenarioVersion!==1 || s.tickSeconds!==1 || s.dayTicks!==86400 || s.initialTick!==21600 || !Array.isArray(s.capabilities) || s.capabilities.length!==0 || typeof s.startingFundsMinor!=='number' || integer(s.startingFundsMinor)<0)throw new DomainError('invalidState','Unsupported kernel scenario/capabilities');
  if(playable){assertContent(s.content as Content);assertWorld(s.world as WorldConfig,s.content as Content);}
  return freezeDeep(clonePlain(value as KernelScenario));
}
