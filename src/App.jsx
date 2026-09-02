import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Heart, 
  Wifi, 
  BatteryMedium, 
  Settings, 
  RefreshCw,
  Zap,
  Flame,
  Droplet,
  HeartCrack,
  Footprints,
  Shield,
  Sliders,
  Info
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                    VitalGuard <span className="text-[#0F766E]">AI</span>
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200 uppercase tracking-wide">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                  AI-Powered Continuous Health Anomaly Detection
                </p>
              </div>
            </div>

            <div className="hidden md:block h-6 w-px bg-slate-200" />

            {/* Live Monitoring Active Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 tracking-tight">
                Monitoring Active
              </span>
              <span className="text-[10px] text-emerald-600 font-mono hidden xl:inline">
                • 2s interval
              </span>
            </div>
          </div>

          {/* Center Demo Controls Box */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Judge Demo Controls
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50/40 p-1.5 rounded-xl border border-dashed border-amber-300 shadow-2xs">
              <button
                onClick={() => handleInjectAnomaly('tachycardia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSimulation === 'tachycardia'
                    ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                    : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80'
                }`}
                title="Simulate acute heart rate spike (>170 BPM)"
              >
                <Flame className="w-3 h-3 text-rose-500" />
                Tachycardia
              </button>
              <button
                onClick={() => handleInjectAnomaly('hypoxia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSimulation === 'hypoxia'
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80'
                }`}
                title="Simulate SpO2 oxygen desaturation (88%)"
              >
                <Droplet className="w-3 h-3 text-sky-500" />
                Hypoxia
              </button>
              <button
                onClick={() => handleInjectAnomaly('bradycardia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSimulation === 'bradycardia'
                    ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                    : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/80'
                }`}
                title="Simulate sudden heart rate drop (~40 BPM)"
              >
                <HeartCrack className="w-3 h-3 text-purple-500" />
                Bradycardia
              </button>
            </div>
          </div>

          {/* User Controls & Sensor Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="font-mono text-[11px] text-slate-700">Bed-12</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] text-slate-700">88%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-slate-200">
                DR
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">Dr. Reynolds</span>
                <span className="text-[10px] text-slate-400 font-medium block">Lead Intensivist</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile / Tablet Demo Controls Drawer */}
        <div className="lg:hidden flex flex-col gap-1 px-4 py-2 bg-amber-50/50 border-t border-amber-200/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
              Judge Demo Controls:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => handleInjectAnomaly('tachycardia')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeSimulation === 'tachycardia' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              🔥 Tachycardia
            </button>
            <button
              onClick={() => handleInjectAnomaly('hypoxia')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeSimulation === 'hypoxia' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              💧 Hypoxia
            </button>
            <button
              onClick={() => handleInjectAnomaly('bradycardia')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeSimulation === 'bradycardia' ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              💔 Bradycardia
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout: 3-Column Responsive Grid */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Sub-header Breadcrumbs & State Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cardiac Intensive Care Unit (CICU)
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Live telemetry stream • Patient Activity State:{' '}
              <span className="font-semibold text-slate-700 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-mono text-[11px]">
                {latestVitals?.state?.replace('_', ' ') || 'RESTING'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
            <span className="font-medium text-slate-500">Live Buffer:</span>
            <span className="font-mono font-bold text-slate-800">{history.length}/60 readings</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse ml-1"></span>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (25% -> 3/12 cols): PatientProfile */}
          <section className="lg:col-span-3 flex flex-col gap-6" aria-label="Patient Profile Information">
            <PatientProfile healthStatus={overallHealthStatus} isLoading={isLoading} />
          </section>

          {/* Center Column (50% -> 6/12 cols): 3 VitalsCard in a row + TrendChart */}
          <section className="lg:col-span-6 flex flex-col gap-6" aria-label="Real-time Vitals and Trend Analytics">
            
            {/* Top row with 3 dynamic VitalsCard components */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                changeText={spo2Status === 'critical' ? 'Hypoxic Desaturation' : 'Optimal Saturation'}
                isLoading={isLoading}
              />
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

            {/* Bottom section: TrendChart (Recharts) */}
            <TrendChart history={history} isLoading={isLoading} />
          </section>

          {/* Right Column (25% -> 3/12 cols): AlertFeed */}
          <section className="lg:col-span-3 flex flex-col gap-6" aria-label="Clinical Alerts Feed">
            <AlertFeed alerts={alerts.all} isLoading={isLoading} />
          </section>

        </div>
      </main>

      {/* Compliance & Regulatory Disclaimer Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="font-semibold text-slate-600">VitalGuard AI Telemetry v2.4</span>
            <span className="text-slate-300">•</span>
            <span>Intelligent Telemetry & Biometric Triage Engine</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-slate-500">
            VitalGuard AI — Simulated wearable data for demonstration purposes. Not a medical device.
          </p>
        </div>
      </footer>

    </div>
  );
}
