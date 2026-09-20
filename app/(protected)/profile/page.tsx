/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
} from "@heroui/react";
import {
  User,
  Upload,
  Camera,
  RotateCcw,
  X,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Globe,
  Clock,
  Save,
  ShieldCheck,
  Sparkles,
  Building,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Maximize2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { playSoftChime, playNovaSpaceSound, playRealisticClick } from "@/app/lib/sound";
import { api, mutationFunctions } from "@/app/lib/queries";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";

export const COUNTRY_CODES = [
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia", format: "812-3456-7890" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States", format: "(555) 123-4567" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore", format: "9123-4567" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia", format: "12-345-6789" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom", format: "7911-123456" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan", format: "90-1234-5678" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia", format: "412-345-678" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany", format: "151-2345-6789" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE", format: "50-123-4567" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia", format: "50-123-4567" },
];

const PROFILE_SECTIONS = [
  { id: "avatar", name: "Foto Avatar & Visual Profil", shortName: "Avatar", icon: Camera, color: "#3b82f6" },
  { id: "personal", name: "Data Pribadi & Posisi Jabatan", shortName: "Data Pribadi", icon: User, color: "#8b5cf6" },
  { id: "preferences", name: "Preferensi Regional & Waktu", shortName: "Preferensi", icon: Globe, color: "#10b981" },
];

export function formatPhoneNational(digits: string, countryCode: string): string {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "";
  if (countryCode === "+62") {
    if (clean.length <= 3) return clean;
    if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 12)}`;
  } else if (countryCode === "+1") {
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `(${clean.slice(0, 3)}) ${clean.slice(3)}`;
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
  } else {
    if (clean.length <= 4) return clean;
    if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t, isId } = useIntlLanguage();

  // Toast Notice
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Form States
  const [firstName, setFirstName] = useState("User");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("Chief Financial Officer");
  const [department, setDepartment] = useState("Corporate Treasury");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+62 812-3456-7890");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+62");
  const [phoneNational, setPhoneNational] = useState("812-3456-7890");
  const [profileBio, setProfileBio] = useState(
    "Bertanggung jawab atas tata kelola keuangan, alokasi anggaran belanja, dan strategi portofolio kas perusahaan."
  );
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB)");
  const [preferredLang, setPreferredLang] = useState("id");

  // Autosave Status
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Avatar Management State with Clamping Support
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);
  const [isAnimatedGif, setIsAnimatedGif] = useState(false);
  const [fileFormatName, setFileFormatName] = useState("PNG");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarPanX, setAvatarPanX] = useState(0);
  const [avatarPanY, setAvatarPanY] = useState(0);
  const [imageNatSize, setImageNatSize] = useState<{ w: number; h: number }>({ w: 400, h: 400 });
  const [navbarAvatarSize, setNavbarAvatarSize] = useState<number>(28);

  // Anchor & Folding State
  const [activeSectionId, setActiveSectionId] = useState("avatar");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    avatar: false,
    personal: false,
    preferences: false,
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
      avatar: nextState,
      personal: nextState,
      preferences: nextState,
    });
  };

  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = PROFILE_SECTIONS[0].id;
      for (const sec of PROFILE_SECTIONS) {
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
        currentSecId = PROFILE_SECTIONS[PROFILE_SECTIONS.length - 1].id;
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

  const activeSec = PROFILE_SECTIONS.find((s) => s.id === activeSectionId) || PROFILE_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Saved Profile & Avatar from PostgreSQL Database & MinIO S3
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteProfile() {
      try {
        const res = await api.getUserProfile();
        if (res.success && res.data && isMounted) {
          const d = res.data;
          if (d.image) {
            setAvatarImage(d.image);
            localStorage.setItem("novajournal_user_avatar", d.image);
          }
          if (d.name) {
            setDisplayName(d.name);
            const parts = d.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (d.email) setEmailAddress(d.email);
          if (d.phone) setPhoneNumber(d.phone);
          if (d.jobTitle) setJobTitle(d.jobTitle);
          if (d.department) setDepartment(d.department);
          if (d.bio) setProfileBio(d.bio);
          if (d.timezone) setTimezone(d.timezone);
          if (d.lang) setPreferredLang(d.lang);
          return;
        }
      } catch {
        // Fallback to local storage if offline or not logged in yet
      }

      // Local storage fallback
      try {
        const savedAvatar = localStorage.getItem("novajournal_user_avatar");
        if (savedAvatar && isMounted) setAvatarImage(savedAvatar);

        const savedNavAvatarSize = localStorage.getItem("novajournal_navbar_avatar_size");
        if (savedNavAvatarSize && isMounted) setNavbarAvatarSize(Number(savedNavAvatarSize) || 28);

        const userKey = user ? `novajournal_user_profile_${user.id || user.email}` : "novajournal_user_profile_default";
        const savedProfile = localStorage.getItem(userKey);
        if (savedProfile && isMounted) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.firstName) setFirstName(parsed.firstName);
          if (parsed.lastName) setLastName(parsed.lastName);
          if (parsed.displayName) setDisplayName(parsed.displayName);
          if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
          if (parsed.department) setDepartment(parsed.department);
          if (parsed.email) setEmailAddress(parsed.email);
          if (parsed.phone) setPhoneNumber(parsed.phone);
          if (parsed.bio) setProfileBio(parsed.bio);
          if (parsed.timezone) setTimezone(parsed.timezone);
          if (parsed.lang) setPreferredLang(parsed.lang);
        } else if (user && isMounted) {
          if (user.name) {
            const parts = user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
            setDisplayName(user.name);
          }
          if (user.email) setEmailAddress(user.email);
        }
      } catch {}
    }

    loadRemoteProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // File Upload Handling
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const isGif = fileType.includes("gif") || file.name.toLowerCase().endsWith(".gif");
    setIsAnimatedGif(isGif);

    if (fileType.includes("webp")) setFileFormatName("WEBP");
    else if (isGif) setFileFormatName("GIF");
    else if (fileType.includes("png")) setFileFormatName("PNG");
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
        setAvatarZoom(1);
        setAvatarPanX(0);
        setAvatarPanY(0);
        setIsCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Save GIF Directly (preserving animated frames) via MinIO S3 & DB
  const handleSaveAnimatedGifDirectly = async () => {
    if (!selectedFileForCrop) return;
    setUploadingAvatar(true);
    try {
      // 1. Upload to MinIO S3 & persist in PostgreSQL user.image
      const res = await mutationFunctions.uploadAvatar(selectedFileForCrop);
      const avatarUrl = res.avatarUrl || selectedFileForCrop;
      setAvatarImage(avatarUrl);
      localStorage.setItem("novajournal_user_avatar", avatarUrl);
      window.dispatchEvent(new Event("novajournal_avatar_changed"));
      setIsCropModalOpen(false);
      playSoftChime();
      showNotice("Avatar animasi GIF berhasil diunggah ke MinIO S3 & tersimpan di database!");
    } catch (err: any) {
      console.warn("MinIO upload failed, saving locally:", err);
      setAvatarImage(selectedFileForCrop);
      localStorage.setItem("novajournal_user_avatar", selectedFileForCrop);
      window.dispatchEvent(new Event("novajournal_avatar_changed"));
      setIsCropModalOpen(false);
      playSoftChime();
      showNotice("Avatar animasi GIF berhasil disimpan!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Crop Math & Bounds Clamping (Ensures image NEVER bleeds out of frame)
  const CROP_BOX_SIZE = 300;
  const CROP_CIRCLE_DIAMETER = 240;

  const baseScale = Math.max(
    CROP_CIRCLE_DIAMETER / (imageNatSize.w || 1),
    CROP_CIRCLE_DIAMETER / (imageNatSize.h || 1)
  );

  const displayedW = (imageNatSize.w || 1) * baseScale * avatarZoom;
  const displayedH = (imageNatSize.h || 1) * baseScale * avatarZoom;

  const clampPan = (px: number, py: number, currentZoom: number = avatarZoom) => {
    const curW = (imageNatSize.w || 1) * baseScale * currentZoom;
    const curH = (imageNatSize.h || 1) * baseScale * currentZoom;
    const mx = Math.max(0, (curW - CROP_CIRCLE_DIAMETER) / 2);
    const my = Math.max(0, (curH - CROP_CIRCLE_DIAMETER) / 2);
    return {
      x: Math.max(-mx, Math.min(mx, px)),
      y: Math.max(-my, Math.min(my, py)),
    };
  };

  // Save Square Cropped Avatar (High-res 512x512 square WITHOUT circular clipping)
  const handleSaveCroppedAvatar = () => {
    if (!selectedFileForCrop) return;

    if (isAnimatedGif) {
      handleSaveAnimatedGifDirectly();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const OUT_SIZE = 512;
      canvas.width = OUT_SIZE;
      canvas.height = OUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // DO NOT circular clip! Crop as crisp square matching circle bounding box!
      const scaleRatio = OUT_SIZE / CROP_CIRCLE_DIAMETER;
      const drawW = displayedW * scaleRatio;
      const drawH = displayedH * scaleRatio;
      const drawX = (OUT_SIZE / 2) + (avatarPanX * scaleRatio) - (drawW / 2);
      const drawY = (OUT_SIZE / 2) + (avatarPanY * scaleRatio) - (drawH / 2);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      let compressedDataUrl: string;
      try {
        compressedDataUrl = canvas.toDataURL("image/webp", 0.95);
      } catch {
        compressedDataUrl = canvas.toDataURL("image/png");
      }

      setUploadingAvatar(true);
      try {
        const res = await mutationFunctions.uploadAvatar(compressedDataUrl);
        const avatarUrl = res.avatarUrl || compressedDataUrl;
        setAvatarImage(avatarUrl);
        localStorage.setItem("novajournal_user_avatar", avatarUrl);
        window.dispatchEvent(new Event("novajournal_avatar_changed"));
        setIsCropModalOpen(false);
        playSoftChime();
        showNotice("Avatar profil tersimpan di database & MinIO S3!");
      } catch (err: any) {
        console.warn("MinIO upload failed, saving locally:", err);
        setAvatarImage(compressedDataUrl);
        localStorage.setItem("novajournal_user_avatar", compressedDataUrl);
        window.dispatchEvent(new Event("novajournal_avatar_changed"));
        setIsCropModalOpen(false);
        playSoftChime();
        showNotice("Avatar profil berhasil disimpan!");
      } finally {
        setUploadingAvatar(false);
      }
    };
    img.src = selectedFileForCrop;
  };

  // Debounced Autosave for Profile fields
  useEffect(() => {
    if (!isInitialized) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const profileData = {
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`.trim(),
          email: emailAddress,
          phone: phoneNumber,
          jobTitle,
          department,
          bio: profileBio,
          timezone,
          lang: preferredLang,
        };

        await mutationFunctions.updateUserProfile({
          name: profileData.displayName,
          jobTitle: profileData.jobTitle,
          department: profileData.department,
          phone: profileData.phone,
          bio: profileData.bio,
          timezone: profileData.timezone,
          lang: profileData.lang,
        });

        const userKey = user ? `novajournal_user_profile_${user.id || user.email}` : "novajournal_user_profile_default";
        localStorage.setItem(userKey, JSON.stringify(profileData));

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (e) {
        console.warn("Autosave locally fallback:", e);
        const userKey = user ? `novajournal_user_profile_${user.id || user.email}` : "novajournal_user_profile_default";
        localStorage.setItem(userKey, JSON.stringify({ firstName, lastName, displayName, email: emailAddress, phone: phoneNumber, jobTitle, department, bio: profileBio, timezone, lang: preferredLang }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    }, 700);

  }, [firstName, lastName, displayName, emailAddress, phoneNumber, jobTitle, department, profileBio, timezone, preferredLang, isInitialized]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 sm:mt-8 pt-2">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
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
            {saveStatus === "idle" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-default-100 dark:bg-default-800/80 text-default-500 text-[11px] font-medium select-none">
                <CheckCircle2 className="w-3 h-3 text-default-400" />
                <span>{isId ? "Autosave aktif" : "Autosave active"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tier 2: Title in 1 Full Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isId ? "Profil Pengguna & Identitas Eksekutif" : "User Profile & Executive Identity"}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold tracking-wide">
            {isId ? "Akun Personal" : "Personal Account"}
          </span>
        </div>

        {/* Tier 3: Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-2xl leading-relaxed">
            {isId
              ? "Kelola profil personal, foto avatar, data kontak, dan preferensi akun Anda di NovaFinance."
              : "Manage your personal profile, avatar photo, contact info, and account preferences in NovaFinance."}
          </p>
        </div>
      </div>

      {/* Sticky Top Anchor Bar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-foreground">{isId ? "Seksi:" : "Section:"}</span>
          <div className="flex items-center gap-1">
            {PROFILE_SECTIONS.map((sec) => {
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

      {/* Section 1: Avatar Management */}
      <Card
        id="section-avatar"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("avatar")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                1. Foto Avatar & Visual Profil
              </h2>
              <p className="text-[11px] text-default-400">
                Kustomisasi foto profil avatar, visual identitas, dan animasi avatar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {avatarImage ? "Kustom" : "Default"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.avatar ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.avatar && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-blue-500/40 dark:border-blue-400/40 bg-default-100 dark:bg-default-800 shadow-md flex items-center justify-center">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Ubah</span>
                </button>
              </div>

              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Unggah Foto Profil Baru
                  </h3>
                  <p className="text-xs text-default-500 mt-0.5 leading-relaxed">
                    Mendukung WebP, GIF Animasi, PNG, dan JPG. Maksimal 10MB.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelected}
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <Button
                    size="sm"
                    className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>Pilih Foto Baru...</span>
                  </Button>

                  {avatarImage && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-3 text-xs text-default-600 dark:text-default-400 cursor-pointer"
                      onPress={() => {
                        localStorage.removeItem("novajournal_user_avatar");
                        setAvatarImage(null);
                        window.dispatchEvent(new Event("novajournal_avatar_changed"));
                        showNotice("Avatar direset ke bawaan akun.");
                      }}
                    >
                      Reset Default
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Navbar Avatar Resize Control */}
            <div className="mt-5 pt-4 border-t border-default-100 dark:border-default-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                    Ukuran Avatar di Bilah Atas (Navbar)
                  </h4>
                  <p className="text-[11px] text-default-500">
                    Atur seberapa besar foto avatar profil Anda tampil pada pojok kanan atas Navbar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                    {navbarAvatarSize} px
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 flex flex-col md:flex-row items-center gap-5">
                {/* Live Mini Preview */}
                <div className="flex items-center gap-3 shrink-0 p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xs">
                  <div
                    style={{ width: `${navbarAvatarSize}px`, height: `${navbarAvatarSize}px` }}
                    className="rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs overflow-hidden shrink-0 transition-all"
                  >
                    {avatarImage ? (
                      <img src={avatarImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: `${Math.max(10, navbarAvatarSize * 0.42)}px` }}>
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left pr-2">
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {displayName || firstName}
                    </span>
                    <span className="text-[10px] text-default-400 leading-tight">
                      Pratinjau Navbar
                    </span>
                  </div>
                </div>

                {/* Slider and Preset Buttons */}
                <div className="flex-1 w-full space-y-2.5">
                  <input
                    type="range"
                    min="22"
                    max="48"
                    step="2"
                    value={navbarAvatarSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNavbarAvatarSize(val);
                      localStorage.setItem("novajournal_navbar_avatar_size", String(val));
                      window.dispatchEvent(new Event("novajournal_navbar_config_changed"));
                    }}
                    className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: "Ringkas (24px)", size: 24 },
                      { label: "Standar (28px)", size: 28 },
                      { label: "Sedang (34px)", size: 34 },
                      { label: "Besar (40px)", size: 40 },
                      { label: "Maksimal (46px)", size: 46 },
                    ].map((p) => (
                      <button
                        key={p.size}
                        type="button"
                        onClick={() => {
                          playRealisticClick(0.3);
                          setNavbarAvatarSize(p.size);
                          localStorage.setItem("novajournal_navbar_avatar_size", String(p.size));
                          window.dispatchEvent(new Event("novajournal_navbar_config_changed"));
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                          navbarAvatarSize === p.size
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Personal Information Form */}
      <Card
        id="section-personal"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("personal")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                2. Data Pribadi & Posisi Jabatan
              </h2>
              <p className="text-[11px] text-default-400">
                Nama lengkap, peran eksekutif, departemen korporat, dan kontak komunikasi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {jobTitle || "Eksekutif"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.personal ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.personal && (
          <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Nama Depan *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Nama Belakang
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Jabatan / Job Title
            </label>
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-default-400 absolute left-3 top-3" />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Contoh: Chief Financial Officer"
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Departemen / Divisi
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-default-400 absolute left-3 top-3" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Contoh: Corporate Finance & Treasury"
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Alamat Email Akun
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-default-400 absolute left-3 top-3" />
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone Number with Country Code Dropdown & Stripes Auto-formatting */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              {isId ? "Nomor Telepon / WhatsApp" : "Phone / WhatsApp"}
            </label>
            <div className="flex items-center gap-2">
              {/* Country Code Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setSelectedCountryCode(newCode);
                    const digits = phoneNational.replace(/\D/g, "");
                    const formatted = formatPhoneNational(digits, newCode);
                    setPhoneNational(formatted);
                    setPhoneNumber(`${newCode} ${formatted}`.trim());
                  }}
                  className="h-9 pl-2.5 pr-6 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-blue-500 cursor-pointer appearance-none"
                  aria-label="Kode Negara"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code + c.country} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-default-400 absolute right-2 top-3 pointer-events-none" />
              </div>

              {/* National Number Input with Stripes & Prefix */}
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 text-default-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phoneNational}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Auto-detect if user pastes/types international code with +
                    if (val.startsWith("+")) {
                      const matched = COUNTRY_CODES.find((c) => val.startsWith(c.code));
                      if (matched) {
                        setSelectedCountryCode(matched.code);
                        val = val.slice(matched.code.length);
                      }
                    } else if (val.startsWith("0")) {
                      // Strip leading 0
                      val = val.slice(1);
                    }
                    const digits = val.replace(/\D/g, "");
                    const formatted = formatPhoneNational(digits, selectedCountryCode);
                    setPhoneNational(formatted);
                    setPhoneNumber(`${selectedCountryCode} ${formatted}`.trim());
                  }}
                  placeholder={
                    COUNTRY_CODES.find((c) => c.code === selectedCountryCode)?.format || "812-3456-7890"
                  }
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground font-mono focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-default-400">
              {isId
                ? `Format tersimpan: ${phoneNumber || `${selectedCountryCode} ...`}`
                : `Stored format: ${phoneNumber || `${selectedCountryCode} ...`}`}
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground block">
              Biografi Eksekutif Singkat
            </label>
            <textarea
              rows={3}
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 leading-relaxed"
            />
          </div>
        </div>
      </div>
    )}
  </Card>

  {/* Section 3: Preferences & Security Shortcuts */}
  <Card
    id="section-preferences"
    className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
  >
    <div
      onClick={() => toggleFold("preferences")}
      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">
            3. Preferensi Regional & Waktu
          </h2>
          <p className="text-[11px] text-default-400">
            Zona waktu pelaporan keuangan dan preferensi bahasa antarmuka.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
          {timezone.split(" ")[0]}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
          {foldedSections.preferences ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>
    </div>

    {!foldedSections.preferences && (
      <div className="p-4 sm:p-6 pt-0 border-t border-default-100 dark:border-default-800">
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Zona Waktu Operasional
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-default-400 absolute left-3 top-3" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
              >
                <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB, UTC+7)</option>
                <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA, UTC+8)</option>
                <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT, UTC+9)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT, UTC+8)</option>
                <option value="UTC">Universal Time Coordinated (UTC)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Bahasa Antarmuka
            </label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
            >
              <option value="id">Bahasa Indonesia (ID)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-default-500 border-t border-default-100 dark:border-default-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sesi terotentikasi aktif via Better-Auth</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => router.push("/security")}
            className="text-xs cursor-pointer"
          >
            Lihat Detail Keamanan Sesi &rarr;
          </Button>
        </div>
      </div>
    )}
  </Card>

      {/* ========================================================================= */}
      {/* CROP / PREVIEW MODAL WITH GIF SUPPORT & CONSTRAINED BOUNDS                */}
      {/* ========================================================================= */}
      {isCropModalOpen && selectedFileForCrop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsCropModalOpen(false)}
        >
          <Card
            className="w-full max-w-[92vw] sm:max-w-md max-h-[90vh] bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Atur Posisi & Potong Avatar
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-bold uppercase">
                  {fileFormatName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with strictly constrained viewbox */}
            <div className="p-5 space-y-4 text-center overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* If GIF is detected, show animated GIF banner */}
              {isAnimatedGif && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gambar Animasi GIF Terdeteksi!</span>
                  </div>
                  <p className="text-[11px] text-default-600 dark:text-default-300 leading-relaxed">
                    Pemotongan kanvas biasa akan membekukan animasi menjadi gambar diam (frame 0). Jika ingin animasi tetap berputar aktif, pilih tombol <strong>Gunakan GIF Asli (Looping)</strong> di bawah.
                  </p>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-xs active:scale-95"
                    onPress={handleSaveAnimatedGifDirectly}
                  >
                    ⚡ Gunakan Animasi GIF Asli (Looping Aktif)
                  </Button>
                </div>
              )}

              {/* Viewport Box (Bounded dimensions 300x300px with 240px circle crop guide) */}
              <div
                id="avatar-crop-box"
                className="relative w-[300px] h-[300px] mx-auto overflow-hidden rounded-2xl bg-default-900 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner border border-default-200/60 dark:border-default-700/60"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startPanX = avatarPanX;
                  const startPanY = avatarPanY;
                  const handleMove = (ev: MouseEvent) => {
                    const rawX = startPanX + (ev.clientX - startX);
                    const rawY = startPanY + (ev.clientY - startY);
                    const clamped = clampPan(rawX, rawY, avatarZoom);
                    setAvatarPanX(clamped.x);
                    setAvatarPanY(clamped.y);
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
                  const nextZoom = Math.min(3.5, Math.max(1, avatarZoom + (e.deltaY > 0 ? -0.05 : 0.05)));
                  setAvatarZoom(nextZoom);
                  const clamped = clampPan(avatarPanX, avatarPanY, nextZoom);
                  setAvatarPanX(clamped.x);
                  setAvatarPanY(clamped.y);
                }}
              >
                {/* Scaled & Positioned Image */}
                <div
                  className="absolute pointer-events-none transition-none"
                  style={{
                    width: `${displayedW}px`,
                    height: `${displayedH}px`,
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${avatarPanX}px), calc(-50% + ${avatarPanY}px))`,
                  }}
                >
                  <img
                    src={selectedFileForCrop}
                    alt="Crop Preview"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Dark Focus Film Mask (Transparent inside 240px circle, dimmed outside) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle 120px at 50% 50%, transparent 120px, rgba(0, 0, 0, 0.75) 121px)",
                  }}
                />

                {/* 240px Circle Border Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[240px] h-[240px] rounded-full border-2 border-dashed border-white/90 shadow-md ring-1 ring-black/40" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-default-500 px-1 max-w-[300px] mx-auto">
                <span>Drag geser · Scroll zoom</span>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarZoom(1);
                    setAvatarPanX(0);
                    setAvatarPanY(0);
                  }}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1 pt-1 text-left max-w-[300px] mx-auto">
                <div className="flex items-center justify-between text-xs text-default-600 font-medium">
                  <span className="font-semibold text-foreground">Skala Pembesaran (Zoom)</span>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(avatarZoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.05"
                  value={avatarZoom}
                  onChange={(e) => {
                    const nextZoom = parseFloat(e.target.value);
                    setAvatarZoom(nextZoom);
                    const clamped = clampPan(avatarPanX, avatarPanY, nextZoom);
                    setAvatarPanX(clamped.x);
                    setAvatarPanY(clamped.y);
                  }}
                  className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                onPress={handleSaveCroppedAvatar}
              >
                {isAnimatedGif ? "Simpan Avatar GIF (Animasi Bergerak)" : "Simpan Potongan Foto"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
      {/* ========================================================================= */}
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
              {PROFILE_SECTIONS.map((sec) => {
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
              <span>{PROFILE_SECTIONS.length} Seksi Tersedia</span>
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
    </div>
  );
}
