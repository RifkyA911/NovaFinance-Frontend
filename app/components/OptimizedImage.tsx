"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

/**
 * OptimizedImage
 * Enterprise Next.js Image wrapper providing:
 * - High-density anti-aliased scaling (eliminates pixelated/blurry downsampling)
 * - Auto-detection of data:/blob:/SVG URIs with unoptimized mode
 * - Graceful fallback on broken URLs or load errors
 */
export default function OptimizedImage({
  src,
  alt,
  width = 36,
  height = 36,
  className = "",
  fill = false,
  priority = false,
  unoptimized,
  fallbackIcon,
  fallbackText,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no source or error occurred, render fallback
  if (!src || hasError) {
    if (fallbackIcon) {
      return (
        <div
          className={`flex items-center justify-center bg-default-100 dark:bg-default-800 text-default-500 shrink-0 select-none ${className}`}
          style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
        >
          {fallbackIcon}
        </div>
      );
    }
    if (fallbackText) {
      return (
        <div
          className={`flex items-center justify-center bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shrink-0 select-none ${className}`}
          style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
        >
          {fallbackText.slice(0, 2).toUpperCase()}
        </div>
      );
    }
    return null;
  }

  const isDataUri = src.startsWith("data:") || src.startsWith("blob:");
  const isSvg = src.endsWith(".svg") || src.includes("data:image/svg+xml");
  const isLocalOrPrivate = src.includes("localhost") || src.includes("127.0.0.1");
  const shouldSkipOptimization = unoptimized ?? (isDataUri || isSvg || isLocalOrPrivate);

  return (
    <div
      className={`relative overflow-hidden shrink-0 transform-gpu antialiased select-none ${className}`}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        unoptimized={shouldSkipOptimization}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-200"
        style={{
          imageRendering: "smooth",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}
