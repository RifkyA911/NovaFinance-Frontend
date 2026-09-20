/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Calendar,
  DollarSign,
  Clock,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  Check,
  X,
  Compass,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSoftChime, playNovaSpaceSound, playRealisticClick, playNovaSuccessSound, playNovaErrorSound } from "@/app/lib/sound";
import {
  useIntlLanguage,
  DICTIONARY,
  formatSystemCurrency,
  formatSystemDate,
  formatCompactNumber,
} from "@/app/lib/intl";
import { api, mutationFunctions } from "@/app/lib/queries";
import { executeSettingsAction } from "@/app/lib/settingsNotifier";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

interface SectionMeta {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  color: string;
}

const REGIONAL_SECTIONS: SectionMeta[] = [
  {
    id: "currency",
    name: "1. Mata Uang Acuan & Presisi",
    shortName: "Mata Uang",
    icon: DollarSign,
    color: "#2563eb",
  },
  {
    id: "date",
    name: "2. Format Tanggal & Kalender",
    shortName: "Format Tanggal",
    icon: Calendar,
    color: "#7c3aed",
  },
  {
    id: "numbers",
    name: "3. Pemisah Angka Ribuan & Desimal",
    shortName: "Pemisah Angka",
    icon: Sliders,
    color: "#059669",
  },
  {
    id: "timezone",
    name: "4. Zona Waktu Finansial & Jam",
    shortName: "Zona Waktu",
    icon: Clock,
    color: "#d97706",
  },
  {
    id: "sandbox",
    name: "5. Pratinjau Interaktif Format",
    shortName: "Pratinjau",
    icon: Sparkles,
    color: "#ec4899",
  },
];

export default function RegionalSettingsPage() {
  const router = useRouter();
  const { selectedWorkspace, refreshWorkspaces } = useWorkspace();
  const { lang, setLang, t, isId } = useIntlLanguage();

  const [activeSectionId, setActiveSectionId] = useState("currency");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? (isId ? "Peringatan Regional" : "Regional Warning") : (isId ? "Pengaturan Regional Diperbarui" : "Regional Settings Updated"),
      description: msg,
    });
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Section folding states
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    currency: false,
    date: false,
    numbers: false,
    timezone: false,
    sandbox: false,
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
      currency: nextState,
      date: nextState,
      numbers: nextState,
      timezone: nextState,
      sandbox: nextState,
    });
  };

  // Scroll spy listener using main-scroll-container
  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = REGIONAL_SECTIONS[0].id;
      for (const sec of REGIONAL_SECTIONS) {
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
        currentSecId = REGIONAL_SECTIONS[REGIONAL_SECTIONS.length - 1].id;
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

  const activeSec = REGIONAL_SECTIONS.find((s) => s.id === activeSectionId) || REGIONAL_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  // Regional preferences state
  const [currency, setCurrency] = useState("IDR");
  const [currencyPosition, setCurrencyPosition] = useState<"prefix" | "suffix">("prefix");
  const [decimalPrecision, setDecimalPrecision] = useState<number>(0);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<number>(1); // 1 = Monday, 0 = Sunday
  const [calendarType, setCalendarType] = useState<"gregorian" | "hijri">("gregorian");
  const [numberFormat, setNumberFormat] = useState("id-ID");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");
  const [saving, setSaving] = useState(false);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load preferences
  useEffect(() => {
    try {
      if (selectedWorkspace?.currency) {
        setCurrency(selectedWorkspace.currency);
        setDecimalPrecision(selectedWorkspace.currency === "IDR" || selectedWorkspace.currency === "JPY" ? 0 : 2);
      }
      const savedDate = localStorage.getItem("novajournal_date_format") || localStorage.getItem("novafinance_date_format");
      if (savedDate) setDateFormat(savedDate);

      const savedNum = localStorage.getItem("novajournal_number_format") || localStorage.getItem("novafinance_number_format");
      if (savedNum) setNumberFormat(savedNum);

      const savedTz = localStorage.getItem("novajournal_timezone") || localStorage.getItem("novafinance_timezone");
      if (savedTz) setTimezone(savedTz);

      const savedFirstDay = localStorage.getItem("novajournal_first_day_of_week");
      if (savedFirstDay !== null) setFirstDayOfWeek(Number(savedFirstDay));

      const savedTimeFmt = localStorage.getItem("novajournal_time_format");
      if (savedTimeFmt === "12h" || savedTimeFmt === "24h") setTimeFormat(savedTimeFmt);

      const savedCurrPos = localStorage.getItem("novajournal_currency_position");
      if (savedCurrPos === "prefix" || savedCurrPos === "suffix") setCurrencyPosition(savedCurrPos);

      setIsInitialized(true);
    } catch {
      setIsInitialized(true);
    }
  }, [selectedWorkspace]);

  // Debounced Autosave for Regional Settings
  useEffect(() => {
    if (!isInitialized) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        localStorage.setItem("novajournal_currency", currency);
        localStorage.setItem("novafinance_currency", currency);
        localStorage.setItem("novajournal_date_format", dateFormat);
        localStorage.setItem("novafinance_date_format", dateFormat);
        localStorage.setItem("novajournal_number_format", numberFormat);
        localStorage.setItem("novafinance_number_format", numberFormat);
        localStorage.setItem("novajournal_timezone", timezone);
        localStorage.setItem("novafinance_timezone", timezone);
        localStorage.setItem("novajournal_first_day_of_week", String(firstDayOfWeek));
        localStorage.setItem("novajournal_time_format", timeFormat);
        localStorage.setItem("novajournal_currency_position", currencyPosition);

        if (selectedWorkspace?.id && selectedWorkspace.currency !== currency) {
          await mutationFunctions.updateWorkspace({
            id: selectedWorkspace.id,
            data: { currency },
          });
        }

        mutationFunctions.updateUserProfile({
          timezone,
          lang,
        }).catch(() => {});

        window.dispatchEvent(new Event("novajournal_regional_config_changed"));
        setSaveStatus("saved");
      } catch {
        playNovaErrorSound();
        setSaveStatus("idle");
      }
    }, 700);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    currency,
    currencyPosition,
    decimalPrecision,
    dateFormat,
    firstDayOfWeek,
    calendarType,
    numberFormat,
    timezone,
    timeFormat,
    lang,
    isInitialized,
    selectedWorkspace,
  ]);

  // Auto-detect browser timezone
  const handleAutoDetectTimezone = () => {
    try {
      playRealisticClick();
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
        showNotice(isId ? `Zona waktu terdeteksi: ${detected}` : `Timezone detected: ${detected}`);
      }
    } catch {}
  };

  const handleSaveAllRegional = async () => {
    setSaving(true);
    playSoftChime();

    await executeSettingsAction(
      async () => {
        // 1. Save to local storage for instant global reactivity
        localStorage.setItem("novajournal_currency", currency);
        localStorage.setItem("novafinance_currency", currency);
        localStorage.setItem("novajournal_date_format", dateFormat);
        localStorage.setItem("novafinance_date_format", dateFormat);
        localStorage.setItem("novajournal_number_format", numberFormat);
        localStorage.setItem("novafinance_number_format", numberFormat);
        localStorage.setItem("novajournal_timezone", timezone);
        localStorage.setItem("novafinance_timezone", timezone);
        localStorage.setItem("novajournal_first_day_of_week", String(firstDayOfWeek));
        localStorage.setItem("novajournal_time_format", timeFormat);
        localStorage.setItem("novajournal_currency_position", currencyPosition);

        // 2. Save currency to active workspace if present
        if (selectedWorkspace?.id) {
          await mutationFunctions.updateWorkspace({
            id: selectedWorkspace.id,
            data: {
              currency,
            },
          });
          await refreshWorkspaces();
        }

        // 3. Save timezone and lang to user profile in PostgreSQL database
        await mutationFunctions.updateUserProfile({
          timezone,
          lang,
        });

        // 4. Dispatch global event for all components
        window.dispatchEvent(new Event("novajournal_regional_changed"));
      },
      {
        workspaceId: selectedWorkspace?.id,
        action: "update_regional_settings",
        entityType: "regional",
        newData: { currency, dateFormat, numberFormat, timezone, timeFormat, currencyPosition, lang },
        successMessage: isId
          ? "Pengaturan regional, tanggal, dan pemisah angka berhasil disimpan!"
          : "Regional, date, and number formatting preferences saved!",
        errorMessage: isId ? "Gagal menyimpan ke server, preferensi tersimpan di peramban lokal." : "Failed to persist to server, cached locally.",
        onNotice: (msg) => showNotice(msg),
      }
    );

    setSaving(false);
  };

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
            onPress={() => router.push("/settings")}
            className="text-xs cursor-pointer h-8 px-3 rounded-xl font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition"
          >
            &larr; {isId ? "Kembali ke Settings Hub" : "Back to Settings Hub"}
          </Button>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill (ID / EN) */}
            <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800 border border-default-200 dark:border-default-700">
              <button
                type="button"
                onClick={() => {
                  playRealisticClick();
                  setLang("id");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "id"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => {
                  playRealisticClick();
                  setLang("en");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

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
            <Globe className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {t(DICTIONARY.regional.title)}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold tracking-wide">
            {t(DICTIONARY.regional.badge)}
          </span>
        </div>

        {/* Tier 3: Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-2xl leading-relaxed">
            {t(DICTIONARY.regional.desc)}
          </p>
        </div>
      </div>

      {/* Sticky Top Anchor Bar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-foreground">{isId ? "Seksi:" : "Section:"}</span>
          <div className="flex items-center gap-1">
            {REGIONAL_SECTIONS.map((sec) => {
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
                  <span>{sec.shortName}</span>
                  {foldedSections[sec.id] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Folded" />
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
            {areAllFolded ? t(DICTIONARY.common.openAll) : t(DICTIONARY.common.foldAll)}
          </button>
        </div>
      </div>

      {/* Section 1: Base Currency & Precision */}
      <Card
        id="section-currency"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("currency")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t(DICTIONARY.regional.secCurrency)}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Mata uang dasar untuk pembukuan neraca, konversi multi-currency, dan penempatan simbol."
                  : "Base ledger currency for balance sheets, multi-currency conversion, and symbol placement."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {currency} ({decimalPrecision} decimals)
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.currency ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.currency && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t(DICTIONARY.regional.currencyLabel)}
                </label>
                <select
                  value={currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCurrency(c);
                    setDecimalPrecision(c === "IDR" || c === "JPY" ? 0 : 2);
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                >
                  <option value="IDR">🇮🇩 IDR — Rupiah Indonesia (Rp)</option>
                  <option value="USD">🇺🇸 USD — US Dollar ($)</option>
                  <option value="EUR">🇪🇺 EUR — Euro (€)</option>
                  <option value="SGD">🇸🇬 SGD — Singapore Dollar (S$)</option>
                  <option value="JPY">🇯🇵 JPY — Japanese Yen (¥)</option>
                  <option value="GBP">🇬🇧 GBP — British Pound (£)</option>
                  <option value="AUD">🇦🇺 AUD — Australian Dollar (A$)</option>
                  <option value="CNY">🇨🇳 CNY — Chinese Yuan (¥)</option>
                  <option value="MYR">🇲🇾 MYR — Malaysian Ringgit (RM)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isId ? "Penempatan Simbol Mata Uang" : "Symbol Placement"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyPosition("prefix")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      currencyPosition === "prefix"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Awalan (Rp 100k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyPosition("suffix")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      currencyPosition === "suffix"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Akhiran (100k IDR)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isId ? "Presisi Angka Desimal" : "Decimal Precision"}
                </label>
                <div className="flex items-center gap-2">
                  {[0, 2, 4].map((dec) => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => setDecimalPrecision(dec)}
                      className={`flex-1 h-9 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                        decimalPrecision === dec
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      {dec} Dec
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Date Format & Calendar */}
      <Card
        id="section-date"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("date")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t(DICTIONARY.regional.secDate)}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Standar format tanggal laporan akuntansi dan penentuan hari pertama pekan."
                  : "Financial reporting date format standards and first day of the week."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {dateFormat} · {firstDayOfWeek === 1 ? "Senin" : "Minggu"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.date ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.date && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t(DICTIONARY.regional.dateFormatLabel)}
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                >
                  <option value="DD/MM/YYYY">20/09/2026 (DD/MM/YYYY - Standar ID/UK)</option>
                  <option value="YYYY-MM-DD">2026-09-20 (YYYY-MM-DD - ISO 8601)</option>
                  <option value="MM/DD/YYYY">09/20/2026 (MM/DD/YYYY - Standar US)</option>
                  <option value="D MMM YYYY">20 Sep 2026 (D MMM YYYY)</option>
                  <option value="dddd, D MMMM YYYY">Minggu, 20 September 2026 (Panjang)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t(DICTIONARY.regional.firstDayLabel)}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFirstDayOfWeek(1)}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      firstDayOfWeek === 1
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Senin (ISO 8601)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFirstDayOfWeek(0)}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      firstDayOfWeek === 0
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Minggu (US Standard)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isId ? "Sistem Kalender" : "Calendar System"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarType("gregorian")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      calendarType === "gregorian"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Masehi (Gregorian)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarType("hijri")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      calendarType === "hijri"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>Hijriah (Syariah)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Number & Decimal Separators */}
      <Card
        id="section-numbers"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("numbers")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t(DICTIONARY.regional.secNumber)}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Aturan pemisah ribuan dan desimal pada seluruh tabel transaksi dan metrik finansial."
                  : "Thousands and decimal separator rules across ledger tables and metric cards."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {numberFormat}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.numbers ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.numbers && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
            <div className="pt-3 space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                {t(DICTIONARY.regional.numberFormatLabel)}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "id-ID",
                    label: "Standar Indonesia / Eropa",
                    sample: "Rp 1.500.000,00",
                    desc: "Titik (.) ribuan, koma (,) desimal",
                  },
                  {
                    id: "en-US",
                    label: "Standar US / Internasional",
                    sample: "$1,500,000.00",
                    desc: "Koma (,) ribuan, titik (.) desimal",
                  },
                  {
                    id: "de-DE",
                    label: "Standar Spasi Tipis (SI)",
                    sample: "1 500 000,00",
                    desc: "Spasi ribuan, koma (,) desimal",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playRealisticClick();
                      setNumberFormat(item.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      numberFormat === item.id
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30"
                        : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-800/40 hover:bg-default-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      {numberFormat === item.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      {item.sample}
                    </span>
                    <p className="text-[10px] text-default-400">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 4: Timezone & Operating Hours */}
      <Card
        id="section-timezone"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("timezone")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t(DICTIONARY.regional.secTimezone)}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Sinkronisasi stempel waktu transaksi, audit log, dan pengelompokan penutupan buku harian."
                  : "Timestamp reconciliation for transactions, audit logs, and daily book closing."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {timezone} · {timeFormat}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.timezone ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.timezone && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground block">
                    {t(DICTIONARY.regional.timezoneLabel)}
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectTimezone}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Auto-Detect Browser</span>
                  </button>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-amber-500"
                >
                  <optgroup label="🇮🇩 Indonesia">
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
                  </optgroup>
                  <optgroup label="🌏 Asia Pasifik">
                    <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST - UTC+9)</option>
                    <option value="Asia/Bangkok">Asia/Bangkok (ICT - UTC+7)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST - UTC+10)</option>
                  </optgroup>
                  <optgroup label="🌐 Global Standar">
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST/EDT - UTC-5)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isId ? "Tampilan Jam Laporan" : "Clock Standard"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeFormat("24h")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      timeFormat === "24h"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>24 Jam (16:50)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("12h")}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                      timeFormat === "12h"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 font-bold"
                        : "border-default-200 dark:border-default-700 hover:bg-default-50 text-default-600"
                    }`}
                  >
                    <span>12 Jam (04:50 PM)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 5: Live Interactive Sandbox & Formatter Playground */}
      <Card
        id="section-sandbox"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-linear-to-br from-default-50/80 to-default-100/50 dark:from-default-900/40 dark:to-default-950/60 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("sandbox")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t(DICTIONARY.regional.livePreviewTitle)}
              </h2>
              <p className="text-[11px] text-default-400">
                {isId
                  ? "Uji coba langsung bagaimana angka, stempel waktu, dan mata uang akan muncul di dashboard."
                  : "Simulate live how amounts, timestamps, and currency look on your dashboard in real-time."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
              Realtime Sandbox
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.sandbox ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.sandbox && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {/* Sample 1: Nominal Penuh */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-default-900 border border-default-200/80 dark:border-default-700/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-default-400 block tracking-wider">
                  {isId ? "Saldo Kas / Transaksi" : "Ledger Balance / Transaction"}
                </span>
                <p className="text-base font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                  {formatSystemCurrency(184750000.5, currency)}
                </p>
                <p className="text-[10px] text-default-400">
                  {isId ? "Format laporan neraca laba-rugi resmi" : "Official ledger balance statement"}
                </p>
              </div>

              {/* Sample 2: Compact Notation */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-default-900 border border-default-200/80 dark:border-default-700/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-default-400 block tracking-wider">
                  {isId ? "Notasi Ringkas Card Metrik" : "Compact Card Notation"}
                </span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {formatCompactNumber(184750000, currency)}
                </p>
                <p className="text-[10px] text-default-400">
                  {isId ? "Tampil di widget ringkasan atas" : "Used in executive summary widgets"}
                </p>
              </div>

              {/* Sample 3: Tanggal & Waktu */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-default-900 border border-default-200/80 dark:border-default-700/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-default-400 block tracking-wider">
                  {isId ? "Stempel Waktu Jurnal" : "Journal Timestamp"}
                </span>
                <p className="text-xs font-bold text-foreground font-mono">
                  {formatSystemDate(new Date())}
                </p>
                <p className="text-[10px] text-default-400">
                  {timezone} · {timeFormat === "24h" ? "24 Jam" : "12 Jam"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Minimalist Floating Sticky Anchor Button (Solid Fill, Matching Active Section) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {quickJumpOpen && (
          <div className="mb-3 w-56 p-2 rounded-2xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2 py-1 flex items-center justify-between border-b border-default-100 dark:border-default-800 text-[11px] font-bold text-foreground">
              <span>{isId ? "Lompat ke Seksi" : "Jump to Section"}</span>
              <button
                type="button"
                onClick={() => setQuickJumpOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-default-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {REGIONAL_SECTIONS.map((sec) => {
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
              <span>{REGIONAL_SECTIONS.length} Seksi</span>
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

        {/* Minimalist Icon-Only Floating Button */}
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
