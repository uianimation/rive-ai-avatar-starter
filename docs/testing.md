# Verification scope

## Automated checks

`npm test` uses Node's test runner with no browser or network dependency. Tests cover clamping, rejection of malformed values, immutable state snapshots, mouth reset on interruption and both binding adapters, including missing/wrong-type inputs.

`npm run build` verifies the production bundle and resolution of the pinned Rive runtime/WASM package. CI repeats tests and build on Node 22 and 24. A passing build is not a visual compatibility test of a `.riv` asset.

## Manual acceptance checklist

- [ ] Schematic appears with the explicit CSS label.
- [ ] Seven activity buttons update the payload; keyboard navigation works.
- [ ] Audio/viseme controls are enabled only when speaking.
- [ ] Switching out of speaking closes the mouth and resets its numeric controls.
- [ ] Gaze controls update independently; Reset restores defaults.
- [ ] Scripted playback stops cleanly on manual input and page backgrounding.
- [ ] Layout remains usable at 390 px and desktop widths.
- [ ] Invalid file and missing bindings preserve the fallback and explain the issue.
- [ ] Compatible Data Binding and legacy-input `.riv` files load and animate correctly.
- [ ] Repeated load/unload and navigation release rendering resources.
- [ ] Exported production build loads the bundled WASM without a CDN request.

## Initial release browser verification

Verified on the published GitHub Pages demo on 2026-09-09 in Chromium: the labeled schematic renders, speaking enables mouth controls, setting audio level to 0.65 and viseme to 7 appears in the payload, and interruption into listening resets both values to zero. Reset restores idle. Desktop layout and the 390 px mobile viewport were visually inspected; no horizontal page overflow was observed. GitHub CI passed and the Pages deployment completed successfully. The screenshot in `docs/images/playground.png` is captured from that actual interface.

The workflow run currently reports an upstream Node 20 action-deprecation warning; GitHub ran the affected actions on Node 24 and deployment succeeded. This is separate from the project's Node 22/24 test matrix.

## Asset limitation

No compatible character is bundled. Automated adapters are tested with controlled stubs, not a genuine authored Rive character. End-to-end character motion, all transition blends, viseme mapping and native mobile runtimes remain unverified until a licensed compatible export is supplied. Do not present the schematic as proof of an authored Rive rig.
