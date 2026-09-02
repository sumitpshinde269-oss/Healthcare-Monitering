import React, { useState } from 'react';
import { 
  LineChart, 
  Clock, 
  Calendar, 
  Maximize2, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';

export default function TrendChart() {
  const [selectedVital, setSelectedVital] = useState('heartRate');
  const [selectedRange, setSelectedRange] = useState('24h');

  const vitalsOptions = [
    { id: 'heartRate', label: 'Heart Rate', color: '#0F766E', current: '74 BPM' },
    { id: 'spo2', label: 'SpO2 Oxygen', color: '#0284C7', current: '98%' },
    { id: 'bp', label: 'Blood Pressure', color: '#D97706', current: '120/80' },
    { id: 'resp', label: 'Respiration', color: '#8B5CF6', current: '16 rpm' },
  ];

  const ranges = ['1h', '6h', '24h', '7d'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between flex-1">
      {/* Chart Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Telemetry & Trend Analysis</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-ping" />
              Live Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Continuous physiological trend monitoring & forecast</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Time range toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors" title="Filter & Calibrate">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vital Metric Selector Tabs */}
      <div className="flex items-center gap-2 my-3 overflow-x-auto pb-1">
        {vitalsOptions.map((vital) => (
          <button
            key={vital.id}
            onClick={() => setSelectedVital(vital.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedVital === vital.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: selectedVital === vital.id ? '#5EEAD4' : vital.color }} 
            />
            <span>{vital.label}</span>
            <span className={selectedVital === vital.id ? 'text-teal-200 font-bold' : 'text-slate-500'}>
              {vital.current}
            </span>
          </button>
        ))}
      </div>

      {/* Main SVG Telemetry Chart Canvas */}
      <div className="relative w-full h-56 my-2 bg-slate-50/70 rounded-xl border border-slate-200/60 p-3 flex flex-col justify-between overflow-hidden">
        {/* Normal Range Reference Zone */}
        <div className="absolute top-[28%] bottom-[28%] left-10 right-3 bg-teal-500/5 border-y border-teal-500/20 pointer-events-none rounded flex items-center justify-end pr-2">
          <span className="text-[10px] font-semibold text-teal-700/60 bg-teal-100/50 px-1.5 py-0.5 rounded">
            Target Baseline Zone (60-90 BPM)
          </span>
        </div>

        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-3 pointer-events-none">
          <div className="border-b border-slate-200/70 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>120</span>
          </div>
          <div className="border-b border-slate-200/70 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>90</span>
          </div>
          <div className="border-b border-slate-200/70 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>60</span>
          </div>
          <div className="border-b border-slate-200/70 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>30</span>
          </div>
        </div>

        {/* High-Fidelity SVG Waveform Line */}
        <div className="relative w-full h-full pl-8">
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0F766E" stopOpacity="0.28" />
                <stop offset="70%" stopColor="#0F766E" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            <path
              d="M 0,105 
                 C 40,95 70,110 100,85 
                 C 130,60 160,95 200,90 
                 C 240,85 270,60 310,75 
                 C 350,90 380,115 420,70 
                 C 460,25 490,95 530,80 
                 C 565,68 580,72 600,68 
                 L 600,160 L 0,160 Z"
              fill="url(#chartGradient)"
            />

            {/* Main Smooth Curve */}
            <path
              d="M 0,105 
                 C 40,95 70,110 100,85 
                 C 130,60 160,95 200,90 
                 C 240,85 270,60 310,75 
                 C 350,90 380,115 420,70 
                 C 460,25 490,95 530,80 
                 C 565,68 580,72 600,68"
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Data Points */}
            <circle cx="200" cy="90" r="4" fill="#0F766E" className="ring-4 ring-white" />
            <circle cx="420" cy="70" r="4" fill="#0F766E" className="ring-4 ring-white" />
            <circle cx="460" cy="25" r="5" fill="#DC2626" stroke="#ffffff" strokeWidth="2" />
            
            {/* Anomaly Annotation Marker */}
            <g transform="translate(460, 20)">
              <line x1="0" y1="5" x2="0" y2="25" stroke="#DC2626" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          </svg>
        </div>

        {/* X Axis Timestamps */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pl-8 pt-1">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span className="text-[#0F766E] font-bold">Now</span>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Mean (Avg)</span>
          <span className="text-sm font-bold text-slate-800">74 BPM</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Min (24h)</span>
          <span className="text-sm font-bold text-slate-800">58 BPM</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Max Spike</span>
          <span className="text-sm font-bold text-rose-600">114 BPM</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Variability</span>
          <span className="text-sm font-bold text-emerald-600">± 4.2%</span>
        </div>
      </div>
    </div>
  );
}
