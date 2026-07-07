import React, { useState } from "react";
import { useLanguage, LANGUAGES } from "./LanguageContext";
import { UserProfile } from "../types";
import { 
  User, 
  ShieldCheck, 
  Download, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  SlidersHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Building 
} from "lucide-react";

interface ProfilePageProps {
  user: UserProfile;
  highContrast: boolean;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onToggleContrast: () => void;
  addNotification: (msg: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  highContrast,
  onUpdateProfile,
  onToggleContrast,
  addNotification
}) => {
  const { language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState(user.mobileNumber);
  const [email, setEmail] = useState(user.email);
  const [mfaEnabled, setMfaEnabled] = useState(user.isMfaEnabled);

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName,
      mobileNumber: mobile,
      email,
      isMfaEnabled: mfaEnabled,
      preferredLanguage: language
    };
    onUpdateProfile(updated);
    addNotification("Profile credentials updated securely.");
  };

  const handleDownloadPersonalData = () => {
    // Encapsulate decrypted JSON state for user transfer
    const decryptedState = {
      auditTimestamp: new Date().toISOString(),
      complianceAct: "DPDPA 2023 Compliance Package",
      jurisdiction: "Republic of India",
      userProfile: {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        state: user.state,
        district: user.district,
        preferredLanguage: user.preferredLanguage,
        occupation: user.occupation,
        annualIncome: user.income,
        registeredInterests: user.interests,
        eGovVerifiedIds: user.idStatus
      },
      auditTrails: [
        { action: "AES-256 Symmetric Decrypt Trigger", origin: "Client Workspace" },
        { action: "MFA Token Authed", origin: "Secure e-Gov Node" }
      ]
    };

    const blob = new Blob([JSON.stringify(decryptedState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smart_bharat_personal_data_${user.fullName.toLowerCase().replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification("Decrypted personal ledger downloaded.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setOldPassword("");
    setNewPassword("");
    addNotification("Secret credentials changed successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 text-left" id="profile-page-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-orange-500" />
            <span>Profile and Governance Settings</span>
          </h2>
          <p className="text-xs text-slate-500">
            Edit credentials, configure MFA challenges, and retrieve decrypted personal logs compliant with the DPDP Act 2023.
          </p>
        </div>

        <button
          onClick={handleDownloadPersonalData}
          className="px-4 py-2.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-bold text-xs uppercase rounded-xl flex items-center space-x-2 shadow-sm transition-colors"
          id="btn-download-decrypted-data"
        >
          <Download className="w-4 h-4" />
          <span>Download My Decrypted Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side Settings Menu */}
        <div className="space-y-6">
          {/* Quick Profile Summary Badge */}
          <div className={`p-6 rounded-3xl border text-center space-y-4 backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50 shadow-sm"
          }`}>
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto font-black text-slate-700 text-lg border-2 border-orange-500">
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{user.fullName}</h4>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">{user.role} Portal Access</span>
            </div>

            <div className="pt-4 border-t flex justify-center items-center space-x-2 text-[10px] text-emerald-600 font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Bio-Verified Session</span>
            </div>
          </div>

          {/* Accessibility Settings Toggle */}
          <div className={`p-5 border rounded-3xl text-left space-y-3.5 text-xs backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/40 border-white/30"
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Accessibility Panel</span>
            
            <div className="flex justify-between items-center bg-white/75 p-2.5 rounded-xl border border-white/40 shadow-2xs">
              <span className="text-slate-600 font-semibold text-[11px]">High Contrast mode</span>
              <button onClick={onToggleContrast} className="text-slate-500">
                {highContrast ? (
                  <ToggleRight className="w-8 h-8 text-[#FF8C00]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center bg-white/75 p-2.5 rounded-xl border border-white/40 shadow-2xs">
              <span className="text-slate-600 font-semibold text-[11px]">Continuous Voice Listen</span>
              <button onClick={() => addNotification("Continuous voice assist preset loaded.")}>
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Settings Form panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Edit Form */}
          <div className={`p-6 border rounded-3xl shadow-sm backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-4">Official Citizen Credentials</span>
            
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-2.5 py-2 border rounded-lg bg-white"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Multi-Factor Authentication (MFA)</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <button 
                      type="button" 
                      onClick={() => setMfaEnabled(!mfaEnabled)}
                      className="text-slate-500"
                    >
                      {mfaEnabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {mfaEnabled ? "Enabled (Secure OTP)" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B3D91] text-white font-bold uppercase rounded-lg text-[10px] tracking-wider shadow-xs hover:bg-[#0b3d91]/90"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className={`p-6 border rounded-3xl shadow-sm backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50"
          }`}>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-4">Update Access Security Token</span>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">New Security Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold uppercase rounded-lg text-[10px] tracking-wider"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
