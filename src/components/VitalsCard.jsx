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
function AnimatedNumber({ value, duration = 400 }) {
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
      // Ease out cubic
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
      <div className="surface-card p-5 flex flex-col justify-between h-[10.5rem]" aria-busy="true" aria-label={`Loading ${label}`}>
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 rounded skeleton-shimmer" />
          <div className="w-16 h-5 rounded skeleton-shimmer" />
        </div>
        <div className="w-28 h-10 rounded skeleton-shimmer my-2" />
        <div className="w-full h-3 rounded skeleton-shimmer" />
      </div>
    );
  }

  // Color configuration by status
  const statusConfig = {
    normal: {
      accentColor: "bg-[#0F766E]",
      borderColor: "border-slate-200/80 hover:border-teal-400/50",
      cardBg: "bg-white",
      glowClass: "",
      badgeClass: "bg-teal-50 text-[#0F766E] border-teal-200/80",
      badgeText: "Normal",
      iconBg: "bg-teal-50 text-[#0F766E] border-teal-100/80"
    },
    warning: {
      accentColor: "bg-[#F59E0B]",
      borderColor: "border-amber-300/90 ring-1 ring-amber-200/60",
      cardBg: "bg-amber-50/20",
      glowClass: "animate-warning-glow",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      badgeText: "Warning",
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/80"
    },
    critical: {
      accentColor: "bg-[#DC2626]",
      borderColor: "border-rose-400/90",
      cardBg: "bg-rose-50/25",
      glowClass: "animate-critical-glow",
      badgeClass: "bg-rose-100 text-rose-700 border-rose-300 font-bold",
      badgeText: "Critical",
      iconBg: "bg-rose-100 text-rose-600 border-rose-200/80"
    }
  };

  const current = statusConfig[status] || statusConfig.normal;

  return (
    <div 
      className={`rounded-[1.125rem] border p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:-translate-y-0.5 ${current.cardBg} ${current.borderColor} ${current.glowClass}`}
      role="region"
      aria-label={`${label}: ${value} ${unit}, status ${current.badgeText}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${current.accentColor}`} aria-hidden="true" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl border transition-all duration-300 ${current.iconBg}`}>
            {IconComponent && <IconComponent className="w-4 h-4" aria-hidden="true" />}
          </div>
          <span className="text-xs font-semibold text-slate-700 truncate">{label}</span>
        </div>

        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 transition-all duration-300 ${current.badgeClass}`}>
          {status === 'critical' && <AlertCircle className="w-3 h-3 text-rose-600" aria-hidden="true" />}
          {status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />}
          {status === 'normal' && <CheckCircle2 className="w-3 h-3 text-teal-600" aria-hidden="true" />}
          {current.badgeText}
        </span>
      </div>

      {/* Main Metric & Trend */}
      <div className="flex items-baseline justify-between my-2.5 gap-2">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-3xl sm:text-[2.15rem] font-extrabold text-slate-900 tracking-tight font-mono tabular-nums leading-none">
            {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            {unit}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
          {trend === 'up' && (
            <span className="flex items-center gap-0.5 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60" title="Trending upward">
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-mono font-bold">UP</span>
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center gap-0.5 text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200/60" title="Trending downward">
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-mono font-bold">DOWN</span>
            </span>
          )}
          {trend === 'stable' && (
            <span className="flex items-center gap-0.5 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60" title="Stable rhythm">
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-mono font-bold">STABLE</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-100/90 flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
        <span className="truncate">{range}</span>
        {changeText && (
          <span className="text-[11px] font-mono text-slate-600 font-medium shrink-0 tabular-nums">
            {changeText}
          </span>
        )}
      </div>
    </div>
  );
}
