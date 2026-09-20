/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

// NovaFinance Internationalization & Regional Formatting Utility
// Integrates localStorage preferences with ECMAScript Intl standards across the platform

export type SupportedLanguage = "id" | "en";

export interface IntlPreferences {
  currency: string;
  numberFormat: "id" | "en";
  dateFormat: string;
  timezone: string;
  firstDayOfWeek?: number; // 1 = Monday, 0 = Sunday
}

export function getStoredIntlPreferences(): IntlPreferences {
  if (typeof window === "undefined") {
    return {
      currency: "IDR",
      numberFormat: "id",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Jakarta (WIB)",
      firstDayOfWeek: 1,
    };
  }

  return {
    currency: localStorage.getItem("novafinance_currency") || localStorage.getItem("novajournal_currency") || "IDR",
    numberFormat: ((localStorage.getItem("novafinance_number_format") || localStorage.getItem("novajournal_number_format")) as "id" | "en") || "id",
    dateFormat: localStorage.getItem("novafinance_date_format") || localStorage.getItem("novajournal_date_format") || "DD/MM/YYYY",
    timezone: localStorage.getItem("novafinance_timezone") || localStorage.getItem("novajournal_timezone") || "Asia/Jakarta (WIB)",
    firstDayOfWeek: Number(localStorage.getItem("novajournal_first_day_of_week") || 1),
  };
}

export function formatSystemCurrency(
  val: number | string,
  overrideCurrency?: string
): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";

  const prefs = getStoredIntlPreferences();
  const currency = overrideCurrency || prefs.currency;
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";
  const isNoDecimal = currency === "IDR" || currency === "JPY";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: isNoDecimal ? 0 : 2,
    maximumFractionDigits: isNoDecimal ? 0 : 2,
  }).format(num);
}

export function formatCompactNumber(
  val: number | string,
  overrideCurrency?: string
): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";

  const prefs = getStoredIntlPreferences();
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";

  const formatted = new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);

  if (overrideCurrency || prefs.currency) {
    const symbol = (overrideCurrency || prefs.currency) === "IDR" ? "Rp " : "$ ";
    return `${symbol}${formatted}`;
  }
  return formatted;
}

export function formatSystemDate(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const prefs = getStoredIntlPreferences();
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";

  return new Intl.DateTimeFormat(locale, options || {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// =========================================================================
// Bilingual Translation Dictionary (Indonesian & English)
// =========================================================================

export const DICTIONARY = {
  // Common UI Actions
  common: {
    save: { id: "Simpan Pengaturan", en: "Save Settings" },
    saving: { id: "Menyimpan...", en: "Saving..." },
    saved: { id: "Berhasil Disimpan!", en: "Successfully Saved!" },
    cancel: { id: "Batal", en: "Cancel" },
    apply: { id: "Terapkan", en: "Apply" },
    reset: { id: "Kembalikan Default", en: "Reset to Defaults" },
    search: { id: "Cari fitur atau halaman...", en: "Search modules or features..." },
    section: { id: "Seksi:", en: "Section:" },
    openAll: { id: "Buka Semua", en: "Expand All" },
    foldAll: { id: "Lipat Semua", en: "Collapse All" },
    back: { id: "Kembali ke Settings Hub", en: "Back to Settings Hub" },
    active: { id: "Aktif", en: "Active" },
    inactive: { id: "Nonaktif", en: "Disabled" },
    status: { id: "Status", en: "Status" },
    preview: { id: "Pratinjau Langsung", en: "Live Preview" },
  },

  // Sidebar Menu Titles & Groups
  sidebar: {
    groupOverview: { id: "Ikhtisar", en: "Overview" },
    groupPlanning: { id: "Perencanaan & Aset", en: "Planning & Assets" },
    groupGovernance: { id: "Sistem & Tata Kelola", en: "System & Governance" },
    groupSettings: { id: "Pengaturan & Konfigurasi", en: "Settings & Configuration" },

    menuDashboard: { id: "Dasbor", en: "Dashboard" },
    menuTransactions: { id: "Transaksi", en: "Transactions" },
    menuWallets: { id: "Dompet & Rekening", en: "Wallets & Accounts" },
    menuAnalytics: { id: "Analitik Keuangan", en: "Analytics" },

    menuGoals: { id: "Target & Impian", en: "Goals & Wishlist" },
    menuLiabilities: { id: "Matriks Utang & Cicilan", en: "Liabilities Matrix" },
    menuMoneyFlow: { id: "Alur Distribusi Kas", en: "Money Flow" },
    menuPortfolio: { id: "Portofolio Investasi", en: "Portfolio" },
    menuWorkspaces: { id: "Manajemen Workspace", en: "Workspaces" },

    menuUsers: { id: "Pengguna & Hak Akses", en: "Users & RBAC" },
    menuLogs: { id: "Log Audit & Forensik", en: "Audit Logs" },

    menuSettings: { id: "Pusat Pengaturan", en: "Settings Hub" },
    menuRegional: { id: "Regional & Format", en: "Regional & Formatting" },
    menuProfile: { id: "Profil Pengguna", en: "User Profile" },
    menuBrand: { id: "Identitas Brand", en: "Company Brand" },
    menuAppearance: { id: "Tampilan & Tema", en: "Appearance" },
    menuAiHub: { id: "AI Hub & Copilot", en: "AI Hub & Copilot" },
    menuSecurity: { id: "Keamanan & Vault", en: "Security & Vault" },
  },

  // Navbar
  navbar: {
    searchPlaceholder: { id: "Cari cepat modul (Ctrl+K)...", en: "Quick search modules (Ctrl+K)..." },
    notifications: { id: "Pemberitahuan", en: "Notifications" },
    markAllRead: { id: "Tandai Sudah Dibaca", en: "Mark all as read" },
    noUnread: { id: "Semua notifikasi telah dibaca", en: "No unread notifications" },
    themeToggle: { id: "Ganti Tema", en: "Toggle Theme" },
    accountSettings: { id: "Pengaturan Akun", en: "Account Settings" },
    signOut: { id: "Keluar Akun", en: "Sign Out" },
    paletteTitle: { id: "Palet Warna HeroUI", en: "HeroUI Color Palette" },
  },

  // Settings Hub (`/settings`)
  settings: {
    title: { id: "Pusat Kontrol & Pengaturan Sistem", en: "Settings & Configuration Hub" },
    badge: { id: "Pusat Kontrol", en: "Central Control" },
    desc: {
      id: "Pusat navigasi pengaturan cepat, konfigurasi audio, dan konektivitas modul NovaFinance.",
      en: "Central quick navigation, audio synthesizer feedback, and module connectivity across NovaFinance.",
    },
    secShortcuts: { id: "1. Pintasan Modul Pengaturan Utama", en: "1. Configuration Modules & Sub-Menu Shortcuts" },
    secAudio: { id: "2. Respon Audio & Efek Suara Web Audio API", en: "2. Audio Feedback & Celestial Synthesizer" },
    secAudioDesc: {
      id: "Sintesis Web Audio API langsung di browser tanpa jeda file eksternal dengan volume akurat.",
      en: "Direct zero-latency in-browser Web Audio API sound synthesis with accurate volume scaling.",
    },
    secSystem: { id: "3. Status Mesin & Basis Data PostgreSQL", en: "3. PostgreSQL Engine & Infrastructure Status" },
    btnSave: { id: "Simpan Preferensi Audio & Umum", en: "Save Audio & General Preferences" },
    soundSwitchLabel: { id: "Respon Suara Tombol & Transisi", en: "Button Click & Transition Feedback" },
    soundSwitchDesc: { id: "Putar nada chime & haptic saat mengklik tombol utama", en: "Play chime & haptic tones when clicking primary buttons" },
    volumeLabel: { id: "Tingkat Volume Audio", en: "Master Audio Volume Level" },
    testClickBtn: { id: "Uji Klik Taktil", en: "Test Tactile Click" },
    testChimeBtn: { id: "Uji Chime Lembut", en: "Test Soft Chime" },
    testSpaceBtn: { id: "Uji Nada Kosmik", en: "Test Cosmic Sweep" },
  },

  // Regional Page (`/regional`)
  regional: {
    title: { id: "Pengaturan Regional, Waktu & Format Angka", en: "Regional, Timezone & Number Formatting" },
    badge: { id: "Standar Internasional", en: "Global Standards" },
    desc: {
      id: "Kustomisasi mata uang acuan buku besar, format tanggal laporan keuangan, pemisah desimal, dan zona waktu.",
      en: "Configure ledger reporting currency, date formatting, decimal separators, and regional timezone.",
    },
    secCurrency: { id: "1. Mata Uang Acuan & Presisi Desimal", en: "1. Base Currency & Decimal Precision" },
    secDate: { id: "2. Format Kalender & Tanggal Laporan", en: "2. Calendar & Financial Date Format" },
    secNumber: { id: "3. Pemisah Angka Ribuan & Desimal", en: "3. Number, Thousands & Decimal Separator" },
    secTimezone: { id: "4. Zona Waktu & Waktu Pelaporan", en: "4. Timezone & Operating Hours" },
    currencyLabel: { id: "Mata Uang Acuan Buku Besar", en: "Base Accounting Currency" },
    dateFormatLabel: { id: "Format Tampilan Tanggal", en: "Date Display Format" },
    numberFormatLabel: { id: "Standar Pemisah Angka", en: "Number Formatting Standard" },
    firstDayLabel: { id: "Hari Pertama dalam Pekan", en: "First Day of the Week" },
    timezoneLabel: { id: "Zona Waktu Finansial (Auto / Manual)", en: "Financial Timezone (Auto / Manual)" },
    livePreviewTitle: { id: "Pratinjau Format Interaktif", en: "Live Interactive Format Sandbox" },
    btnSave: { id: "Simpan Pengaturan Regional", en: "Save Regional Preferences" },
  },

  // User Profile (`/profile`)
  profile: {
    title: { id: "Profil Pengguna & Identitas Eksekutif", en: "User Profile & Executive Identity" },
    desc: {
      id: "Kelola profil personal, foto avatar (GIF/WebP), data kontak, dan preferensi akun Anda di NovaFinance.",
      en: "Manage personal profile, avatar visual (GIF/WebP), contact data, and executive account preferences.",
    },
    secAvatar: { id: "1. Foto Avatar & Visual Profil", en: "1. Avatar Photo & Visual Identity" },
    secPersonal: { id: "2. Data Pribadi & Posisi Jabatan", en: "2. Personal Information & Job Title" },
    secPreferences: { id: "3. Preferensi Regional & Waktu Akun", en: "3. Regional & Account Preferences" },
    btnSave: { id: "Simpan Profil ke Database", en: "Save Profile to Database" },
    avatarUploadHint: {
      id: "Format didukung: GIF animasi, WebP, PNG, JPG. Maks 5MB. Disimpan di MinIO S3 bucket.",
      en: "Supported formats: Animated GIF, WebP, PNG, JPG. Max 5MB. Persisted in MinIO S3 bucket.",
    },
  },

  // Company Brand (`/brand`)
  brand: {
    title: { id: "Identitas Brand Perusahaan & White-Label", en: "Company Brand & White-Label Identity" },
    badge: { id: "Tingkat Enterprise", en: "Enterprise Tier" },
    desc: {
      id: "Kustomisasi identitas perusahaan, logo korporasi, nama holding, slogan korporat, dan badge khusus di sidebar.",
      en: "Customize corporate identity, enterprise logo, holding name, corporate slogan, and sidebar badge.",
    },
    secIdentity: { id: "1. Profil Entitas & Legalitas Perusahaan", en: "1. Entity Profile & Corporate Legality" },
    secDisplay: { id: "2. Tampilan Badge & White-Label Sidebar", en: "2. Sidebar Badge & White-Label Display" },
    secPreview: { id: "3. Pratinjau Visual Navigasi Sidebar", en: "3. Visual Sidebar Navigation Preview" },
    btnSave: { id: "Simpan Identitas Brand ke Server", en: "Save Brand Identity to Server" },
    entityTypeLabel: { id: "Tipe Entitas Legal", en: "Legal Entity Type" },
    brandNameLabel: { id: "Nama Brand / Holding", en: "Brand / Holding Name" },
    jargonLabel: { id: "Slogan / Jargon Korporat", en: "Corporate Jargon / Tagline" },
    taxIdLabel: { id: "Nomor Pokok Wajib Pajak (NPWP / Tax ID)", en: "Tax ID / NPWP Number" },
    websiteLabel: { id: "Situs Web Resmi", en: "Official Website URL" },
  },

  // Appearance (`/appearance`)
  appearance: {
    title: { id: "Tampilan Antarmuka & Efek Kosmik", en: "Appearance & Visual Experience" },
    badge: { id: "NovaDesign Studio", en: "NovaDesign Studio" },
    desc: {
      id: "Personalisasi tema tampilan, 6 palet warna, tipografi font, kepadatan antarmuka, dan efek visual kosmik.",
      en: "Personalize visual theme, 6 color palettes, typography fonts, UI density, and cosmic visual effects.",
    },
    secMode: { id: "1. Mode Tampilan Sistem", en: "1. System Display Mode" },
    secModeDesc: {
      id: "Pilih antara mode cerah dengan kontras tajam atau mode gelap kosmik hemat energi.",
      en: "Choose between bright contrast light mode or energy-saving cosmic dark mode.",
    },
    secPalette: { id: "2. Palet Warna Sistem & Hex Kustom", en: "2. Color Palette & Custom Hex" },
    secPaletteDesc: {
      id: "Pilih skema warna aksen antarmuka atau masukkan kode heksadesimal kustom Anda.",
      en: "Choose interface accent color scheme or enter your custom hexadecimal code.",
    },
    secDensity: { id: "3. Kepadatan Bilah & Skala Kustom", en: "3. Bar Density & Custom Scaling" },
    secDensityDesc: {
      id: "Atur kepadatan dan dimensi tinggi navbar serta lebar sidebar agar presisi dan nyaman di layar Anda.",
      en: "Adjust density and dimensions of navbar height and sidebar width for optimal ergonomics.",
    },
    secFonts: { id: "4. Tipografi & Karakter Font", en: "4. Typography & Font Families" },
    secFontsDesc: {
      id: "Pilih font antarmuka yang sesuai dengan gaya pembukuan dan estetika finansial Anda.",
      en: "Choose the UI font that matches your financial ledger aesthetics and workflow.",
    },
    secBackground: { id: "5. Efek Visual Latar & Nebula", en: "5. Visual Background & Nebula Glow" },
    secBackgroundDesc: {
      id: "Kustomisasi animasi gelombang latar belakang, efek nebula berpendar, dan kaca frosted glass.",
      en: "Customize background wave animation, cosmic nebula glow, and frosted glass backdrop.",
    },
    resetSection: { id: "Reset Seksi", en: "Reset Section" },
    resetAll: { id: "Reset Default", en: "Reset to Default" },
    customHexLabel: { id: "Warna Hex Kustom:", en: "Custom Hex Color:" },
    applyBtn: { id: "Terapkan", en: "Apply" },
    activePill: { id: "Aktif", en: "Active" },
    lightMode: { id: "Terang (Light)", en: "Light Mode" },
    lightModeDesc: { id: "Kontras bersih untuk siang hari", en: "Clean high contrast for daytime" },
    darkMode: { id: "Gelap Kosmik (Dark)", en: "Cosmic Dark" },
    darkModeDesc: { id: "Latar malam hemat energi OLED", en: "Energy-efficient OLED night theme" },
    systemMode: { id: "Ikuti Sistem OS", en: "Follow System OS" },
    systemModeDesc: { id: "Otomatis sinkron dengan jadwal OS", en: "Syncs with operating system theme" },
    compact: { id: "Kompak", en: "Compact" },
    comfortable: { id: "Nyaman", en: "Comfortable" },
    spacious: { id: "Spacious", en: "Spacious" },
    sidebarWidth: { id: "Lebar Sidebar", en: "Sidebar Width" },
    navbarHeight: { id: "Tinggi Navbar", en: "Navbar Height" },
  },
} as const;

// Hook to access language, switch language, and get translated strings
export function useIntlLanguage() {
  const [lang, setLangState] = useState<SupportedLanguage>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("novajournal_lang") || localStorage.getItem("novafinance_lang");
      if (saved === "en" || saved === "id") {
        setLangState(saved);
      }
    } catch {}

    const handleLangChange = (e: any) => {
      const nextLang = e?.detail || localStorage.getItem("novajournal_lang");
      if (nextLang === "en" || nextLang === "id") {
        setLangState(nextLang);
      }
    };

    window.addEventListener("novajournal_lang_changed", handleLangChange);
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("novajournal_lang_changed", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  const setLang = useCallback((newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem("novajournal_lang", newLang);
      localStorage.setItem("novafinance_lang", newLang);
      window.dispatchEvent(new CustomEvent("novajournal_lang_changed", { detail: newLang }));
    } catch {}
  }, []);

  const t = useCallback(
    (item: { id: string; en: string } | undefined, fallback?: string): string => {
      if (!item) return fallback || "";
      return item[lang] || item.id || fallback || "";
    },
    [lang]
  );

  return {
    lang,
    setLang,
    t,
    isId: lang === "id",
    isEn: lang === "en",
  };
}
