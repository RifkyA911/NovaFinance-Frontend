"use client";

import React from "react";

export default function HeroCircularStarTrails() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-5 flex items-center justify-center"
    >
      <style>{`
        @keyframes centralOrbitCW {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes centralOrbitCCW {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes centralPulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.04);
          }
        }
      `}</style>

      {/* ============================================================ */}
      {/* SINGLE CENTERED CIRCULAR STAR TRAIL ORBIT SYSTEM              */}
      {/* Pure line stroke arcs with differentiated opacity gradients   */}
      {/* Zero meteor head / dots - just smooth thick strokes that fade */}
      {/* ============================================================ */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] sm:w-[720px] sm:h-[720px] md:w-[860px] md:h-[860px] flex items-center justify-center">
        
        {/* Soft Ambient Core Glow */}
        <div
          className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-linear-to-tr from-blue-600/15 via-purple-600/15 to-transparent blur-3xl pointer-events-none"
          style={{ animation: "centralPulseGlow 9s ease-in-out infinite" }}
        />

        {/* 1. Outermost Thick Star Trail Ring Arc (~840px) */}
        <svg
          viewBox="0 0 840 840"
          className="absolute w-full h-full"
          style={{ animation: "centralOrbitCW 58s linear infinite" }}
        >
          <defs>
            <linearGradient id="starTrailGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="420"
            cy="420"
            r="410"
            fill="none"
            stroke="url(#starTrailGrad1)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="560 720"
            className="opacity-80 dark:opacity-75"
          />
        </svg>

        {/* 2. Middle-Outer Dynamic Star Trail Arc (~660px) */}
        <svg
          viewBox="0 0 660 660"
          className="absolute w-[80%] h-[80%]"
          style={{ animation: "centralOrbitCCW 44s linear infinite" }}
        >
          <defs>
            <linearGradient id="starTrailGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="330"
            cy="330"
            r="320"
            fill="none"
            stroke="url(#starTrailGrad2)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="420 580"
            className="opacity-75 dark:opacity-70"
          />
        </svg>

        {/* 3. Mid-Inner Counter-Orbiting Star Trail Arc (~500px) */}
        <svg
          viewBox="0 0 500 500"
          className="absolute w-[60%] h-[60%]"
          style={{ animation: "centralOrbitCW 32s linear infinite" }}
        >
          <defs>
            <linearGradient id="starTrailGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="250"
            cy="250"
            r="242"
            fill="none"
            stroke="url(#starTrailGrad3)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="320 440"
            className="opacity-70 dark:opacity-65"
          />
        </svg>

        {/* 4. Inner Orbit Micro-Ring (~340px) */}
        <svg
          viewBox="0 0 340 340"
          className="absolute w-[42%] h-[42%]"
          style={{ animation: "centralOrbitCCW 24s linear infinite" }}
        >
          <defs>
            <linearGradient id="starTrailGrad4" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="170"
            cy="170"
            r="164"
            fill="none"
            stroke="url(#starTrailGrad4)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="210 300"
            className="opacity-60 dark:opacity-55"
          />
        </svg>

      </div>
    </div>
  );
}
