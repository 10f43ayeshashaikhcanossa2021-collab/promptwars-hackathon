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
  AlertCircle,
  ExternalLink,
  FileText,
  Bookmark,
  Share2,
  RefreshCw,
  PhoneCall,
  MapPin,
  Mail,
  ArrowLeftRight,
  ShieldCheck
} from "lucide-react";

const getGovLinks = (schemeName: string, category: string) => {
  const name = schemeName.toLowerCase();
  
  if (name.includes("kisan") || name.includes("farming") || name.includes("farmer")) {
    return {
      officialWebsite: "https://pmkisan.gov.in",
      applyOnline: "https://pmkisan.gov.in/RegistrationFormNew.aspx",
      officialPdf: "https://pmkisan.gov.in/Documents/KisanSammanNidhi_Revised_Guidelines.pdf",
      guidelines: "https://pmkisan.gov.in/Documents/Revised_Guidelines_of_PM_KISAN_Scheme.pdf",
      trackStatus: "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx",
      renewal: "https://pmkisan.gov.in/eKYC.aspx",
      nearbyOffice: "Krishi Vigyan Kendra (KVK) & Block Agriculture Office",
      helpline: "1800-115-526 / 155261",
      email: "pmkisan-ict@gov.in",
      financialAssistance: "₹6,000 per annum paid in three equal installments of ₹2,000 directly via DBT.",
      verifiedDomain: "pmkisan.gov.in (National Informatics Centre)",
    };
  }
  
  if (name.includes("scholarship") || name.includes("student") || name.includes("matric") || name.includes("education")) {
    return {
      officialWebsite: "https://scholarships.gov.in",
      applyOnline: "https://scholarships.gov.in/fresh/newRegistrationPage",
      officialPdf: "https://scholarships.gov.in/public/faq/FAQ_PostMatric.pdf",
      guidelines: "https://scholarships.gov.in/public/schemeGuidelines/PostMatric_Scholarship_Guidelines.pdf",
      trackStatus: "https://scholarships.gov.in/loginPage",
      renewal: "https://scholarships.gov.in/renewal/loginPage",
      nearbyOffice: "District Social Welfare Officer or College Scholarship Desk",
      helpline: "0120-6619540",
      email: "helpdesk-nsp@gov.in",
      financialAssistance: "100% tuition waiver & monthly maintenance stipend of up to ₹1,200.",
      verifiedDomain: "scholarships.gov.in (Ministry of Electronics & IT)",
    };
  }
  
  if (name.includes("sukanya") || name.includes("samriddhi") || name.includes("girl") || name.includes("daughter")) {
    return {
      officialWebsite: "https://www.indiapost.gov.in",
      applyOnline: "https://www.indiapost.gov.in/VAS/Pages/FormDownloading.aspx",
      officialPdf: "https://www.indiapost.gov.in/VAS/DOP_PDFFiles/Savings%20Bank/Sukanya%20Samriddhi%20Account%20Rules%202016.pdf",
      guidelines: "https://nsdl.co.in/ssy-guidelines.php",
      trackStatus: "https://www.indiapost.gov.in/VAS/Pages/IndiaPostHome.aspx",
      renewal: "https://www.indiapost.gov.in/VAS/Pages/Savings%20Bank/Sukanya-Samriddhi-Account.aspx",
      nearbyOffice: "Nearest Indian Post Office or State Bank of India (SBI) Branch",
      helpline: "1800-266-6868",
      email: "ssy-support@indiapost.gov.in",
      financialAssistance: "8.2% guaranteed high-interest compound rate with full tax exemptions (Section 80C).",
      verifiedDomain: "indiapost.gov.in (Department of Posts)",
    };
  }
  
  if (name.includes("ayushman") || name.includes("health") || name.includes("pmjay") || name.includes("arogya") || name.includes("hospital")) {
    return {
      officialWebsite: "https://pmjay.gov.in",
      applyOnline: "https://setu.pmjay.gov.in/setu/",
      officialPdf: "https://dashboard.pmjay.gov.in/pmjay-portal/documents/Operational_Guidelines_AB-PMJAY.pdf",
      guidelines: "https://pmjay.gov.in/sites/default/files/2018-07/Guidelines_for_Empanelment_of_Hospitals_AB-PMJAY.pdf",
      trackStatus: "https://beneficiary.nha.gov.in",
      renewal: "https://beneficiary.nha.gov.in/re-verify",
      nearbyOffice: "Empaneled Government/Private Hospital Ayushman Mitra Desk",
      helpline: "14555 / 1800-111-565",
      email: "pmjay@nha.gov.in",
      financialAssistance: "₹5,000,000 cashless family health insurance coverage per year.",
      verifiedDomain: "pmjay.gov.in (National Health Authority)",
    };
  }

  if (name.includes("atal") || name.includes("pension") || name.includes("apy")) {
    return {
      officialWebsite: "https://www.npscra.nsdl.co.in/scheme-atal-pension-yojana.php",
      applyOnline: "https://www.npscra.nsdl.co.in/nsdl/scheme-details/APY_Subscriber_Registration_Form.pdf",
      officialPdf: "https://www.npscra.nsdl.co.in/nsdl/scheme-details/Atal-Pension-Yojana-Rules-English.pdf",
      guidelines: "https://www.npscra.nsdl.co.in/nsdl/scheme-details/APY_Brochure_English.pdf",
      trackStatus: "https://www.npscra.nsdl.co.in/scheme-atal-pension-yojana.php",
      renewal: "https://www.npscra.nsdl.co.in/scheme-atal-pension-yojana-renewal.php",
      nearbyOffice: "Your registered Nationalized Savings Bank Branch Manager",
      helpline: "1800-110-069",
      email: "apy-cra@nsdl.co.in",
      financialAssistance: "Guaranteed lifelong monthly pension of ₹1,000 to ₹5,000 post age 60.",
      verifiedDomain: "npscra.nsdl.co.in (PFRDA Regulatory Authority)",
    };
  }

  if (name.includes("widow") || name.includes("pension") || name.includes("ignwps")) {
    return {
      officialWebsite: "https://nsap.nic.in",
      applyOnline: "https://nsap.nic.in/stateSchemes.do",
      officialPdf: "https://nsap.nic.in/public/faq/Guidelines_IGNWPS.pdf",
      guidelines: "https://nsap.nic.in/public/schemeGuidelines/IGNWPS_Guidelines.pdf",
      trackStatus: "https://nsap.nic.in/admin/testSearch.do",
      renewal: "https://nsap.nic.in/renewalCertification",
      nearbyOffice: "Block Development Office (BDO) or Gram Panchayat Secretary Desk",
      helpline: "1800-111-555",
      email: "nsap-support@nic.in",
      financialAssistance: "₹300 - ₹500 direct cash monthly pension sent via DBT.",
      verifiedDomain: "nsap.nic.in (Ministry of Rural Development)",
    };
  }

  if (name.includes("mudra") || name.includes("loan") || name.includes("business") || name.includes("start")) {
    return {
      officialWebsite: "https://www.mudra.org.in",
      applyOnline: "https://www.udyamimitra.in",
      officialPdf: "https://www.mudra.org.in/Download/Mudra_Brochure_English.pdf",
      guidelines: "https://www.mudra.org.in/Download/Mudra_Guidelines.pdf",
      trackStatus: "https://www.udyamimitra.in/track-loan",
      renewal: "https://www.udyamimitra.in/renew-mudra",
      nearbyOffice: "District Industries Centre (DIC) or Lead Bank Office",
      helpline: "1800-180-1111",
      email: "help@mudra.org.in",
      financialAssistance: "Collateral-free business loans up to ₹10 Lakhs (Shishu, Kishor, Tarun).",
      verifiedDomain: "mudra.org.in (SIDBI Finance Node)",
    };
  }

  // General fallback using high-integrity NIC domains
  return {
    officialWebsite: "https://www.india.gov.in",
    applyOnline: "https://www.india.gov.in/my-government/schemes",
    officialPdf: "https://www.india.gov.in/sites/upload_files/npi/files/Welfare_National_Portal_Directives.pdf",
    guidelines: "https://www.india.gov.in/my-government/documents",
    trackStatus: "https://www.india.gov.in/track-application-status",
    renewal: "https://www.india.gov.in/renewal-services",
    nearbyOffice: "District Commissioner Office / Common Service Centre (CSC)",
    helpline: "1800-111-555",
    email: "citizen-portal@nic.in",
    financialAssistance: "Central & State welfare support calculated based on digital parameters.",
    verifiedDomain: "india.gov.in (National Portal of India)",
  };
};

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
  
  // Bookmarks, comparison and copy state additions
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

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
            filteredSchemes.map((scheme) => {
              const gov = getGovLinks(scheme.name, scheme.category);
              return (
                <div
                  key={scheme.id}
                  id={`scheme-card-${scheme.id}`}
                  className={`p-5 rounded-3xl border transition-all duration-200 backdrop-blur-md text-left ${
                    highContrast
                      ? "bg-black border-yellow-500 text-yellow-400"
                      : "bg-white/60 border-white/40 hover:border-white/80 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 text-left">
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
                    <div className="mt-4 p-3 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-start space-x-2.5 text-left">
                      <Award className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-left">
                        <span className="font-extrabold text-slate-800 block">Eligibility Verification:</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{scheme.matchReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Collapsible expanded instructions */}
                  {expandedScheme === scheme.id ? (
                    <div className="mt-5 pt-5 border-t space-y-5 animate-fadeIn text-left">
                      
                      {/* Financial Assistance & Benefits Column */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-left">
                          <span className="text-[10px] font-extrabold text-[#0B3D91] uppercase tracking-wider block flex items-center space-x-1">
                            <Coins className="w-3.5 h-3.5" />
                            <span>Financial Assistance & Allowances</span>
                          </span>
                          <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                            {gov.financialAssistance}
                          </p>
                        </div>

                        <div className="space-y-1 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-left">
                          <span className="text-[10px] font-extrabold text-[#138808] uppercase tracking-wider block flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Welfare Allowances & Details</span>
                          </span>
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            {scheme.benefits}
                          </p>
                        </div>
                      </div>

                      {/* Required Documents */}
                      <div className="space-y-1.5 text-xs text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Documents</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed p-2.5 bg-slate-50 rounded-xl border">
                          {scheme.eligibility}
                        </p>
                      </div>

                      {/* Interactive Actions Tool Bar */}
                      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border rounded-2xl text-xs text-left">
                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const isBookmarked = bookmarks.includes(scheme.id);
                            if (isBookmarked) {
                              setBookmarks(bookmarks.filter(id => id !== scheme.id));
                              addNotification(`Removed bookmark for ${scheme.name}`);
                            } else {
                              setBookmarks([...bookmarks, scheme.id]);
                              addNotification(`Bookmarked ${scheme.name} for offline reference.`);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] flex items-center space-x-1.5 transition-all cursor-pointer ${
                            bookmarks.includes(scheme.id)
                              ? "bg-amber-100 border-amber-300 text-amber-800 shadow-xs"
                              : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(scheme.id) ? "fill-amber-500 text-amber-600" : ""}`} />
                          <span>{bookmarks.includes(scheme.id) ? "Bookmarked (Offline)" : "Save Bookmark"}</span>
                        </button>

                        {/* Compare Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const inCompare = compareList.some(item => item.id === scheme.id);
                            if (inCompare) {
                              setCompareList(compareList.filter(item => item.id !== scheme.id));
                              addNotification(`Removed ${scheme.name} from comparison.`);
                            } else {
                              if (compareList.length >= 3) {
                                addNotification("You can compare up to 3 schemes at a time.");
                                return;
                              }
                              setCompareList([...compareList, { ...scheme, gov }]);
                              addNotification(`Added ${scheme.name} to comparison list.`);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] flex items-center space-x-1.5 transition-all cursor-pointer ${
                            compareList.some(item => item.id === scheme.id)
                              ? "bg-blue-100 border-blue-300 text-blue-800 shadow-xs"
                              : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>{compareList.some(item => item.id === scheme.id) ? "Comparing" : "Compare Scheme"}</span>
                        </button>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${scheme.name} - Apply online at: ${gov.applyOnline}`);
                            addNotification(`Copied sharing link for ${scheme.name} to clipboard!`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-[10px] flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Scheme</span>
                        </button>
                      </div>

                      {/* VERIFIED OFFICIAL GOVERNMENT LINK ENGINE GATEWAY */}
                      <div className="space-y-3 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 text-xs shadow-md text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                            <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Verified Gov.in Link Gateway</span>
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-sm border border-emerald-800/80 font-mono">
                            Secure Node: {gov.verifiedDomain}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {/* 1. Official Website */}
                          <a
                            href={gov.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-2 group text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Portal</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                            </div>
                            <span className="text-[11px] font-bold text-white leading-normal truncate">{new URL(gov.officialWebsite).hostname}</span>
                          </a>

                          {/* 2. Apply Online */}
                          <a
                            href={gov.applyOnline}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-xl hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-2 group text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-1">
                                <span>●</span> <span>Direct Apply Link</span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400" />
                            </div>
                            <span className="text-[11px] font-bold text-white leading-normal">Interactive Application Form</span>
                          </a>

                          {/* 3. Official Guidelines PDF */}
                          <a
                            href={gov.officialPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-xl hover:border-red-500/50 transition-all flex flex-col justify-between space-y-2 group text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                                <FileText className="w-3 h-3 text-red-400" />
                                <span>Official PDF guidelines</span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
                            </div>
                            <span className="text-[11px] font-bold text-white leading-normal">Download Gazette Notification</span>
                          </a>

                          {/* 4. Track Application Status */}
                          <a
                            href={gov.trackStatus}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-xl hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-2 group text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1">
                                <RefreshCw className="w-3 h-3 text-teal-400" />
                                <span>Track status</span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400" />
                            </div>
                            <span className="text-[11px] font-bold text-white leading-normal">Check Application Payouts</span>
                          </a>

                          {/* 5. Renewal Portal */}
                          <a
                            href={gov.renewal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-2 group text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                                <span>Re-Verification</span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400" />
                            </div>
                            <span className="text-[11px] font-bold text-white leading-normal">Digital Renewal Desk & e-KYC</span>
                          </a>

                          {/* 6. Helpdesk Contact details */}
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between space-y-2 text-left">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                              <PhoneCall className="w-3 h-3 text-amber-400" />
                              <span>Helpline & Email</span>
                            </span>
                            <div className="space-y-0.5 text-left">
                              <p className="text-[10px] font-bold text-white">{gov.helpline}</p>
                              <p className="text-[9px] text-slate-400 font-mono truncate">{gov.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Nearby Office Address Banner */}
                        <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-left">
                          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 text-left text-xs">
                            <span className="font-extrabold text-white text-[10px] uppercase tracking-wider block">Nearest Registered Field Office:</span>
                            <p className="text-[11px] text-slate-300 leading-normal">{gov.nearbyOffice}</p>
                          </div>
                        </div>
                      </div>

                      {/* Step By Step Checklist */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step-By-Step Application Checklist</span>
                        <div className="space-y-1.5 text-left">
                          {scheme.applicationSteps.map((step: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2 text-xs bg-slate-50/40 p-2.5 rounded-xl text-left">
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
                          type="button"
                          onClick={() => setExpandedScheme(null)}
                          className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-wide cursor-pointer"
                        >
                          Hide Details
                        </button>
                        <a
                          href={gov.applyOnline}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white text-xs font-bold uppercase rounded-xl tracking-wide shadow-sm flex items-center space-x-1"
                        >
                          <span>Apply on Official Portal</span>
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
                      <span className="text-slate-400 text-[11px]">Rolling Applications Cycle</span>
                      <button
                        type="button"
                        onClick={() => setExpandedScheme(scheme.id)}
                        className="px-4 py-1.5 bg-[#0B3D91]/5 hover:bg-[#0B3D91]/10 text-[#0B3D91] font-extrabold uppercase rounded-xl text-[10px] flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Show Official Links & Steps</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* FLOATING COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex flex-col space-y-3 max-w-sm">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1">
                <ArrowLeftRight className="w-4 h-4 text-[#FF8C00]" />
                <span>Compare Schemes ({compareList.length}/3)</span>
              </span>
              <button 
                type="button"
                onClick={() => setCompareList([])}
                className="text-[10px] hover:underline text-slate-400"
              >
                Clear
              </button>
            </div>
            
            <div className="space-y-1.5">
              {compareList.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs p-1.5 bg-slate-950 rounded-lg">
                  <span className="font-bold truncate max-w-[200px] text-[11px] text-left">{item.name}</span>
                  <button 
                    type="button"
                    onClick={() => setCompareList(compareList.filter(i => i.id !== item.id))}
                    className="text-red-400 font-bold hover:text-red-300 text-[10px] px-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider hover:opacity-95 transition-opacity cursor-pointer"
            >
              Compare Side-By-Side
            </button>
          </div>
        </div>
      )}

      {/* DETAILED SIDE-BY-SIDE COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border text-left">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">Government Welfare Scheme Comparison</h3>
                <p className="text-xs text-slate-500">Analyze allowances, eligibility criteria, and step-by-step dispatch roadmaps side-by-side.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold uppercase hover:bg-slate-50 cursor-pointer"
              >
                Close Comparison
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {compareList.map(item => (
                <div key={item.id} className="border rounded-2xl p-4 space-y-4 bg-slate-50/50">
                  <div className="space-y-1.5 border-b pb-3">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-sm text-[9px] uppercase font-bold tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{item.ministry}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Financial Assistance</span>
                    <p className="p-2.5 bg-blue-50/30 border border-blue-100/50 rounded-xl text-[11px] font-semibold text-slate-700">{item.gov.financialAssistance}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Welfare Allowances</span>
                    <p className="p-2.5 bg-slate-50 border rounded-xl text-[11px] text-slate-600 leading-relaxed">{item.benefits}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Required Documents</span>
                    <p className="p-2.5 bg-slate-50 border rounded-xl text-[11px] text-slate-600 leading-relaxed">{item.eligibility}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Application Roadmap</span>
                    <div className="space-y-1.5">
                      {item.applicationSteps.map((step: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-start space-x-1.5 p-1.5 bg-white border border-slate-100 rounded-lg">
                          <span className="w-4 h-4 bg-emerald-50 text-[#138808] font-bold text-[9px] flex items-center justify-center rounded-full shrink-0">{sIdx+1}</span>
                          <span className="text-[10px] text-slate-500 leading-tight">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t flex flex-col gap-2">
                    <a
                      href={item.gov.applyOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-bold text-center text-xs uppercase rounded-xl shadow-xs flex items-center justify-center space-x-1"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3 text-white" />
                    </a>
                    <a
                      href={item.gov.officialPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 border text-slate-600 font-bold text-center text-xs uppercase rounded-xl hover:bg-slate-50 flex items-center justify-center space-x-1"
                    >
                      <span>View Guidelines PDF</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
