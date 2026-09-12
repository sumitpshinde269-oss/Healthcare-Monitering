import test from 'node:test';
import assert from 'node:assert/strict';

import { AnomalyDetector } from '../src/lib/anomalyDetector.js';

const at = (second) => new Date(Date.UTC(2026, 0, 1, 0, 0, second)).toISOString();

/** `count` identical readings, oldest first — the detector's analysis window. */
const sustained = (count, heartRate, spo2 = 98) =>
  Array.from({ length: count }, (_, i) => ({ heartRate, spo2, timestamp: at(i) }));

const active = (detector, type) => detector.getActiveAlerts().find((a) => a.type === type);
const logged = (detector, type) => detector.getAlertLog().find((a) => a.type === type);

test('sustained tachycardia raises a warning, then escalates in place', () => {
  const detector = new AnomalyDetector();

  detector.analyze(sustained(5, 110));
  assert.equal(active(detector, 'tachycardia')?.severity, 'warning');

  const escalation = detector.analyze(sustained(5, 175));
  assert.equal(active(detector, 'tachycardia').severity, 'critical');
  assert.equal(
    detector.getAlertLog().filter((a) => a.type === 'tachycardia').length,
    1,
    'escalation updates the existing alert instead of adding a second one'
  );
  assert.ok(
    escalation.newAlerts.some((a) => a.isEscalation),
    'escalation is reported as a new event'
  );
});

test('sustained bradycardia raises a critical alert', () => {
  const detector = new AnomalyDetector();
  detector.analyze(sustained(5, 40));
  assert.equal(active(detector, 'bradycardia')?.severity, 'critical');
});

test('sustained desaturation raises warning, then critical hypoxia', () => {
  const warning = new AnomalyDetector();
  warning.analyze(sustained(3, 72, 94));
  assert.equal(active(warning, 'hypoxia')?.severity, 'warning');

  const critical = new AnomalyDetector();
  critical.analyze(sustained(3, 72, 88));
  assert.equal(active(critical, 'hypoxia')?.severity, 'critical');
});

test('normal readings auto-resolve an active alert', () => {
  const detector = new AnomalyDetector();

  detector.analyze(sustained(5, 175));
  assert.ok(active(detector, 'tachycardia'));

  detector.analyze(sustained(5, 72));
  assert.equal(active(detector, 'tachycardia'), undefined);
  assert.equal(logged(detector, 'tachycardia').status, 'resolved');
});

test('an acute rate swing raises a self-expiring irregular-rhythm alert', () => {
  const detector = new AnomalyDetector();

  detector.analyze([
    { heartRate: 70, spo2: 98, timestamp: at(0) },
    { heartRate: 120, spo2: 98, timestamp: at(1) },
    { heartRate: 70, spo2: 98, timestamp: at(2) }
  ]);
  assert.equal(active(detector, 'irregular_rhythm')?.severity, 'warning');

  // Expiry is tick-based, so five steady readings retire it with no timer.
  for (let i = 0; i < 5; i++) detector.analyze(sustained(3, 72));
  assert.equal(active(detector, 'irregular_rhythm'), undefined);
});

test('resolveAll clears every active alert but keeps the audit log', () => {
  const detector = new AnomalyDetector();
  detector.analyze(sustained(5, 175));
  const loggedBefore = detector.getAlertLog().length;
  assert.ok(loggedBefore > 0);

  detector.resolveAll(at(99));

  assert.deepEqual(detector.getActiveAlerts(), []);
  assert.equal(detector.getAlertLog().length, loggedBefore, 'history is preserved');
  assert.ok(detector.getAlertLog().every((a) => a.status === 'resolved'));
});
