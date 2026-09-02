import React from 'react';
import { 
  Heart, 
  Activity, 
  FileText, 
  PhoneCall, 
  AlertCircle, 
  MapPin, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function PatientProfile({ healthStatus = "stable", isLoading = false }) {
  const statusBadges = {
    stable: {
      label: "Stable",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200",
      dotClass: "bg-emerald-500",
      icon: ShieldCheck
    },
    warning: {
      label: "Monitor",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200",
      dotClass: "bg-amber-500",
      icon: AlertTriangle
    },
    critical: {
      label: "Attention Needed",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-300 animate-pulse font-bold",
      dotClass: "bg-rose-600",
      icon: AlertCircle
    }
  };

  const currentBadge = statusBadges[healthStatus] || statusBadges.stable;
  const BadgeIcon = currentBadge.icon;

  const patient = {
    id: "VG-94021",
    name: "Demo Patient",
    age: 68,
    gender: "Female",
    bloodType: "A+",
    room: "ICU Ward 3B • Bed 12",
    admissionDate: "Oct 24, 2026",
    diagnosis: "Post-op Coronary Artery Bypass (Day 3)",
    attendingPhysician: "Dr. Marcus Chen, MD",
    specialty: "Cardiovascular Surgery",
    allergies: ["Penicillin", "Sulfa Drugs"],
    emergencyContact: "Family Contact - +1 (555) 382-9912"
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full skeleton-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="w-32 h-5 rounded skeleton-shimmer" />
            <div className="w-20 h-4 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-16 rounded-xl skeleton-shimmer" />
        <div className="space-y-3">
          <div className="h-4 rounded skeleton-shimmer" />
          <div className="h-4 rounded skeleton-shimmer" />
          <div className="h-4 rounded skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
      {/* Patient Header Card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-[#0F766E]/25 flex items-center justify-center text-[#0F766E] font-bold text-lg shadow-inner">
              DP
            </div>
            <span 
              className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${currentBadge.dotClass} transition-colors duration-300`} 
              title={`Status: ${currentBadge.label}`} 
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{patient.name}</h2>
            <p className="text-xs font-semibold text-slate-500 tracking-wide font-mono">MRN: #{patient.id}</p>
          </div>
        </div>

        {/* Overall Health Status Summary Badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs transition-all duration-300 ${currentBadge.badgeClass}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          {currentBadge.label}
        </span>
      </div>

      {/* Quick Demographic Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center shadow-2xs">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Age/Sex</span>
          <span className="text-xs font-bold text-slate-800 font-mono">{patient.age}y • {patient.gender[0]}</span>
        </div>
        <div className="border-x border-slate-200">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Blood</span>
          <span className="text-xs font-bold text-[#0F766E] font-mono">{patient.bloodType}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Stay</span>
          <span className="text-xs font-bold text-slate-800">Day 3</span>
        </div>
      </div>

      {/* Clinical Details */}
      <div className="space-y-3.5 text-xs">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Location</span>
            <span className="font-medium text-slate-800">{patient.room}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Primary Diagnosis</span>
            <span className="font-medium text-slate-800 leading-relaxed">{patient.diagnosis}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Stethoscope className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Attending Physician</span>
            <span className="font-semibold text-slate-800">{patient.attendingPhysician}</span>
            <p className="text-[11px] text-slate-500 font-normal">{patient.specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Known Allergies</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {patient.allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-medium shadow-2xs">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Admitted</span>
            <span className="font-medium text-slate-700">{patient.admissionDate}</span>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 border border-slate-100">
          <span className="font-semibold text-slate-700 block mb-0.5">Emergency Contact:</span>
          {patient.emergencyContact}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Full Chart
          </button>
          <button className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#0F766E] text-white hover:bg-[#0d655e] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm">
            <PhoneCall className="w-3.5 h-3.5" />
            Page Nurse
          </button>
        </div>
      </div>
    </div>
  );
}
