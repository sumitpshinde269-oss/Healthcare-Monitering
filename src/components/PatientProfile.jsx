import React from 'react';
import { 
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
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dotClass: "bg-emerald-500",
      icon: ShieldCheck
    },
    warning: {
      label: "Monitor",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      dotClass: "bg-amber-500",
      icon: AlertTriangle
    },
    critical: {
      label: "Attention Needed",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-200 animate-pulse font-bold",
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
      <div className="surface-card p-5 sm:p-6 flex flex-col gap-5" aria-busy="true" aria-label="Loading patient profile">
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
    <article className="surface-card p-5 sm:p-6 flex flex-col gap-5 group">
      {/* Patient Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/80 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] font-bold text-lg shadow-inner transition-transform duration-300 group-hover:scale-[1.03]">
              DP
            </div>
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${currentBadge.dotClass} transition-colors duration-300`} 
              title={`Status: ${currentBadge.label}`}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-snug truncate">{patient.name}</h2>
            <p className="text-xs font-medium text-slate-500 tracking-wide font-mono mt-0.5">MRN #{patient.id}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 transition-all duration-300 ${currentBadge.badgeClass}`}
          role="status"
        >
          <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />
          {currentBadge.label}
        </span>
      </div>

      {/* Quick Demographic Grid */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50/90 rounded-xl border border-slate-100/90" role="group" aria-label="Patient demographics">
        <div className="text-center py-2.5 px-1 rounded-lg transition-colors hover:bg-white">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.06em]">Age/Sex</span>
          <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{patient.age}y · {patient.gender[0]}</span>
        </div>
        <div className="text-center py-2.5 px-1 rounded-lg border-x border-slate-200/70 transition-colors hover:bg-white">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.06em]">Blood</span>
          <span className="text-xs font-bold text-[#0F766E] font-mono mt-0.5 block">{patient.bloodType}</span>
        </div>
        <div className="text-center py-2.5 px-1 rounded-lg transition-colors hover:bg-white">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.06em]">Stay</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5 block">Day 3</span>
        </div>
      </div>

      {/* Clinical Details */}
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E] shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.05em]">Location</span>
            <span className="font-medium text-slate-800 text-[13px] leading-snug">{patient.room}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E] shrink-0 mt-0.5">
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.05em]">Primary Diagnosis</span>
            <span className="font-medium text-slate-800 text-[13px] leading-relaxed">{patient.diagnosis}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E] shrink-0 mt-0.5">
            <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.05em]">Attending Physician</span>
            <span className="font-semibold text-slate-800 text-[13px]">{patient.attendingPhysician}</span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{patient.specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 shrink-0 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.05em]">Known Allergies</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {patient.allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-md text-[11px] font-semibold transition-colors hover:bg-rose-100">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-[0.05em]">Admitted</span>
            <span className="font-medium text-slate-700 text-[13px]">{patient.admissionDate}</span>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Actions */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="bg-slate-50/90 p-3 rounded-xl text-[11px] text-slate-600 border border-slate-100 leading-relaxed">
          <span className="font-semibold text-slate-700 block mb-0.5 text-[10px] uppercase tracking-[0.05em]">Emergency Contact</span>
          {patient.emergencyContact}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Full Chart
          </button>
          <button
            type="button"
            className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-[#0F766E] text-white hover:bg-[#0d655e] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/50 focus-visible:ring-offset-2"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            Page Nurse
          </button>
        </div>
      </div>
    </article>
  );
}
