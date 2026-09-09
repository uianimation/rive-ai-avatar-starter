export const activities = ['Idle', 'Listening', 'Thinking', 'Speaking', 'Success', 'Error / offline', 'Sleeping'];
export const defaults = Object.freeze({ activity: 0, emotion: 0, viseme: 0, audioLevel: 0, lookX: 0, lookY: 0 });
const limits = { activity: [0, 6, true], emotion: [0, 2, true], viseme: [0, 14, true], audioLevel: [0, 1], lookX: [-1, 1], lookY: [-1, 1] };

export function normalize(state, patch) {
  const next = { ...state };
  for (const [key, raw] of Object.entries(patch)) {
    if (!Object.hasOwn(limits, key) || typeof raw !== 'number' || !Number.isFinite(raw)) throw new TypeError(`Invalid control: ${key}`);
    const [min, max, integer] = limits[key];
    const value = Math.min(max, Math.max(min, raw));
    next[key] = integer ? Math.round(value) : value;
  }
  // A stopped/interrupted response must never leave the mouth open.
  if (next.activity !== 3) { next.viseme = 0; next.audioLevel = 0; }
  return next;
}

export function createController(write, onChange = () => {}) {
  let state = { ...defaults };
  return {
    get state() { return { ...state }; },
    set(patch) { state = normalize(state, patch); write(state); onChange({ ...state }); },
    reset() { this.set(defaults); },
  };
}
