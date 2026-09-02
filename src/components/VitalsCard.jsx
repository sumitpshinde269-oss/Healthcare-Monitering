import React from 'react';
import { 
  Heart, 
  Activity, 
  Footprints, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function VitalsCard({
  title = "Heart Rate",
  value = "74",
  unit = "BPM",
  status = "normal", // 'optimal' | 'normal' | 'warning' | 'critical'
  statusLabel = "Normal",
  change = "+2 BPM",
  trend = "up",
  range = "Range: 60 - 100 BPM",
  type = "heartRate"
}) {
  // Config per vital type
  const configs = {
    heartRate: {
      icon: Heart,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      waveColor: "#F43F5E",
      wavePath: "M 0,25 Q 15,10 30,25 T 60,25 T 75,5 T 85,40 T 95,20 T 110,25 L 140,25"
    },
    spo2: {
      icon: Activity,
      iconColor: "text-[#0F766E]",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-100",
      waveColor: "#0F766E",
      wavePath: "M 0,20 Q 20,15 40,22 T 80,18 T 110,21 L 140,20"
    },
    steps: {
      icon: Footprints,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      waveColor: "#6366F1",
      wavePath: "M 0,30 L 25,26 L 50,22 L 75,18 L 100,12 L 125,8 L 140,6"
    }
  };

  const currentConfig = configs[type] || configs.heartRate;
  const IconComponent = currentConfig.icon;

  const statusBadgeClasses = {
    optimal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    normal: "bg-teal-50 text-[#0F766E] border-teal-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status === 'critical' ? 'bg-rose-500' :
        status === 'warning' ? 'bg-amber-500' :
        'bg-[#0F766E]'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${currentConfig.bgColor} ${currentConfig.borderColor} border`}>
            <IconComponent className={`w-4 h-4 ${currentConfig.iconColor}`} />
          </div>
          <span className="text-xs font-semibold text-slate-600">{title}</span>
        </div>

        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusBadgeClasses[status] || statusBadgeClasses.normal}`}>
          {statusLabel}
        </span>
      </div>

      {/* Main Metric & Mini Wave */}
      <div className="flex items-baseline justify-between mt-1 mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{unit}</span>
        </div>

        {/* Dynamic mini SVG wave */}
        <div className="w-24 h-9 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 140 45" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={currentConfig.waveColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={currentConfig.waveColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${currentConfig.wavePath} L 140,45 L 0,45 Z`}
              fill={`url(#grad-${type})`}
            />
            <path
              d={currentConfig.wavePath}
              fill="none"
              stroke={currentConfig.waveColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Footer / Subtitle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>{range}</span>
        <span className="inline-flex items-center gap-0.5 text-slate-600 font-semibold">
          {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />}
          {change}
        </span>
      </div>
    </div>
  );
}
