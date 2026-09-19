"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Sparkles } from "lucide-react";
import { playNovaSpaceSound } from "@/app/lib/sound";

interface NovaCosmicLoaderProps {
  title?: string;
  subtitle?: string;
  playSound?: boolean;
}

export default function NovaCosmicLoader({
  title = "NovaJournal Financial Engine",
  subtitle = "Synchronizing cryptographic session & multi-entity ledgers...",
  playSound = true,
}: NovaCosmicLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const phases = [
    "Memverifikasi token sesi terenkripsi...",
    "Menghubungkan ke buku besar multi-entitas...",
    "Membangun topologi likuiditas & cashflow...",
    "Menyiapkan command center keuangan Nova...",
  ];

  useEffect(() => {
    if (playSound) {
      playNovaSpaceSound();
    }

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [playSound]);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white select-none transition-opacity duration-500">
      {/* Background Cosmic Nebula Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Fluid Waves Container at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-80 overflow-hidden pointer-events-none opacity-45">
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_12s_ease-in-out_infinite] text-blue-600/30"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z" />
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_9s_ease-in-out_infinite_reverse] text-indigo-500/25 -translate-x-1/4"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,20 C200,110 400,-10 600,60 C800,130 1000,10 1200,70 L1200,120 L0,120 Z" />
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_6s_ease-in-out_infinite] text-purple-600/20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,40 C300,100 500,20 800,80 C1000,140 1100,30 1200,90 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Floating Particles / Starlight */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-300/30 blur-xs animate-pulse"
            style={{
              width: `${3 + (i % 3) * 3}px`,
              height: `${3 + (i % 3) * 3}px`,
              left: `${8 + (i * 17) % 84}%`,
              bottom: `${12 + (i * 15) % 76}%`,
              animationDuration: `${2.5 + (i % 4)}s`,
              opacity: 0.25 + (i % 3) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Central Interactive Console */}
      <div className="relative z-10 w-full max-w-sm mx-auto p-6 text-center space-y-6">
        {/* Glowing Brand Pulse Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-4 rounded-3xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-50 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl border border-white/20">
            <Wallet className="w-8 h-8 text-white animate-bounce" style={{ animationDuration: "2.2s" }} />
          </div>
          {/* Orbital Spinner Ring */}
          <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-blue-400/40 animate-spin" style={{ animationDuration: "10s" }} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Fluid Core Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {title}
          </h2>
          <p className="text-xs text-slate-300 font-medium transition-all duration-300 min-h-5">
            {phases[phaseIndex]}
          </p>
        </div>

        {/* Shimmering Indeterminate Fluid Loader Bar */}
        <div className="space-y-2 max-w-xs mx-auto">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner relative">
            <div className="h-full w-2/5 bg-linear-to-r from-blue-500 via-indigo-400 to-purple-500 rounded-full shadow-lg shadow-blue-500/50 animate-[shimmerSlide_2s_ease-in-out_infinite]" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>MEMUAT RUANG KERJA</span>
            <span className="text-blue-400 font-semibold">NOVA SPACE READY</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0% {
            transform: translateX(0) translateZ(0) scaleY(1);
          }
          50% {
            transform: translateX(-25%) translateZ(0) scaleY(1.15);
          }
          100% {
            transform: translateX(-50%) translateZ(0) scaleY(1);
          }
        }
        @keyframes shimmerSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
