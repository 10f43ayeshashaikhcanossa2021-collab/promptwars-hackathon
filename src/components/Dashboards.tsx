import React, { useState, useEffect } from "react";
import { UserProfile, Role, Complaint } from "../types";
import { 
  ShieldCheck, 
  User, 
  Building2, 
  LockKeyhole, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Activity, 
  Sliders, 
  QrCode, 
  Download, 
  RefreshCw, 
  HelpCircle,
  FileText,
  Clock,
  ExternalLink,
  Users,
  TrendingUp,
  Cpu,
  Database
} from "lucide-react";

interface DashboardsProps {
  user: UserProfile;
  highContrast: boolean;
  onNavigateToTab: (tab: string) => void;
  addNotification: (msg: string) => void;
}

export const Dashboards: React.FC<DashboardsProps> = ({
  user,
  highContrast,
  onNavigateToTab,
  addNotification
}) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [systemStats, setSystemStats] = useState({
    cpu: 18,
    memory: "1.4 GB / 4.0 GB",
    latency: "45ms",
    dbPool: "12 / 50 Active"
  });

  // Mock document status updates (for Officer desk)
  const [pendingDocs, setPendingDocs] = useState([
    { id: "doc-1", citizen: "Amit Sharma", type: "Aadhaar Card", status: "Pending Verification", date: "2026-07-06" },
    { id: "doc-2", citizen: "Sneha Patil", type: "PAN Card", status: "Pending Verification", date: "2026-07-05" },
    { id: "doc-3", citizen: "Karan Singh", type: "Passport Copy", status: "Pending Verification", date: "2026-07-04" }
  ]);

  // Fetch central datasets
  const fetchDashboardData = async () => {
    try {
      const logRes = await fetch("/api/audit-logs");
      const logs = await logRes.json();
      setAuditLogs(logs);

      const compRes = await fetch("/api/complaints");
      const comps = await compRes.json();
      setComplaints(comps);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Simulate minor server-stat oscillations
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.floor(15 + Math.random() * 8),
        latency: `${Math.floor(40 + Math.random() * 12)}ms`
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyDocument = (docId: string, status: "Approved" | "Rejected") => {
    setPendingDocs(prev => prev.filter(d => d.id !== docId));
    addNotification(`Document was officially marked as ${status}.`);
  };

  const getCitizenCompliancePercentage = () => {
    if (!user.idStatus) return 0;
    const values = Object.values(user.idStatus);
    const verifiedCount = values.filter(v => v === "Verified").length;
    return Math.round((verifiedCount / values.length) * 100);
  };

  // 1. CITIZEN DASHBOARD LAYOUT
  const renderCitizenDashboard = () => {
    const compliancePct = getCitizenCompliancePercentage();
    return (
      <div className="space-y-6 text-left animate-fadeIn">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-[#0B3D91] via-[#0B3D91]/90 to-blue-950 p-6 sm:p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-sm">National Citizen Workspace</span>
            <h2 className="text-xl sm:text-2xl font-display font-black">Jai Hind, {user.fullName}!</h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Your regional e-KYC compliance index stands at <b>{compliancePct}% Verified</b>. Check your digital ID credentials below or matching welfare plans.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab("schemes")}
            className="px-5 py-3 rounded-xl bg-[#FF8C00] hover:bg-orange-600 font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
          >
            Explore Matching Schemes
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ID Credentials Wallet Preview */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50 shadow-sm"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider">Secure e-Gov ID Card</span>
                <QrCode className="w-5 h-5 text-slate-400" />
              </div>

              {/* Holographic identity card badge */}
              <div className="bg-linear-to-br from-[#0B3D91] to-slate-900 text-white p-4 rounded-2xl relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest">Republic of India</span>
                      <h4 className="text-xs font-extrabold">{user.fullName}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-white/20 text-[7px] font-bold rounded-sm uppercase tracking-wider">Citizen ID</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[8px] opacity-90 font-mono">
                    <div>
                      <span className="block text-slate-400 uppercase">State Jurisdiction</span>
                      <span className="font-semibold block">{user.state}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase">Registered Mobile</span>
                      <span className="font-semibold block truncate">+91 {user.mobileNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px]">Last Synced 2m ago</span>
              <button 
                onClick={() => addNotification("ID details exported as secure PDF.")}
                className="text-[#0B3D91] hover:underline font-bold text-[10px] uppercase flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Credentials</span>
              </button>
            </div>
          </div>

          {/* Card 2: Document Verification Statuses */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50 shadow-sm"
          }`}>
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">e-KYC Verification Ledger</span>
              <div className="space-y-2">
                {[
                  { name: "Aadhaar Identity", key: "aadhaar" },
                  { name: "Income Tax PAN", key: "pan" },
                  { name: "Passport Verification", key: "passport" },
                  { name: "Driving License", key: "drivingLicense" }
                ].map((doc) => {
                  const status = user.idStatus ? (user.idStatus as any)[doc.key] : "Unverified";
                  return (
                    <div key={doc.key} className="flex justify-between items-center text-xs bg-slate-50/60 p-2 rounded-xl">
                      <span className="text-slate-600 font-semibold">{doc.name}</span>
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-sm ${
                        status === "Verified" ? "bg-emerald-50 text-emerald-800" :
                        status === "Pending" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => onNavigateToTab("chat")}
                className="w-full py-2.5 bg-slate-50 border hover:bg-slate-100 text-[#0B3D91] hover:text-[#0b3d91]/90 font-bold uppercase rounded-xl text-[10px] tracking-wide text-center"
              >
                Upload Document in AI Bot
              </button>
            </div>
          </div>

          {/* Card 3: Recent Civic Complaints Track */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50 shadow-sm"
          }`}>
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">My Civic Incident Tickets</span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {complaints.length === 0 ? (
                  <div className="text-center p-6 text-[11px] text-slate-400">
                    No active complaint tickets.
                  </div>
                ) : (
                  complaints.slice(0, 3).map((comp) => (
                    <div key={comp.id} className="text-xs border-b pb-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{comp.category}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                          comp.status === "Solved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>{comp.status}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{comp.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[10px]">{complaints.length} Total Complaints</span>
              <button
                onClick={() => onNavigateToTab("complaints")}
                className="text-[#0B3D91] hover:underline font-bold text-[10px] uppercase"
              >
                Track All Timelines
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. GOVERNMENT OFFICER DASHBOARD LAYOUT
  const renderOfficerDashboard = () => {
    return (
      <div className="space-y-6 text-left animate-fadeIn">
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#FF8C00] uppercase tracking-widest bg-orange-950 px-2.5 py-0.5 rounded-sm">Officer Operations HQ</span>
            <h2 className="text-xl font-display font-extrabold">Welcome back, Officer Verma</h2>
            <p className="text-xs text-slate-400">You have <b>{pendingDocs.length} pending documents</b> and <b>{complaints.filter(c => c.status !== "Solved").length} unresolved tickets</b> in your zone.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Pending Citizen Documents Verification desk */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Biometric / Document Auditing Desk</span>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pendingDocs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No pending citizen audits in queue.</div>
              ) : (
                pendingDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-slate-50 border rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">{doc.citizen}</h4>
                        <span className="text-[10px] text-slate-400">{doc.type} • Submitted {doc.date}</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 font-bold text-[8px] uppercase tracking-wider rounded-sm">
                        Pending OCR Verify
                      </span>
                    </div>

                    <div className="flex gap-2 text-[10px] pt-1">
                      <button
                        onClick={() => handleVerifyDocument(doc.id, "Rejected")}
                        className="w-1/2 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold uppercase rounded-lg border border-red-200"
                      >
                        Reject Upload
                      </button>
                      <button
                        onClick={() => handleVerifyDocument(doc.id, "Approved")}
                        className="w-1/2 py-2 bg-[#138808] hover:bg-[#138808]/95 text-white font-bold uppercase rounded-lg shadow-2xs"
                      >
                        Approve Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel 2: Civic Incidents Ticket Timeline Control */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Unassigned District Work Orders</span>
              <button onClick={() => onNavigateToTab("complaints")} className="text-[10px] text-[#0B3D91] uppercase font-bold hover:underline">
                Timelines Portal
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {complaints.filter(c => c.status !== "Solved").map((comp) => (
                <div key={comp.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                  <div className="text-left max-w-xs space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-red-700 font-bold text-[9px] uppercase tracking-wider">{comp.category}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{comp.id}</span>
                    </div>
                    <p className="font-semibold text-slate-700 truncate">{comp.description}</p>
                    <span className="text-[9px] text-slate-400 block">Reported near {comp.location}</span>
                  </div>

                  <button
                    onClick={() => onNavigateToTab("complaints")}
                    className="px-3 py-1.5 bg-[#0B3D91]/5 hover:bg-[#0B3D91]/10 text-[#0B3D91] font-bold rounded-lg text-[10px] uppercase"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. DEPARTMENT ADMIN DASHBOARD LAYOUT
  const renderDeptAdminDashboard = () => {
    return (
      <div className="space-y-6 text-left animate-fadeIn">
        <div className="bg-[#0B3D91] text-white p-6 rounded-3xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-sm">Department Performance Desk</span>
            <h2 className="text-xl font-display font-extrabold">Executive Analytics Desk</h2>
            <p className="text-xs text-slate-300">Evaluating SLA resolution rates, ward dispatch logs, and citizen matching metrics.</p>
          </div>
        </div>

        {/* Dynamic Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Officers", value: "34 Staff", change: "+4 this week", trend: "up" },
            { label: "SLA Compliant", value: "98.1%", change: "Industry standard 95%", trend: "up" },
            { label: "Direct DBT Disbursed", value: "₹4.2 Cr", change: "4,500 Farmers matched", trend: "up" },
            { label: "Response Latency", value: "1.4 Days", change: "Reduced from 4.8 Days", trend: "down" }
          ].map((card, i) => (
            <div key={i} className={`p-4 border rounded-2xl text-left flex flex-col justify-between backdrop-blur-md ${
              highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/40 shadow-xs"
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className="mt-2">
                <span className="text-lg font-bold text-slate-800 block leading-none">{card.value}</span>
                <span className="text-[9px] text-emerald-600 font-semibold block mt-1">{card.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Beautiful high-fidelity SVG analytic charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Welfare Schemes Matching Ratio</span>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time Data Feed</span>
            </div>

            {/* Custom vector bar chart visualization */}
            <div className="space-y-3">
              {[
                { name: "PM-Kisan", count: 48, pct: "w-[48%]", color: "bg-orange-500" },
                { name: "Pradhan Mantri Jan Dhan Yojana", count: 72, pct: "w-[72%]", color: "bg-[#0B3D91]" },
                { name: "Post Matric Scholarship", count: 35, pct: "w-[35%]", color: "bg-purple-600" },
                { name: "Ayushman Bharat", count: 90, pct: "w-[90%]", color: "bg-emerald-600" }
              ].map((bar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700">{bar.name}</span>
                    <span className="text-slate-400 font-mono">{bar.count}% applications matched</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} ${bar.pct} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Incident Category Counts (Ward 4)</span>
            
            {/* Custom visual bento grid values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-2xl">
                <span className="text-[9px] font-bold text-red-700 uppercase block">Road Potholes</span>
                <span className="text-xl font-display font-black text-slate-800 block">45 Filed</span>
                <span className="text-[10px] text-slate-400 block mt-1">SLA Target: 4 Days</span>
              </div>
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <span className="text-[9px] font-bold text-amber-700 uppercase block">Streetlights</span>
                <span className="text-xl font-display font-black text-slate-800 block">18 Filed</span>
                <span className="text-[10px] text-slate-400 block mt-1">SLA Target: 24 Hours</span>
              </div>
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <span className="text-[9px] font-bold text-[#138808] uppercase block">Waste Disposal</span>
                <span className="text-xl font-display font-black text-slate-800 block">29 Filed</span>
                <span className="text-[10px] text-slate-400 block mt-1">SLA Target: 2 Days</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <span className="text-[9px] font-bold text-blue-700 uppercase block">Water Pipe Bursts</span>
                <span className="text-xl font-display font-black text-slate-800 block">12 Filed</span>
                <span className="text-[10px] text-slate-400 block mt-1">SLA Target: 8 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. SUPER ADMIN DASHBOARD LAYOUT
  const renderSuperAdminDashboard = () => {
    return (
      <div className="space-y-6 text-left animate-fadeIn">
        <div className="bg-black text-yellow-400 p-6 rounded-3xl border border-yellow-500 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest bg-yellow-950 px-2 py-0.5 rounded-sm">National Security Sentinel</span>
            <h2 className="text-xl font-display font-extrabold text-white">Central Operations & Security Core</h2>
            <p className="text-xs text-slate-400">Monitoring AES-256 state database pools, e-Gov firewalls, and rate limits.</p>
          </div>
        </div>

        {/* Live Gauges Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Engine Load</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{systemStats.cpu}% active CPU</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl flex items-center space-x-3">
            <Database className="w-5 h-5 text-blue-500" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Server Memory</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{systemStats.memory}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl flex items-center space-x-3">
            <Activity className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">API Latency</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{systemStats.latency}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl flex items-center space-x-3">
            <LockKeyhole className="w-5 h-5 text-red-500" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Database Pool</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{systemStats.dbPool}</span>
            </div>
          </div>
        </div>

        {/* Security Logs Table */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block">Central Security Audit Ledger</span>
            <button onClick={fetchDashboardData} className="p-1 text-slate-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono space-y-2">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Audit Action Tag</th>
                  <th className="pb-2">Trigger Origin IP</th>
                  <th className="pb-2">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60">
                    <td className="py-2.5 text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 font-bold text-slate-300">{log.action}</td>
                    <td className="py-2.5 text-slate-400">{log.details || "System Core Cluster"}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-bold border border-emerald-900 rounded-sm text-[9px] uppercase">
                        SECURED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  switch (user.role) {
    case Role.CITIZEN:
      return renderCitizenDashboard();
    case Role.OFFICER:
      return renderOfficerDashboard();
    case Role.DEPT_ADMIN:
      return renderDeptAdminDashboard();
    case Role.SUPER_ADMIN:
      return renderSuperAdminDashboard();
    default:
      return renderCitizenDashboard();
  }
};
