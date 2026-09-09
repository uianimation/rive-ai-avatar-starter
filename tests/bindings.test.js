import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults } from '../src/contract.js';
import { resolveBindings } from '../src/bindings.js';

test('Data Binding writes all cached numeric properties', () => {
  const properties = Object.fromEntries(Object.keys(defaults).map(name => [name, { value: -99 }]));
  let lookups = 0;
  const write = resolveBindings({ viewModelInstance: { number: name => { lookups++; return properties[name]; } } }, 'data-binding', 'Avatar', 56);
  write(defaults); write({ ...defaults, activity: 3, audioLevel: 0.5 });
  assert.equal(lookups, 6);
  assert.equal(properties.activity.value, 3); assert.equal(properties.audioLevel.value, 0.5);
});
test('missing Data Binding properties fail with the control name', () => {
  assert.throws(() => resolveBindings({}, 'data-binding', 'Avatar', 56), /activity/);
});
test('legacy adapter requires Number inputs', () => {
  const inputs = Object.keys(defaults).map(name => ({ name, value: 99, type: 56 }));
  const runtime = { stateMachineInputs: name => { assert.equal(name, 'Avatar'); return inputs; } };
  resolveBindings(runtime, 'inputs', 'Avatar', 56)(defaults);
  assert.ok(inputs.every(input => input.value === 0));
  inputs[0].type = 58;
  assert.throws(() => resolveBindings(runtime, 'inputs', 'Avatar', 56), /activity/);
});
