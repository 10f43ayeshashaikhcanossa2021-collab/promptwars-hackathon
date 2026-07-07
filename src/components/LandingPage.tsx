import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { 
  Sparkles, 
  ChevronRight, 
  FileCheck2, 
  AlertOctagon, 
  FolderLock, 
  HelpCircle, 
  Mic, 
  ShieldCheck, 
  Search, 
  MessageSquare,
  Award,
  Users,
  CheckCircle,
  Building2,
  PhoneCall,
  FileText,
  Image as ImageIcon,
  ArrowRight
} from "lucide-react";
import { UserProfile } from "../types";

interface LandingPageProps {
  user: UserProfile | null;
  onGetStarted: () => void;
  onTalkToAI: () => void;
  highContrast: boolean;
  onSelectFeature: (featureTab: string) => void;
  onSearch: (query: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onGetStarted,
  onTalkToAI,
  highContrast,
  onSelectFeature,
  onSearch
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const displayName = user ? user.fullName : "Ayesha"; // Default fallback to Ayesha as requested!

  const suggestedActions = [
    { label: "Apply for Passport", query: "I need a passport. What is the official process, fees, and nearby offices?" },
    { label: "Find Scholarships", query: "Find verified central or state scholarships for student eligibility guidelines." },
    { label: "Report Pothole", query: "My road has a pothole." },
    { label: "Renew Driving License", query: "I need to renew my Driving License online. Step-by-step official guide." },
    { label: "PM Kisan", query: "PM Kisan Samman Nidhi registration benefits and documents needed." },
    { label: "Ayushman Bharat", query: "Ayushman Bharat Health Card eligibility and financial assistance details." },
    { label: "Birth Certificate", query: "How to register and download a Birth Certificate online." },
    { label: "Electricity Bill", query: "How do I check my digital Electricity Bill or report a faulty meter?" }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleQuickAction = (actionType: "voice" | "document" | "image") => {
    if (actionType === "voice") {
      onSearch("🎤 voice-assist-trigger-activated");
    } else if (actionType === "document") {
      onSearch("📄 document-upload-audit-trigger");
    } else if (actionType === "image") {
      onSearch("📷 civic-reporter-photo-upload-trigger");
    }
  };

  const handleTriggerAction = (query: string) => {
    onSearch(query);
  };

  const stats = [
    { value: "450+", label: "Verified Services", desc: "Integrated across Central & State ministries" },
    { value: "94.2%", label: "Complaints Solved", desc: "Average resolution time under 4 days" },
    { value: "11", label: "Indian Languages", desc: "Real-time voice and text translation" },
    { value: "54M+", label: "Citizen Queries", desc: "Processed with zero-trust safety" }
  ];

  const features = [
    {
      id: "chat",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600",
      title: "Intelligent Q&A Assistant",
      desc: "Instant answers on citizen benefits, schemes, and application eligibility powered by official RAG knowledge base. No hallucinations.",
      tabTarget: "chat"
    },
    {
      id: "doc-verify",
      icon: FileCheck2,
      color: "from-blue-600 to-indigo-700",
      title: "Smart Document Auditor",
      desc: "Instantly upload Aadhaar, PAN, or Passport to verify scan quality, locate missing seals, and generate a certified readiness checklist.",
      tabTarget: "locker"
    },
    {
      id: "civic-issue",
      icon: AlertOctagon,
      color: "from-emerald-600 to-teal-700",
      title: "Civic Issue AI Dispatcher",
      desc: "Report local potholes, garbage piles, or broken streetlights by snapping a photo. AI classifies, estimates priority, and routes to correct ward.",
      tabTarget: "complaints"
    },
    {
      id: "schemes",
      icon: Award,
      color: "from-[#0B3D91] to-sky-700",
      title: "Dynamic Scheme Matcher",
      desc: "Answer a simple demographic survey to receive direct matches for PM-Kisan, scholarships, and agricultural or healthcare pensions.",
      tabTarget: "schemes"
    },
    {
      id: "voice-assistant",
      icon: Mic,
      color: "from-purple-600 to-pink-700",
      title: "Multilingual Voice AI",
      desc: "Continuous listening and natural text-to-speech audio rendering. Ask and listen in Hindi, Marathi, Tamil, Bengali, and 7 more languages.",
      tabTarget: "chat"
    },
    {
      id: "secure-lock",
      icon: FolderLock,
      color: "from-[#138808] to-emerald-700",
      title: "Encrypted Zero-Trust Locker",
      desc: "Secure AES-256 digital vault fully synced with DigiLocker. Keep identity credentials encoded and private.",
      tabTarget: "locker"
    }
  ];

  const faqs = [
    {
      q: "How does Smart Bharat AI prevent false information or hallucinations?",
      a: "Our engine uses a verified Retrieval-Augmented Generation (RAG) architecture. It searches strictly inside official Gazette notifications, ministry guidelines, and circulars. If a requested scheme has no verified record, it explicitly states 'I could not find verified government information' rather than guessing."
    },
    {
      q: "Are my uploaded personal documents secure?",
      a: "Yes. Smart Bharat AI utilizes enterprise-grade end-to-end AES-256 encryption. Files are kept encoded in a sandboxed, zero-trust locker, and personal details are masked. We strictly comply with the Indian Digital Personal Data Protection (DPDP) Act."
    },
    {
      q: "Does this portal replace existing official portals like DigiLocker or UMANG?",
      a: "Smart Bharat AI acts as an intelligent conversational layer *on top* of existing portals. It coordinates with DigiLocker and citizen databases to simplify access, explain difficult policy text, and automate civic reporting through natural speech and vision."
    },
    {
      q: "Can I use the app purely through speech?",
      a: "Absolutely. By clicking the Voice/Microphone icon inside the AI Chat window, the app enters hands-free mode. You can speak in any of the 11 supported languages and receive natural spoken voice responses in real time."
    }
  ];

  return (
    <div className="space-y-12 py-6 animate-fadeIn" id="landing-page">
      
      {/* 1. AI COMMAND CENTER (REDESIGNED HERO SECTION WITH GREETING & SEARCH FIRST) */}
      <section className={`relative overflow-hidden rounded-3xl max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:px-8 shadow-md border transition-all duration-300 ${
        highContrast 
          ? "bg-black border-yellow-500 border-2 text-yellow-400" 
          : "bg-white/45 backdrop-blur-md border-white/50"
      }`}>
        
        {/* Subtle abstract Ashok Chakra background watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <svg width="500" height="500" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
          </svg>
        </div>

        {/* GoI Emblem / Tricolor Strip Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 pt-4">
          
          {/* Welcome Greet Section */}
          <div className="space-y-3">
            <span className="text-sm font-bold tracking-widest uppercase text-[#FF8C00] font-mono">
              Smart Bharat AI Command Center
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 leading-tight">
              {greetingTime}, {displayName} 👋
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium">
              How can I help you today?
            </p>
          </div>

          {/* Unified AI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className={`flex items-center p-2 rounded-2xl border transition-all ${
              highContrast 
                ? "bg-black border-yellow-500" 
                : "bg-white/90 shadow-lg border-slate-100 hover:border-slate-200 focus-within:ring-2 focus-within:ring-[#0B3D91]"
            }`}>
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type your question (e.g., 'I need a passport' or 'My road has a pothole')"
                className="w-full bg-transparent border-none outline-hidden px-3 text-sm text-slate-800 placeholder-slate-400 font-sans"
              />
              <button 
                type="submit"
                className="bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick AI Mode Triggers */}
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => handleQuickAction("voice")}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                highContrast 
                  ? "bg-black border-yellow-500 text-yellow-400" 
                  : "bg-orange-50/60 hover:bg-orange-100/80 border-orange-100 text-orange-700 shadow-2xs"
              }`}
            >
              <Mic className="w-4 h-4 text-[#FF8C00] animate-pulse" />
              <span>🎤 Voice Assistant</span>
            </button>
            
            <button 
              onClick={() => handleQuickAction("document")}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                highContrast 
                  ? "bg-black border-yellow-500 text-yellow-400" 
                  : "bg-blue-50/60 hover:bg-blue-100/80 border-blue-100 text-blue-800 shadow-2xs"
              }`}
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>📄 Upload Document</span>
            </button>

            <button 
              onClick={() => handleQuickAction("image")}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                highContrast 
                  ? "bg-black border-yellow-500 text-yellow-400" 
                  : "bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-100 text-emerald-800 shadow-2xs"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>📷 Upload Image</span>
            </button>
          </div>

          {/* Suggested Actions Section */}
          <div className="pt-4 max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Suggested AI Workflows</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleTriggerAction(action.query)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-102 cursor-pointer ${
                    highContrast 
                      ? "bg-black border border-yellow-500 text-yellow-400" 
                      : "bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-[#0B3D91] shadow-2xs hover:shadow-xs"
                  }`}
                >
                  • {action.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Security / Sovereignty Trust Ribbons */}
        <div className="mt-12 pt-6 border-t border-slate-200/50 max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-75">
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Sovereignty Compliant</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
            <Building2 className="w-4 h-4 text-blue-800" />
            <span>Verified Official GOI Domains</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
            <CheckCircle className="w-4 h-4 text-amber-500" />
            <span>Secure AES-256 Cryptography</span>
          </div>
        </div>

      </section>

      {/* 2. STATS RIBBON */}
      <section className="max-w-7xl mx-auto px-4" id="stats-ribbon">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between backdrop-blur-md ${
                highContrast 
                  ? "bg-black border-yellow-500 text-yellow-400" 
                  : "bg-white/45 border-white/40 shadow-2xs hover:shadow-md"
              }`}
            >
              <span className={`text-2xl sm:text-3xl font-display font-black leading-none ${
                highContrast ? "text-yellow-400" : i % 2 === 0 ? "text-[#FF8C00]" : "text-[#0B3D91]"
              }`}>
                {stat.value}
              </span>
              <div className="mt-2 text-left">
                <span className="text-xs font-bold text-slate-800 block">{stat.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-relaxed">{stat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CAPABILITIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 space-y-8" id="services-catalogue">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Comprehensive Digital Governance Suites
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 text-xs">
            Leveraging secure generative AI nodes and centralized citizen records to transform your daily public interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={`feature-card-${feat.id}`}
                onClick={() => onSelectFeature(feat.tabTarget)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between space-y-4 backdrop-blur-md ${
                  highContrast
                    ? "bg-black border-yellow-500 text-yellow-400 hover:bg-slate-950"
                    : "bg-white/45 border-white/40 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200/80"
                }`}
              >
                <div className="space-y-3">
                  <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${feat.color} text-white flex items-center justify-center`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display leading-snug">{feat.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-bold text-[#0B3D91] uppercase hover:underline pt-2">
                  <span>Explore Suite</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. VERIFIED CITIZEN FEEDBACK */}
      <section className="max-w-7xl mx-auto px-4 space-y-8" id="testimonials-section">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
            Trusted by Citizens Across the Nation
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 text-xs">
            Read real feedback from farmers, students, and officers utilizing our smart assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border text-left space-y-3 shadow-2xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/45 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#FF8C00] text-xs">
                HS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Harpreet Singh</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Farmer, Punjab</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              "Applying for PM-Kisan used to take me visits to local cyber cafes. Smart Bharat AI answered my doubts in Punjabi and guided me on NSP documents instantly. Wonderful app!"
            </p>
          </div>

          <div className={`p-5 rounded-2xl border text-left space-y-3 shadow-2xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/45 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#0B3D91] text-xs">
                RP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Radha Prasad</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">B.Tech Student, Karnataka</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              "The PDF policy summarizer is amazing. I uploaded the 50-page scholarship guidelines document, and the AI extracted the precise household income caps and deadlines in 2 seconds."
            </p>
          </div>

          <div className={`p-5 rounded-2xl border text-left space-y-3 shadow-2xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/45 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-[#138808] text-xs">
                SK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Sanjay K. Verma</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Chief Municipal Engineer, UP</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              "The Public Issue Reporting tool is extremely reliable. Citizens upload pothole photos, the AI calculates the location, categories, priority, and automatically triggers my desk's queue."
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQs SECTION */}
      <section className="max-w-3xl mx-auto px-4 space-y-6" id="faqs">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-[#0B3D91] mx-auto opacity-75" />
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-[11px]">
            Everything you need to know about Smart Bharat AI's security, models, and systems.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`border rounded-xl overflow-hidden transition-all backdrop-blur-md ${
                highContrast 
                  ? "border-yellow-400 text-yellow-400 bg-black" 
                  : "border-white/40 bg-white/45 shadow-2xs"
              }`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                id={`faq-btn-${idx}`}
                className="w-full px-5 py-3 text-left font-bold text-xs sm:text-sm flex justify-between items-center cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-150 ${activeFaq === idx ? "transform rotate-90" : ""}`} />
              </button>

              {activeFaq === idx && (
                <div className={`px-5 pb-4 pt-1 text-xs opacity-90 leading-relaxed border-t text-left ${
                  highContrast ? "border-yellow-400" : "border-slate-100"
                }`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. HELP & SUPPORT RIBBON */}
      <section className="max-w-7xl mx-auto px-4" id="emergency-contacts">
        <div className="bg-linear-to-r from-red-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-5 shadow-sm text-left">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-sm">Support Hotline</span>
            <h3 className="text-lg font-display font-extrabold">24/7 National Citizen Support Portal</h3>
            <p className="text-[11px] opacity-90 max-w-lg">
              For security emergencies, identity lock support, or system audits, you can also dial standard helpline endpoints immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a 
              href="tel:1800111555" 
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center space-x-1.5 hover:shadow-md transition-shadow"
            >
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              <span>1800-111-555 (Toll Free)</span>
            </a>
            <button 
              onClick={onTalkToAI} 
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center space-x-1 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Instant AI Chat</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. SECURE FOOTER */}
      <footer className={`border-t py-8 backdrop-blur-md ${
        highContrast ? "bg-black border-yellow-500 text-yellow-400" : "border-white/30 bg-white/30"
      }`} id="footer">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0B3D91] tracking-wider uppercase block">Smart Bharat AI Companion</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Empowering every Indian citizen with secure, accessible, zero-hallucination artificial intelligence in their own native language. Guided by transparency, data sovereignty, and inclusive governance.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase block">Associated Portals</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">MyGov.in</a>
                <a href="https://digilocker.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">DigiLocker India</a>
                <a href="https://www.uidai.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">UIDAI (Aadhaar)</a>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">National Portal</a>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase block">Secure Certification</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Hosted via secure, isolated Cloud Run containers. SSL secured endpoints. Under active governance monitoring by the Ministry of Electronics and Information Technology (MeitY).
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/50 pt-5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
            <span>© 2026 Smart Bharat AI. All rights reserved.</span>
            <div className="flex items-center space-x-1 font-semibold text-[#0B3D91]">
              <Building2 className="w-3 h-3" />
              <span>National Informatics Centre (NIC) Mock Sandbox</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
