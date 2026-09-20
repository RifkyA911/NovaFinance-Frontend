import { playNovaSuccessSound, playNovaErrorSound } from "./sound";
import { mutationFunctions } from "./queries";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

export interface NotifySettingsOptions {
  workspaceId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  successTitle?: string;
  successMessage: string;
  errorTitle?: string;
  errorMessage?: string;
  onNotice?: (msg: string, isError?: boolean) => void;
}

/**
 * Executes a settings modification or save operation:
 * 1. Shows contextual success / failure toast notice
 * 2. Plays smooth fluid Nova status chime (success or gentle low error tone)
 * 3. Appends an audit log record into PostgreSQL schema.auditLogs
 */
export async function executeSettingsAction<T>(
  actionFn: () => Promise<T>,
  options: NotifySettingsOptions
): Promise<T | null> {
  try {
    const result = await actionFn();
    playNovaSuccessSound();

    // Trigger rich floating Nova Toast with header, description, and emerald indicator
    triggerNovaToast({
      type: "success",
      title: options.successTitle || "Perubahan Berhasil Disimpan",
      description: options.successMessage,
    });

    if (options.onNotice) {
      options.onNotice(options.successMessage, false);
    }

    if (options.workspaceId) {
      mutationFunctions.recordAuditLog({
        workspaceId: options.workspaceId,
        action: options.action,
        entityType: options.entityType || "settings",
        entityId: options.entityId,
        oldData: options.oldData,
        newData: options.newData,
      }).catch(() => {});
    }

    return result;
  } catch (err: any) {
    playNovaErrorSound();
    const errorMsg = options.errorMessage || err?.message || "Terjadi kesalahan saat memproses data ke server.";

    // Trigger rich floating Nova Toast with header, description, and rose danger indicator
    triggerNovaToast({
      type: "error",
      title: options.errorTitle || "Gagal Memproses Data",
      description: errorMsg,
    });

    if (options.onNotice) {
      options.onNotice(errorMsg, true);
    }
    return null;
  }
}
