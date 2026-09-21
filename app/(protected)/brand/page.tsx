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
  Monitor,
  Smartphone,
  Maximize2,
  Sun,
  Moon,
  Layers,
  LayoutDashboard,
  Wallet,
  FileSpreadsheet,
  LayoutList,
  Info,
  Scale,
  Percent,
  AlignLeft,
  AlignCenter,
  AlignRight,
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
  const [overrideEnterprise, setOverrideEnterprise] = useState(() => {
    if (typeof window === "undefined") return false;
    const globalOverride = localStorage.getItem("novajournal_enterprise_override") === "true";
    const trial = selectedWorkspace?.id ? localStorage.getItem(`novajournal_enterprise_trial_${selectedWorkspace.id}`) === "true" : false;
    return globalOverride || trial || (selectedWorkspace as any)?.planTier === "enterprise";
  });
  const isEnterprise = planTier === "enterprise" || overrideEnterprise;
  const [upgradingEnterprise, setUpgradingEnterprise] = useState(false);

  // Brand Form States
  const [customBrandName, setCustomBrandName] = useState("");
  const [customBrandJargon, setCustomBrandJargon] = useState("");
  const [customBrandDescription, setCustomBrandDescription] = useState("");
  const [customBrandLogo, setCustomBrandLogo] = useState("");
  const [customBrandMode, setCustomBrandMode] = useState<"square" | "wide">("square");
  const [customBrandDisplay, setCustomBrandDisplay] = useState<"logo-and-text" | "logo-only" | "full-banner">("logo-and-text");
  const [brandLogoWidth, setBrandLogoWidth] = useState(100);
  const [brandLogoUnit, setBrandLogoUnit] = useState<"percent" | "px">("percent");
  const [brandLogoPlacement, setBrandLogoPlacement] = useState<"left" | "center" | "right">("left");
  const [brandSubtextMode, setBrandSubtextMode] = useState<"jargon" | "entity" | "none">("jargon");
  const [brandLogoFrame, setBrandLogoFrame] = useState<"none" | "bordered" | "card" | "contrast">("none");
  const [isWideSettingsModalOpen, setIsWideSettingsModalOpen] = useState(false);
  const [entityType, setEntityType] = useState("PT");
  const [taxId, setTaxId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Preview Section State
  const [previewTab, setPreviewTab] = useState<"expanded" | "collapsed" | "joint" | "compare">("expanded");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [showCropGuides, setShowCropGuides] = useState(true);

  // Immediate live sync handlers
  const handleBrandModeChange = (mode: "square" | "wide") => {
    playSoftChime();
    setCustomBrandMode(mode);
    localStorage.setItem("novajournal_brand_logo_mode", mode);
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_logo_mode_${selectedWorkspace.id}`, mode);
      (selectedWorkspace as any).customBrandMode = mode;
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
    showNotice(mode === "wide" ? (isId ? "Mode rasio logo: Melebar (Wide / Banner)" : "Brand mode: Wide banner") : (isId ? "Mode rasio logo: Kotak 1:1 (Square)" : "Brand mode: Square 1:1"));
  };

  const handleLogoUnitChange = (unit: "percent" | "px") => {
    playSoftChime();
    setBrandLogoUnit(unit);
    let newW = brandLogoWidth;
    if (unit === "percent") {
      newW = brandLogoUnit === "px" ? Math.min(100, Math.max(15, Math.round((brandLogoWidth / 224) * 100))) : 100;
    } else {
      newW = brandLogoUnit === "percent" ? Math.min(260, Math.max(30, Math.round((brandLogoWidth / 100) * 224))) : 140;
    }
    setBrandLogoWidth(newW);
    localStorage.setItem("novajournal_brand_logo_unit", unit);
    localStorage.setItem("novajournal_brand_logo_width", String(newW));
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_logo_unit_${selectedWorkspace.id}`, unit);
      localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, String(newW));
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
    showNotice(unit === "percent" ? (isId ? "Satuan bentang: Persentase (%)" : "Scale unit: Percentage (%)") : (isId ? "Satuan bentang: Piksel (px)" : "Scale unit: Pixel (px)"));
  };

  const handleLogoWidthChange = (w: number) => {
    setBrandLogoWidth(w);
    localStorage.setItem("novajournal_brand_logo_width", String(w));
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, String(w));
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
  };

  const handleLogoPlacementChange = (pos: "left" | "center" | "right") => {
    playSoftChime();
    setBrandLogoPlacement(pos);
    localStorage.setItem("novajournal_brand_logo_placement", pos);
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_logo_placement_${selectedWorkspace.id}`, pos);
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
  };

  const handleDisplayFormatChange = (fmt: "logo-and-text" | "logo-only" | "full-banner") => {
    playSoftChime();
    setCustomBrandDisplay(fmt);
    localStorage.setItem("novajournal_brand_display_format", fmt);
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_display_format_${selectedWorkspace.id}`, fmt);
      (selectedWorkspace as any).customBrandDisplay = fmt;
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
    showNotice(fmt === "full-banner" ? "Format: Full Banner" : fmt === "logo-only" ? "Format: Hanya Logo" : "Format: Logo + Teks");
  };

  const handleSubtextModeChange = (mode: "jargon" | "entity" | "none") => {
    playRealisticClick(0.3);
    setBrandSubtextMode(mode);
    localStorage.setItem("novajournal_brand_subtext_mode", mode);
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_subtext_mode_${selectedWorkspace.id}`, mode);
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
  };

  const handleLogoFrameChange = (frame: "none" | "bordered" | "card" | "contrast") => {
    playRealisticClick(0.3);
    setBrandLogoFrame(frame);
    localStorage.setItem("novajournal_brand_logo_frame", frame);
    if (selectedWorkspace?.id) {
      localStorage.setItem(`novajournal_brand_logo_frame_${selectedWorkspace.id}`, frame);
    }
    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
  };

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
  const [brandBadgeStyle, setBrandBadgeStyle] = useState<"full" | "icon-only" | "dot">("full");
  const [logoAspectRatio, setLogoAspectRatio] = useState<number>(3);

  // Measure natural aspect ratio of brand logo for accurate symmetrical image-percentage scaling
  useEffect(() => {
    if (!customBrandLogo) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setLogoAspectRatio(img.naturalWidth / img.naturalHeight);
        setImageNatSize({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.src = customBrandLogo;
  }, [customBrandLogo]);

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
      const wsId = ws.id;
      const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
      const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
      const scopedMode = wsId ? localStorage.getItem(`novajournal_brand_logo_mode_${wsId}`) : null;
      const scopedFormat = wsId ? localStorage.getItem(`novajournal_brand_display_format_${wsId}`) : null;
      const scopedWidth = wsId ? localStorage.getItem(`novajournal_brand_logo_width_${wsId}`) : null;
      const scopedUnit = wsId ? localStorage.getItem(`novajournal_brand_logo_unit_${wsId}`) : null;
      const scopedPlacement = wsId ? localStorage.getItem(`novajournal_brand_logo_placement_${wsId}`) : null;
      const scopedSubtext = wsId ? localStorage.getItem(`novajournal_brand_subtext_mode_${wsId}`) : null;
      const scopedFrame = wsId ? localStorage.getItem(`novajournal_brand_logo_frame_${wsId}`) : null;

      const hasTrial = wsId ? localStorage.getItem(`novajournal_enterprise_trial_${wsId}`) === "true" : false;
      const globalOverride = localStorage.getItem("novajournal_enterprise_override") === "true";
      if (hasTrial || globalOverride || ws.planTier === "enterprise") {
        setOverrideEnterprise(true);
      }

      setCustomBrandName(scopedName || ws.customBrandName || "");
      setCustomBrandJargon(ws.customBrandJargon || "");
      setCustomBrandDescription(ws.customBrandDescription || "");
      setCustomBrandLogo(scopedLogo || ws.customBrandLogo || "");

      const effMode = scopedMode || localStorage.getItem("novajournal_brand_logo_mode") || ws.customBrandMode || "square";
      if (effMode === "wide" || effMode === "square") {
        setCustomBrandMode(effMode as any);
      }

      const effFormat = scopedFormat || localStorage.getItem("novajournal_brand_display_format") || ws.customBrandDisplay || "logo-and-text";
      if (effFormat === "logo-and-text" || effFormat === "logo-only" || effFormat === "full-banner") {
        setCustomBrandDisplay(effFormat as any);
      }

      setEntityType(ws.entityType || (ws.type === "pt" ? "PT" : ws.type === "umkm" ? "UMKM" : "Personal"));
      setTaxId(ws.taxId || "");
      setWebsiteUrl(ws.websiteUrl || "");

      const effUnit = (scopedUnit || localStorage.getItem("novajournal_brand_logo_unit") || "percent") as "percent" | "px";
      setBrandLogoUnit(effUnit);

      const defaultW = effUnit === "percent" ? 100 : 140;
      if (scopedWidth) {
        setBrandLogoWidth(Number(scopedWidth) || defaultW);
      } else {
        const savedLogoWidth = localStorage.getItem("novajournal_brand_logo_width");
        if (savedLogoWidth) setBrandLogoWidth(Number(savedLogoWidth) || defaultW);
        else setBrandLogoWidth(defaultW);
      }

      if (scopedPlacement === "left" || scopedPlacement === "center" || scopedPlacement === "right") {
        setBrandLogoPlacement(scopedPlacement);
      } else {
        const savedLogoPlacement = localStorage.getItem("novajournal_brand_logo_placement") as any;
        if (savedLogoPlacement === "left" || savedLogoPlacement === "center" || savedLogoPlacement === "right") {
          setBrandLogoPlacement(savedLogoPlacement);
        }
      }

      if (scopedSubtext === "jargon" || scopedSubtext === "entity" || scopedSubtext === "none") {
        setBrandSubtextMode(scopedSubtext);
      } else {
        const savedSubtext = localStorage.getItem("novajournal_brand_subtext_mode") as any;
        if (savedSubtext === "jargon" || savedSubtext === "entity" || savedSubtext === "none") setBrandSubtextMode(savedSubtext);
      }

      if (scopedFrame === "none" || scopedFrame === "bordered" || scopedFrame === "card" || scopedFrame === "contrast") {
        setBrandLogoFrame(scopedFrame);
      } else {
        const savedFrame = localStorage.getItem("novajournal_brand_logo_frame") as any;
        if (savedFrame === "none" || savedFrame === "bordered" || savedFrame === "card" || savedFrame === "contrast") setBrandLogoFrame(savedFrame);
      }
    }

    const savedBadge = localStorage.getItem("novajournal_sidebar_brand_badge");
    if (savedBadge !== null) setShowSidebarBrandBadge(savedBadge !== "false");

    const savedMode = localStorage.getItem("novajournal_sidebar_brand_mode");
    if (savedMode === "icon" || savedMode === "full") setSidebarBrandDisplayMode(savedMode);

    const savedBadgeStyle = localStorage.getItem("novajournal_brand_badge_style");
    if (savedBadgeStyle === "icon-only" || savedBadgeStyle === "full" || savedBadgeStyle === "dot") setBrandBadgeStyle(savedBadgeStyle);

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
        localStorage.setItem("novajournal_brand_logo_unit", brandLogoUnit);
        localStorage.setItem("novajournal_brand_logo_placement", brandLogoPlacement);
        localStorage.setItem("novajournal_brand_subtext_mode", brandSubtextMode);
        localStorage.setItem("novajournal_brand_logo_frame", brandLogoFrame);

        if (selectedWorkspace?.id) {
          localStorage.setItem(`novajournal_custom_brand_logo_${selectedWorkspace.id}`, customBrandLogo);
          localStorage.setItem(`novajournal_custom_brand_name_${selectedWorkspace.id}`, customBrandName);
          localStorage.setItem(`novajournal_brand_logo_mode_${selectedWorkspace.id}`, customBrandMode);
          localStorage.setItem(`novajournal_brand_display_format_${selectedWorkspace.id}`, customBrandDisplay);
          localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, String(brandLogoWidth));
          localStorage.setItem(`novajournal_brand_logo_unit_${selectedWorkspace.id}`, brandLogoUnit);
          localStorage.setItem(`novajournal_brand_logo_placement_${selectedWorkspace.id}`, brandLogoPlacement);
          localStorage.setItem(`novajournal_brand_subtext_mode_${selectedWorkspace.id}`, brandSubtextMode);
          localStorage.setItem(`novajournal_brand_logo_frame_${selectedWorkspace.id}`, brandLogoFrame);
        }

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
    brandLogoUnit,
    brandLogoPlacement,
    brandSubtextMode,
    brandLogoFrame,
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
    // In wide mode, scale up so the image height covers targetH and width extends past targetW for horizontal side cropping
    const wideScaleMultiplier = mode === "wide" ? Math.max(1, (targetH / H) / (targetW / W) * 1.35) : 1;
    const baseScale = Math.max(targetW / W, targetH / H) * wideScaleMultiplier;
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
        if (selectedWorkspace?.id) {
          localStorage.setItem(`novajournal_custom_brand_logo_${selectedWorkspace.id}`, logoUrl);
          localStorage.setItem(`novajournal_brand_logo_mode_${selectedWorkspace.id}`, cropMode);
          (selectedWorkspace as any).customBrandLogo = logoUrl;
          (selectedWorkspace as any).customBrandMode = cropMode;
        }
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
        if (selectedWorkspace?.id) {
          localStorage.setItem(`novajournal_custom_brand_logo_${selectedWorkspace.id}`, compressedDataUrl);
          localStorage.setItem(`novajournal_brand_logo_mode_${selectedWorkspace.id}`, cropMode);
          (selectedWorkspace as any).customBrandLogo = compressedDataUrl;
          (selectedWorkspace as any).customBrandMode = cropMode;
        }
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
      if (selectedWorkspace?.id) {
        localStorage.setItem(`novajournal_enterprise_trial_${selectedWorkspace.id}`, "true");
      }
      localStorage.setItem("novajournal_enterprise_override", "true");
      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
      playNovaSpaceSound();
      showNotice("Selamat! Mode Uji Coba Enterprise diaktifkan untuk workspace ini.");
    } catch {
      setOverrideEnterprise(true);
      if (selectedWorkspace?.id) {
        localStorage.setItem(`novajournal_enterprise_trial_${selectedWorkspace.id}`, "true");
      }
      localStorage.setItem("novajournal_enterprise_override", "true");
      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
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

            <button
              type="button"
              onClick={() => router.push("/workspaces")}
              className="h-9 px-4 text-xs font-semibold rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-200 hover:bg-default-100 dark:hover:bg-default-700 cursor-pointer transition"
            >
              Kelola Workspaces & Lisensi
            </button>
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
                            onClick={() => handleBrandModeChange("square")}
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
                            onClick={() => handleBrandModeChange("wide")}
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
                            <span>Atur Lebar & Posisi ({brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"} · {brandLogoPlacement === "left" ? "Kiri" : brandLogoPlacement === "center" ? "Tengah" : "Kanan"})</span>
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
                          <button
                            type="button"
                            className="h-8.5 px-3 text-xs font-semibold rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-200 hover:bg-default-100 dark:hover:bg-default-700 cursor-pointer transition inline-flex items-center"
                            onClick={() => {
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
                          </button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            onPress={() => {
                              setCustomBrandLogo("");
                              localStorage.removeItem("novajournal_custom_brand_logo");
                              if (selectedWorkspace?.id) {
                                localStorage.removeItem(`novajournal_custom_brand_logo_${selectedWorkspace.id}`);
                              }
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
                Kustomisasi tata letak header, format bentang ({brandLogoUnit === "percent" ? "%" : "px"}), visibilitas tier badge, subteks entitas, dan bingkai logo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"} · {brandLogoPlacement.toUpperCase()}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.display ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.display && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Format Header Brand Layout */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <LayoutList className="w-3.5 h-3.5 text-blue-500" />
                      Format Header Sidebar
                    </span>
                    <span className="text-[10px] font-mono text-default-400 uppercase">
                      {customBrandDisplay}
                    </span>
                  </div>
                  <p className="text-[11px] text-default-500">
                    Pilih komposisi elemen visual antara logo, teks nama perusahaan, atau banner penuh.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDisplayFormatChange("logo-and-text")}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "logo-and-text"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Logo + Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisplayFormatChange("logo-only")}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "logo-only"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Hanya Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisplayFormatChange("full-banner")}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                      customBrandDisplay === "full-banner"
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                        : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    Full Banner
                  </button>
                </div>
              </div>

              {/* Card 2: Skala Bentang & Satuan Pengukuran (% vs px) */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-500" />
                      Skala Bentang Logo
                    </span>
                    {/* Unit Switcher */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-default-200/60 dark:bg-default-700/60 border border-default-200/80 dark:border-default-700/80">
                      <button
                        type="button"
                        onClick={() => handleLogoUnitChange("percent")}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                          brandLogoUnit === "percent"
                            ? "bg-violet-600 text-white shadow-2xs"
                            : "text-default-500 hover:text-foreground"
                        }`}
                      >
                        % Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogoUnitChange("px")}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                          brandLogoUnit === "px"
                            ? "bg-violet-600 text-white shadow-2xs"
                            : "text-default-500 hover:text-foreground"
                        }`}
                      >
                        px Piksel
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-default-400 leading-tight">
                    {brandLogoUnit === "percent"
                      ? "Dihitung dari lebar asli gambar logo (100% = utuh). Nilai lebih kecil memotong sayap kiri & kanan secara simetris."
                      : "Lebar jendela absolut dalam piksel. Gambar tetap dipotong simetris dari sisi kiri & kanan."}
                  </p>
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="text-[11px] text-default-500">
                      {brandLogoUnit === "percent" ? "Rentang skala: 15% - 100%" : "Rentang absolut: 30px - 260px"}
                    </span>
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                      {brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"}
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min={brandLogoUnit === "percent" ? 15 : 30}
                    max={brandLogoUnit === "percent" ? 100 : 260}
                    step={brandLogoUnit === "percent" ? 1 : 5}
                    value={brandLogoWidth}
                    onChange={(e) => handleLogoWidthChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  {/* Presets */}
                  <div className="flex items-center justify-between gap-1 pt-1.5">
                    {(brandLogoUnit === "percent"
                      ? [25, 50, 75, 90, 100]
                      : [60, 100, 140, 180, 240]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleLogoWidthChange(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold cursor-pointer transition ${
                          brandLogoWidth === preset
                            ? "bg-violet-600 text-white border-violet-600 font-bold"
                            : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-500 hover:bg-default-100"
                        }`}
                      >
                        {preset}{brandLogoUnit === "percent" ? "%" : "px"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Perataan & Penempatan (Alignment) */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                    Perataan Horizontal (Placement)
                  </span>
                  <p className="text-[11px] text-default-500">
                    Posisi koordinat wadah logo di dalam header navigasi sidebar.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "left" as const, label: "Kiri", icon: AlignLeft },
                    { id: "center" as const, label: "Tengah", icon: AlignCenter },
                    { id: "right" as const, label: "Kanan", icon: AlignRight },
                  ].map((pos) => {
                    const PosIcon = pos.icon;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => handleLogoPlacementChange(pos.id)}
                        className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                          brandLogoPlacement === pos.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                            : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                        }`}
                      >
                        <PosIcon className="w-3 h-3" />
                        <span>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Visibilitas & Format Badge Tier Lisensi */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Badge Lisensi Tier
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showSidebarBrandBadge}
                      onClick={() => {
                        const next = !showSidebarBrandBadge;
                        setShowSidebarBrandBadge(next);
                        localStorage.setItem("novajournal_sidebar_brand_badge", String(next));
                        if (selectedWorkspace?.id) {
                          localStorage.setItem(`novajournal_sidebar_brand_badge_${selectedWorkspace.id}`, String(next));
                        }
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
                  <p className="text-[11px] text-default-500 mt-1">
                    Tampilkan badge verifikasi lisensi Enterprise atau Pro di sudut header navigasi sidebar.
                  </p>
                </div>

                {showSidebarBrandBadge ? (
                  <div className="space-y-2 pt-2 border-t border-default-200/60 dark:border-default-700/60">
                    <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider block">
                      Gaya & Format Penampilan
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "full" as const, label: "Ikon + Teks", icon: Crown },
                        { id: "icon-only" as const, label: "Hanya Ikon", icon: Sparkles },
                        { id: "dot" as const, label: "Dot Aksen", icon: ShieldCheck },
                      ].map((style) => {
                        const IconComp = style.icon;
                        const isSelected = brandBadgeStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => {
                              setBrandBadgeStyle(style.id);
                              localStorage.setItem("novajournal_brand_badge_style", style.id);
                              if (selectedWorkspace?.id) {
                                localStorage.setItem(`novajournal_brand_badge_style_${selectedWorkspace.id}`, style.id);
                              }
                              window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                              playRealisticClick();
                            }}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              isSelected
                                ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                                : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                            }`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-violet-500"}`} />
                            <span className="text-[10.5px] leading-tight block">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Badge Preview Widget */}
                    <div className="p-2 rounded-lg bg-white dark:bg-default-900 border border-default-200/70 dark:border-default-700/70 flex items-center justify-between">
                      <span className="text-[10px] text-default-400 font-medium">Pratinjau Badge:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`flex items-center ${
                          brandBadgeStyle === "icon-only"
                            ? "p-1 rounded-md"
                            : brandBadgeStyle === "dot"
                            ? "p-1 rounded-full"
                            : "gap-1 px-2 py-0.5 rounded-md"
                        } bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[10px] font-bold select-none shadow-2xs`}>
                          {brandBadgeStyle === "dot" ? (
                            <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                          ) : (
                            <>
                              <Crown className="w-3 h-3 text-violet-500 shrink-0" />
                              {brandBadgeStyle !== "icon-only" && <span>Enterprise</span>}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-default-100 dark:bg-default-800 text-[11px] text-default-400 text-center font-medium">
                    Badge disembunyikan dari sidebar navigasi.
                  </div>
                )}
              </div>

              {/* Card 5: Perilaku Slogan & Subteks Entitas */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Perilaku Subteks & Slogan
                  </span>
                  <p className="text-[11px] text-default-500">
                    Teks sekunder di bawah nama brand pada format Logo + Teks.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "jargon" as const, label: "Jargon" },
                    { id: "entity" as const, label: "Entitas PT" },
                    { id: "none" as const, label: "Sembunyi" },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubtextModeChange(sub.id)}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                        brandSubtextMode === sub.id
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                          : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 6: Gaya Wadah & Frame Bingkai Logo */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Gaya Frame Wadah Logo
                  </span>
                  <p className="text-[11px] text-default-500">
                    Bingkai dan latar belakang pelindung kontras logo.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "none" as const, label: "Polos" },
                    { id: "bordered" as const, label: "Border" },
                    { id: "card" as const, label: "Card" },
                    { id: "contrast" as const, label: "Kontras" },
                  ].map((frm) => (
                    <button
                      key={frm.id}
                      type="button"
                      onClick={() => handleLogoFrameChange(frm.id)}
                      className={`p-1.5 rounded-lg border text-center text-[11px] font-semibold cursor-pointer transition ${
                        brandLogoFrame === frm.id
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs font-bold"
                          : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                      }`}
                    >
                      {frm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Live Sidebar Header Preview Suite */}
      <Card
        id="section-preview"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      >
        <div
          onClick={() => toggleFold("preview")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  3. Pratinjau & Simulator Navigasi Korporat
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 font-mono">
                  LIVE INTERACTIVE
                </span>
              </div>
              <p className="text-[11px] text-default-400 mt-0.5">
                Simulator visual real-time komponen header sidebar dengan kustomisasi aspek rasio, bentang skala ({brandLogoUnit === "percent" ? "%" : "px"}), pemotongan sisi simetris, dan perataan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {customBrandMode === "wide" ? `Wide · ${brandLogoWidth}${brandLogoUnit === "percent" ? "%" : "px"}` : "Square 1:1"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.preview ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.preview && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800 space-y-6">
            {/* Top Toolbar: View Switcher & Display Options */}
            <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-default-100 dark:border-default-800 pb-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => {
                    playRealisticClick(0.3);
                    setPreviewTab("expanded");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                    previewTab === "expanded"
                      ? "bg-violet-600 text-white shadow-xs font-bold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Sidebar Lengkap (240px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playRealisticClick(0.3);
                    setPreviewTab("collapsed");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                    previewTab === "collapsed"
                      ? "bg-violet-600 text-white shadow-xs font-bold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Bilah Ramping (Rail 64px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playRealisticClick(0.3);
                    setPreviewTab("joint");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                    previewTab === "joint"
                      ? "bg-violet-600 text-white shadow-xs font-bold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Joint Navbar & Sidebar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playRealisticClick(0.3);
                    setPreviewTab("compare");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                    previewTab === "compare"
                      ? "bg-violet-600 text-white shadow-xs font-bold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Komparasi Mode</span>
                </button>
              </div>

              {/* Auxiliary Preview Controls */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                {/* Theme simulation toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playRealisticClick(0.2);
                      setPreviewTheme("light");
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer transition ${
                      previewTheme === "light"
                        ? "bg-white text-amber-600 shadow-2xs font-bold"
                        : "text-default-500 hover:text-foreground"
                    }`}
                    title="Simulasi Tema Terang"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playRealisticClick(0.2);
                      setPreviewTheme("dark");
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer transition ${
                      previewTheme === "dark"
                        ? "bg-zinc-800 text-blue-400 shadow-2xs font-bold"
                        : "text-default-500 hover:text-foreground"
                    }`}
                    title="Simulasi Tema Gelap"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Toggle Crop Guides */}
                {customBrandMode === "wide" && (
                  <button
                    type="button"
                    onClick={() => {
                      playRealisticClick(0.2);
                      setShowCropGuides(!showCropGuides);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      showCropGuides
                        ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700"
                        : "bg-default-100 dark:bg-default-800 text-default-500 border-default-200 dark:border-default-700"
                    }`}
                    title="Tampilkan garis pandu pemotongan sisi logo"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Garis Crop:</span>
                    <span>{showCropGuides ? "On" : "Off"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick In-Place Live Adjustment Suite */}
            <div className="p-4 sm:p-5 rounded-2xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/70 dark:border-default-700/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600" />
                  <span>Kontrol Pengaturan Langsung (Ubah & Lihat Seketika)</span>
                </span>
                <span className="text-[11px] text-default-400">
                  Perubahan di bilah kontrol ini langsung tersinkronisasi ke simulator dan Sidebar asli
                </span>
              </div>

              {/* Baris 1: 4 Segmented Layout Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Control 1: Aspect Ratio */}
                <div className="p-3 rounded-xl bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 space-y-2">
                  <label className="text-[11px] font-semibold text-default-600 block">Rasio Aspek Logo</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                    <button
                      type="button"
                      onClick={() => handleBrandModeChange("square")}
                      className={`py-1.5 text-center rounded-md text-xs font-semibold cursor-pointer transition ${
                        customBrandMode === "square"
                          ? "bg-violet-600 text-white shadow-2xs font-bold"
                          : "text-default-600 hover:text-foreground"
                      }`}
                    >
                      Kotak 1:1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBrandModeChange("wide")}
                      className={`py-1.5 text-center rounded-md text-xs font-semibold cursor-pointer transition ${
                        customBrandMode === "wide"
                          ? "bg-violet-600 text-white shadow-2xs font-bold"
                          : "text-default-600 hover:text-foreground"
                      }`}
                    >
                      Melebar (Wide)
                    </button>
                  </div>
                </div>

                {/* Control 2: Header Format */}
                <div className="p-3 rounded-xl bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 space-y-2">
                  <label className="text-[11px] font-semibold text-default-600 block">Format Header Brand</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                    <button
                      type="button"
                      onClick={() => handleDisplayFormatChange("logo-and-text")}
                      className={`py-1.5 text-center rounded-md text-[10.5px] font-semibold cursor-pointer transition ${
                        customBrandDisplay === "logo-and-text"
                          ? "bg-violet-600 text-white shadow-2xs font-bold"
                          : "text-default-600 hover:text-foreground"
                      }`}
                      title="Logo + Nama & Jargon Perusahaan"
                    >
                      Teks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisplayFormatChange("logo-only")}
                      className={`py-1.5 text-center rounded-md text-[10.5px] font-semibold cursor-pointer transition ${
                        customBrandDisplay === "logo-only"
                          ? "bg-violet-600 text-white shadow-2xs font-bold"
                          : "text-default-600 hover:text-foreground"
                      }`}
                      title="Hanya Tampilkan Logo Simbol"
                    >
                      Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisplayFormatChange("full-banner")}
                      className={`py-1.5 text-center rounded-md text-[10.5px] font-semibold cursor-pointer transition ${
                        customBrandDisplay === "full-banner"
                          ? "bg-violet-600 text-white shadow-2xs font-bold"
                          : "text-default-600 hover:text-foreground"
                      }`}
                      title="Logo Banner Membentang"
                    >
                      Banner
                    </button>
                  </div>
                </div>

                {/* Control 3: Alignment Placement */}
                <div className="p-3 rounded-xl bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 space-y-2">
                  <label className="text-[11px] font-semibold text-default-600 block">Perataan Posisi (Placement)</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                    {(["left", "center", "right"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handleLogoPlacementChange(pos)}
                        className={`py-1.5 text-center rounded-md text-[10.5px] font-semibold cursor-pointer transition ${
                          brandLogoPlacement === pos
                            ? "bg-violet-600 text-white shadow-2xs font-bold"
                            : "text-default-600 hover:text-foreground"
                        }`}
                      >
                        {pos === "left" ? "Kiri" : pos === "center" ? "Tengah" : "Kanan"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 4: Tier Badge */}
                <div className="p-3 rounded-xl bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-default-600">Badge Lisensi Tier</label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showSidebarBrandBadge;
                        setShowSidebarBrandBadge(next);
                        localStorage.setItem("novajournal_sidebar_brand_badge", String(next));
                        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                        playRealisticClick();
                      }}
                      className="text-[10px] font-bold text-violet-600 hover:underline cursor-pointer"
                    >
                      {showSidebarBrandBadge ? "Aktif" : "Mati"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                    {[
                      { id: "full" as const, label: "Teks" },
                      { id: "icon-only" as const, label: "Ikon" },
                      { id: "dot" as const, label: "Dot" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setShowSidebarBrandBadge(true);
                          setBrandBadgeStyle(st.id);
                          localStorage.setItem("novajournal_sidebar_brand_badge", "true");
                          localStorage.setItem("novajournal_brand_badge_style", st.id);
                          window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                          playRealisticClick();
                        }}
                        className={`py-1.5 text-center rounded-md text-[10.5px] font-semibold cursor-pointer transition ${
                          showSidebarBrandBadge && brandBadgeStyle === st.id
                            ? "bg-violet-600 text-white shadow-2xs font-bold"
                            : "text-default-600 hover:text-foreground"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Baris 2: Dedicated Skala Bentang & Satuan Switcher Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-violet-600" />
                      <span>Skala Bentang Lebar Logo</span>
                    </label>
                    <span className="text-[11px] text-default-400">
                      ({brandLogoUnit === "percent" ? "Mode Persentase Gambar Asli" : "Mode Piksel Absolut"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Unit Switcher */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                      <button
                        type="button"
                        onClick={() => handleLogoUnitChange("percent")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                          brandLogoUnit === "percent"
                            ? "bg-violet-600 text-white shadow-2xs"
                            : "text-default-500 hover:text-foreground"
                        }`}
                      >
                        % Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogoUnitChange("px")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                          brandLogoUnit === "px"
                            ? "bg-violet-600 text-white shadow-2xs"
                            : "text-default-500 hover:text-foreground"
                        }`}
                      >
                        px Piksel
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
                      {brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={brandLogoUnit === "percent" ? 15 : 30}
                  max={brandLogoUnit === "percent" ? 100 : 260}
                  step={brandLogoUnit === "percent" ? 1 : 5}
                  value={brandLogoWidth}
                  onChange={(e) => handleLogoWidthChange(Number(e.target.value))}
                  className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />

                {/* Presets & Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-default-400 font-semibold mr-1">Preset Cepat:</span>
                    {(brandLogoUnit === "percent"
                      ? [25, 50, 75, 90, 100]
                      : [60, 100, 140, 180, 240]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleLogoWidthChange(preset)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-md border font-semibold cursor-pointer transition ${
                          brandLogoWidth === preset
                            ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-bold"
                            : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                        }`}
                      >
                        {preset}{brandLogoUnit === "percent" ? "%" : "px"}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-default-400">
                    * Persentase dihitung dari lebar asli gambar logo (100% = utuh). Pemotongan selalu simetris dari sayap kiri & kanan.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Canvas Viewports */}
            {(() => {
              const fullBannerH = 40;
              const logoOnlyH = 40;
              const logoAndTextH = 36;

              const safeRatio = Math.max(0.5, Math.min(10, logoAspectRatio || 3));
              const fullBannerNatW = Math.round(fullBannerH * safeRatio);
              const logoOnlyNatW = Math.round(logoOnlyH * safeRatio);
              const logoAndTextNatW = Math.round(logoAndTextH * safeRatio);

              const getScaledContainerW = (natW: number, maxSpace: number) => {
                if (brandLogoUnit === "percent") {
                  const scaled = Math.round(natW * (brandLogoWidth / 100));
                  return Math.min(maxSpace, Math.max(24, scaled));
                } else {
                  return Math.min(maxSpace, Math.max(24, brandLogoWidth));
                }
              };

              const fullBannerContainerW = getScaledContainerW(fullBannerNatW, 200);
              const logoOnlyContainerW = getScaledContainerW(logoOnlyNatW, 200);
              const logoAndTextContainerW = getScaledContainerW(logoAndTextNatW, 120);

              const frameClass = brandLogoFrame === "bordered"
                ? "border border-default-300 dark:border-default-700 p-0.5"
                : brandLogoFrame === "card"
                ? "bg-default-100/70 dark:bg-default-800/70 p-1 shadow-2xs"
                : brandLogoFrame === "contrast"
                ? "bg-white dark:bg-zinc-800 p-1 shadow-xs border border-default-200/60 dark:border-default-700/60"
                : "";

              const effectiveSubtext = brandSubtextMode === "none"
                ? null
                : brandSubtextMode === "entity"
                ? (entityType || "PT")
                : (customBrandJargon || selectedWorkspace?.name || "Corporate Treasury");

              return (
                <div className={`p-5 sm:p-8 rounded-2xl border ${
                  previewTheme === "dark"
                    ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                    : "bg-zinc-100 border-zinc-300 text-zinc-900"
                } flex flex-col items-center justify-center transition-colors relative overflow-hidden min-h-[480px]`}>
                  {/* Subtle background grid pattern */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, ${previewTheme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"} 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* TAB 1: FULL EXPANDED SIDEBAR SIMULATOR (240px) */}
                  {previewTab === "expanded" && (
                    <div className="w-full max-w-[260px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center mb-2">
                        <span className="text-[11px] font-mono font-bold text-default-400 uppercase tracking-widest">
                          Bilah Sidebar Aktif (Lebar 240px)
                        </span>
                      </div>

                      {/* Sidebar Mockup Container */}
                      <div className={`w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
                        previewTheme === "dark"
                          ? "bg-zinc-900 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}>
                        {/* Header: EXACT REPLICA OF SIDEBAR.TSX */}
                        <div
                          style={{ height: "56px" }}
                          className={`px-3.5 flex items-center justify-between border-b relative z-10 overflow-hidden ${
                            previewTheme === "dark"
                              ? "bg-zinc-900 border-zinc-800"
                              : "bg-white border-zinc-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full min-w-0 pr-0.5">
                            {customBrandDisplay === "full-banner" && customBrandLogo ? (
                              <div className={`flex-1 flex items-center min-w-0 pr-1 ${
                                brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                              }`}>
                                <div
                                  style={{ width: `${fullBannerContainerW}px` }}
                                  className={`relative h-10 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                                >
                                  <img
                                    src={customBrandLogo}
                                    alt="Corporate Banner"
                                    style={{
                                      width: `${fullBannerNatW}px`,
                                      minWidth: `${fullBannerNatW}px`,
                                      maxWidth: "none",
                                      height: `${fullBannerH}px`,
                                    }}
                                    className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                  />
                                  {showCropGuides && (
                                    <div className="absolute inset-0 border border-dashed border-amber-400/80 pointer-events-none flex items-center justify-between px-0.5">
                                      <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                      <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : customBrandDisplay === "logo-only" && customBrandLogo ? (
                              <div className={`flex-1 flex items-center min-w-0 ${
                                brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                              }`}>
                                {customBrandMode === "wide" ? (
                                  <div
                                    style={{ width: `${logoOnlyContainerW}px` }}
                                    className={`relative h-10 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                                  >
                                    <img
                                      src={customBrandLogo}
                                      alt="Corporate Logo"
                                      style={{
                                        width: `${logoOnlyNatW}px`,
                                        minWidth: `${logoOnlyNatW}px`,
                                        maxWidth: "none",
                                        height: `${logoOnlyH}px`,
                                      }}
                                      className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                    />
                                    {showCropGuides && (
                                      <div className="absolute inset-0 border border-dashed border-amber-400/80 pointer-events-none flex items-center justify-between px-0.5">
                                        <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                        <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className={`w-8 h-8 shrink-0 overflow-hidden rounded-none shadow-2xs border border-default-200/60 dark:border-default-700/60 ${frameClass}`}>
                                    <img
                                      src={customBrandLogo}
                                      alt="Corporate Logo"
                                      className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {customBrandLogo ? (
                                  customBrandMode === "wide" ? (
                                    <div
                                      style={{ width: `${logoAndTextContainerW}px` }}
                                      className={`relative h-9 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                                    >
                                      <img
                                        src={customBrandLogo}
                                        alt="Company Logo"
                                        style={{
                                          width: `${logoAndTextNatW}px`,
                                          minWidth: `${logoAndTextNatW}px`,
                                          maxWidth: "none",
                                          height: `${logoAndTextH}px`,
                                        }}
                                        className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                      />
                                      {showCropGuides && (
                                        <div className="absolute inset-0 border border-dashed border-amber-400/80 pointer-events-none flex items-center justify-between px-0.5">
                                          <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                          <span className="text-[8px] font-mono text-amber-500 font-bold">|</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className={`w-7 h-7 shrink-0 overflow-hidden rounded-none shadow-2xs border border-default-200/60 dark:border-default-700/60 ${frameClass}`}>
                                      <img
                                        src={customBrandLogo}
                                        alt="Company Logo"
                                        className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                                      />
                                    </div>
                                  )
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-2xs shrink-0">
                                    {customBrandName ? customBrandName.charAt(0).toUpperCase() : "C"}
                                  </div>
                                )}
                                {sidebarBrandDisplayMode !== "icon" && (
                                  <div className="flex flex-col min-w-0 leading-tight">
                                    <span className={`text-xs font-bold truncate ${
                                      previewTheme === "dark" ? "text-white" : "text-gray-900"
                                    }`}>
                                      {customBrandName || "Nova Solusi Finansial"}
                                    </span>
                                    {effectiveSubtext && (
                                      <span className={`text-[9px] font-medium truncate ${
                                        previewTheme === "dark" ? "text-zinc-400" : "text-zinc-500"
                                      }`}>
                                        {effectiveSubtext}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Enterprise Badge */}
                            {showSidebarBrandBadge && (
                              brandBadgeStyle === "dot" ? (
                                <span
                                  title="Enterprise Workspace Verified"
                                  className="relative flex h-2.5 w-2.5 shrink-0 ml-1"
                                >
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
                                </span>
                              ) : (
                                <span className={`flex items-center ${
                                  brandBadgeStyle === "icon-only" ? "p-1 rounded-md" : "gap-1 px-1.5 py-0.5 rounded-md"
                                } bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[9px] font-bold shrink-0 ml-1`}>
                                  <Crown className="w-2.5 h-2.5 text-violet-500" />
                                  {brandBadgeStyle === "full" && <span>Enterprise</span>}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Simulated Body Navigation */}
                        <div className="p-2 space-y-3">
                          {/* Workspace Tag */}
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center justify-between ${
                            previewTheme === "dark" ? "bg-zinc-800/80 text-zinc-300" : "bg-zinc-100 text-zinc-700"
                          }`}>
                            <span className="truncate">{selectedWorkspace?.name || "Corporate Workspace"}</span>
                            <span className="text-[9px] font-mono px-1 rounded bg-violet-600 text-white uppercase">
                              {selectedWorkspace?.type || "PT"}
                            </span>
                          </div>

                          {/* Navigation Group 1 */}
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-default-400 px-2 uppercase tracking-wider">
                              Overview
                            </span>
                            {/* Active Item */}
                            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold shadow-xs">
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span>Dashboard</span>
                              </div>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                            {/* Inactive Item */}
                            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium ${
                              previewTheme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                            }`}>
                              <Wallet className="w-3.5 h-3.5 text-default-400" />
                              <span>Transaksi</span>
                            </div>
                          </div>

                          {/* Navigation Group 2: Reporting */}
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-default-400 px-2 uppercase tracking-wider">
                              Reporting & Finance
                            </span>
                            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium ${
                              previewTheme === "dark" ? "text-zinc-400" : "text-zinc-600"
                            }`}>
                              <FileSpreadsheet className="w-3.5 h-3.5 text-default-400" />
                              <span>Laporan Keuangan</span>
                            </div>
                            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium ${
                              previewTheme === "dark" ? "text-zinc-400" : "text-zinc-600"
                            }`}>
                              <LayoutList className="w-3.5 h-3.5 text-default-400" />
                              <span>Manajemen Menu</span>
                            </div>
                          </div>

                          {/* Bottom Core Engine Preview */}
                          <div className={`px-2 py-1.5 rounded-xl border flex items-center justify-between ${
                            previewTheme === "dark"
                              ? "bg-zinc-800/40 border-zinc-700/50"
                              : "bg-zinc-100/70 border-zinc-200"
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                                <Wallet className="w-2.5 h-2.5" />
                              </div>
                              <div className="flex flex-col leading-none">
                                <span className="text-[9px] font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                  NovaFinance
                                </span>
                                <span className="text-[7px] text-default-400">Core Engine</span>
                              </div>
                            </div>
                            <span className="text-[7px] font-mono px-1 rounded bg-default-200 dark:bg-default-700 text-default-500 uppercase">
                              V2.5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: COLLAPSED RAIL SIMULATOR (64px) */}
                  {previewTab === "collapsed" && (
                    <div className="relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                      <div className="text-center mb-2">
                        <span className="text-[11px] font-mono font-bold text-default-400 uppercase tracking-widest">
                          Bilah Ramping (Rail 64px)
                        </span>
                      </div>
                      <div className={`w-16 rounded-2xl border shadow-2xl overflow-hidden flex flex-col items-center ${
                        previewTheme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      }`}>
                        {/* Collapsed Header */}
                        <div style={{ height: "56px" }} className="w-full flex items-center justify-center border-b border-default-200/60 dark:border-default-800/60 px-1">
                          {customBrandLogo ? (
                            <div className="w-8 h-8 shrink-0 overflow-hidden rounded-none shadow-2xs">
                              <img
                                src={customBrandLogo}
                                alt="Logo"
                                className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                              />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {customBrandName ? customBrandName.charAt(0).toUpperCase() : "C"}
                            </div>
                          )}
                        </div>
                        {/* Rail Icons */}
                        <div className="py-3 space-y-2 flex flex-col items-center">
                          <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div className="w-9 h-9 rounded-xl text-default-400 flex items-center justify-center hover:bg-default-100">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div className="w-9 h-9 rounded-xl text-default-400 flex items-center justify-center hover:bg-default-100">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: JOINT NAVBAR & SIDEBAR INTERSECTION */}
                  {previewTab === "joint" && (
                    <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center mb-2">
                        <span className="text-[11px] font-mono font-bold text-default-400 uppercase tracking-widest">
                          Integrasi Sudut Atas (Navbar + Header Sidebar)
                        </span>
                      </div>
                      <div className={`rounded-2xl border shadow-2xl overflow-hidden flex ${
                        previewTheme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      }`}>
                        {/* Simulated Sidebar Header (Left) */}
                        <div style={{ width: "220px", height: "56px" }} className="px-3 border-r border-default-200/60 dark:border-default-800/60 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            {customBrandLogo ? (
                              customBrandMode === "wide" ? (
                                <div style={{ width: `${logoAndTextContainerW}px` }} className={`relative h-8 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}>
                                  <img
                                    src={customBrandLogo}
                                    alt="Logo"
                                    style={{
                                      width: `${logoAndTextNatW}px`,
                                      minWidth: `${logoAndTextNatW}px`,
                                      maxWidth: "none",
                                      height: "32px",
                                    }}
                                    className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                  />
                                </div>
                              ) : (
                                <div className={`w-7 h-7 shrink-0 overflow-hidden rounded-none shadow-2xs ${frameClass}`}>
                                  <img src={customBrandLogo} alt="Logo" className="w-full h-full object-cover rounded-none select-none pointer-events-none" />
                                </div>
                              )
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                                {customBrandName ? customBrandName.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                            <span className={`text-xs font-bold truncate ${
                              previewTheme === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              {customBrandName || "Nova Solusi"}
                            </span>
                          </div>
                          {showSidebarBrandBadge && (
                            brandBadgeStyle === "dot" ? (
                              <span className="relative flex h-2 w-2 shrink-0 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                              </span>
                            ) : (
                              <Crown className="w-3 h-3 text-violet-500 shrink-0" />
                            )
                          )}
                        </div>

                        {/* Simulated Navbar (Right) */}
                        <div style={{ height: "56px" }} className="flex-1 px-4 flex items-center justify-between gap-3">
                          <div className={`h-8 flex-1 max-w-xs rounded-xl px-3 flex items-center text-xs text-default-400 border ${
                            previewTheme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                          }`}>
                            <span>Pencarian global (Ctrl + K)...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                              A
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SIDE-BY-SIDE MODE COMPARATOR */}
                  {previewTab === "compare" && (
                    <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center mb-3">
                        <span className="text-[11px] font-mono font-bold text-default-400 uppercase tracking-widest">
                          Komparasi Langsung: Kotak 1:1 vs Melebar (Wide Custom)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card A: Square */}
                        <div className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
                          previewTheme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">A. Kotak 1:1 (Square)</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-500">
                              32 × 32 px
                            </span>
                          </div>
                          <div className="h-20 rounded-xl bg-default-50 dark:bg-default-800/40 border border-dashed border-default-200 dark:border-default-700 flex items-center justify-center p-2">
                            {customBrandLogo ? (
                              <div className="w-12 h-12 shrink-0 overflow-hidden rounded-none shadow-2xs border border-default-200 dark:border-default-700">
                                <img
                                  src={customBrandLogo}
                                  alt="Square Logo"
                                  className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center">
                                {customBrandName ? customBrandName.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-default-400 leading-relaxed">
                            Format persegi 1:1 dengan auto-crop gambar ke tengah. Monogram lambang, inisial holding, atau icon shield tanpa distorsi.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleBrandModeChange("square")}
                            className={`w-full py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                              customBrandMode === "square"
                                ? "bg-violet-600 text-white font-bold"
                                : "bg-default-100 dark:bg-default-800 text-default-600 hover:bg-default-200"
                            }`}
                          >
                            {customBrandMode === "square" ? "✓ Mode Terpilih" : "Gunakan Mode Kotak"}
                          </button>
                        </div>

                        {/* Card B: Wide */}
                        <div className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
                          previewTheme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">B. Melebar (Wide / Banner)</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 font-bold">
                              {brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"} × 40 px
                            </span>
                          </div>
                          <div className="h-20 rounded-xl bg-default-50 dark:bg-default-800/40 border border-dashed border-default-200 dark:border-default-700 flex items-center justify-center p-2">
                            <div
                              style={{ width: `${getScaledContainerW(fullBannerNatW, 220)}px` }}
                              className={`relative h-10 overflow-hidden rounded-none border border-violet-500/40 select-none ${frameClass}`}
                            >
                              {customBrandLogo ? (
                                <img
                                  src={customBrandLogo}
                                  alt="Wide Logo"
                                  style={{
                                    width: `${fullBannerNatW}px`,
                                    minWidth: `${fullBannerNatW}px`,
                                    maxWidth: "none",
                                    height: `${fullBannerH}px`,
                                  }}
                                  className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-default-400">
                                  Logo Belum Dipilih
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-default-400 leading-relaxed">
                            Menampilkan corporate wordmark atau banner horizontal dengan pemotongan simetris sisi kanan-kiri (True Side-Crop).
                          </p>
                          <button
                            type="button"
                            onClick={() => handleBrandModeChange("wide")}
                            className={`w-full py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                              customBrandMode === "wide"
                                ? "bg-violet-600 text-white font-bold"
                                : "bg-default-100 dark:bg-default-800 text-default-600 hover:bg-default-200"
                            }`}
                          >
                            {customBrandMode === "wide" ? "✓ Mode Terpilih" : "Gunakan Mode Melebar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Technical Specifications & Telemetry Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Telemetry 1 */}
              <div className="p-4 rounded-2xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Dimensi Aktif</span>
                    <span className="text-[10px] text-default-400 font-mono">Skala & Layout</span>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-default-100 dark:border-default-800">
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Bentang Lebar:</span>
                    <span className="font-mono font-bold text-foreground">{brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Tinggi Standar:</span>
                    <span className="font-mono font-bold text-foreground">40 px (Header 56px)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Perataan Aktif:</span>
                    <span className="font-mono font-bold capitalize text-violet-600 dark:text-violet-400">{brandLogoPlacement}</span>
                  </div>
                </div>
              </div>

              {/* Telemetry 2 */}
              <div className="p-4 rounded-2xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">True Side-Cropping</span>
                    <span className="text-[10px] text-default-400 font-mono">Tanpa Distorsi / Zoom</span>
                  </div>
                </div>
                <p className="text-[11px] text-default-500 leading-relaxed border-t border-default-100 dark:border-default-800 pt-1.5">
                  Saat mode Melebar aktif dengan bentang {brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"}, CSS secara simetris menyembunyikan sisi sayap kiri & kanan gambar tanpa memelar, meregang, atau memperkecil aspect ratio.
                </p>
              </div>

              {/* Telemetry 3 */}
              <div className="p-4 rounded-2xl bg-default-50/70 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Lisensi Enterprise</span>
                    <span className="text-[10px] text-default-400 font-mono">White-Label Status</span>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-default-100 dark:border-default-800">
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Lisensi Aktif:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isEnterprise ? "Enterprise Verified" : "Mode Uji Coba"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Sudut Logo:</span>
                    <span className="font-mono font-bold text-foreground">rounded-none (Presisi)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Penyimpanan:</span>
                    <span className="font-mono text-default-600">MinIO S3 WebP</span>
                  </div>
                </div>
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
                  const clamped = clampPan(logoPanX, logoPanY, logoZoom, cropMode);
                  const curW = clamped.curW;
                  const curH = clamped.curH;

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
                        ? "w-[280px] h-[120px]"
                        : "w-[220px] h-[220px]"
                    } rounded-none border-2 border-dashed border-white/90 ring-1 ring-black/40 transition-all duration-200`}
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
              <button
                type="button"
                className="text-xs px-3.5 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-200 hover:bg-default-100 dark:hover:bg-default-700 cursor-pointer font-medium transition"
                onClick={() => setIsCropModalOpen(false)}
              >
                Batal
              </button>
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
              {/* Mode Satuan Bentang Lebar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Satuan Pengukuran (Unit)</span>
                  <span className="text-[10px] text-default-400 font-mono">
                    Mode saat ini: {brandLogoUnit === "percent" ? "Persentase (%)" : "Piksel Statis (px)"}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
                  <button
                    type="button"
                    onClick={() => handleLogoUnitChange("percent")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      brandLogoUnit === "percent"
                        ? "bg-violet-600 text-white shadow-xs"
                        : "text-default-600 dark:text-default-300 hover:text-foreground hover:bg-default-200/50"
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Persentase (%) - Responsif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogoUnitChange("px")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      brandLogoUnit === "px"
                        ? "bg-violet-600 text-white shadow-xs"
                        : "text-default-600 dark:text-default-300 hover:text-foreground hover:bg-default-200/50"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Piksel (px) - Tetap</span>
                  </button>
                </div>
              </div>

              {/* Slider Lebar Logo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Bentang Lebar Logo</span>
                    <span className="text-[10px] text-default-400">
                      ({brandLogoUnit === "percent" ? "15% - 100%" : "30px - 260px"})
                    </span>
                  </label>
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 px-2.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                    {brandLogoWidth} {brandLogoUnit === "percent" ? "%" : "px"}
                  </span>
                </div>
                <input
                  type="range"
                  min={brandLogoUnit === "percent" ? "15" : "30"}
                  max={brandLogoUnit === "percent" ? "100" : "260"}
                  step={brandLogoUnit === "percent" ? "1" : "2"}
                  value={brandLogoWidth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBrandLogoWidth(val);
                    localStorage.setItem("novajournal_brand_logo_width", String(val));
                    if (selectedWorkspace?.id) {
                      localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, String(val));
                    }
                    window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                  }}
                  className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(brandLogoUnit === "percent"
                    ? [
                        { label: "25% (Ramping)", val: 25 },
                        { label: "50% (Sedang)", val: 50 },
                        { label: "75% (Proporsional)", val: 75 },
                        { label: "90% (Hampir Penuh)", val: 90 },
                        { label: "100% (Penuh Sidebar)", val: 100 },
                      ]
                    : [
                        { label: "60px", val: 60 },
                        { label: "100px", val: 100 },
                        { label: "140px", val: 140 },
                        { label: "180px", val: 180 },
                        { label: "220px", val: 220 },
                      ]
                  ).map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        playRealisticClick(0.3);
                        setBrandLogoWidth(preset.val);
                        localStorage.setItem("novajournal_brand_logo_width", String(preset.val));
                        if (selectedWorkspace?.id) {
                          localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, String(preset.val));
                        }
                        window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        brandLogoWidth === preset.val
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
                    { id: "left" as const, label: "Rata Kiri", desc: "Left aligned", icon: AlignLeft },
                    { id: "center" as const, label: "Rata Tengah", desc: "Centered logo", icon: AlignCenter },
                    { id: "right" as const, label: "Rata Kanan", desc: "Right aligned", icon: AlignRight },
                  ].map((pos) => {
                    const PosIcon = pos.icon;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => {
                          playRealisticClick(0.3);
                          setBrandLogoPlacement(pos.id);
                          localStorage.setItem("novajournal_brand_logo_placement", pos.id);
                          if (selectedWorkspace?.id) {
                            localStorage.setItem(`novajournal_brand_logo_placement_${selectedWorkspace.id}`, pos.id);
                          }
                          window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          brandLogoPlacement === pos.id
                            ? "border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 ring-1 ring-violet-500/30"
                            : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-800/40 hover:bg-default-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1">
                            <PosIcon className="w-3.5 h-3.5 text-violet-500" />
                            {pos.label}
                          </span>
                          {brandLogoPlacement === pos.id && <Check className="w-3.5 h-3.5 text-violet-600" />}
                        </div>
                        <span className="text-[10px] text-default-400">{pos.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Simulated Preview Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-default-400 uppercase tracking-wider block">
                  Simulasi Tampilan Header Sidebar ({brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"})
                </span>
                <div className="w-full h-16 rounded-xl border border-default-200 dark:border-default-700 bg-default-100/70 dark:bg-default-800/50 px-3 flex items-center overflow-hidden">
                  <div className={`w-full flex items-center ${
                    brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                  }`}>
                    {customBrandLogo ? (() => {
                      const modalBannerH = 40;
                      const modalSafeRatio = Math.max(0.5, Math.min(10, logoAspectRatio || 3));
                      const modalBannerNatW = Math.round(modalBannerH * modalSafeRatio);
                      const modalContainerW = brandLogoUnit === "percent"
                        ? Math.min(380, Math.max(24, Math.round(modalBannerNatW * (brandLogoWidth / 100))))
                        : Math.min(380, Math.max(24, brandLogoWidth));
                      return (
                        <div
                          style={{
                            width: `${modalContainerW}px`,
                            maxWidth: "100%",
                          }}
                          className="relative h-10 shrink-0 overflow-hidden rounded-none select-none transition-all duration-150"
                        >
                          <img
                            key={customBrandLogo}
                            src={customBrandLogo}
                            alt="Simulated Logo"
                            style={{
                              width: `${modalBannerNatW}px`,
                              minWidth: `${modalBannerNatW}px`,
                              maxWidth: "none",
                              height: `${modalBannerH}px`,
                            }}
                            className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        </div>
                      );
                    })() : (
                      <div
                        style={{
                          width: brandLogoUnit === "percent" ? `${brandLogoWidth}%` : `${brandLogoWidth}px`,
                          maxWidth: "100%",
                        }}
                        className="h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-600 text-xs font-bold"
                      >
                        Logo Banner ({brandLogoWidth}{brandLogoUnit === "percent" ? "%" : "px"})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <button
                type="button"
                className="text-xs px-3.5 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-200 hover:bg-default-100 dark:hover:bg-default-700 cursor-pointer font-medium transition"
                onClick={() => {
                  setBrandLogoUnit("percent");
                  setBrandLogoWidth(100);
                  setBrandLogoPlacement("left");
                  localStorage.setItem("novajournal_brand_logo_unit", "percent");
                  localStorage.setItem("novajournal_brand_logo_width", "100");
                  localStorage.setItem("novajournal_brand_logo_placement", "left");
                  if (selectedWorkspace?.id) {
                    localStorage.setItem(`novajournal_brand_logo_unit_${selectedWorkspace.id}`, "percent");
                    localStorage.setItem(`novajournal_brand_logo_width_${selectedWorkspace.id}`, "100");
                    localStorage.setItem(`novajournal_brand_logo_placement_${selectedWorkspace.id}`, "left");
                  }
                  window.dispatchEvent(new Event("novajournal_brand_config_changed"));
                }}
              >
                Reset Default (100%)
              </button>
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
