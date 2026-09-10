# Lip sync and voice-mouth setup

This guide describes a Rive-first mouth pipeline for AI avatars and AI companions. It is intentionally provider-neutral: the voice provider may be cloud TTS, local TTS, or prerecorded audio, as long as the app can align mouth updates to the audio playback clock.

## The recommended pipeline

```text
assistant response
      |
      v
TTS audio + timed phoneme/viseme events
      |
      v
audio player clock ----> viseme scheduler ----> Rive `viseme`
        |                                      Rive `audioLevel`
        +-------------- speaking activity ----> Rive `activity`
```

The application owns timing and cancellation. Rive owns the visual rig. Do not schedule mouth frames from network arrival time: buffering, latency and retries make that drift away from the sound the user is hearing.

## 1. Build the Rive mouth rig

Create one character artboard and a named State Machine, for example `Avatar`. Prefer a default View Model with these Number properties:

| Property | Range | Purpose |
| --- | ---: | --- |
| `activity` | 0–6 | Idle, listening, thinking, speaking and system states |
| `viseme` | 0–14 | Discrete mouth shape selected by the app |
| `audioLevel` | 0–1 | Continuous jaw/open-mouth energy |

The full starter contract also includes `emotion`, `lookX` and `lookY`; see [the character contract](character-contract.md).

### Mouth layers

Use separate visual responsibilities so two controls do not fight each other:

1. `viseme` selects the phonetic mouth pose: lips, teeth, tongue and jaw shape.
2. `audioLevel` adds a restrained jaw/open blend inside that pose. It should not replace the viseme.
3. A short idle-breath or micro-motion layer may run only when `activity` is not speaking.

Drive the mouth from one clear ownership path. If both a timeline and a state machine write the same mouth bones, expect popping, stuck poses or provider-dependent results.

### Suggested viseme table

These are semantic slots for this project, not a universal provider format. Keep the table in the asset handoff and adapt provider labels to it.

| Index | Shape | Typical sounds |
| ---: | --- | --- |
| 0 | Rest / closed | silence, pause |
| 1 | Open / A | `a`, `ah` |
| 2 | Wide / E | `e`, `ee` |
| 3 | Round / O | `o`, `oh` |
| 4 | Pucker / U | `u`, `oo` |
| 5 | Closed lips | `m`, `b`, `p` |
| 6 | Lip-tooth | `f`, `v` |
| 7 | Tongue / teeth | `th` |
| 8 | Sibilant | `s`, `z`, `sh` |
| 9 | Wide consonant | `ch`, `j` |
| 10 | Tongue-up | `t`, `d`, `n`, `l` |
| 11 | Back consonant | `k`, `g`, `ng` |
| 12 | R-colored | `r` |
| 13 | Narrow | `i`, `y` |
| 14 | Rest variant | soft neutral transition |

Use the smallest useful set at first. A consistent 8-shape rig usually looks better than 15 poorly separated shapes.

## 2. Author the Data Binding in Rive

1. Add the Number properties to the default View Model.
2. Assign the default View Model instance to the character artboard.
3. Bind the properties to the mouth controls and State Machine blend/transition logic.
4. Set all defaults to zero; `activity = 0` must show a closed, neutral mouth.
5. Export the `.riv` and record the artboard, State Machine, instance, property names and viseme table.

Data Binding is the preferred path for new assets because the same semantic properties can be used across supported runtimes. For older files, the starter supports matching legacy numeric State Machine inputs as a compatibility path.

## 3. Connect the starter

The existing adapter resolves bindings once after Rive loads, then writes a complete validated state:

```js
import { StateMachineInputType } from '@rive-app/webgl2';
import { createController } from './src/contract.js';
import { resolveBindings } from './src/bindings.js';

const write = resolveBindings(
  riveInstance,
  'data-binding',
  'Avatar',
  StateMachineInputType.Number,
);

const avatar = createController(write);
avatar.set({ activity: 3 }); // speaking
avatar.set({ viseme: 5, audioLevel: 0.35 });
avatar.set({ activity: 0 }); // closes and resets the mouth
```

The starter clamps values and automatically resets `viseme` and `audioLevel` whenever activity leaves speaking. This is the safety boundary for interruptions, errors and ended playback.

## 4. Schedule against audio playback

Represent provider output as timed events in seconds from the start of the audio clip:

```js
// Example normalized events; convert provider-specific labels before this point.
const events = [
  { time: 0.00, viseme: 5 },
  { time: 0.08, viseme: 1 },
  { time: 0.21, viseme: 10 },
];

function applyLipSyncFrame(audioTime, level = 0) {
  let current = 0;
  for (const event of events) {
    if (event.time > audioTime) break;
    current = event.viseme;
  }
  avatar.set({ activity: 3, viseme: current, audioLevel: level });
}
```

In production, call this from an animation/update loop using the player’s current playback position. Use a small look-ahead only if the audio player buffers predictably. On `pause`, freeze or close according to the product decision; on `seek`, recompute the active viseme; on `ended`, set `activity` to idle and let the contract close the mouth.

If a provider gives only audio and no timed phonemes, use RMS or analyser amplitude for `audioLevel` and keep `viseme` at 0 or cycle a small open/rest set. Label this as amplitude animation, not true lip sync.

## 5. Handle interruption correctly

Every response needs an ownership token. When the user interrupts, increment the token, stop the audio, cancel its scheduler, and reset the avatar. Old callbacks must check the token before writing to Rive.

```js
let responseId = 0;

function startResponse(audio, timedEvents) {
  const id = ++responseId;
  avatar.set({ activity: 3 });
  const tick = () => {
    if (id !== responseId || audio.paused || audio.ended) return;
    applyLipSyncFrame(audio.currentTime, readRmsLevel());
    requestAnimationFrame(tick);
  };
  audio.play().then(tick).catch(() => stopResponse(id));
}

function stopResponse(id = responseId) {
  if (id !== responseId) return;
  responseId++;
  avatar.set({ activity: 0 });
}
```

The exact audio API can differ, but the invariant is the same: no stale audio event may reopen a mouth after a newer response has started.

## Acceptance checklist

- [ ] Closed/rest pose is visibly closed at `viseme = 0`, `audioLevel = 0`.
- [ ] Each documented viseme is distinct at normal avatar size.
- [ ] `audioLevel` changes jaw openness without destroying phonetic shape.
- [ ] Pausing, seeking, ending and interrupting audio cannot leave the mouth open.
- [ ] Network delay does not change mouth timing once playback begins.
- [ ] Stale callbacks from an interrupted response are ignored.
- [ ] Data Binding and legacy-input exports are tested separately when both are supported.
- [ ] Reduced-motion and a non-audio fallback are defined for accessibility and offline mode.

## References

- [Rive Data Binding](https://rive.app/docs/runtimes/web/data-binding)
- [Rive Data Binding overview](https://rive.app/docs/editor/data-binding/overview)
- [Rive feature support](https://rive.app/docs/feature-support)
- [Starter character contract](character-contract.md)
- [Starter integration notes](integration.md)
