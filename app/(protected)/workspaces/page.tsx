"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Workspace } from "@/app/lib/api";
import { Plus, Building2, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@heroui/react";

export default function WorkspacesPage() {
  const { workspaces, selectedWorkspace, setSelectedWorkspace, loading, refreshWorkspaces } = useWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("personal");
  const [newWorkspaceCurrency, setNewWorkspaceCurrency] = useState("IDR");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: newWorkspaceName.trim(),
          type: newWorkspaceType,
          currency: newWorkspaceCurrency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
        setShowCreateModal(false);
        setNewWorkspaceName("");
        setNewWorkspaceType("personal");
        setNewWorkspaceCurrency("IDR");
      } else {
        setError(data.error || "Failed to create workspace");
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setError("Failed to create workspace. Please check backend connection.");
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteWorkspace = async () => {
    if (!deleteWorkspaceId) return;

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/workspaces/${deleteWorkspaceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
        setShowDeleteModal(false);
        setDeleteWorkspaceId(null);
      } else {
        setError(data.error || "Failed to delete workspace");
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      setError("Failed to delete workspace. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Workspaces</h1>
            <p className="text-default-500 mt-0.5 text-xs sm:text-sm">Manage and switch between your personal and business workspaces</p>
          </div>
          <Button
            onClick={() => {
              setError("");
              setShowCreateModal(true);
            }}
            className="h-8 px-3 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Workspace
          </Button>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-danger hover:opacity-75 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-default-500 mt-4 text-sm">Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-default-200 dark:border-default-700 shadow-sm p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No workspaces yet</h3>
            <p className="text-default-500 text-sm mb-6 max-w-sm mx-auto">
              Create your first workspace to start organizing your transactions and financial journals.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {workspaces.map((workspace: Workspace) => {
              const isSelected = selectedWorkspace?.id === workspace.id;
              return (
                <div
                  key={workspace.id}
                  onClick={() => setSelectedWorkspace(workspace)}
                  className={`relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-default-200 dark:border-default-800 hover:border-default-400 dark:hover:border-default-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-2xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground leading-snug">{workspace.name}</h3>
                        <span className="inline-block text-[11px] uppercase font-medium tracking-wide text-default-500">
                          {workspace.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteWorkspaceId(workspace.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-default-400 hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Delete workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs text-default-500">
                    <span className="font-medium">Currency: <strong className="text-foreground">{workspace.currency}</strong></span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-default-400 hover:text-foreground text-[11px]">Click to select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-5 space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Create New Workspace</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-default-400 hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium mb-1.5 block text-foreground">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Personal Journal, PT Maju Jaya"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-foreground">Workspace Type</label>
                <select
                  value={newWorkspaceType}
                  onChange={(e) => setNewWorkspaceType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="umkm">UMKM (Business)</option>
                  <option value="pt">PT (Corporate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-foreground">Default Currency</label>
                <select
                  value={newWorkspaceCurrency}
                  onChange={(e) => setNewWorkspaceCurrency(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                >
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  isDisabled={creating}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-xs cursor-pointer text-xs"
                  isDisabled={creating || !newWorkspaceName.trim()}
                >
                  {creating ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-xl max-w-sm w-full p-4 sm:p-5 space-y-3 animate-in fade-in-50 zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-foreground">Delete Workspace</h2>
            <p className="text-xs text-default-500">
              Are you sure you want to delete this workspace? This action cannot be undone and will delete associated records.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                isDisabled={deleting}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmDeleteWorkspace}
                className="bg-danger text-white font-medium cursor-pointer shadow-xs hover:bg-danger/90 text-xs"
                isDisabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Workspace"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
