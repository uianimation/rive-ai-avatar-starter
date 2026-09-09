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

## Asset limitation

No compatible character is bundled. Automated adapters are tested with controlled stubs, not a genuine authored Rive character. End-to-end character motion, all transition blends, viseme mapping and native mobile runtimes remain unverified until a licensed compatible export is supplied. Do not present the schematic as proof of an authored Rive rig.
