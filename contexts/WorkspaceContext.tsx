"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { api, Workspace } from "@/app/lib/api";

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  const refreshWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getWorkspaces();

      console.log("Workspace API response:", data);

      if (!data || !data.data || !data.data.workspaces) {
        console.error("Invalid workspace data:", data);
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      // Deduplicate workspaces by ID
      const uniqueWorkspaces = data.data.workspaces.filter((workspace, index, self) =>
        index === self.findIndex((w) => w.id === workspace.id)
      );

      setWorkspaces(uniqueWorkspaces);

      // Auto-select first workspace if none selected or if current selected is not in list
      if (!selectedWorkspace && uniqueWorkspaces.length > 0) {
        setSelectedWorkspace(uniqueWorkspaces[0]);
      } else if (selectedWorkspace && !uniqueWorkspaces.find(w => w.id === selectedWorkspace.id)) {
        // If current selected workspace is not in the list, select the first one
        setSelectedWorkspace(uniqueWorkspaces[0]);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    if (isInitialLoad.current) {
      refreshWorkspaces();
      isInitialLoad.current = false;
    }
  }, [refreshWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,
        setSelectedWorkspace,
        loading,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
