/**
 * VitalGuard AI - Realistic Vitals Data Simulator
 * Simulates wearable telemetry stream with activity states, noise, anomalies, and rolling history.
 */

export class VitalsSimulator {
  constructor(initialSteps = 8420) {
    this.activityStates = ['resting', 'light_activity', 'exertion'];
    this.currentState = 'resting';
    this.ticksInCurrentState = 0;
    this.stateDuration = this._getRandomInt(20, 40);

    // Initial baseline vitals
    this.heartRate = 72;
    this.spo2 = 98;
    this.steps = initialSteps;

    // Spontaneous natural dip tracker for SpO2
    this.spontaneousDipTicks = 0;

    // Active injected anomaly: { type: 'tachycardia'|'hypoxia'|'bradycardia', ticksRemaining: number }
    this.activeAnomaly = null;

    // Rolling history of last 60 readings
    this.history = [];
    this.maxHistoryLength = 60;
  }

  _getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  _transitionState() {
    // Weighted probabilities: resting (60%), light_activity (30%), exertion (10%)
    const rand = Math.random();
    if (rand < 0.60) {
      this.currentState = 'resting';
    } else if (rand < 0.90) {
      this.currentState = 'light_activity';
    } else {
      this.currentState = 'exertion';
    }

    this.ticksInCurrentState = 0;
    this.stateDuration = this._getRandomInt(20, 40);
  }

  _updateHeartRate() {
    let minTarget, maxTarget, meanTarget;

    switch (this.currentState) {
      case 'resting':
        minTarget = 60;
        maxTarget = 75;
        meanTarget = 68;
        break;
      case 'light_activity':
        minTarget = 85;
        maxTarget = 110;
        meanTarget = 98;
        break;
      case 'exertion':
        minTarget = 115;
        maxTarget = 160;
        meanTarget = 135;
        break;
      default:
        minTarget = 60;
        maxTarget = 75;
        meanTarget = 68;
    }

    // Mean-reverting random walk (pull towards meanTarget + small random jitter ±1 to 2)
    const reversionPull = (meanTarget - this.heartRate) * 0.12;
    const jitter = this._getRandomArbitrary(-2, 2);
    this.heartRate = Math.round(this.heartRate + reversionPull + jitter);

    // Keep within state baseline bounds
    this.heartRate = Math.max(minTarget, Math.min(maxTarget, this.heartRate));
  }

  _updateSpO2() {
    // 2% chance per tick to initiate a spontaneous mild hypoxic dip (90-94%) for 3-5 ticks
    if (this.spontaneousDipTicks === 0 && Math.random() < 0.02) {
      this.spontaneousDipTicks = this._getRandomInt(3, 5);
    }

    if (this.spontaneousDipTicks > 0) {
      this.spo2 = this._getRandomInt(90, 94);
      this.spontaneousDipTicks--;
    } else {
      // Normal variation: 96% - 99%
      const jitter = (Math.random() - 0.5);
      let target = 98 + jitter;
      this.spo2 = Math.min(99, Math.max(96, Math.round(target)));
    }
  }

  _updateSteps() {
    let delta = 0;
    if (this.currentState === 'resting') {
      delta = 0;
    } else if (this.currentState === 'light_activity') {
      delta = this._getRandomInt(1, 3);
    } else if (this.currentState === 'exertion') {
      delta = this._getRandomInt(3, 6);
    }
    this.steps += delta;
  }

  /**
   * Force inject a specific anomaly for demo purposes
   * @param {'tachycardia' | 'hypoxia' | 'bradycardia'} type 
   */
  injectAnomaly(type) {
    const validTypes = ['tachycardia', 'hypoxia', 'bradycardia'];
    if (!validTypes.includes(type)) {
      console.warn(`[VitalsSimulator] Unknown anomaly type: "${type}". Expected one of: ${validTypes.join(', ')}`);
      return;
    }
    this.activeAnomaly = {
      type,
      ticksRemaining: 10
    };
    console.info(`[VitalsSimulator] Anomaly injected: "${type}" for 10 ticks.`);
  }

  /**
   * Clear active anomaly immediately
   */
  clearAnomaly() {
    this.activeAnomaly = null;
    this.heartRate = 72;
    this.spo2 = 98;
    console.info('[VitalsSimulator] Anomaly cleared. Baseline restored.');
  }

  /**
   * Advance simulation by 1 tick and return latest telemetry reading
   * @returns {{ heartRate: number, spo2: number, steps: number, timestamp: string, state: string, activeAnomaly: string | null }}
   */
  tick() {
    // 1. Advance state transitions
    this.ticksInCurrentState++;
    if (this.ticksInCurrentState >= this.stateDuration) {
      this._transitionState();
    }

    // 2. Base natural metrics
    this._updateHeartRate();
    this._updateSpO2();
    this._updateSteps();

    // 3. Override if active anomaly is injected
    let anomalyType = null;
    if (this.activeAnomaly && this.activeAnomaly.ticksRemaining > 0) {
      anomalyType = this.activeAnomaly.type;

      if (anomalyType === 'tachycardia') {
        // HR spikes to 170+ for 10 ticks
        this.heartRate = 170 + this._getRandomInt(0, 12);
      } else if (anomalyType === 'hypoxia') {
        // SpO2 drops to ~88% (86-89%)
        this.spo2 = 88 + this._getRandomInt(-2, 1);
      } else if (anomalyType === 'bradycardia') {
        // HR drops to ~40 bpm (38-42)
        this.heartRate = 40 + this._getRandomInt(-2, 2);
      }

      this.activeAnomaly.ticksRemaining--;
      if (this.activeAnomaly.ticksRemaining <= 0) {
        this.activeAnomaly = null;
      }
    }

    const reading = {
      heartRate: this.heartRate,
      spo2: this.spo2,
      steps: this.steps,
      timestamp: new Date().toISOString(),
      state: this.currentState,
      activeAnomaly: anomalyType
    };

    // 4. Update rolling history (last 60 readings)
    this.history.push(reading);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return reading;
  }

  /**
   * Retrieve rolling history array
   */
  getHistory() {
    return [...this.history];
  }
}

// Export default singleton instance as well for convenience
export const simulatorInstance = new VitalsSimulator();
