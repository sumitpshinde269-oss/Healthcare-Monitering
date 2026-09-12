import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Activity, Heart, Play } from 'lucide-react';
import PatientProfile from './components/PatientProfile.jsx';
import VitalsCard from './components/VitalsCard.jsx';
import TrendChart from './components/TrendChart.jsx';
import AlertFeed from './components/AlertFeed.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import { VitalsSimulator } from './lib/dataSimulator.js';
import { AnomalyDetector } from './lib/anomalyDetector.js';
import { CLINICAL_THRESHOLDS, classifyHeartRate, classifySpo2 } from './lib/clinicalThresholds.js';

const { heartRate: HR_RANGE, spo2: SPO2_RANGE } = CLINICAL_THRESHOLDS;

export default function App() {
  const simulatorRef = useRef(null);
  const detectorRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [latestVitals, setLatestVitals] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState({ active: [], all: [] });
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Advance the simulator one tick, run anomaly analysis, and publish state.
  // Shared by the live interval and the manual controls so every path behaves identically.
  const applySimulatorReading = useCallback(() => {
    if (!simulatorRef.current) return;

    const reading = simulatorRef.current.tick();
    const currentHistory = simulatorRef.current.getHistory();
    const analysis = detectorRef.current
      ? detectorRef.current.analyze(currentHistory)
      : { activeAlerts: [], allAlerts: [] };

    setLatestVitals(reading);
    setHistory(currentHistory);
    setAlerts({ active: analysis.activeAlerts, all: analysis.allAlerts });

    // Drop the "Active" indicator once the injected anomaly has elapsed
    if (!reading.activeAnomaly) {
      setActiveSimulation(null);
    }
  }, []);

  // Initialize simulator and detector
  useEffect(() => {
    simulatorRef.current = new VitalsSimulator();
    detectorRef.current = new AnomalyDetector();

    // Brief initial loading
    const timer = setTimeout(() => {
      applySimulatorReading();
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [applySimulatorReading]);

  // Tick every 2 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(applySimulatorReading, 2000);
    return () => clearInterval(interval);
  }, [isPaused, applySimulatorReading]);

  // Handle Reset to Normal Baseline
  const handleResetBaseline = () => {
    if (simulatorRef.current) {
      simulatorRef.current.clearAnomaly();
    }
    if (detectorRef.current) {
      detectorRef.current.resolveAll(new Date().toISOString());
    }
    setActiveSimulation(null);
    applySimulatorReading();
  };

  // Handle Demo Anomaly Injections (toggleable)
  const handleInjectAnomaly = (type) => {
    if (!simulatorRef.current) return;

    if (activeSimulation === type) {
      simulatorRef.current.clearAnomaly();
      setActiveSimulation(null);
    } else {
      simulatorRef.current.injectAnomaly(type);
      setActiveSimulation(type);
    }

    // Immediate tick so the change lands without waiting for the 2s interval
    applySimulatorReading();
  };

  // Compute Trends from last 5 readings
  const { hrTrend, spo2Trend, hrDelta, spo2Delta } = useMemo(() => {
    if (history.length < 5) return { hrTrend: 'stable', spo2Trend: 'stable', hrDelta: 0, spo2Delta: 0 };
    const recent = history.slice(-5);
    const hrDiff = recent[4].heartRate - recent[0].heartRate;
    const spo2Diff = recent[4].spo2 - recent[0].spo2;

    const hrTrend = hrDiff >= 4 ? 'up' : hrDiff <= -4 ? 'down' : 'stable';
    const spo2Trend = spo2Diff >= 1 ? 'up' : spo2Diff <= -1 ? 'down' : 'stable';

    return { hrTrend, spo2Trend, hrDelta: hrDiff, spo2Delta: spo2Diff };
  }, [history]);

  // Current metric status from the shared clinical thresholds
  const hrStatus = latestVitals ? classifyHeartRate(latestVitals.heartRate) : 'normal';
  const spo2Status = latestVitals ? classifySpo2(latestVitals.spo2) : 'normal';

  // Overall Patient Health Status for PatientProfile summary badge
  const overallHealthStatus = useMemo(() => {
    const hasCritical = alerts.active.some(a => a.severity === 'critical') || hrStatus === 'critical' || spo2Status === 'critical';
    if (hasCritical) return 'critical';
    const hasWarning = alerts.active.some(a => a.severity === 'warning') || hrStatus === 'warning' || spo2Status === 'warning';
    if (hasWarning) return 'warning';
    return 'stable';
  }, [alerts.active, hrStatus, spo2Status]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between animate-fade-in">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 glass-header border-b border-slate-200/90" role="banner">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Brand & Live Status */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Activity className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  VitalGuard <span className="text-teal-700">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">Clinical Telemetry</p>
              </div>
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-200" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isPaused 
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
              role="status"
              aria-live="polite"
              title={isPaused ? "Click to resume live telemetry stream" : "Click to pause telemetry stream"}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-amber-600 fill-current" aria-hidden="true" />
                  <span>Stream Paused</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Monitoring Active</span>
                  <span className="text-[10px] text-emerald-600 font-mono">· 2s</span>
                </>
              )}
            </button>
          </div>

          {/* Anomaly Simulation Controls */}
          <SimulationControls
            variant="desktop"
            activeSimulation={activeSimulation}
            onSelect={handleInjectAnomaly}
            onReset={handleResetBaseline}
          />

        </div>

        {/* Mobile Simulation Controls */}
        <SimulationControls
          variant="mobile"
          activeSimulation={activeSimulation}
          onSelect={handleInjectAnomaly}
          onReset={handleResetBaseline}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
        />
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6" id="main-content">
        
        {/* Section Header */}
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Cardiac Intensive Care Unit (ICU-3B)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Continuous Telemetry</p>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Column 1: Patient Profile */}
          <section className="lg:col-span-3 flex flex-col gap-5" aria-label="Patient Profile Information">
            <PatientProfile healthStatus={overallHealthStatus} isLoading={isLoading} />
          </section>

          {/* Column 2: Live Vitals & Trends */}
          <section className="lg:col-span-6 flex flex-col gap-5" aria-label="Real-time Vitals and Trend Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <VitalsCard
                label="Heart Rate"
                value={latestVitals?.heartRate ?? 72}
                unit="BPM"
                status={hrStatus}
                icon={Heart}
                trend={hrTrend}
                range={`Baseline: ${HR_RANGE.normalMin} - ${HR_RANGE.normalMax}`}
                changeText={hrTrend === 'stable' ? 'Stable' : `Δ ${hrDelta > 0 ? '+' : ''}${hrDelta} BPM`}
                isLoading={isLoading}
              />
              <VitalsCard
                label="Blood Oxygen"
                value={latestVitals?.spo2 ?? 98}
                unit="%"
                status={spo2Status}
                icon={Activity}
                trend={spo2Trend}
                range={`Baseline: ${SPO2_RANGE.warningLow} - 100%`}
                changeText={spo2Status === 'critical' ? 'Hypoxic' : spo2Trend === 'stable' ? 'Optimal' : `Δ ${spo2Delta > 0 ? '+' : ''}${spo2Delta}%`}
                isLoading={isLoading}
              />
            </div>

            <TrendChart history={history} isLoading={isLoading} />
          </section>

          {/* Column 3: Clinical Alerts Feed */}
          <section className="lg:col-span-3 flex flex-col gap-5" aria-label="Clinical Alerts Feed">
            <AlertFeed alerts={alerts.all} isLoading={isLoading} />
          </section>

        </div>
      </main>

    </div>
  );
}
