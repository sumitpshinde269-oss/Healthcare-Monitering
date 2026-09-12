import test from 'node:test';
import assert from 'node:assert/strict';

import { VitalsSimulator } from '../src/lib/dataSimulator.js';

const atBaseline = ({ heartRate, spo2 }) =>
  heartRate >= 60 && heartRate <= 100 && spo2 >= 96 && spo2 <= 99;

/** Pin randomness so a tick is reproducible (0.5 => neutral jitter, no fresh dip). */
function withFixedRandom(fn, value = 0.5) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

test('clearAnomaly returns vitals to baseline mid-desaturation', () => {
  const sim = new VitalsSimulator();

  sim.injectAnomaly('hypoxia');
  const desaturated = sim.tick();
  assert.ok(desaturated.spo2 < 92, `expected desaturation, got ${desaturated.spo2}%`);

  sim.clearAnomaly();
  const restored = withFixedRandom(() => sim.tick());
  assert.ok(atBaseline(restored), `reset produced ${restored.heartRate} BPM / ${restored.spo2}%`);
});

test('clearAnomaly cancels an in-flight spontaneous SpO2 dip', () => {
  const sim = new VitalsSimulator();

  // Run until the simulator's natural dip kicks in (2% per tick).
  let dipped = false;
  for (let i = 0; i < 20000 && !dipped; i++) {
    dipped = sim.tick().spo2 <= 94;
  }
  assert.ok(dipped, 'expected a spontaneous dip within the tick budget');

  sim.clearAnomaly();
  const restored = withFixedRandom(() => sim.tick());
  assert.ok(restored.spo2 >= 96, `dip outlived the reset: ${restored.spo2}%`);
});
