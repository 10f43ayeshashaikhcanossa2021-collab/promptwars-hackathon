import React, { useState } from "react";
import { useLanguage, LANGUAGES, LanguageCode } from "./LanguageContext";
import { Role, UserProfile } from "../types";
import { 
  Building, 
  Languages, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Moon, 
  Sun, 
  BellRing
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  notifications: string[];
  clearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onLogout,
  onOpenAuth,
  highContrast,
  setHighContrast,
  notifications,
  clearNotifications
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: t("navHome") },
    { id: "chat", label: t("navChat"), icon: Sparkles },
    { id: "locker", label: "DigiLocker" },
    { id: "services", label: t("navServices") },
    { id: "complaints", label: t("navComplaints") },
    { id: "schemes", label: t("navSchemes") },
    { id: "dashboard", label: t("navDashboard") }
  ];

  const handleLangChange = (code: LanguageCode) => {
    setLanguage(code);
    setLangMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
      highContrast 
        ? "bg-black border-yellow-500 text-yellow-400" 
        : "bg-white/60 backdrop-blur-xl border-white/50 text-slate-800 shadow-xs"
    }`}>
      {/* Saffron, White, Green top strip (Flag of India theme) */}
      <div className="h-[5px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF8C00]"></div>
        <div className="h-full w-1/3 bg-[#FFFFFF]"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & National Emblem */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentTab("home")}
            id="brand-logo"
          >
            {/* Minimalist Ashok Chakra Emblem Representation */}
            <div className="relative w-10 h-10 rounded-full border border-blue-800 flex items-center justify-center bg-blue-50/50">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-blue-900 animate-spin" style={{ animationDuration: "120s" }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif font-bold text-blue-900 text-[10px]">सत्य</span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className={`font-display font-bold text-lg tracking-tight ${highContrast ? "text-yellow-400" : "text-[#0B3D91]"}`}>
                  {t("appTitle")}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded-sm">
                  {t("verifiedBadge")}
                </span>
              </div>
              <span className={`text-[10px] tracking-wide font-sans ${highContrast ? "text-yellow-300" : "text-slate-500"} uppercase hidden sm:block`}>
                {t("appSubtitle")}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-150 flex items-center space-x-1.5 ${
                    isActive
                      ? highContrast
                        ? "bg-yellow-400 text-black border border-black"
                        : "bg-[#0B3D91]/10 text-[#0B3D91] font-semibold"
                      : highContrast
                      ? "text-yellow-400 hover:bg-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utility Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Contrast Switcher */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              title={highContrast ? "Normal Mode" : "High Contrast Mode"}
              id="contrast-toggle-btn"
              className={`p-2 rounded-xl border transition-colors ${
                highContrast 
                  ? "border-yellow-400 text-yellow-400 hover:bg-slate-900" 
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                id="language-selector-btn"
                className={`p-2 rounded-xl border transition-colors flex items-center space-x-1 ${
                  highContrast 
                    ? "border-yellow-400 text-yellow-400 hover:bg-slate-900" 
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">{language}</span>
              </button>

              {langMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 backdrop-blur-xl ${
                  highContrast ? "bg-black border-yellow-500" : "bg-white/70 border-white/50 text-slate-800"
                }`}>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center ${
                          language === lang.code
                            ? highContrast ? "bg-yellow-400 text-black font-bold" : "bg-[#0B3D91]/10 text-[#0B3D91] font-semibold"
                            : highContrast ? "text-yellow-400 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="opacity-60">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Badge */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  id="notifications-btn"
                  className={`p-2 rounded-xl border transition-colors relative ${
                    highContrast 
                      ? "border-yellow-400 text-yellow-400 hover:bg-slate-900" 
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {notifMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border overflow-hidden z-50 backdrop-blur-xl ${
                    highContrast ? "bg-black border-yellow-500" : "bg-white/70 border-white/50 text-slate-800"
                  }`}>
                    <div className="p-3 border-b flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">Alerts</span>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] text-red-500 font-semibold hover:underline">
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="py-1 max-h-56 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs opacity-60">No new alerts</div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="px-4 py-2.5 border-b last:border-0 text-xs">
                            {notif}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login/Profile actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="profile-tab-btn"
                  onClick={() => setCurrentTab("profile")}
                  className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-colors text-xs font-semibold uppercase ${
                    currentTab === "profile"
                      ? highContrast ? "bg-yellow-400 text-black" : "bg-slate-100 border-slate-300 text-slate-800"
                      : highContrast ? "border-yellow-400 text-yellow-400 hover:bg-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{user.fullName.split(" ")[0]}</span>
                </button>
                <button
                  onClick={onLogout}
                  id="logout-btn"
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold uppercase tracking-wide border transition-all ${
                    highContrast
                      ? "border-red-500 text-red-500 hover:bg-red-950"
                      : "border-red-100 text-red-600 hover:bg-red-50 bg-red-50/20"
                  }`}
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                id="login-gateway-btn"
                className={`px-4 py-2 text-xs rounded-xl font-bold uppercase tracking-wide transition-all ${
                  highContrast
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-[#0B3D91] text-white hover:bg-[#0B3D91]/90 hover:shadow-lg shadow-sm"
                }`}
              >
                {t("login")}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t p-4 space-y-2 animate-fadeIn ${
          highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white border-slate-100"
        }`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold tracking-wide flex items-center space-x-2 ${
                currentTab === item.id
                  ? highContrast ? "bg-yellow-400 text-black" : "bg-[#0B3D91]/10 text-[#0B3D91]"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          {user && (
            <button
              onClick={() => {
                setCurrentTab("profile");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>{t("navProfile")} ({user.role})</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
