"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Server,
  FileCheck,
  Bug,
  KeyRound,
  Sun,
  Moon,
  Cpu,
} from "lucide-react";
import { playNovaThemeSound } from "@/app/lib/sound";

type Language = "en" | "id";

const CONTENT = {
  en: {
    back: "Back to Home",
    badge: "Enterprise Security Architecture",
    title: "Security Disclosure & Hardening",
    lastUpdated: "Last updated: September 20, 2026",
    intro:
      "Security is not a feature at NovaFinance — it is our foundational bedrock. Discover our defense-in-depth architecture, cryptographic standards, multi-tenant isolation, and responsible vulnerability disclosure program.",
    sections: [
      {
        icon: Lock,
        title: "1. Cryptographic Standards & Data Defense",
        desc: "All network boundaries and persistent records adhere to strict cryptographic requirements:",
        points: [
          "TLS 1.3 Strict Transport: All public and inter-service HTTP/WebSocket endpoints enforce modern TLS 1.3 ciphers with HSTS enabled.",
          "AES-256 Storage: S3 storage buckets and database volume partitions are encrypted at rest with rotating encryption keys.",
          "Client-Side Key Vault: Private LLM keys (Gemini, Groq, DeepSeek, Claude) are never stored in plain text on our backend servers.",
        ],
      },
      {
        icon: Server,
        title: "2. Multi-Tenant Logical & Physical Isolation",
        desc: "Strict isolation safeguards ensure tenant boundaries are cryptographically unbreakable:",
        points: [
          "Tenant-Scoped Queries: Drizzle ORM and PostgreSQL row policies mandate explicit workspace identification on every database transaction.",
          "Role-Based Access Control (RBAC): Fine-grained permission matrices strictly enforce segregation of duties between Owners, Admins, Staff, and Auditors.",
          "Session Invalidation: Instant revocation of active Bearer tokens upon password rotation, role change, or security alert.",
        ],
      },
      {
        icon: FileCheck,
        title: "3. Double-Entry Auditability & Immutability",
        desc: "Every accounting action is logged in an immutable audit ledger:",
        points: [
          "Immutable Audit Trail: Critical ledger edits, balance adjustments, and currency conversions produce unalterable event log rows.",
          "Automated Reconciliations: Double-entry math checks run continuously to detect zero-sum imbalance or transaction drift before reports are generated.",
          "Backup Integrity: Hourly incremental backups with point-in-time recovery (PITR) across geographically separated availability zones.",
        ],
      },
      {
        icon: Bug,
        title: "4. Responsible Vulnerability Disclosure Program",
        desc: "We actively collaborate with global security researchers to identify potential threats:",
        points: [
          "Safe Harbor Commitment: We will not pursue legal action against ethical security researchers acting in good faith under our guidelines.",
          "Scope: Covers all production endpoints (*.novafinance.app, API gateways, and client bundles).",
          "Response SLA: Initial vulnerability triage response within 24 hours, with remediation sprints prioritizing critical vectors.",
        ],
      },
    ],
    reportTitle: "Found a Security Vulnerability?",
    reportText:
      "Please email your findings with proof-of-concept steps to security@novafinance.app. We encrypt all replies with our official PGP key.",
  },
  id: {
    back: "Kembali ke Beranda",
    badge: "Arsitektur Keamanan Enterprise",
    title: "Keterbukaan & Standar Keamanan",
    lastUpdated: "Terakhir diperbarui: 20 September 2026",
    intro:
      "Keamanan bukan sekadar fitur di NovaFinance — melainkan fondasi utama sistem kami. Pelajari arsitektur pertahanan berlapis, standar kriptografi, isolasi data multi-tenant, serta program pelaporan celah keamanan kami.",
    sections: [
      {
        icon: Lock,
        title: "1. Standar Kriptografi & Perlindungan Data",
        desc: "Semua batas jaringan dan data persisten mematuhi standar enkripsi perbankan tertinggi:",
        points: [
          "Transmisi Wajib TLS 1.3: Seluruh endpoint HTTP dan WebSocket wajib menggunakan TLS 1.3 dengan HSTS aktif untuk mencegah intersepsi data.",
          "Enkripsi Disk AES-256: Partisi database PostgreSQL dan dokumen lampiran di MinIO S3 dienkripsi saat istirahat dengan rotasi kunci otomatis.",
          "Brankas Kunci API Sisi Klien: Kunci API mandiri Anda (Gemini, Groq, DeepSeek, Claude) tidak pernah disimpan dalam teks terbuka di server kami.",
        ],
      },
      {
        icon: Server,
        title: "2. Isolasi Multi-Tenant & Pembatasan Akses",
        desc: "Perlindungan terisolasi untuk memastikan batas data antar-organisasi tidak dapat tertembus:",
        points: [
          "Query Terikat Workspace: Drizzle ORM dan PostgreSQL menerapkan validasi workspaceId pada setiap mutasi data tanpa kecuali.",
          "Kontrol Akses Berbasis Peran (RBAC): Matriks izin granular membedakan wewenang Owner, Admin, Anggota Tim, dan Auditor Forensik.",
          "Pencabutan Sesi Seketika: Token otentikasi aktif langsung dibatalkan saat pengguna mengganti kata sandi atau mengalami perubahan hak akses.",
        ],
      },
      {
        icon: FileCheck,
        title: "3. Keterlacakan Audit & Pembukuan Berimbang",
        desc: "Setiap mutasi buku kas dicatat dalam jejak audit permanen:",
        points: [
          "Jejak Audit Abadi: Perubahan nominal transaksi, mutasi saldo, dan penyesuaian kurs mata uang menghasilkan log sistem yang tidak dapat diubah.",
          "Verifikasi Nol Selisih: Logika rekonsiliasi berpasangan (double-entry verification) mendeteksi selisih kalkulasi secara otomatis sebelum laporan diterbitkan.",
          "Integritas Pencadangan: Pencadangan berkala setiap jam dengan kemampuan pemulihan Point-in-Time (PITR) di zona server terpisah.",
        ],
      },
      {
        icon: Bug,
        title: "4. Program Keterbukaan Celah Keamanan (Bug Bounty)",
        desc: "Kami menyambut baik kolaborasi dengan peneliti keamanan siber etis:",
        points: [
          "Komitmen Safe Harbor: Kami menjamin tidak akan menuntut peneliti etis yang mematuhi pedoman pelaporan bertanggung jawab.",
          "Cakupan Sistem: Mencakup seluruh domain produksi (*.novafinance.app, gerbang API, dan aplikasi web).",
          "SLA Respons: Respons awal penilaian kerentanan diberikan dalam waktu 24 jam dengan prioritas perbaikan cepat.",
        ],
      },
    ],
    reportTitle: "Menemukan Celah Keamanan?",
    reportText:
      "Kirimkan laporan Anda beserta langkah reproduksi (PoC) ke security@novafinance.app. Kami mengenkripsi seluruh balasan dengan kunci PGP resmi kami.",
  },
};

export default function SecurityPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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

        {/* Report Vulnerability Card */}
        <div className="mt-12 p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-center space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t.reportTitle}</h3>
          <p className="text-xs text-default-600 dark:text-default-400 max-w-lg mx-auto">
            {t.reportText}
          </p>
        </div>
      </main>
    </div>
  );
}
