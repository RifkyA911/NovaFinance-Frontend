"use client";

import React, { useMemo } from "react";

export type FluidPalette = "cosmic" | "blue" | "purple" | "emerald" | "amber" | "rose" | "cyan";

interface SectionFluidBackdropProps {
  palette?: FluidPalette;
  className?: string;
}

interface PaletteTheme {
  primary: string;
  glow: string;
  tailGradient: string;
  dotColor: string;
}

const PALETTE_THEMES: Record<FluidPalette, PaletteTheme> = {
  cosmic: {
    primary: "#c084fc",
    glow: "rgba(192, 132, 252, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(147, 51, 234, 0.2) 30%, rgba(192, 132, 252, 0.6) 85%, #e9d5ff 100%)",
    dotColor: "rgba(192, 132, 252, 0.45)",
  },
  blue: {
    primary: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(59, 130, 246, 0.2) 30%, rgba(96, 165, 250, 0.6) 85%, #dbeafe 100%)",
    dotColor: "rgba(96, 165, 250, 0.45)",
  },
  purple: {
    primary: "#c084fc",
    glow: "rgba(192, 132, 252, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(168, 85, 247, 0.2) 30%, rgba(192, 132, 252, 0.6) 85%, #f3e8ff 100%)",
    dotColor: "rgba(192, 132, 252, 0.45)",
  },
  emerald: {
    primary: "#34d399",
    glow: "rgba(52, 211, 153, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.2) 30%, rgba(52, 211, 153, 0.6) 85%, #d1fae5 100%)",
    dotColor: "rgba(52, 211, 153, 0.45)",
  },
  amber: {
    primary: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(245, 158, 11, 0.2) 30%, rgba(251, 191, 36, 0.6) 85%, #fef3c7 100%)",
    dotColor: "rgba(251, 191, 36, 0.45)",
  },
  rose: {
    primary: "#fb7185",
    glow: "rgba(251, 113, 133, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(244, 63, 94, 0.2) 30%, rgba(251, 113, 133, 0.6) 85%, #ffe4e6 100%)",
    dotColor: "rgba(251, 113, 133, 0.45)",
  },
  cyan: {
    primary: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.3)",
    tailGradient: "linear-gradient(to right, transparent 0%, rgba(6, 182, 212, 0.2) 30%, rgba(34, 211, 238, 0.6) 85%, #cffafe 100%)",
    dotColor: "rgba(34, 211, 238, 0.45)",
  },
};

// Deterministic seed helper
function pseudoRand(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export default function SectionFluidBackdrop({
  palette = "cosmic",
  className = "",
}: SectionFluidBackdropProps) {
  const theme = PALETTE_THEMES[palette] || PALETTE_THEMES.cosmic;

  // 80 calm, larger twinkling star dots
  const dots = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => {
      const top = (pseudoRand(i * 5 + 1) * 96 + 2).toFixed(2);
      const left = (pseudoRand(i * 5 + 2) * 96 + 2).toFixed(2);
      // Increased size: 2.5px to 5px
      const size = (pseudoRand(i * 5 + 3) * 2.5 + 2.5).toFixed(1);
      // Gentle calm breathing duration
      const duration = (pseudoRand(i * 5 + 4) * 5 + 5).toFixed(1);
      const delay = (pseudoRand(i * 5 + 5) * 8).toFixed(1);
      const maxOp = (pseudoRand(i * 5 + 6) * 0.28 + 0.14).toFixed(2);

      return { id: i, top, left, size, duration, delay, maxOp };
    });
  }, []);

  // Meteors: Downward diagonal trajectories (falling down-left: angle ~135°, dy > 0, dx < 0)
  // No circular head, purely smooth gradient line strokes, slow and calm duration, reduced subtle opacity
  const meteors = useMemo(() => {
    return [
      { id: 1, top: "-8%", left: "85%", angle: 136, travel: 950, length: 190, stroke: 2.4, duration: 18, delay: 1.0, maxOp: 0.22 },
      { id: 2, top: "8%", left: "102%", angle: 132, travel: 1050, length: 240, stroke: 2.8, duration: 21, delay: 5.8, maxOp: 0.18 },
      { id: 3, top: "-4%", left: "55%", angle: 138, travel: 880, length: 160, stroke: 2.0, duration: 17, delay: 11.2, maxOp: 0.20 },
      { id: 4, top: "25%", left: "95%", angle: 134, travel: 980, length: 220, stroke: 2.6, duration: 23, delay: 3.4, maxOp: 0.16 },
      { id: 5, top: "12%", left: "70%", angle: 140, travel: 920, length: 180, stroke: 2.2, duration: 19, delay: 15.6, maxOp: 0.21 },
      { id: 6, top: "-10%", left: "98%", angle: 135, travel: 1100, length: 250, stroke: 3.0, duration: 24, delay: 8.9, maxOp: 0.19 },
      { id: 7, top: "35%", left: "88%", angle: 133, travel: 860, length: 150, stroke: 2.0, duration: 20, delay: 19.3, maxOp: 0.17 },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}
    >
      <style>{`
        @keyframes calmDownwardMeteorGlide {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          8% {
            opacity: var(--meteor-max-opacity, 0.2);
          }
          40% {
            opacity: var(--meteor-max-opacity, 0.2);
          }
          75% {
            opacity: 0;
            transform: translate3d(var(--meteor-dx), var(--meteor-dy), 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--meteor-dx), var(--meteor-dy), 0);
          }
        }

        @keyframes calmDotBreathe {
          0%, 100% {
            opacity: 0.08;
            transform: scale(0.92);
          }
          50% {
            opacity: var(--dot-max-opacity, 0.35);
            transform: scale(1.12);
          }
        }
      `}</style>

      {/* Field of 80 Plentiful, Larger Soft Dots */}
      <div className="absolute inset-0">
        {dots.map((d) => (
          <span
            key={d.id}
            className="absolute rounded-full"
            style={{
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              backgroundColor: theme.primary,
              boxShadow: `0 0 5px ${theme.glow}`,
              animation: `calmDotBreathe ${d.duration}s ease-in-out ${d.delay}s infinite`,
              // @ts-expect-error custom CSS property
              "--dot-max-opacity": d.maxOp,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Meteors: Pure Gradient Tail Falling Downward-Left, Zero Head Circles */}
      <div className="absolute inset-0">
        {meteors.map((m) => {
          const rad = (m.angle * Math.PI) / 180;
          // In screen coordinates: angle ~135° has cos < 0 (left) and sin > 0 (downwards!)
          const dx = Math.round(Math.cos(rad) * m.travel);
          const dy = Math.round(Math.sin(rad) * m.travel);
          return (
            <div
              key={m.id}
              className="absolute"
              style={{
                top: m.top,
                left: m.left,
                // @ts-expect-error custom CSS properties
                "--meteor-dx": `${dx}px`,
                "--meteor-dy": `${dy}px`,
                "--meteor-max-opacity": m.maxOp,
                animation: `calmDownwardMeteorGlide ${m.duration}s cubic-bezier(0.18, 0.9, 0.35, 1) ${m.delay}s infinite`,
                willChange: "transform, opacity",
              }}
            >
              {/* Pure Streak Tail (no head circle): Rotated along trajectory vector */}
              <div
                style={{
                  transform: `rotate(${m.angle}deg)`,
                  transformOrigin: "right center",
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${m.length}px`,
                    height: `${m.stroke}px`,
                    background: theme.tailGradient,
                    filter: `drop-shadow(0 0 3px ${theme.glow})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Star Dust Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-25" />
    </div>
  );
}
