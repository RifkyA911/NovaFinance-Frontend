"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Sparkles, CheckCircle2 } from "lucide-react";

interface FluidWaveTransitionProps {
  onComplete: () => void;
  durationSeconds?: number;
}

export default function FluidWaveTransition({
  onComplete,
  durationSeconds = 5,
}: FluidWaveTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = [
    "Authenticating cryptographic session tokens...",
    "Fetching multi-tenant ledgers & wallet balances...",
    "Constructing real-time cashflow topology...",
    "Verifying double-entry balance integrity...",
    "Ready! Launching your financial command center...",
  ];

  useEffect(() => {
    const totalMs = durationSeconds * 1000;
    const intervalMs = 50;
    const increment = 100 / (totalMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }

        // Determine step index based on progress percentage
        if (next < 25) setStepIndex(0);
        else if (next < 50) setStepIndex(1);
        else if (next < 75) setStepIndex(2);
        else if (next < 92) setStepIndex(3);
        else setStepIndex(4);

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-slate-950 transition-opacity duration-700 select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Fluid Waves Container at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-96 overflow-hidden pointer-events-none opacity-40 dark:opacity-50">
        {/* Wave Layer 1 */}
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_12s_ease-in-out_infinite] text-blue-600/30"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 2 */}
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_9s_ease-in-out_infinite_reverse] text-indigo-500/25 -translate-x-1/4"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,20 C200,110 400,-10 600,60 C800,130 1000,10 1200,70 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 3 */}
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-[wave_6s_ease-in-out_infinite] text-purple-600/20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,40 C300,100 500,20 800,80 C1000,140 1100,30 1200,90 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 blur-xs animate-pulse"
            style={{
              width: `${4 + (i % 4) * 3}px`,
              height: `${4 + (i % 4) * 3}px`,
              left: `${10 + (i * 19) % 80}%`,
              bottom: `${15 + (i * 13) % 70}%`,
              animationDuration: `${3 + (i % 4)}s`,
              opacity: 0.2 + (i % 3) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Center Console Card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8 text-center space-y-6">
        {/* Animated Brand Pulse */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-3 rounded-3xl bg-linear-to-r from-blue-500 to-purple-600 opacity-40 blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <Wallet className="w-8 h-8 text-white animate-bounce" style={{ animationDuration: "2s" }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fluid Data Synchronization</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Connecting to NovaJournal
          </h2>
          <p className="text-xs text-slate-400 min-h-6 transition-all duration-300">
            {steps[stepIndex]}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 max-w-xs mx-auto">
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-75 shadow-sm shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Synchronizing...</span>
            <span className="font-semibold text-blue-400">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Ready Badge when done */}
        {progress >= 100 && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ledgers Loaded Successfully</span>
          </div>
        )}
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
      `}</style>
    </div>
  );
}
