"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import { playNovaThemeSound, playSoftChime } from "@/app/lib/sound";

declare global {
  interface Window {
    __novafinance_supernova_played?: boolean;
  }
}

interface NovaSupernovaOverlayProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function NovaSupernovaOverlay({
  onComplete,
  forceShow = false,
}: NovaSupernovaOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"ignite" | "burst" | "resolve" | "exit">("ignite");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // If not forced and user specifically skipped in this page view, exit
    if (typeof window !== "undefined" && !forceShow) {
      const alreadyPlayed = window.__novafinance_supernova_played;
      if (alreadyPlayed) {
        onComplete?.();
        return;
      }
      window.__novafinance_supernova_played = true;
    }

    setVisible(true);

    // Play smooth cosmic entry sound
    try {
      playSoftChime();
    } catch {}

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8 + 4);
      });
    }, 45);

    // Phases
    const t1 = setTimeout(() => {
      setPhase("burst");
      try {
        playNovaThemeSound(true);
      } catch {}
    }, 450);

    const t2 = setTimeout(() => {
      setPhase("resolve");
    }, 1100);

    const t3 = setTimeout(() => {
      handleDismiss();
    }, 1900);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [forceShow]);

  // Particle Canvas Animation
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particles setup
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6;
      return {
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 2.5,
        color: [
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#06b6d4",
          "#f59e0b",
        ][Math.floor(Math.random() * 5)],
        alpha: 0.9,
        life: 0,
        maxLife: 60 + Math.random() * 50,
      };
    });

    let ringRadius = 10;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Expanding Cosmic Shockwave Ring
      ringRadius += 3.8;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();

      // Outer secondary ring
      if (ringRadius > 40) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, ringRadius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw & update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [visible]);

  const handleDismiss = () => {
    setPhase("exit");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("novafinance_supernova_seen", "true");
    }
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 450);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 text-white cursor-pointer select-none transition-all duration-500 overflow-hidden ${
        phase === "exit"
          ? "opacity-0 scale-105 pointer-events-none filter blur-sm"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Cosmic Fluid Radial Glows */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className={`w-96 h-96 rounded-full bg-linear-to-tr from-blue-600/40 via-purple-600/40 to-pink-500/30 blur-3xl transition-transform duration-1000 ${
            phase === "burst" ? "scale-150 opacity-90" : "scale-75 opacity-50"
          }`}
        />
        <div className="absolute w-64 h-64 rounded-full bg-cyan-400/20 blur-2xl animate-pulse" />
      </div>

      {/* Center Supernova Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Glowing Crest */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 border border-white/20 transition-all duration-700 transform ${
            phase === "ignite"
              ? "scale-50 opacity-0 rotate-12"
              : "scale-100 opacity-100 rotate-0"
          }`}
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin-slow" />
        </div>

        {/* Brand Name */}
        <h1
          className={`text-2xl sm:text-4xl font-extrabold tracking-widest bg-linear-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent mt-5 transition-all duration-700 ${
            phase === "ignite" ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          NOVAFINANCE
        </h1>

        {/* Dynamic Subtitle */}
        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono tracking-wider text-purple-300">
          <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>AUTONOMOUS FINANCIAL INTELLIGENCE</span>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-75"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Skip Hint */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="mt-6 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-white/5"
        >
          <span>Klik layar untuk lewati</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
