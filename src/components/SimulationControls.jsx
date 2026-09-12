import React from 'react';
import {
  Flame,
  Droplet,
  HeartCrack,
  Sliders,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

/**
 * Single source of truth for the demo anomaly triggers. Both the desktop
 * toolbar and the compact mobile bar render from this list, so adding or
 * restyling a scenario happens in exactly one place.
 */
const SCENARIOS = [
  {
    type: 'tachycardia',
    label: 'Tachycardia',
    icon: Flame,
    iconClass: 'text-rose-500',
    idleClass: 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80',
    activeClass: 'bg-rose-600 text-white shadow-sm font-semibold',
    title: 'Simulate acute heart rate spike (>170 BPM). Click again to clear.'
  },
  {
    type: 'hypoxia',
    label: 'Hypoxia',
    icon: Droplet,
    iconClass: 'text-amber-500',
    idleClass: 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80',
    activeClass: 'bg-amber-600 text-white shadow-sm font-semibold',
    title: 'Simulate SpO2 oxygen desaturation (~88%). Click again to clear.'
  },
  {
    type: 'bradycardia',
    label: 'Bradycardia',
    icon: HeartCrack,
    iconClass: 'text-slate-500',
    idleClass: 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80',
    activeClass: 'bg-slate-800 text-white shadow-sm font-semibold',
    title: 'Simulate sudden heart rate drop (~40 BPM). Click again to clear.'
  }
];

const focusRing =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400';

export default function SimulationControls({
  activeSimulation = null,
  onSelect,
  onReset,
  variant = 'desktop',
  isPaused = false,
  onTogglePause
}) {
  if (variant === 'mobile') {
    return (
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-100/90 border-t border-slate-200 text-xs gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePause}
            className="p-1.5 rounded bg-white border border-slate-200 text-slate-700"
            title={isPaused ? 'Resume telemetry stream' : 'Pause telemetry stream'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sliders className="w-3 h-3" aria-hidden="true" />
            Sim:
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {SCENARIOS.map((scenario) => {
            const isActive = activeSimulation === scenario.type;
            return (
              <button
                key={scenario.type}
                type="button"
                onClick={() => onSelect(scenario.type)}
                aria-pressed={isActive}
                title={scenario.title}
                className={`px-2 py-1 rounded text-xs shrink-0 ${focusRing} ${
                  isActive
                    ? scenario.activeClass
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {scenario.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-xs shrink-0 bg-white text-slate-700 border border-slate-200"
            title="Reset simulation to baseline vitals"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200"
      aria-label="Anomaly simulation controls"
    >
      <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-medium">
        <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Simulate:</span>
      </div>

      {SCENARIOS.map((scenario) => {
        const Icon = scenario.icon;
        const isActive = activeSimulation === scenario.type;
        return (
          <button
            key={scenario.type}
            type="button"
            onClick={() => onSelect(scenario.type)}
            aria-pressed={isActive}
            title={scenario.title}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${focusRing} ${
              isActive ? scenario.activeClass : scenario.idleClass
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${scenario.iconClass}`} aria-hidden="true" />
            {scenario.label}
            {isActive && <span className="text-[10px] opacity-80">(Active)</span>}
          </button>
        );
      })}

      <div className="h-4 w-px bg-slate-200 mx-0.5" aria-hidden="true" />

      <button
        type="button"
        onClick={onReset}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 ${focusRing}`}
        title="Reset simulation and return to baseline vitals"
      >
        <RotateCcw className="w-3 h-3 text-slate-500" aria-hidden="true" />
        Reset
      </button>
    </div>
  );
}
