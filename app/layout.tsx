import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NovaFinance — Platform Manajemen Keuangan & Pembukuan Modern",
    template: "%s | NovaFinance",
  },
  description:
    "NovaFinance adalah platform pencatatan keuangan pribadi dan pembukuan UMKM/PT modern dengan integrasi Multi-Provider AI (Groq & Gemini), visualisasi money flow, portofolio investasi global IHSG & S&P 500, dan TanStack Table enterprise.",
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
  authors: [{ name: "NovaFinance Team" }],
  creator: "NovaFinance",
  publisher: "NovaFinance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://novafinance.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NovaFinance — Platform Manajemen Keuangan & Pembukuan Modern",
    description:
      "Kelola keuangan pribadi, bisnis UMKM, dan portofolio investasi dengan visualisasi arus kas interaktif dan asisten AI pintar.",
    url: "https://novafinance.app",
    siteName: "NovaFinance",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaFinance — Platform Manajemen Keuangan & Pembukuan Modern",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var palette = localStorage.getItem('novajournal_theme_palette') || 'blue';
                  document.documentElement.setAttribute('data-palette', palette);
                  var customHex = localStorage.getItem('novajournal_custom_hex');
                  if (customHex && palette === 'custom') {
                    document.documentElement.style.setProperty('--primary-color', customHex);
                    document.documentElement.style.setProperty('--primary-hover', customHex);
                  }

                  var navDen = localStorage.getItem('novajournal_navbar_density');
                  var navHCustom = localStorage.getItem('novajournal_navbar_height_custom');
                  var navH = 56;
                  if (navDen === 'compact') navH = 48;
                  else if (navDen === 'comfortable') navH = 56;
                  else if (navDen === 'spacious') navH = 64;
                  else if (navHCustom) navH = Number(navHCustom) || 56;
                  document.documentElement.style.setProperty('--navbar-height', navH + 'px');

                  var sideDen = localStorage.getItem('novajournal_sidebar_density');
                  var sideWCustom = localStorage.getItem('novajournal_sidebar_width_custom');
                  var sideW = 224;
                  if (sideDen === 'compact') sideW = 200;
                  else if (sideDen === 'comfortable') sideW = 224;
                  else if (sideDen === 'spacious') sideW = 260;
                  else if (sideWCustom) sideW = Number(sideWCustom) || 224;
                  document.documentElement.style.setProperty('--sidebar-width', sideW + 'px');

                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      for (var i = 0; i < regs.length; i++) {
                        regs[i].unregister();
                      }
                    });
                  }
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (var i = 0; i < names.length; i++) {
                        caches.delete(names[i]);
                      }
                    });
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
