import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { 
  Activity, 
  Heart, 
  Layers
} from 'lucide-react';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isCritical = data.heartRate > 140 || data.heartRate < 50 || data.spo2 < 92;
    const isWarning = (data.heartRate > 100 && !isCritical) || (data.spo2 <= 95 && !isCritical);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs font-sans z-50 min-w-[180px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-2 mb-2.5">
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">{data.formattedTime}</span>
          {isCritical ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/30 text-rose-300 border border-rose-500/40">
              CRITICAL
            </span>
          ) : isWarning ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-300 border border-amber-500/40">
              WARNING
            </span>
          ) : (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              Normal
            </span>
          )}
        </div>

        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-400 font-sans text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
              Heart Rate
            </span>
            <span className="font-bold text-sm text-white tabular-nums">{data.heartRate} BPM</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-teal-300 font-sans text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]" aria-hidden="true" />
              SpO2 Oxygen
            </span>
            <span className="font-bold text-sm text-white tabular-nums">{data.spo2}%</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-1 font-sans">
            <span>Activity</span>
            <span className="capitalize font-semibold text-slate-200">{data.state?.replace('_', ' ') || 'Resting'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function TrendChart({ history = [], isLoading = false }) {
  const [activeMetric, setActiveMetric] = useState('both'); // 'hr' | 'spo2' | 'both'

  // Format data for Recharts
  const chartData = useMemo(() => {
    return history.map((item, index) => {
      const date = new Date(item.timestamp);
      const timeStr = isNaN(date.getTime())
        ? `T-${history.length - index}`
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const isCritical = item.heartRate > 140 || item.heartRate < 50 || item.spo2 < 92 || item.activeAnomaly === 'tachycardia' || item.activeAnomaly === 'hypoxia' || item.activeAnomaly === 'bradycardia';
      const isWarning = !isCritical && (item.heartRate > 100 || item.spo2 <= 95);

      return {
        ...item,
        index,
        formattedTime: timeStr,
        anomalyLevel: isCritical ? 'critical' : isWarning ? 'warning' : 'normal'
      };
    });
  }, [history]);

  // Compute anomaly shaded zones across history
  const anomalyZones = useMemo(() => {
    if (chartData.length === 0) return [];
    const zones = [];
    let currentZone = null;

    chartData.forEach((d, idx) => {
      if (d.anomalyLevel !== 'normal') {
        if (!currentZone) {
          currentZone = { start: d.index, level: d.anomalyLevel };
        } else if (currentZone.level !== d.anomalyLevel) {
          zones.push({ ...currentZone, end: chartData[idx - 1].index });
          currentZone = { start: d.index, level: d.anomalyLevel };
        }
      } else {
        if (currentZone) {
          zones.push({ ...currentZone, end: chartData[idx - 1].index });
          currentZone = null;
        }
      }
    });

    if (currentZone) {
      zones.push({ ...currentZone, end: chartData[chartData.length - 1].index });
    }

    return zones;
  }, [chartData]);

  // Compute dynamic summary metrics
  const summary = useMemo(() => {
    if (history.length === 0) {
      return { avgHr: '--', minHr: '--', maxHr: '--', avgSpo2: '--' };
    }
    const hrs = history.map(h => h.heartRate);
    const sumHr = hrs.reduce((a, b) => a + b, 0);
    const avgHr = Math.round(sumHr / hrs.length);
    const minHr = Math.min(...hrs);
    const maxHr = Math.max(...hrs);

    const spo2s = history.map(h => h.spo2);
    const sumSpo2 = spo2s.reduce((a, b) => a + b, 0);
    const avgSpo2 = (sumSpo2 / spo2s.length).toFixed(1);

    return { avgHr, minHr, maxHr, avgSpo2 };
  }, [history]);

  const toggleBtn =
    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400';

  if (isLoading) {
    return (
      <div className="surface-card p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4" aria-busy="true" aria-label="Loading trend chart">
        <div className="flex items-center justify-between">
          <div className="w-48 h-6 rounded skeleton-shimmer" />
          <div className="w-32 h-8 rounded skeleton-shimmer" />
        </div>
        <div className="w-full h-64 rounded-xl skeleton-shimmer my-2" />
        <div className="grid grid-cols-4 gap-3">
          <div className="h-14 rounded-lg skeleton-shimmer" />
          <div className="h-14 rounded-lg skeleton-shimmer" />
          <div className="h-14 rounded-lg skeleton-shimmer" />
          <div className="h-14 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col justify-between flex-1 gap-3.5">
      {/* Chart Header Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Telemetry &amp; Trends</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Rolling 60-reading physiological buffer
          </p>
        </div>

        {/* Metric Toggle Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl" role="tablist" aria-label="Chart metric filter">
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'hr'}
            onClick={() => setActiveMetric('hr')}
            className={`${toggleBtn} ${
              activeMetric === 'hr'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            Heart Rate
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'spo2'}
            onClick={() => setActiveMetric('spo2')}
            className={`${toggleBtn} ${
              activeMetric === 'spo2'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            SpO2
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'both'}
            onClick={() => setActiveMetric('both')}
            className={`${toggleBtn} ${
              activeMetric === 'both'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            Both
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          {(activeMetric === 'hr' || activeMetric === 'both') && (
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1 bg-rose-500 rounded-full inline-block" aria-hidden="true" />
              Heart Rate (BPM)
            </span>
          )}
          {(activeMetric === 'spo2' || activeMetric === 'both') && (
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1 bg-[#0F766E] rounded-full inline-block" aria-hidden="true" />
              SpO2 (%)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-200/80 font-medium">
            <span className="w-2 h-2 rounded-sm bg-amber-400" aria-hidden="true" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-rose-800 bg-rose-50/90 px-2 py-0.5 rounded-md border border-rose-200/80 font-medium">
            <span className="w-2 h-2 rounded-sm bg-rose-500" aria-hidden="true" />
            Critical
          </span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-64 my-0.5 bg-gradient-to-b from-slate-50/90 to-white rounded-xl border border-slate-200/60 p-2 transition-colors">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            Awaiting telemetry buffer ticks...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace' }}
                interval="preserveStartEnd"
                minTickGap={30}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace' }}
                orientation="left"
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {anomalyZones.map((zone, zIdx) => (
                <ReferenceArea
                  key={zIdx}
                  x1={chartData[zone.start]?.formattedTime}
                  x2={chartData[zone.end]?.formattedTime}
                  fill={zone.level === 'critical' ? '#F43F5E' : '#F59E0B'}
                  fillOpacity={zone.level === 'critical' ? 0.18 : 0.12}
                  strokeOpacity={0}
                />
              ))}

              {(activeMetric === 'hr' || activeMetric === 'both') && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#F43F5E"
                  strokeWidth={2.25}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}

              {(activeMetric === 'spo2' || activeMetric === 'both') && (
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#0F766E"
                  strokeWidth={2.25}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
        {[
          { label: 'Mean HR', value: `${summary.avgHr} BPM`, accent: 'text-slate-800' },
          { label: 'Min HR (60t)', value: `${summary.minHr} BPM`, accent: 'text-slate-800' },
          {
            label: 'Peak HR Spike',
            value: `${summary.maxHr} BPM`,
            accent: Number(summary.maxHr) > 130 ? 'text-rose-600' : 'text-slate-800'
          },
          {
            label: 'Avg SpO2',
            value: `${summary.avgSpo2}%`,
            accent: Number(summary.avgSpo2) < 95 ? 'text-amber-600' : 'text-[#0F766E]'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/90 transition-all duration-200 hover:bg-white hover:border-slate-200 hover:shadow-sm"
          >
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-[0.04em]">{stat.label}</span>
            <span className={`text-sm font-bold font-mono tabular-nums mt-0.5 block ${stat.accent}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
