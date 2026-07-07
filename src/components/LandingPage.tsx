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
  PhoneCall
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onTalkToAI: () => void;
  highContrast: boolean;
  onSelectFeature: (featureTab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onTalkToAI,
  highContrast,
  onSelectFeature
}) => {
  const { t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
      tabTarget: "services"
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
      desc: "Continuous listing and natural text-to-speech audio rendering. Ask and listen in Hindi, Marathi, Tamil, Bengali, and 7 more languages.",
      tabTarget: "chat"
    },
    {
      id: "secure-lock",
      icon: FolderLock,
      color: "from-[#138808] to-emerald-700",
      title: "Encrypted Zero-Trust Locker",
      desc: "Secure AES-256 digital vault fully synced with DigiLocker. Keep identity credentials encoded and private.",
      tabTarget: "dashboard"
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
    <div className="space-y-16 py-6 animate-fadeIn" id="landing-page">
      {/* 1. HERO SECTION */}
      <section className={`relative overflow-hidden rounded-3xl max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:px-8 shadow-md border transition-all duration-300 ${
        highContrast 
          ? "bg-black border-yellow-500 border-2" 
          : "bg-white/40 backdrop-blur-md border-white/50"
      }`}>
        
        {/* Subtle abstract Ashok Chakra background watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <svg width="600" height="600" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#138808]" />
            <span>{t("oneNation")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-tight">
            {t("heroHeading")}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            {t("heroSubheading")}
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onGetStarted}
              id="hero-btn-get-started"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wide text-sm bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>{t("getStarted")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTalkToAI}
              id="hero-btn-talk-ai"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wide text-sm bg-white border border-slate-300 hover:border-[#0B3D91] text-slate-800 hover:text-[#0B3D91] transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{t("talkToAi")}</span>
            </button>

            <button
              id="hero-btn-demo"
              onClick={() => onSelectFeature("services")}
              className="w-full sm:w-auto px-8 py-4 text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-800 transition-colors uppercase"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Dynamic Trust Badges Ribbon */}
        <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-80">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Building2 className="w-5 h-5 text-blue-800" />
            <span>DPDP Compliant</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <CheckCircle className="w-5 h-5 text-amber-500" />
            <span>DigiLocker Synced</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Users className="w-5 h-5 text-purple-600" />
            <span>100% Non-Hallucinatory</span>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4" id="stats-ribbon">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-2xl border transition-all duration-150 flex flex-col justify-between backdrop-blur-md ${
                highContrast 
                  ? "bg-black border-yellow-500 text-yellow-400" 
                  : "bg-white/50 border-white/40 shadow-xs hover:shadow-lg hover:border-white/80"
              }`}
            >
              <span className={`text-3xl sm:text-4xl font-display font-black leading-none ${
                highContrast ? "text-yellow-400" : i % 2 === 0 ? "text-[#FF8C00]" : "text-[#0B3D91]"
              }`}>
                {stat.value}
              </span>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold block">{stat.label}</span>
                <span className="text-[11px] opacity-75 mt-0.5 block leading-normal">{stat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CAPABILITIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 space-y-10" id="services-catalogue">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Comprehensive Digital Governance Suites
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 text-sm">
            Leveraging secure generative AI nodes and centralized citizen records to transform your daily public interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={`feature-card-${feat.id}`}
                onClick={() => onSelectFeature(feat.tabTarget)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between space-y-4 backdrop-blur-md ${
                  highContrast
                    ? "bg-black border-yellow-500 text-yellow-400 hover:bg-slate-950"
                    : "bg-white/50 border-white/40 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-white/80"
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${feat.color} text-white flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display leading-tight">{feat.title}</h3>
                    <p className="text-xs opacity-80 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-semibold text-[#0B3D91] uppercase hover:underline pt-2">
                  <span>Explore Suite</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. VERIFIED CITIZEN FEEDBACK (TESTIMONIALS) */}
      <section className="max-w-7xl mx-auto px-4 space-y-10" id="testimonials-section">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Trusted by Citizens Across the Nation
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 text-sm">
            Read real feedback from farmers, students, and officers utilizing our smart assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border text-left space-y-4 shadow-xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/50 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#FF8C00]">
                HS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Harpreet Singh</h4>
                <p className="text-[10px] text-slate-400">Farmer, Punjab</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Applying for PM-Kisan used to take me visits to local cyber cafes. Smart Bharat AI answered my doubts in Punjabi and guided me on NSP documents instantly. Wonderful app!"
            </p>
          </div>

          <div className={`p-6 rounded-2xl border text-left space-y-4 shadow-xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/50 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#0B3D91]">
                RP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Radha Prasad</h4>
                <p className="text-[10px] text-slate-400">B.Tech Student, Karnataka</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The PDF policy summarizer is amazing. I uploaded the 50-page scholarship guidelines document, and the AI extracted the precise household income caps and deadlines in 2 seconds."
            </p>
          </div>

          <div className={`p-6 rounded-2xl border text-left space-y-4 shadow-xs backdrop-blur-md ${highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/50 border-white/40"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-[#138808]">
                SK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Sanjay K. Verma</h4>
                <p className="text-[10px] text-slate-400">Chief Municipal Engineer, UP</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Public Issue Reporting tool is extremely reliable. Citizens upload pothole photos, the AI calculates the location, categories, priority, and automatically triggers my desk's queue."
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQs SECTION */}
      <section className="max-w-3xl mx-auto px-4 space-y-8" id="faqs">
        <div className="text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-[#0B3D91] mx-auto opacity-75" />
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs">
            Everything you need to know about Smart Bharat AI's security, models, and systems.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`border rounded-xl overflow-hidden transition-all duration-150 backdrop-blur-md ${
                highContrast 
                  ? "border-yellow-400 text-yellow-400 bg-black" 
                  : "border-white/40 bg-white/50 shadow-xs"
              }`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                id={`faq-btn-${idx}`}
                className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-150 ${activeFaq === idx ? "transform rotate-90" : ""}`} />
              </button>

              {activeFaq === idx && (
                <div className={`px-5 pb-5 pt-1 text-xs opacity-90 leading-relaxed border-t ${
                  highContrast ? "border-yellow-400" : "border-slate-50"
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
        <div className="bg-linear-to-r from-red-500 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-sm">Support Hotline</span>
            <h3 className="text-xl font-display font-extrabold">24/7 National Citizen Support Portal</h3>
            <p className="text-xs opacity-90 max-w-lg">
              For security emergencies, identity lock support, or system audits, you can also dial standard helpline endpoints immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a 
              href="tel:1800111555" 
              className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center space-x-2 hover:shadow-lg transition-shadow"
            >
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              <span>1800-111-555 (Toll Free)</span>
            </a>
            <button 
              onClick={onTalkToAI} 
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-800 transition-colors"
            >
              <span>Instant AI Chat</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. SECURE FOOTER */}
      <footer className={`border-t py-12 backdrop-blur-md ${
        highContrast ? "bg-black border-yellow-500 text-yellow-400" : "border-white/30 bg-white/30"
      }`} id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold text-[#0B3D91] tracking-wider uppercase">Smart Bharat AI Companion</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering every Indian citizen with secure, accessible, zero-hallucination artificial intelligence in their own native language. Guided by transparency, data sovereignty, and inclusive governance.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">Associated Portals</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">MyGov.in</a>
                <a href="https://digilocker.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">DigiLocker India</a>
                <a href="https://www.uidai.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">UIDAI (Aadhaar)</a>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0B3D91] hover:underline">National Portal</a>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">Secure Certification</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hosted via secure, isolated Cloud Run containers. SSL secured endpoints. Under active governance monitoring by the Ministry of Electronics and Information Technology (MeitY).
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
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
