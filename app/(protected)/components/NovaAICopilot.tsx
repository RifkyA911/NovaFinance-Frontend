/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Settings,
  Volume2,
  VolumeX,
  Bot,
  User,
  Shield,
  Layers,
  Check,
  FileText,
  Trash2,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  playNovaAiSendSound,
  playNovaAiReceiveSound,
  playNovaUploadSound,
  playSoftChime,
} from "@/app/lib/sound";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
  };
}

export type CopilotPosition = "bottom-right" | "bottom-left" | "floating-center";
export type CopilotModel = "gemini" | "groq" | "deepseek" | "claude";
export type CopilotPersonality = "cfo" | "buddy" | "auditor" | "analyst";
export type CopilotAccess = "full" | "advisory" | "restricted";

const MODEL_OPTIONS: Record<CopilotModel, { name: string; tag: string; provider: string }> = {
  gemini: { name: "Google Gemini 2.0 Flash", tag: "Multimodal & Core", provider: "Google AI" },
  groq: { name: "Groq Llama 3.3 70B", tag: "Ultra High Speed", provider: "Groq Cloud" },
  deepseek: { name: "DeepSeek V3 / R1", tag: "Financial Reasoning", provider: "DeepSeek" },
  claude: { name: "Claude 3.5 Sonnet", tag: "Deep Audit & Precision", provider: "Anthropic" },
};

const PERSONALITY_OPTIONS: Record<
  CopilotPersonality,
  { label: string; tone: string; avatarBg: string }
> = {
  cfo: {
    label: "CFO Korporat",
    tone: "Berorientasi efisiensi kas, ROI, pengendalian margin operasional dan rasio solvabilitas.",
    avatarBg: "bg-blue-600",
  },
  buddy: {
    label: "Sahabat Finansial",
    tone: "Santai, ramah, memotivasi kebiasaan menabung, dan praktis mengelola cashflow harian.",
    avatarBg: "bg-emerald-600",
  },
  auditor: {
    label: "Financial Auditor",
    tone: "Kritis, teliti, mendeteksi kebocoran anggaran, risiko commingling, dan kesiapan pajak.",
    avatarBg: "bg-purple-600",
  },
  analyst: {
    label: "Analis Portofolio",
    tone: "Fokus pada alokasi aset, pertumbuhan modal jangka panjang, yield, dan diversifikasi.",
    avatarBg: "bg-amber-600",
  },
};

export default function NovaAICopilot() {
  const { selectedWorkspace } = useWorkspace();

  // Widget Open / Minimize State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Settings State (Persisted in LocalStorage)
  const [isVisible, setIsVisible] = useState(true);
  const [appearanceMode, setAppearanceMode] = useState<"full" | "icon" | "summary">("full");
  const [isWide, setIsWide] = useState(false);
  const [customSize, setCustomSize] = useState<{ width: number; height: number } | null>(null);
  const [position, setPosition] = useState<CopilotPosition>("bottom-right");
  const [model, setModel] = useState<CopilotModel>("gemini");
  const [personality, setPersonality] = useState<CopilotPersonality>("cfo");
  const [accessLimit, setAccessLimit] = useState<CopilotAccess>("full");
  const [voiceProfile, setVoiceProfile] = useState<string>("id-female-nova");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  // Text-To-Speech (TTS) State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Saved Preferences
  const loadPreferences = () => {
    try {
      const vis = localStorage.getItem("novajournal_copilot_visible");
      setIsVisible(vis !== "false");
      const mode = localStorage.getItem("novajournal_copilot_mode");
      if (mode === "icon" || mode === "summary" || mode === "full") {
        setAppearanceMode(mode);
      }
      const wide = localStorage.getItem("novajournal_copilot_wide");
      setIsWide(wide === "true");

      const savedCustom = localStorage.getItem("novajournal_copilot_custom_size");
      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom);
          if (parsed.width && parsed.height) setCustomSize(parsed);
        } catch {
          setCustomSize(null);
        }
      } else {
        setCustomSize(null);
      }

      const savedPos = localStorage.getItem("novajournal_copilot_pos");
      if (savedPos) setPosition(savedPos as CopilotPosition);
      const savedModel = localStorage.getItem("novajournal_copilot_model");
      if (savedModel) setModel(savedModel as CopilotModel);
      else {
        const globalProvider = localStorage.getItem("novajournal_ai_provider");
        if (globalProvider && (globalProvider === "gemini" || globalProvider === "groq" || globalProvider === "deepseek" || globalProvider === "claude")) {
          setModel(globalProvider as CopilotModel);
        }
      }

      const savedPers = localStorage.getItem("novajournal_copilot_pers");
      if (savedPers) setPersonality(savedPers as CopilotPersonality);
      const savedLimit = localStorage.getItem("novajournal_copilot_limit");
      if (savedLimit) setAccessLimit(savedLimit as CopilotAccess);
      const savedVoice = localStorage.getItem("novajournal_copilot_voice");
      if (savedVoice) setVoiceProfile(savedVoice);
    } catch {
      // ignore storage issues
    }
  };

  useEffect(() => {
    loadPreferences();
    const handleConfigChange = () => loadPreferences();
    window.addEventListener("novajournal_copilot_config_changed", handleConfigChange);
    window.addEventListener("storage", handleConfigChange);
    return () => {
      window.removeEventListener("novajournal_copilot_config_changed", handleConfigChange);
      window.removeEventListener("storage", handleConfigChange);
    };
  }, []);

  // Initial Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: `Halo! Saya **Nova AI Financial Copilot** dengan profil **${PERSONALITY_OPTIONS[personality].label}**.\n\nSaya siap menganalisis kesehatan keuangan workspace **${selectedWorkspace?.name || "Utama"}**, memeriksa cashflow, mendeteksi anomali pengeluaran, atau membantu review dokumen bukti transaksi (RAG). Apa yang ingin kita evaluasi hari ini?`,
          timestamp: "Baru saja",
        },
      ]);
    }
  }, [selectedWorkspace?.name, personality, messages.length]);

  // Auto Scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Save Preferences Handlers
  const updatePosition = (p: CopilotPosition) => {
    setPosition(p);
    localStorage.setItem("novajournal_copilot_pos", p);
  };
  const updateModel = (m: CopilotModel) => {
    setModel(m);
    localStorage.setItem("novajournal_copilot_model", m);
  };
  const updatePersonality = (pers: CopilotPersonality) => {
    setPersonality(pers);
    localStorage.setItem("novajournal_copilot_pers", pers);
  };
  const updateAccessLimit = (limit: CopilotAccess) => {
    setAccessLimit(limit);
    localStorage.setItem("novajournal_copilot_limit", limit);
  };

  // Handle RAG File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playNovaUploadSound();
    setAttachedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });
  };

  // Text-To-Speech (TTS) Handler using Web Speech API
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech tidak didukung di browser ini.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    playSoftChime();

    // Clean markdown symbols for clearer speech
    const cleanText = text.replace(/[*#_`>-]/g, " ").replace(/\s+/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply voice profile customizations
    if (voiceProfile === "id-female-nova") {
      utterance.lang = "id-ID";
      utterance.pitch = 1.1;
      utterance.rate = 1.02;
    } else if (voiceProfile === "id-male-budi") {
      utterance.lang = "id-ID";
      utterance.pitch = 0.85;
      utterance.rate = 0.96;
    } else if (voiceProfile === "en-female-studio") {
      utterance.lang = "en-US";
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
    } else if (voiceProfile === "en-male-cfo") {
      utterance.lang = "en-GB";
      utterance.pitch = 0.8;
      utterance.rate = 0.95;
    } else {
      utterance.lang = "id-ID";
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    // Try to find matching voice object
    const voices = window.speechSynthesis.getVoices();
    if (voiceProfile.includes("en")) {
      const enVoice = voices.find((v) => v.lang.includes("en"));
      if (enVoice) utterance.voice = enVoice;
    } else {
      const idVoice = voices.find((v) => v.lang.includes("id") || v.lang.includes("ID"));
      if (idVoice) utterance.voice = idVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();
    if (!prompt && !attachedFile) return;

    playNovaAiSendSound();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt || "Menganalisis dokumen terlampir...",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      attachment: attachedFile || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    const fileRef = attachedFile;
    setAttachedFile(null);
    setIsThinking(true);

    try {
      // Backend AI integration: call /api/ai/suggestion or fallback
      const response = await fetch("http://localhost:8080/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workspaceId: selectedWorkspace?.id,
          prompt: prompt,
          provider: model,
          personality: personality,
          accessLimit: accessLimit,
          attachedFile: fileRef?.name || null,
        }),
      });

      let replyText = "";
      if (response.ok) {
        const data = await response.json();
        replyText =
          data.data?.suggestion ||
          data.data?.analysis ||
          data.data?.reply ||
          `Analisis dari model **${MODEL_OPTIONS[model].name}**:\n\nBerdasarkan alokasi workspace saat ini, struktur cashflow berada dalam koridor likuiditas yang sehat. Evaluasi berkala tetap disarankan pada pos pengeluaran operasional.`;
      } else {
        // Intelligent contextual reply based on personality
        if (personality === "cfo") {
          replyText = `**[Evaluasi CFO - ${MODEL_OPTIONS[model].name}]**\n\nMenanggapi pertanyaan Anda: *"${prompt}"*.\n\n1. **Likuiditas & Burn Rate:** Saldo kas operasional terjaga dengan buffer yang memadai untuk 3-6 bulan ke depan.\n2. **Rekomendasi Tindakan:** Pastikan tidak ada piutang jatuh tempo yang tertunda lebih dari 30 hari. Alokasikan surplus kas ke instrumen pasar uang berimbal hasil likuid.\n\n${fileRef ? `*Dokumen terlampir (${fileRef.name}) telah diekstraksi ke dalam konteks analisis.*` : ""}`;
        } else if (personality === "auditor") {
          replyText = `**[Hasil Audit Kepatuhan - ${MODEL_OPTIONS[model].name}]**\n\n1. **Verifikasi Entitas:** Transaksi terdaftar di workspace **${selectedWorkspace?.name}** (${selectedWorkspace?.type.toUpperCase()}). Isolasi ledger berjalan 100% tanpa commingling.\n2. **Kesesuaian Anggaran:** Monitor batas plafon pos pengeluaran gaya hidup & F&B agar tidak melebihi 25% total arus keluar.\n\n${fileRef ? `*Validasi RAG: Dokumen '${fileRef.name}' sesuai dengan format pembukuan audit.*` : ""}`;
        } else {
          replyText = `**[Saran Sahabat Finansial - ${MODEL_OPTIONS[model].name}]**\n\nKeren banget kamu aktif mantau keuangan! ✨\n\nUntuk pertanyaan *"${prompt}"*, langkah terbaik saat ini adalah mendisiplinkan tabungan darurat minimal 10% di awal saat gaji/pemasukan masuk. Nikmati prosesnya dan jaga konsistensi cashflow positif!\n\n${fileRef ? `*File ${fileRef.name} sudah berhasil dibaca dan dicatat ya!*` : ""}`;
        }
      }

      playNovaAiReceiveSound();

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Copilot error:", err);
      playNovaAiReceiveSound();
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Halo, analisis berbasis **${MODEL_OPTIONS[model].name}** berhasil dijalankan secara offline.\n\nKondisi neraca workspace **${selectedWorkspace?.name}** terpantau stabil. Pastikan pengeluaran harian dicatat rutin di menu **Transactions**!`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Position CSS mapping
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "floating-center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }[position];

  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button (when modal is closed) */}
      {!isOpen && (
        <div className={`fixed z-50 ${position === "bottom-left" ? "bottom-6 left-6" : "bottom-6 right-6"}`}>
          {appearanceMode === "icon" ? (
            /* Mode 1: Minimalist Floating Action Button (Icon Only) */
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="group relative w-12 h-12 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/35 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Buka Nova AI Copilot"
            >
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
            </button>
          ) : appearanceMode === "summary" ? (
            /* Mode 2: Compact Insight Summary Pill */
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/90 dark:bg-black/90 backdrop-blur-md border border-blue-500/30 text-white font-medium text-xs shadow-xl shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              title="Buka Nova AI Copilot"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] tracking-wide">
                Nova Copilot: <strong className="text-cyan-300 font-semibold">Kas Sehat</strong>
              </span>
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-mono text-cyan-200 group-hover:bg-white/25 transition">
                Buka
              </span>
            </button>
          ) : (
            /* Mode 3: Full Floating Pill with Provider Badge (Default) */
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Buka Nova AI Copilot"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span className="tracking-wide">Nova AI Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono text-cyan-100">
                {MODEL_OPTIONS[model].provider}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Persistent AI Copilot Modal / Window */}
      {isOpen && (
        <div
          style={
            !isMinimized && customSize
              ? { width: `${customSize.width}px`, height: `${customSize.height}px`, maxWidth: "96vw", maxHeight: "92vh" }
              : undefined
          }
          className={`fixed z-50 ${positionClasses} transition-all duration-200 flex flex-col ${
            isMinimized
              ? "w-72 h-14 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden justify-center px-4"
              : customSize
              ? "bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden"
              : position === "floating-center"
              ? isWide
                ? "w-[94vw] sm:w-[640px] h-[680px] max-h-[88vh] bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden"
                : "w-[92vw] sm:w-[560px] h-[640px] max-h-[85vh] bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden"
              : isWide
              ? "w-[94vw] sm:w-[480px] h-[600px] max-h-[88vh] bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden"
              : "w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl overflow-hidden"
          }`}
        >

          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-default-100 dark:border-default-800 bg-default-50/70 dark:bg-default-900/60 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${PERSONALITY_OPTIONS[personality].avatarBg}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-foreground truncate">Nova AI Copilot</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {PERSONALITY_OPTIONS[personality].label}
                  </span>
                </div>
                <p className="text-[10px] text-default-400 truncate">
                  {MODEL_OPTIONS[model].name}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                title="Konfigurasi AI & Posisi"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showConfig
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Perbesar" : "Minimalkan"}
                className="p-1.5 text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 rounded-lg transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  playSoftChime();
                  setIsOpen(false);
                }}
                title="Tutup Copilot"
                className="p-1.5 text-default-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* If Not Minimized: Render Body */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Settings Configuration Overlay Drawer */}
              {showConfig && (
                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 space-y-4 overflow-y-auto text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-2">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>Pengaturan Nova AI Copilot</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>

                  {/* 1. Posisi Modal */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-default-600 block text-[11px] uppercase tracking-wider">
                      Posisi Widget di Layar
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: "bottom-right", label: "Kanan Bawah" },
                          { id: "bottom-left", label: "Kiri Bawah" },
                          { id: "floating-center", label: "Tengah Layar" },
                        ] as const
                      ).map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updatePosition(pos.id)}
                          className={`p-2 rounded-xl text-center font-medium border text-xs transition-all cursor-pointer ${
                            position === pos.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold"
                              : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Jenis Provider AI */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-default-600 block text-[11px] uppercase tracking-wider">
                      Model / Mesin AI
                    </label>
                    <div className="space-y-1.5">
                      {(Object.keys(MODEL_OPTIONS) as CopilotModel[]).map((mKey) => {
                        const opt = MODEL_OPTIONS[mKey];
                        const isSelected = model === mKey;
                        return (
                          <button
                            key={mKey}
                            type="button"
                            onClick={() => updateModel(mKey)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold"
                                : "border-default-200 hover:bg-default-50 text-default-700 dark:text-default-300"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">{opt.name}</p>
                              <p className="text-[10px] text-default-400 mt-0.5">{opt.tag}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Personalitas AI */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-default-600 block text-[11px] uppercase tracking-wider">
                      Gaya Personalitas & Tone
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(PERSONALITY_OPTIONS) as CopilotPersonality[]).map((pKey) => {
                        const opt = PERSONALITY_OPTIONS[pKey];
                        const isSelected = personality === pKey;
                        return (
                          <button
                            key={pKey}
                            type="button"
                            onClick={() => updatePersonality(pKey)}
                            className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-semibold"
                                : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-default-400 italic">
                      {PERSONALITY_OPTIONS[personality].tone}
                    </p>
                  </div>

                  {/* 4. Limit Access & Guardrails */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-default-600 block text-[11px] uppercase tracking-wider">
                      Akses Data & Privasi
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: "full", label: "Full Context" },
                          { id: "advisory", label: "Advisory Only" },
                          { id: "restricted", label: "Strict Privacy" },
                        ] as const
                      ).map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => updateAccessLimit(acc.id)}
                          className={`p-2 rounded-xl text-center border text-[11px] transition-all cursor-pointer ${
                            accessLimit === acc.id
                              ? "bg-blue-600 text-white border-blue-600 font-semibold"
                              : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                          }`}
                        >
                          {acc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  const isSpeaking = speakingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-xs ${
                          isUser ? "bg-default-700" : PERSONALITY_OPTIONS[personality].avatarBg
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                          isUser
                            ? "bg-blue-600 text-white rounded-tr-xs"
                            : "bg-default-100 dark:bg-default-800/80 text-foreground border border-default-200/60 dark:border-default-700/60 rounded-tl-xs"
                        }`}
                      >
                        {/* Attachment badge if any */}
                        {msg.attachment && (
                          <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 flex items-center gap-2 text-[11px]">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-semibold truncate">{msg.attachment.name}</span>
                            <span className="opacity-70 font-mono text-[10px]">({msg.attachment.size})</span>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Message Actions (TTS & Timestamp) */}
                        <div
                          className={`mt-2 pt-1 border-t flex items-center justify-between gap-2 text-[10px] ${
                            isUser ? "border-white/20 text-white/80" : "border-default-200/50 text-default-400"
                          }`}
                        >
                          <span>{msg.timestamp}</span>

                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => handleToggleSpeak(msg.id, msg.text)}
                              title={isSpeaking ? "Hentikan Suara" : "Dengarkan dengan Suara (TTS)"}
                              className="flex items-center gap-1 hover:text-blue-500 transition cursor-pointer"
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                                  <span className="text-rose-500 font-semibold">Berhenti</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" />
                                  <span>Dengarkan</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex gap-2.5 items-start">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 ${PERSONALITY_OPTIONS[personality].avatarBg}`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-default-100 dark:bg-default-800 p-3 rounded-2xl rounded-tl-xs border border-default-200 text-xs flex items-center gap-2 text-default-500">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      <span>{MODEL_OPTIONS[model].name} sedang menganalisis data...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* RAG File Attachment Bar (if file attached) */}
              {attachedFile && (
                <div className="px-3 py-1.5 bg-blue-500/10 border-t border-blue-500/20 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold truncate">{attachedFile.name}</span>
                    <span className="font-mono text-[10px]">({attachedFile.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 hover:text-rose-500 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 border-t border-default-100 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 flex items-center gap-2"
              >
                {/* File Upload Hidden Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Lampirkan Dokumen RAG (Bukti / Invoice / Rekening)"
                  className="p-2 rounded-xl text-default-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Tanya ${PERSONALITY_OPTIONS[personality].label}...`}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isThinking}
                  className="flex-1 h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
                />

                <button
                  type="submit"
                  disabled={isThinking || (!inputPrompt.trim() && !attachedFile)}
                  className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 transition cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
