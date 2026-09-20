/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  ShieldCheck,
  Lock,
  Users,
  ScrollText,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  Server,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSoftChime, playNovaSpaceSound } from "@/app/lib/sound";

const SECURITY_SECTIONS = [
  { id: "overview", name: "Ringkasan Zero-Trust", shortName: "Enkripsi", icon: ShieldCheck, color: "#10b981" },
  { id: "sessions", name: "Sesi Perangkat Aktif", shortName: "Sesi Aktif", icon: KeyRound, color: "#3b82f6" },
  { id: "rbac", name: "Matriks Peran RBAC", shortName: "RBAC", icon: Users, color: "#8b5cf6" },
  { id: "audit", name: "Rekaman Audit Trail", shortName: "Audit Log", icon: ScrollText, color: "#f59e0b" },
];

export default function SecurityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedWorkspace } = useWorkspace();

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Anchor & Folding State
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    overview: false,
    sessions: false,
    rbac: false,
    audit: false,
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
      overview: nextState,
      sessions: nextState,
      rbac: nextState,
      audit: nextState,
    });
  };

  // Scroll listener for Section Anchor highlighting
  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = SECURITY_SECTIONS[0].id;
      for (const sec of SECURITY_SECTIONS) {
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
        currentSecId = SECURITY_SECTIONS[SECURITY_SECTIONS.length - 1].id;
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

  const activeSec = SECURITY_SECTIONS.find((s) => s.id === activeSectionId) || SECURITY_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  // Mock sessions state
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "sess-current",
      device: "Windows 11 · Google Chrome",
      ip: "127.0.0.1 (Localhost)",
      lastActive: "Saat ini aktif",
      isCurrent: true,
      type: "desktop",
    },
    {
      id: "sess-mobile",
      device: "iOS 18.2 · Safari Mobile PWA",
      ip: "182.253.120.44 (Jakarta, ID)",
      lastActive: "2 jam yang lalu",
      isCurrent: false,
      type: "mobile",
    },
  ]);

  // Audit Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAuditLogs = async () => {
    if (!selectedWorkspace) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`http://localhost:8080/api/logs?workspaceId=${selectedWorkspace.id}&limit=10`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLogs(data.data.logs || []);
      }
    } catch {
      // fallback
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedWorkspace]);

  const handleRevokeSession = (sessionId: string) => {
    playSoftChime();
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showNotice("Sesi peramban berhasil dihentikan.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Notice Banner */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-default-200 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Security, Zero-Trust & Audit Logs
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              TLS 1.3 Bank-Grade
            </span>
          </div>
          <p className="text-xs text-default-500 mt-1">
            Status enkripsi end-to-end, sesi peramban aktif, matriks RBAC peran kerja, dan rekaman audit log transaksi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            {areAllFolded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Buka Semua</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Lipat Semua</span>
              </>
            )}
          </button>

          <Button
            size="sm"
            variant="secondary"
            onPress={() => router.push("/settings")}
            className="text-xs cursor-pointer"
          >
            &larr; Settings Hub
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY SECTION ANCHOR NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-foreground">Seksi:</span>
          <div className="flex items-center gap-1">
            {SECURITY_SECTIONS.map((sec) => {
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
                  <span>{sec.shortName || sec.name}</span>
                  {foldedSections[sec.id] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Tergulung (Folded)" />
                  )}
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
            {areAllFolded ? "Buka Semua" : "Lipat Semua"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Zero-Trust Security Summary Cards (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-overview"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("overview")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                1. Arsitektur Enkripsi & Zero-Trust Banking Grade
              </h2>
              <p className="text-[11px] text-default-400">
                Standar perlindungan data multi-tenant dengan enkripsi AES-256 GCM dan cookie Better-Auth anti-CSRF.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              AES-256 GCM
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.overview ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.overview && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-default-500 uppercase">Enkripsi Data</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-base font-bold text-foreground">AES-256 GCM</div>
                <p className="text-[10px] text-default-400">Database vault terisolasi per tenant</p>
              </div>

              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-default-500 uppercase">Protokol Sesi</span>
                  <Lock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-base font-bold text-foreground">Better-Auth HTTP-Only</div>
                <p className="text-[10px] text-default-400">Cookie aman anti-XSS & anti-CSRF</p>
              </div>

              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-default-500 uppercase">Integritas Audit</span>
                  <ScrollText className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-base font-bold text-foreground">Tamper-Evident Logs</div>
                <p className="text-[10px] text-default-400">Jejak rekonsiliasi tidak dapat dihapus</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 2. Sesi Peramban Aktif (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-sessions"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("sessions")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                2. Sesi Peramban & Perangkat Aktif
              </h2>
              <p className="text-[11px] text-default-400">
                Daftar peramban dan perangkat yang saat ini memiliki token autentikasi aktif ke akun Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {activeSessions.length} Sesi Aktif
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.sessions ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.sessions && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-3 pt-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-default-200/60 dark:bg-default-700/60 flex items-center justify-center text-default-600 dark:text-default-300 shrink-0">
                      {session.type === "desktop" ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{session.device}</span>
                        {session.isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                            Sesi Ini
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-default-400 mt-0.5">
                        <span>{session.ip}</span>
                        <span>•</span>
                        <span>{session.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      size="sm"
                      variant="danger-soft"
                      onPress={() => handleRevokeSession(session.id)}
                      className="text-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Cabut Sesi</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. Matriks Hak Akses RBAC (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-rbac"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("rbac")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                3. Matriks Hak Akses Peran Kerja (RBAC Governance)
              </h2>
              <p className="text-[11px] text-default-400">
                Hirarki hak akses kontrol pengguna (Owner, Admin, Staff, Viewer) sesuai regulasi audit finansial.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              4 Tingkat Peran
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.rbac ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.rbac && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-3">
              {[
                { role: "Owner", desc: "Akses penuh manajemen workspace, billing, dan pembubaran entitas.", badge: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
                { role: "Admin", desc: "Bisa menambah akun kas, modifikasi transaksi, dan kelola anggota.", badge: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
                { role: "Staff", desc: "Mencatat transaksi harian, upload struk OCR, dan cek mutasi dompet.", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
                { role: "Viewer", desc: "Hanya melihat ringkasan dashboard tanpa izin mutasi atau ekspor.", badge: "bg-default-200/50 text-default-600 border-default-300" },
              ].map((item) => (
                <div
                  key={item.role}
                  className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/50 dark:bg-default-800/40 space-y-1.5"
                >
                  <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${item.badge}`}>
                    {item.role}
                  </span>
                  <p className="text-[11px] text-default-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. Rekaman Jejak Audit Terkini (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-audit"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("audit")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                4. Rekaman Jejak Audit Sistem Terkini
              </h2>
              <p className="text-[11px] text-default-400">
                Catatan mutasi database dan aktivitas pengguna yang tamper-evident dan tidak dapat dimanipulasi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {logs.length} Log
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.audit ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.audit && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500 font-medium">Log aktivitas terkini yang tercatat pada workspace</span>
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={loadingLogs}
                  onPress={fetchAuditLogs}
                  className="text-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Segarkan Log</span>
                </Button>
              </div>

              {logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-default-400">
                  {loadingLogs ? "Sedang memuat jejak audit..." : "Tidak ada aktivitas audit mencurigakan. Seluruh operasi normal."}
                </div>
              ) : (
                <div className="divide-y divide-default-100 dark:divide-default-800">
                  {logs.slice(0, 6).map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-foreground uppercase text-[11px]">{log.action}</span>
                        <span className="text-default-400 ml-2 font-mono text-[10px]">{log.entityType}</span>
                      </div>
                      <div className="text-[10px] text-default-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

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
              {SECURITY_SECTIONS.map((sec) => {
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
              <span>{SECURITY_SECTIONS.length} Seksi Tersedia</span>
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
