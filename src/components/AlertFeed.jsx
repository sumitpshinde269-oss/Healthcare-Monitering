import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Bell, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

export default function AlertFeed() {
  const [filter, setFilter] = useState('all');

  const alerts = [
    {
      id: "ALT-8021",
      severity: "critical", // 'critical' | 'warning' | 'info'
      title: "Acute Tachycardia Spike",
      description: "Heart rate exceeded 114 BPM during resting cycle for >3 mins.",
      time: "2 mins ago",
      timestamp: "14:32:10",
      vital: "Heart Rate",
      value: "114 BPM",
      status: "unacknowledged"
    },
    {
      id: "ALT-8019",
      severity: "warning",
      title: "Oxygen Desaturation Dip",
      description: "SpO2 dropped below 92% baseline threshold during sleep apnea episode.",
      time: "18 mins ago",
      timestamp: "14:16:44",
      vital: "SpO2",
      value: "91%",
      status: "unacknowledged"
    },
    {
      id: "ALT-8012",
      severity: "warning",
      title: "Elevated Respiration Rate",
      description: "Tachypneic pattern detected (24 breaths/min).",
      time: "1 hour ago",
      timestamp: "13:20:05",
      vital: "Respiration",
      value: "24 rpm",
      status: "acknowledged"
    },
    {
      id: "ALT-7994",
      severity: "info",
      title: "Telemetry Sensor Re-calibrated",
      description: "Wireless ECG patch signal quality verified at 99.4% precision.",
      time: "3 hours ago",
      timestamp: "11:45:00",
      vital: "System",
      value: "99.4%",
      status: "resolved"
    }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between flex-1 gap-4">
      {/* Feed Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Alerts</h3>
              <p className="text-xs text-slate-500">Real-time anomaly triage</p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            1 Critical
          </span>
        </div>

        {/* AI Insight Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-2.5">
          <BrainCircuit className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-[#0F766E] block">AI Predictive Risk Score: Low-Mod</span>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
              Early warning signs correlate with post-operative analgesic tapering.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'critical' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
            }`}
          >
            Critical (1)
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'warning' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
            }`}
          >
            Warnings (2)
          </button>
        </div>
      </div>

      {/* Alert Items List */}
      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          
          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                  : isWarning
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {isCritical ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${
                    isCritical ? 'text-rose-900' : isWarning ? 'text-amber-900' : 'text-slate-800'
                  }`}>
                    {alert.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.time}</span>
              </div>

              <p className="text-xs text-slate-600 mt-1 mb-2 leading-relaxed">
                {alert.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="font-semibold text-slate-700">
                  {alert.vital}: <span className={isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-[#0F766E]'}>{alert.value}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {alert.status === 'unacknowledged' ? (
                    <button className="px-2 py-0.5 text-[11px] font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs transition-colors cursor-pointer">
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      {alert.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Action */}
      <div className="pt-2 border-t border-slate-100">
        <button className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          <span>View Complete Event Audit Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
