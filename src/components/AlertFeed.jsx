import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  ShieldCheck, 
  Clock
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

  const filterBtn =
    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400';

  return (
    <div className="surface-card p-5 flex flex-col justify-between flex-1 gap-4 h-full">
      {/* Feed Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Bell className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Clinical Alerts</h3>
              <p className="text-xs text-slate-500">Automated triage stream</p>
            </div>
          </div>

          {isLoading ? (
            <div className="w-16 h-5 rounded skeleton-shimmer shrink-0" />
          ) : criticalCount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold shrink-0" role="status">
              {criticalCount} Critical
            </span>
          ) : warningCount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium shrink-0" role="status">
              {warningCount} Warning{warningCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium flex items-center gap-1 shrink-0" role="status">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              All Normal
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60" role="tablist" aria-label="Alert filters">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`${filterBtn} ${
              filter === 'all' 
                ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'active'}
            onClick={() => setFilter('active')}
            className={`${filterBtn} ${
              filter === 'active' 
                ? 'bg-white text-teal-700 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'critical'}
            onClick={() => setFilter('critical')}
            className={`${filterBtn} ${
              filter === 'critical' 
                ? 'bg-white text-rose-700 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({alerts.filter(a => a.severity === 'critical').length})
          </button>
        </div>
      </div>

      {/* Alert Items Stream */}
      <div className="space-y-2 overflow-y-auto max-h-[380px] pr-0.5 min-h-[160px]" role="list" aria-label="Alert list" aria-live="polite">
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <div className="w-full h-16 rounded-lg skeleton-shimmer" />
            <div className="w-full h-16 rounded-lg skeleton-shimmer" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-100">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No Active Anomalies</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-snug">
              Telemetry signals are within baseline clinical limits.
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
                role="listitem"
                className={`p-3 rounded-lg border transition-colors ${
                  isCritical
                    ? 'border-rose-200 bg-rose-50/30'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isCritical ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    )}
                    <span className={`text-xs font-bold tracking-tight truncate ${
                      isCritical ? 'text-rose-900' : isWarning ? 'text-amber-900' : 'text-slate-900'
                    }`}>
                      {alert.type ? alert.type.replace('_', ' ').toUpperCase() : 'ANOMALY'}
                    </span>
                  </div>

                  <time className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums" dateTime={alert.timestamp}>
                    {formatRelativeTime(alert.timestamp)}
                  </time>
                </div>

                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[11px] gap-2">
                  <span className="font-medium text-slate-600 font-mono truncate text-[10px]">
                    Trigger:{' '}
                    <span className={isCritical ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-teal-700'}>
                      {alert.value}
                    </span>
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shrink-0 ${
                    isActive
                      ? isCritical
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
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

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
          <Clock className="w-3 h-3" aria-hidden="true" />
          Continuous buffer analysis
        </span>
      </div>
    </div>
  );
}
