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
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-800 text-xs font-sans z-50 min-w-[170px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">{data.formattedTime}</span>
          {isCritical ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Critical
            </span>
          ) : isWarning ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Warning
            </span>
          ) : (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Normal
            </span>
          )}
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-400 font-sans text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
              Heart Rate
            </span>
            <span className="font-semibold text-xs text-white tabular-nums">{data.heartRate} BPM</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-teal-300 font-sans text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" aria-hidden="true" />
              SpO2
            </span>
            <span className="font-semibold text-xs text-white tabular-nums">{data.spo2}%</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 mt-1 font-sans">
            <span>Activity</span>
            <span className="capitalize font-medium text-slate-300">{data.state?.replace('_', ' ') || 'Resting'}</span>
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
    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400';

  if (isLoading) {
    return (
      <div className="surface-card p-5 flex flex-col justify-between flex-1 gap-4" aria-busy="true" aria-label="Loading trend chart">
        <div className="flex items-center justify-between">
          <div className="w-48 h-5 rounded skeleton-shimmer" />
          <div className="w-32 h-7 rounded skeleton-shimmer" />
        </div>
        <div className="w-full h-64 rounded-xl skeleton-shimmer my-2" />
        <div className="grid grid-cols-4 gap-3">
          <div className="h-12 rounded-lg skeleton-shimmer" />
          <div className="h-12 rounded-lg skeleton-shimmer" />
          <div className="h-12 rounded-lg skeleton-shimmer" />
          <div className="h-12 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 flex flex-col justify-between flex-1 gap-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Physiological Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rolling 60-reading telemetry history
          </p>
        </div>

        {/* Segmented Metric Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60" role="tablist" aria-label="Chart metric filter">
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'hr'}
            onClick={() => setActiveMetric('hr')}
            className={`${toggleBtn} ${
              activeMetric === 'hr'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-white text-teal-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
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
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" aria-hidden="true" />
              Heart Rate (BPM)
            </span>
          )}
          {(activeMetric === 'spo2' || activeMetric === 'both') && (
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" aria-hidden="true" />
              SpO2 (%)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-medium">
            Warning Zone
          </span>
          <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px] font-medium">
            Critical Zone
          </span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-64 bg-slate-50/50 rounded-lg border border-slate-100 p-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            Awaiting telemetry ticks...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}
                interval="preserveStartEnd"
                minTickGap={35}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}
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
                  fill={zone.level === 'critical' ? '#f43f5e' : '#f59e0b'}
                  fillOpacity={zone.level === 'critical' ? 0.12 : 0.08}
                  strokeOpacity={0}
                />
              ))}

              {(activeMetric === 'hr' || activeMetric === 'both') && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}

              {(activeMetric === 'spo2' || activeMetric === 'both') && (
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {[
          { label: 'Mean HR', value: `${summary.avgHr} BPM`, accent: 'text-slate-900' },
          { label: 'Min HR', value: `${summary.minHr} BPM`, accent: 'text-slate-900' },
          {
            label: 'Peak HR',
            value: `${summary.maxHr} BPM`,
            accent: Number(summary.maxHr) > 130 ? 'text-rose-600 font-semibold' : 'text-slate-900'
          },
          {
            label: 'Avg SpO2',
            value: `${summary.avgSpo2}%`,
            accent: Number(summary.avgSpo2) < 95 ? 'text-amber-600 font-semibold' : 'text-teal-700 font-semibold'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-50 p-2 rounded-lg border border-slate-100"
          >
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">{stat.label}</span>
            <span className={`text-xs font-bold font-mono tabular-nums mt-0.5 block ${stat.accent}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
