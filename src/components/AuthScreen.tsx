import React, { useState } from "react";
import { useLanguage, LANGUAGES } from "./LanguageContext";
import { Role, UserProfile } from "../types";
import { 
  ShieldCheck, 
  User, 
  Building, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  Sliders,
  ChevronLeft
} from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
  onClose: () => void;
  highContrast: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onClose,
  highContrast
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [authStep, setAuthStep] = useState<"welcome" | "login" | "signup" | "otp" | "onboarding">("welcome");
  const [selectedRole, setSelectedRole] = useState<Role>(Role.CITIZEN);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup Form States
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [stateName, setStateName] = useState("Delhi");
  const [district, setDistrict] = useState("New Delhi");
  const [isFarmer, setIsFarmer] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [occupation, setOccupation] = useState("Service Employee");
  const [annualIncome, setAnnualIncome] = useState(450000);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Captcha State
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaCode, setCaptchaCode] = useState("B4H9");

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [otpSentMessage, setOtpSentMessage] = useState("");

  // Onboarding States
  const [onboardingIndex, setOnboardingIndex] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Generated Profile
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);

  const statesInIndia = [
    "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", "Haryana", 
    "Karnataka", "Kerala", "Maharashtra", "Punjab", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
  ];

  const districtsOfDelhi = ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "Dwarka", "Rohini"];

  const interestsList = [
    "Healthcare", "Education", "Agriculture", "Employment", "Finance", 
    "Women Welfare", "Social Welfare", "Senior Citizens", "Housing", "MSME Loans"
  ];

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (authStep === "login") {
      if (!loginEmail || !loginPassword) {
        setLoginError("Please enter your email and password.");
        return;
      }
      setOtpSentMessage(`A secure authentication OTP has been sent to the mobile number registered with ${loginEmail}.`);
    } else {
      if (!fullName || !signupEmail || !mobileNumber || !signupPassword) {
        setLoginError("Please fill out all required fields.");
        return;
      }
      if (captchaAnswer.toUpperCase() !== captchaCode) {
        setLoginError("Incorrect Captcha verification. Please try again.");
        return;
      }
      if (!acceptTerms) {
        setLoginError("You must accept the terms & privacy policy to proceed.");
        return;
      }
      setOtpSentMessage(`OTP sent to verification line +91 ${mobileNumber}`);
    }
    setLoginError("");
    setAuthStep("otp");
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "123456" && otpCode !== "1234") {
      setLoginError("Invalid verification code. Use sandbox code 123456.");
      return;
    }

    setLoginError("");
    
    // Construct standard profiles based on selection
    if (authStep === "otp" && loginEmail) {
      // Default Logins
      let emailLower = loginEmail.toLowerCase();
      let determinedRole = selectedRole;
      let name = "Amit Verma";

      if (emailLower.includes("officer")) {
        determinedRole = Role.OFFICER;
        name = "Suresh Verma (PWD Officer)";
      } else if (emailLower.includes("admin")) {
        determinedRole = Role.DEPT_ADMIN;
        name = "Meenakshi Sen (Municipal Admin)";
      } else if (emailLower.includes("super")) {
        determinedRole = Role.SUPER_ADMIN;
        name = "General Sentinel (NIC Super Admin)";
      }

      const verifiedUser: UserProfile = {
        fullName: name,
        email: loginEmail,
        mobileNumber: "9876543210",
        role: determinedRole,
        dateOfBirth: "1988-06-15",
        gender: "Male",
        state: "Delhi",
        district: "New Delhi",
        preferredLanguage: "en",
        interests: ["Healthcare", "Employment"],
        occupation: "Municipal Officer",
        income: 1200000,
        isFarmer: false,
        isStudent: false,
        isSeniorCitizen: false,
        isDisabled: false,
        isMfaEnabled: true,
        idStatus: {
          aadhaar: "Verified",
          pan: "Verified",
          passport: "Verified",
          drivingLicense: "Verified"
        }
      };
      
      onAuthSuccess(verifiedUser);
    } else {
      // New Signup Profile - triggers Onboarding!
      const newUser: UserProfile = {
        fullName: fullName,
        email: signupEmail,
        mobileNumber: mobileNumber,
        role: selectedRole,
        dateOfBirth: dob || "1996-05-10",
        gender: gender,
        state: stateName,
        district: district,
        preferredLanguage: language,
        interests: [],
        occupation: occupation,
        income: annualIncome,
        isFarmer: isFarmer,
        isStudent: isStudent,
        isSeniorCitizen: isSeniorCitizen,
        isDisabled: isDisabled,
        isMfaEnabled: true,
        idStatus: {
          aadhaar: "Pending",
          pan: "Unverified",
          passport: "Unverified",
          drivingLicense: "Unverified"
        }
      };
      setTempProfile(newUser);
      setAuthStep("onboarding");
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingIndex < 3) {
      setOnboardingIndex(onboardingIndex + 1);
    } else {
      if (tempProfile) {
        const completedProfile: UserProfile = {
          ...tempProfile,
          interests: selectedInterests,
          preferredLanguage: language
        };
        onAuthSuccess(completedProfile);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const getPasswordStrength = () => {
    if (signupPassword.length === 0) return { label: "", color: "bg-slate-200", width: "w-0" };
    if (signupPassword.length < 5) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (signupPassword.length < 8) return { label: "Moderate", color: "bg-amber-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" id="auth-screen">
      
      {/* LEFT SIDE: GOVT BLUE AND SAFFRON ILLUST */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B3D91] via-[#092d6e] to-black text-white p-12 flex-col justify-between relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="space-y-4 text-left relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border border-yellow-400 flex items-center justify-center bg-white/10">
              <span className="font-serif font-bold text-yellow-400 text-xs">सत्य</span>
            </div>
            <span className="font-display font-extrabold text-xl uppercase tracking-wider text-yellow-400">
              SMART BHARAT AI
            </span>
          </div>
          <p className="text-slate-300 text-xs uppercase tracking-widest font-mono">National Citizen Operations Desk</p>
        </div>

        <div className="space-y-6 text-left relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-black leading-tight text-white">
            "One Nation.<br/>One AI Companion."
          </h2>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            Experience next-generation governance powered by secure artificial intelligence. Complete biometric authentication placeholders, direct welfare analysis, and instant multilingual support.
          </p>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
              <LockKeyhole className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">DPDPA 2023 Compliant</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-left relative z-10 flex justify-between items-center">
          <span>National Informatics Centre (NIC) Mock Sandbox</span>
          <span>Build v2.4.0</span>
        </div>
      </div>

      {/* RIGHT SIDE: AUTHENTICATION CONTAINER CARD */}
      <div className={`lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative ${
        highContrast ? "bg-black text-yellow-400" : "bg-transparent"
      }`}>
        
        <div className={`w-full max-w-lg p-8 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
          highContrast 
            ? "bg-black border-yellow-500 shadow-none" 
            : "bg-white/60 border-white/50 shadow-2xl"
        }`}>
          
          {/* Header with quick close */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold tracking-widest text-[#0B3D91] uppercase">Secure Login Portal</span>
            <button 
              onClick={onClose} 
              className="text-xs text-slate-400 hover:text-slate-800 font-semibold"
              id="auth-close-btn"
            >
              Cancel
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* 1. WELCOME SCREEN STATE */}
          {authStep === "welcome" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
                  Welcome to Smart Bharat AI
                </h3>
                <p className="text-xs text-slate-500">
                  Select your profile role pathway to begin utilizing India's intelligent companion dashboard.
                </p>
              </div>

              {/* Role Selection Grid */}
              <div className="space-y-3">
                {[
                  { id: Role.CITIZEN, icon: User, label: "Citizen", desc: "Access services, apply for schemes, and report civic potholes/garbage." },
                  { id: Role.OFFICER, icon: Building, label: "Government Officer", desc: "Verify citizen documents and update active civic complaint timelines." },
                  { id: Role.DEPT_ADMIN, icon: Sliders, label: "Department Admin", desc: "Monitor officer resolution times and run AI analytic performance checks." },
                  { id: Role.SUPER_ADMIN, icon: ShieldAlert, label: "Super Admin", desc: "Audit national cybersecurity logs, rate limiting metrics, and system status." }
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      id={`role-btn-${role.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all backdrop-blur-xs ${
                        selectedRole === role.id
                          ? highContrast 
                            ? "border-yellow-400 bg-yellow-950/40" 
                            : "border-[#0B3D91] bg-white/70 shadow-xs"
                          : "border-white/20 hover:bg-white/40 bg-white/30"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        selectedRole === role.id ? "bg-[#0B3D91] text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-800 block">{role.label}</span>
                        <span className="text-[10px] text-slate-500 leading-normal block">{role.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setAuthStep("login")}
                  id="welcome-btn-login"
                  className="w-full py-3.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1"
                >
                  <span>Authenticate Session</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAuthStep("signup")}
                  id="welcome-btn-signup"
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 flex items-center justify-center"
                >
                  Create New Account
                </button>
              </div>
            </div>
          )}

          {/* 2. LOGIN FORM */}
          {authStep === "login" && (
            <form onSubmit={handleSendOTP} className="space-y-5 text-left animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-extrabold text-slate-900">Authenticate Portal Login</h3>
                <p className="text-[11px] text-slate-400">Selected Role: <span className="font-bold text-[#0B3D91]">{selectedRole}</span></p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="citizen@bharat.gov.in"
                      id="login-email-input"
                      className="w-full px-4 py-3 pl-10 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Secret Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      id="login-password-input"
                      className="w-full px-4 py-3 pl-10 pr-10 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <label className="flex items-center space-x-1.5 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="rounded-sm" defaultChecked />
                  <span>Remember my device</span>
                </label>
                <button type="button" className="text-[#0B3D91] hover:underline font-semibold">Forgot Password?</button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  className="w-full py-3.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1"
                >
                  <span>Request Login OTP</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-widest">Or Sandbox Pathways</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <button 
                    type="button" 
                    onClick={() => {
                      setLoginEmail("citizen@bharat.gov.in");
                      setLoginPassword("password");
                      setSelectedRole(Role.CITIZEN);
                    }}
                    className="py-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-slate-700 font-semibold text-center"
                  >
                    Guest Citizen
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLoginEmail("officer.verma@pwd.gov.in");
                      setLoginPassword("password");
                      setSelectedRole(Role.OFFICER);
                    }}
                    className="py-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-slate-700 font-semibold text-center"
                  >
                    PWD Officer
                  </button>
                </div>

                <div className="text-center text-xs text-slate-500 mt-2">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setAuthStep("signup")} className="text-[#0B3D91] font-bold hover:underline">
                    Create Account
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 3. SIGNUP FORM */}
          {authStep === "signup" && (
            <form onSubmit={handleSendOTP} className="space-y-4 text-left max-h-[550px] overflow-y-auto pr-1 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-extrabold text-slate-900">Create Citizen Credentials</h3>
                <p className="text-[11px] text-slate-400">Fill in your official Aadhaar matching credentials below.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name (As on Aadhaar)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ayesha Shaikh"
                      id="signup-name-input"
                      className="w-full px-4 py-2.5 pl-10 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Email and Mobile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@email.com"
                      id="signup-email-input"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="9876543210"
                      id="signup-mobile-input"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                  </div>
                </div>

                {/* Password and Dob Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 chars"
                      id="signup-password-input"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      id="signup-dob-input"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                  </div>
                </div>

                {/* Password strength visualization */}
                {signupPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-bold text-slate-700">{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                    </div>
                  </div>
                )}

                {/* Demo occupation/income filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Occupation</label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    >
                      <option value="Farmer">Farmer / Agriculturist</option>
                      <option value="Student">Student / Academician</option>
                      <option value="Business Owner">MSME Business Owner</option>
                      <option value="Service Employee">Salaried Service Employee</option>
                      <option value="Retired">Retired / Pensioner</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Annual Income (₹)</label>
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                    />
                  </div>
                </div>

                {/* Micro toggles */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold py-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="checkbox" checked={isFarmer} onChange={(e) => setIsFarmer(e.target.checked)} className="rounded-sm" />
                    <span>I am a Farmer</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} className="rounded-sm" />
                    <span>I am a Student</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="checkbox" checked={isSeniorCitizen} onChange={(e) => setIsSeniorCitizen(e.target.checked)} className="rounded-sm" />
                    <span>I am a Senior Citizen</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="checkbox" checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} className="rounded-sm" />
                    <span>I have a Disability</span>
                  </label>
                </div>

                {/* Interactive Captcha */}
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Security Captcha</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-slate-900 text-yellow-400 font-mono font-bold tracking-widest text-sm rounded-md select-none line-through decoration-red-500 decoration-2">
                        {captchaCode}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setCaptchaCode(Math.random().toString(36).substring(2, 6).toUpperCase())}
                        className="text-[10px] text-[#0B3D91] font-semibold hover:underline"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-24 px-2 py-1.5 text-xs text-center uppercase border border-slate-200 rounded-md"
                  />
                </div>

                <label className="flex items-start space-x-2 text-[10px] text-slate-500 cursor-pointer py-1">
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="rounded-sm mt-0.5" />
                  <span>I agree to the National Data DPDP Act guidelines and authorise Smart Bharat AI to access my verified mock DigiLocker sandbox credentials.</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Verify via Mobile OTP
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 mt-2">
                Already have an account?{" "}
                <button type="button" onClick={() => setAuthStep("login")} className="text-[#0B3D91] font-bold hover:underline">
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* 4. OTP CHALLENGE */}
          {authStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center">
                  <LockKeyhole className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-display font-extrabold text-slate-900">OTP Security Challenge</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  {otpSentMessage}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3.5 text-center font-mono font-bold text-lg tracking-widest rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">For sandbox testing, enter code <b>123456</b> or <b>1234</b>.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Authenticate Token
              </button>

              <div className="flex justify-between items-center text-xs pt-1">
                <button type="button" onClick={() => setAuthStep("login")} className="text-slate-400 hover:text-slate-600 flex items-center space-x-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button type="button" onClick={() => setOtpCode("123456")} className="text-[#0B3D91] font-bold hover:underline">
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          {/* 5. ONBOARDING SEQUENCE FOR NEW REGISTERED USERS */}
          {authStep === "onboarding" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">Citizen Personalization Onboarding</h3>
                  <p className="text-[10px] text-slate-400">Step {onboardingIndex} of 3</p>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-6 h-1.5 rounded-full ${s <= onboardingIndex ? "bg-[#0B3D91]" : "bg-slate-100"}`}></div>
                  ))}
                </div>
              </div>

              {/* Step 1: preferred language */}
              {onboardingIndex === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Select Your Preferred Language</label>
                    <p className="text-[10px] text-slate-400">AI speech synthesizers, circulars, and chatbot matching will respond in this selection.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`p-3 rounded-xl border text-xs text-left flex justify-between items-center ${
                          language === lang.code
                            ? "border-[#0B3D91] bg-[#0B3D91]/5 font-bold"
                            : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="opacity-50 text-[10px] font-normal">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Regional Location */}
              {onboardingIndex === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Verify Regional Jurisdiction</label>
                    <p className="text-[10px] text-slate-400">Welfare schemes differ based on your home state. Enter matching records.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Home State</label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                      >
                        {statesInIndia.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">District Zone</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                      >
                        {districtsOfDelhi.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Interest Selection */}
              {onboardingIndex === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Choose Interests & Focus Areas</label>
                    <p className="text-[10px] text-slate-400">Get alerts, deadline notices, and automatic recommendations focused on these tags.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {interestsList.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl border text-xs text-left flex justify-between items-center transition-all ${
                          selectedInterests.includes(interest)
                            ? "border-[#138808] bg-[#138808]/5 font-bold text-[#138808]"
                            : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <span>{interest}</span>
                        {selectedInterests.includes(interest) && <Check className="w-3.5 h-3.5 text-[#138808]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex space-x-3">
                {onboardingIndex > 1 && (
                  <button
                    onClick={() => setOnboardingIndex(onboardingIndex - 1)}
                    className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleOnboardingNext}
                  className={`py-3 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase rounded-xl transition-all ${
                    onboardingIndex > 1 ? "w-2/3" : "w-full"
                  }`}
                >
                  {onboardingIndex === 3 ? "Complete & Launch Portal" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Secure indicator footer badges */}
          <div className="mt-6 pt-4 border-t border-slate-100/60 flex justify-center items-center space-x-6 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL Secured Portal</span>
            </span>
            <span className="flex items-center space-x-1">
              <LockKeyhole className="w-3.5 h-3.5 text-blue-800" />
              <span>Identity Encrypted (AES-256)</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
