# M2 one-worker observation — 2026-09-10

**Status:** implementation and automated continuation/inspection tests pass. T042 stays unchecked: this run has supplemental in-app observations, not the full Chrome/Firefox/Safari M2 qualification required by the validation plan.

Observed `dist-browser-test/` at `http://127.0.0.1:4174/`, **One worker — visible approach**, seed `00000001000000020000000300000004`, scenario `one-worker-observation`. One worker and walkingTicksPerCell=30 are disclosed fixture inputs. The chooser mounts an ordinary domain-generated pre-arrival state at about 09:10; no positions, occupancy or attendance are changed during play.

- Original Canvas office footprint and shared hallway rendered. At 09:17, the selected office showed leased, Assigned 1, Present 0, market 191, and accrued rent/costs.
- Normal speed produced the walking worker. Paused at 09:17 and selected it directly on Canvas: `occupant:6`, worker, walking, goal `facility:4`, visit traveling, Walking 334s, Waiting 0s. Selection and movement remained unchanged while paused and inspecting.
- After resumed play, the same selection showed `occupant:6`, insideFacility, admitted, with Assigned 1 and Present 1. Discovery of native Firefox delayed the next observation; that observation was on day 2 at 15:33. It establishes retained identity/indoor state, **not** continuous visual evidence of every intervening transition.
- Paused and removed the selected office using its ordinary button. The floor remained, free cells changed from 96 to 112, the settlement posted, and the same worker inspector changed to walking / exit / canceled at Walking 0s. Resuming showed walking time advance.

Automated `one-worker-walk`, `occupant-inspection`, `office-lifecycle`, `walking-runner`, and state-roundtrip tests cover the complete timed enter–walk–inside–walk–outside lifecycle, same-tick departure precedence, pause invariance, retirement and exact next-day continuation.

Native Firefox release smoke is recorded separately in [office evidence](us03-offices.md). No full native-browser M2 run or uninterrupted visual observation of a normal scheduled departure is claimed. Artifact/source hashes are in [phase-5-artifacts.json](../../../docs/phase-5-artifacts.json); behavioral observations preceded the final small quote-validation, HUD-status and inspector-refresh refinements, so they are supplemental evidence for that final artifact.
