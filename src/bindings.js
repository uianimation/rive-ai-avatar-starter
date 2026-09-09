import { defaults } from './contract.js';

// Resolve once after load. No repeated name lookups in animation frames.
export function resolveBindings(runtime, mode, machine, numberType) {
  const bindings = {};
  const inputs = mode === 'inputs' ? runtime.stateMachineInputs(machine) : [];
  for (const name of Object.keys(defaults)) {
    const property = mode === 'data-binding'
      ? runtime.viewModelInstance?.number(name)
      : inputs?.find(input => input.name === name && input.type === numberType);
    if (!property) throw new Error(`Missing numeric ${mode === 'inputs' ? 'input' : 'property'}: ${name}. Check the character contract and binding mode.`);
    bindings[name] = property;
  }
  return state => {
    for (const [name, value] of Object.entries(state)) bindings[name].value = value;
  };
}
