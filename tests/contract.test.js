import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, normalize, createController } from '../src/contract.js';

test('clamps, rounds and preserves independent gaze', () => {
  const state = normalize(defaults, { activity: 3, audioLevel: 9, viseme: 3.6, lookX: -8, lookY: 0.4 });
  assert.deepEqual(state, { ...defaults, activity: 3, audioLevel: 1, viseme: 4, lookX: -1, lookY: 0.4 });
});
test('interruptions close mouth, keeping emotion and gaze', () => {
  const speaking = normalize(defaults, { activity: 3, audioLevel: 0.8, viseme: 7, emotion: 1, lookX: 0.6 });
  for (const activity of [0, 1, 2, 4, 5, 6]) {
    assert.deepEqual(normalize(speaking, { activity }), { ...speaking, activity, audioLevel: 0, viseme: 0 });
  }
});
test('rejects bad payloads instead of forwarding NaN or unknown fields', () => {
  for (const patch of [{ activity: NaN }, { lookX: Infinity }, { audioLevel: '0.5' }, { missing: 2 }]) assert.throws(() => normalize(defaults, patch), TypeError);
});
test('controller snapshots cannot mutate the internal state and reset writes defaults', () => {
  const writes = [];
  const controller = createController(state => writes.push({ ...state }));
  controller.set({ activity: 3, viseme: 2 });
  const snapshot = controller.state; snapshot.activity = 6;
  assert.equal(controller.state.activity, 3);
  controller.reset();
  assert.deepEqual(writes.at(-1), defaults);
  assert.deepEqual(controller.state, defaults);
});
test('rejected patches leave controller state unchanged', () => {
  const controller = createController(() => {});
  assert.throws(() => controller.set({ activity: 3, bad: 4 }));
  assert.deepEqual(controller.state, defaults);
});
