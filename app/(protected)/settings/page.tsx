/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  Settings,
  User,
  Crown,
  Palette,
  Cpu,
  ShieldCheck,
  Building2,
  Globe,
  Volume2,
  Save,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Server,
  Database,
  ExternalLink,
  Lock,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSoftChime, playNovaSpaceSound, playRealisticClick, playNovaSuccessSound, playNovaErrorSound } from "@/app/lib/sound";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { executeSettingsAction } from "@/app/lib/settingsNotifier";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

interface SectionMeta {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  color: string;
}

const SETTINGS_SECTIONS: SectionMeta[] = [
  { id: "shortcuts", name: "Modul Konfigurasi Khusus", shortName: "Modul Khusus", icon: Layers, color: "#3b82f6" },
  { id: "regional", name: "Regional, Kalender & Format", shortName: "Regional", icon: Globe, color: "#8b5cf6" },
  { id: "audio", name: "Efek Suara & Haptik Taktil", shortName: "Audio", icon: Volume2, color: "#ec4899" },
  { id: "system", name: "Database & Status Engine", shortName: "Database", icon: Database, color: "#10b981" },
];

export default function SettingsHubPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const { lang, t, isId } = useIntlLanguage();

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? (isId ? "Peringatan Sistem" : "System Warning") : (isId ? "Pengaturan Disimpan" : "Settings Saved"),
      description: msg,
    });
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Anchor Navigation & Fold State
  const [activeSectionId, setActiveSectionId] = useState("shortcuts");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    shortcuts: false,
    regional: false,
    audio: false,
    system: false,
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
      shortcuts: nextState,
      regional: nextState,
      audio: nextState,
      system: nextState,
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

      let currentSecId = SETTINGS_SECTIONS[0].id;
      for (const sec of SETTINGS_SECTIONS) {
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
        currentSecId = SETTINGS_SECTIONS[SETTINGS_SECTIONS.length - 1].id;
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

  // General Settings States
  const [defaultCurrency, setDefaultCurrency] = useState("IDR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [numberFormat, setNumberFormat] = useState("id-ID");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(100);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      if (selectedWorkspace) {
        setDefaultCurrency(selectedWorkspace.currency || "IDR");
      }
      const savedDate = localStorage.getItem("novajournal_date_format");
      if (savedDate) setDateFormat(savedDate);

      const savedNum = localStorage.getItem("novajournal_number_format");
      if (savedNum) setNumberFormat(savedNum);

      const savedSound = localStorage.getItem("novajournal_audio_feedback");
      if (savedSound !== null) setSoundEnabled(savedSound !== "false");

      const savedVol = localStorage.getItem("novajournal_audio_volume");
      if (savedVol) setSoundVolume(Number(savedVol));

      setIsInitialized(true);
    } catch {
      setIsInitialized(true);
    }
  }, [selectedWorkspace]);

  // Debounced Autosave for Settings
  useEffect(() => {
    if (!isInitialized) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("novajournal_date_format", dateFormat);
        localStorage.setItem("novajournal_number_format", numberFormat);
        localStorage.setItem("novajournal_audio_feedback", String(soundEnabled));
        localStorage.setItem("novajournal_audio_volume", String(soundVolume));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 600);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [dateFormat, numberFormat, soundEnabled, soundVolume, isInitialized]);

  const [savingSettings, setSavingSettings] = useState(false);
  const handleSaveGeneralSettings = async () => {
    setSavingSettings(true);
    playSoftChime();

    await executeSettingsAction(
      async () => {
        localStorage.setItem("novajournal_date_format", dateFormat);
        localStorage.setItem("novajournal_number_format", numberFormat);
        localStorage.setItem("novajournal_audio_feedback", String(soundEnabled));
        localStorage.setItem("novajournal_audio_volume", String(soundVolume));
      },
      {
        action: "update_general_settings",
        entityType: "settings",
        newData: { dateFormat, numberFormat, soundEnabled, soundVolume },
        successMessage: "Pengaturan umum sistem berhasil disimpan!",
        errorMessage: "Gagal menyimpan preferensi.",
        onNotice: (msg) => showNotice(msg),
      }
    );

    setSavingSettings(false);
  };

  const SHORTCUT_MODULES = [
    {
      title: "Profil Pengguna",
      desc: "Foto avatar crop melingkar (GIF/WebP), nama gelar jabatan, kontak email/telepon, dan zona waktu.",
      icon: User,
      path: "/profile",
      color: "#3b82f6",
      badge: "Personal",
      features: ["Circular Crop (Drag & Zoom)", "GIF Animation Support", "Kontak & Title"],
    },
    {
      title: "Company Brand & White-Label",
      desc: "Logo korporasi kustom, pengaturan nama brand di sidebar, slogan bisnis, dan NPWP perusahaan.",
      icon: Crown,
      path: "/brand",
      color: "#8b5cf6",
      badge: "Enterprise",
      features: ["Logo Workspace", "Display Mode (Icon / Full)", "NPWP & Legalitas"],
    },
    {
      title: "Appearance & UI Density",
      desc: "Mode gelap/terang kosmik, 6 palet warna, custom Hex, skala presisi W×H px, dan 6 font finansial.",
      icon: Palette,
      path: "/appearance",
      color: "#ec4899",
      badge: "Visual UX",
      features: ["6 Palet + Custom Hex", "Custom W×H Card Scale", "Backdrop Glass Effect"],
    },
    {
      title: "Regional, Kalender & Format",
      desc: "Mata uang acuan buku besar (IDR/USD/EUR), presisi desimal, format tanggal laporan, dan zona waktu.",
      icon: Globe,
      path: "/regional",
      color: "#06b6d4",
      badge: "Localization",
      features: ["Multi-Fiat Currency", "DD/MM/YYYY & ISO", "Interactive Live Sandbox"],
    },
    {
      title: "AI Hub & Nova Agent",
      desc: "Kunci API (Gemini, Groq, DeepSeek, Claude), failover routing, persona CFO, dan suara vokal TTS.",
      icon: Cpu,
      path: "/ai-hub",
      color: "#f59e0b",
      badge: "Multi-Model",
      features: ["Zero-Failure Failover", "4 Persona Finansial", "Pinned & Custom W×H"],
    },
    {
      title: "Keamanan & Audit Logs",
      desc: "Enkripsi AES-256 GCM, sesi peramban aktif, matriks hak akses RBAC 4 level, dan audit trail.",
      icon: ShieldCheck,
      path: "/security",
      color: "#10b981",
      badge: "Zero-Trust",
      features: ["AES-256 GCM Vault", "Sesi Perangkat Aktif", "Tamper-Evident Logs"],
    },
    {
      title: "Workspaces & Kolaborasi",
      desc: "Manajemen entitas workspace multi-tenant, undang staf keuangan, dan alokasi peran izin.",
      icon: Building2,
      path: "/workspaces",
      color: "#6366f1",
      badge: "Multi-Tenant",
      features: ["Multi-Tenant Architecture", "Undang Anggota Tim", "Simulasi Peran"],
    },
  ];

  const activeSec = SETTINGS_SECTIONS.find((s) => s.id === activeSectionId) || SETTINGS_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 sm:mt-8 pt-2">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
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
            onPress={() => router.push("/dashboard")}
            className="text-xs cursor-pointer h-8 px-3 rounded-xl font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition"
          >
            &larr; {isId ? "Kembali ke Dashboard" : "Back to Dashboard"}
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
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {t(DICTIONARY.settings.title)}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold tracking-wide">
            {t(DICTIONARY.settings.badge)}
          </span>
        </div>

        {/* Tier 3: Description on left, Actions on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-xl leading-relaxed">
            {t(DICTIONARY.settings.desc)}
          </p>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              {areAllFolded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t(DICTIONARY.common.openAll)}</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
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
          <span className="text-xs font-bold text-foreground">{isId ? "Seksi:" : "Section:"}</span>
          <div className="flex items-center gap-1">
            {SETTINGS_SECTIONS.map((sec) => {
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
            {areAllFolded ? (isId ? "Buka Semua" : "Expand All") : (isId ? "Tutup Semua" : "Collapse All")}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Quick Navigation Shortcuts Card (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-shortcuts"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("shortcuts")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isId ? "1. Modul Konfigurasi Khusus" : "1. Dedicated Configuration Modules"}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Pusat pintasan ke sub-halaman konfigurasi mandiri dengan antarmuka presisi tinggi."
                  : "Central shortcuts to standalone configuration modules with high-precision interfaces."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {SHORTCUT_MODULES.length} {isId ? "Modul" : "Modules"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.shortcuts ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.shortcuts && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="flex flex-col gap-3 pt-3">
              {SHORTCUT_MODULES.map((mod) => (
                <button
                  key={mod.path}
                  type="button"
                  onClick={() => {
                    playSoftChime();
                    router.push(mod.path);
                  }}
                  className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/40 dark:bg-default-900/40 hover:border-blue-500/40 hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: mod.color }}
                    >
                      <mod.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {mod.title}
                        </h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-500 uppercase">
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-default-500 mt-0.5 leading-relaxed">
                        {mod.desc}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mod.features.map((feat) => (
                          <span
                            key={feat}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-default-200/60 dark:bg-default-800 text-default-600 dark:text-default-400 font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 self-end sm:self-center px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span>Buka Pengaturan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 2. Dedicated Regional & Format Module Card */}
      {/* ========================================================================= */}
      <Card
        id="section-regional"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("regional")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isId ? "2. Pengaturan Regional, Tanggal & Format Angka" : "2. Regional, Date & Number Format Settings"}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Telah dipisahkan ke modul khusus dengan sandbox interaktif, kalender finansial, dan deteksi zona waktu."
                  : "Dedicated module with interactive sandbox, financial calendar, and timezone auto-detection."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold">
              {defaultCurrency} · {dateFormat}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.regional ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.regional && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/70 bg-default-50/50 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">
                    {isId ? "Mata Uang Acuan" : "Base Currency"}
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">{defaultCurrency}</span>
                </div>
                <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/70 bg-default-50/50 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">
                    {isId ? "Format Tanggal" : "Date Format"}
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">{dateFormat}</span>
                </div>
                <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/70 bg-default-50/50 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">
                    {isId ? "Pemisah Desimal" : "Decimal Separator"}
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">
                    {numberFormat === "id-ID" ? "1.500.000,00" : "1,500,000.00"}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-default-200/70 dark:border-default-700/70 bg-default-50/50 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">
                    {isId ? "Zona Waktu" : "Timezone"}
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono mt-0.5 block truncate">WIB (UTC+7)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>{isId ? "Halaman Konfigurasi Regional Mandiri" : "Dedicated Regional Configuration Page"}</span>
                  </h3>
                  <p className="text-[11px] text-default-500 mt-0.5">
                    {isId
                      ? "Sesuaikan presisi desimal, simbol mata uang, format tanggal ISO/US/ID, dan coba sandbox preview live."
                      : "Configure decimal precision, currency symbol placement, ISO/US/ID date formats, and live sandbox."}
                  </p>
                </div>
                <Button
                  size="sm"
                  onPress={() => {
                    playRealisticClick(0.5);
                    router.push("/regional");
                  }}
                  className="h-8.5 px-4 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-sm active:scale-95 transition-all shrink-0"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isId ? "Buka Pengaturan Regional" : "Open Regional Settings"}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. Audio Feedback & Realistic Sound Card (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-audio"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("audio")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isId ? "3. Efek Suara Realistis & Respon Audio Taktil" : "3. Realistic Sound Effects & Haptic Audio"}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Sintesis Web Audio API interaktif 0ms latency dengan kontrol skala volume presisi dan feedback taktil nyata."
                  : "0ms latency interactive Web Audio API synthesis with precise volume scaling and genuine tactile clicks."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-mono font-bold">
              {soundEnabled ? `${soundVolume}% ${isId ? "Aktif" : "Active"}` : "Mute"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.audio ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.audio && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-3 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {isId ? "Respon Suara Tombol & Interaksi" : "Button & Interaction Audio Feedback"}
                  </span>
                  <span className="text-[10px] text-default-500">
                    {isId
                      ? "Putar nada klik taktil haptik dan chime lembut saat berinteraksi di seluruh aplikasi"
                      : "Play realistic haptic tactile clicks and subtle chimes when interacting across the app"}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    try {
                      localStorage.setItem("novajournal_audio_feedback", String(next));
                    } catch {}
                    if (next) playRealisticClick(soundVolume / 100);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    soundEnabled ? "bg-pink-600" : "bg-default-300 dark:bg-default-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      soundEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {isId ? "Tingkat Volume Master Audio" : "Master Audio Volume Level"}
                  </span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400">{soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={soundVolume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSoundVolume(val);
                    try {
                      localStorage.setItem("novajournal_audio_volume", String(val));
                    } catch {}
                    playRealisticClick(val / 100);
                  }}
                  className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-default-100 dark:border-default-700/50">
                  <p className="text-[10px] text-default-400">
                    {isId
                      ? "Geser slider untuk mendengar perubahan volume seketika secara dinamis."
                      : "Drag slider to preview dynamic real-time master volume instantly."}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => playRealisticClick(soundVolume / 100)}
                      className="h-7 px-2.5 text-[11px] cursor-pointer"
                    >
                      🔊 {isId ? "Klik Taktil" : "Tactile Click"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => playSoftChime(soundVolume / 100)}
                      className="h-7 px-2.5 text-[11px] cursor-pointer"
                    >
                      🔔 {isId ? "Chime" : "Chime"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => playNovaSpaceSound(soundVolume / 100)}
                      className="h-7 px-2.5 text-[11px] cursor-pointer"
                    >
                      🌌 {isId ? "Kosmik" : "Cosmic"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. Database & Status Engine Card (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-system"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("system")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                4. Database PostgreSQL & Engine Status
              </h2>
              <p className="text-[11px] text-default-400">
                Koneksi database aktif <code className="text-emerald-500 font-mono">novafinance_dev</code> dan WebUI PostgreSQL di port 8081.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              novafinance_dev OK
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.system ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.system && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-3.5 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">Active Database</span>
                  <span className="text-xs font-bold text-foreground mt-1 block">PostgreSQL 16</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">novafinance_dev (Connected)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">Backend Server</span>
                  <span className="text-xs font-bold text-foreground mt-1 block">ElysiaJS + Bun 1.3</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Port 8080 Active</span>
                </div>

                <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40">
                  <span className="text-[10px] font-semibold text-default-400 uppercase block">Postgres Web UI</span>
                  <span className="text-xs font-bold text-foreground mt-1 block">pgAdmin 4 WebUI</span>
                  <a
                    href="http://localhost:8081"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-0.5"
                  >
                    <span>Buka pgAdmin 4 (Port 8081)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-default-500 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Database Lama:</span>{" "}
                  <code className="px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800 font-mono text-[10px]">novajournal_dev</code> telah diarsipkan dengan aman di PostgreSQL host.
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Archived</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* FLOATING ICON-ONLY STICKY ANCHOR BUTTON & MINI POPUP NAVIGATION */}
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
              {SETTINGS_SECTIONS.map((sec) => {
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
              <span>{SETTINGS_SECTIONS.length} Seksi Tersedia</span>
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
