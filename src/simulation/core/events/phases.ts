/** Versioned order. Hooks operate on unpublished domain work, never presentation state. */
export interface BoundaryPhases {
  integrate:()=>void; boundary:()=>void; events:()=>void;
  completions:()=>void; decisions:()=>void; commit:()=>void;
}
/** Run all six deterministic phases in the published contract order before exposing a boundary. */
export function runBoundary(phases:BoundaryPhases):void {
  phases.integrate(); phases.boundary(); phases.events();
  phases.completions(); phases.decisions(); phases.commit();
}
export const EVENT_PRIORITIES=Object.freeze({dayBoundary:0,departure:10,review:20,arrival:30,financial:40} as const);
