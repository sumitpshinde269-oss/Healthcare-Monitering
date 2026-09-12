import test from 'node:test';
import assert from 'node:assert/strict';

import { VitalsSimulator } from '../src/lib/dataSimulator.js';
import { AnomalyDetector } from '../src/lib/anomalyDetector.js';
import { resetToBaseline } from '../src/lib/resetBaseline.js';

const T0 = '2026-01-01T00:00:00.000Z';

const atBaseline = ({ heartRate, spo2 }) =>
  heartRate >= 60 && heartRate <= 100 && spo2 >= 96 && spo2 <= 99;

/** Pin randomness so the post-reset tick is reproducible. */
function withFixedRandom(fn, value = 0.5) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

test('resetToBaseline runs its steps in the required order', () => {
  const calls = [];
  const simulator = {
    clearAnomaly: () => calls.push('clearAnomaly'),
    tick: () => {
      calls.push('tick');
      return { heartRate: 72, spo2: 98, activeAnomaly: null };
    },
    getHistory: () => {
      calls.push('getHistory');
      return [];
    }
  };
  const detector = {
    resolveAll: (timestamp) => calls.push(`resolveAll:${timestamp}`),
    analyze: () => {
      calls.push('analyze');
      return { activeAlerts: [], allAlerts: [] };
    }
  };

  resetToBaseline(simulator, detector, T0);

  // Clearing the anomaly and resolving the alerts must both precede the fresh
  // analysis; analysing first re-raises alerts off the pre-reset window.
  assert.deepEqual(calls, ['clearAnomaly', `resolveAll:${T0}`, 'tick', 'getHistory', 'analyze']);
});

test('a reset fired mid-anomaly restores baseline vitals and clears every alert', () => {
  const simulator = new VitalsSimulator();
  const detector = new AnomalyDetector();

  // Drive a sustained critical tachycardia exactly as the live interval does,
  // stopping while the injected anomaly is still running.
  simulator.injectAnomaly('tachycardia');
  for (let i = 0; i < 8; i++) {
    simulator.tick();
    detector.analyze(simulator.getHistory());
  }
  assert.ok(
    detector.getActiveAlerts().some((a) => a.type === 'tachycardia'),
    'expected a sustained tachycardia before the reset'
  );

  const { reading, analysis } = withFixedRandom(() =>
    resetToBaseline(simulator, detector, T0)
  );

  assert.ok(atBaseline(reading), `reset produced ${reading.heartRate} BPM / ${reading.spo2}%`);
  assert.deepEqual(analysis.activeAlerts, [], 'the returned analysis must not carry a re-raised alert');
  assert.deepEqual(detector.getActiveAlerts(), [], 'no alert may survive the reset');
});
