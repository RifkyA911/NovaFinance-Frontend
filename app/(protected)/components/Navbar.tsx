"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Wallet, Plus, ChevronDown, Search, Menu, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspaces, selectedWorkspace, setSelectedWorkspace, loading, refreshWorkspaces } = useWorkspace();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: 'My Workspace',
          type: 'personal',
          currency: 'IDR',
        }),
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
      } else {
        console.error('Failed to create workspace:', data.error);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-900 border-b border-default-200 dark:border-default-700 flex items-center justify-between px-4 md:px-6">
      {/* Left - Sidebar Toggle & Logo & Workspace Selector */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onClick={onToggleSidebar}
          className="cursor-pointer md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Workspace Selector */}
        <div className="flex items-center gap-2">
          {workspaces.length > 0 ? (
            <>
              <select
                value={selectedWorkspace?.id || ""}
                onChange={(e) => {
                  const selected = workspaces.find(w => w.id === e.target.value);
                  if (selected) setSelectedWorkspace(selected);
                }}
                disabled={loading}
                className="h-9 px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-100/50 text-sm text-default-900 dark:text-default-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-default-200 dark:hover:bg-default-200/50 transition-colors"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                className="h-9 bg-linear-to-r from-blue-500 to-purple-600 text-white cursor-pointer"
                isIconOnly
                onClick={() => router.push('/transactions/new')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-9 bg-linear-to-r from-blue-500 to-purple-600 text-white cursor-pointer"
              onClick={handleCreateWorkspace}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-100/50 text-sm text-default-900 dark:text-default-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Right - User Info */}
      <div className="flex items-center gap-3 relative">
        {/* Theme Toggler */}
        {mounted && (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}
        
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-default-100 dark:hover:bg-default-100/50 rounded-lg px-3 py-2 transition-colors"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-default-900 dark:text-default-100">{user?.name || "User"}</span>
            <span className="text-xs text-default-500">{user?.email || ""}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-default-500" />
        </div>
        
        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                logout();
                setShowUserMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-default-100 dark:hover:bg-default-100/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
