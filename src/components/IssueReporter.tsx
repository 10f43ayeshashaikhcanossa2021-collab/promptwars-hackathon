import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { UserProfile, Complaint } from "../types";
import { 
  AlertOctagon, 
  Upload, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ShieldAlert, 
  ChevronRight, 
  Building2, 
  User, 
  FileText, 
  Camera,
  Info
} from "lucide-react";

interface IssueReporterProps {
  user: UserProfile | null;
  highContrast: boolean;
  addNotification: (msg: string) => void;
}

export const IssueReporter: React.FC<IssueReporterProps> = ({
  user,
  highContrast,
  addNotification
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Form States
  const [category, setCategory] = useState("Road Damage / Potholes");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState(user ? `${user.district}, ${user.state}` : "Connaught Place, New Delhi");
  const [citizenName, setCitizenName] = useState(user ? user.fullName : "Anon Citizen");
  const [citizenPhone, setCitizenPhone] = useState(user ? user.mobileNumber : "9876543210");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState("");

  // Officer Update States
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("In-Progress");
  const [officerNote, setOfficerNote] = useState("");

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints");
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle local photo base64 loader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedPhoto(reader.result as string);
      addNotification("Civic photo attached.");
    };
    reader.readAsDataURL(file);
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          location: locationName,
          citizenName,
          citizenPhone,
          photoData: attachedPhoto
        })
      });

      if (!response.ok) throw new Error("Failed reporting civic issue.");

      await response.json();
      addNotification("Civic complaint filed in official ledger.");
      setDescription("");
      setAttachedPhoto(null);
      setAttachedPhotoName("");
      fetchComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Officer status updater
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    try {
      const response = await fetch("/api/update-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedComplaintId,
          status: newStatus,
          officerName: user ? user.fullName : "Suresh Verma (PWD)",
          comment: officerNote || `Timeline modified to ${newStatus}`
        })
      });

      if (!response.ok) throw new Error("Timeline update failed.");

      addNotification(`Complaint ticket status updated to ${newStatus}.`);
      setOfficerNote("");
      setSelectedComplaintId(null);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const isOfficerOrAdmin = user && (user.role === "Officer" || user.role === "Dept Admin" || user.role === "Super Admin");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-4" id="issue-reporter-module">
      
      {/* LEFT COLUMN: COMPLAINT FILING FORM (Citizen View) */}
      <div className="lg:col-span-5 space-y-6">
        <div className={`p-5 rounded-3xl border text-left backdrop-blur-md ${
          highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50 shadow-sm"
        }`}>
          <div className="space-y-1 mb-4">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Report Civic Hazard</span>
            </h2>
            <p className="text-[10px] text-slate-400 leading-normal">
              File local issues directly. The AI auto-determines ward routing and estimates resolution targets instantly.
            </p>
          </div>

          <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Hazard Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-xs"
              >
                <option value="Road Damage / Potholes">Road Damage / Potholes</option>
                <option value="Garbage Pile-up">Garbage Pile-up</option>
                <option value="Streetlight Defect">Streetlight Defect</option>
                <option value="Water Pipe Leakage">Water Leakage / Pipe Burst</option>
                <option value="Encroachment / Public Land">Encroachment / Public Land</option>
                <option value="Animal Rescue / Stray Hazard">Animal Rescue / Stray Hazard</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Description (include landmarks)</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deep potholes near the Sector 4 crossing block the left lane. Please patch."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Location Address / Landmark</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Connaught Place, New Delhi"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0B3D91]"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Citizen Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Citizen Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</label>
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Photo upload field */}
            <div className={`p-4 border rounded-2xl text-center space-y-2 backdrop-blur-xs ${highContrast ? "bg-black border-yellow-500" : "bg-white/40 border-white/40"}`}>
              <Camera className="w-6 h-6 text-slate-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-semibold">Snap / Upload Hazard Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                id="hazard-photo-uploader"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("hazard-photo-uploader")?.click()}
                className="px-3.5 py-1.5 bg-white border rounded-lg text-[10px] font-bold text-slate-700 uppercase"
              >
                Select Image
              </button>
              {attachedPhoto && (
                <div className="text-[10px] font-semibold text-emerald-600 block truncate">
                  ✔ {attachedPhotoName || "Photo Attached"}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-xl tracking-wider text-[11px] transition-all shadow-xs"
            >
              {loading ? "Filing in National Ledger..." : "File Official Complaint"}
            </button>
          </form>
        </div>

        {/* Officer Action Overlay Portal Form */}
        {selectedComplaintId && isOfficerOrAdmin && (
          <div className={`p-5 rounded-3xl border text-left space-y-4 animate-scaleUp backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-orange-50/70 border-orange-200/70 shadow-md"
          }`}>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded-sm">Officer Console</span>
              <h3 className="text-xs font-extrabold text-slate-800">Resolve Complaint Ticket</h3>
              <p className="text-[10px] text-slate-400">Updating Ticket ID: <b>{selectedComplaintId}</b></p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Set Status Transition</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white"
                >
                  <option value="Assigned">Assigned (Officer Assigned)</option>
                  <option value="In-Progress">In-Progress (Patching/Refurbishing)</option>
                  <option value="Solved">Solved (Completed Verification)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Officer Audit Notes / Remarks</label>
                <textarea
                  required
                  rows={2}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="PWD task force dispatched with cold-mix asphalt. Solved potholes."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="w-1/3 py-2 border rounded-lg font-bold text-slate-500 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-slate-900 text-white font-bold rounded-lg uppercase"
                >
                  Submit Status Check
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: REGISTERED LEDGER COMPLAINTS LIST WITH TIMELINES */}
      <div className="lg:col-span-7 space-y-4">
        
        <div className="flex justify-between items-center text-left pb-1">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">National Ledger</span>
            <h2 className="text-sm font-extrabold text-slate-800">Track Complaint Timelines</h2>
          </div>
          <button 
            onClick={fetchComplaints} 
            className="text-[10px] text-[#0B3D91] hover:underline font-bold uppercase"
          >
            Refresh Ledger
          </button>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className={`p-12 text-center text-xs opacity-60 border border-dashed rounded-3xl flex flex-col items-center justify-center space-y-2 backdrop-blur-md ${
              highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/30"
            }`}>
              <Building2 className="w-8 h-8 text-slate-400" />
              <span>No complaints filed in this district sandbox yet.</span>
            </div>
          ) : (
            complaints.map((comp) => (
              <div
                key={comp.id}
                id={`complaint-card-${comp.id}`}
                className={`p-5 rounded-3xl border text-left space-y-4 transition-all backdrop-blur-md ${
                  highContrast
                    ? "bg-black border-yellow-500 text-yellow-400"
                    : selectedComplaintId === comp.id
                    ? "bg-orange-50/40 border-orange-200 shadow-md"
                    : "bg-white/60 border-white/40 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-sm bg-red-50 text-red-700 font-bold text-[9px] uppercase border border-red-100">
                        {comp.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{comp.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">{comp.description}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-sm font-bold text-[9px] uppercase tracking-wider ${
                    comp.status === "Solved" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                    comp.status === "In-Progress" ? "bg-blue-50 text-blue-800 border border-blue-100" :
                    "bg-orange-50 text-orange-800 border border-orange-100"
                  }`}>
                    {comp.status}
                  </span>
                </div>

                {/* Technical timeline indicators */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] text-center border-t border-slate-100">
                  {[
                    { label: "Filed", active: true },
                    { label: "Assigned", active: comp.status === "Assigned" || comp.status === "In-Progress" || comp.status === "Solved" },
                    { label: "In-Progress", active: comp.status === "In-Progress" || comp.status === "Solved" },
                    { label: "Solved", active: comp.status === "Solved" }
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className={`h-1.5 rounded-full ${step.active ? "bg-[#138808]" : "bg-slate-100"}`}></div>
                      <span className={`font-semibold ${step.active ? "text-slate-800 font-bold" : "text-slate-400"}`}>{step.label}</span>
                    </div>
                  ))}
                </div>

                {/* Additional audit notes from officer */}
                <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Location Ward</span>
                    <span className="font-semibold text-slate-700 block truncate">{comp.location}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Assigned Agency</span>
                    <span className="font-semibold text-slate-700 block truncate">{comp.assignedDepartment || "District Municipal PWD"}</span>
                  </div>
                </div>

                {comp.updates && comp.updates.length > 0 && (
                  <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Audit History Logs:</span>
                    {comp.updates.map((upd: any, idx: number) => (
                      <div key={idx} className="text-[10px] leading-relaxed text-slate-500">
                        <b>{upd.timestamp}</b> - {upd.comment} (by {upd.officer})
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons (Visible to Officers) */}
                {isOfficerOrAdmin && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedComplaintId(comp.id);
                        setNewStatus(comp.status);
                      }}
                      className="px-4 py-1.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-extrabold uppercase rounded-xl text-[10px]"
                    >
                      Update Timelines
                    </button>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
