import React, { useState, useEffect } from "react";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { AuthScreen } from "./components/AuthScreen";
import { AIChatbot } from "./components/AIChatbot";
import { SchemeMatcher } from "./components/SchemeMatcher";
import { IssueReporter } from "./components/IssueReporter";
import { MapComponent } from "./components/MapComponent";
import { Dashboards } from "./components/Dashboards";
import { ProfilePage } from "./components/ProfilePage";
import { DigitalLocker } from "./components/DigitalLocker";
import { UserProfile, Role } from "./types";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  X, 
  LockKeyhole, 
  UserCheck, 
  Info,
  ShieldAlert
} from "lucide-react";

function AppContent() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Welcome to Smart Bharat AI sandbox node. AES-256 state database active.",
    "Bilingual support activated for 11 regional Indian languages."
  ]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 8));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab("home");
    addNotification("Session terminated successfully. State databases locked.");
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setUser(profile);
    setAuthOpen(false);
    setCurrentTab("dashboard");
    addNotification(`Authentication successful. Welcome, ${profile.fullName}!`);
    // Add national log event
    fetch("/api/add-audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Citizen Biometric/Password Auth Success",
        userEmail: profile.email,
        details: `Successful authenticated session via mobile verification. Preferred Language: ${profile.preferredLanguage}`
      })
    }).catch(err => console.error("Logger error:", err));
  };

  // Redirect to login if user attempts to load dashboard or profile without session
  useEffect(() => {
    if ((currentTab === "dashboard" || currentTab === "profile") && !user) {
      setAuthOpen(true);
      setCurrentTab("home");
      addNotification("Please authenticate your identity to access secure dashboard tools.");
    }
  }, [currentTab, user]);

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col transition-all duration-300 ${
      highContrast 
        ? "bg-black text-yellow-400 font-bold" 
        : "bg-[#F6F8FC] text-slate-800"
    }`}>
      
      {/* Dynamic Frosted Glass Background Ambient Glowing Blobs */}
      {!highContrast && (
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none overflow-hidden h-full w-full">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF8C00] blur-[140px] animate-pulse" style={{ animationDuration: "12s" }}></div>
          <div className="absolute bottom-[5%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#138808] blur-[140px] animate-pulse" style={{ animationDuration: "15s" }}></div>
          <div className="absolute top-[40%] right-[20%] w-[450px] h-[450px] rounded-full bg-[#0B3D91] blur-[150px] animate-pulse" style={{ animationDuration: "10s" }}></div>
        </div>
      )}
      
      {/* Dynamic Floating Toast Notifications Alert Center */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-2 pointer-events-none">
        {notifications.slice(0, 3).map((notif, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border shadow-xl flex items-start space-x-3 pointer-events-auto animate-slideIn ${
              highContrast
                ? "bg-black border-yellow-500 text-yellow-400"
                : "bg-white/95 backdrop-blur-md border-slate-100 text-slate-800"
            }`}
          >
            <div className="w-5 h-5 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
            </div>
            <div className="space-y-0.5 text-xs text-left">
              <span className="font-extrabold uppercase text-[9px] text-slate-400 block">Security Event Log</span>
              <p className="leading-snug text-slate-600 font-semibold">{notif}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}
              className="text-slate-400 hover:text-slate-800 text-xs shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Header navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthOpen(true)}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        notifications={notifications}
        clearNotifications={clearNotifications}
      />

      {/* Core Tab Render Pipeline */}
      <main className="flex-grow relative z-10">
        {authOpen ? (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setAuthOpen(false)}
            highContrast={highContrast}
          />
        ) : (
          <div className="transition-all duration-300">
            {currentTab === "home" && (
              <LandingPage
                onGetStarted={() => {
                  if (user) {
                    setCurrentTab("dashboard");
                  } else {
                    setAuthOpen(true);
                  }
                }}
                onTalkToAI={() => setCurrentTab("chat")}
                highContrast={highContrast}
                onSelectFeature={(tab) => {
                  if ((tab === "dashboard" || tab === "profile") && !user) {
                    setAuthOpen(true);
                  } else {
                    setCurrentTab(tab);
                  }
                }}
              />
            )}

            {currentTab === "chat" && (
              <AIChatbot
                user={user}
                highContrast={highContrast}
                addNotification={addNotification}
              />
            )}

            {currentTab === "services" && (
              <MapComponent
                highContrast={highContrast}
              />
            )}

            {currentTab === "complaints" && (
              <IssueReporter
                user={user}
                highContrast={highContrast}
                addNotification={addNotification}
              />
            )}

            {currentTab === "schemes" && (
              <SchemeMatcher
                user={user}
                highContrast={highContrast}
                addNotification={addNotification}
              />
            )}

            {currentTab === "dashboard" && user && (
              <Dashboards
                user={user}
                highContrast={highContrast}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                addNotification={addNotification}
              />
            )}

            {currentTab === "profile" && user && (
              <ProfilePage
                user={user}
                highContrast={highContrast}
                onUpdateProfile={(updated) => setUser(updated)}
                onToggleContrast={() => setHighContrast(!highContrast)}
                addNotification={addNotification}
              />
            )}

            {currentTab === "locker" && (
              <DigitalLocker
                user={user}
                highContrast={highContrast}
                addNotification={addNotification}
              />
            )}
          </div>
        )}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
