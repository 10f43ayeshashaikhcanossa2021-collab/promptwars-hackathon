import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { UserProfile, GovernmentScheme } from "../types";
import { 
  Award, 
  Search, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Info, 
  SlidersHorizontal,
  Building,
  Coins,
  Check,
  AlertCircle
} from "lucide-react";

interface SchemeMatcherProps {
  user: UserProfile | null;
  highContrast: boolean;
  addNotification: (msg: string) => void;
}

export const SchemeMatcher: React.FC<SchemeMatcherProps> = ({
  user,
  highContrast,
  addNotification
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);

  // Local Form states (initialized with user profile if logged in)
  const [age, setAge] = useState<number>(user ? (new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : 32);
  const [occupation, setOccupation] = useState<string>(user ? user.occupation : "Farmer");
  const [income, setIncome] = useState<number>(user ? user.income : 180000);
  const [gender, setGender] = useState<string>(user ? user.gender : "Male");
  const [stateName, setStateName] = useState<string>(user ? user.state : "Delhi");
  const [isFarmer, setIsFarmer] = useState<boolean>(user ? user.isFarmer : true);
  const [isStudent, setIsStudent] = useState<boolean>(user ? user.isStudent : false);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(user ? user.isSeniorCitizen : false);
  const [isDisabled, setIsDisabled] = useState<boolean>(user ? user.isDisabled : false);
  const [activeTab, setActiveTab] = useState<string>("All");

  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  const triggerMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setExpandedScheme(null);

    try {
      const response = await fetch("/api/recommend-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          occupation,
          state: stateName,
          income,
          gender,
          isFarmer,
          isStudent,
          isSeniorCitizen,
          isDisabled,
          interests: user ? user.interests : []
        })
      });

      if (!response.ok) {
        throw new Error("Failed matching schemes.");
      }

      const data = await response.json();
      setSchemes(data);
      addNotification(`Calculated matches for welfare schemes.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto trigger match on load based on user details if any
  React.useEffect(() => {
    triggerMatch();
  }, [user]);

  const categories = ["All", "Healthcare", "Education", "Agriculture", "Employment", "Finance", "Women Welfare", "Social Welfare"];

  const filteredSchemes = schemes.filter(sch => {
    if (activeTab === "All") return true;
    return sch.category === activeTab;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-4" id="scheme-matcher-module">
      
      {/* LEFT FORM PARAMETERS PANEL (4 columns) */}
      <div className={`lg:col-span-4 p-5 rounded-3xl border text-left flex flex-col justify-between backdrop-blur-md ${
        highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50 shadow-sm"
      }`}>
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-600 animate-pulse" />
              <span>Personal Welfare Matching Survey</span>
            </h2>
            <p className="text-[10px] text-slate-400 leading-normal">
              Edit the parameters below. Smart Bharat AI analyzes direct eligibility to match central and state budgets.
            </p>
          </div>

          <form onSubmit={triggerMatch} className="space-y-3.5 text-xs">
            {/* Age */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Applicant Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Income */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Annual Family Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Gender and State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">State Jurisdiction</label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
            </div>

            {/* Micro Toggles */}
            <div className="space-y-2 p-3 bg-slate-50 border rounded-2xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Qualifying Criteria</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" checked={isFarmer} onChange={(e) => setIsFarmer(e.target.checked)} className="rounded-sm" />
                  <span>Farmer</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} className="rounded-sm" />
                  <span>Student</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" checked={isSeniorCitizen} onChange={(e) => setIsSeniorCitizen(e.target.checked)} className="rounded-sm" />
                  <span>Senior Citizen</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} className="rounded-sm" />
                  <span>Disabled</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-bold uppercase rounded-xl tracking-wider text-[11px] shadow-sm transition-all"
            >
              Recalculate Matches
            </button>
          </form>
        </div>

        {user && (
          <div className={`p-4 rounded-3xl border flex items-start space-x-2.5 text-left backdrop-blur-xs ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-blue-50/40 border-blue-100/40"
          }`}>
            <Info className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#0B3D91] leading-relaxed">
              Profile parameters are synchronized. Changing sliders above overrides your session, helping check other dependents eligibility.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT RESULTS GRID (8 columns) */}
      <div className="lg:col-span-8 space-y-6 text-left">
        
        {/* Category filtering chips */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === cat
                  ? highContrast ? "bg-yellow-400 text-black font-bold" : "bg-[#0B3D91] text-white"
                  : "bg-white/40 border border-white/30 text-slate-500 hover:bg-white/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Schemes Display Panel */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl border"></div>
              ))}
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className={`p-12 text-center text-xs opacity-60 border border-dashed rounded-3xl flex flex-col items-center justify-center space-y-3 backdrop-blur-md ${
              highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/30"
            }`}>
              <AlertCircle className="w-10 h-10 text-slate-400" />
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">No Schemes Matched</span>
                <span className="text-[10px] text-slate-400">Try adjusting your annual income slide or selecting other qualifying indicators.</span>
              </div>
            </div>
          ) : (
            filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                id={`scheme-card-${scheme.id}`}
                className={`p-5 rounded-3xl border transition-all duration-200 backdrop-blur-md ${
                  highContrast
                    ? "bg-black border-yellow-500 text-yellow-400"
                    : "bg-white/60 border-white/40 hover:border-white/80 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-bold text-[9px] uppercase border border-blue-100">
                        {scheme.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{scheme.ministry}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{scheme.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{scheme.description}</p>
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Matched Scheme</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-sm font-bold text-[9px] uppercase tracking-wider block">
                      Direct DBT
                    </span>
                  </div>
                </div>

                {/* Match reason highlighted alert */}
                {scheme.matchReason && (
                  <div className="mt-4 p-3 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-start space-x-2.5">
                    <Award className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs text-left">
                      <span className="font-extrabold text-slate-800 block">Eligibility Verification:</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{scheme.matchReason}</p>
                    </div>
                  </div>
                )}

                {/* Collapsible expanded instructions */}
                {expandedScheme === scheme.id ? (
                  <div className="mt-5 pt-5 border-t space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Welfare Allowances</span>
                        <p className="text-[11px] text-slate-700 font-semibold leading-relaxed p-2.5 bg-slate-50 rounded-xl border">
                          {scheme.benefits}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Documents</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed p-2.5 bg-slate-50 rounded-xl border">
                          {scheme.eligibility}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step-By-Step Application Checklist</span>
                      <div className="space-y-1.5">
                        {scheme.applicationSteps.map((step: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2 text-xs bg-slate-50/40 p-2.5 rounded-xl">
                            <div className="w-4 h-4 rounded-full bg-[#138808]/10 text-[#138808] flex items-center justify-center font-bold text-[9px] shrink-0">
                              {i + 1}
                            </div>
                            <span className="text-slate-600 text-[11px]">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setExpandedScheme(null)}
                        className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-wide"
                      >
                        Hide Details
                      </button>
                      <button
                        onClick={() => alert("Welfare direct e-KYC filing has been initialized using your sandbox credentials.")}
                        className="px-4 py-2 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase rounded-xl tracking-wide shadow-sm"
                      >
                        Apply on Portal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Rolling Applications Cycle</span>
                    <button
                      onClick={() => setExpandedScheme(scheme.id)}
                      className="px-4 py-1.5 bg-[#0B3D91]/5 hover:bg-[#0B3D91]/10 text-[#0B3D91] font-extrabold uppercase rounded-xl text-[10px] flex items-center space-x-1 transition-colors"
                    >
                      <span>Show Application Steps</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
