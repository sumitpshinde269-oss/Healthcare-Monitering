import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  ShieldCheck, 
  BrainCircuit, 
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export default function AlertFeed({ alerts = [], isLoading = false }) {
  const [filter, setFilter] = useState('all');

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    if (filter === 'active') return a.status === 'active';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col justify-between flex-1 gap-5">
      {/* Feed Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                <Bell className="w-4 h-4" />
              </div>
              {activeAlerts.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${criticalCount > 0 ? 'bg-rose-600 animate-ping' : 'bg-amber-500'}`} />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Clinical Alerts</h3>
              <p className="text-xs text-slate-500 font-normal">Real-time anomaly triage</p>
            </div>
          </div>

          {isLoading ? (
            <div className="w-16 h-5 rounded skeleton-shimmer" />
          ) : criticalCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold animate-pulse shadow-xs">
              {criticalCount} Critical
            </span>
          ) : warningCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-xs">
              {warningCount} Warning{warningCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Optimal
            </span>
          )}
        </div>

        {/* AI Continuous Telemetry Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-teal-50/70 border border-teal-100/90 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-teal-100/70 text-[#0F766E] shrink-0 mt-0.5">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#0F766E] block tracking-tight">
              AI Continuous Telemetry Monitor
            </span>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
              {isLoading
                ? 'Calibrating multi-vital telemetry feed...'
                : activeAlerts.length > 0
                ? `${activeAlerts.length} active condition(s) detected across rolling 60-readings baseline.`
                : 'All physiological waveforms tracking stably within expected clinical tolerances.'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'active' 
                ? 'bg-[#0F766E] text-white shadow-xs' 
                : 'bg-teal-50 text-[#0F766E] hover:bg-teal-100 border border-teal-200'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'critical' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Critical ({alerts.filter(a => a.severity === 'critical').length})
          </button>
        </div>
      </div>

      {/* Alert Items Stream */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 min-h-[160px]">
        {isLoading ? (
          <div className="space-y-3">
            <div className="w-full h-20 rounded-xl skeleton-shimmer" />
            <div className="w-full h-20 rounded-xl skeleton-shimmer" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          /* Reassuring, Polished Empty State */
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-emerald-50/50 border border-emerald-100/80 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-3 shadow-inner ring-4 ring-emerald-50">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-bold text-emerald-950">All Vitals Normal</h4>
            <p className="text-xs text-emerald-700/90 mt-1 max-w-[210px] leading-relaxed">
              No active anomalies or clinical threshold breaches detected in recent telemetry.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isActive = alert.status === 'active';

            return (
              <div
                key={alert.id}
                className={`animate-slide-in p-4 rounded-xl border-y border-r border-l-4 transition-all shadow-xs ${
                  isCritical
                    ? 'border-l-rose-600 bg-rose-50/40 border-y-rose-200 border-r-rose-200'
                    : isWarning
                    ? 'border-l-amber-500 bg-amber-50/40 border-y-amber-200 border-r-amber-200'
                    : 'border-l-emerald-500 bg-slate-50/90 border-y-slate-200 border-r-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className={`text-xs font-bold tracking-tight ${
                      isCritical ? 'text-rose-950' : isWarning ? 'text-amber-950' : 'text-slate-900'
                    }`}>
                      {alert.type ? alert.type.replace('_', ' ').toUpperCase() : 'ANOMALY'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mb-2.5 leading-relaxed font-normal">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 text-[11px]">
                  <span className="font-semibold text-slate-600 font-mono">
                    Trigger: <span className={isCritical ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-teal-700'}>{alert.value}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    isActive
                      ? isCritical
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isActive ? 'Active' : 'Resolved'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5" />
          Rolling telemetry window: last 60 readings
        </span>
      </div>
    </div>
  );
}
