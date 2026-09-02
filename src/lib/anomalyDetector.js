/**
 * Anomaly Detector Placeholder for VitalGuard AI
 * Will handle rules-based threshold checking and statistical anomaly detection.
 */

export const VITAL_THRESHOLDS = {
  heartRate: { min: 60, max: 100, criticalMin: 45, criticalMax: 130, unit: 'BPM' },
  spo2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100, unit: '%' },
  respirationRate: { min: 12, max: 20, criticalMin: 8, criticalMax: 28, unit: 'br/min' },
  bloodPressureSys: { min: 90, max: 130, criticalMin: 80, criticalMax: 160, unit: 'mmHg' },
};

export function evaluateVitalSign(metric, value) {
  // Placeholder evaluation logic
  const thresholds = VITAL_THRESHOLDS[metric];
  if (!thresholds) return { status: 'NORMAL', level: 'info' };
  
  if (value < thresholds.criticalMin || value > thresholds.criticalMax) {
    return { status: 'CRITICAL', level: 'critical' };
  }
  if (value < thresholds.min || value > thresholds.max) {
    return { status: 'WARNING', level: 'warning' };
  }
  return { status: 'NORMAL', level: 'optimal' };
}
