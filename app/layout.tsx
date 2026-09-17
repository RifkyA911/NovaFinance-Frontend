import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "../contexts/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NovaJournal — Platform Manajemen Keuangan & Pembukuan Modern",
    template: "%s | NovaJournal",
  },
  description:
    "NovaJournal adalah platform pencatatan keuangan pribadi dan pembukuan UMKM/PT modern dengan integrasi Multi-Provider AI (Groq & Gemini), visualisasi money flow, portofolio investasi global IHSG & S&P 500, dan TanStack Table enterprise.",
  keywords: [
    "aplikasi keuangan pribadi",
    "pembukuan umkm",
    "personal finance",
    "money flow visualizer",
    "wealth portfolio tracker",
    "ihsg composite",
    "s&p 500",
    "ai financial advisor",
    "tanstack table",
    "budgeting app indonesia",
  ],
  authors: [{ name: "NovaJournal Team" }],
  creator: "NovaJournal",
  publisher: "NovaJournal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://novajournal.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NovaJournal — Platform Manajemen Keuangan & Pembukuan Modern",
    description:
      "Kelola keuangan pribadi, bisnis UMKM, dan portofolio investasi dengan visualisasi arus kas interaktif dan asisten AI pintar.",
    url: "https://novajournal.app",
    siteName: "NovaJournal",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaJournal — Platform Manajemen Keuangan & Pembukuan Modern",
    description:
      "Kelola keuangan pribadi, bisnis UMKM, dan portofolio investasi dengan visualisasi arus kas interaktif dan asisten AI pintar.",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((reg) => {
                    reg.update();
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
