"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Globe,
  Share2,
  Bell,
  Sun,
  Moon,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { playNovaThemeSound } from "@/app/lib/sound";

type Language = "en" | "id";

const CONTENT = {
  en: {
    back: "Back to Home",
    badge: "Enterprise Privacy Architecture",
    title: "Privacy Policy",
    lastUpdated: "Last updated: September 20, 2026",
    intro:
      "At NovaFinance, your financial privacy and data sovereign integrity are our highest priorities. This Privacy Policy details how we collect, process, encrypt, and safeguard your financial records, transactions, and personal credentials.",
    sections: [
      {
        icon: Database,
        title: "1. Information We Collect",
        desc: "We collect only data strictly necessary to deliver intelligent bookkeeping and financial analytics:",
        points: [
          "Account & Profile Data: Full name, business email, workspace role, and encrypted authentication tokens.",
          "Ledger & Financial Data: Transaction records, account balances, invoice metadata, custom categories, and receipt snapshots.",
          "Device & Telemetry: Anonymized browser version, system performance metrics, and edge latency indicators for fraud detection.",
          "Zero Third-Party Ad Trackers: We never sell your personal or financial data to advertising networks or third-party data brokers.",
        ],
      },
      {
        icon: Lock,
        title: "2. Cryptographic Security & Vault Storage",
        desc: "All financial data is protected with multi-layer enterprise encryption:",
        points: [
          "In-Transit Security: Mandatory TLS 1.3 encryption across all API requests and WebSocket channels.",
          "At-Rest Encryption: PostgreSQL records and S3/MinIO invoice attachments are secured using AES-256 with tenant-isolated database schemas.",
          "BYO API Keys Vault: When you configure custom Gemini, Groq, DeepSeek, or Claude keys, they are stored client-side in browser storage or encrypted environment secrets.",
        ],
      },
      {
        icon: Eye,
        title: "3. How We Use Your Data",
        desc: "Your data is used exclusively to fulfill your financial management requests:",
        points: [
          "Autonomous Bookkeeping: Parsing receipt snapshots via Vision AI and reconciling transaction balances.",
          "Executive Copilot Briefings: Generating real-time cash flow runway analysis, burn rate alerts, and investment diversification metrics.",
          "Multi-Tenant RBAC: Enforcing role-based access control (Owner, Admin, Member, Auditor) within your company workspaces.",
        ],
      },
      {
        icon: Share2,
        title: "4. Data Sharing & Sub-processors",
        desc: "We maintain a minimal footprint of vetted enterprise sub-processors:",
        points: [
          "Cloud Infrastructure: Tier-4 ISO-certified data centers with automated hourly encrypted backups.",
          "AI Model Inference: Receipt OCR and copilot queries sent to authorized LLM providers (Google Cloud, Groq) contain no personal identifying numbers unless explicitly uploaded by you.",
          "Legal Compliance: We disclose records only when strictly mandated by enforceable court orders or statutory financial regulations.",
        ],
      },
      {
        icon: Bell,
        title: "5. Your Rights & Data Portability",
        desc: "You retain absolute sovereignty over your financial books:",
        points: [
          "Export Anytime: Download your full financial ledger anytime in structured CSV, Excel (XLSX), or PDF formats.",
          "Right to Erasure: Workspace owners can permanently delete workspaces, purge attached receipt blobs, and terminate accounts with zero lingering backups after 30 days.",
          "Consent Controls: Configure audio synthesis, AI context visibility limits, and notifications directly in Settings.",
        ],
      },
    ],
    contactTitle: "Data Protection Officer",
    contactText:
      "For privacy inquiries, audit certifications, or data sovereignty requests, contact our compliance team at privacy@novafinance.app.",
  },
  id: {
    back: "Kembali ke Beranda",
    badge: "Arsitektur Privasi Enterprise",
    title: "Kebijakan Privasi",
    lastUpdated: "Terakhir diperbarui: 20 September 2026",
    intro:
      "Di NovaFinance, privasi finansial dan kedaulatan data Anda adalah prioritas mutlak kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, memproses, mengenkripsi, dan melindungi pembukuan transaksi serta identitas bisnis Anda.",
    sections: [
      {
        icon: Database,
        title: "1. Data yang Kami Kumpulkan",
        desc: "Kami hanya mengumpulkan informasi yang esensial untuk menyajikan pencatatan keuangan dan analitik pembukuan:",
        points: [
          "Data Akun & Profil: Nama lengkap, email perusahaan/pribadi, peran workspace, dan token otentikasi terenkripsi.",
          "Data Pembukuan & Arus Kas: Catatan transaksi, saldo dompet/rekening, faktur pajak, kategori kustom, dan foto struk belanja.",
          "Telemetri Sistem: Versi peramban anonim, performa sistem, dan metrik latensi untuk pencegahan anomali akses.",
          "Bebas Pelacak Iklan Pihak Ketiga: Kami tidak pernah dan tidak akan pernah menjual data finansial Anda kepada broker data atau jaringan iklan.",
        ],
      },
      {
        icon: Lock,
        title: "2. Keamanan Kriptografi & Penyimpanan Brankas",
        desc: "Seluruh data keuangan dilindungi enkripsi enterprise bertingkat:",
        points: [
          "Keamanan Dalam Transmisi: Enkripsi wajib TLS 1.3 di seluruh koneksi API dan jalur WebSocket.",
          "Enkripsi Saat Istirahat: Database PostgreSQL dan file dokumen MinIO S3 diamankan menggunakan standar AES-256 dengan skema multi-tenant terisolasi.",
          "Brankas Kunci API Pribadi: Kunci API Gemini, Groq, DeepSeek, atau Claude yang Anda pasang sendiri disimpan aman di browser lokal Anda dengan isolasi data.",
        ],
      },
      {
        icon: Eye,
        title: "3. Cara Kami Menggunakan Data Anda",
        desc: "Data Anda hanya digunakan untuk memenuhi kebutuhan operasional akuntansi Anda:",
        points: [
          "Pembukuan Otonom: Mengekstraksi foto struk via Vision AI dan merekonsiliasi saldo rekening.",
          "Briefing Eksekutif Copilot: Menghasilkan analisis runway kas, peringatan burn rate, dan skor diversifikasi portofolio secara real-time.",
          "RBAC Multi-Tenant: Menerapkan kontrol hak akses berbasis peran (Owner, Admin, Member, Auditor) di workspace perusahaan Anda.",
        ],
      },
      {
        icon: Share2,
        title: "4. Pembagian Data & Sub-prosesor",
        desc: "Kami membatasi pemrosesan hanya pada infrastruktur resmi berstandar tinggi:",
        points: [
          "Infrastruktur Cloud: Pusat data Tier-4 tersertifikasi ISO dengan pencadangan terenkripsi berkala.",
          "Inferensi AI: Ekstraksi OCR hanya mengirimkan teks nota ke API resmi tanpa menyertakan identitas pribadi kecuali tercetak pada dokumen yang Anda unggah.",
          "Kepatuhan Hukum: Kami hanya membuka data jika diwajibkan secara sah oleh keputusan pengadilan yang berkekuatan hukum tetap.",
        ],
      },
      {
        icon: Bell,
        title: "5. Hak Anda & Portabilitas Data",
        desc: "Anda memiliki kendali dan kepemilikan penuh atas data buku kas Anda:",
        points: [
          "Ekspor Kapan Saja: Unduh seluruh pembukuan Anda kapan saja dalam format CSV, Excel (XLSX), atau laporan PDF resmi.",
          "Hak Penghapusan Data: Pemilik workspace dapat menghapus workspace, lampiran bukti transaksi, dan menutup akun secara permanen.",
          "Kontrol Privasi Penuh: Atur profil suara TTS, batasan akses data AI, dan notifikasi langsung di menu Settings.",
        ],
      },
    ],
    contactTitle: "Petugas Perlindungan Data (DPO)",
    contactText:
      "Untuk pertanyaan privasi, sertifikasi audit, atau permintaan kedaulatan data, hubungi tim kepatuhan kami di privacy@novafinance.app.",
  },
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Language>("id");
  const { theme, setTheme } = useTheme();
  const t = CONTENT[lang];

  return (
    <div className="min-h-screen bg-default-50 dark:bg-gray-950 text-foreground font-sans antialiased selection:bg-blue-500/20 selection:text-blue-500">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-default-200/60 dark:border-default-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-default-600 dark:text-default-400 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-default-100 dark:bg-default-900 p-0.5 rounded-lg border border-default-200/80 dark:border-default-800/80 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "en" ? "bg-white dark:bg-gray-800 text-blue-600 shadow-2xs" : "text-default-500"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "id" ? "bg-white dark:bg-gray-800 text-blue-600 shadow-2xs" : "text-default-500"
                }`}
              >
                ID
              </button>
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                playNovaThemeSound(next === "dark");
                setTheme(next);
              }}
              className="w-8 h-8 rounded-lg bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-300 flex items-center justify-center cursor-pointer hover:bg-default-200 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="mt-2 text-xs font-mono text-default-400">
            {t.lastUpdated}
          </p>
          <p className="mt-4 text-sm text-default-600 dark:text-default-400 leading-relaxed">
            {t.intro}
          </p>
        </div>

        {/* Structured Sections */}
        <div className="space-y-8">
          {t.sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {sec.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-default-600 dark:text-default-400 leading-relaxed">
                  {sec.desc}
                </p>
                <ul className="space-y-2 pt-1">
                  {sec.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-default-700 dark:text-default-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Footer Card */}
        <div className="mt-12 p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 text-center space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t.contactTitle}</h3>
          <p className="text-xs text-default-600 dark:text-default-400 max-w-lg mx-auto">
            {t.contactText}
          </p>
        </div>
      </main>
    </div>
  );
}
