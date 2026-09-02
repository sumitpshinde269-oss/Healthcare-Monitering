import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Heart, 
  Radio, 
  Wifi, 
  BatteryMedium, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle,
  Stethoscope,
  RefreshCw
} from 'lucide-react';
import PatientProfile from './components/PatientProfile.jsx';
import VitalsCard from './components/VitalsCard.jsx';
import TrendChart from './components/TrendChart.jsx';
import AlertFeed from './components/AlertFeed.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Top Navigation / Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Active Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                    VitalGuard <span className="text-[#0F766E]">AI</span>
                  </h1>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200 uppercase tracking-wide">
                    v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                  Intelligent Patient Telemetry
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* Live Monitoring Active Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 tracking-tight">
                Monitoring Active
              </span>
              <span className="text-[10px] text-emerald-600 font-mono hidden md:inline">
                • 120ms latency
              </span>
            </div>
          </div>

          {/* Quick Telemetry & Device Sensors Status */}
          <div className="hidden md:flex items-center gap-5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#0F766E]" />
              <span className="font-medium">Gateway: Bed-12-Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BatteryMedium className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">ECG Patch: 88%</span>
            </div>
          </div>

          {/* User Controls & Profile */}
          <div className="flex items-center gap-2.5">
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Refresh Feed">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="System Settings">
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-slate-200">
                DR
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">Dr. R. Reynolds</span>
                <span className="text-[10px] text-slate-400 font-medium block">Lead Intensivist</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Dashboard Layout: 3-Column Responsive Grid */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Sub-header / Breadcrumbs & Quick Context */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Cardiac Intensive Care Unit (CICU)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time telemetry stream, autonomic biomarkers & AI alert thresholds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Auto-refresh every 2.5s</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          </div>
        </div>

        {/* 3-Column Grid: Left (25%), Center (50%), Right (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (25% -> 3/12 cols): PatientProfile */}
          <section className="lg:col-span-3 flex flex-col gap-6" aria-label="Patient Profile Information">
            <PatientProfile />
          </section>

          {/* Center Column (50% -> 6/12 cols): 3 VitalsCard in a row + TrendChart */}
          <section className="lg:col-span-6 flex flex-col gap-6" aria-label="Real-time Vitals and Trend Analytics">
            
            {/* Top row with 3 VitalsCard components */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <VitalsCard
                title="Heart Rate"
                value="74"
                unit="BPM"
                status="normal"
                statusLabel="Normal"
                change="+2 BPM"
                trend="up"
                range="Range: 60 - 100"
                type="heartRate"
              />
              <VitalsCard
                title="Blood Oxygen"
                value="98"
                unit="%"
                status="optimal"
                statusLabel="Optimal"
                change="+0.5%"
                trend="up"
                range="Range: 95 - 100%"
                type="spo2"
              />
              <VitalsCard
                title="Daily Steps"
                value="8,420"
                unit="steps"
                status="optimal"
                statusLabel="Goal 84%"
                change="+640 today"
                trend="up"
                range="Target: 10,000"
                type="steps"
              />
            </div>

            {/* Bottom section: TrendChart */}
            <TrendChart />
          </section>

          {/* Right Column (25% -> 3/12 cols): AlertFeed */}
          <section className="lg:col-span-3 flex flex-col gap-6" aria-label="Clinical Alerts Feed">
            <AlertFeed />
          </section>

        </div>
      </main>
    </div>
  );
}
