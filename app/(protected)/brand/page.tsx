/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
} from "@heroui/react";
import {
  Crown,
  Sparkles,
  Building2,
  Lock,
  Upload,
  Check,
  Globe,
  FileText,
  Save,
  Eye,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { mutationFunctions } from "@/app/lib/queries";
import { playSoftChime, playNovaSpaceSound, playRealisticClick, playNovaSuccessSound, playNovaErrorSound } from "@/app/lib/sound";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { executeSettingsAction } from "@/app/lib/settingsNotifier";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

const BRAND_SECTIONS = [
  { id: "identity", name: "1. Logo & Identitas Brand", shortName: "Identitas", icon: Building2, color: "#8b5cf6" },
  { id: "display", name: "2. Preferensi Tampilan Sidebar", shortName: "Sidebar", icon: Sliders, color: "#3b82f6" },
  { id: "preview", name: "3. Pratinjau Navigasi Korporat", shortName: "Pratinjau", icon: Eye, color: "#10b981" },
];

export default function CompanyBrandPage() {
  const router = useRouter();
  const { selectedWorkspace, refreshWorkspaces } = useWorkspace();
  const { lang, t, isId } = useIntlLanguage();

  // Notification Banner
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? (isId ? "Peringatan Brand" : "Brand Warning") : (isId ? "Brand Diperbarui" : "Brand Updated"),
      description: msg,
    });
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Tier Mode
  const planTier = ((selectedWorkspace as any)?.planTier || "pro").toLowerCase() as "basic" | "pro" | "enterprise";
  const [overrideEnterprise, setOverrideEnterprise] = useState(false);
  const isEnterprise = planTier === "enterprise" || overrideEnterprise;
  const [upgradingEnterprise, setUpgradingEnterprise] = useState(false);

  // Brand Form States
  const [customBrandName, setCustomBrandName] = useState("");
  const [customBrandJargon, setCustomBrandJargon] = useState("");
  const [customBrandDescription, setCustomBrandDescription] = useState("");
  const [customBrandLogo, setCustomBrandLogo] = useState("");
  const [customBrandMode, setCustomBrandMode] = useState<"square" | "wide">("square");
  const [customBrandDisplay, setCustomBrandDisplay] = useState<"logo-and-text" | "logo-only" | "full-banner">("logo-and-text");
  const [brandLogoWidth, setBrandLogoWidth] = useState(140);
  const [brandLogoPlacement, setBrandLogoPlacement] = useState<"left" | "center" | "right">("left");
  const [isWideSettingsModalOpen, setIsWideSettingsModalOpen] = useState(false);
  const [entityType, setEntityType] = useState("PT");
  const [taxId, setTaxId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Crop / Upload Modal States for Brand Logo
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<"square" | "wide">("square");
  const [imageNatSize, setImageNatSize] = useState<{ w: number; h: number }>({ w: 400, h: 400 });
  const [logoZoom, setLogoZoom] = useState(1);
  const [logoPanX, setLogoPanX] = useState(0);
  const [logoPanY, setLogoPanY] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fileFormatName, setFileFormatName] = useState("PNG");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sidebar Brand Badge & Display Controls
  const [showSidebarBrandBadge, setShowSidebarBrandBadge] = useState(true);
  const [sidebarBrandDisplayMode, setSidebarBrandDisplayMode] = useState<"full" | "icon">("full");
  const [brandBadgeStyle, setBrandBadgeStyle] = useState<"full" | "icon-only">("full");

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Anchor & Folding State
  const [activeSectionId, setActiveSectionId] = useState("identity");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    identity: false,
    display: false,
    preview: false,
  });

  const toggleFold = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllFolded = Object.values(foldedSections).every(Boolean);
  const toggleAllSections = () => {
    playSoftChime();
    const nextState = !areAllFolded;
    setFoldedSections({
      identity: nextState,
      display: nextState,
      preview: nextState,
    });
  };

  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = BRAND_SECTIONS[0].id;
      for (const sec of BRAND_SECTIONS) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            currentSecId = sec.id;
          }
        }
      }

      const scrollHeight = isWindow ? document.documentElement.scrollHeight : (container as HTMLElement).scrollHeight;
      const clientHeight = isWindow ? window.innerHeight : (container as HTMLElement).clientHeight;
      const currentScroll = isWindow ? window.scrollY : (container as HTMLElement).scrollTop;

      if (currentScroll + clientHeight >= scrollHeight - 60) {
        currentSecId = BRAND_SECTIONS[BRAND_SECTIONS.length - 1].id;
      }

      setActiveSectionId(currentSecId);
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSectionId(id);
      }
    }, 50);
  };

  const activeSec = BRAND_SECTIONS.find((s) => s.id === activeSectionId) || BRAND_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  // Load preferences from workspace and localStorage
  useEffect(() => {
    if (selectedWorkspace) {
      const ws = selectedWorkspace as any;
      setCustomBrandName(ws.customBrandName || "");
      setCustomBrandJargon(ws.customBrandJargon || "");
      setCustomBrandDescription(ws.customBrandDescription || "");
      const savedLogo = localStorage.getItem("novajournal_custom_brand_logo");
      setCustomBrandLogo(ws.customBrandLogo || savedLogo || "");
      if (ws.customBrandMode === "wide" || ws.customBrandMode === "square") {
        setCustomBrandMode(ws.customBrandMode);
      }
      if (ws.customBrandDisplay === "logo-and-text" || ws.customBrandDisplay === "logo-only" || ws.customBrandDisplay === "full-banner") {
        setCustomBrandDisplay(ws.customBrandDisplay);
      }
      setEntityType(ws.entityType || (ws.type === "pt" ? "PT" : ws.type === "umkm" ? "UMKM" : "Personal"));
      setTaxId(ws.taxId || "");
      setWebsiteUrl(ws.websiteUrl || "");
    }

    const savedBadge = localStorage.getItem("novajournal_sidebar_brand_badge");
    if (savedBadge !== null) setShowSidebarBrandBadge(savedBadge !== "false");

    const savedMode = localStorage.getItem("novajournal_sidebar_brand_mode");
    if (savedMode === "icon" || savedMode === "full") setSidebarBrandDisplayMode(savedMode);

    const savedBadgeStyle = localStorage.getItem("novajournal_brand_badge_style");
    if (savedBadgeStyle === "icon-only" || savedBadgeStyle === "full") setBrandBadgeStyle(savedBadgeStyle);

    const savedDisplayFormat = localStorage.getItem("novajournal_brand_display_format") as any;
    if (savedDisplayFormat === "logo-and-text" || savedDisplayFormat === "logo-only" || savedDisplayFormat === "full-banner") {
      setCustomBrandDisplay(savedDisplayFormat);
    }

    const savedBrandMode = localStorage.getItem("novajournal_brand_logo_mode") as any;
    if (savedBrandMode === "square" || savedBrandMode === "wide") {
      setCustomBrandMode(savedBrandMode);
    }

    const savedLogoWidth = localStorage.getItem("novajournal_brand_logo_width");
    if (savedLogoWidth) setBrandLogoWidth(Number(savedLogoWidth) || 140);

    const savedLogoPlacement = localStorage.getItem("novajournal_brand_logo_placement") as any;
    if (savedLogoPlacement === "left" || savedLogoPlacement === "center" || savedLogoPlacement === "right") {
      setBrandLogoPlacement(savedLogoPlacement);
    }

    setIsInitialized(true);
  }, [selectedWorkspace]);

  // Debounced Autosave for Brand Configuration
  useEffect(() => {
    if (!isInitialized || !selectedWorkspace || !isEnterprise) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const typeValue = (entityType.toLowerCase() === "pt" ? "pt" : entityType.toLowerCase() === "umkm" ? "umkm" : "personal") as "personal" | "umkm" | "pt";
        await mutationFunctions.updateWorkspace({
          id: selectedWorkspace.id,
          data: {
            name: selectedWorkspace.name,
            type: typeValue,
            entityType,
            customBrandName: customBrandName.trim() || null,
            customBrandJargon: customBrandJargon.trim() || null,
            customBrandDescription: customBrandDescription.trim() || null,
            customBrandLogo: customBrandLogo.trim() || null,
            customBrandMode,
            customBrandDisplay,
            taxId: taxId.trim() || null,
            websiteUrl: websiteUrl.trim() || null,
          },
        });

        localStorage.setItem("novajournal_sidebar_brand_badge", String(showSidebarBrandBadge));
        localStorage.setItem("novajournal_sidebar_brand_mode", sidebarBrandDisplayMode);
        localStorage.setItem("novajournal_brand_badge_style", brandBadgeStyle);
        localStorage.setItem("novajournal_brand_display_format", customBrandDisplay);
        localStorage.setItem("novajournal_brand_logo_mode", customBrandMode);
        localStorage.setItem("novajournal_brand_logo_width", String(brandLogoWidth));
        localStorage.setItem("novajournal_brand_logo_placement", brandLogoPlacement);

        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
        setSaveStatus("saved");

        // Silent audit log for autosave
        mutationFunctions.recordAuditLog({
          workspaceId: selectedWorkspace.id,
          action: "autosave_brand_config",
          entityType: "workspace",
          entityId: selectedWorkspace.id,
          newData: { customBrandName, customBrandMode, customBrandDisplay, brandLogoWidth, brandLogoPlacement },
        }).catch(() => {});
      } catch (e) {
        console.error("Autosave brand failed:", e);
        playNovaErrorSound();
        setSaveStatus("idle");
      }
    }, 700);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    customBrandName,
    customBrandJargon,
    customBrandDescription,
    customBrandLogo,
    customBrandMode,
    customBrandDisplay,
    brandLogoWidth,
    brandLogoPlacement,
    entityType,
    taxId,
    websiteUrl,
    showSidebarBrandBadge,
    sidebarBrandDisplayMode,
    brandBadgeStyle,
    isInitialized,
    selectedWorkspace,
    isEnterprise,
  ]);

  // Bounded Pan Clamping for Brand Logo Crop Modal
  const clampPan = (rawX: number, rawY: number, zoomLevel: number, mode: "square" | "wide") => {
    const W = imageNatSize.w || 400;
    const H = imageNatSize.h || 400;
    const targetW = mode === "wide" ? 280 : 220;
    const targetH = mode === "wide" ? 120 : 220;
    const baseScale = Math.max(targetW / W, targetH / H);
    const totalScale = baseScale * zoomLevel;
    const curW = W * totalScale;
    const curH = H * totalScale;
    const maxPanX = Math.max(0, (curW - targetW) / 2);
    const maxPanY = Math.max(0, (curH - targetH) / 2);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
      curW,
      curH,
    };
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileType = file.type.toLowerCase();
    if (fileType.includes("webp")) setFileFormatName("WEBP");
    else if (fileType.includes("png")) setFileFormatName("PNG");
    else if (fileType.includes("svg")) setFileFormatName("SVG");
    else setFileFormatName("JPG");

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedFileForCrop(result);
        const tempImg = new Image();
        tempImg.onload = () => {
          setImageNatSize({ w: tempImg.naturalWidth || 400, h: tempImg.naturalHeight || 400 });
        };
        tempImg.src = result;
        setLogoZoom(1);
        setLogoPanX(0);
        setLogoPanY(0);
        setCropMode(customBrandMode);
        setIsCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveCroppedLogo = async () => {
    if (!selectedFileForCrop || !selectedWorkspace) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const targetW = cropMode === "wide" ? 280 : 220;
      const targetH = cropMode === "wide" ? 120 : 220;
      const OUT_W = cropMode === "wide" ? 560 : 512;
      const OUT_H = cropMode === "wide" ? 240 : 512;

      const canvas = document.createElement("canvas");
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const clamped = clampPan(logoPanX, logoPanY, logoZoom, cropMode);
      const scaleRatio = OUT_W / targetW;
      const drawW = clamped.curW * scaleRatio;
      const drawH = clamped.curH * scaleRatio;
      const drawX = (OUT_W / 2) + (clamped.x * scaleRatio) - (drawW / 2);
      const drawY = (OUT_H / 2) + (clamped.y * scaleRatio) - (drawH / 2);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      let compressedDataUrl: string;
      try {
        compressedDataUrl = canvas.toDataURL("image/webp", 0.95);
      } catch {
        compressedDataUrl = canvas.toDataURL("image/png");
      }

      setUploadingLogo(true);
      try {
        const res = await mutationFunctions.uploadBrandLogo(selectedWorkspace.id, compressedDataUrl, cropMode);
        const logoUrl = res.brandLogoUrl || compressedDataUrl;
        setCustomBrandLogo(logoUrl);
        setCustomBrandMode(cropMode);
        localStorage.setItem("novajournal_custom_brand_logo", logoUrl);
        localStorage.setItem("novajournal_brand_logo_mode", cropMode);
        setIsCropModalOpen(false);
        playNovaSuccessSound();
        showNotice("Logo identitas brand berhasil diunggah ke MinIO S3 & tersimpan di database!");
        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
        refreshWorkspaces();
      } catch (err: any) {
        console.warn("MinIO brand upload fallback:", err);
        setCustomBrandLogo(compressedDataUrl);
        setCustomBrandMode(cropMode);
        localStorage.setItem("novajournal_custom_brand_logo", compressedDataUrl);
        localStorage.setItem("novajournal_brand_logo_mode", cropMode);
        setIsCropModalOpen(false);
        playNovaErrorSound();
        showNotice("Logo brand disimpan lokal (upload ke server gagal).");
        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
        refreshWorkspaces();
      } finally {
        setUploadingLogo(false);
      }
    };
    img.src = selectedFileForCrop;
  };

  // Activate Enterprise Test Mode
  const handleUpgradeToEnterprise = async () => {
    if (!selectedWorkspace) return;
    setUpgradingEnterprise(true);
    playSoftChime();
    try {
      await mutationFunctions.updateWorkspace({
        id: selectedWorkspace.id,
        planTier: "enterprise",
      } as any);
      await refreshWorkspaces();
      setOverrideEnterprise(true);
      playNovaSpaceSound();
      showNotice("Selamat! Mode Uji Coba Enterprise diaktifkan untuk workspace ini.");
    } catch {
      setOverrideEnterprise(true);
      showNotice("Mode Enterprise aktif (Local Override).");
    } finally {
      setUpgradingEnterprise(false);
    }
  };

  // Save Brand Configuration
  const [savingBrand, setSavingBrand] = useState(false);
  const handleSaveBrand = async () => {
    if (!selectedWorkspace) return;
    setSavingBrand(true);
    playSoftChime();
    const typeValue = (entityType.toLowerCase() === "pt" ? "pt" : entityType.toLowerCase() === "umkm" ? "umkm" : "personal") as "personal" | "umkm" | "pt";

    await executeSettingsAction(
      async () => {
        await mutationFunctions.updateWorkspace({
          id: selectedWorkspace.id,
          data: {
            name: selectedWorkspace.name,
            type: typeValue,
            entityType,
            customBrandName: customBrandName.trim() || null,
            customBrandJargon: customBrandJargon.trim() || null,
            customBrandDescription: customBrandDescription.trim() || null,
            customBrandLogo: customBrandLogo.trim() || null,
            customBrandMode,
            customBrandDisplay,
            taxId: taxId.trim() || null,
            websiteUrl: websiteUrl.trim() || null,
          },
        });

        // Save sidebar preferences to localStorage
        localStorage.setItem("novajournal_sidebar_brand_badge", String(showSidebarBrandBadge));
        localStorage.setItem("novajournal_sidebar_brand_mode", sidebarBrandDisplayMode);
        localStorage.setItem("novajournal_brand_badge_style", brandBadgeStyle);
        localStorage.setItem("novajournal_brand_display_format", customBrandDisplay);
        localStorage.setItem("novajournal_brand_logo_mode", customBrandMode);

        // Broadcast live event to update sidebar in real-time
        window.dispatchEvent(new Event("novajournal_brand_config_changed"));

        await refreshWorkspaces();
      },
      {
        workspaceId: selectedWorkspace.id,
        action: "update_brand_config",
        entityType: "workspace",
        entityId: selectedWorkspace.id,
        newData: { customBrandName, customBrandJargon, entityType, customBrandDisplay, customBrandMode },
        successMessage: "Identitas Brand Perusahaan & Konfigurasi Sidebar berhasil disimpan!",
        errorMessage: "Gagal menyimpan identitas brand ke server.",
        onNotice: (msg) => showNotice(msg),
      }
    );

    setSavingBrand(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 sm:mt-8 pt-2">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Clean 3-Tier Professional Header */}
      <div className="space-y-3 pb-3 border-b border-default-200/80 dark:border-default-800">
        {/* Tier 1: Top Navigation & Status Bar */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.push("/settings")}
            className="text-xs cursor-pointer h-8 px-3 rounded-xl font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition"
          >
            &larr; {isId ? "Kembali ke Settings Hub" : "Back to Settings Hub"}
          </Button>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold animate-pulse border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{isId ? "Menyimpan otomatis..." : "Autosaving..."}</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Tersimpan otomatis" : "Autosaved"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tier 2: Title in 1 Full Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {t(DICTIONARY.brand.title)}
          </h1>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[10px] font-bold tracking-wide">
            <Crown className="w-3 h-3 text-violet-500" />
            <span>{t(DICTIONARY.brand.badge)}</span>
          </span>
        </div>

        {/* Tier 3: Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-2xl leading-relaxed">
            {t(DICTIONARY.brand.desc)}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ENTERPRISE GATING OR FULL BRANDING FORM                                   */}
      {/* ========================================================================= */}
      {!isEnterprise ? (
        /* Locked Card for Basic & Pro */
        <Card className="p-8 border border-default-200 dark:border-default-800 bg-linear-to-b from-default-50/50 to-default-100/50 dark:from-default-900/30 dark:to-default-950/40 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-foreground">
              Fitur Eksklusif Tier Enterprise
            </h3>
            <p className="text-xs text-default-500 leading-relaxed">
              White-label identitas perusahaan (logo kustom di sidebar, nama holding, slogan korporat, dan badge khusus) hanya tersedia bagi pemegang lisensi Enterprise.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="sm"
              isDisabled={upgradingEnterprise}
              onPress={handleUpgradeToEnterprise}
              className="h-9 px-5 text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer shadow-md shadow-violet-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Aktifkan Mode Uji Coba Enterprise</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onPress={() => router.push("/workspaces")}
              className="h-9 px-4 text-xs text-default-600 dark:text-default-300 cursor-pointer"
            >
              Kelola Workspaces & Lisensi
            </Button>
          </div>
        </Card>
      ) : (
        /* Full Enterprise Brand Form */
        <div className="space-y-6">
          {/* Active Enterprise Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-500 shrink-0" />
              <span>Mode White-Label Enterprise Aktif pada Workspace Ini</span>
            </div>
            <span className="font-mono text-[11px] bg-violet-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
              UNLOCKED
            </span>
          </div>

          {/* Sticky Top Anchor Bar */}
          <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-foreground">{isId ? "Seksi:" : "Section:"}</span>
              <div className="flex items-center gap-1">
                {BRAND_SECTIONS.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  const SecIcon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "text-white shadow-xs font-bold"
                          : "text-default-600 hover:bg-default-100 dark:hover:bg-default-800"
                      }`}
                      style={isActive ? { backgroundColor: sec.color } : undefined}
                    >
                      <SecIcon className="w-3 h-3" />
                      <span>{sec.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleAllSections}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 hover:bg-default-50 cursor-pointer transition font-medium"
              >
                {areAllFolded ? "Buka Semua" : "Tutup Semua"}
              </button>
            </div>
          </div>

          {/* Section 1: Brand Visuals & Identity */}
          <Card
            id="section-identity"
            className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
          >
            <div
              onClick={() => toggleFold("identity")}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    1. Logo & Identitas Brand
                  </h2>
                  <p className="text-[11px] text-default-400">
                    Logo perusahaan, nama brand holding, slogan korporat, dan data legalitas usaha.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
                  {customBrandName ? "Kustom" : "Default"}
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
                  {foldedSections.identity ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {!foldedSections.identity && (
              <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800 space-y-6">
                {/* Logo Upload & Mode Switcher */}
                <div className="pt-4 flex flex-col md:flex-row items-start md:items-center gap-5 p-4 rounded-2xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    onChange={handleFileSelected}
                    className="hidden"
                  />

                  {/* Logo Preview Box (Supports Square and Wide) */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative ${
                      customBrandMode === "wide" ? "w-48 h-20.5 rounded-xl" : "w-20 h-20 rounded-2xl"
                    } bg-default-100 dark:bg-default-800 border-2 border-dashed border-default-300 dark:border-default-700 hover:border-violet-500 dark:hover:border-violet-400 flex items-center justify-center overflow-hidden shrink-0 shadow-inner cursor-pointer group transition-all`}
                    title="Klik untuk memilih file logo baru"
                  >
                    {customBrandLogo ? (
                      <img
                        src={customBrandLogo}
                        alt="Logo Perusahaan"
                        className={`w-full h-full ${customBrandMode === "wide" ? "object-contain p-1" : "object-cover"}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-default-400 group-hover:text-violet-500 transition-colors">
                        <Building2 className="w-6 h-6" />
                        <span className="text-[9px] font-semibold">Pilih Logo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      <Camera className="w-4 h-4 mr-1" /> Ganti
                    </div>
                  </div>

                  {/* Action Controls & Format Selector */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Logo & Visual Identitas Brand
                        </span>
                        <p className="text-[11px] text-default-500">
                          Format WebP, PNG, SVG, atau JPG. Terunggah ke MinIO S3 folder terstruktur.
                        </p>
                      </div>

                      {/* Aspect Ratio Selector */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-default-200/50 dark:bg-default-700/50 border border-default-200/60 dark:border-default-700/60">
                          <button
                            type="button"
                            onClick={() => setCustomBrandMode("square")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                              customBrandMode === "square"
                                ? "bg-violet-600 text-white shadow-xs"
                                : "text-default-600 hover:text-foreground"
                            }`}
                          >
                            Kotak 1:1 (Square)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomBrandMode("wide")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                              customBrandMode === "wide"
                                ? "bg-violet-600 text-white shadow-xs"
                                : "text-default-600 hover:text-foreground"
                            }`}
                          >
                            Melebar (Wide / Banner)
                          </button>
                        </div>

                        {customBrandMode === "wide" && (
                          <button
                            type="button"
                            onClick={() => {
                              playSoftChime();
                              setIsWideSettingsModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-semibold transition cursor-pointer active:scale-95"
                            title="Atur lebar kustom dan posisi penempatan logo"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600" />
                            <span>Atur Lebar & Posisi ({brandLogoWidth}px · {brandLogoPlacement === "left" ? "Kiri" : brandLogoPlacement === "center" ? "Tengah" : "Kanan"})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <Button
                        size="sm"
                        className="h-8.5 px-3.5 text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                        onPress={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        <span>Unggah Foto Logo</span>
                      </Button>

                      {customBrandLogo && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8.5 px-3 text-xs cursor-pointer"
                            onPress={() => {
                              setSelectedFileForCrop(customBrandLogo);
                              setCropMode(customBrandMode);
                              setLogoZoom(1);
                              setLogoPanX(0);
                              setLogoPanY(0);
                              setIsCropModalOpen(true);
                            }}
                          >
                            <Sliders className="w-3.5 h-3.5 mr-1" />
                            <span>Potong Ulang</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            onPress={() => {
                              setCustomBrandLogo("");
                              localStorage.removeItem("novajournal_custom_brand_logo");
                              window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                              showNotice("Logo brand telah dihapus.");
                            }}
                            className="h-8.5 px-3 text-xs cursor-pointer"
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

            {/* Brand Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Nama Brand / Perusahaan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Nusantara Kapital"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Slogan / Jargon Korporat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Enterprise Asset Management"
                  value={customBrandJargon}
                  onChange={(e) => setCustomBrandJargon(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Bentuk Badan Usaha
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-violet-500"
                >
                  <option value="PT">PT (Perseroan Terbatas)</option>
                  <option value="CV">CV (Commanditaire Vennootschap)</option>
                  <option value="Holding">Holding Group / Conglomerate</option>
                  <option value="UMKM">UMKM / Retail Venture</option>
                  <option value="Personal">Family Office / Personal Treasury</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  NPWP Perusahaan / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="01.234.567.8-901.000"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block">
                  Website Resmi Perusahaan
                </label>
                <div className="flex items-center gap-2">
                  <span className="h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 flex items-center text-xs text-default-400 font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    placeholder="company.co.id"
                    value={websiteUrl.replace(/^https?:\/\//, "")}
                    onChange={(e) => setWebsiteUrl("https://" + e.target.value.replace(/^https?:\/\//, ""))}
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block">
                  Deskripsi Korporat / Mandat Bisnis
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat mengenai lingkup bisnis entitas ini..."
                  value={customBrandDescription}
                  onChange={(e) => setCustomBrandDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-violet-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Sidebar Brand Badge & Display Controls */}
      <Card
        id="section-display"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("display")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                2. Preferensi Tampilan Brand di Sidebar Navigasi
              </h2>
              <p className="text-[11px] text-default-400">
                Visibilitas tier badge dan mode tampilan compact vs full di sidebar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {sidebarBrandDisplayMode.toUpperCase()}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.display ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.display && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A: Badge Toggle */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Tampilkan Badge Tier
                  </span>
                  <p className="text-[11px] text-default-500 mt-0.5">
                    Tampilkan badge lisensi di samping logo brand sidebar.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showSidebarBrandBadge}
                  onClick={() => {
                    const next = !showSidebarBrandBadge;
                    setShowSidebarBrandBadge(next);
                    localStorage.setItem("novajournal_sidebar_brand_badge", String(next));
                    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                    playRealisticClick();
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    showSidebarBrandBadge ? "bg-violet-600" : "bg-default-300 dark:bg-default-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      showSidebarBrandBadge ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Option B: Header Brand Layout */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Format Header Brand Sidebar
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBrandDisplay("logo-and-text");
                      localStorage.setItem("novajournal_brand_display_format", "logo-and-text");
                      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      playRealisticClick();
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "logo-and-text"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Logo + Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBrandDisplay("logo-only");
                      localStorage.setItem("novajournal_brand_display_format", "logo-only");
                      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      playRealisticClick();
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "logo-only"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Hanya Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBrandDisplay("full-banner");
                      localStorage.setItem("novajournal_brand_display_format", "full-banner");
                      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      playRealisticClick();
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "full-banner"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Full Banner
                  </button>
                </div>
              </div>

              {/* Option C: Tier Badge Style (Full vs Icon Only) */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Gaya Tampilan Badge Tier
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBrandBadgeStyle("full");
                      localStorage.setItem("novajournal_brand_badge_style", "full");
                      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      playRealisticClick();
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      brandBadgeStyle === "full"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                    }`}
                  >
                    👑 Ikon + Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandBadgeStyle("icon-only");
                      localStorage.setItem("novajournal_brand_badge_style", "icon-only");
                      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      playRealisticClick();
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      brandBadgeStyle === "icon-only"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                    }`}
                  >
                    👑 Hanya Ikon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Live Sidebar Header Preview */}
      <Card
        id="section-preview"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("preview")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                3. Pratinjau Navigasi Korporat
              </h2>
              <p className="text-[11px] text-default-400">
                Tampilan visual langsung komponen header sidebar dengan kustomisasi yang diterapkan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              Live
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.preview ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.preview && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-4">
              <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider block mb-2">
                Pratinjau Langsung Header Sidebar:
              </span>
              <div className="max-w-xs p-3 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm flex items-center justify-between">
                {customBrandDisplay === "full-banner" && customBrandLogo ? (
                  <div className="flex-1 flex items-center min-w-0 pr-1">
                    <img
                      src={customBrandLogo}
                      alt="Corporate Banner"
                      className="max-h-8 w-auto max-w-[145px] object-contain object-left"
                    />
                  </div>
                ) : customBrandDisplay === "logo-only" && customBrandLogo ? (
                  <div className="flex items-center min-w-0">
                    <img
                      src={customBrandLogo}
                      alt="Corporate Logo"
                      className={
                        customBrandMode === "wide"
                          ? "max-h-7.5 max-w-[130px] object-contain object-left"
                          : "w-8 h-8 rounded-xl object-cover shadow-2xs border border-default-200/60 dark:border-default-700/60"
                      }
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    {customBrandLogo ? (
                      <img
                        src={customBrandLogo}
                        alt="Logo"
                        className={
                          customBrandMode === "wide"
                            ? "h-7 max-w-[50px] rounded-md object-contain shrink-0"
                            : "w-7 h-7 rounded-lg object-cover border border-default-200 shrink-0"
                        }
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                        {customBrandName ? customBrandName.charAt(0).toUpperCase() : "C"}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-xs font-bold text-foreground truncate">
                        {customBrandName || "NovaTech Syndicate"}
                      </span>
                      <span className="text-[9px] text-default-400 font-medium truncate">
                        {customBrandJargon || "Enterprise Governance"}
                      </span>
                    </div>
                  </div>
                )}

                {showSidebarBrandBadge && (
                  <span className={`flex items-center ${brandBadgeStyle === "icon-only" ? "p-1 rounded-md" : "gap-1 px-1.5 py-0.5 rounded-md"} bg-violet-500/10 text-violet-600 border border-violet-500/30 text-[9px] font-bold shrink-0 ml-1`}>
                    <Crown className="w-2.5 h-2.5" />
                    {brandBadgeStyle !== "icon-only" && <span>Enterprise</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bottom Status Notice */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-pulse border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Menyimpan perubahan otomatis...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Semua pengaturan brand tersimpan otomatis
            </span>
          )}
          {saveStatus === "idle" && (
            <span className="text-[11px] text-default-400">
              Perubahan disimpan otomatis tanpa perlu menekan tombol simpan manual.
            </span>
          )}
        </div>
      </div>
      {/* Brand Logo Crop & Focus Modal */}
      {isCropModalOpen && selectedFileForCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Sesuaikan Potongan Logo Brand
                </h3>
                <p className="text-[11px] text-default-400">
                  Posisikan logo dan atur rasio sesuai gaya identitas perusahaan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-default-100 dark:hover:bg-default-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 text-center">
              {/* Aspect Ratio Switcher */}
              <div className="flex items-center justify-center gap-1.5 p-1 max-w-[280px] mx-auto rounded-xl bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setCropMode("square");
                    const clamped = clampPan(logoPanX, logoPanY, logoZoom, "square");
                    setLogoPanX(clamped.x);
                    setLogoPanY(clamped.y);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    cropMode === "square"
                      ? "bg-violet-600 text-white shadow-xs"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  Kotak 1:1 (Square)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCropMode("wide");
                    const clamped = clampPan(logoPanX, logoPanY, logoZoom, "wide");
                    setLogoPanX(clamped.x);
                    setLogoPanY(clamped.y);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    cropMode === "wide"
                      ? "bg-violet-600 text-white shadow-xs"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  Melebar (Wide / Banner)
                </button>
              </div>

              {/* Viewport Box (Bounded dimensions 320x240px) */}
              <div
                id="brand-crop-box"
                className="relative w-[320px] h-[240px] mx-auto overflow-hidden rounded-2xl bg-default-900 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner border border-default-200/60 dark:border-default-700/60"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startPanX = logoPanX;
                  const startPanY = logoPanY;
                  const handleMove = (ev: MouseEvent) => {
                    const rawX = startPanX + (ev.clientX - startX);
                    const rawY = startPanY + (ev.clientY - startY);
                    const clamped = clampPan(rawX, rawY, logoZoom, cropMode);
                    setLogoPanX(clamped.x);
                    setLogoPanY(clamped.y);
                  };
                  const handleUp = () => {
                    document.removeEventListener("mousemove", handleMove);
                    document.removeEventListener("mouseup", handleUp);
                  };
                  document.addEventListener("mousemove", handleMove);
                  document.addEventListener("mouseup", handleUp);
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const nextZoom = Math.min(3.5, Math.max(1, logoZoom + (e.deltaY > 0 ? -0.05 : 0.05)));
                  setLogoZoom(nextZoom);
                  const clamped = clampPan(logoPanX, logoPanY, nextZoom, cropMode);
                  setLogoPanX(clamped.x);
                  setLogoPanY(clamped.y);
                }}
              >
                {/* Scaled & Positioned Image */}
                {(() => {
                  const W = imageNatSize.w || 400;
                  const H = imageNatSize.h || 400;
                  const targetW = cropMode === "wide" ? 280 : 220;
                  const targetH = cropMode === "wide" ? 120 : 220;
                  const baseScale = Math.max(targetW / W, targetH / H);
                  const totalScale = baseScale * logoZoom;
                  const curW = W * totalScale;
                  const curH = H * totalScale;

                  return (
                    <div
                      className="absolute pointer-events-none transition-none"
                      style={{
                        width: `${curW}px`,
                        height: `${curH}px`,
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${logoPanX}px), calc(-50% + ${logoPanY}px))`,
                      }}
                    >
                      <img
                        src={selectedFileForCrop}
                        alt="Crop Preview"
                        className="w-full h-full object-cover select-none pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  );
                })()}

                {/* Focus Mask (Transparent inside rounded shape, dimmed outside via box-shadow) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`${
                      cropMode === "wide"
                        ? "w-[280px] h-[120px] rounded-xl"
                        : "w-[220px] h-[220px] rounded-2xl"
                    } border-2 border-dashed border-white/90 ring-1 ring-black/40 transition-all duration-200`}
                    style={{
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.70)",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-default-500 px-1 max-w-[320px] mx-auto">
                <span>Drag geser · Scroll zoom ({fileFormatName})</span>
                <button
                  type="button"
                  onClick={() => {
                    setLogoZoom(1);
                    setLogoPanX(0);
                    setLogoPanY(0);
                  }}
                  className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1 pt-1 text-left max-w-[320px] mx-auto">
                <div className="flex items-center justify-between text-xs text-default-600 font-medium">
                  <span className="font-semibold text-foreground">Skala Pembesaran (Zoom)</span>
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                    {Math.round(logoZoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.05"
                  value={logoZoom}
                  onChange={(e) => {
                    const nextZoom = parseFloat(e.target.value);
                    setLogoZoom(nextZoom);
                    const clamped = clampPan(logoPanX, logoPanY, nextZoom, cropMode);
                    setLogoPanX(clamped.x);
                    setLogoPanY(clamped.y);
                  }}
                  className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs cursor-pointer"
                onPress={() => setIsCropModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                onPress={handleSaveCroppedLogo}
                isDisabled={uploadingLogo}
              >
                {uploadingLogo ? "Mengunggah ke MinIO..." : "Simpan Potongan Logo"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Pengaturan Lebar & Posisi Logo Banner */}
      {isWideSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-default-200 dark:border-default-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Atur Lebar & Posisi Logo Banner
                  </h3>
                  <p className="text-[11px] text-default-400">
                    Sesuaikan bentang ukuran piksel dan perataan logo di bilah navigasi Sidebar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWideSettingsModalOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Slider Lebar Logo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Lebar Maksimal Logo (Width)</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                    {brandLogoWidth} px
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="260"
                  step="5"
                  value={brandLogoWidth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBrandLogoWidth(val);
                    localStorage.setItem("novajournal_brand_logo_width", String(val));
                    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                  }}
                  className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "120px (Kecil)", w: 120 },
                    { label: "140px (Standar)", w: 140 },
                    { label: "180px (Medium)", w: 180 },
                    { label: "220px (Lebar)", w: 220 },
                    { label: "250px (Maksimal)", w: 250 },
                  ].map((preset) => (
                    <button
                      key={preset.w}
                      type="button"
                      onClick={() => {
                        playRealisticClick(0.3);
                        setBrandLogoWidth(preset.w);
                        localStorage.setItem("novajournal_brand_logo_width", String(preset.w));
                        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        brandLogoWidth === preset.w
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                          : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posisi Penempatan (Placement) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Perataan & Posisi Penempatan (Placement)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left" as const, label: "Rata Kiri", desc: "Left aligned" },
                    { id: "center" as const, label: "Rata Tengah", desc: "Centered logo" },
                    { id: "right" as const, label: "Rata Kanan", desc: "Right aligned" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        playRealisticClick(0.3);
                        setBrandLogoPlacement(pos.id);
                        localStorage.setItem("novajournal_brand_logo_placement", pos.id);
                        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        brandLogoPlacement === pos.id
                          ? "border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 ring-1 ring-violet-500/30"
                          : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-800/40 hover:bg-default-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-foreground">{pos.label}</span>
                        {brandLogoPlacement === pos.id && <Check className="w-3.5 h-3.5 text-violet-600" />}
                      </div>
                      <span className="text-[10px] text-default-400">{pos.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Simulated Preview Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-default-400 uppercase tracking-wider block">
                  Simulasi Tampilan Header Sidebar
                </span>
                <div className="w-full h-14 rounded-xl border border-default-200 dark:border-default-700 bg-default-100/70 dark:bg-default-800/50 px-3 flex items-center overflow-hidden">
                  <div className={`w-full flex items-center ${
                    brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                  }`}>
                    {customBrandLogo ? (
                      <img
                        key={customBrandLogo}
                        src={customBrandLogo}
                        alt="Simulated Logo"
                        style={{ maxWidth: `${brandLogoWidth}px` }}
                        className="max-h-10 w-auto object-contain transition-all"
                      />
                    ) : (
                      <div
                        style={{ width: `${brandLogoWidth}px` }}
                        className="h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-600 text-xs font-bold"
                      >
                        Logo Banner ({brandLogoWidth}px)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs cursor-pointer"
                onPress={() => {
                  setBrandLogoWidth(140);
                  setBrandLogoPlacement("left");
                  localStorage.setItem("novajournal_brand_logo_width", "140");
                  localStorage.setItem("novajournal_brand_logo_placement", "left");
                  window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                }}
              >
                Reset Default
              </Button>
              <Button
                size="sm"
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                onPress={() => {
                  setIsWideSettingsModalOpen(false);
                  playNovaSuccessSound();
                  showNotice("Pengaturan lebar & posisi logo banner diterapkan!");
                }}
              >
                Terapkan & Simpan
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )}

  {/* ========================================================================= */}
  {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
  {/* ========================================================================= */}
  {isEnterprise && (
    <div className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
      {quickJumpOpen && (
        <div className="mb-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-default-200/80 dark:border-default-800 shadow-2xl w-64 space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
            <div className="flex items-center gap-1.5">
              <ActiveIcon className="w-4 h-4" style={{ color: activeSec.color }} />
              <span className="text-xs font-bold text-foreground">Navigasi Seksi Cepat</span>
            </div>
            <button
              type="button"
              onClick={() => setQuickJumpOpen(false)}
              className="text-default-400 hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-default-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
            {BRAND_SECTIONS.map((sec) => {
              const isActive = activeSectionId === sec.id;
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sec.id);
                    setQuickJumpOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "text-white font-bold shadow-xs"
                      : "hover:bg-default-100 dark:hover:bg-default-800 text-default-700 dark:text-default-300 text-xs"
                  }`}
                  style={isActive ? { backgroundColor: sec.color } : undefined}
                >
                  <div className="flex items-center gap-2">
                    <SecIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{sec.shortName}</span>
                  </div>
                  {foldedSections[sec.id] && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-default-200 dark:bg-default-700 text-default-500 font-mono">
                      Folded
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-default-100 dark:border-default-800 flex justify-between items-center text-[10px] text-default-400">
            <span>{BRAND_SECTIONS.length} Seksi Tersedia</span>
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 font-medium hover:bg-default-200 cursor-pointer"
            >
              {areAllFolded ? "Buka Semua" : "Tutup Semua"}
            </button>
          </div>
        </div>
      )}

      {/* Minimalist Icon-Only Floating Sticky Anchor Button (Solid Fill, No Dark Stroke) */}
      <button
        type="button"
        onClick={() => {
          playSoftChime();
          setQuickJumpOpen((prev) => !prev);
        }}
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl hover:scale-105 active:scale-95 text-white shadow-xl transition-all cursor-pointer group"
        style={{
          backgroundColor: activeSec.color,
          boxShadow: `0 8px 24px -4px ${activeSec.color}90`,
        }}
        title={`Lompat Seksi: ${activeSec.name}`}
      >
        <ActiveIcon className={`w-5 h-5 text-white transition-transform duration-300 ${quickJumpOpen ? "rotate-45" : "group-hover:scale-110"}`} />
      </button>
    </div>
  )}
    </div>
  );
}
