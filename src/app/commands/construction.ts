import type { GameSession } from '../game/session';
import type { FloorKind, FloorPayload } from '../../simulation/commands/types';
/** Preview the exact logical intent against the currently published revision without mutation. */
export function previewConstruction(session:GameSession,kind:FloorKind,payload:FloorPayload){return session.preview({kind,payload});}
/** Revalidate at commit through ordered application ingress; a prior quote never authorizes stale geometry. */
export function commitConstruction(session:GameSession,kind:FloorKind,payload:FloorPayload){return session.dispatch({kind,payload});}
