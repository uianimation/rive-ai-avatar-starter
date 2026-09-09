# Integration notes

## Rive adapter boundary

`resolveBindings` accepts a loaded high-level Web Rive instance and returns a writer for a complete numeric state. Data Binding uses `viewModelInstance.number(name)` on the auto-bound default instance. Legacy mode finds Number inputs from the selected State Machine. Both paths cache the handles after load and fail if any required numeric channel is absent.

The demo is deliberately strict. To support different names, nested paths or enums, add an explicit mapping in the adapter and test it. Do not silently ignore a missing activity or mouth channel.

## Async response ownership

When connecting an actual assistant, give each response a generation identifier. On interruption, cancel queued speech updates and ignore events from the previous generation. Set activity to listening or idle. Updating only the character state is insufficient if old audio callbacks can reopen its mouth later.

Use the audio playback clock for viseme timestamps. Network arrival time is not the playback clock. Handle buffering, seek, pause, end, errors and cancellation. Keep the last frame of a completed response from leaving the mouth open.

## Lifecycle

The demo cleans up the previous Rive instance before replacement, ignores callbacks from stale load attempts, times out loading after 20 seconds, and exposes a schematic fallback on failure. A ResizeObserver updates the backing drawing surface. Backgrounding stops the scripted simulation, resets controls, and pauses playback; returning resumes the Rive State Machine in idle.

The UI does not request microphone permission or upload selected files. It bundles the WASM locally. A user-provided Rive export can reference external assets; review those references before treating a production deployment as entirely offline. Hosting providers can still record ordinary page requests.

## Web, Flutter and React Native

This repository's implementation and automated tests cover JavaScript. A single `.riv` export may be used by multiple runtimes when its features are supported, but compatibility must be verified for the actual file and runtime versions.

For Flutter and React Native, implement an adapter with the same six semantic channels using the relevant official runtime. Do not paste the JavaScript methods into native code. Verify data types, loading/disposal, feature support, layout, density and app lifecycle on devices.

- [Flutter runtime](https://rive.app/docs/runtimes/flutter/flutter)
- [React Native runtime](https://rive.app/docs/runtimes/react-native/react-native)
- [Runtime feature support](https://rive.app/docs/runtimes/feature-support)

## Accessibility

Expose assistant status as text as well as animation. The demo has keyboard controls and a labeled status region. Its CSS schematic respects `prefers-reduced-motion`; a loaded Rive character does not automatically inherit that CSS behavior. Add a reduced-motion property or a static fallback to your own character integration. Avoid announcing per-frame audio values to screen readers.
