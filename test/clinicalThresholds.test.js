import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANOMALY_RULES,
  CLINICAL_THRESHOLDS,
  classifyHeartRate,
  classifySpo2
} from '../src/lib/clinicalThresholds.js';

// [reading, expected band] — boundary values on both sides of every band, so a
// future edit to a threshold constant fails here instead of drifting silently.
const HEART_RATE_BANDS = [
  [49, 'critical'],
  [50, 'normal'],
  [51, 'normal'],
  [99, 'normal'],
  [100, 'normal'],
  [101, 'warning'],
  [139, 'warning'],
  [140, 'warning'],
  [141, 'critical']
];

const SPO2_BANDS = [
  [91, 'critical'],
  [92, 'warning'],
  [94, 'warning'],
  [95, 'warning'],
  [96, 'normal'],
  [99, 'normal']
];

test('classifyHeartRate pins both sides of every band boundary', () => {
  for (const [bpm, expected] of HEART_RATE_BANDS) {
    assert.equal(classifyHeartRate(bpm), expected, `${bpm} BPM`);
  }
});

test('classifySpo2 pins both sides of every band boundary', () => {
  for (const [percent, expected] of SPO2_BANDS) {
    assert.equal(classifySpo2(percent), expected, `${percent}%`);
  }
});

test('the detector rules are wired to the same threshold constants', () => {
  const { heartRate: HR, spo2: SPO2 } = CLINICAL_THRESHOLDS;
  const { tachycardia, bradycardia, hypoxia, normalHr, normalSpo2 } = ANOMALY_RULES;

  assert.equal(tachycardia.warningAbove, HR.warningHigh);
  assert.equal(tachycardia.criticalAbove, HR.criticalHigh);
  assert.equal(bradycardia.criticalBelow, HR.criticalLow);
  assert.deepEqual(normalHr, { min: HR.normalMin, max: HR.normalMax });
  assert.equal(hypoxia.criticalBelow, SPO2.criticalLow);
  assert.equal(hypoxia.warningBand[0], SPO2.criticalLow + 2);
  assert.equal(hypoxia.warningBand[1], SPO2.warningLow);
  assert.equal(normalSpo2.min, SPO2.normalMin);
});
