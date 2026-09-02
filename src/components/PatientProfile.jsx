import React from 'react';
import { 
  User, 
  Heart, 
  ShieldAlert, 
  Calendar, 
  Activity, 
  FileText, 
  PhoneCall, 
  AlertCircle,
  MapPin,
  Stethoscope,
  Clock
} from 'lucide-react';

export default function PatientProfile() {
  const patient = {
    id: "VG-94021",
    name: "Eleanor Vance",
    age: 68,
    gender: "Female",
    bloodType: "A+",
    room: "ICU Ward 3B • Bed 12",
    admissionDate: "Oct 24, 2026",
    diagnosis: "Post-op Coronary Artery Bypass (Day 3)",
    riskLevel: "Moderate Risk",
    attendingPhysician: "Dr. Marcus Chen, MD",
    specialty: "Cardiovascular Surgery",
    allergies: ["Penicillin", "Sulfa Drugs"],
    emergencyContact: "Thomas Vance (Spouse) - +1 (555) 382-9912"
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-5">
      {/* Patient Header Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] font-bold text-lg shadow-inner">
              EV
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-200" title="Connected & Active" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{patient.name}</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">MRN: #{patient.id}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {patient.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Demographic Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Age/Sex</span>
          <span className="text-xs font-bold text-slate-800">{patient.age}y • {patient.gender[0]}</span>
        </div>
        <div className="border-x border-slate-200">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Blood</span>
          <span className="text-xs font-bold text-[#0F766E]">{patient.bloodType}</span>
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
            <p className="text-[11px] text-slate-500">{patient.specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Known Allergies</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {patient.allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-medium">
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
          <button className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Full Chart
          </button>
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0d655e] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm">
            <PhoneCall className="w-3.5 h-3.5" />
            Page Nurse
          </button>
        </div>
      </div>
    </div>
  );
}
