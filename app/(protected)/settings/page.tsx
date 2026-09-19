/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  ColorPicker,
  ColorArea,
  ColorSlider,
  ColorField,
  ColorSwatch,
  parseColor,
} from "@heroui/react";
import {
  Bell,
  Shield,
  Palette,
  CreditCard,
  User,
  Save,
  Sparkles,
  Key,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Users,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Volume2,
  VolumeX,
  Bot,
  Camera,
  Upload,
  Crop,
  Trash2,
  X,
  ScrollText,
  Monitor,
  Smartphone,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Mic,
  Play,
  PlayCircle,
  Radio,
  SlidersHorizontal,
  Compass,
  Globe,
  Network,
  Server,
  ArrowUp,
  Info,
  HelpCircle,
  ShieldAlert,
  Anchor,
  Activity,
  Cpu,
  PanelLeft,
  LayoutTemplate,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  playNovaThemeSound,
  playSoftChime,
  playNovaSpaceSound,
  playNovaAiReceiveSound,
  playNovaUploadSound,
} from "@/app/lib/sound";
import {
  formatSystemCurrency,
  formatCompactNumber,
  formatSystemDate,
} from "@/app/lib/intl";

export const PALETTES = [
  { id: "blue", name: "Modern Blue", hex: "#2563eb", bgClass: "bg-blue-600", borderClass: "border-blue-500", ringClass: "ring-blue-500/30" },
  { id: "violet", name: "Cyber Violet", hex: "#7c3aed", bgClass: "bg-violet-600", borderClass: "border-violet-500", ringClass: "ring-violet-500/30" },
  { id: "emerald", name: "Emerald Growth", hex: "#059669", bgClass: "bg-emerald-600", borderClass: "border-emerald-500", ringClass: "ring-emerald-500/30" },
  { id: "amber", name: "Amber Wealth", hex: "#d97706", bgClass: "bg-amber-600", borderClass: "border-amber-500", ringClass: "ring-amber-500/30" },
  { id: "rose", name: "Crimson Alpha", hex: "#e11d48", bgClass: "bg-rose-600", borderClass: "border-rose-500", ringClass: "ring-rose-500/30" },
  { id: "slate", name: "Slate Corporate", hex: "#475569", bgClass: "bg-slate-600", borderClass: "border-slate-500", ringClass: "ring-slate-500/30" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

export const SETTINGS_SECTIONS = [
  { id: "ai", label: "AI Hub", icon: Bot },
  { id: "copilot", label: "Copilot", icon: Sparkles },
  { id: "profile", label: "Profil", icon: User },
  { id: "appearance", label: "Tampilan", icon: Palette },
  { id: "currency", label: "Regional & Intl", icon: DollarSign },
  { id: "notifications", label: "Notifikasi", icon: Bell },
  { id: "security", label: "Keamanan", icon: Shield },
  { id: "rbac", label: "RBAC & Tim", icon: Users },
] as const;

export default function Settings() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { selectedWorkspace } = useWorkspace();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = mounted && (resolvedTheme === "dark" || theme === "dark");

  // Accordion Fold/Unfold State (Default is ALL UNFOLDED)
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({});

  const toggleFold = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const areAllFolded = SETTINGS_SECTIONS.length > 0 && SETTINGS_SECTIONS.every((s) => foldedSections[s.id]);

  const toggleAllSections = () => {
    playSoftChime();
    if (areAllFolded) {
      setFoldedSections({});
    } else {
      const all: Record<string, boolean> = {};
      SETTINGS_SECTIONS.forEach((s) => {
        all[s.id] = true;
      });
      setFoldedSections(all);
    }
  };

  const scrollToTop = () => {
    playSoftChime();
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  // AI Configuration State (Primary Hub)
  const [aiProvider, setAiProvider] = useState<"auto" | "groq" | "gemini" | "deepseek" | "claude">("auto");
  const [aiRoutingMode, setAiRoutingMode] = useState<"fallback" | "round-robin" | "cost" | "speed" | "primary">("fallback");

  // AI Hub Sub-sections Fold State
  const [aiSubFolds, setAiSubFolds] = useState<{
    usage: boolean;
    routing: boolean;
    byok: boolean;
    proxy: boolean;
    security: boolean;
  }>({
    usage: false,
    routing: false,
    byok: false,
    proxy: true,
    security: true,
  });

  const toggleAiSubFold = (key: keyof typeof aiSubFolds) => {
    playSoftChime();
    setAiSubFolds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Model Quota & Usage Tracker State with Live Ping & Red-Green Indicators
  const [modelUsageList, setModelUsageList] = useState([
    {
      id: "gemini",
      name: "Google Gemini 2.0 Flash",
      provider: "Google Cloud / AI Studio",
      quotaRemaining: 84,
      tokensUsed: "160,000 / 1,000,000 TPM",
      requestsToday: 42,
      latency: 185,
      status: "Optimal",
      health: "green" as "green" | "yellow" | "red",
      endpoint: "generativelanguage.googleapis.com",
    },
    {
      id: "groq",
      name: "Groq Cloud Llama 3.3 70B",
      provider: "Groq LPU Acceleration",
      quotaRemaining: 71,
      tokensUsed: "1,740 / 6,000 RPM",
      requestsToday: 129,
      latency: 88,
      status: "Ultra-Fast",
      health: "green" as "green" | "yellow" | "red",
      endpoint: "api.groq.com/openai/v1",
    },
    {
      id: "deepseek",
      name: "DeepSeek V3 / R1 (Reasoner)",
      provider: "DeepSeek AI Infrastructure",
      quotaRemaining: 48,
      tokensUsed: "520,000 / 1,000,000 Tokens",
      requestsToday: 18,
      latency: 395,
      status: "Sedang",
      health: "yellow" as "green" | "yellow" | "red",
      endpoint: "api.deepseek.com/v1",
    },
    {
      id: "claude",
      name: "Anthropic Claude 3.5 Sonnet",
      provider: "Anthropic Bedrock / Direct",
      quotaRemaining: 21,
      tokensUsed: "31,600 / 40,000 TPM",
      requestsToday: 9,
      latency: 520,
      status: "Mendekati Batas",
      health: "red" as "green" | "yellow" | "red",
      endpoint: "api.anthropic.com/v1",
    },
    {
      id: "proxy",
      name: "Custom AI Gateway Proxy",
      provider: "OpenRouter / 9Router / Omni / Ollama",
      quotaRemaining: 92,
      tokensUsed: "$0.80 / $10.00 Saldo",
      requestsToday: 65,
      latency: 230,
      status: "Tersambung",
      health: "green" as "green" | "yellow" | "red",
      endpoint: "Local / Cloud Proxy",
    },
  ]);
  const [checkingAllAiHealth, setCheckingAllAiHealth] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // Custom AI Gateway / Proxy Port State (OpenRouter / 9Router / OneAPI / Omni / Ollama)
  const [useCustomProxy, setUseCustomProxy] = useState(false);
  const [proxyBaseUrl, setProxyBaseUrl] = useState("https://openrouter.ai/api/v1");
  const [proxyApiKey, setProxyApiKey] = useState("");
  const [proxyModelName, setProxyModelName] = useState("anthropic/claude-3.5-sonnet");
  const [proxyPreset, setProxyPreset] = useState<"openrouter" | "9router" | "oneapi" | "ollama" | "custom">("openrouter");
  const [testingProxy, setTestingProxy] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Anchor Navigation & Quick Jump Floating State
  const [activeSectionId, setActiveSectionId] = useState("ai");
  const [showQuickJump, setShowQuickJump] = useState(true);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  // Nova AI Copilot Configuration State
  const [showCopilot, setShowCopilot] = useState(true);
  const [copilotMode, setCopilotMode] = useState<"full" | "icon" | "summary">("full");
  const [isWideCopilot, setIsWideCopilot] = useState(false);
  const [copilotPos, setCopilotPos] = useState<"bottom-right" | "bottom-left" | "floating-center">("bottom-right");
  const [copilotPersona, setCopilotPersona] = useState<"cfo" | "buddy" | "auditor" | "analyst">("cfo");
  const [copilotSound, setCopilotSound] = useState(true);
  const [copilotTts, setCopilotTts] = useState(true);
  const [copilotModel, setCopilotModel] = useState<"gemini" | "groq" | "deepseek" | "claude">("gemini");
  const [copilotAccess, setCopilotAccess] = useState<"full" | "advisory" | "restricted">("full");
  const [copilotVoice, setCopilotVoice] = useState("id-female-nova");
  const [customSizeModalOpen, setCustomSizeModalOpen] = useState(false);
  const [customCopilotWidth, setCustomCopilotWidth] = useState(480);
  const [customCopilotHeight, setCustomCopilotHeight] = useState(620);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [copilotPinned, setCopilotPinned] = useState(false);

  // Profile & Avatar State
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("Alexander");
  const [lastName, setLastName] = useState("Vance");
  const [emailAddress, setEmailAddress] = useState("alexander@novajournal.io");
  const [phoneNumber, setPhoneNumber] = useState("+62 812-8899-2345");
  const [jobTitle, setJobTitle] = useState("Managing Director & CFO");
  const [profileBio, setProfileBio] = useState("Building disciplined cashflow governance with NovaJournal.");

  // Avatar Modal Crop & Preview
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);
  const [fileFormatName, setFileFormatName] = useState("PNG");
  const [isAnimatedGif, setIsAnimatedGif] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarPanX, setAvatarPanX] = useState(0);
  const [avatarPanY, setAvatarPanY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Appearance / HeroUI Palette State
  const [themePalette, setThemePalette] = useState<"blue" | "violet" | "emerald" | "amber" | "rose" | "slate">("blue");
  const [uiDensity, setUiDensity] = useState<"compact" | "standard" | "spacious" | "custom">("standard");
  const [sidebarDensity, setSidebarDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [navbarDensity, setNavbarDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [layoutDensity, setLayoutDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [densityScale, setDensityScale] = useState(100);
  const [isDensityModalOpen, setIsDensityModalOpen] = useState(false);
  const [enableNebulaGlow, setEnableNebulaGlow] = useState(true);
  const [customHexColor, setCustomHexColor] = useState("#2563eb");
  const activePalette = PALETTES.find((p) => p.id === themePalette) || PALETTES[0];

  // Currency & Region State
  const [defaultCurrency, setDefaultCurrency] = useState("IDR");
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [numberFormat, setNumberFormat] = useState("id");

  // Notification State
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [lpsThresholdAlert, setLpsThresholdAlert] = useState(true);
  const [kprReminderAlert, setKprReminderAlert] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: "sess-win", device: "Windows 11 (Chrome 128)", ip: "127.0.0.1", location: "Jakarta, ID", current: true, time: "Aktif Sekarang" },
    { id: "sess-ios", device: "Apple iPhone 15 Pro (Safari)", ip: "182.253.14.88", location: "Bandung, ID", current: false, time: "4 jam lalu" },
  ]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load Preferences on Mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      // AI Keys
      const p = localStorage.getItem("novajournal_ai_provider");
      if (p) setAiProvider(p as any);
      const rMode = localStorage.getItem("novajournal_ai_routing_mode");
      if (rMode) setAiRoutingMode(rMode as any);
      const k = localStorage.getItem("novajournal_ai_key");
      if (k) setPrimaryKey(k);
      const groq = localStorage.getItem("novajournal_ai_groq_key");
      if (groq) setGroqKey(groq);
      const gemini = localStorage.getItem("novajournal_ai_gemini_key");
      if (gemini) setGeminiKey(gemini);
      const deepseek = localStorage.getItem("novajournal_ai_deepseek_key");
      if (deepseek) setDeepseekKey(deepseek);
      const claude = localStorage.getItem("novajournal_ai_claude_key");
      if (claude) setClaudeKey(claude);

      // AI Proxy & Gateway Port settings
      const pxEn = localStorage.getItem("novajournal_ai_proxy_enabled");
      if (pxEn !== null) setUseCustomProxy(pxEn === "true");
      const pxUrl = localStorage.getItem("novajournal_ai_proxy_url");
      if (pxUrl) setProxyBaseUrl(pxUrl);
      const pxKey = localStorage.getItem("novajournal_ai_proxy_key");
      if (pxKey) setProxyApiKey(pxKey);
      const pxModel = localStorage.getItem("novajournal_ai_proxy_model");
      if (pxModel) setProxyModelName(pxModel);
      const pxPreset = localStorage.getItem("novajournal_ai_proxy_preset");
      if (pxPreset) setProxyPreset(pxPreset as any);

      // Copilot config
      const copilotVis = localStorage.getItem("novajournal_copilot_visible");
      if (copilotVis !== null) setShowCopilot(copilotVis !== "false");
      const copilotMd = localStorage.getItem("novajournal_copilot_mode");
      if (copilotMd) setCopilotMode(copilotMd as any);
      const copilotWd = localStorage.getItem("novajournal_copilot_wide");
      if (copilotWd !== null) setIsWideCopilot(copilotWd === "true");
      const copilotPosition = localStorage.getItem("novajournal_copilot_pos");
      if (copilotPosition) setCopilotPos(copilotPosition as any);
      const copilotPers = localStorage.getItem("novajournal_copilot_pers");
      if (copilotPers) setCopilotPersona(copilotPers as any);
      const copilotSnd = localStorage.getItem("novajournal_copilot_sound");
      if (copilotSnd !== null) setCopilotSound(copilotSnd !== "false");
      const copilotVoice = localStorage.getItem("novajournal_copilot_tts");
      if (copilotVoice !== null) setCopilotTts(copilotVoice !== "false");
      const savedCopilotModel = localStorage.getItem("novajournal_copilot_model");
      if (savedCopilotModel) setCopilotModel(savedCopilotModel as any);
      const savedCopilotAccess = localStorage.getItem("novajournal_copilot_limit");
      if (savedCopilotAccess) setCopilotAccess(savedCopilotAccess as any);
      const savedCopilotVoiceProfile = localStorage.getItem("novajournal_copilot_voice");
      if (savedCopilotVoiceProfile) setCopilotVoice(savedCopilotVoiceProfile);
      const savedCustomSize = localStorage.getItem("novajournal_copilot_custom_size");
      if (savedCustomSize) {
        try {
          const parsed = JSON.parse(savedCustomSize);
          if (parsed.width && parsed.height) {
            setCustomCopilotWidth(parsed.width);
            setCustomCopilotHeight(parsed.height);
            setUseCustomSize(true);
          }
        } catch {}
      }

      // Profile Initialization
      const av = localStorage.getItem("novajournal_user_avatar");
      if (av) setAvatarImage(av);
      else if ((user as any)?.image) setAvatarImage((user as any).image);

      if (user) {
        if (user.email) setEmailAddress(user.email);
        if (user.name) {
          const parts = user.name.trim().split(/\s+/);
          setFirstName(parts[0] || "User");
          setLastName(parts.slice(1).join(" ") || "");
        }
      }

      const userProfileKey = user ? `novajournal_user_profile_${user.id || user.email}` : "novajournal_user_profile";
      const savedProfile = localStorage.getItem(userProfileKey) || localStorage.getItem("novajournal_user_profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.phone) setPhoneNumber(parsed.phone);
          if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
          if (parsed.bio) setProfileBio(parsed.bio);
          if (parsed.firstName && !user?.name) setFirstName(parsed.firstName);
          if (parsed.lastName && !user?.name) setLastName(parsed.lastName);
          if (parsed.email && !user?.email) setEmailAddress(parsed.email);
        } catch {}
      }

      // Appearance
      const pal = localStorage.getItem("novajournal_theme_palette");
      if (pal) setThemePalette(pal as any);
      const dens = localStorage.getItem("novajournal_ui_density");
      if (dens) setUiDensity(dens as any);
      const sDens = localStorage.getItem("novajournal_density_sidebar");
      if (sDens) setSidebarDensity(sDens as any);
      const nDens = localStorage.getItem("novajournal_density_navbar");
      if (nDens) setNavbarDensity(nDens as any);
      const lDens = localStorage.getItem("novajournal_density_layout");
      if (lDens) setLayoutDensity(lDens as any);
      const densScale = localStorage.getItem("novajournal_ui_density_scale");
      if (densScale) setDensityScale(Number(densScale));

      // Currency
      const curr = localStorage.getItem("novajournal_currency");
      if (curr) setDefaultCurrency(curr);
      const tz = localStorage.getItem("novajournal_timezone");
      if (tz) setTimezone(tz);
      const numFmt = localStorage.getItem("novajournal_number_format");
      if (numFmt) setNumberFormat(numFmt);
      const dtFmt = localStorage.getItem("novajournal_date_format");
      if (dtFmt) setDateFormat(dtFmt);

      // Notifications
      const notifs = localStorage.getItem("novajournal_notifications");
      if (notifs !== null) setPushNotifications(notifs !== "false");
      const snd = localStorage.getItem("novajournal_sound_fx");
      if (snd !== null) setSoundEffects(snd !== "false");
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router]);

  // Reactive synchronization whenever login session user becomes available or changes
  useEffect(() => {
    if (!user) return;
    if (user.email) setEmailAddress(user.email);
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || "User");
      setLastName(parts.slice(1).join(" ") || "");
    }
    if (!localStorage.getItem("novajournal_user_avatar") && (user as any)?.image) {
      setAvatarImage((user as any).image);
    }
    try {
      const userProfileKey = `novajournal_user_profile_${user.id || user.email}`;
      const saved = localStorage.getItem(userProfileKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) setPhoneNumber(parsed.phone);
        if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
        if (parsed.bio) setProfileBio(parsed.bio);
      }
    } catch {}
  }, [user]);

  // Apply UI Density, custom scale, and Nebula Glow to DOM
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", uiDensity);
      document.documentElement.setAttribute("data-density-sidebar", sidebarDensity);
      document.documentElement.setAttribute("data-density-navbar", navbarDensity);
      document.documentElement.setAttribute("data-density-layout", layoutDensity);
      if (uiDensity === "custom") {
        document.documentElement.style.fontSize = `${(densityScale / 100) * 14}px`;
      } else {
        document.documentElement.style.fontSize = "";
      }
      if (enableNebulaGlow) {
        document.body.classList.add("enable-nebula-glow");
      } else {
        document.body.classList.remove("enable-nebula-glow");
      }
    }
  }, [uiDensity, sidebarDensity, navbarDensity, layoutDensity, densityScale, enableNebulaGlow]);

  const handleSidebarDensityChange = (val: "compact" | "standard" | "spacious") => {
    playSoftChime();
    setSidebarDensity(val);
    try {
      localStorage.setItem("novajournal_density_sidebar", val);
      document.documentElement.setAttribute("data-density-sidebar", val);
      window.dispatchEvent(new Event("novajournal_density_changed"));
    } catch {}
  };

  const handleNavbarDensityChange = (val: "compact" | "standard" | "spacious") => {
    playSoftChime();
    setNavbarDensity(val);
    try {
      localStorage.setItem("novajournal_density_navbar", val);
      document.documentElement.setAttribute("data-density-navbar", val);
      window.dispatchEvent(new Event("novajournal_density_changed"));
    } catch {}
  };

  const handleLayoutDensityChange = (val: "compact" | "standard" | "spacious") => {
    playSoftChime();
    setLayoutDensity(val);
    try {
      localStorage.setItem("novajournal_density_layout", val);
      document.documentElement.setAttribute("data-density-layout", val);
      window.dispatchEvent(new Event("novajournal_density_changed"));
    } catch {}
  };

  const applyGlobalPreset = (mode: "compact" | "standard" | "spacious") => {
    playSoftChime();
    setSidebarDensity(mode);
    setNavbarDensity(mode);
    setLayoutDensity(mode);
    setUiDensity(mode);
    try {
      localStorage.setItem("novajournal_density_sidebar", mode);
      localStorage.setItem("novajournal_density_navbar", mode);
      localStorage.setItem("novajournal_density_layout", mode);
      localStorage.setItem("novajournal_ui_density", mode);
      document.documentElement.setAttribute("data-density-sidebar", mode);
      document.documentElement.setAttribute("data-density-navbar", mode);
      document.documentElement.setAttribute("data-density-layout", mode);
      document.documentElement.setAttribute("data-density", mode);
      window.dispatchEvent(new Event("novajournal_density_changed"));
      showSuccessNotice(`Preset kepadatan ${mode === "compact" ? "RINGKAS" : mode === "standard" ? "STANDAR" : "LEGA"} berhasil diterapkan!`);
    } catch {}
  };

  const applyDensityScale = (scale: number) => {
    setUiDensity("custom");
    setDensityScale(scale);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", "custom");
      document.documentElement.style.fontSize = `${(scale / 100) * 14}px`;
      try {
        localStorage.setItem("novajournal_ui_density", "custom");
        localStorage.setItem("novajournal_ui_density_scale", String(scale));
      } catch {}
    }
  };

  // Scroll listener for Section Anchor highlighting and Floating Quick-Jump
  // Robust: listens to both <main> scroll container and window capture
  useEffect(() => {
    const mainEl = document.querySelector("main");
    const handleScroll = () => {
      const scrollPos = mainEl ? mainEl.scrollTop : (window.scrollY || document.documentElement.scrollTop);
      // Always keep quick-jump visible as an assist companion
      setShowQuickJump(true);

      // Determine active section based on bounding rect
      for (const sec of SETTINGS_SECTIONS) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 280 && rect.bottom >= 80) {
            setActiveSectionId(sec.id);
            break;
          }
        }
      }
    };

    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    handleScroll();

    return () => {
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const scrollToSection = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    setQuickJumpOpen(false);
  };

  const showSuccessNotice = (msg: string) => {
    playSoftChime();
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // 1. Save AI Config
  const handleSaveAiConfig = () => {
    try {
      localStorage.setItem("novajournal_ai_provider", aiProvider);
      localStorage.setItem("novajournal_ai_routing_mode", aiRoutingMode);
      localStorage.setItem("novajournal_ai_groq_key", groqKey.trim());
      localStorage.setItem("novajournal_ai_gemini_key", geminiKey.trim());
      localStorage.setItem("novajournal_ai_deepseek_key", deepseekKey.trim());
      localStorage.setItem("novajournal_ai_claude_key", claudeKey.trim());

      localStorage.setItem("novajournal_ai_proxy_enabled", String(useCustomProxy));
      localStorage.setItem("novajournal_ai_proxy_url", proxyBaseUrl.trim());
      localStorage.setItem("novajournal_ai_proxy_key", proxyApiKey.trim());
      localStorage.setItem("novajournal_ai_proxy_model", proxyModelName.trim());
      localStorage.setItem("novajournal_ai_proxy_preset", proxyPreset);

      let resolvedKey = primaryKey.trim();
      if (!resolvedKey) {
        if (aiProvider === "groq" && groqKey) resolvedKey = groqKey.trim();
        else if (aiProvider === "gemini" && geminiKey) resolvedKey = geminiKey.trim();
        else if (aiProvider === "deepseek" && deepseekKey) resolvedKey = deepseekKey.trim();
        else if (aiProvider === "claude" && claudeKey) resolvedKey = claudeKey.trim();
        else {
          resolvedKey = groqKey.trim() || geminiKey.trim() || deepseekKey.trim() || claudeKey.trim();
        }
      }
      localStorage.setItem("novajournal_ai_key", resolvedKey);
      setPrimaryKey(resolvedKey);

      showSuccessNotice("Konfigurasi AI Provider & Kebijakan Routing tersimpan!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckAllAiHealth = async () => {
    playSoftChime();
    setCheckingAllAiHealth(true);
    await new Promise((r) => setTimeout(r, 650));
    setModelUsageList((prev) =>
      prev.map((m) => {
        const pingJitter = Math.floor(Math.random() * 21) - 10;
        const newLatency = Math.max(45, m.latency + pingJitter);
        return {
          ...m,
          latency: newLatency,
          status: m.quotaRemaining > 50 ? "Optimal" : m.quotaRemaining > 20 ? "Sedang" : "Mendekati Batas",
        };
      })
    );
    setCheckingAllAiHealth(false);
    playNovaAiReceiveSound();
    showSuccessNotice("Pemeriksaan latensi & kuota token model selesai!");
  };

  // Test Proxy Endpoint
  const handleTestProxy = async () => {
    playSoftChime();
    setTestingProxy(true);
    setProxyTestResult(null);
    const start = Date.now();
    try {
      // Simulate pinging the gateway endpoint
      await new Promise((r) => setTimeout(r, 650));
      const latency = Date.now() - start;
      setProxyTestResult({
        success: true,
        message: `Koneksi Gateway ${proxyBaseUrl} berhasil! Model: ${proxyModelName}`,
        latency,
      });
      playNovaAiReceiveSound();
    } catch (err: any) {
      setProxyTestResult({
        success: false,
        message: err?.message || "Gagal menghubungi endpoint proxy.",
      });
    } finally {
      setTestingProxy(false);
    }
  };

  // Test AI
  const handleTestAi = async () => {
    setTestingAi(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      let activeKey = primaryKey.trim();
      if (!activeKey) {
        if (aiProvider === "groq") activeKey = groqKey.trim();
        else if (aiProvider === "gemini") activeKey = geminiKey.trim();
        else if (aiProvider === "deepseek") activeKey = deepseekKey.trim();
        else if (aiProvider === "claude") activeKey = claudeKey.trim();
        else activeKey = groqKey.trim() || geminiKey.trim() || deepseekKey.trim() || claudeKey.trim();
      }

      const res = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Makan siang 35000 pakai GoPay",
          apiKey: activeKey || undefined,
          provider: aiProvider,
        }),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menguji respon model AI.");
      }

      setTestResult({
        success: true,
        message: `Koneksi berhasil via ${data.source || aiProvider}!`,
        latency,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Gagal terhubung ke API Provider.",
      });
    } finally {
      setTestingAi(false);
    }
  };

  // 2. Save Nova AI Copilot Config
  const handleSaveCopilotConfig = () => {
    try {
      localStorage.setItem("novajournal_copilot_visible", String(showCopilot));
      localStorage.setItem("novajournal_copilot_mode", copilotMode);
      localStorage.setItem("novajournal_copilot_wide", String(isWideCopilot));
      localStorage.setItem("novajournal_copilot_pos", copilotPos);
      localStorage.setItem("novajournal_copilot_pers", copilotPersona);
      localStorage.setItem("novajournal_copilot_sound", String(copilotSound));
      localStorage.setItem("novajournal_copilot_tts", String(copilotTts));
      localStorage.setItem("novajournal_copilot_model", copilotModel);
      localStorage.setItem("novajournal_copilot_limit", copilotAccess);
      localStorage.setItem("novajournal_copilot_voice", copilotVoice);
      localStorage.setItem("novajournal_copilot_pinned", String(copilotPinned));
      if (useCustomSize) {
        localStorage.setItem(
          "novajournal_copilot_custom_size",
          JSON.stringify({ width: customCopilotWidth, height: customCopilotHeight })
        );
      } else {
        localStorage.removeItem("novajournal_copilot_custom_size");
      }

      // Broadcast live event to update floating copilot immediately
      window.dispatchEvent(new Event("novajournal_copilot_config_changed"));

      showSuccessNotice("Pengaturan Nova AI Copilot & Voice tersimpan!");
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Profile & Avatar Handlers
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playNovaUploadSound();
    const isGif = file.type === "image/gif";
    setIsAnimatedGif(isGif);
    setFileFormatName(isGif ? "GIF Animated" : file.type.includes("webp") ? "WebP Modern" : "PNG / JPEG");

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileForCrop(reader.result as string);
      setAvatarZoom(1);
      setAvatarPanX(0);
      setAvatarPanY(0);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCroppedAvatar = () => {
    if (!selectedFileForCrop) return;
    playSoftChime();

    // Preserve original animated GIF if unmodified
    if (isAnimatedGif && avatarZoom === 1 && avatarPanX === 0 && avatarPanY === 0) {
      setAvatarImage(selectedFileForCrop);
      try {
        localStorage.setItem("novajournal_user_avatar", selectedFileForCrop);
        window.dispatchEvent(new Event("novajournal_avatar_changed"));
      } catch {}
      setIsCropModalOpen(false);
      showSuccessNotice("Avatar GIF Animasi tersimpan utuh!");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const OUT_SIZE = 384;
      const canvas = document.createElement("canvas");
      canvas.width = OUT_SIZE;
      canvas.height = OUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const previewBoxEl = document.getElementById("avatar-crop-box");
      const boxSize = previewBoxEl ? previewBoxEl.clientWidth : 320;
      const scaleRatio = OUT_SIZE / boxSize;

      // 1. Move coordinate origin to canvas center
      ctx.translate(OUT_SIZE / 2, OUT_SIZE / 2);
      // 2. Apply scaled pan offset
      ctx.translate(avatarPanX * scaleRatio, avatarPanY * scaleRatio);
      // 3. Apply zoom scale
      ctx.scale(avatarZoom, avatarZoom);

      // 4. Calculate object-cover base dimensions in box
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      let baseW = boxSize;
      let baseH = boxSize;
      if (nw >= nh) {
        baseH = boxSize;
        baseW = boxSize * (nw / nh);
      } else {
        baseW = boxSize;
        baseH = boxSize * (nh / nw);
      }

      const drawW = baseW * scaleRatio;
      const drawH = baseH * scaleRatio;

      // 5. Draw image centered
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // 6. Export high-quality compressed image
      let compressedDataUrl: string;
      try {
        compressedDataUrl = canvas.toDataURL("image/webp", 0.9);
        if (!compressedDataUrl.startsWith("data:image/webp")) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
        }
      } catch {
        compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
      }

      setAvatarImage(compressedDataUrl);

      try {
        localStorage.setItem("novajournal_user_avatar", compressedDataUrl);
        window.dispatchEvent(new Event("novajournal_avatar_changed"));
      } catch (e) {
        console.warn("Avatar save warning:", e);
      }
      setIsCropModalOpen(false);
      showSuccessNotice("Foto Profil Avatar berhasil dipotong & diperbarui!");
    };
    img.onerror = () => {
      setAvatarImage(selectedFileForCrop);
      setIsCropModalOpen(false);
      showSuccessNotice("Avatar diperbarui.");
    };
    img.src = selectedFileForCrop;
  };

  const handleRemoveAvatar = () => {
    playSoftChime();
    setAvatarImage(null);
    try {
      localStorage.removeItem("novajournal_user_avatar");
      window.dispatchEvent(new Event("novajournal_avatar_changed"));
    } catch {}
    showSuccessNotice("Foto avatar dikembalikan ke inisial default.");
  };

  const handleSaveProfile = () => {
    try {
      const data = {
        firstName,
        lastName,
        email: emailAddress,
        phone: phoneNumber,
        jobTitle,
        bio: profileBio,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("novajournal_user_profile", JSON.stringify(data));
      if (user?.id || user?.email) {
        localStorage.setItem(`novajournal_user_profile_${user.id || user.email}`, JSON.stringify(data));
      }
      showSuccessNotice("Informasi profil dan identitas berhasil diperbarui!");
    } catch {
      showSuccessNotice("Profil diperbarui di sesi aktif.");
    }
  };

  // 4. Appearance Handlers
  const handleThemePaletteChange = (pal: "blue" | "violet" | "emerald" | "amber" | "rose" | "slate") => {
    playNovaSpaceSound();
    setThemePalette(pal);
    try {
      localStorage.setItem("novajournal_theme_palette", pal);
      document.documentElement.setAttribute("data-palette", pal);
      document.documentElement.style.transition = "--primary-color 0.4s ease, --primary-hover 0.4s ease";
      window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: pal }));
      showSuccessNotice(`Tema palet berhasil diubah ke ${pal.toUpperCase()}!`);
      setTimeout(() => {
        document.documentElement.style.transition = "";
      }, 400);
    } catch {}
  };

  const handleCustomColorApply = (hex: string) => {
    setCustomHexColor(hex);
    try {
      localStorage.setItem("novajournal_custom_hex", hex);
      document.documentElement.style.setProperty("--primary-color", hex);
      document.documentElement.style.setProperty("--primary-ring", `${hex}50`);
      document.documentElement.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${hex} 0%, #1e1b4b 100%)`);
      showSuccessNotice(`Warna kustom ${hex} berhasil diterapkan!`);
    } catch {}
  };

  const toggleThemeMode = () => {
    const next = isDarkTheme ? "light" : "dark";
    playNovaThemeSound(next === "dark");
    setTheme(next);
    showSuccessNotice(`Beralih ke mode ${next === "dark" ? "Gelap (Dark)" : "Terang (Light)"}!`);
  };

  // 5. Currency & Localization Handlers
  const handleSaveRegional = () => {
    try {
      localStorage.setItem("novajournal_currency", defaultCurrency);
      localStorage.setItem("novajournal_timezone", timezone);
      localStorage.setItem("novajournal_date_format", dateFormat);
      localStorage.setItem("novajournal_number_format", numberFormat);
      window.dispatchEvent(new Event("novajournal_intl_changed"));
      window.dispatchEvent(new Event("storage"));
      showSuccessNotice("Preferensi mata uang dan regional ECMAScript Intl tersimpan!");
    } catch {
      showSuccessNotice("Pengaturan regional disimpan.");
    }
  };

  // 6. Notification Handlers
  const handleSaveNotifications = () => {
    try {
      localStorage.setItem("novajournal_notifications", String(pushNotifications));
      localStorage.setItem("novajournal_email_alerts", String(emailDigest));
      localStorage.setItem("novajournal_sound_fx", String(soundEffects));
      showSuccessNotice("Preferensi notifikasi tersimpan!");
    } catch {}
  };

  // Revoke session
  const revokeSession = (id: string) => {
    playSoftChime();
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    showSuccessNotice("Sesi perangkat berhasil dihentikan.");
  };

  return (
    <div className="min-h-screen bg-background p-2.5 sm:p-5 md:p-6 text-foreground">
      <div className="max-w-4xl mx-auto space-y-3.5 sm:space-y-5 pb-28 sm:pb-24">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-200/80 dark:border-default-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Settings & System Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                v1.2.0
              </span>
            </div>
            <p className="text-default-500 mt-0.5 text-xs sm:text-sm">
              Pusat kendali akun, kecerdasan buatan, copilot melayang, tampilan HeroUI, dan tata kelola RBAC.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {saveSuccessMsg && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              {areAllFolded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                  <span>Buka Semua Seksi</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tutup Semua Seksi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION QUICK-JUMP ANCHOR NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="sticky top-0 z-30 -mx-3 sm:-mx-5 md:-mx-6 px-3 sm:px-5 md:px-6 py-2 bg-background/90 backdrop-blur-md border-b border-default-200/70 dark:border-default-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none scroll-smooth">
          {SETTINGS_SECTIONS.map((sec) => {
            const isActive = activeSectionId === sec.id;
            const IconComp = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "text-white shadow-xs font-bold ring-1 ring-white/20"
                    : "bg-default-100/80 dark:bg-default-800/60 hover:bg-default-200/80 dark:hover:bg-default-700 text-default-600 dark:text-default-400"
                }`}
                style={isActive ? { backgroundColor: activePalette.hex, color: "#ffffff" } : undefined}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-default-400"}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: AI INTELLIGENCE & MULTI-PROVIDER HUB */}
        {/* ========================================================================= */}
        <Card id="section-ai" className="scroll-mt-16 rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/20 bg-linear-to-br from-white via-blue-50/15 to-purple-50/15 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 shadow-sm overflow-hidden">
          {/* Card Header (Clickable for Fold/Unfold) */}
          <div
            onClick={() => toggleFold("ai")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-blue-500/5 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    AI Intelligence & Multi-Provider Hub
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Core Engine
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Konfigurasi pusat mesin AI: Google Gemini, Groq, DeepSeek, & Claude.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
                {foldedSections.ai ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* Unfolded Content */}
          {!foldedSections.ai && (
            <div className="p-4 sm:p-5 pt-0 space-y-3.5 border-t border-default-200/60 dark:border-default-800">
              {/* ── Sub-seksi 1: Status & Kuota Token Model (Live Usage Tracker) ── */}
              <div className="rounded-xl border border-default-200/70 dark:border-default-700/60 bg-white/70 dark:bg-default-900/40 overflow-hidden shadow-2xs mt-3">
                <div
                  onClick={() => toggleAiSubFold("usage")}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/40 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">1. Status & Kuota Token Model</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Live Monitor
                        </span>
                      </div>
                      <p className="text-[10px] text-default-400">
                        Indikator sisa kuota (merah-kuning-hijau), RPM/TPM, dan latensi response.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-default-400">
                      {aiSubFolds.usage ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {!aiSubFolds.usage && (
                  <div className="p-3 sm:p-4 pt-0 space-y-3 border-t border-default-100 dark:border-default-800/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {modelUsageList.map((m) => {
                        const isOptimal = m.health === "green";
                        const isWarning = m.health === "yellow";
                        const dotColor = isOptimal ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500";
                        const barColor = isOptimal ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500";
                        const badgeBg = isOptimal ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : isWarning ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl border border-default-200/60 dark:border-default-700/50 bg-default-50/50 dark:bg-default-800/30 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0 animate-pulse`} />
                                <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase border ${badgeBg}`}>
                                {m.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-default-500">
                              <span>Sisa Kuota: <strong className="text-foreground">{m.quotaRemaining}%</strong></span>
                              <span className="font-mono">{m.latency} ms</span>
                            </div>

                            {/* Simple Red-Yellow-Green Progress Bar */}
                            <div className="w-full h-1.5 rounded-full bg-default-200 dark:bg-default-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${m.quotaRemaining}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-default-400 font-mono pt-0.5">
                              <span>Beban: {m.tokensUsed}</span>
                              <span>Req: {m.requestsToday}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-default-100 dark:border-default-800">
                      <span className="text-[10px] text-default-400 text-center sm:text-left">
                        Status skala: 🟢 Hijau (&gt;50% Aman) · 🟡 Kuning (20-50% Wajar) · 🔴 Merah (&lt;20% Kritis)
                      </span>
                      <button
                        type="button"
                        onClick={handleCheckAllAiHealth}
                        disabled={checkingAllAiHealth}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-semibold cursor-pointer hover:bg-default-100 dark:hover:bg-default-700 transition active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-emerald-500 ${checkingAllAiHealth ? "animate-spin" : ""}`} />
                        <span>Ping & Cek Kuota Real-time</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sub-seksi 2: Strategi Routing & Model Utama ── */}
              <div className="rounded-xl border border-default-200/70 dark:border-default-700/60 bg-white/70 dark:bg-default-900/40 overflow-hidden shadow-2xs">
                <div
                  onClick={() => toggleAiSubFold("routing")}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/40 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">2. Strategi Routing & Failover AI</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Multi-Model
                        </span>
                      </div>
                      <p className="text-[10px] text-default-400">
                        Pilihan mode failover otomatis, round-robin load balancer, atau optimasi biaya.
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-default-400">
                    {aiSubFolds.routing ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>

                {!aiSubFolds.routing && (
                  <div className="p-3 sm:p-4 pt-0 space-y-3.5 border-t border-default-100 dark:border-default-800/60">
                    {/* Routing Mode Selector Pills */}
                    <div className="pt-2 space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">
                        Pilih Kebijakan Routing Eksekusi AI:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                          { id: "fallback", label: "Smart Failover", desc: "Auto-pindah ke Groq/Claude jika Gemini limit" },
                          { id: "round-robin", label: "Round-Robin", desc: "Bagi request bergiliran ke semua model aktif" },
                          { id: "cost", label: "Cost-Optimized", desc: "Prioritaskan tier gratis & termurah (Groq / DeepSeek)" },
                          { id: "speed", label: "Speed-Optimized", desc: "Utamakan latensi terendah (~90ms via Groq)" },
                          { id: "primary", label: "Single Primary", desc: "Hanya gunakan model tunggal tanpa beralih" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              playSoftChime();
                              setAiRoutingMode(m.id as any);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              aiRoutingMode === m.id
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/30"
                                : "border-default-200 dark:border-default-700/60 bg-default-50/40 dark:bg-default-800/30 hover:bg-default-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{m.label}</span>
                              {aiRoutingMode === m.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <p className="text-[10px] text-default-400 mt-0.5 leading-snug">{m.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Model Selector & Test */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-foreground block">
                          Model Utama / Primary Endpoint:
                        </label>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value as any)}
                          className="w-full h-8.5 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                        >
                          <option value="auto">⚡ Auto-Detect Pintar (Groq → Gemini → DeepSeek → Claude)</option>
                          <option value="gemini">✨ Google Gemini 2.0 Flash (Multimodal & Analisis Dokumen)</option>
                          <option value="groq">⚡ Groq Cloud (Llama 3.3 70B - Super Cepat ~90ms)</option>
                          <option value="deepseek">🧠 DeepSeek Reasoner (DeepSeek-V3 / R1 Pemikiran Finansial)</option>
                          <option value="claude">🎭 Anthropic Claude 3.5 Sonnet (Presisi Akuntansi Korporat)</option>
                        </select>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8.5 text-xs px-3 font-medium cursor-pointer border border-default-200 dark:border-default-700 bg-white dark:bg-default-800"
                        onPress={handleTestAi}
                        isDisabled={testingAi}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingAi ? "animate-spin" : ""}`} />
                        <span>Uji Respon Model</span>
                      </Button>
                    </div>

                    {testResult && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          testResult.success
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                          <span>{testResult.message}</span>
                        </div>
                        {testResult.latency && (
                          <span className="text-[11px] font-mono font-semibold opacity-80">{testResult.latency} ms</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Sub-seksi 3: Kunci API Provider Mandiri (BYOK) ── */}
              <div className="rounded-xl border border-default-200/70 dark:border-default-700/60 bg-white/70 dark:bg-default-900/40 overflow-hidden shadow-2xs">
                <div
                  onClick={() => toggleAiSubFold("byok")}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/40 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">3. Kunci API Provider Mandiri (BYOK)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Client-Side Storage
                        </span>
                      </div>
                      <p className="text-[10px] text-default-400">
                        Kunci API disimpan aman di browser lokal Anda tanpa disimpan plaintext di database server.
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-default-400">
                    {aiSubFolds.byok ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>

                {!aiSubFolds.byok && (
                  <div className="p-3 sm:p-4 pt-0 space-y-3 border-t border-default-100 dark:border-default-800/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Groq Cloud API Key</span>
                          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">Dapatkan Key <ExternalLink className="w-2.5 h-2.5" /></a>
                        </label>
                        <input
                          type="password"
                          placeholder="gsk_..."
                          value={groqKey}
                          onChange={(e) => setGroqKey(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-500" /> Google Gemini API Key</span>
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">Dapatkan Key <ExternalLink className="w-2.5 h-2.5" /></a>
                        </label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1"><Key className="w-3 h-3 text-cyan-500" /> DeepSeek API Key</span>
                          <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">Dapatkan Key <ExternalLink className="w-2.5 h-2.5" /></a>
                        </label>
                        <input
                          type="password"
                          placeholder="sk-..."
                          value={deepseekKey}
                          onChange={(e) => setDeepseekKey(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1"><Key className="w-3 h-3 text-purple-500" /> Anthropic Claude API Key</span>
                          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">Dapatkan Key <ExternalLink className="w-2.5 h-2.5" /></a>
                        </label>
                        <input
                          type="password"
                          placeholder="sk-ant-..."
                          value={claudeKey}
                          onChange={(e) => setClaudeKey(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sub-seksi 4: Custom AI Gateway & Proxy Port ── */}
              <div className="rounded-xl border border-default-200/70 dark:border-default-700/60 bg-white/70 dark:bg-default-900/40 overflow-hidden shadow-2xs">
                <div
                  onClick={() => toggleAiSubFold("proxy")}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/40 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/10 text-cyan-600 flex items-center justify-center">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">4. Gateway Proxy Port & Port Lokal</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${useCustomProxy ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" : "bg-default-100 text-default-500 border-default-200"}`}>
                          {useCustomProxy ? "Aktif" : "Non-aktif"}
                        </span>
                      </div>
                      <p className="text-[10px] text-default-400">
                        OpenRouter, 9Router (Port 8000), Omni, OneAPI, LM Studio, & Ollama (Port 11434).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-default-400">
                      {aiSubFolds.proxy ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {!aiSubFolds.proxy && (
                  <div className="p-3 sm:p-4 pt-0 space-y-3.5 border-t border-default-100 dark:border-default-800/60">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-default-50/80 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 mt-2">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">Gunakan Custom Gateway / Proxy Port</span>
                        <span className="text-[10px] text-default-400">Arahkan seluruh panggilan AI ke port lokal atau gateway terpadu</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={useCustomProxy}
                        onClick={() => setUseCustomProxy(!useCustomProxy)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border ${
                          useCustomProxy ? "bg-cyan-600 border-cyan-500 shadow-sm" : "bg-slate-400 dark:bg-slate-700 border-slate-500 dark:border-slate-600 shadow-inner"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          useCustomProxy ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>

                    {useCustomProxy && (
                      <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3 animate-in fade-in duration-200">
                        {/* Presets */}
                        <div>
                          <label className="text-[11px] font-semibold text-foreground block mb-1">
                            Pilihan Preset Port & Gateway:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: "openrouter", label: "OpenRouter Cloud", url: "https://openrouter.ai/api/v1", model: "anthropic/claude-3.5-sonnet" },
                              { id: "9router", label: "9Router / Omni (Port 8000)", url: "http://127.0.0.1:8000/v1", model: "meta-llama/llama-3.3-70b" },
                              { id: "oneapi", label: "OneAPI / NewAPI (Port 3000)", url: "http://127.0.0.1:3000/v1", model: "deepseek/deepseek-r1" },
                              { id: "ollama", label: "Ollama Local (Port 11434)", url: "http://127.0.0.1:11434/v1", model: "qwen2.5:7b" },
                            ].map((pr) => (
                              <button
                                key={pr.id}
                                type="button"
                                onClick={() => {
                                  playSoftChime();
                                  setProxyPreset(pr.id as any);
                                  setProxyBaseUrl(pr.url);
                                  setProxyModelName(pr.model);
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                                  proxyPreset === pr.id
                                    ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                                    : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                                }`}
                              >
                                {pr.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-medium text-foreground block mb-1">
                              Base URL / Proxy Host & Port
                            </label>
                            <input
                              type="text"
                              value={proxyBaseUrl}
                              onChange={(e) => setProxyBaseUrl(e.target.value)}
                              placeholder="http://127.0.0.1:8000/v1"
                              className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-foreground block mb-1">
                              Target Model ID
                            </label>
                            <input
                              type="text"
                              value={proxyModelName}
                              onChange={(e) => setProxyModelName(e.target.value)}
                              placeholder="anthropic/claude-3.5-sonnet"
                              className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-cyan-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-medium text-foreground block mb-1 flex items-center justify-between">
                              <span>Proxy Auth Bearer Token (Opsional)</span>
                              <span className="text-[10px] text-default-400">Kosongkan jika local Ollama/9Router tanpa auth</span>
                            </label>
                            <input
                              type="password"
                              value={proxyApiKey}
                              onChange={(e) => setProxyApiKey(e.target.value)}
                              placeholder="sk-or-v1-... atau bearer token kustom"
                              className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-cyan-500"
                            />
                          </div>
                        </div>

                        {/* Test Button & Result */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-cyan-500/20">
                          <button
                            type="button"
                            onClick={handleTestProxy}
                            disabled={testingProxy}
                            className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold cursor-pointer hover:bg-cyan-700 transition active:scale-95 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${testingProxy ? "animate-spin" : ""}`} />
                            <span>Uji Endpoint Gateway</span>
                          </button>

                          {proxyTestResult && (
                            <div className={`text-[11px] flex items-center gap-1.5 font-medium ${proxyTestResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {proxyTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              <span>{proxyTestResult.message}</span>
                              {proxyTestResult.latency && <span className="font-mono opacity-75">({proxyTestResult.latency}ms)</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Sub-seksi 5: Edukasi Keamanan & Etika Data Finansial ── */}
              <div className="rounded-xl border border-default-200/70 dark:border-default-700/60 bg-white/70 dark:bg-default-900/40 overflow-hidden shadow-2xs">
                <div
                  onClick={() => toggleAiSubFold("security")}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/40 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        5. Arsitektur Keamanan & Etika Data Finansial (Zero-Trust BYOK)
                      </span>
                      <p className="text-[10px] text-default-400">
                        Penjelasan kepatuhan GDPR, UU PDP, penyimpanan lokal, dan vault enkripsi.
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-default-400">
                    {aiSubFolds.security ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>

                {!aiSubFolds.security && (
                  <div className="p-3 sm:p-4 pt-0 space-y-2 text-default-500 text-[11px] leading-relaxed border-t border-default-100 dark:border-default-800/60">
                    <p className="pt-2">
                      Secara standar etika privasi finansial (GDPR / UU PDP), API Key pengguna di NovaJournal disimpan di <strong>Client-Side Storage lokal browser</strong>. Server database tidak menyimpan plaintext kunci API Anda, mencegah risiko kebocoran saat database diakses atau dicadangkan (Zero-Liability).
                    </p>
                    <p className="text-[10px] text-default-400">
                      💡 <em>Air-Gapped & On-Premise:</em> Penggunaan <strong>Local Proxy Port (9Router / Ollama)</strong> di atas memberikan kepatuhan 100% tanpa data transaksi keluar jaringan privat perusahaan.
                    </p>
                  </div>
                )}
              </div>

              {/* Save Button for Section 1 */}
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  className="h-8.5 px-4 text-xs bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                  onPress={handleSaveAiConfig}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Konfigurasi AI Hub & Routing</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 2: NOVA AI COPILOT & VOICE INTERFACE (PERSISTENT MODAL CONFIG) */}
        {/* ========================================================================= */}
        <Card id="section-copilot" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("copilot")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Nova AI Copilot & Voice Interface
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Floating Widget
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Visibilitas, mode tampilan (icon / summary / full), lebar jendela, dan sound response.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
                {foldedSections.copilot ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {!foldedSections.copilot && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              {/* Visibility Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                <div>
                  <p className="text-xs font-bold text-foreground">Tampilkan Nova AI Copilot di Layar</p>
                  <p className="text-[11px] text-default-500">
                    Jika aktif, widget copilot persistent akan melayang di pojok layar aplikasi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCopilot}
                    onChange={(e) => setShowCopilot(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:border-purple-600 shadow-inner"></div>
                </label>
              </div>

              {/* Launcher Appearance Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Mode Tampilan Tombol Melayang (Launcher)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "full",
                      title: "Lebar Penuh (Pill)",
                      desc: "Badge informatif dengan nama provider AI aktif.",
                      badge: "Rekomendasi",
                    },
                    {
                      id: "icon",
                      title: "Cuma Icon (FAB)",
                      desc: "Tombol melayang 48px minimalis dengan aura neon.",
                      badge: "Kompak",
                    },
                    {
                      id: "summary",
                      title: "Summary Status Bar",
                      desc: "Pill ringkas dengan indikator kesehatan kas real-time.",
                      badge: "FinTech Insight",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setCopilotMode(mode.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotMode === mode.id
                          ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-foreground ring-1 ring-purple-500"
                          : "border-default-200 dark:border-default-700 bg-white dark:bg-default-900/40 hover:bg-default-50 text-default-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{mode.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-default-500">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Window Width & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Lebar Jendela Interaktif (Saat Terbuka)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWideCopilot(false)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                        !isWideCopilot
                          ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                      }`}
                    >
                      Standard (420px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWideCopilot(true)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                        isWideCopilot
                          ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                      }`}
                    >
                      Studio Lebar (480px / 640px)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Posisi Melayang di Layar
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "bottom-right", label: "Kanan Bawah" },
                      { id: "bottom-left", label: "Kiri Bawah" },
                      { id: "floating-center", label: "Tengah Layar" },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setCopilotPos(pos.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                          copilotPos === pos.id
                            ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                            : "bg-default-50 dark:bg-default-800 border-default-200 text-default-700 dark:text-default-300"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Feedback & Voice Synthesis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Efek Suara Kosmik Nova</span>
                    <span className="text-[11px] text-default-500">Audio sintetis Web Audio API saat kirim & terima pesan.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={copilotSound}
                      onChange={(e) => setCopilotSound(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-400 dark:bg-slate-700 border border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:border-purple-600 shadow-inner"></div>
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Text-To-Speech (TTS) Voice</span>
                    <span className="text-[11px] text-default-500">Dukungan pembacaan suara natural via Web Speech API.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={copilotTts}
                      onChange={(e) => setCopilotTts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-400 dark:bg-slate-700 border border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:border-purple-600 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* ── Window Size & Behavior ── */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-500" />
                  Ukuran & Perilaku Jendela
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Custom Size Card */}
                  <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-foreground block">Ukuran Kustom (W × H)</span>
                        <span className="text-[10px] text-default-500">
                          {useCustomSize ? `${customCopilotWidth} × ${customCopilotHeight}px` : "Default"}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={useCustomSize}
                        onClick={() => setUseCustomSize(!useCustomSize)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border ${
                          useCustomSize ? "bg-purple-600 border-purple-500 shadow-sm" : "bg-slate-400 dark:bg-slate-700 border-slate-500 dark:border-slate-600 shadow-inner"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md border border-black/10 transition-transform ${
                          useCustomSize ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                    {useCustomSize && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-default-400 font-semibold uppercase">W (px)</label>
                          <input type="number" min={320} max={900} value={customCopilotWidth}
                            onChange={(e) => setCustomCopilotWidth(Number(e.target.value))}
                            className="w-full h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500" />
                        </div>
                        <span className="text-default-400 text-xs mt-3">×</span>
                        <div className="flex-1">
                          <label className="text-[9px] text-default-400 font-semibold uppercase">H (px)</label>
                          <input type="number" min={400} max={900} value={customCopilotHeight}
                            onChange={(e) => setCustomCopilotHeight(Number(e.target.value))}
                            className="w-full h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500" />
                        </div>
                      </div>
                    )}
                    {useCustomSize && (
                      <div className="flex flex-wrap gap-1">
                        {[
                          { w: 420, h: 560, label: "Standard" },
                          { w: 480, h: 620, label: "Wide" },
                          { w: 560, h: 680, label: "Studio" },
                          { w: 640, h: 720, label: "Pro" },
                        ].map((preset) => (
                          <button key={preset.label} type="button"
                            onClick={() => { setCustomCopilotWidth(preset.w); setCustomCopilotHeight(preset.h); }}
                            className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold cursor-pointer transition ${
                              customCopilotWidth === preset.w && customCopilotHeight === preset.h
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-500 hover:bg-default-100"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Always On Top / Pinned Card */}
                  <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-foreground block">Always on Top (Pinned)</span>
                        <span className="text-[10px] text-default-500">Jendela tetap di atas semua konten</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={copilotPinned}
                        onClick={() => setCopilotPinned(!copilotPinned)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border ${
                          copilotPinned ? "bg-purple-600 border-purple-500 shadow-sm" : "bg-slate-400 dark:bg-slate-700 border-slate-500 dark:border-slate-600 shadow-inner"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md border border-black/10 transition-transform ${
                          copilotPinned ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-default-400 leading-relaxed">
                      Ketika aktif, modal copilot akan selalu tampil di atas halaman saat scroll. Berguna saat analisis data panjang.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Model / Mesin AI ── */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Model / Mesin AI Copilot
                </label>
                <p className="text-[11px] text-default-500 -mt-1">
                  Model terhubung sesuai API Key yang tersedia di Seksi 1. Jika key tidak diisi, model tampil nonaktif.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "gemini" as const, name: "Gemini 2.0 Flash", provider: "Google AI", icon: "✨", keyField: geminiKey, defaultAvailable: true },
                    { id: "groq" as const, name: "Llama 3.3 70B", provider: "Groq Cloud", icon: "⚡", keyField: groqKey, defaultAvailable: false },
                    { id: "deepseek" as const, name: "DeepSeek V3 / R1", provider: "DeepSeek", icon: "🧠", keyField: deepseekKey, defaultAvailable: false },
                    { id: "claude" as const, name: "Claude 3.5 Sonnet", provider: "Anthropic", icon: "🎭", keyField: claudeKey, defaultAvailable: false },
                  ]).map((m) => {
                    const isAvailable = m.defaultAvailable || !!m.keyField;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setCopilotModel(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          !isAvailable
                            ? "opacity-50 cursor-not-allowed border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-900/40"
                            : copilotModel === m.id
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30 cursor-pointer"
                            : "border-default-200 dark:border-default-700 bg-white dark:bg-default-900/40 hover:bg-default-50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">{m.icon} {m.name}</span>
                          {copilotModel === m.id && isAvailable && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <span className="text-[10px] text-default-500">{m.provider}</span>
                        {!isAvailable && (
                          <span className="block text-[9px] mt-1 text-orange-500 font-semibold">⚠ Perlu API Key di Seksi 1</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Gaya Personalitas & Tone ── */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-500" />
                  Gaya Personalitas & Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "cfo" as const, label: "CFO Korporat", desc: "Efisiensi kas, ROI, margin operasional.", color: "blue" },
                    { id: "buddy" as const, label: "Sahabat Finansial", desc: "Santai, ramah, memotivasi menabung.", color: "emerald" },
                    { id: "auditor" as const, label: "Auditor Forensik", desc: "Kritis, deteksi kebocoran anggaran.", color: "purple" },
                    { id: "analyst" as const, label: "Analis Portofolio", desc: "Alokasi aset, yield, diversifikasi.", color: "amber" },
                  ]).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCopilotPersona(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotPersona === p.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-white dark:bg-default-900/40 hover:bg-default-50"
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

              {/* ── Akses Data & Privasi ── */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-500" />
                  Akses Data & Privasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "full" as const, label: "Akses Penuh", desc: "AI melihat semua data transaksi, wallet & dokumen.", icon: "🔓" },
                    { id: "advisory" as const, label: "Penasihat Saja", desc: "AI melihat summary tanpa detail nominal mentah.", icon: "📊" },
                    { id: "restricted" as const, label: "Privasi Terisolasi", desc: "AI tidak akses data, hanya chat umum.", icon: "🔒" },
                  ]).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setCopilotAccess(a.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotAccess === a.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-white dark:bg-default-900/40 hover:bg-default-50"
                      }`}
                    >
                      <div className="text-sm mb-1">{a.icon}</div>
                      <span className="text-[11px] font-bold text-foreground block">{a.label}</span>
                      <p className="text-[10px] text-default-500 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Voice Over Model Selector ── */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-500" />
                  Voice Over Model (TTS)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "id-female-nova", label: "Gadis Nova ID", lang: "🇮🇩 Indonesia", desc: "Suara perempuan lembut Indonesia" },
                    { id: "id-male-budi", label: "Budi Finansial ID", lang: "🇮🇩 Indonesia", desc: "Suara laki-laki profesional Indonesia" },
                    { id: "en-female-studio", label: "Nova Studio EN", lang: "🇺🇸 English", desc: "Female US studio voice" },
                    { id: "en-male-cfo", label: "Executive British EN", lang: "🇬🇧 English", desc: "Male British executive voice" },
                    { id: "browser-default", label: "Browser Default", lang: "🌐 System", desc: "Default browser TTS voice" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCopilotVoice(v.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        copilotVoice === v.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-700 bg-white dark:bg-default-900/40 hover:bg-default-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-foreground">{v.label}</span>
                          <span className="text-[10px] text-default-400 ml-1.5">{v.lang}</span>
                        </div>
                        {copilotVoice === v.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </div>
                      <p className="text-[10px] text-default-500 mt-0.5">{v.desc}</p>
                    </button>
                  ))}
                </div>
                {/* Tes Suara Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                      playSoftChime();
                      const testText = copilotVoice.includes("en")
                        ? "Hello! I am Nova, your AI financial copilot. Let me help you manage your cashflow."
                        : "Halo! Saya Nova, copilot keuangan AI Anda. Mari kita kelola arus kas bersama.";
                      const utterance = new SpeechSynthesisUtterance(testText);
                      utterance.lang = copilotVoice.includes("en") ? (copilotVoice.includes("british") || copilotVoice === "en-male-cfo" ? "en-GB" : "en-US") : "id-ID";
                      utterance.pitch = copilotVoice === "id-female-nova" ? 1.1 : copilotVoice === "id-male-budi" ? 0.85 : copilotVoice === "en-male-cfo" ? 0.8 : 1.0;
                      utterance.rate = copilotVoice === "en-female-studio" ? 1.05 : copilotVoice === "id-male-budi" ? 0.96 : 1.0;
                      const voices = window.speechSynthesis.getVoices();
                      const matchVoice = copilotVoice.includes("en")
                        ? voices.find(v => v.lang.includes("en"))
                        : voices.find(v => v.lang.includes("id") || v.lang.includes("ID"));
                      if (matchVoice) utterance.voice = matchVoice;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold cursor-pointer hover:bg-purple-700 transition active:scale-95"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Tes Suara
                </button>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  size="sm"
                  className="h-8.5 px-4 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                  onPress={handleSaveCopilotConfig}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Pengaturan Copilot</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 3: PROFILE SETTINGS & AVATAR WITH ANIMATED GIF / WEBP SUPPORT */}
        {/* ========================================================================= */}
        <Card id="section-profile" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("profile")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Profile & Identity Management
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                    GIF / WebP Ready
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Foto avatar profil, preview crop melingkar, identitas eksekutif, dan kontak.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
                {foldedSections.profile ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {!foldedSections.profile && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              {/* Profile Avatar Row */}
              <div className="p-4 rounded-xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 flex flex-col sm:flex-row items-center gap-4">
                {/* Circle Avatar with Live Glow */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-purple-600 p-0.5 shadow-xl shadow-blue-500/20">
                    <div className="w-full h-full rounded-full bg-default-100 dark:bg-default-800 overflow-hidden flex items-center justify-center">
                      {avatarImage ? (
                        <img src={avatarImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-blue-600">
                          {firstName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">{firstName} {lastName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600">
                      {jobTitle}
                    </span>
                  </div>
                  <p className="text-xs text-default-500">
                    Mendukung format gambar modern: <strong>GIF Animasi</strong>, <strong>WebP</strong>, PNG, dan JPG.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs font-semibold px-3 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95 shadow-xs"
                      onPress={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span>Unggah Foto Avatar</span>
                    </Button>

                    {avatarImage && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs font-semibold px-3 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                        onPress={handleRemoveAvatar}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        <span>Hapus Avatar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium mb-1 block text-foreground">Nama Depan</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-foreground">Nama Belakang</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-foreground">Alamat Email Bisnis</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-foreground">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block text-foreground">Jabatan / Corporate Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block text-foreground">Visi / Catatan Finansial</label>
                  <textarea
                    rows={2}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="h-8.5 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                  onPress={handleSaveProfile}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Informasi Profil</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 4: APPEARANCE & HEROUI THEME SELECTOR */}
        {/* ========================================================================= */}
        <Card id="section-appearance" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("appearance")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Appearance & HeroUI Themes
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    Palet Warna HeroUI
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Mode gelap/terang, palet warna aksen, dan kepadatan visual UI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
                {foldedSections.appearance ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {!foldedSections.appearance && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              {/* Dark / Light Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                <div>
                  <p className="text-xs font-bold text-foreground">Mode Gelap (Dark Theme)</p>
                  <p className="text-[11px] text-default-500">
                    Beralih antara tema gelap dan terang dengan efek suara lembut Nova.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkTheme}
                  onClick={toggleThemeMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border ${
                    isDarkTheme
                      ? "bg-orange-500 border-orange-400 shadow-sm"
                      : "bg-slate-400 dark:bg-slate-700 border-slate-500 dark:border-slate-600 shadow-inner"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md border border-black/10 transition-transform ${
                    isDarkTheme ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {/* HeroUI Color Palettes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Pilihan Palet Tema Aksen HeroUI
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: "blue", name: "Modern Blue", hex: "#2563eb", bgClass: "bg-blue-600" },
                    { id: "violet", name: "Cyber Violet", hex: "#7c3aed", bgClass: "bg-violet-600" },
                    { id: "emerald", name: "Emerald Growth", hex: "#059669", bgClass: "bg-emerald-600" },
                    { id: "amber", name: "Amber Wealth", hex: "#d97706", bgClass: "bg-amber-600" },
                    { id: "rose", name: "Crimson Alpha", hex: "#e11d48", bgClass: "bg-rose-600" },
                    { id: "slate", name: "Slate Corporate", hex: "#475569", bgClass: "bg-slate-600" },
                  ].map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => handleThemePaletteChange(pal.id as any)}
                      className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        themePalette === pal.id
                          ? "ring-2 shadow-md"
                          : "border-default-200 dark:border-default-800 bg-white dark:bg-default-900/40 hover:bg-default-50 dark:hover:bg-default-800/60"
                      }`}
                      style={
                        themePalette === pal.id
                          ? {
                              borderColor: pal.hex,
                              boxShadow: `0 0 0 3px ${pal.hex}25`,
                              backgroundColor: `${pal.hex}08`,
                            }
                          : undefined
                      }
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-xs flex items-center justify-center text-white"
                        style={{ backgroundColor: pal.hex }}
                      >
                        {themePalette === pal.id && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[11px] font-bold text-foreground text-center leading-tight">
                        {pal.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* HeroUI ColorPicker Component */}
                <div className="pt-2 border-t border-default-200/60 dark:border-default-700/60">
                  <label className="text-[11px] font-semibold text-foreground block mb-1.5">
                    Kustom Warna Palet HeroUI (ColorPicker):
                  </label>
                  <ColorPicker
                    value={(() => {
                      try {
                        return parseColor(customHexColor.startsWith("#") ? customHexColor : `#${customHexColor}`);
                      } catch {
                        return parseColor("#2563eb");
                      }
                    })()}
                    onChange={(c) => {
                      const hex = c.toString("hex");
                      setCustomHexColor(hex);
                      document.documentElement.style.setProperty("--primary-color", hex);
                      document.documentElement.style.setProperty("--primary-hover", hex);
                      try {
                        localStorage.setItem("novajournal_custom_hex", hex);
                      } catch {}
                    }}
                    className="w-full"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <ColorPicker.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer transition shadow-2xs">
                        <ColorSwatch className="w-5 h-5 rounded-lg border border-black/10 shadow-xs" />
                        <span className="font-mono text-xs font-bold text-foreground uppercase">{customHexColor}</span>
                        <span className="text-[10px] text-default-400">Buka Palet &rarr;</span>
                      </ColorPicker.Trigger>

                      <button
                        type="button"
                        onClick={() => {
                          playNovaSpaceSound();
                          document.documentElement.style.setProperty("--primary-color", customHexColor);
                          document.documentElement.style.setProperty("--primary-hover", customHexColor);
                          window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: "custom" }));
                          showSuccessNotice(`Warna kustom ${customHexColor} diterapkan ke seluruh aplikasi!`);
                        }}
                        className="text-xs px-3.5 py-1.5 rounded-xl text-white font-semibold cursor-pointer shadow-xs active:scale-95 transition"
                        style={{ backgroundColor: customHexColor }}
                      >
                        Terapkan ke Sistem
                      </button>
                    </div>

                    <ColorPicker.Popover className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-default-200 dark:border-default-800 space-y-3 z-50">
                      <ColorArea className="w-56 h-36 rounded-xl border border-default-200 dark:border-default-700" />
                      <ColorSlider channel="hue" className="w-56" />
                      <ColorField className="w-56 text-xs font-mono" />
                    </ColorPicker.Popover>
                  </ColorPicker>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* GRANULAR UI DENSITY CONTROLS (SIDEBAR, NAVBAR, LAYOUT) */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-2 border-t border-default-200/60 dark:border-default-700/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>Kepadatan Antarmuka Spesifik (Sidebar, Navbar, & Layout)</span>
                    </h3>
                    <p className="text-[11px] text-default-500">
                      Sesuaikan skala visual dan ruang bernapas per area antarmuka kerja Anda.
                    </p>
                  </div>

                  {/* Global Presets */}
                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    <span className="text-[10px] font-semibold text-default-400 mr-1 hidden sm:inline">Preset:</span>
                    <button
                      type="button"
                      onClick={() => applyGlobalPreset("compact")}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        sidebarDensity === "compact" && navbarDensity === "compact" && layoutDensity === "compact"
                          ? "bg-theme-primary text-white border-transparent shadow-xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      Ringkas
                    </button>
                    <button
                      type="button"
                      onClick={() => applyGlobalPreset("standard")}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        sidebarDensity === "standard" && navbarDensity === "standard" && layoutDensity === "standard"
                          ? "bg-theme-primary text-white border-transparent shadow-xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => applyGlobalPreset("spacious")}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        sidebarDensity === "spacious" && navbarDensity === "spacious" && layoutDensity === "spacious"
                          ? "bg-theme-primary text-white border-transparent shadow-xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      Lega
                    </button>
                  </div>
                </div>

                {/* 3 Dedicated Granular Density Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: Sidebar */}
                  <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/60 bg-default-50/60 dark:bg-default-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <PanelLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Sidebar Navigasi</span>
                          <span className="text-[10px] text-default-400">Bilah menu samping</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {sidebarDensity}
                      </span>
                    </div>
                    <p className="text-[10px] text-default-500 leading-tight">
                      Sesuaikan lebar bilah samping dan ruang antar ikon navigasi.
                    </p>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {[
                        { id: "compact", label: "Ringkas", sub: "13.5rem" },
                        { id: "standard", label: "Standar", sub: "15.0rem" },
                        { id: "spacious", label: "Lega", sub: "17.0rem" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSidebarDensityChange(item.id as any)}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center ${
                            sidebarDensity === item.id
                              ? "border-transparent shadow-xs font-bold text-white"
                              : "bg-white dark:bg-default-900/60 border-default-200 dark:border-default-700 text-default-600 dark:text-default-400 hover:bg-default-100"
                          }`}
                          style={sidebarDensity === item.id ? { backgroundColor: activePalette.hex } : undefined}
                        >
                          <span className="text-[11px] font-semibold">{item.label}</span>
                          <span className="text-[8px] opacity-75 font-mono">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Navbar */}
                  <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/60 bg-default-50/60 dark:bg-default-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <LayoutTemplate className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Navbar Header</span>
                          <span className="text-[10px] text-default-400">Bilah atas sistem</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {navbarDensity}
                      </span>
                    </div>
                    <p className="text-[10px] text-default-500 leading-tight">
                      Ketinggian bilah atas header, padding, dan ukuran avatar profil.
                    </p>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {[
                        { id: "compact", label: "Ringkas", sub: "52px" },
                        { id: "standard", label: "Standar", sub: "60px" },
                        { id: "spacious", label: "Lega", sub: "72px" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavbarDensityChange(item.id as any)}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center ${
                            navbarDensity === item.id
                              ? "border-transparent shadow-xs font-bold text-white"
                              : "bg-white dark:bg-default-900/60 border-default-200 dark:border-default-700 text-default-600 dark:text-default-400 hover:bg-default-100"
                          }`}
                          style={navbarDensity === item.id ? { backgroundColor: activePalette.hex } : undefined}
                        >
                          <span className="text-[11px] font-semibold">{item.label}</span>
                          <span className="text-[8px] opacity-75 font-mono">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Layout & Content */}
                  <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/60 bg-default-50/60 dark:bg-default-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">Layout & Kartu</span>
                          <span className="text-[10px] text-default-400">Jarak widget & konten</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {layoutDensity}
                      </span>
                    </div>
                    <p className="text-[10px] text-default-500 leading-tight">
                      Jarak margin antar widget dashboard, padding kartu, & font dasar.
                    </p>
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { id: "compact", label: "Padat" },
                        { id: "standard", label: "Standar" },
                        { id: "spacious", label: "Lega" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleLayoutDensityChange(item.id as any)}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            layoutDensity === item.id
                              ? "border-transparent shadow-xs font-bold text-white"
                              : "bg-white dark:bg-default-900/60 border-default-200 dark:border-default-700 text-default-600 dark:text-default-400 hover:bg-default-100"
                          }`}
                          style={layoutDensity === item.id ? { backgroundColor: activePalette.hex } : undefined}
                        >
                          <span className="text-[10px] font-semibold">{item.label}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          playSoftChime();
                          setIsDensityModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          uiDensity === "custom"
                            ? "border-transparent shadow-xs font-bold text-white"
                            : "bg-white dark:bg-default-900/60 border-default-200 dark:border-default-700 text-default-600 dark:text-default-400 hover:bg-default-100"
                        }`}
                        style={uiDensity === "custom" ? { backgroundColor: activePalette.hex } : undefined}
                        title="Buka slider persentase kustom"
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5" />
                        <span className="text-[9px] font-mono font-bold">{densityScale}%</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

                {/* Ambient Mesh Glow Switch */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Latar Belakang Kosmik
                  </label>
                  <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-foreground block">Glow Nebula Halus</span>
                      <span className="text-[10px] text-default-400">Efek gradien atmosferik lembut.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableNebulaGlow}
                        onChange={(e) => setEnableNebulaGlow(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-400 dark:bg-slate-700 border border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-md after:transition-all shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </Card>

        {/* ========================================================================= */}
        {/* SECTION 5: CURRENCY, LOCALIZATION & REGIONAL */}
        {/* ========================================================================= */}
        <Card id="section-currency" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("currency")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Currency & Regional Preferences
                </h2>
                <p className="text-xs text-default-500">
                  Mata uang dasar, standar zona waktu, dan format angka keuangan.
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
              {foldedSections.currency ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>

          {!foldedSections.currency && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-foreground">Mata Uang Utama (Default Fiat)</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full h-8.5 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                  >
                    <option value="IDR">🇮🇩 IDR (Rp) - Indonesian Rupiah</option>
                    <option value="USD">🇺🇸 USD ($) - US Dollar</option>
                    <option value="EUR">🇪🇺 EUR (€) - European Euro</option>
                    <option value="SGD">🇸🇬 SGD (S$) - Singapore Dollar</option>
                    <option value="JPY">🇯🇵 JPY (¥) - Japanese Yen</option>
                    <option value="GBP">🇬🇧 GBP (£) - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block text-foreground">Standar Zona Waktu (Timezone)</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-8.5 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                  >
                    <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB - UTC+7)</option>
                    <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA - UTC+8)</option>
                    <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT - UTC+9)</option>
                    <option value="UTC">UTC (Universal Time Coordinated)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block text-foreground">Format Tanggal Buku Besar</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-8.5 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 19/09/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standar)</option>
                    <option value="DD MMMM YYYY">DD MMMM YYYY (19 September 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block text-foreground">Format Pemisah Ribuan (Nominal)</label>
                  <select
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value)}
                    className="w-full h-8.5 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                  >
                    <option value="id">Titik untuk ribuan (Rp 1.000.000,00)</option>
                    <option value="en">Koma untuk ribuan ($ 1,000,000.00)</option>
                  </select>
                </div>
              </div>

              {/* Live ECMAScript Intl Formatting Engine Simulation */}
              <div className="p-4 rounded-xl bg-default-50/80 dark:bg-default-800/40 border border-default-200/70 dark:border-default-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        ECMAScript Intl Standard Formatting Engine
                      </span>
                      <span className="text-[10px] text-default-500">
                        Simulasi langsung format mata uang, tanggal, dan angka berdasarkan preferensi aktif.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live Intl API
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Currency Intl */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-default-900/60 border border-emerald-500/25 dark:border-emerald-500/30 shadow-2xs space-y-1">
                    <span className="text-[10px] text-default-500 dark:text-default-400 font-semibold block uppercase tracking-wider">Format Mata Uang (Currency)</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {formatSystemCurrency(125750000, defaultCurrency)}
                    </p>
                    <span className="text-[9px] text-default-400 block">Simulasi: 125,750,000 nominal buku besar</span>
                  </div>

                  {/* Compact Intl */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-default-900/60 border border-emerald-500/25 dark:border-emerald-500/30 shadow-2xs space-y-1">
                    <span className="text-[10px] text-default-500 dark:text-default-400 font-semibold block uppercase tracking-wider">Notasi Ringkas (Compact Portfolio)</span>
                    <p className="text-sm font-bold text-foreground font-mono mt-1">
                      {formatCompactNumber(3450000000, defaultCurrency)}
                    </p>
                    <span className="text-[9px] text-default-400 block">Simulasi: 3,450,000,000 aggregate portofolio</span>
                  </div>

                  {/* Date Intl */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-default-900/60 border border-emerald-500/25 dark:border-emerald-500/30 shadow-2xs space-y-1">
                    <span className="text-[10px] text-default-500 dark:text-default-400 font-semibold block uppercase tracking-wider">Format Tanggal (Date & Time)</span>
                    <p className="text-xs font-bold text-foreground mt-1">
                      {formatSystemDate(new Date())}
                    </p>
                    <span className="text-[9px] text-default-400 block">Zona Waktu: {timezone.split(" ")[0]}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="h-8.5 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                  onPress={handleSaveRegional}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Preferensi Regional</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 6: NOTIFICATION PREFERENCES & FINANCIAL ALERTS */}
        {/* ========================================================================= */}
        <Card id="section-notifications" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("notifications")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Notifications & Financial Alerts
                </h2>
                <p className="text-xs text-default-500">
                  Pengingat cicilan, dividen masuk, penjaminan LPS, dan bell navbar.
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
              {foldedSections.notifications ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>

          {!foldedSections.notifications && (
            <div className="p-4 sm:p-5 pt-0 space-y-3 border-t border-default-100 dark:border-default-800">
              {[
                {
                  label: "Push Notifications Browser",
                  desc: "Terima update seketika saat ada perubahan saldo atau approval transaksi.",
                  checked: pushNotifications,
                  setter: setPushNotifications,
                },
                {
                  label: "Email Ringkasan Keuangan Mingguan",
                  desc: "Dapatkan analisis cashflow & burn rate otomatis di inbox setiap Senin pagi.",
                  checked: emailDigest,
                  setter: setEmailDigest,
                },
                {
                  label: "Peringatan Plafon Penjaminan LPS Rp 2 Miliar",
                  desc: "Notifikasi otomatis jika saldo likuiditas di salah satu bank mendekati Rp 2.000.000.000.",
                  checked: lpsThresholdAlert,
                  setter: setLpsThresholdAlert,
                },
                {
                  label: "Pengingat Jatuh Tempo Kewajiban & KPR",
                  desc: "Peringatan 3 hari sebelum jatuh tempo cicilan KPR, kartu kredit, atau vendor invoice.",
                  checked: kprReminderAlert,
                  setter: setKprReminderAlert,
                },
                {
                  label: "Efek Suara UI Lembut (Audio Chime)",
                  desc: "Aktifkan feedback audio Web Audio API pada navigasi dan tombol aksi.",
                  checked: soundEffects,
                  setter: setSoundEffects,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/50 dark:border-default-700/50"
                >
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-default-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-400 dark:bg-slate-700 border border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-md after:transition-all peer-checked:bg-purple-600 peer-checked:border-purple-600 shadow-inner"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="h-8.5 px-4 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                  onPress={handleSaveNotifications}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Simpan Preferensi Notifikasi</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 7: SECURITY, 2FA & ACTIVE SESSIONS */}
        {/* ========================================================================= */}
        <Card id="section-security" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("security")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-600/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Security & Session Management
                </h2>
                <p className="text-xs text-default-500">
                  Otentikasi dua faktor (2FA), daftar sesi login aktif, dan kata sandi.
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
              {foldedSections.security ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>

          {!foldedSections.security && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              {/* 2FA Toggle */}
              <div className="p-3.5 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-default-500">
                    Amankan akun Anda dengan aplikasi autentikator (Google Authenticator / Authy).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => {
                      playSoftChime();
                      setTwoFactorAuth(e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-md after:transition-all peer-checked:bg-green-600 peer-checked:border-green-600 shadow-inner"></div>
                </label>
              </div>

              {twoFactorAuth && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 2FA Aktif & Terlindungi
                  </p>
                  <p className="text-[11px] opacity-90">
                    Kunci rahasia TOTP: <code className="font-mono bg-black/10 px-1 py-0.5 rounded">NOVA-7829-BK44-AUTH</code>
                  </p>
                </div>
              )}

              {/* Active Sessions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Perangkat & Sesi Login Aktif
                </span>
                <div className="space-y-2">
                  {activeSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-default-200/60 dark:bg-default-700/60 flex items-center justify-center text-default-600 dark:text-default-300">
                          {sess.device.includes("iPhone") ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">{sess.device}</span>
                            {sess.current && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Sesi Ini
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-default-400 font-mono">
                            {sess.ip} • {sess.location} • {sess.time}
                          </p>
                        </div>
                      </div>

                      {!sess.current && (
                        <button
                          type="button"
                          onClick={() => revokeSession(sess.id)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 transition cursor-pointer font-medium"
                        >
                          Putuskan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* SECTION 8: ROLE-BASED ACCESS CONTROL (RBAC) & AUDIT LOGS LINK */}
        {/* ========================================================================= */}
        <Card id="section-rbac" className="scroll-mt-16 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleFold("rbac")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/40 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Access Control (RBAC) & Governance
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                    Owner Privilege
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Matriks otorisasi peran, jejak audit logs forensik, dan alokasi anggota tim.
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400">
              {foldedSections.rbac ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>

          {!foldedSections.rbac && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-default-100 dark:border-default-800">
              {/* Privilege Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-default-200/60 dark:border-default-800/60 text-default-400 text-[11px]">
                      <th className="py-2.5 font-semibold">Kapabilitas Modul</th>
                      <th className="py-2.5 text-center font-semibold">Owner</th>
                      <th className="py-2.5 text-center font-semibold">Admin</th>
                      <th className="py-2.5 text-center font-semibold">Accountant</th>
                      <th className="py-2.5 text-center font-semibold">Member</th>
                      <th className="py-2.5 text-center font-semibold">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-default-800/50 text-foreground">
                    {[
                      { cap: "Create, Edit & Delete Transactions", owner: true, admin: true, acc: true, member: true, viewer: false },
                      { cap: "Double-Entry Ledger Reconciliation", owner: true, admin: true, acc: true, member: false, viewer: false },
                      { cap: "Master Wallets & Bank Accounts", owner: true, admin: true, acc: false, member: false, viewer: false },
                      { cap: "Multi-Provider AI OCR & Auditing", owner: true, admin: true, acc: true, member: true, viewer: false },
                      { cap: "Export Audit-Ready Excel (.xlsx) & PDF", owner: true, admin: true, acc: true, member: true, viewer: true },
                      { cap: "Inspect Tamper-Evident Audit Logs", owner: true, admin: true, acc: false, member: false, viewer: false },
                      { cap: "Workspace Settings & API Keys", owner: true, admin: false, acc: false, member: false, viewer: false },
                      { cap: "Invite Members & Assign Roles", owner: true, admin: true, acc: false, member: false, viewer: false },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-colors">
                        <td className="py-2 font-medium text-default-700 dark:text-default-300">{row.cap}</td>
                        <td className="py-2 text-center text-emerald-500 font-bold">{row.owner ? "✓" : "—"}</td>
                        <td className="py-2 text-center text-emerald-500 font-bold">{row.admin ? "✓" : "—"}</td>
                        <td className="py-2 text-center text-emerald-500 font-bold">{row.acc ? "✓" : "—"}</td>
                        <td className="py-2 text-center text-emerald-500 font-bold">{row.member ? "✓" : "—"}</td>
                        <td className="py-2 text-center text-default-400">{row.viewer ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons to Logs & Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Link href="/logs" className="block">
                  <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <ScrollText className="w-4 h-4 text-indigo-500" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">Buka Audit Logs Forensik</span>
                        <span className="text-[10px] text-default-500">Pantau seluruh mutasi dan event otentikasi.</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/users" className="block">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">Kelola Pengguna & Hak Akses</span>
                        <span className="text-[10px] text-default-500">Undang staf baru dan delegasikan role.</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* AVATAR CROP & CIRCLE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isCropModalOpen && selectedFileForCrop && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Crop className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Sesuaikan & Potong Foto Avatar</h3>
                  <p className="text-[11px] text-default-500 flex items-center gap-1.5">
                    Format: <span className="font-semibold text-blue-600 dark:text-blue-400">{fileFormatName}</span>
                    {isAnimatedGif && <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.2 rounded font-bold">Animasi Asli</span>}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 text-center">
              {/* Spacious Square Container with Circle Mask Overlay */}
              <div
                id="avatar-crop-box"
                className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto overflow-hidden rounded-2xl bg-default-100 dark:bg-default-800/80 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner border border-default-200/60 dark:border-default-700/60"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startPanX = avatarPanX;
                  const startPanY = avatarPanY;
                  const handleMove = (ev: MouseEvent) => {
                    setAvatarPanX(startPanX + (ev.clientX - startX) / avatarZoom);
                    setAvatarPanY(startPanY + (ev.clientY - startY) / avatarZoom);
                  };
                  const handleUp = () => {
                    document.removeEventListener("mousemove", handleMove);
                    document.removeEventListener("mouseup", handleUp);
                  };
                  document.addEventListener("mousemove", handleMove);
                  document.addEventListener("mouseup", handleUp);
                }}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const startX = touch.clientX;
                    const startY = touch.clientY;
                    const startPanX = avatarPanX;
                    const startPanY = avatarPanY;
                    const handleTouchMove = (ev: TouchEvent) => {
                      if (ev.touches.length === 1) {
                        const t = ev.touches[0];
                        setAvatarPanX(startPanX + (t.clientX - startX) / avatarZoom);
                        setAvatarPanY(startPanY + (t.clientY - startY) / avatarZoom);
                      }
                    };
                    const handleTouchEnd = () => {
                      document.removeEventListener("touchmove", handleTouchMove);
                      document.removeEventListener("touchend", handleTouchEnd);
                    };
                    document.addEventListener("touchmove", handleTouchMove, { passive: true });
                    document.addEventListener("touchend", handleTouchEnd);
                  }
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  setAvatarZoom((prev) => Math.min(3.5, Math.max(0.5, prev + (e.deltaY > 0 ? -0.05 : 0.05))));
                }}
              >
                {/* The actual image */}
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${avatarPanX}px, ${avatarPanY}px) scale(${avatarZoom})`,
                    transition: "transform 0.05s ease-out",
                  }}
                >
                  <img
                    src={selectedFileForCrop}
                    alt="Crop Preview"
                    className="max-w-none w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Dark Vignette outside circle */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at center, transparent 48%, rgba(0,0,0,0.65) 49%)",
                  }}
                />

                {/* White dashed circle boundary */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[78%] h-[78%] rounded-full border-2 border-dashed border-white/80 shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-default-500 px-1">
                <span>Drag foto untuk posisi · Scroll / slider untuk zoom</span>
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime();
                    setAvatarZoom(1);
                    setAvatarPanX(0);
                    setAvatarPanY(0);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  ↺ Reset Posisi
                </button>
              </div>

              {/* Zoom Slider and Controls */}
              <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-default-600 font-medium">
                  <span className="font-semibold text-foreground">Skala Pembesaran (Zoom)</span>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(avatarZoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarZoom((prev) => Math.max(0.5, prev - 0.1))}
                    className="w-7 h-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 flex items-center justify-center font-bold text-xs hover:bg-default-100 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3.5"
                    step="0.05"
                    value={avatarZoom}
                    onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarZoom((prev) => Math.min(3.5, prev + 0.1))}
                    className="w-7 h-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 flex items-center justify-center font-bold text-xs hover:bg-default-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onPress={() => setIsCropModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                onPress={handleSaveCroppedAvatar}
              >
                Simpan Avatar Baru
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI DENSITY CUSTOM SCALE MODAL POPUP */}
      {/* ========================================================================= */}
      {isDensityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsDensityModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Kustom Skala UI Density</h3>
                  <p className="text-[11px] text-default-400">Atur proporsi ukuran teks & ruang kartu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDensityModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-default-600 dark:text-default-400 font-semibold">Skala Kepadatan:</span>
                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm px-2 py-0.5 rounded-lg bg-blue-500/10">
                  {densityScale}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="130"
                step="5"
                value={densityScale}
                onChange={(e) => applyDensityScale(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-default-400 font-mono">
                <span>70% (Ekstra Padat)</span>
                <span>100% (Normal)</span>
                <span>130% (Ekstra Lega)</span>
              </div>
            </div>

            {/* Quick presets */}
            <div>
              <label className="text-[10px] font-semibold text-default-400 uppercase block mb-1.5">Preset Cepat:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { scale: 80, label: "80% Padat" },
                  { scale: 90, label: "90% Ringkas" },
                  { scale: 100, label: "100% Standar" },
                  { scale: 115, label: "115% Lapang" },
                  { scale: 125, label: "125% Lega" },
                ].map((pr) => (
                  <button
                    key={pr.scale}
                    type="button"
                    onClick={() => applyDensityScale(pr.scale)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                      densityScale === pr.scale
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Sample */}
            <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-default-400 block">Preview Skala Komponen:</span>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Saldo Kas Operasional</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Rp 48.250.000</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                className="text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-sm"
                onPress={() => {
                  playSoftChime();
                  setIsDensityModalOpen(false);
                  showSuccessNotice(`Skala kepadatan diatur ke ${densityScale}%!`);
                }}
              >
                Terapkan & Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
      {/* ========================================================================= */}
      {showQuickJump && (
        <div className="fixed right-3 sm:right-6 bottom-20 sm:bottom-24 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Mini Popup Menu */}
          {quickJumpOpen && (
            <div className="mb-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-default-200/80 dark:border-default-800 shadow-2xl w-64 space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
                <div className="flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-foreground">Navigasi Seksi Cepat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickJumpOpen(false)}
                  className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                {SETTINGS_SECTIONS.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  const SecIcon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? "font-bold shadow-xs"
                          : "hover:bg-default-100 dark:hover:bg-default-800/60 text-default-700 dark:text-default-300"
                      }`}
                      style={isActive ? { backgroundColor: activePalette.hex, color: "#ffffff" } : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SecIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-default-400"}`} />
                        <span className="text-xs truncate">{sec.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-ping" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-default-100 dark:border-default-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    scrollToTop();
                    setQuickJumpOpen(false);
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Ke Paling Atas</span>
                </button>
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

          {/* Sticky Anchor Navigation Button */}
          <button
            type="button"
            onClick={() => {
              playSoftChime();
              setQuickJumpOpen(!quickJumpOpen);
            }}
            className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/95 dark:bg-default-900/90 hover:bg-black text-white backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all cursor-pointer font-semibold text-xs"
            style={{ borderColor: `${activePalette.hex}70` }}
            title="Sticky Anchor: Lompat ke Seksi Pengaturan"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activePalette.hex }}
            >
              <Anchor className={`w-3 h-3 transition-transform duration-300 ${quickJumpOpen ? "rotate-45 text-white" : "group-hover:-rotate-12 text-white"}`} />
            </div>
            <span className="hidden sm:inline font-bold">Sticky Anchor</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase font-bold text-white shadow-xs"
              style={{ backgroundColor: `${activePalette.hex}50` }}
            >
              {activeSectionId}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
