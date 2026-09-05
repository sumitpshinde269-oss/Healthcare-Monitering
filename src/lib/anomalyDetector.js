/**
 * VitalGuard AI - Anomaly Detection Engine
 * Uses rolling window analysis over patient telemetry history to detect sustained and acute physiological anomalies.
 */

export class AnomalyDetector {
  constructor() {
    // Internal full log of all alerts (active + resolved)
    this.alertLog = [];
    
    // Currently active alert references keyed by condition type
    // e.g. { tachycardia: alertObj, hypoxia: alertObj, ... }
    this.activeAlerts = new Map();

    // Track cooldown for transient events like rapid change to prevent spam
    this.lastRapidChangeTick = -10;
    this.totalTicksAnalyzed = 0;
  }

  /**
   * Reset detector state
   */
  reset() {
    this.alertLog = [];
    this.activeAlerts.clear();
    this.lastRapidChangeTick = -10;
    this.totalTicksAnalyzed = 0;
  }

  /**
   * Analyze the rolling vitals history and update active/resolved alerts.
   * @param {Array<{ heartRate: number, spo2: number, steps: number, timestamp: string }>} history 
   * @returns {{ activeAlerts: Array<Object>, newAlerts: Array<Object>, allAlerts: Array<Object> }}
   */
  analyze(history = []) {
    this.totalTicksAnalyzed++;
    const newAlerts = [];

    if (!history || history.length === 0) {
      return {
        activeAlerts: Array.from(this.activeAlerts.values()),
        newAlerts: [],
        allAlerts: [...this.alertLog]
      };
    }

    const latest = history[history.length - 1];
    const len = history.length;

    // Helper: get last N readings
    const getLastN = (n) => history.slice(Math.max(0, len - n));

    // ==========================================
    // 1. TACHYCARDIA & BRADYCARDIA CHECKS (5+ readings)
    // ==========================================
    const last5 = getLastN(5);
    const has5 = last5.length === 5;

    // Tachycardia (Warning: >100, Critical: >140)
    if (has5 && last5.every(r => r.heartRate > 140)) {
      this._handleTrigger(
        'tachycardia',
        'critical',
        `Critical tachycardia sustained (${latest.heartRate} BPM) — severe cardiac elevation`,
        `${latest.heartRate} BPM`,
        latest.timestamp,
        newAlerts
      );
    } else if (has5 && last5.every(r => r.heartRate > 100)) {
      this._handleTrigger(
        'tachycardia',
        'warning',
        `Elevated heart rate sustained (${latest.heartRate} BPM) — possible tachycardia`,
        `${latest.heartRate} BPM`,
        latest.timestamp,
        newAlerts
      );
    } else if (has5 && last5.every(r => r.heartRate >= 60 && r.heartRate <= 100)) {
      // Normal HR for 5+ readings -> resolve tachycardia and bradycardia
      this._resolveAlert('tachycardia', latest.timestamp);
      this._resolveAlert('bradycardia', latest.timestamp);
    }

    // Bradycardia (Critical: <50 sustained 5+ readings)
    if (has5 && last5.every(r => r.heartRate < 50)) {
      this._handleTrigger(
        'bradycardia',
        'critical',
        `Critical bradycardia detected (${latest.heartRate} BPM) — heart rate below safe threshold`,
        `${latest.heartRate} BPM`,
        latest.timestamp,
        newAlerts
      );
    }

    // ==========================================
    // 2. HYPOXIA CHECKS (3+ readings)
    // ==========================================
    const last3 = getLastN(3);
    const has3 = last3.length === 3;

    if (has3 && last3.every(r => r.spo2 < 92)) {
      this._handleTrigger(
        'hypoxia',
        'critical',
        `Critical hypoxia detected (${latest.spo2}%) — severe oxygen desaturation`,
        `${latest.spo2}%`,
        latest.timestamp,
        newAlerts
      );
    } else if (has3 && last3.every(r => r.spo2 >= 94 && r.spo2 <= 95)) {
      this._handleTrigger(
        'hypoxia',
        'warning',
        `Mild hypoxic desaturation (${latest.spo2}%) — below standard baseline`,
        `${latest.spo2}%`,
        latest.timestamp,
        newAlerts
      );
    } else if (has5 && last5.every(r => r.spo2 >= 96)) {
      // Normal SpO2 for 5+ readings -> resolve hypoxia
      this._resolveAlert('hypoxia', latest.timestamp);
    }

    // ==========================================
    // 3. RAPID CHANGE (Irregular Rhythm)
    // ==========================================
    if (has3 && (this.totalTicksAnalyzed - this.lastRapidChangeTick > 5)) {
      const hrDiff = Math.abs(last3[2].heartRate - last3[0].heartRate);
      const hrRange = Math.max(...last3.map(r => r.heartRate)) - Math.min(...last3.map(r => r.heartRate));

      if (hrDiff > 30 || hrRange > 30) {
        this.lastRapidChangeTick = this.totalTicksAnalyzed;
        const alertKey = `irregular_rhythm_${Date.now()}`;
        const alert = {
          id: `ALT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
          type: 'irregular_rhythm',
          severity: 'warning',
          message: `Irregular Rhythm Detected: acute HR fluctuation of ${Math.round(hrRange)} BPM within 3 readings`,
          value: `${latest.heartRate} BPM (Δ ${Math.round(hrRange)})`,
          timestamp: latest.timestamp,
          status: 'active',
          expiresAtTick: this.totalTicksAnalyzed + 5
        };

        this.alertLog.unshift(alert);
        this.activeAlerts.set(alertKey, alert);
        newAlerts.push(alert);
      }
    }

    // Auto-resolve expired irregular rhythm events without setTimeouts
    for (const [key, alert] of this.activeAlerts.entries()) {
      if (alert.expiresAtTick && this.totalTicksAnalyzed >= alert.expiresAtTick) {
        this._resolveAlert(key, latest.timestamp);
      }
    }

    return {
      activeAlerts: Array.from(this.activeAlerts.values()),
      newAlerts,
      allAlerts: [...this.alertLog]
    };
  }

  /**
   * Helper to manage alert lifecycle without spamming duplicate active alerts
   */
  _handleTrigger(type, severity, message, value, timestamp, newAlertsList) {
    const existing = this.activeAlerts.get(type);

    if (existing) {
      // If severity escalated (e.g. warning -> critical), update and notify
      if (existing.severity !== severity) {
        existing.severity = severity;
        existing.message = message;
        existing.value = value;
        existing.updatedAt = timestamp;
        newAlertsList.push({ ...existing, isEscalation: true });
      }
      return;
    }

    // Create new alert
    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      type,
      severity,
      message,
      value,
      timestamp,
      status: 'active'
    };

    this.activeAlerts.set(type, newAlert);
    this.alertLog.unshift(newAlert);
    newAlertsList.push(newAlert);
  }

  /**
   * Helper to resolve active alert when condition clears
   */
  _resolveAlert(type, timestamp) {
    const existing = this.activeAlerts.get(type);
    if (existing) {
      existing.status = 'resolved';
      existing.resolvedAt = timestamp;
      this.activeAlerts.delete(type);
    }
  }

  /**
   * Get full history of alerts
   */
  getAlertLog() {
    return [...this.alertLog];
  }

  /**
   * Get list of currently active alerts
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }
}

export const anomalyDetectorInstance = new AnomalyDetector();

