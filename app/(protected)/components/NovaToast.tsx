"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface NovaToastPayload {
  id?: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastItemInternal extends NovaToastPayload {
  id: string;
}

const TOAST_THEMES: Record<
  ToastType,
  {
    icon: React.ElementType;
    headerBg: string;
    iconColor: string;
    titleColor: string;
    badgeBg: string;
    badgeText: string;
    progressColor: string;
    statusLabel: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    headerBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-b border-emerald-500/25",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-800 dark:text-emerald-200",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    badgeText: "SUCCESS",
    progressColor: "bg-emerald-500",
    statusLabel: "Sukses",
  },
  error: {
    icon: XCircle,
    headerBg: "bg-rose-500/10 dark:bg-rose-500/20 border-b border-rose-500/25",
    iconColor: "text-rose-600 dark:text-rose-400",
    titleColor: "text-rose-800 dark:text-rose-200",
    badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30",
    badgeText: "ERROR",
    progressColor: "bg-rose-500",
    statusLabel: "Gagal",
  },
  warning: {
    icon: AlertTriangle,
    headerBg: "bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/25",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-800 dark:text-amber-200",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    badgeText: "WARNING",
    progressColor: "bg-amber-500",
    statusLabel: "Peringatan",
  },
  info: {
    icon: Info,
    headerBg: "bg-blue-500/10 dark:bg-blue-500/20 border-b border-blue-500/25",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-800 dark:text-blue-200",
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
    badgeText: "INFO",
    progressColor: "bg-blue-500",
    statusLabel: "Informasi",
  },
};

/**
 * Global helper to trigger a rich Nova toast from anywhere in the application
 */
export function triggerNovaToast(payload: NovaToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("novajournal_toast_event", {
      detail: {
        ...payload,
        id: payload.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    })
  );
}

export function useNovaToast() {
  const showSuccess = (title: string, description?: string) =>
    triggerNovaToast({ type: "success", title, description });
  const showError = (title: string, description?: string) =>
    triggerNovaToast({ type: "error", title, description });
  const showWarning = (title: string, description?: string) =>
    triggerNovaToast({ type: "warning", title, description });
  const showInfo = (title: string, description?: string) =>
    triggerNovaToast({ type: "info", title, description });

  return { toasts: [], dismissToast: () => {}, showSuccess, showError, showWarning, showInfo, trigger: triggerNovaToast };
}

export function NovaToastContainer(props?: { toasts?: any; onDismiss?: any }) {
  const [toasts, setToasts] = useState<ToastItemInternal[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItemInternal>;
      if (customEvent.detail) {
        setToasts((prev) => [customEvent.detail, ...prev.slice(0, 4)]);
      }
    };

    window.addEventListener("novajournal_toast_event", handleToastEvent);
    return () => window.removeEventListener("novajournal_toast_event", handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full sm:w-96">
      {toasts.map((toast) => (
        <NovaToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function NovaToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItemInternal;
  onDismiss: (id: string) => void;
}) {
  const [isEntering, setIsEntering] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsEntering(false), 20);
    const duration = toast.duration || 4500;
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 260);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 260);
  };

  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;
  const Icon = theme.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative rounded-xl border border-default-200/90 dark:border-default-800/90 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
        isEntering
          ? "translate-x-12 opacity-0 scale-95"
          : isLeaving
          ? "translate-x-12 opacity-0 scale-95"
          : "translate-x-0 opacity-100 scale-100"
      }`}
    >
      {/* Colored Header Banner */}
      <div className={`px-3.5 py-2 flex items-center justify-between gap-2.5 ${theme.headerBg}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`shrink-0 ${theme.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h5 className={`text-xs font-bold truncate leading-none ${theme.titleColor}`}>
            {toast.title}
          </h5>
          <span className={`hidden sm:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${theme.badgeBg}`}>
            {theme.badgeText}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 p-1 rounded-md text-default-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Description Body */}
      {toast.description && (
        <div className="px-3.5 py-2.5 bg-white dark:bg-gray-900">
          <p className="text-[11px] text-default-600 dark:text-default-300 leading-relaxed font-medium break-words">
            {toast.description}
          </p>
        </div>
      )}

      {/* Bottom Progress Timer Line */}
      <div className="h-0.5 w-full bg-default-100 dark:bg-default-800/80 overflow-hidden">
        <div
          className={`h-full ${theme.progressColor} opacity-80`}
          style={{
            animation: `shrinkWidth ${(toast.duration || 4500) / 1000}s linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default NovaToastContainer;
