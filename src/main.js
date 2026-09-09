import { Rive, Layout, Fit, Alignment, StateMachineInputType, RuntimeLoader } from '@rive-app/webgl2';
import wasmUrl from '@rive-app/webgl2/rive.wasm?url';
import { activities, createController } from './contract.js';
import { resolveBindings } from './bindings.js';
import './style.css';

RuntimeLoader.setWasmUrl(wasmUrl);
const $ = id => document.getElementById(id);
let runtime = null;
let write = () => {};
let generation = 0;
let timer;
let loading = false;
const controller = createController(state => write(state), render);
const status = text => { $('status').textContent = text; };

for (const [value, name] of activities.entries()) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = name; button.dataset.activity = value;
  button.addEventListener('click', () => { stopSimulation(); controller.set({ activity: value }); });
  $('activities').append(button);
}

function render(state) {
  $('activity-label').textContent = activities[state.activity];
  $('state-json').textContent = JSON.stringify(state, null, 2);
  for (const button of $('activities').children) button.setAttribute('aria-pressed', String(Number(button.dataset.activity) === state.activity));
  for (const key of ['emotion', 'viseme', 'audioLevel', 'lookX', 'lookY']) {
    $(key).value = state[key];
    $(`${key}-value`).textContent = key === 'emotion' ? ['Neutral', 'Happy', 'Concerned'][state[key]] : key === 'viseme' ? state[key] : state[key].toFixed(2);
  }
  $('audioLevel').disabled = $('viseme').disabled = state.activity !== 3;
  $('schematic').dataset.activity = state.activity;
  $('schematic').dataset.emotion = state.emotion;
  $('schematic').style.setProperty('--gaze-x', `${state.lookX * 12}px`);
  $('schematic').style.setProperty('--gaze-y', `${state.lookY * 9}px`);
  $('schematic').style.setProperty('--mouth-height', `${6 + state.audioLevel * 26}px`);
}

for (const key of ['emotion', 'viseme', 'audioLevel', 'lookX', 'lookY']) {
  $(key).addEventListener('input', () => { stopSimulation(); controller.set({ [key]: Number($(key).value) }); });
}

function stopSimulation() { clearInterval(timer); timer = undefined; $('simulate').textContent = 'Play simulated conversation'; }
$('reset').addEventListener('click', () => { stopSimulation(); controller.reset(); });
$('simulate').addEventListener('click', () => {
  if (timer !== undefined) { stopSimulation(); controller.reset(); return; }
  controller.reset();
  const started = performance.now();
  $('simulate').textContent = 'Stop simulation';
  timer = setInterval(() => {
    const t = (performance.now() - started) / 1000;
    if (t > 8) { stopSimulation(); controller.reset(); return; }
    const activity = t < 2 ? 1 : t < 4 ? 2 : t < 7 ? 3 : 4;
    controller.set({ activity, emotion: t > 7 ? 1 : 0, audioLevel: activity === 3 ? 0.2 + Math.abs(Math.sin(t * 11)) * 0.6 : 0, viseme: activity === 3 ? 1 + Math.floor(t * 8) % 14 : 0 });
  }, 50);
});

function clearRuntime() {
  generation++;
  write = () => {};
  runtime?.cleanup(); runtime = null;
  $('rive-canvas').hidden = true; $('schematic').hidden = false;
  $('mode-label').textContent = 'SCHEMATIC PREVIEW';
  $('preview-caption').textContent = 'CSS schematic · no Rive character included';
  $('unload').disabled = true;
}
$('unload').addEventListener('click', () => { stopSimulation(); clearRuntime(); controller.reset(); status('Rive file released. Schematic preview active.'); });

$('load-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (loading) return;
  const file = $('rive-file').files[0];
  const machine = $('machine').value.trim();
  if (!file || !machine) return;
  if (!file.name.toLowerCase().endsWith('.riv') || file.size > 20 * 1024 * 1024) { status('Choose a .riv export smaller than 20 MB.'); return; }
  stopSimulation(); clearRuntime(); controller.reset();
  const token = generation;
  loading = true; $('load').disabled = true; status('Loading your Rive export…');
  let timeout;
  const finish = () => { clearTimeout(timeout); loading = false; $('load').disabled = false; };
  const fail = error => {
    if (token !== generation) return;
    finish(); clearRuntime(); status(`Could not connect: ${error instanceof Error ? error.message : String(error)}`);
  };
  try {
    const buffer = await file.arrayBuffer();
    if (token !== generation) { finish(); return; }
    timeout = setTimeout(() => fail(new Error('Loading timed out. Try a smaller export or check your browser’s WebGL2 support.')), 20000);
    runtime = new Rive({
      buffer, canvas: $('rive-canvas'), artboard: $('artboard').value.trim() || undefined,
      stateMachines: machine, autoplay: true, autoBind: $('binding').value === 'data-binding',
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        if (token !== generation) return;
        try {
          if (!runtime.stateMachineNames.includes(machine)) throw new Error(`State Machine not found: ${machine}`);
          write = resolveBindings(runtime, $('binding').value, machine, StateMachineInputType.Number);
          $('rive-canvas').hidden = false; $('schematic').hidden = true;
          runtime.resizeDrawingSurfaceToCanvas();
          controller.reset(); finish();
          $('mode-label').textContent = 'LIVE RIVE CHARACTER'; $('preview-caption').textContent = file.name;
          $('unload').disabled = false; status('Connected. All six numeric controls are available.');
          if (document.hidden) runtime.pause();
        } catch (error) { fail(error); }
      },
      onLoadError: () => fail(new Error('Rive could not load this export. Check the file, artboard and runtime compatibility.')),
    });
  } catch (error) { fail(error); }
});

const observer = new ResizeObserver(() => runtime?.resizeDrawingSurfaceToCanvas());
observer.observe($('stage'));
document.addEventListener('visibilitychange', () => {
  stopSimulation(); controller.reset();
  if (document.hidden) runtime?.pause(); else runtime?.play();
});
window.addEventListener('pagehide', () => { stopSimulation(); clearRuntime(); });
if (import.meta.hot) import.meta.hot.dispose(() => { stopSimulation(); clearRuntime(); observer.disconnect(); });
render(controller.state);
