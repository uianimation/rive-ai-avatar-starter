# Character authoring contract

Contract version: **1**. These are conventions for this starter, not names or values imposed by Rive.

## Authoring checklist

- Create one character artboard and a named State Machine, for example `Avatar`.
- For Data Binding, assign a default View Model and default instance to that artboard. Create six **Number** properties: `activity`, `emotion`, `viseme`, `audioLevel`, `lookX`, `lookY`.
- For legacy inputs, create six **Number** inputs with the same names in the selected State Machine instead.
- Wire the properties to transitions/blends in the editor. Declaring a property alone does not animate anything.
- Default every property to 0. The character should begin idle, neutral, looking forward with its mouth closed.
- Document the artboard and State Machine names in your handoff.

## Activity and priorities

| Number | Activity | Expected visual behavior |
| --- | --- | --- |
| 0 | Idle | Calm, available pose |
| 1 | Listening | Attentive pose; no speaking mouth animation |
| 2 | Thinking | Subtle processing motion |
| 3 | Speaking | Mouth controls enabled |
| 4 | Success | Positive acknowledgement |
| 5 | Error/offline | Clear, restrained unavailable state |
| 6 | Sleeping | Quiet rest state |

The application chooses one activity. There is no implicit timer returning success/error to idle: your application must issue the next state. Interruptions immediately replace speaking and close the mouth at the contract level; transition duration inside the `.riv` file remains an authoring decision.

## Independent channels

- `emotion`: 0 neutral, 1 happy, 2 concerned. Do not let emotion animation overwrite mouth or gaze properties unintentionally.
- `viseme`: integer 0–14. Index 0 is rest. Define and document your own table for indices 1–14; there is no universal speech-provider mapping in this project.
- `audioLevel`: floating point 0–1. Use it for jaw amplitude or a separate speaking blend. Decide which layer owns jaw/mouth properties so amplitude and viseme do not fight.
- `lookX`, `lookY`: -1–1, with positive X toward viewer-right and positive Y downward. Remap to your rig's coordinate system in the editor or adapter.

Use a modest gaze range, smooth changes where appropriate, and ensure all corners look acceptable. The starter passes values directly; gaze smoothing belongs in your character or application.

## Handoff deliverables

- Editable source access and the exported `.riv` runtime file; keep their roles distinct.
- Asset license/permission and provenance.
- Artboard, State Machine and View Model/default instance names.
- Property names, types, ranges and defaults.
- Viseme index-to-shape mapping and speech-provider mapping, if applicable.
- Transition timing, interruptibility and visual layer ownership.
- Known runtime requirements and unsupported effects.
- Tested device/runtime versions and a fallback visual.
- Reduced-motion behavior and accessibility expectations.

No Rive binary is bundled with this starter. Adding a character later requires both distribution permission and an actual end-to-end runtime test.
