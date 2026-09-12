/**
 * VitalGuard AI - Baseline Reset Sequence
 *
 * "Reset to baseline" is an ordered operation, not a single call, and the order
 * is load-bearing: the anomaly must be cleared and the active alerts resolved
 * before the detector analyses a fresh reading, otherwise it re-raises an alert
 * off the pre-reset window.
 *
 * This has broken twice in practice (an in-flight SpO2 dip outliving the reset,
 * and an irregular_rhythm alert fired by the artificial 171 -> 72 BPM jump), so
 * this module is the single owner of that sequence. Callers publish the result;
 * they do not re-implement the order.
 */

/**
 * Advance the simulator one tick and run the detector over the new history.
 * @returns {{ reading: object, history: object[], analysis: object }}
 */
export function advanceTelemetry(simulator, detector) {
  const reading = simulator.tick();
  const history = simulator.getHistory();
  const analysis = detector.analyze(history);
  return { reading, history, analysis };
}

/**
 * Return the patient to a normal baseline, in exactly this order:
 *
 *   1. simulator.clearAnomaly()  - baseline vitals, in-flight dip cancelled
 *   2. detector.resolveAll()     - no alert may survive the reset
 *   3. advanceTelemetry()        - a fresh baseline reading is analysed, so the
 *                                  detector cannot re-raise off the pre-reset window
 *
 * @param {object} simulator the VitalsSimulator instance
 * @param {object} detector the AnomalyDetector instance
 * @param {string} timestamp ISO timestamp stamped onto the resolved alerts
 * @returns {{ reading: object, history: object[], analysis: object }}
 */
export function resetToBaseline(simulator, detector, timestamp) {
  simulator.clearAnomaly();
  detector.resolveAll(timestamp);
  return advanceTelemetry(simulator, detector);
}
