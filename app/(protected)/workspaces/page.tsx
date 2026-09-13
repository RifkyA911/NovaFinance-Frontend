"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Plus, Building2, Trash2 } from "lucide-react";
import { Modal, Input, Select, Button } from "@heroui/react";

export default function WorkspacesPage() {
  const { workspaces, selectedWorkspace, setSelectedWorkspace, loading, refreshWorkspaces } = useWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("personal");
  const [newWorkspaceCurrency, setNewWorkspaceCurrency] = useState("IDR");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('http://localhost:8080/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newWorkspaceName,
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
        console.error('Failed to create workspace:', data.error);
        setError('Failed to create workspace: ' + (data.error || 'Unknown error'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError('Failed to create workspace. Please try again.');
      setShowErrorModal(true);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    setDeleteWorkspaceId(workspaceId);
    setShowDeleteModal(true);
  };

  const confirmDeleteWorkspace = async () => {
    if (!deleteWorkspaceId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/workspaces/${deleteWorkspaceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
        setShowDeleteModal(false);
        setDeleteWorkspaceId(null);
      } else {
        console.error('Failed to delete workspace:', data.error);
        setError('Failed to delete workspace: ' + (data.error || 'Unknown error'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      setError('Failed to delete workspace. Please try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your workspaces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Workspace
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading workspaces...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No workspaces yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first workspace to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`p-4 bg-white dark:bg-gray-800 rounded-lg border ${
                selectedWorkspace?.id === workspace.id
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              } hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer`}
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{workspace.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{workspace.type}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkspace(workspace.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Currency: {workspace.currency}</span>
                {selectedWorkspace?.id === workspace.id && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal isOpen={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="flex flex-col gap-1 p-6">Create New Workspace</div>
        <div className="p-6">
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <Input
              label="Workspace Name"
              labelPlacement="outside"
              placeholder="My Workspace"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              isRequired
              variant="bordered"
            />
            
            <Select
              label="Type"
              labelPlacement="outside"
              selectedKeys={[newWorkspaceType]}
              onChange={(e) => setNewWorkspaceType(e.target.value)}
              variant="bordered"
            >
              <option key="personal">Personal</option>
              <option key="business">Business</option>
              <option key="family">Family</option>
            </Select>

            <Select
              label="Currency"
              labelPlacement="outside"
              selectedKeys={[newWorkspaceCurrency]}
              onChange={(e) => setNewWorkspaceCurrency(e.target.value)}
              variant="bordered"
            >
              <option key="IDR">IDR - Indonesian Rupiah</option>
              <option key="USD">USD - US Dollar</option>
              <option key="EUR">EUR - Euro</option>
              <option key="SGD">SGD - Singapore Dollar</option>
              <option key="JPY">JPY - Japanese Yen</option>
            </Select>
          </form>
        </div>
        <div className="p-6 flex gap-4">
          <Button color="danger" variant="ghost" onPress={() => setShowCreateModal(false)} isDisabled={creating}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleCreateWorkspace} isLoading={creating}>
            Create
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <div className="flex flex-col gap-1 p-6">Delete Workspace</div>
        <div className="p-6">
          <p>Are you sure you want to delete this workspace? This action cannot be undone.</p>
        </div>
        <div className="p-6 flex gap-4">
          <Button color="default" variant="ghost" onPress={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="danger" onPress={confirmDeleteWorkspace}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={showErrorModal} onOpenChange={setShowErrorModal}>
        <div className="flex flex-col gap-1 p-6 text-danger">Error</div>
        <div className="p-6">
          <p>{error}</p>
        </div>
        <div className="p-6">
          <Button color="primary" onPress={() => setShowErrorModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
