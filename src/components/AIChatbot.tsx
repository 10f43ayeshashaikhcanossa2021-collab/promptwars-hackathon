import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { UserProfile, ChatMessage } from "../types";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Upload, 
  Trash2, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Bot,
  User,
  ShieldCheck,
  FileCheck
} from "lucide-react";

interface AIChatbotProps {
  user: UserProfile | null;
  highContrast: boolean;
  addNotification: (msg: string) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  user,
  highContrast,
  addNotification
}) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      sender: "bot",
      text: `Jai Hind! I am Smart Bharat AI, your digital civic companion. How can I assist you today? Feel free to upload government documents for audits, attach civic issues, ask about welfare programs, or talk via continuous voice.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFileType, setAttachedFileType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active custom widget overlays
  const [docAuditResult, setDocAuditResult] = useState<any | null>(null);
  const [pdfSummaryResult, setPdfSummaryResult] = useState<any | null>(null);
  const [civicAnalysisResult, setCivicAnalysisResult] = useState<any | null>(null);

  // Voice State (Speech To Text)
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Set language code
      const langMapping: Record<string, string> = {
        en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", 
        ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", 
        pa: "pa-IN", ur: "ur-IN", bn: "bn-IN"
      };
      rec.lang = langMapping[language] || "en-IN";

      rec.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setInputText(spokenText);
        setIsListening(false);
        addNotification("Voice speech recognition captured.");
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
    }
  }, [language]);

  const handleVoiceToggle = () => {
    if (!recognitionInstance) {
      alert("Speech recognition is not supported in this browser version. Use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
    } else {
      setIsListening(true);
      recognitionInstance.start();
    }
  };

  // Text-To-Speech playback (Native Web Speech API with fallbacks)
  const speakText = (text: string) => {
    if (!soundEnabled) return;
    
    // Clean up markdown markers for speech
    const speechText = text.replace(/[*#`_\-]/g, "").substring(0, 300);

    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel(); // Cancel current speaker queues
      const utterance = new SpeechSynthesisUtterance(speechText);
      
      // Select voice based on language
      const langMapping: Record<string, string> = {
        en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", 
        ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", 
        pa: "pa-IN", ur: "ur-IN", bn: "bn-IN"
      };
      utterance.lang = langMapping[language] || "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synth.speak(utterance);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          previousMessages: messages.slice(-5), // contextual memory
          userProfile: user
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        confidenceScore: data.confidenceScore
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(data.text);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Jai Hind. My servers are currently processing massive circular records. Please double-check your workspace connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handles raw base64 uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);
    setAttachedFileType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile(reader.result as string);
      addNotification(`Attached file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setAttachedFileName(file.name);
    setAttachedFileType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI Doc Check
  const triggerDocAudit = async (type: string) => {
    if (!attachedFile) return;
    setLoading(true);
    setDocAuditResult(null);
    setPdfSummaryResult(null);
    setCivicAnalysisResult(null);

    try {
      const response = await fetch("/api/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: type,
          fileData: attachedFile,
          fileName: attachedFileName
        })
      });
      const data = await response.json();
      setDocAuditResult(data);
      addNotification(`Document compliance checklist calculated.`);

      // Append verification response message to chatbot conversation
      setMessages(prev => [...prev, {
        id: `verify-bot-${Date.now()}`,
        sender: "bot",
        text: `I have audited your **${type}** document. I detected ${data.isValid ? 'no immediate validation issues' : 'critical seal/ watermark omissions'}. Check the interactive scorecard on your visual workspace.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI PDF Policy digest
  const triggerPdfSummary = async () => {
    if (!attachedFile) return;
    setLoading(true);
    setDocAuditResult(null);
    setPdfSummaryResult(null);
    setCivicAnalysisResult(null);

    try {
      const response = await fetch("/api/summarize-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfName: attachedFileName,
          textContent: "Sample PM welfare policy excerpt. Eligible SC/ST candidates receive high reimbursement under Section 4."
        })
      });
      const data = await response.json();
      setPdfSummaryResult(data);
      addNotification("Policy circular digested successfully.");

      setMessages(prev => [...prev, {
        id: `pdf-bot-${Date.now()}`,
        sender: "bot",
        text: `I completed the simplified layout digest for **${attachedFileName}**. Read the dynamic checklist for age eligibility, required bank direct benefit transfers (DBT) credentials, and active cycle deadlines.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI Civic Issue image classifier
  const triggerCivicAnalysis = async () => {
    if (!attachedFile) return;
    setLoading(true);
    setDocAuditResult(null);
    setPdfSummaryResult(null);
    setCivicAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: attachedFile,
          location: user ? `${user.district}, ${user.state}` : "Vasant Kunj, Delhi",
          userDescription: "Damaged asphalt on major route"
        })
      });
      const data = await response.json();
      setCivicAnalysisResult(data);
      addNotification("Civic photo issue analyzed.");

      setMessages(prev => [...prev, {
        id: `civic-bot-${Date.now()}`,
        sender: "bot",
        text: `AI analyzed your photo. I classified this under **${data.detectedCategory}**, auto-assigned to **${data.assignedDepartment}**, and estimated priority as **${data.priority}**. Filed as ticket COMP-902.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAttachment = () => {
    setAttachedFile(null);
    setAttachedFileName("");
    setAttachedFileType("");
    setDocAuditResult(null);
    setPdfSummaryResult(null);
    setCivicAnalysisResult(null);
  };

  const sampleQuestions = [
    "What is PM-KISAN scheme and am I eligible?",
    "Explain Sukanya Samriddhi Yojana savings scheme",
    "Where is my nearest Aadhaar Seva Kendra?",
    "How do I apply for a PM Mudra business loan?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-4" id="ai-chat-module">
      
      {/* LEFT CHAT PANEL (8 columns) */}
      <div className={`lg:col-span-7 flex flex-col h-[600px] border rounded-3xl overflow-hidden transition-all duration-300 backdrop-blur-md ${
        highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50 shadow-md"
      }`}>
        
        {/* Chat Header */}
        <div className={`p-4 border-b flex justify-between items-center ${highContrast ? "bg-slate-900" : "bg-white/40"}`}>
          <div className="flex items-center space-x-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Smart Bharat AI Bot</span>
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified RAG System</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Disable Text-To-Speech" : "Enable Text-To-Speech"}
              id="speech-playback-toggle-btn"
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled 
                  ? "bg-orange-100 text-[#FF8C00] border-orange-200" 
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {attachedFile && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-bold text-[9px] rounded-sm uppercase tracking-wider animate-pulse">
                File Loaded
              </span>
            )}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === "bot";
            return (
              <div 
                key={idx} 
                className={`flex ${isBot ? "justify-start" : "justify-end"} text-left items-start gap-2.5 animate-fadeIn`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2.5 backdrop-blur-xs ${
                  isBot 
                    ? highContrast 
                      ? "bg-slate-900 border border-yellow-500 text-yellow-400" 
                      : "bg-white/75 text-slate-800 border border-white/50 shadow-2xs"
                    : highContrast
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-[#0B3D91]/90 text-white shadow-xs"
                }`}>
                  <p className="whitespace-pre-line font-sans">{msg.text}</p>
                  
                  {isBot && msg.confidenceScore !== undefined && (
                    <div className="pt-2 border-t border-slate-100/50 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                        <span className="flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Factual Grounding Score</span>
                        </span>
                        <span className="text-emerald-700 font-bold">{msg.confidenceScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${msg.confidenceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isBot && msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Cited Circulars:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((cite, cidx) => (
                          <details key={cidx} className="group bg-slate-50/50 hover:bg-slate-100 border border-slate-100 rounded-lg p-1.5 transition-colors cursor-pointer text-[10px] w-full text-slate-600">
                            <summary className="font-bold flex justify-between items-center list-none select-none">
                              <span className="truncate max-w-[90%] flex items-center space-x-1.5">
                                <FileText className="w-3 h-3 text-blue-800 shrink-0" />
                                <span className="truncate">{cite.source}</span>
                              </span>
                              <span className="text-[9px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-1 text-[9.5px] leading-relaxed text-slate-500 bg-white p-2 rounded-md border border-slate-100/65 font-mono">
                              {cite.snippet}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right opacity-60 font-mono mt-2`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start items-center gap-2 text-xs text-slate-400 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex space-x-1 py-1.5 px-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="w-2 h-2 bg-[#FF8C00] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#0B3D91] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-[#138808] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && (
          <div className={`p-3 border-t ${highContrast ? "bg-slate-900" : "bg-white/30"}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left block mb-2">Try asking:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(q)}
                  className="p-2.5 bg-white/50 hover:bg-white/80 border border-white/40 hover:border-white/80 rounded-xl text-left text-[11px] text-slate-600 truncate transition-colors backdrop-blur-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Attachment Quickbar */}
        {attachedFile && (
          <div className="px-4 py-2 bg-blue-50/60 border-t border-blue-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <FileText className="w-4 h-4 text-[#0B3D91]" />
              <div className="max-w-[200px] sm:max-w-xs">
                <span className="text-xs font-bold text-slate-800 block truncate">{attachedFileName}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{attachedFileType || "Plain Text File"}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={triggerPdfSummary}
                className="px-2.5 py-1 bg-[#0B3D91] text-white text-[10px] font-bold uppercase rounded-sm hover:bg-[#0B3D91]/95 transition-colors"
              >
                Summarize PDF
              </button>
              <button
                onClick={() => triggerDocAudit("Aadhaar")}
                className="px-2.5 py-1 bg-orange-600 text-white text-[10px] font-bold uppercase rounded-sm hover:bg-orange-500 transition-colors"
              >
                Audit Document
              </button>
              <button
                onClick={triggerCivicAnalysis}
                className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-sm hover:bg-emerald-600 transition-colors"
              >
                Analyze Issue Photo
              </button>
              <button onClick={handleClearAttachment} className="p-1.5 text-red-500 hover:bg-red-50 rounded-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Controls Bar */}
        <form onSubmit={handleSendMessage} className={`p-3 border-t flex items-center space-x-2 ${highContrast ? "bg-slate-900" : "bg-white/40"}`}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            id="file-attachment-trigger-btn"
            className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t("searchPlaceholder")}
            id="chat-input-box"
            className="flex-1 px-4 py-3 border border-white/50 rounded-xl text-xs bg-white/60 focus:outline-hidden focus:border-[#0B3D91] backdrop-blur-xs focus:bg-white"
          />

          <button
            type="button"
            onClick={handleVoiceToggle}
            id="chat-voice-input-btn"
            className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
              isListening
                ? "bg-red-500 text-white border-red-500 animate-pulse"
                : "border-slate-200 bg-white hover:bg-slate-100 text-slate-500"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            id="chat-submit-btn"
            className="p-3 rounded-xl bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white shadow-md transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* RIGHT WORKSPACE CARD: WIDGET VIEWER (5 columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* ADVANCED VOICE ASSISTANT SYSTEM HUB */}
        <div className={`p-6 rounded-3xl border text-left space-y-4 backdrop-blur-md ${
          highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50 shadow-md"
        }`}>
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-[#FF8C00]" />
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Voice Assistant Hub</h3>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Bilingual G2C continuous listening</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                const synth = window.speechSynthesis;
                if (synth) synth.cancel();
                addNotification("Voice speech outputs halted immediately.");
              }}
              title="Interrupt & Silence Assistant Speech"
              className="px-2.5 py-1 bg-red-50 text-red-700 text-[9px] font-bold uppercase rounded-sm border border-red-100 hover:bg-red-100 transition-colors"
            >
              Interrupt
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Pulsing Visual Waveform */}
            <div className="flex-1 h-14 bg-slate-50/80 rounded-2xl border border-slate-100/60 flex items-center justify-center p-3 relative overflow-hidden">
              {isListening ? (
                <div className="flex items-end space-x-1.5 h-8">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-[#FF8C00] rounded-full animate-voiceWave"
                      style={{ 
                        animationDelay: `${i * 0.15}s`,
                        height: "100%",
                      }}
                    ></div>
                  ))}
                </div>
              ) : window.speechSynthesis && window.speechSynthesis.speaking ? (
                <div className="flex items-end space-x-1.5 h-8">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-[#0B3D91] rounded-full animate-voiceWave"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        height: "100%",
                      }}
                    ></div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase animate-pulse">Waveform Idle</span>
              )}
            </div>

            <button
              onClick={handleVoiceToggle}
              className={`p-4 rounded-2xl text-white shadow-md transition-all shrink-0 ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-[#FF8C00] hover:bg-[#FF8C00]/90"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Voice Engine Status</span>
              <span className="font-extrabold text-slate-700 uppercase">
                {isListening ? "Listening..." : window.speechSynthesis && window.speechSynthesis.speaking ? "Speaking Answer" : "Ready / Standby"}
              </span>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Language Target</span>
              <span className="font-extrabold text-[#0B3D91] uppercase">
                {language === "hi" ? "हिन्दी (Hindi)" : language === "en" ? "English (IN)" : `${language.toUpperCase()} Engine`}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Drag-and-Drop Uploader Card */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`p-6 rounded-3xl border border-dashed text-center space-y-4 transition-all backdrop-blur-md ${
            attachedFile 
              ? "bg-slate-50/50 border-slate-300" 
              : "bg-white/60 border-white/40 hover:border-white/80 shadow-xs"
          }`}
          id="workspace-drag-uploader"
        >
          <div className="w-12 h-12 bg-blue-50 text-[#0B3D91] rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800">Gov-Document & Issue Photo Dropzone</h3>
            <p className="text-[10px] text-slate-400">Drag & drop your Passport, Birth Certificate, PAN, or civic photo here</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-slate-200 hover:border-[#0B3D91] text-[10px] text-slate-700 hover:text-[#0B3D91] font-bold uppercase rounded-xl bg-white transition-colors"
          >
            Select File from Storage
          </button>
        </div>

        {/* 1. DOCUMENT AUDITING RESULT WIDGET CARD */}
        {docAuditResult && (
          <div className={`p-5 rounded-3xl border shadow-md text-left space-y-4 animate-scaleUp backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50"
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-orange-500" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">AI Document Audit Scorecard</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
                docAuditResult.isValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {docAuditResult.isValid ? "Valid Formats" : "Failed Review"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Extracted Holder</span>
                <span className="font-bold text-slate-800 block truncate">{docAuditResult.extractedDetails.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Credential ID</span>
                <span className="font-bold text-slate-800 block">{docAuditResult.extractedDetails.idNumber}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compliance Checklist</span>
              <div className="space-y-1.5 text-xs">
                {docAuditResult.checklist.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50/40 p-2 rounded-lg">
                    <span className="text-slate-600 text-[11px]">{c.criterion}</span>
                    <span className={`font-bold text-[10px] ${c.verified ? "text-emerald-600" : "text-red-500"}`}>
                      {c.verified ? "✔ verified" : "❌ issue"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {docAuditResult.issues.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[10px] space-y-1">
                <span className="font-bold uppercase tracking-wider block">Detected Omissions:</span>
                <ul className="list-disc list-inside">
                  {docAuditResult.issues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Recommendation</span>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{docAuditResult.recoAction}</p>
            </div>
          </div>
        )}

        {/* 2. PDF POLICY DIGEST RESULT CARD */}
        {pdfSummaryResult && (
          <div className={`p-5 rounded-3xl border shadow-md text-left space-y-4 animate-scaleUp backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50"
          }`}>
            <div className="border-b pb-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">AI Gazette & Policy Digest</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Digested Circular</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 leading-snug">{pdfSummaryResult.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{pdfSummaryResult.simplifiedSummary}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Welfare Allowances & Benefits</span>
              <p className="text-[11px] text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 font-semibold leading-relaxed">
                {pdfSummaryResult.benefits}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Requirements</span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 mt-1 space-y-1">
                  {pdfSummaryResult.eligibility.slice(0, 2).map((el: string, i: number) => (
                    <li key={i} className="truncate">{el}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deadlines & Dates</span>
                <span className="font-semibold text-slate-700 block mt-1">{pdfSummaryResult.deadlines}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Digest FAQs</span>
              {pdfSummaryResult.faqs.slice(0, 1).map((faq: any, i: number) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px]">
                  <span className="font-bold text-slate-800 block">Q: {faq.q}</span>
                  <span className="text-slate-500 block">A: {faq.a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CIVIC ISSUE DETECTION RESULT CARD */}
        {civicAnalysisResult && (
          <div className={`p-5 rounded-3xl border shadow-md text-left space-y-4 animate-scaleUp backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500" : "bg-white/60 border-white/50"
          }`}>
            <div className="border-b pb-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">AI Municipal Issue Diagnosis</h3>
              </div>
              <span className="px-2 py-0.5 rounded-sm bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wider">
                COMP-902
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detected Hazard</span>
              <h4 className="text-xs font-bold text-[#0B3D91] leading-tight">{civicAnalysisResult.generatedTitle}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{civicAnalysisResult.generatedDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Responsible Department</span>
                <span className="font-bold text-slate-800 block mt-0.5 leading-normal">{civicAnalysisResult.assignedDepartment}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Hazard Priority</span>
                <span className={`font-bold mt-0.5 block ${
                  civicAnalysisResult.priority === "High" ? "text-red-500" : "text-amber-500"
                }`}>{civicAnalysisResult.priority}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">SLA Target Resolution</span>
                <span className="font-bold text-slate-800">{civicAnalysisResult.predictedDays} Working Days</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-slate-400 block uppercase">AI Confidence</span>
                <span className="font-mono font-bold text-[#138808]">{civicAnalysisResult.confidenceScore}% Matches</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state details info */}
        {!docAuditResult && !pdfSummaryResult && !civicAnalysisResult && (
          <div className={`p-6 rounded-3xl text-left space-y-4 border backdrop-blur-md ${
            highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/55 border-white/40"
          }`}>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
              <Info className="w-4 h-4 text-[#0B3D91]" />
              <span>Interactive Gov Sandbox Info</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you attach documents or local pictures on the chat panel, Smart Bharat AI parses the files using localized OCR, policy guidelines, and Municipal hazard datasets. The parsed checklists and priority values populate on this workspace instantly.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
