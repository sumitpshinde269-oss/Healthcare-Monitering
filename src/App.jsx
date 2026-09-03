import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Heart, 
  Wifi, 
  BatteryMedium, 
  Zap,
  Flame,
  Droplet,
  HeartCrack,
  Footprints,
  Shield
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
  const [latestVitals, setLatestVitals] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState({ active: [], all: [] });
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Initialize simulator and detector
  useEffect(() => {
    simulatorRef.current = new VitalsSimulator();
    detectorRef.current = new AnomalyDetector();

    // Brief initial loading shimmer
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
    }, 600);

    // Tick every 2 seconds
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

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Handle Judge Demo Anomaly Injections
  const handleInjectAnomaly = (type) => {
    if (simulatorRef.current) {
      simulatorRef.current.injectAnomaly(type);
      setActiveSimulation(type);
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

  const demoBtnBase =
    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

  return (
    <div className="min-h-screen page-atmosphere text-slate-900 flex flex-col justify-between animate-fade-in">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 glass-header border-b border-slate-200/70" role="banner">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-[#0F766E]/30 transition-transform duration-300 hover:scale-105"
                aria-hidden="true"
              >
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                    VitalGuard <span className="text-[#0F766E]">AI</span>
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200/80 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug mt-1 truncate">
                  Continuous Health Anomaly Detection
                </p>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200/80" aria-hidden="true" />

            {/* Live Monitoring Active Status Pill */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/70"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-xs font-semibold text-emerald-800 tracking-tight">
                Monitoring Active
              </span>
              <span className="text-[10px] text-emerald-600/90 font-mono hidden xl:inline">
                · 2s
              </span>
            </div>
          </div>

          {/* Center Demo Controls Box */}
          <div className="hidden lg:flex flex-col items-center" aria-label="Demo anomaly controls">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Judge Demo Controls
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50/50 p-1.5 rounded-xl border border-dashed border-amber-300/80">
              <button
                type="button"
                onClick={() => handleInjectAnomaly('tachycardia')}
                aria-pressed={activeSimulation === 'tachycardia'}
                className={`${demoBtnBase} ${
                  activeSimulation === 'tachycardia'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300/70 focus-visible:ring-rose-400'
                    : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80 hover:-translate-y-0.5 focus-visible:ring-rose-400'
                }`}
                title="Simulate acute heart rate spike (>170 BPM)"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                Tachycardia
              </button>
              <button
                type="button"
                onClick={() => handleInjectAnomaly('hypoxia')}
                aria-pressed={activeSimulation === 'hypoxia'}
                className={`${demoBtnBase} ${
                  activeSimulation === 'hypoxia'
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300/70 focus-visible:ring-amber-400'
                    : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80 hover:-translate-y-0.5 focus-visible:ring-amber-400'
                }`}
                title="Simulate SpO2 oxygen desaturation (88%)"
              >
                <Droplet className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
                Hypoxia
              </button>
              <button
                type="button"
                onClick={() => handleInjectAnomaly('bradycardia')}
                aria-pressed={activeSimulation === 'bradycardia'}
                className={`${demoBtnBase} ${
                  activeSimulation === 'bradycardia'
                    ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-400/60 focus-visible:ring-slate-500'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 hover:-translate-y-0.5 focus-visible:ring-slate-500'
                }`}
                title="Simulate sudden heart rate drop (~40 BPM)"
              >
                <HeartCrack className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                Bradycardia
              </button>
            </div>
          </div>

          {/* User Controls & Sensor Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50/90 px-2.5 py-1.5 rounded-lg border border-slate-200/70 transition-colors hover:border-teal-300/60">
                <Wifi className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
                <span className="font-mono text-[11px] text-slate-700 font-medium">Bed-12</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50/90 px-2.5 py-1.5 rounded-lg border border-slate-200/70 transition-colors hover:border-emerald-300/60">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="font-mono text-[11px] text-slate-700 font-medium">88%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200/80">
              <div
                className="w-9 h-9 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-white shadow-sm"
                aria-hidden="true"
              >
                DR
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">Dr. Reynolds</span>
                <span className="text-[10px] text-slate-400 font-medium block">Lead Intensivist</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile / Tablet Demo Controls */}
        <div className="lg:hidden flex flex-col gap-1.5 px-4 py-2.5 bg-amber-50/60 border-t border-amber-200/60 text-xs" aria-label="Demo anomaly controls">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-amber-900/80 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" aria-hidden="true" />
            Judge Demo Controls
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleInjectAnomaly('tachycardia')}
              aria-pressed={activeSimulation === 'tachycardia'}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                activeSimulation === 'tachycardia' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-500" aria-hidden="true" />
              Tachycardia
            </button>
            <button
              type="button"
              onClick={() => handleInjectAnomaly('hypoxia')}
              aria-pressed={activeSimulation === 'hypoxia'}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeSimulation === 'hypoxia' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              <Droplet className="w-3 h-3 text-sky-500" aria-hidden="true" />
              Hypoxia
            </button>
            <button
              type="button"
              onClick={() => handleInjectAnomaly('bradycardia')}
              aria-pressed={activeSimulation === 'bradycardia'}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                activeSimulation === 'bradycardia' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HeartCrack className="w-3 h-3 text-slate-600" aria-hidden="true" />
              Bradycardia
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8" id="main-content">
        
        {/* Sub-header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F766E] mb-1.5">
              Live Clinical Dashboard
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
              Cardiac Intensive Care Unit
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
              Live telemetry · Activity:{' '}
              <span className="inline-flex items-center font-semibold text-slate-700 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/70 font-mono text-[11px] shadow-sm">
                {latestVitals?.state?.replace('_', ' ') || 'RESTING'}
              </span>
            </p>
          </div>

          <div
            className="flex items-center gap-2.5 bg-white/90 px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm text-xs transition-shadow hover:shadow-md"
            role="status"
            aria-label={`Live buffer ${history.length} of 60 readings`}
          >
            <span className="font-medium text-slate-500">Buffer</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">{history.length}/60</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          <section className="lg:col-span-3 flex flex-col gap-6 animate-slide-in" aria-label="Patient Profile Information">
            <PatientProfile healthStatus={overallHealthStatus} isLoading={isLoading} />
          </section>

          <section className="lg:col-span-6 flex flex-col gap-5 lg:gap-6" aria-label="Real-time Vitals and Trend Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="animate-slide-in stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
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
              </div>
              <div className="animate-slide-in stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <VitalsCard
                  label="Blood Oxygen"
                  value={latestVitals?.spo2 ?? 98}
                  unit="%"
                  status={spo2Status}
                  icon={Activity}
                  trend={spo2Trend}
                  range="Baseline: 95 - 100%"
                  changeText={spo2Status === 'critical' ? 'Hypoxic Desaturation' : 'Optimal Saturation'}
                  isLoading={isLoading}
                />
              </div>
              <div className="animate-slide-in stagger-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <VitalsCard
                  label="Daily Steps"
                  value={latestVitals?.steps ?? 8420}
                  unit="steps"
                  status="normal"
                  icon={Footprints}
                  trend="up"
                  range="Daily Target: 10k"
                  changeText={`+${latestVitals?.steps ? latestVitals.steps - 8420 : 0} today`}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="animate-slide-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <TrendChart history={history} isLoading={isLoading} />
            </div>
          </section>

          <section className="lg:col-span-3 flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.12s', opacity: 0, animationFillMode: 'forwards' }} aria-label="Clinical Alerts Feed">
            <AlertFeed alerts={alerts.all} isLoading={isLoading} />
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-slate-200/70 py-4 px-4 sm:px-6 lg:px-8 mt-4" role="contentinfo">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <Shield className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
            <span className="font-semibold text-slate-600">VitalGuard AI Telemetry v2.4</span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">Intelligent Telemetry &amp; Biometric Triage</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-slate-500 leading-relaxed max-w-md">
            Simulated wearable data for demonstration. Not a medical device.
          </p>
        </div>
      </footer>

    </div>
  );
}
