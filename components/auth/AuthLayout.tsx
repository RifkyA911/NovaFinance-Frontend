"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import {
  Wallet,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
} from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = "Enterprise Financial Ledger",
}: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-default-50 dark:bg-gray-950 flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-500">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-default-200/60 dark:border-default-800/60 bg-white/75 dark:bg-gray-900/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo matching /dashboard */}
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="w-6.5 h-6.5 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              NovaJournal
            </span>
          </Link>

          {/* Quick Nav Controls */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-default-600 hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            {mounted && (
              <button
                type="button"
                aria-label="Toggle Theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-lg bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 text-default-700 dark:text-default-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Showcase (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Architecting Your{" "}
                <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Financial Clarity
                </span>{" "}
                with Intelligence.
              </h1>
              <p className="text-sm text-default-500 max-w-md leading-relaxed">
                Connect your business accounts, personal wallets, global portfolios, and intelligent AI models in one unified high-speed ledger.
              </p>
            </div>

            {/* Showcase Feature Badges Matrix */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-foreground">Multi-Provider AI</div>
                <div className="text-[11px] text-default-500">Groq Llama 3.3 & Gemini 2.5 Pro fallback</div>
              </div>

              <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-foreground">Global Wealth Tracker</div>
                <div className="text-[11px] text-default-500">IHSG composite & international indices</div>
              </div>

              <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-foreground">Multi-Tenant Workspaces</div>
                <div className="text-[11px] text-default-500">Isolate PT, UMKM & personal records</div>
              </div>

              <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-foreground">Zero-Trust Security</div>
                <div className="text-[11px] text-default-500">End-to-end encrypted session vault</div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-800/80 bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <p className="text-xs text-default-600 dark:text-default-400 italic">
                &ldquo;NovaJournal eliminated 15+ hours of manual bookkeeping each month. The live money flow topology and instant OCR make accounting effortless.&rdquo;
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  R
                </div>
                <span className="text-xs font-semibold text-foreground">Verified Finance Lead</span>
                <span className="text-[10px] text-default-400">• Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                <p className="text-xs text-default-500 mt-1">{subtitle}</p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl border border-default-200 dark:border-default-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl shadow-default-200/20 dark:shadow-none">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-default-200/60 dark:border-default-800/60 py-4 text-center text-xs text-default-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} NovaJournal Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 text-default-500 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 256-bit Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>99.98% High Availability</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
