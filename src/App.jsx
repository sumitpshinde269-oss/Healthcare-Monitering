import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Heart, 
  Flame,
  Droplet,
  HeartCrack,
  Footprints,
  Shield,
  Sliders,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import PatientProfile from './components/PatientProfile.jsx';
import VitalsCard from './components/VitalsCard.jsx';
import TrendChart from './components/TrendChart.jsx';
import AlertFeed from './components/AlertFeed.jsx';
import { VitalsSimulator } from './lib/dataSimulator.js';
import { AnomalyDetector } from './lib/anomalyDetector.js';

export default function App() {
  const simulatorRef = useRef(null);
  const detectorRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [latestVitals, setLatestVitals] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState({ active: [], all: [] });
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Initialize simulator and detector
  useEffect(() => {
    simulatorRef.current = new VitalsSimulator();
    detectorRef.current = new AnomalyDetector();

    // Brief initial loading
    const timer = setTimeout(() => {
      if (simulatorRef.current && detectorRef.current) {
        const initialReading = simulatorRef.current.tick();
        const initialHistory = simulatorRef.current.getHistory();
        const initialAnalysis = detectorRef.current.analyze(initialHistory);

        setLatestVitals(initialReading);
        setHistory(initialHistory);
        setAlerts({ active: initialAnalysis.activeAlerts, all: initialAnalysis.allAlerts });
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Tick every 2 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (simulatorRef.current && detectorRef.current) {
        const reading = simulatorRef.current.tick();
        const currentHistory = simulatorRef.current.getHistory();
        const analysis = detectorRef.current.analyze(currentHistory);

        setLatestVitals(reading);
        setHistory(currentHistory);
        setAlerts({ active: analysis.activeAlerts, all: analysis.allAlerts });

        // Clear active simulation button indicator if anomaly elapsed
        if (!reading.activeAnomaly) {
          setActiveSimulation(null);
        }

        // Console log new anomaly triggers
        if (analysis.newAlerts && analysis.newAlerts.length > 0) {
          analysis.newAlerts.forEach((newAlert) => {
            console.warn(`[VitalGuard Anomaly Detected] [${newAlert.severity.toUpperCase()}]:`, newAlert);
          });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle Reset to Normal Baseline
  const handleResetBaseline = () => {
    if (simulatorRef.current && detectorRef.current) {
      simulatorRef.current.clearAnomaly();
      setActiveSimulation(null);
      const reading = simulatorRef.current.tick();
      const currentHistory = simulatorRef.current.getHistory();
      const analysis = detectorRef.current.analyze(currentHistory);
      setLatestVitals(reading);
      setHistory(currentHistory);
      setAlerts({ active: analysis.activeAlerts, all: analysis.allAlerts });
    }
  };

  // Handle Demo Anomaly Injections (toggleable)
  const handleInjectAnomaly = (type) => {
    if (simulatorRef.current) {
      if (activeSimulation === type) {
        simulatorRef.current.clearAnomaly();
        setActiveSimulation(null);
      } else {
        simulatorRef.current.injectAnomaly(type);
        setActiveSimulation(type);
      }
      // Immediate tick to reflect changes without waiting 2s
      const reading = simulatorRef.current.tick();
      const currentHistory = simulatorRef.current.getHistory();
      const analysis = detectorRef.current ? detectorRef.current.analyze(currentHistory) : { activeAlerts: [], allAlerts: [] };
      setLatestVitals(reading);
      setHistory(currentHistory);
      setAlerts({ active: analysis.activeAlerts, all: analysis.allAlerts });
    }
  };

  // Compute Trends from last 5 readings
  const { hrTrend, spo2Trend } = useMemo(() => {
    if (history.length < 5) return { hrTrend: 'stable', spo2Trend: 'stable' };
    const recent = history.slice(-5);
    const hrDiff = recent[4].heartRate - recent[0].heartRate;
    const spo2Diff = recent[4].spo2 - recent[0].spo2;

    const hrTrend = hrDiff >= 4 ? 'up' : hrDiff <= -4 ? 'down' : 'stable';
    const spo2Trend = spo2Diff >= 1 ? 'up' : spo2Diff <= -1 ? 'down' : 'stable';

    return { hrTrend, spo2Trend };
  }, [history]);

  // Compute Current Metric Status
  const hrStatus = useMemo(() => {
    if (!latestVitals) return 'normal';
    if (latestVitals.heartRate > 140 || latestVitals.heartRate < 50) return 'critical';
    if (latestVitals.heartRate > 100) return 'warning';
    return 'normal';
  }, [latestVitals]);

  const spo2Status = useMemo(() => {
    if (!latestVitals) return 'normal';
    if (latestVitals.spo2 < 92) return 'critical';
    if (latestVitals.spo2 <= 95) return 'warning';
    return 'normal';
  }, [latestVitals]);

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
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200" aria-label="Anomaly simulation controls">
            <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-medium">
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simulate:</span>
            </div>
            
            <button
              type="button"
              onClick={() => handleInjectAnomaly('tachycardia')}
              aria-pressed={activeSimulation === 'tachycardia'}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                activeSimulation === 'tachycardia'
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80'
              }`}
              title="Click to simulate acute heart rate spike (>170 BPM). Click again to clear."
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
              Tachycardia
              {activeSimulation === 'tachycardia' && <span className="text-[10px] opacity-80">(Active)</span>}
            </button>

            <button
              type="button"
              onClick={() => handleInjectAnomaly('hypoxia')}
              aria-pressed={activeSimulation === 'hypoxia'}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                activeSimulation === 'hypoxia'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80'
              }`}
              title="Click to simulate SpO2 oxygen desaturation (88%). Click again to clear."
            >
              <Droplet className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              Hypoxia
              {activeSimulation === 'hypoxia' && <span className="text-[10px] opacity-80">(Active)</span>}
            </button>

            <button
              type="button"
              onClick={() => handleInjectAnomaly('bradycardia')}
              aria-pressed={activeSimulation === 'bradycardia'}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                activeSimulation === 'bradycardia'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
              title="Click to simulate sudden heart rate drop (~40 BPM). Click again to clear."
            >
              <HeartCrack className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              Bradycardia
              {activeSimulation === 'bradycardia' && <span className="text-[10px] opacity-80">(Active)</span>}
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5" aria-hidden="true" />

            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              title="Reset simulation and return to baseline vitals"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" aria-hidden="true" />
              Reset
            </button>
          </div>

        </div>

        {/* Mobile Simulation Controls */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-100/90 border-t border-slate-200 text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded bg-white border border-slate-200 text-slate-700"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Sliders className="w-3 h-3" aria-hidden="true" />
              Sim:
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleInjectAnomaly('tachycardia')}
              aria-pressed={activeSimulation === 'tachycardia'}
              className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                activeSimulation === 'tachycardia' ? 'bg-rose-600 text-white font-semibold' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Tachycardia
            </button>
            <button
              type="button"
              onClick={() => handleInjectAnomaly('hypoxia')}
              aria-pressed={activeSimulation === 'hypoxia'}
              className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                activeSimulation === 'hypoxia' ? 'bg-amber-600 text-white font-semibold' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Hypoxia
            </button>
            <button
              type="button"
              onClick={() => handleInjectAnomaly('bradycardia')}
              aria-pressed={activeSimulation === 'bradycardia'}
              className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                activeSimulation === 'bradycardia' ? 'bg-slate-800 text-white font-semibold' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Bradycardia
            </button>
            <button
              type="button"
              onClick={handleResetBaseline}
              className="p-1 rounded text-xs font-medium shrink-0 bg-white text-slate-700 border border-slate-200"
              title="Reset baseline"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6" id="main-content">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Cardiac Intensive Care Unit (ICU-3B)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Continuous Telemetry</span>
              <span>·</span>
              <span>Activity State:</span>
              <span className="font-semibold text-slate-700 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {latestVitals?.state?.replace('_', ' ') || 'RESTING'}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs"
            role="status"
            aria-label={`Buffer ${history.length} of 60 readings`}
          >
            <span className="text-slate-500 font-medium">Telemetry Buffer:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">{history.length}/60</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" aria-hidden="true" />
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Column 1: Patient Profile */}
          <section className="lg:col-span-3 flex flex-col gap-5" aria-label="Patient Profile Information">
            <PatientProfile healthStatus={overallHealthStatus} isLoading={isLoading} />
          </section>

          {/* Column 2: Live Vitals & Trends */}
          <section className="lg:col-span-6 flex flex-col gap-5" aria-label="Real-time Vitals and Trend Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <VitalsCard
                label="Heart Rate"
                value={latestVitals?.heartRate ?? 72}
                unit="BPM"
                status={hrStatus}
                icon={Heart}
                trend={hrTrend}
                range="Baseline: 60 - 100"
                changeText={hrTrend === 'up' ? '+5 vs baseline' : hrTrend === 'down' ? '-4 vs baseline' : 'Stable'}
                isLoading={isLoading}
              />
              <VitalsCard
                label="Blood Oxygen"
                value={latestVitals?.spo2 ?? 98}
                unit="%"
                status={spo2Status}
                icon={Activity}
                trend={spo2Trend}
                range="Baseline: 95 - 100%"
                changeText={spo2Status === 'critical' ? 'Hypoxic' : 'Optimal'}
                isLoading={isLoading}
              />
              <VitalsCard
                label="Daily Steps"
                value={latestVitals?.steps ?? 8420}
                unit="steps"
                status="normal"
                icon={Footprints}
                trend="up"
                range="Goal: 10,000"
                changeText={`+${latestVitals?.steps ? latestVitals.steps - 8420 : 0} today`}
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

      {/* Clean Minimal Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 mt-4" role="contentinfo">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
            <span className="font-semibold text-slate-700">VitalGuard AI</span>
            <span>· Telemetry &amp; Anomaly Detection</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-slate-400">
            Real-time biometric monitoring simulation for clinical triage demonstration.
          </p>
        </div>
      </footer>

    </div>
  );
}
