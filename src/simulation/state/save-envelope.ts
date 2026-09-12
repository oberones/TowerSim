import { captureState,encodeState } from './codec';
import type { GameState } from './game-state';
import { STATE_VERSION,RULESET_ID,CONTENT_VERSION } from './game-state';
import { assertPlain,record } from './plain';
import { tick } from '../core/values';
export interface SaveMetadata {schemaVersion:1;rulesetId:string;contentVersion:string;scenarioId:string;slotId:string;displayName:string;savedTick:number;savedDay:number;payloadBytes:number}
export interface SaveEnvelope {metadata:SaveMetadata;state:GameState}
/** Count canonical UTF-8 bytes without importing browser or Node encoding APIs into the domain. */
export function payloadBytes(text:string):number {let count=0;for(const c of text){const n=c.codePointAt(0)!;count+=n<128?1:n<2048?2:n<65536?3:4;}return count;}
/** Capture a detached v1 envelope; all metadata must describe this exact authoritative boundary. */
export function createSaveEnvelope(state:GameState,slotId='local-main'):SaveEnvelope {const detached=captureState(state);return {metadata:{schemaVersion:STATE_VERSION,rulesetId:RULESET_ID,contentVersion:CONTENT_VERSION,scenarioId:detached.scenario.scenarioId,slotId,displayName:'TowerSim tower',savedTick:detached.clock.tick,savedDay:Math.floor(detached.clock.tick/detached.scenario.dayTicks),payloadBytes:payloadBytes(encodeState(detached))},state:detached};}
/** Reject malformed, unsupported or mismatched metadata before returning an independently validated candidate. */
export function validateSaveEnvelope(input:unknown,slotId='local-main'):SaveEnvelope {assertPlain(input);const root=record(input,['metadata','state']),m=record(root.metadata,['schemaVersion','rulesetId','contentVersion','scenarioId','slotId','displayName','savedTick','savedDay','payloadBytes']);const state=captureState(root.state as GameState);for(const k of ['savedTick','savedDay','payloadBytes'])tick(m[k] as number);if(m.schemaVersion!==STATE_VERSION||m.rulesetId!==state.rulesetId||m.contentVersion!==state.contentVersion||m.scenarioId!==state.scenario.scenarioId||m.slotId!==slotId||typeof m.displayName!=='string'||m.displayName.length>100||m.savedTick!==state.clock.tick||m.savedDay!==Math.floor(state.clock.tick/state.scenario.dayTicks)||m.payloadBytes!==payloadBytes(encodeState(state)))throw Error('Save metadata does not match the supported payload');return {metadata:{...m} as unknown as SaveMetadata,state};}
