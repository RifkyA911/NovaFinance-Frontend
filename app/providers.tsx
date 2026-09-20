"use client";

import React, { useEffect } from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { QueryClientProvider } from "./providers/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const savedPalette = localStorage.getItem("novafinance_theme_palette") || localStorage.getItem("novajournal_theme_palette") || "blue";
      document.documentElement.setAttribute("data-palette", savedPalette);

      const handlePaletteChange = (e: any) => {
        const pal = e.detail || localStorage.getItem("novafinance_theme_palette") || localStorage.getItem("novajournal_theme_palette") || "blue";
        document.documentElement.setAttribute("data-palette", pal);
      };

      window.addEventListener("novafinance_palette_changed", handlePaletteChange);
      window.addEventListener("novajournal_palette_changed", handlePaletteChange);
      return () => {
        window.removeEventListener("novafinance_palette_changed", handlePaletteChange);
        window.removeEventListener("novajournal_palette_changed", handlePaletteChange);
      };
    } catch {}
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="system">
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
