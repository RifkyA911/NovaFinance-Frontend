"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { playNovaThemeSound } from "@/app/lib/sound";

export interface ThemeTransitionDetail {
  targetTheme: "light" | "dark";
  onComplete?: () => void;
}

export function triggerThemeTransition(targetTheme: "light" | "dark", onComplete?: () => void) {
  if (typeof window !== "undefined") {
    try {
      playNovaThemeSound(targetTheme === "dark");
    } catch {}
    window.dispatchEvent(
      new CustomEvent<ThemeTransitionDetail>("novajournal_theme_transition", {
        detail: { targetTheme, onComplete },
      })
    );
  }
}

export function ThemeTransitionOverlay() {
  const { setTheme } = useTheme();
  const [active, setActive] = useState(false);
  const [targetTheme, setTargetTheme] = useState<"light" | "dark">("dark");
  const [stage, setStage] = useState<"enter" | "hold" | "exit">("enter");
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleTransitionEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeTransitionDetail>;
      if (!customEvent.detail) return;

      const nextTheme = customEvent.detail.targetTheme;
      setTargetTheme(nextTheme);
      setStage("enter");
      setActive(true);
      setOpacity(0);

      // Play sound immediately on transition trigger
      try {
        playNovaThemeSound(nextTheme === "dark");
      } catch {}

      // Smooth Fade-In
      requestAnimationFrame(() => {
        setTimeout(() => setOpacity(1), 20);
      });

      // Halfway point: swap actual theme underneath
      const midTimer = setTimeout(() => {
        setTheme(nextTheme);
        setStage("hold");
      }, 550);

      // Smooth Fade-Out trigger
      const exitTimer = setTimeout(() => {
        setStage("exit");
        setOpacity(0);
      }, 1250);

      // Complete & remove overlay
      const endTimer = setTimeout(() => {
        setActive(false);
        if (customEvent.detail.onComplete) {
          customEvent.detail.onComplete();
        }
      }, 1580);

      return () => {
        clearTimeout(midTimer);
        clearTimeout(exitTimer);
        clearTimeout(endTimer);
      };
    };

    window.addEventListener("novajournal_theme_transition", handleTransitionEvent);
    return () => window.removeEventListener("novajournal_theme_transition", handleTransitionEvent);
  }, [setTheme]);

  if (!active) return null;

  return (
    <div
      style={{ opacity }}
      className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-300 ease-in-out"
    >
      <style>{`
        /* Smooth, fast meteor streaks falling diagonally from top-right to bottom-left */
        @keyframes meteorShootDiagonal {
          0% {
            transform: translate3d(280px, -160px, 0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate3d(-560px, 320px, 0);
            opacity: 0;
          }
        }

        /* Celestial cartoon entrance */
        @keyframes cartoonPopRise {
          0% { transform: translateY(45px) scale(0.85); opacity: 0; }
          60% { transform: translateY(-6px) scale(1.04); opacity: 1; }
          80% { transform: translateY(2px) scale(0.98); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }

        /* Cartoon sunrays slow flat spin */
        @keyframes cartoonRaySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Gentle flat cloud floating */
        @keyframes cartoonFloatLeft {
          0% { transform: translateX(-35px); }
          50% { transform: translateX(35px); }
          100% { transform: translateX(-35px); }
        }
        @keyframes cartoonFloatRight {
          0% { transform: translateX(30px); }
          50% { transform: translateX(-30px); }
          100% { transform: translateX(30px); }
        }
      `}</style>

      {targetTheme === "dark" ? (
        <NightTransitionView stage={stage} />
      ) : (
        <DayTransitionView stage={stage} />
      )}
    </div>
  );
}

/* ========================================================================= */
/* NIGHT TRANSITION VIEW: Twilight Sky + Multi-Wave Staggered Meteors        */
/* ========================================================================= */
function NightTransitionView({ stage }: { stage: "enter" | "hold" | "exit" }) {
  // Staggered meteors across 3 distinct waves (kloter) across the screen
  const meteorWaves = [
    // Kloter 1: Fast initial wave across right-to-center
    { id: "k1-1", top: "12%", right: "8%", delay: "0.02s", dur: "0.72s", strokeW: 2.5, aura: "#38bdf8", len: 240 },
    { id: "k1-2", top: "22%", right: "28%", delay: "0.08s", dur: "0.75s", strokeW: 3, aura: "#fbbf24", len: 260 },
    { id: "k1-3", top: "34%", right: "48%", delay: "0.12s", dur: "0.70s", strokeW: 2.2, aura: "#c084fc", len: 220 },
    { id: "k1-4", top: "18%", right: "68%", delay: "0.16s", dur: "0.74s", strokeW: 2.8, aura: "#38bdf8", len: 250 },

    // Kloter 2: Secondary wave filling the middle sky
    { id: "k2-1", top: "28%", right: "15%", delay: "0.28s", dur: "0.72s", strokeW: 3, aura: "#fbbf24", len: 250 },
    { id: "k2-2", top: "42%", right: "35%", delay: "0.32s", dur: "0.76s", strokeW: 2.5, aura: "#38bdf8", len: 230 },
    { id: "k2-3", top: "15%", right: "55%", delay: "0.36s", dur: "0.70s", strokeW: 2.8, aura: "#c084fc", len: 240 },
    { id: "k2-4", top: "38%", right: "75%", delay: "0.40s", dur: "0.73s", strokeW: 2.2, aura: "#fbbf24", len: 220 },

    // Kloter 3: Final trailing wave
    { id: "k3-1", top: "20%", right: "22%", delay: "0.52s", dur: "0.70s", strokeW: 2.5, aura: "#38bdf8", len: 230 },
    { id: "k3-2", top: "36%", right: "42%", delay: "0.56s", dur: "0.74s", strokeW: 3, aura: "#c084fc", len: 260 },
    { id: "k3-3", top: "48%", right: "62%", delay: "0.60s", dur: "0.71s", strokeW: 2.6, aura: "#fbbf24", len: 240 },
  ];

  return (
    <div className="absolute inset-0 w-full h-full bg-linear-to-b from-[#060814] via-[#0d1326] via-45% via-[#1e1438] via-75% to-[#2d1130] flex flex-col items-center justify-center">
      {/* Background Twinkle Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: "10%", left: "12%", size: "w-1.5 h-1.5", delay: "0.2s" },
          { top: "20%", left: "24%", size: "w-1 h-1", delay: "0.5s" },
          { top: "16%", left: "76%", size: "w-2 h-2", delay: "0.1s" },
          { top: "32%", left: "84%", size: "w-1 h-1", delay: "0.7s" },
          { top: "26%", left: "46%", size: "w-1.5 h-1.5", delay: "0.4s" },
          { top: "45%", left: "16%", size: "w-1 h-1", delay: "0.3s" },
          { top: "54%", left: "86%", size: "w-1.5 h-1.5", delay: "0.6s" },
          { top: "14%", left: "58%", size: "w-1 h-1", delay: "0.8s" },
        ].map((star, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-amber-100 shadow-xs shadow-white animate-pulse ${star.size}`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Multi-Wave Falling Meteors (Top-Right to Bottom-Left) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {meteorWaves.map((m) => (
          <div
            key={m.id}
            className="absolute"
            style={{
              top: m.top,
              right: m.right,
              animation: `meteorShootDiagonal ${m.dur} cubic-bezier(0.12, 0.72, 0.24, 1) ${m.delay} forwards`,
            }}
          >
            <svg className="overflow-visible" style={{ width: `${m.len}px`, height: `${m.len * 0.58}px` }} viewBox="0 0 240 140">
              <defs>
                <linearGradient id={`mGrad-${m.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="60%" stopColor={m.aura} stopOpacity="0.45" />
                  <stop offset="90%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Trailing tail from top-right down to bottom-left */}
              <line
                x1="220"
                y1="12"
                x2="20"
                y2="128"
                stroke={`url(#mGrad-${m.id})`}
                strokeWidth={m.strokeW}
                strokeLinecap="round"
              />
              {/* Glowing leading head at bottom-left front */}
              <circle
                cx="20"
                cy="128"
                r={m.strokeW + 1}
                fill="#ffffff"
                style={{ filter: `drop-shadow(0 0 10px ${m.aura})` }}
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Flat Mountain Horizon Silhouette at Dusk */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-36 opacity-90 pointer-events-none">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full fill-[#070914]">
          <path d="M0,224L60,208C120,192,240,160,360,170.7C480,181,600,235,720,229.3C840,224,960,160,1080,165.3C1200,171,1320,245,1380,282.7L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>

      {/* Center Celestial Moon */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: "cartoonPopRise 0.85s cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards" }}
      >
        {/* Soft Moon Halo */}
        <div className="absolute w-48 h-48 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />

        {/* Yellow Crescent Moon */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-[0_0_24px_rgba(251,191,36,0.9)]">
            <path
              d="M50 10 A40 40 0 1 0 90 50 A30 30 0 1 1 50 10 Z"
              fill="url(#moonGlowGradient)"
            />
            <circle cx="36" cy="48" r="3" fill="#d97706" opacity="0.3" />
            <circle cx="44" cy="62" r="4.5" fill="#d97706" opacity="0.25" />
            <circle cx="30" cy="36" r="2.5" fill="#d97706" opacity="0.25" />
            <defs>
              <linearGradient id="moonGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="60%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Night Clouds */}
        <div
          className="relative -mt-4 w-72 h-14 opacity-85"
          style={{ animation: "cartoonFloatLeft 4s ease-in-out infinite" }}
        >
          <svg viewBox="0 0 200 60" className="w-full h-full fill-slate-900/90 drop-shadow-md">
            <path d="M20,40 Q25,18 48,22 Q58,8 80,18 Q92,12 108,22 Q124,8 145,20 Q160,12 172,28 Q185,22 190,44 Q160,54 20,40 Z" />
          </svg>
        </div>

        {/* Text Badge */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-bold tracking-wide flex items-center gap-2 shadow-2xl">
          <span>🌙</span>
          <span>Cosmic Twilight • Dark Mode</span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* DAY TRANSITION VIEW: Flat Cartoon Style Sun + Rolling Hills               */
/* ========================================================================= */
function DayTransitionView({ stage }: { stage: "enter" | "hold" | "exit" }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-linear-to-b from-[#38bdf8] via-[#7dd3fc] via-50% to-[#fef08a] flex flex-col items-center justify-center">
      {/* Flat Cartoon Clouds floating across the sky */}
      <div
        className="absolute top-[14%] left-[6%] w-72 h-20 opacity-80 pointer-events-none"
        style={{ animation: "cartoonFloatLeft 6s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 200 60" className="w-full h-full fill-white">
          <circle cx="45" cy="35" r="20" />
          <circle cx="75" cy="25" r="24" />
          <circle cx="110" cy="22" r="26" />
          <circle cx="145" cy="32" r="22" />
          <rect x="45" y="32" width="100" height="20" rx="8" />
        </svg>
      </div>

      <div
        className="absolute top-[22%] right-[8%] w-80 h-24 opacity-85 pointer-events-none"
        style={{ animation: "cartoonFloatRight 5s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 220 70" className="w-full h-full fill-white/90">
          <circle cx="50" cy="42" r="22" />
          <circle cx="85" cy="30" r="26" />
          <circle cx="125" cy="26" r="30" />
          <circle cx="165" cy="38" r="24" />
          <rect x="50" y="38" width="115" height="24" rx="10" />
        </svg>
      </div>

      {/* Flat Cartoon Rolling Hills at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-36 pointer-events-none">
        {/* Back Hill - Flat Mint Green */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full fill-[#34d399]">
          <path d="M0,130 C340,60 520,150 780,100 C1020,50 1240,140 1440,90 L1440,220 L0,220 Z" />
        </svg>
        {/* Front Hill - Flat Emerald Green */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full fill-[#10b981]">
          <path d="M0,160 C380,100 620,180 920,120 C1160,80 1340,140 1440,110 L1440,220 L0,220 Z" />
        </svg>
      </div>

      {/* Center Flat Cartoon Sun Container */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: "cartoonPopRise 0.85s cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards" }}
      >
        {/* Flat Cartoon Sun with Petal Rays */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Rotating Flat Cartoon Rays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ animation: "cartoonRaySpin 20s linear infinite" }}
          >
            <svg viewBox="0 0 140 140" className="w-full h-full">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 70 70)`}>
                  {/* Clean rounded cartoon capsule ray */}
                  <rect
                    x="64"
                    y="6"
                    width="12"
                    height="22"
                    rx="6"
                    fill="#F59E0B"
                  />
                  <rect
                    x="66"
                    y="9"
                    width="8"
                    height="16"
                    rx="4"
                    fill="#FDE047"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Solid Flat Cartoon Sun Disk */}
          <div className="relative w-24 h-24 rounded-full bg-[#FBBF24] border-4 border-[#F59E0B] flex items-center justify-center shadow-md">
            {/* Cute Flat Cartoon Face */}
            <div className="flex flex-col items-center justify-center select-none pointer-events-none">
              <div className="flex items-center gap-4 mb-1">
                {/* Cheerful curve eyes */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#78350F]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#78350F]" />
              </div>
              {/* Cute smile */}
              <div className="w-4 h-2 rounded-b-full border-b-2 border-[#78350F]" />
              {/* Cheerful blush */}
              <div className="absolute top-11 flex justify-between w-14 px-1">
                <div className="w-2.5 h-1.5 rounded-full bg-[#F87171]/70" />
                <div className="w-2.5 h-1.5 rounded-full bg-[#F87171]/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Fluffy Front Cartoon Cloud */}
        <div
          className="relative -mt-3 w-64 h-14 pointer-events-none"
          style={{ animation: "cartoonFloatRight 4s ease-in-out infinite" }}
        >
          <svg viewBox="0 0 180 50" className="w-full h-full fill-white drop-shadow-sm">
            <circle cx="36" cy="32" r="16" />
            <circle cx="64" cy="22" r="20" />
            <circle cx="96" cy="18" r="22" />
            <circle cx="128" cy="26" r="18" />
            <rect x="36" y="24" width="92" height="18" rx="8" />
          </svg>
        </div>

        {/* Flat Cartoon Text Badge */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white border-2 border-amber-300 text-amber-900 text-xs font-black tracking-wide flex items-center gap-2 shadow-lg">
          <span>☀️</span>
          <span>Cerah Siang • Light Mode</span>
        </div>
      </div>
    </div>
  );
}

export default ThemeTransitionOverlay;
