"use client";

import React, { useEffect, useRef } from "react";

interface TrailStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  speed: number;
  baseAngle: number;
  curveSpeed: number;
  color: string;
  glow: string;
  maxAlpha: number;
  life: number;
  maxLife: number;
  history: Array<{ x: number; y: number }>;
}

export default function NovaCosmicStarTrails() {
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!leftCanvas || !rightCanvas) return;

    const leftCtx = leftCanvas.getContext("2d");
    const rightCtx = rightCanvas.getContext("2d");
    if (!leftCtx || !rightCtx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const COLORS = [
      { core: "#ffffff", glow: "rgba(168, 85, 247, 0.45)" }, // Purple
      { core: "#ffffff", glow: "rgba(59, 130, 246, 0.45)" },  // Blue
      { core: "#ffffff", glow: "rgba(6, 182, 212, 0.45)" },   // Cyan
      { core: "#ffffff", glow: "rgba(236, 72, 153, 0.40)" },  // Pink
      { core: "#ffffff", glow: "rgba(245, 158, 11, 0.40)" },  // Amber
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(window.innerWidth * 0.15, 160);
      const h = window.innerHeight;

      width = w;
      height = h;

      [leftCanvas, rightCanvas].forEach((c) => {
        c.width = w * dpr;
        c.height = h * dpr;
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      });

      leftCtx.scale(dpr, dpr);
      rightCtx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const createStar = (side: "left" | "right"): TrailStar => {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const speed = 0.8 + Math.random() * 1.4; // Calm, gentle velocity
      // Inward diagonal drift: left drifts right-down, right drifts left-down
      const angle =
        side === "left"
          ? (Math.PI / 4) + (Math.random() - 0.5) * 0.35 // ~45 deg
          : (3 * Math.PI / 4) + (Math.random() - 0.5) * 0.35; // ~135 deg

      const startX = side === "left" ? Math.random() * width * 0.5 : width * 0.5 + Math.random() * width * 0.5;
      const startY = Math.random() * height * 0.3 - 50;

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 14 + Math.floor(Math.random() * 10), // history frames
        speed,
        baseAngle: angle,
        curveSpeed: (Math.random() - 0.5) * 0.015,
        color: col.core,
        glow: col.glow,
        maxAlpha: 0.28 + Math.random() * 0.18, // Calm contrast
        life: 0,
        maxLife: 200 + Math.random() * 180,
        history: [],
      };
    };

    // 5 stars on left, 5 stars on right
    let leftStars = Array.from({ length: 5 }, () => createStar("left"));
    let rightStars = Array.from({ length: 5 }, () => createStar("right"));

    const updateAndDraw = (
      ctx: CanvasRenderingContext2D,
      stars: TrailStar[],
      side: "left" | "right"
    ) => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star, idx) => {
        star.life++;

        // Calm vector wander
        const currentAngle = star.baseAngle + Math.sin(star.life * 0.02) * 0.2;
        star.vx = Math.cos(currentAngle) * star.speed;
        star.vy = Math.sin(currentAngle) * star.speed;

        star.x += star.vx;
        star.y += star.vy;

        // Track history for smooth trail ribbon
        star.history.unshift({ x: star.x, y: star.y });
        if (star.history.length > star.length) {
          star.history.pop();
        }

        // Fade envelope: smooth fade-in, calm flight, smooth fade-out
        let progress = star.life / star.maxLife;
        let alpha = star.maxAlpha;
        if (progress < 0.15) {
          alpha = (progress / 0.15) * star.maxAlpha;
        } else if (progress > 0.75) {
          alpha = ((1 - progress) / 0.25) * star.maxAlpha;
        }

        // Draw Star Trail Curve
        if (star.history.length > 1) {
          ctx.save();
          for (let i = 0; i < star.history.length - 1; i++) {
            const p1 = star.history[i];
            const p2 = star.history[i + 1];
            const segAlpha = alpha * (1 - i / star.history.length);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = star.glow;
            ctx.globalAlpha = Math.max(0, segAlpha);
            ctx.lineWidth = Math.max(1, 2.4 * (1 - i / star.history.length));
            ctx.lineCap = "round";
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Leading Star Nucleus
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, alpha * 1.2);
        ctx.shadowColor = star.glow;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Respawn if off-screen or end of life
        if (
          star.y > height + 40 ||
          star.x < -40 ||
          star.x > width + 40 ||
          star.life >= star.maxLife
        ) {
          stars[idx] = createStar(side);
        }
      });
    };

    const loop = () => {
      updateAndDraw(leftCtx, leftStars, "left");
      updateAndDraw(rightCtx, rightStars, "right");
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Left Cosmic Star Trail Rail */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 bottom-0 pointer-events-none z-30 select-none overflow-hidden"
        style={{ width: "clamp(60px, 12vw, 160px)" }}
      >
        <canvas ref={leftCanvasRef} className="w-full h-full block" />
      </div>

      {/* Right Cosmic Star Trail Rail */}
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 bottom-0 pointer-events-none z-30 select-none overflow-hidden"
        style={{ width: "clamp(60px, 12vw, 160px)" }}
      >
        <canvas ref={rightCanvasRef} className="w-full h-full block" />
      </div>
    </>
  );
}
