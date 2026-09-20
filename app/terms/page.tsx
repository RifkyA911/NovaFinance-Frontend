"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Scale,
  CreditCard,
  Ban,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { playNovaThemeSound } from "@/app/lib/sound";

type Language = "en" | "id";

const CONTENT = {
  en: {
    back: "Back to Home",
    badge: "Service Agreement & Terms",
    title: "Terms of Service",
    lastUpdated: "Last updated: September 20, 2026",
    intro:
      "Welcome to NovaFinance. By accessing our web workspace, mobile PWA, or API services, you enter into a legally binding agreement governing your usage of our multi-tenant accounting platform.",
    sections: [
      {
        icon: Scale,
        title: "1. Acceptance of Terms & Workspace Creation",
        desc: "By creating an account or establishing an enterprise workspace on NovaFinance, you confirm:",
        points: [
          "Legal Capacity: You possess full legal power and corporate authorization to enter into financial obligations on behalf of your entity.",
          "Accurate Credentials: You agree to provide true, current, and verifiable workspace identification details.",
          "Account Security: You are solely responsible for maintaining the confidentiality of your session credentials and multi-factor authentication tokens.",
        ],
      },
      {
        icon: FileText,
        title: "2. Permitted Use & Service Boundaries",
        desc: "NovaFinance is designed for personal wealth management, UMKM bookkeeping, and corporate ledger tracking:",
        points: [
          "Operational Bookkeeping: Logging business expenses, tracking cash flows, managing invoice reconciliations, and portfolio valuations.",
          "AI Copilot Advisory Limitations: Nova AI Copilot acts strictly as an analytical tool. Its outputs do not constitute certified statutory tax auditing or registered investment broker-dealer advice.",
          "Data Accuracy: Users remain responsible for the factual accuracy of financial figures submitted for tax filings and external corporate reporting.",
        ],
      },
      {
        icon: Ban,
        title: "3. Prohibited Conduct & Integrity Rules",
        desc: "To preserve platform integrity and multi-tenant security, the following activities are strictly prohibited:",
        points: [
          "Illicit Financial Activities: Using the platform to launder proceeds of crime, facilitate sanctioned transfers, or perpetrate financial fraud.",
          "Infrastructure Tampering: Attempting reverse-engineering, vulnerability exploits, denial-of-service floods, or unauthorized penetration tests.",
          "Credential Sharing: Circumventing seat licenses or sharing administrative tokens outside designated corporate roles.",
        ],
      },
      {
        icon: CreditCard,
        title: "4. Subscription Tiers & Billing",
        desc: "Subscriptions, upgrades, and enterprise tier agreements are administered as follows:",
        points: [
          "Tier Entitlements: Enterprise tiers include white-label brand identity, dynamic multi-tenant permissions, and custom API key vaults.",
          "Payment Processing: Subscription charges are billed in advance on recurring monthly or annual cycles and are non-refundable except where mandated by applicable consumer protection laws.",
          "Cancellation: You may downgrade or cancel your subscription plan at any time through Workspace Billing Settings.",
        ],
      },
      {
        icon: AlertTriangle,
        title: "5. Service Level & Limitation of Liability",
        desc: "Our commitment to high availability and statutory liability caps:",
        points: [
          "High Availability: We target 99.98% platform uptime backed by distributed database clustering and edge routing.",
          "Maintenance Windows: Scheduled maintenance windows are communicated in advance with zero impact to stored ledger data.",
          "Liability Cap: To the maximum extent permitted by law, NovaFinance's cumulative liability is limited to the subscription fees paid by your workspace in the preceding 12 months.",
        ],
      },
    ],
    contactTitle: "Legal & Regulatory Inquiries",
    contactText:
      "For enterprise agreements, terms clarification, or legal notices, contact our counsel at legal@novafinance.app.",
  },
  id: {
    back: "Kembali ke Beranda",
    badge: "Ketentuan Layanan & Perjanjian",
    title: "Syarat & Ketentuan Layanan",
    lastUpdated: "Terakhir diperbarui: 20 September 2026",
    intro:
      "Selamat datang di NovaFinance. Dengan mengakses workspace web, aplikasi PWA, maupun antarmuka API kami, Anda menyetujui ketentuan hukum yang mengatur penggunaan platform pembukuan dan manajemen keuangan ini.",
    sections: [
      {
        icon: Scale,
        title: "1. Penerimaan Ketentuan & Pendaftaran Workspace",
        desc: "Dengan mendaftar akun atau mendirikan workspace perusahaan di NovaFinance, Anda menyatakan bahwa:",
        points: [
          "Kapasitas Hukum: Anda memiliki wewenang hukum penuh untuk bertindak atas nama pribadi atau entitas bisnis (PT/CV/Firma) yang Anda daftarkan.",
          "Keabsahan Data: Anda menjamin bahwa identitas, alamat email, dan informasi usaha yang dicantumkan adalah valid dan dapat diverifikasi.",
          "Keamanan Akses: Anda bertanggung jawab penuh atas kerahasiaan kata sandi, token otentikasi, dan hak akses anggota workspace Anda.",
        ],
      },
      {
        icon: FileText,
        title: "2. Batasan Penggunaan & Hak Cipta",
        desc: "NovaFinance diperuntukkan bagi pencatatan kekayaan pribadi, pembukuan UMKM, dan rekonsiliasi korporat:",
        points: [
          "Fungsi Pembukuan: Mencatat transaksi arus kas, memvalidasi bukti nota, memonitor portofolio investasi, dan mengekspor laporan keuangan.",
          "Batasan Nasihat AI Copilot: Fitur asisten AI berfungsi sebagai alat analisis dan otomasi data. Output AI bukan merupakan nasihat pajak resmi tersumpah atau konsultasi investasi berizin OJK.",
          "Tanggung Jawab Laporan: Keakuratan angka pembukuan untuk kebutuhan audit eksternal atau pelaporan pajak tetap berada pada pengguna.",
        ],
      },
      {
        icon: Ban,
        title: "3. Larangan Penggunaan & Integritas Sistem",
        desc: "Demi menjaga keamanan bersama dan stabilitas multi-tenant, tindakan berikut dilarang keras:",
        points: [
          "Aktivitas Ilegal: Menggunakan platform untuk pencucian uang, pendanaan kegiatan terlarang, atau manipulasi laporan keuangan curang.",
          "Eksploitasi Sistem: Mencoba meretas, menyuntikkan script berbahaya, melakukan reverse-engineering, atau serangan DDoS pada server kami.",
          "Penyalahgunaan Akun: Membagi kredensial administratif kepada pihak tanpa izin untuk menghindari lisensi workspace.",
        ],
      },
      {
        icon: CreditCard,
        title: "4. Langganan, Tier Enterprise & Pembayaran",
        desc: "Ketentuan paket langganan dan fasilitas enterprise:",
        points: [
          "Fasilitas Tier: Paket Enterprise mencakup kustomisasi identitas brand perusahaan, visibilitas logo di sidebar, dan brankas kunci API kustom.",
          "Siklus Tagihan: Pembayaran langganan diproses di muka secara bulanan atau tahunan dan bersifat non-refundable kecuali diatur lain oleh undang-undang.",
          "Pembatalan: Anda dapat membatalkan atau mengubah paket langganan kapan saja melalui menu Pengaturan Billing Workspace.",
        ],
      },
      {
        icon: AlertTriangle,
        title: "5. Ketersediaan Layanan & Batasan Tanggung Jawab",
        desc: "Komitmen uptime dan batasan liabilitas platform:",
        points: [
          "Target Uptime: Kami menargetkan 99.98% ketersediaan sistem dengan arsitektur failover terdistribusi.",
          "Pemeliharaan Berkala: Pembaruan sistem dilakukan terjadwal dengan pemberitahuan awal dan tanpa menghapus riwayat pembukuan Anda.",
          "Batasan Liabilitas: Sejauh diizinkan hukum yang berlaku, tanggung jawab kumulatif NovaFinance dibatasi sebesar nilai biaya langganan yang dibayarkan workspace Anda dalam 12 bulan terakhir.",
        ],
      },
    ],
    contactTitle: "Bantuan Hukum & Kontrak Korporat",
    contactText:
      "Untuk perjanjian khusus korporat, klarifikasi pasal, atau surat resmi hukum, hubungi divisi legal kami di legal@novafinance.app.",
  },
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
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
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
        <div className="mt-12 p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10 text-center space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t.contactTitle}</h3>
          <p className="text-xs text-default-600 dark:text-default-400 max-w-lg mx-auto">
            {t.contactText}
          </p>
        </div>
      </main>
    </div>
  );
}
