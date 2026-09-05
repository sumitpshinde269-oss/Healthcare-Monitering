import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Smooth counting micro-animation component
function AnimatedNumber({ value, duration = 300 }) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? value : 0);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const start = displayValue;
    const target = value;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</span>;
}

export default function VitalsCard({
  label = "Heart Rate",
  value = "--",
  unit = "BPM",
  status = "normal", // 'normal' | 'warning' | 'critical'
  icon: IconComponent = Heart,
  trend = "stable", // 'up' | 'down' | 'stable'
  range = "Normal Range",
  changeText = "",
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="surface-card p-4 sm:p-5 flex flex-col justify-between h-[10.5rem]" aria-busy="true" aria-label={`Loading ${label}`}>
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 rounded skeleton-shimmer" />
          <div className="w-16 h-5 rounded skeleton-shimmer" />
        </div>
        <div className="w-28 h-10 rounded skeleton-shimmer my-2" />
        <div className="w-full h-3 rounded skeleton-shimmer" />
      </div>
    );
  }

  // Refined clinical color configuration
  const statusConfig = {
    normal: {
      accentBar: "bg-teal-600",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200/80",
      badgeText: "Normal",
      iconBg: "bg-teal-50 text-teal-700 border-teal-100",
      borderClass: "border-slate-200 hover:border-slate-300"
    },
    warning: {
      accentBar: "bg-amber-500",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      badgeText: "Warning",
      iconBg: "bg-amber-50 text-amber-700 border-amber-100",
      borderClass: "border-amber-200/90 bg-amber-50/15"
    },
    critical: {
      accentBar: "bg-rose-600",
      badgeClass: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
      badgeText: "Critical",
      iconBg: "bg-rose-50 text-rose-700 border-rose-100",
      borderClass: "border-rose-200 bg-rose-50/20"
    }
  };

  const current = statusConfig[status] || statusConfig.normal;

  return (
    <div 
      className={`surface-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full ${current.borderClass}`}
      role="region"
      aria-label={`${label}: ${value} ${unit}, status ${current.badgeText}`}
    >
      {/* Top subtle accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${current.accentBar}`} aria-hidden="true" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg border ${current.iconBg}`}>
            {IconComponent && <IconComponent className="w-3.5 h-3.5" aria-hidden="true" />}
          </div>
          <span className="text-xs font-semibold text-slate-700 tracking-tight truncate">{label}</span>
        </div>

        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${current.badgeClass}`}>
          {status === 'critical' && <AlertCircle className="w-3 h-3 text-rose-600" aria-hidden="true" />}
          {status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />}
          {status === 'normal' && <CheckCircle2 className="w-3 h-3 text-teal-600" aria-hidden="true" />}
          {current.badgeText}
        </span>
      </div>

      {/* Main Metric & Trend */}
      <div className="flex items-baseline justify-between my-3 gap-2">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-3xl sm:text-[2rem] font-bold text-slate-900 tracking-tight font-mono tabular-nums leading-none">
            {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            {unit}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium shrink-0">
          {trend === 'up' && (
            <span className="flex items-center gap-0.5 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/70" title="Trending upward">
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-mono font-semibold">UP</span>
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center gap-0.5 text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/70" title="Trending downward">
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-mono font-semibold">DOWN</span>
            </span>
          )}
          {trend === 'stable' && (
            <span className="flex items-center gap-0.5 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70" title="Stable rhythm">
              <Minus className="w-3 h-3" aria-hidden="true" />
              <span className="text-[10px] font-mono font-semibold">STABLE</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="truncate">{range}</span>
        {changeText && (
          <span className="font-mono text-slate-600 font-medium shrink-0 tabular-nums">
            {changeText}
          </span>
        )}
      </div>
    </div>
  );
}
