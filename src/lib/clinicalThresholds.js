/**
 * VitalGuard AI - Clinical Thresholds
 * Single source of truth for vital-sign ranges. Used by the anomaly
 * detector, the live status classifiers, and the trend chart so every
 * layer evaluates the same thresholds.
 */

const HR = {
  criticalLow: 50,   // sustained < 50 BPM  -> critical (bradycardia)
  normalMin: 60,     // resting lower bound
  normalMax: 100,    // resting upper bound
  warningHigh: 100,  // sustained > 100 BPM -> warning (tachycardia)
  criticalHigh: 140  // sustained > 140 BPM -> critical
};

const SPO2 = {
  criticalLow: 92,   // sustained < 92%   -> critical (hypoxia)
  warningLow: 95,    // <= 95%            -> warning
  normalMin: 96      // >= 96%            -> normal
};

export const CLINICAL_THRESHOLDS = {
  heartRate: HR,
  spo2: SPO2
};

/**
 * Detector-facing rules. Mirrors the sustained-window logic in
 * anomalyDetector.js so both layers read from the same constants.
 */
export const ANOMALY_RULES = {
  tachycardia: { warningAbove: HR.warningHigh, criticalAbove: HR.criticalHigh },
  bradycardia: { criticalBelow: HR.criticalLow },
  hypoxia: {
    criticalBelow: SPO2.criticalLow,
    warningBand: [SPO2.criticalLow + 2, SPO2.warningLow] // sustained 94-95%
  },
  normalHr: { min: HR.normalMin, max: HR.normalMax },
  normalSpo2: { min: SPO2.normalMin }
};

/**
 * Classify a single heart-rate reading.
 * @param {number} bpm
 * @returns {'normal' | 'warning' | 'critical'}
 */
export function classifyHeartRate(bpm) {
  if (bpm > HR.criticalHigh || bpm < HR.criticalLow) return 'critical';
  if (bpm > HR.warningHigh) return 'warning';
  return 'normal';
}

/**
 * Classify a single SpO2 reading.
 * @param {number} percent
 * @returns {'normal' | 'warning' | 'critical'}
 */
export function classifySpo2(percent) {
  if (percent < SPO2.criticalLow) return 'critical';
  if (percent <= SPO2.warningLow) return 'warning';
  return 'normal';
}