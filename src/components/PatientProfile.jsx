import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  MapPin, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  User
} from 'lucide-react';

export default function PatientProfile({ healthStatus = "stable", isLoading = false }) {
  const statusBadges = {
    stable: {
      label: "Stable",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck
    },
    warning: {
      label: "Monitoring",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      icon: AlertTriangle
    },
    critical: {
      label: "Attention Required",
      badgeClass: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
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
    diagnosis: "Post-op Coronary Artery Bypass",
    attendingPhysician: "Dr. Marcus Chen, MD",
    specialty: "Cardiovascular Surgery",
    allergies: ["Penicillin", "Sulfa Drugs"]
  };

  if (isLoading) {
    return (
      <div className="surface-card p-5 flex flex-col gap-4" aria-busy="true" aria-label="Loading patient profile">
        <div className="space-y-2">
          <div className="w-32 h-5 rounded skeleton-shimmer" />
          <div className="w-20 h-4 rounded skeleton-shimmer" />
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
    <article className="surface-card p-5 flex flex-col gap-4">
      {/* Patient Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
            <User className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">{patient.name}</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">MRN #{patient.id}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${currentBadge.badgeClass}`}
          role="status"
        >
          <BadgeIcon className="w-3 h-3" aria-hidden="true" />
          {currentBadge.label}
        </span>
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-center" role="group" aria-label="Patient demographics">
        <div>
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Age / Sex</span>
          <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5 block">{patient.age}y · {patient.gender[0]}</span>
        </div>
        <div className="border-x border-slate-200">
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Blood Type</span>
          <span className="text-xs font-semibold text-teal-700 font-mono mt-0.5 block">{patient.bloodType}</span>
        </div>
        <div>
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Location</span>
          <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">Bed 12</span>
        </div>
      </div>

      {/* Clinical Details List */}
      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Ward &amp; Room</span>
            <span className="font-medium text-slate-800">{patient.room}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Primary Diagnosis</span>
            <span className="font-medium text-slate-800 leading-snug">{patient.diagnosis}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Attending Physician</span>
            <span className="font-medium text-slate-800">{patient.attendingPhysician}</span>
            <span className="text-[11px] text-slate-500 block">{patient.specialty}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Known Allergies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.allergies.map((allergy, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded text-[11px] font-medium">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Admission Date</span>
            <span className="font-medium text-slate-700">{patient.admissionDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
