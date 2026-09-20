/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  Cpu,
  Sparkles,
  Key,
  Shield,
  Bot,
  Volume2,
  Mic,
  Maximize2,
  Check,
  Save,
  CheckCircle2,
  Lock,
  User,
  Sliders,
  PlayCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
} from "lucide-react";
import { playSoftChime, playNovaSpaceSound, playNovaSuccessSound, playNovaErrorSound, playRealisticClick } from "@/app/lib/sound";
import { mutationFunctions } from "@/app/lib/queries";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { executeSettingsAction } from "@/app/lib/settingsNotifier";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

const AI_HUB_SECTIONS = [
  { id: "keys", name: "Kunci API & Gateway", shortName: "API Keys", icon: Key, color: "#8b5cf6" },
  { id: "copilot", name: "Mesin Model Agent", shortName: "Model Agent", icon: Bot, color: "#3b82f6" },
  { id: "persona", name: "Persona & Hak Privasi", shortName: "Persona", icon: User, color: "#f59e0b" },
  { id: "voice", name: "Suara TTS & Audio", shortName: "Suara TTS", icon: Mic, color: "#ec4899" },
  { id: "window", name: "Ukuran & Pinned Mode", shortName: "Jendela", icon: Maximize2, color: "#10b981" },
];

const AI_VAULT_SALT = "NovaJournal_Copilot_Vault_Salt_2026!#";

function encryptAiKey(plaintext: string): string {
  if (!plaintext) return "";
  try {
    const encoded = encodeURIComponent(plaintext);
    let result = "";
    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(encoded.charCodeAt(i) ^ AI_VAULT_SALT.charCodeAt(i % AI_VAULT_SALT.length));
    }
    return btoa(result);
  } catch {
    return plaintext;
  }
}

function decryptAiKey(ciphertext: string): string {
  if (!ciphertext) return "";
  try {
    const raw = atob(ciphertext);
    let decoded = "";
    for (let i = 0; i < raw.length; i++) {
      decoded += String.fromCharCode(raw.charCodeAt(i) ^ AI_VAULT_SALT.charCodeAt(i % AI_VAULT_SALT.length));
    }
    return decodeURIComponent(decoded);
  } catch {
    return ciphertext;
  }
}

export default function AiHubPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const { lang, t, isId } = useIntlLanguage();

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? (isId ? "Peringatan AI Hub" : "AI Hub Warning") : (isId ? "AI Hub & Agent" : "AI Hub & Agent"),
      description: msg,
    });
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // API Key Connectivity Testing
  const [testingKey, setTestingKey] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string; latency?: number }>>({});

  const handleTestKey = async (provider: "groq" | "gemini" | "deepseek" | "claude", keyVal: string) => {
    if (!keyVal || !keyVal.trim()) {
      showNotice(`Kunci API ${provider.toUpperCase()} masih kosong! Masukkan kunci terlebih dahulu.`);
      playNovaErrorSound();
      return;
    }

    setTestingKey((prev) => ({ ...prev, [provider]: true }));
    playRealisticClick();

    try {
      const res = await mutationFunctions.testAiKey(provider, keyVal.trim());
      if (res.success) {
        playNovaSuccessSound();
        const msg = res.message || `Koneksi ${provider.toUpperCase()} Berhasil!`;
        setTestResults((prev) => ({ ...prev, [provider]: { ok: true, msg, latency: res.latencyMs } }));
        showNotice(`✅ ${msg} (${res.latencyMs || 0}ms)`);

        if (res.models && res.models.length > 0 && provider === "groq") {
          try {
            localStorage.setItem("novajournal_groq_discovered_models", JSON.stringify(res.models));
          } catch {}
          if (!res.models.includes(groqModelVersion)) {
            const autoModel = res.models.find((m: string) => m.includes("8b-instant") || m.includes("70b") || m.includes("llama")) || res.models[0];
            if (autoModel) {
              setGroqModelVersion(autoModel);
              try { localStorage.setItem("novajournal_model_groq", autoModel); } catch {}
            }
          }
        }

        if (selectedWorkspace?.id) {
          mutationFunctions.recordAuditLog({
            workspaceId: selectedWorkspace.id,
            action: `ai.key_tested.${provider}`,
            entityType: "ai_configuration",
            newData: { provider, latencyMs: res.latencyMs, status: "success" },
          }).catch(() => {});
        }
      } else {
        playNovaErrorSound();
        const err = res.error || `Kunci ${provider.toUpperCase()} ditolak atau tidak valid.`;
        setTestResults((prev) => ({ ...prev, [provider]: { ok: false, msg: err, latency: res.latencyMs } }));
        showNotice(`❌ Gagal: ${err}`);
      }
    } catch (e: any) {
      playNovaErrorSound();
      const err = e.message || "Gagal menguji koneksi ke server AI.";
      setTestResults((prev) => ({ ...prev, [provider]: { ok: false, msg: err } }));
      showNotice(`❌ Error: ${err}`);
    } finally {
      setTestingKey((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const [testingChatGroq, setTestingChatGroq] = useState(false);
  const handleTestChatGroq = async () => {
    if (!groqKey || !groqKey.trim()) {
      showNotice("Masukkan API Key Groq terlebih dahulu di kolom Kunci API Groq!", true);
      playNovaErrorSound();
      return;
    }
    setTestingChatGroq(true);
    playRealisticClick();
    try {
      const res = await mutationFunctions.testAiChat({
        provider: "groq",
        apiKey: groqKey.trim(),
        model: groqModelVersion,
        proxyUrl: customProxyUrl,
      });
      if (res.success) {
        playNovaSuccessSound();
        if (res.usedModel && res.usedModel !== groqModelVersion) {
          setGroqModelVersion(res.usedModel);
          try { localStorage.setItem("novajournal_model_groq", res.usedModel); } catch {}
        }
        showNotice(`🎉 ${res.message || "Eksekusi Chat Berhasil!"} (${res.latencyMs || 0}ms)`);
        setTestResults((prev) => ({
          ...prev,
          groq: { ok: true, msg: `Chat Berhasil (${res.usedModel}): "${res.reply}"`, latency: res.latencyMs },
        }));
      } else {
        playNovaErrorSound();
        showNotice(`❌ Chat Test Gagal: ${res.error}`, true);
        setTestResults((prev) => ({
          ...prev,
          groq: { ok: false, msg: res.error || "Gagal", latency: res.latencyMs },
        }));
      }
    } catch (e: any) {
      playNovaErrorSound();
      showNotice(`❌ Chat Error: ${e.message}`, true);
    } finally {
      setTestingChatGroq(false);
    }
  };

  // Section 1: Multi-Provider API Keys
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [customProxyUrl, setCustomProxyUrl] = useState("");
  const [geminiModelVersion, setGeminiModelVersion] = useState("gemini-2.0-flash");
  const [groqModelVersion, setGroqModelVersion] = useState("llama-3.3-70b-versatile");
  const [deepseekModelVersion, setDeepseekModelVersion] = useState("deepseek-chat");
  const [claudeModelVersion, setClaudeModelVersion] = useState("claude-3-5-sonnet-20241022");
  const [aiRoutingStrategy, setAiRoutingStrategy] = useState<"fallback" | "round-robin" | "cost-first">("fallback");

  // Section 2: Nova AI Copilot & Voice
  const [showCopilot, setShowCopilot] = useState(true);
  const [copilotMode, setCopilotMode] = useState<"full" | "icon" | "summary">("full");
  const [copilotModel, setCopilotModel] = useState<"gemini" | "groq" | "deepseek" | "claude">("gemini");
  const [copilotPersona, setCopilotPersona] = useState<"cfo" | "buddy" | "auditor" | "analyst">("cfo");
  const [copilotVoice, setCopilotVoice] = useState("id-female-nova");
  const [copilotAccess, setCopilotAccess] = useState<"full" | "advisory" | "restricted">("full");
  const [copilotPinned, setCopilotPinned] = useState(false);
  const [copilotSound, setCopilotSound] = useState(true);
  const [copilotTts, setCopilotTts] = useState(true);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [customCopilotWidth, setCustomCopilotWidth] = useState(480);
  const [customCopilotHeight, setCustomCopilotHeight] = useState(620);

  // Anchor & Folding State
  const [activeSectionId, setActiveSectionId] = useState("keys");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    keys: false,
    copilot: false,
    persona: false,
    voice: false,
    window: false,
  });

  const toggleFold = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllFolded = Object.values(foldedSections).every(Boolean);
  const toggleAllSections = () => {
    playSoftChime();
    const nextState = !areAllFolded;
    setFoldedSections({
      keys: nextState,
      copilot: nextState,
      persona: nextState,
      voice: nextState,
      window: nextState,
    });
  };

  // Scroll listener for Section Anchor highlighting
  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = AI_HUB_SECTIONS[0].id;
      for (const sec of AI_HUB_SECTIONS) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            currentSecId = sec.id;
          }
        }
      }

      const scrollHeight = isWindow ? document.documentElement.scrollHeight : (container as HTMLElement).scrollHeight;
      const clientHeight = isWindow ? window.innerHeight : (container as HTMLElement).clientHeight;
      const currentScroll = isWindow ? window.scrollY : (container as HTMLElement).scrollTop;

      if (currentScroll + clientHeight >= scrollHeight - 60) {
        currentSecId = AI_HUB_SECTIONS[AI_HUB_SECTIONS.length - 1].id;
      }

      setActiveSectionId(currentSecId);
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSectionId(id);
      }
    }, 50);
  };

  const activeSec = AI_HUB_SECTIONS.find((s) => s.id === activeSectionId) || AI_HUB_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  const [keysLoaded, setKeysLoaded] = useState(false);

  // Load Saved Configuration on Mount (with Decryption)
  useEffect(() => {
    try {
      const gEnc = localStorage.getItem("novajournal_enc_api_gemini");
      const gPlain = localStorage.getItem("novajournal_api_gemini") || localStorage.getItem("novajournal_gemini_key");
      setGeminiKey(gEnc ? decryptAiKey(gEnc) : gPlain || "");

      const groqEnc = localStorage.getItem("novajournal_enc_api_groq");
      const groqPlain = localStorage.getItem("novajournal_api_groq") || localStorage.getItem("novajournal_groq_key") || localStorage.getItem("novajournal_ai_key");
      setGroqKey(groqEnc ? decryptAiKey(groqEnc) : groqPlain || "");

      const dsEnc = localStorage.getItem("novajournal_enc_api_deepseek");
      const dsPlain = localStorage.getItem("novajournal_api_deepseek") || localStorage.getItem("novajournal_deepseek_key");
      setDeepseekKey(dsEnc ? decryptAiKey(dsEnc) : dsPlain || "");

      const clEnc = localStorage.getItem("novajournal_enc_api_claude");
      const clPlain = localStorage.getItem("novajournal_api_claude") || localStorage.getItem("novajournal_claude_key");
      setClaudeKey(clEnc ? decryptAiKey(clEnc) : clPlain || "");

      setCustomProxyUrl(localStorage.getItem("novajournal_api_proxy") || "");

      setGeminiModelVersion(localStorage.getItem("novajournal_model_gemini") || "gemini-2.0-flash");
      setGroqModelVersion(localStorage.getItem("novajournal_model_groq") || "llama-3.3-70b-versatile");
      setDeepseekModelVersion(localStorage.getItem("novajournal_model_deepseek") || "deepseek-chat");
      setClaudeModelVersion(localStorage.getItem("novajournal_model_claude") || "claude-3-5-sonnet-20241022");

      const savedStrategy = localStorage.getItem("novajournal_ai_strategy");
      if (savedStrategy) setAiRoutingStrategy(savedStrategy as any);

      const copilotVis = localStorage.getItem("novajournal_copilot_visible");
      if (copilotVis !== null) setShowCopilot(copilotVis !== "false");

      const savedMode = localStorage.getItem("novajournal_copilot_mode") as any;
      if (savedMode) setCopilotMode(savedMode);

      const savedModel = localStorage.getItem("novajournal_copilot_model") as any;
      if (savedModel) setCopilotModel(savedModel);

      const savedPers = localStorage.getItem("novajournal_copilot_pers") as any;
      if (savedPers) setCopilotPersona(savedPers);

      const savedVoice = localStorage.getItem("novajournal_copilot_voice");
      if (savedVoice) setCopilotVoice(savedVoice);

      const savedAccess = localStorage.getItem("novajournal_copilot_limit") as any;
      if (savedAccess) setCopilotAccess(savedAccess);

      const savedPinned = localStorage.getItem("novajournal_copilot_pinned");
      if (savedPinned !== null) setCopilotPinned(savedPinned === "true");

      const savedSound = localStorage.getItem("novajournal_copilot_sound");
      if (savedSound !== null) setCopilotSound(savedSound !== "false");

      const savedTts = localStorage.getItem("novajournal_copilot_tts");
      if (savedTts !== null) setCopilotTts(savedTts !== "false");

      const savedCustomSize = localStorage.getItem("novajournal_copilot_custom_size");
      if (savedCustomSize) {
        const parsed = JSON.parse(savedCustomSize);
        if (parsed.width && parsed.height) {
          setCustomCopilotWidth(parsed.width);
          setCustomCopilotHeight(parsed.height);
          setUseCustomSize(true);
        }
      }
    } catch {}
    setKeysLoaded(true);
  }, []);

  // Autosave Status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Autosave for All AI Hub & Copilot settings
  useEffect(() => {
    if (!keysLoaded) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("novajournal_enc_api_gemini", encryptAiKey(geminiKey));
        localStorage.setItem("novajournal_api_gemini", geminiKey);
        localStorage.setItem("novajournal_gemini_key", geminiKey);

        localStorage.setItem("novajournal_enc_api_groq", encryptAiKey(groqKey));
        localStorage.setItem("novajournal_api_groq", groqKey);
        localStorage.setItem("novajournal_groq_key", groqKey);

        localStorage.setItem("novajournal_enc_api_deepseek", encryptAiKey(deepseekKey));
        localStorage.setItem("novajournal_api_deepseek", deepseekKey);
        localStorage.setItem("novajournal_deepseek_key", deepseekKey);

        localStorage.setItem("novajournal_enc_api_claude", encryptAiKey(claudeKey));
        localStorage.setItem("novajournal_api_claude", claudeKey);
        localStorage.setItem("novajournal_claude_key", claudeKey);

        localStorage.setItem("novajournal_api_proxy", customProxyUrl);
        localStorage.setItem("novajournal_ai_strategy", aiRoutingStrategy);

        localStorage.setItem("novajournal_model_gemini", geminiModelVersion);
        localStorage.setItem("novajournal_model_groq", groqModelVersion);
        localStorage.setItem("novajournal_model_deepseek", deepseekModelVersion);
        localStorage.setItem("novajournal_model_claude", claudeModelVersion);

        localStorage.setItem("novajournal_copilot_visible", String(showCopilot));
        localStorage.setItem("novajournal_copilot_mode", copilotMode);
        localStorage.setItem("novajournal_copilot_model", copilotModel);
        localStorage.setItem("novajournal_copilot_pers", copilotPersona);
        localStorage.setItem("novajournal_copilot_voice", copilotVoice);
        localStorage.setItem("novajournal_copilot_limit", copilotAccess);
        localStorage.setItem("novajournal_copilot_pinned", String(copilotPinned));
        localStorage.setItem("novajournal_copilot_sound", String(copilotSound));
        localStorage.setItem("novajournal_copilot_tts", String(copilotTts));

        if (useCustomSize) {
          localStorage.setItem(
            "novajournal_copilot_custom_size",
            JSON.stringify({ width: customCopilotWidth, height: customCopilotHeight })
          );
        } else {
          localStorage.removeItem("novajournal_copilot_custom_size");
        }

        window.dispatchEvent(new Event("novajournal_copilot_config_changed"));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 600);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    geminiKey,
    groqKey,
    deepseekKey,
    claudeKey,
    customProxyUrl,
    aiRoutingStrategy,
    geminiModelVersion,
    groqModelVersion,
    deepseekModelVersion,
    claudeModelVersion,
    showCopilot,
    copilotMode,
    copilotModel,
    copilotPersona,
    copilotVoice,
    copilotAccess,
    copilotPinned,
    copilotSound,
    copilotTts,
    useCustomSize,
    customCopilotWidth,
    customCopilotHeight,
    keysLoaded,
  ]);

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 sm:mt-8 pt-2">
      {/* Notice Banner */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Clean 3-Tier Professional Header */}
      <div className="space-y-3 pb-3 border-b border-default-200/80 dark:border-default-800">
        {/* Tier 1: Top Navigation & Status Bar */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.push("/settings")}
            className="text-xs cursor-pointer h-8 px-3 rounded-xl font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition"
          >
            &larr; {isId ? "Kembali ke Settings Hub" : "Back to Settings Hub"}
          </Button>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold animate-pulse border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{isId ? "Menyimpan otomatis..." : "Autosaving..."}</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Tersimpan otomatis" : "Autosaved"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tier 2: Title in 1 Full Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isId ? "AI Hub & Nova Agent Engine" : "AI Hub & Nova Agent Engine"}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-bold tracking-wide">
            Multi-LLM Matrix
          </span>
        </div>

        {/* Tier 3: Description on left, Actions on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-xl leading-relaxed">
            {isId
              ? "Konfigurasi kunci API multi-model AI, algoritma failover otomatis, gaya persona Nova Agent, dan sintesis suara TTS."
              : "Configure multi-model AI API keys, automatic failover algorithms, Nova Agent personas, and voice synthesis."}
          </p>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              {areAllFolded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t(DICTIONARY.common.openAll)}</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t(DICTIONARY.common.foldAll)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY SECTION ANCHOR NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-foreground">Seksi:</span>
          <div className="flex items-center gap-1">
            {AI_HUB_SECTIONS.map((sec) => {
              const isActive = activeSectionId === sec.id;
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "text-white shadow-xs font-bold"
                      : "text-default-600 hover:bg-default-100 dark:hover:bg-default-800"
                  }`}
                  style={isActive ? { backgroundColor: sec.color } : undefined}
                >
                  <SecIcon className="w-3 h-3" />
                  <span>{sec.shortName || sec.name}</span>
                  {foldedSections[sec.id] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Tergulung (Folded)" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 hover:bg-default-50 cursor-pointer transition font-medium"
          >
            {areAllFolded ? "Buka Semua" : "Lipat Semua"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Multi-Provider API Configuration (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-keys"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("keys")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                1. Kunci API Multi-Model (Zero Single-Point-of-Failure)
              </h2>
              <p className="text-[11px] text-default-400">
                Google Gemini, Groq Cloud OCR, DeepSeek R1, dan Claude 3.5 Sonnet dengan failover otomatis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {[geminiKey, groqKey, deepseekKey, claudeKey].filter(Boolean).length || 1} Aktif
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.keys ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.keys && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Google Gemini */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-900/30 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Google Gemini</span>
                          <span className="text-[10px] text-default-400">Multimodal & Core Engine</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Google AI
                        </span>
                        <span className={`w-2 h-2 rounded-full ${geminiKey ? "bg-emerald-500" : "bg-default-300 dark:bg-default-700"}`} title={geminiKey ? "Kunci Terisi" : "Belum Diisi"} />
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys.gemini ? "text" : "password"}
                        placeholder="AIzaSy..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="w-full h-9 pl-3 pr-9 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("gemini")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                      >
                        {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Model Version Selection */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <label className="text-[10px] font-semibold text-default-500 whitespace-nowrap">Model / Versi:</label>
                      <select
                        value={geminiModelVersion}
                        onChange={(e) => {
                          setGeminiModelVersion(e.target.value);
                          localStorage.setItem("novajournal_model_gemini", e.target.value);
                        }}
                        className="flex-1 h-7.5 px-2 text-[11px] rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Default - Cepat & Cerdas)</option>
                        <option value="gemini-2.0-pro-exp">Gemini 2.0 Pro Exp (Penalaran Kompleks)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ringan & Hemat Kuota)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Konteks Raksasa 1M)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="min-w-0 flex-1 pr-2">
                      {testResults.gemini ? (
                        <div className={`text-[10px] flex items-center gap-1 font-semibold ${testResults.gemini.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          <span>{testResults.gemini.ok ? "✓" : "⚠"}</span>
                          <span className="truncate">{testResults.gemini.msg}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-default-400">Siap diuji</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={testingKey.gemini || !geminiKey.trim()}
                      onPress={() => handleTestKey("gemini", geminiKey)}
                      className="h-8 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    >
                      {testingKey.gemini ? "Menguji..." : "Tes Gemini"}
                    </Button>
                  </div>
                </div>

                {/* 2. Groq Cloud OCR */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-900/30 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚡</span>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Groq Cloud LPU</span>
                          <span className="text-[10px] text-default-400">Ultra Fast Inference & OCR</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          &lt;200ms Latency
                        </span>
                        <span className={`w-2 h-2 rounded-full ${groqKey ? "bg-emerald-500" : "bg-default-300 dark:bg-default-700"}`} title={groqKey ? "Kunci Terisi" : "Belum Diisi"} />
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys.groq ? "text" : "password"}
                        placeholder="gsk_..."
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        className="w-full h-9 pl-3 pr-9 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("groq")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                      >
                        {showKeys.groq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Model Version Selection */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <label className="text-[10px] font-semibold text-default-500 whitespace-nowrap">Model / Versi:</label>
                      <select
                        value={groqModelVersion}
                        onChange={(e) => {
                          setGroqModelVersion(e.target.value);
                          localStorage.setItem("novajournal_model_groq", e.target.value);
                        }}
                        className="flex-1 h-7.5 px-2 text-[11px] rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Aktif & Direkomendasikan)</option>
                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B (32k Context Window)</option>
                        <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill 70B</option>
                        <option value="gemma2-9b-it">Google Gemma 2 9B IT</option>
                        <option value="qwen-2.5-coder-32b">Qwen 2.5 Coder 32B</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-default-200/50 dark:border-default-700/50 mt-1">
                    <div className="min-w-0 flex-1 pr-1">
                      {testResults.groq ? (
                        <div className={`text-[10px] flex items-center gap-1 font-semibold ${testResults.groq.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          <span>{testResults.groq.ok ? "✓" : "⚠"}</span>
                          <span className="truncate">{testResults.groq.msg}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-default-400">Siap diuji</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        isDisabled={testingKey.groq || !groqKey.trim()}
                        onPress={() => handleTestKey("groq", groqKey)}
                        className="h-7.5 px-2 text-[11px] font-semibold shrink-0 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      >
                        {testingKey.groq ? "Cek..." : "Ping Key"}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        isDisabled={testingChatGroq || !groqKey.trim()}
                        onPress={handleTestChatGroq}
                        className="h-7.5 px-2.5 text-[11px] font-bold shrink-0 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        {testingChatGroq ? "Mengeksekusi..." : "⚡ Uji Chat Groq"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 3. DeepSeek */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-900/30 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧠</span>
                        <div>
                          <span className="text-xs font-bold text-foreground block">DeepSeek AI</span>
                          <span className="text-[10px] text-default-400">Reasoning & Financial Auditor</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          Deep Reasoner
                        </span>
                        <span className={`w-2 h-2 rounded-full ${deepseekKey ? "bg-emerald-500" : "bg-default-300 dark:bg-default-700"}`} title={deepseekKey ? "Kunci Terisi" : "Belum Diisi"} />
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys.deepseek ? "text" : "password"}
                        placeholder="sk-..."
                        value={deepseekKey}
                        onChange={(e) => setDeepseekKey(e.target.value)}
                        className="w-full h-9 pl-3 pr-9 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("deepseek")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                      >
                        {showKeys.deepseek ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Model Version Selection */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <label className="text-[10px] font-semibold text-default-500 whitespace-nowrap">Model / Versi:</label>
                      <select
                        value={deepseekModelVersion}
                        onChange={(e) => {
                          setDeepseekModelVersion(e.target.value);
                          localStorage.setItem("novajournal_model_deepseek", e.target.value);
                        }}
                        className="flex-1 h-7.5 px-2 text-[11px] rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="deepseek-chat">DeepSeek V3 (General Finance & Chat)</option>
                        <option value="deepseek-reasoner">DeepSeek R1 (Deep Reasoning Chain-of-Thought)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="min-w-0 flex-1 pr-2">
                      {testResults.deepseek ? (
                        <div className={`text-[10px] flex items-center gap-1 font-semibold ${testResults.deepseek.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          <span>{testResults.deepseek.ok ? "✓" : "⚠"}</span>
                          <span className="truncate">{testResults.deepseek.msg}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-default-400">Siap diuji</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={testingKey.deepseek || !deepseekKey.trim()}
                      onPress={() => handleTestKey("deepseek", deepseekKey)}
                      className="h-8 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    >
                      {testingKey.deepseek ? "Menguji..." : "Tes DeepSeek"}
                    </Button>
                  </div>
                </div>

                {/* 4. Anthropic Claude */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-900/30 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎭</span>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Anthropic Claude</span>
                          <span className="text-[10px] text-default-400">Sonnet Strategic Advisor</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Advanced Advisor
                        </span>
                        <span className={`w-2 h-2 rounded-full ${claudeKey ? "bg-emerald-500" : "bg-default-300 dark:bg-default-700"}`} title={claudeKey ? "Kunci Terisi" : "Belum Diisi"} />
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys.claude ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={claudeKey}
                        onChange={(e) => setClaudeKey(e.target.value)}
                        className="w-full h-9 pl-3 pr-9 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("claude")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                      >
                        {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Model Version Selection */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <label className="text-[10px] font-semibold text-default-500 whitespace-nowrap">Model / Versi:</label>
                      <select
                        value={claudeModelVersion}
                        onChange={(e) => {
                          setClaudeModelVersion(e.target.value);
                          localStorage.setItem("novajournal_model_claude", e.target.value);
                        }}
                        className="flex-1 h-7.5 px-2 text-[11px] rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                      >
                        <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Default)</option>
                        <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Cepat & Responsif)</option>
                        <option value="claude-3-opus-20240229">Claude 3 Opus (Flagship Reasoning)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="min-w-0 flex-1 pr-2">
                      {testResults.claude ? (
                        <div className={`text-[10px] flex items-center gap-1 font-semibold ${testResults.claude.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          <span>{testResults.claude.ok ? "✓" : "⚠"}</span>
                          <span className="truncate">{testResults.claude.msg}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-default-400">Siap diuji</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={testingKey.claude || !claudeKey.trim()}
                      onPress={() => handleTestKey("claude", claudeKey)}
                      className="h-8 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    >
                      {testingKey.claude ? "Menguji..." : "Tes Claude"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Proxy Gateway with Quick Presets */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-900/30 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">
                      Custom AI Gateway Proxy URL (Opsional)
                    </label>
                    <p className="text-[10px] text-default-400">
                      Gunakan proxy gateway untuk monitoring, failover, atau caching respon AI.
                    </p>
                  </div>
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap items-center gap-1 pt-1 sm:pt-0">
                    {[
                      { name: "OpenRouter", url: "https://openrouter.ai/api/v1" },
                      { name: "OmniRoute", url: "https://api.omniroute.ai/v1" },
                      { name: "9Router", url: "https://api.9router.com/v1" },
                      { name: "Cloudflare AI", url: "https://gateway.ai.cloudflare.com/v1" },
                      { name: "Helicone", url: "https://oai.helicone.ai/v1" },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setCustomProxyUrl(p.url);
                          localStorage.setItem("novajournal_api_proxy", p.url);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition cursor-pointer ${
                          customProxyUrl.startsWith(p.url)
                            ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                            : "bg-white dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                    {customProxyUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomProxyUrl("");
                          localStorage.removeItem("novajournal_api_proxy");
                        }}
                        className="text-[10px] px-1.5 py-0.5 text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                        title="Kosongkan Proxy"
                      >
                        ✕ Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="https://openrouter.ai/api/v1 atau https://api.omniroute.ai/v1..."
                  value={customProxyUrl}
                  onChange={(e) => setCustomProxyUrl(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                />
              </div>

              {/* Routing Strategy */}
              <div className="pt-2 border-t border-default-100 dark:border-default-800 space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Strategi Pengalihan (Routing) Otomatis
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "fallback" as const, label: "Failover Otomatis", desc: "Jika model utama limit, dialihkan ke model cadangan secara instan." },
                    { id: "round-robin" as const, label: "Round Robin Seimbang", desc: "Beban query dibagi merata ke semua API key yang aktif." },
                    { id: "cost-first" as const, label: "Prioritas Kecepatan", desc: "Gunakan Groq Llama dahulu untuk OCR, Gemini untuk audit mendalam." },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAiRoutingStrategy(st.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        aiRoutingStrategy === st.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{st.label}</span>
                        {aiRoutingStrategy === st.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </div>
                      <p className="text-[10px] text-default-500 leading-relaxed">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 2. Nova AI Copilot & Model Selection (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-copilot"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("copilot")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                2. Nova AI Agent & Pemilihan Mesin Inferensi
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih model inferensi yang menjadi otak dari widget Nova AI Agent mengambang Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {copilotModel} · {showCopilot ? "Aktif" : "Nonaktif"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.copilot ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.copilot && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              {/* Visibility Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                <div>
                  <span className="text-xs font-bold text-foreground block">Tampilkan Widget Floating Agent</span>
                  <span className="text-[10px] text-default-500">Ikon agent finansial interaktif di pojok kanan bawah halaman</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showCopilot}
                  onClick={() => setShowCopilot(!showCopilot)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    showCopilot ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      showCopilot ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Model Choice Cards */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    Model AI Penggerak Nova Agent
                  </label>
                  <span className="text-[10px] text-default-400">
                    Ketersediaan model otomatis aktif saat API Key dimasukkan di Seksi 1
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { id: "gemini" as const, name: "Google Gemini", provider: "Google AI", key: geminiKey, version: geminiModelVersion, defaultActive: true },
                    { id: "groq" as const, name: "Groq Cloud LPU", provider: "Groq Cloud", key: groqKey, version: groqModelVersion, defaultActive: false },
                    { id: "deepseek" as const, name: "DeepSeek AI", provider: "DeepSeek", key: deepseekKey, version: deepseekModelVersion, defaultActive: false },
                    { id: "claude" as const, name: "Anthropic Claude", provider: "Anthropic", key: claudeKey, version: claudeModelVersion, defaultActive: false },
                  ].map((m) => {
                    const hasKey = Boolean(m.key && m.key.trim().length > 0) || m.defaultActive;
                    const isSelected = copilotModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setCopilotModel(m.id);
                          localStorage.setItem("novajournal_copilot_model", m.id);
                          window.dispatchEvent(new Event("novajournal_copilot_config_changed"));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/30 shadow-xs"
                            : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">{m.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <span className="text-[10px] text-default-500 block">{m.provider}</span>
                        <div className="mt-2.5 pt-2 border-t border-default-100 dark:border-default-800 flex items-center justify-between gap-1">
                          <span className="text-[9.5px] font-mono text-default-400 truncate max-w-[100px]" title={m.version}>
                            {m.version}
                          </span>
                          {hasKey ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 shrink-0">
                              ● Siap Digunakan
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/25 shrink-0">
                              Belum Ada Key
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. Gaya Personalitas & Hak Privasi (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-persona"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("persona")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                3. Gaya Personalitas & Lingkup Hak Akses Data
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih gaya respon analitis serta batasan data transaksi yang boleh diakses oleh Nova Agent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {copilotPersona} · {copilotAccess}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.persona ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.persona && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              {/* Persona Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Gaya Personalitas & Nada Bicara (Tone)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { id: "cfo" as const, label: "CFO Korporat", desc: "Fokus efisiensi arus kas, margin, dan solvabilitas bisnis." },
                    { id: "buddy" as const, label: "Sahabat Finansial", desc: "Santai, ramah, memotivasi target menabung." },
                    { id: "auditor" as const, label: "Auditor Forensik", desc: "Kritis, deteksi kebocoran anggaran dan selisih buku." },
                    { id: "analyst" as const, label: "Analis Portofolio", desc: "Alokasi aset, yield dividen, dan diversifikasi IHSG." },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCopilotPersona(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotPersona === p.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{p.label}</span>
                        {copilotPersona === p.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </div>
                      <p className="text-[10px] text-default-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Access & Privacy Scope */}
              <div className="space-y-2 pt-2 border-t border-default-100 dark:border-default-800">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-500" />
                  Lingkup Hak Akses Data Transaksi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "full" as const, label: "Akses Penuh (Full Context)", desc: "AI dapat membaca rincian nominal, nama merchant, dan invoice untuk analisis akurat." },
                    { id: "advisory" as const, label: "Penasihat Agregat (Summary)", desc: "AI hanya menerima total saldo dan persentase kategori tanpa rincian transaksi individu." },
                    { id: "restricted" as const, label: "Zero-Knowledge (Terisolasi)", desc: "AI tidak memiliki akses data pembukuan apa pun, hanya konsultasi umum akuntansi." },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setCopilotAccess(acc.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotAccess === acc.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{acc.label}</span>
                        {copilotAccess === acc.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </div>
                      <p className="text-[10px] text-default-500 leading-relaxed">{acc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. Suara TTS & Audio (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-voice"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("voice")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                4. Sintesis Suara Text-to-Speech (TTS) & Audio
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih profil vokal narasi untuk membaca ringkasan kas masuk/keluar otomatis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {copilotVoice}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.voice ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.voice && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Pilihan Model Suara Vokal</span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                      playSoftChime();
                      const testText = copilotVoice.includes("en")
                        ? "Hello! I am Nova, your AI financial copilot. Let me assist your ledger audit."
                        : "Halo! Saya Nova, copilot keuangan AI Anda. Mari kita kelola arus kas bersama.";
                      const utterance = new SpeechSynthesisUtterance(testText);
                      utterance.lang = copilotVoice.includes("en") ? "en-US" : "id-ID";
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-600 text-white font-semibold cursor-pointer hover:bg-purple-700 transition active:scale-95"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Uji Vokal Suara</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "id-female-nova", label: "Gadis Nova ID", lang: "🇮🇩 Indonesia", desc: "Suara perempuan lembut Indonesia" },
                  { id: "id-male-budi", label: "Budi Finansial ID", lang: "🇮🇩 Indonesia", desc: "Suara pria profesional Indonesia" },
                  { id: "en-female-studio", label: "Nova Studio EN", lang: "🇺🇸 English", desc: "Female US studio voice" },
                  { id: "en-male-cfo", label: "Executive British EN", lang: "🇬🇧 English", desc: "Male British executive tone" },
                  { id: "browser-default", label: "Browser Default", lang: "🌐 Sistem", desc: "Suara bawaan peramban Anda" },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setCopilotVoice(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      copilotVoice === v.id
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                        : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground">{v.label}</span>
                        <span className="text-[10px] text-default-400 ml-1">{v.lang}</span>
                      </div>
                      {copilotVoice === v.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <p className="text-[10px] text-default-500 mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. Ukuran Jendela & Pinned Mode (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-window"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("window")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                5. Kustom Ukuran Jendela (W × H) & Always on Top
              </h2>
              <p className="text-[11px] text-default-400">
                Atur lebar dan tinggi piksel jendela dialog Nova Agent serta fiksasi posisi di atas konten saat scroll.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {useCustomSize ? `${customCopilotWidth}×${customCopilotHeight}px` : "Default"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.window ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.window && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {/* Custom Size Card */}
              <div className="p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/80 dark:border-default-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Ukuran Jendela Kustom (W × H)</span>
                    <span className="text-[10px] text-default-500">
                      {useCustomSize ? `${customCopilotWidth} × ${customCopilotHeight}px` : "Menggunakan ukuran default"}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useCustomSize}
                    onClick={() => setUseCustomSize(!useCustomSize)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      useCustomSize ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      useCustomSize ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>

                {useCustomSize && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] text-default-400 font-semibold uppercase">W (px)</label>
                        <input
                          type="number"
                          min={320}
                          max={900}
                          value={customCopilotWidth}
                          onChange={(e) => setCustomCopilotWidth(Number(e.target.value))}
                          className="w-full h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs font-mono text-foreground"
                        />
                      </div>
                      <span className="text-default-400 text-xs mt-3">×</span>
                      <div className="flex-1">
                        <label className="text-[9px] text-default-400 font-semibold uppercase">H (px)</label>
                        <input
                          type="number"
                          min={400}
                          max={900}
                          value={customCopilotHeight}
                          onChange={(e) => setCustomCopilotHeight(Number(e.target.value))}
                          className="w-full h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs font-mono text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { w: 420, h: 560, label: "Standard" },
                        { w: 480, h: 620, label: "Wide" },
                        { w: 560, h: 680, label: "Studio" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setCustomCopilotWidth(preset.w);
                            setCustomCopilotHeight(preset.h);
                          }}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold cursor-pointer transition ${
                            customCopilotWidth === preset.w && customCopilotHeight === preset.h
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                          }`}
                        >
                          {preset.label} ({preset.w}×{preset.h})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Always On Top Card */}
              <div className="p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/80 dark:border-default-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Always on Top (Pinned)</span>
                    <span className="text-[10px] text-default-500">Jendela tetap di atas saat Anda scroll halaman</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={copilotPinned}
                    onClick={() => setCopilotPinned(!copilotPinned)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      copilotPinned ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      copilotPinned ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                <p className="text-[10px] text-default-400 leading-relaxed">
                  Memungkinkan Anda membaca laporan keuangan atau tabel transaksi panjang sambil terus berinteraksi dengan Nova AI Agent.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
      {/* ========================================================================= */}
      <div className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
        {quickJumpOpen && (
          <div className="mb-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-default-200/80 dark:border-default-800 shadow-2xl w-64 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-1.5">
                <ActiveIcon className="w-4 h-4" style={{ color: activeSec.color }} />
                <span className="text-xs font-bold text-foreground">Navigasi Seksi Cepat</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickJumpOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-default-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {AI_HUB_SECTIONS.map((sec) => {
                const isActive = activeSectionId === sec.id;
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(sec.id);
                      setQuickJumpOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "text-white font-bold shadow-xs"
                        : "hover:bg-default-100 dark:hover:bg-default-800 text-default-700 dark:text-default-300 text-xs"
                    }`}
                    style={isActive ? { backgroundColor: sec.color } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <SecIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{sec.shortName}</span>
                    </div>
                    {foldedSections[sec.id] && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-default-200 dark:bg-default-700 text-default-500 font-mono">
                        Folded
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-default-100 dark:border-default-800 flex justify-between items-center text-[10px] text-default-400">
              <span>{AI_HUB_SECTIONS.length} Seksi Tersedia</span>
              <button
                type="button"
                onClick={toggleAllSections}
                className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 font-medium hover:bg-default-200 cursor-pointer"
              >
                {areAllFolded ? "Buka Semua" : "Tutup Semua"}
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Icon-Only Floating Sticky Anchor Button (Solid Fill, No Dark Stroke) */}
        <button
          type="button"
          onClick={() => {
            playSoftChime();
            setQuickJumpOpen((prev) => !prev);
          }}
          className="relative flex items-center justify-center w-12 h-12 rounded-2xl hover:scale-105 active:scale-95 text-white shadow-xl transition-all cursor-pointer group"
          style={{
            backgroundColor: activeSec.color,
            boxShadow: `0 8px 24px -4px ${activeSec.color}90`,
          }}
          title={`Lompat Seksi: ${activeSec.name}`}
        >
          <ActiveIcon className={`w-5 h-5 text-white transition-transform duration-300 ${quickJumpOpen ? "rotate-45" : "group-hover:scale-110"}`} />
        </button>
      </div>
    </div>
  );
}
