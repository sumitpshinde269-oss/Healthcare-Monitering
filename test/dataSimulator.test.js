import test from 'node:test';
import assert from 'node:assert/strict';

import { VitalsSimulator } from '../src/lib/dataSimulator.js';
import { AnomalyDetector } from '../src/lib/anomalyDetector.js';

const atBaseline = ({ heartRate, spo2 }) =>
  heartRate >= 60 && heartRate <= 100 && spo2 >= 96 && spo2 <= 99;

const hasActive = (detector, type) => detector.getActiveAlerts().some((a) => a.type === type);

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

test('reset to baseline leaves no active alerts with normal vitals', () => {
  const sim = new VitalsSimulator();
  const detector = new AnomalyDetector();

  // Drive a sustained critical tachycardia exactly as the live interval does.
  sim.injectAnomaly('tachycardia');
  for (let i = 0; i < 8; i++) {
    sim.tick();
    detector.analyze(sim.getHistory());
  }
  assert.ok(hasActive(detector, 'tachycardia'), 'expected a tachycardia alert before the reset');

  // The operator presses "Reset to baseline".
  sim.clearAnomaly();
  detector.resolveAll(new Date().toISOString());
  const restored = withFixedRandom(() => {
    const reading = sim.tick();
    detector.analyze(sim.getHistory());
    return reading;
  });

  assert.ok(atBaseline(restored), `reset produced ${restored.heartRate} BPM / ${restored.spo2}%`);
  assert.deepEqual(
    detector.getActiveAlerts(),
    [],
    'no alert may survive, or be re-raised by, the reset'
  );
});
