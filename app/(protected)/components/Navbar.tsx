"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Select,
  ListBox,
  Dropdown,
} from "@heroui/react";
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings,
  Building2,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Plus,
  ArrowRight,
  Target,
  Workflow,
  Landmark,
  ShieldCheck,
  Zap,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

interface SearchMenuItem {
  id: string;
  label: string;
  path: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const searchMenuItems: SearchMenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    group: "Overview",
    icon: LayoutDashboard,
    description: "Financial metrics, balance & recent activities",
  },
  {
    id: "transactions",
    label: "Transactions",
    path: "/transactions",
    group: "Overview",
    icon: Wallet,
    description: "View, filter and manage transaction records",
  },
  {
    id: "wallets",
    label: "Wallets & Accounts",
    path: "/wallets",
    group: "Overview",
    icon: Landmark,
    description: "Manage bank accounts, e-wallets, cash, and balances",
  },
  {
    id: "new-transaction",
    label: "New Transaction",
    path: "/transactions/new",
    group: "Overview",
    icon: Plus,
    description: "Record new income or expense transaction",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    path: "/workspaces",
    group: "Management",
    icon: Building2,
    description: "Switch, configure and create workspaces",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    path: "/portfolio",
    group: "Management",
    icon: TrendingUp,
    description: "Track investment assets and performance",
  },
  {
    id: "goals",
    label: "Goals & Wishlist",
    path: "/goals",
    group: "Planning",
    icon: Target,
    description: "Financial targets, wishlist and saving plans",
  },
  {
    id: "money-flow",
    label: "Money Flow",
    path: "/money-flow",
    group: "Planning",
    icon: Workflow,
    description: "Interactive visual cashflow and budget allocation flow",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    group: "System",
    icon: PieChart,
    description: "Visual charts, income vs expense breakdowns",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    group: "System",
    icon: Settings,
    description: "User profile, currency and preferences",
  },
];

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspaces, selectedWorkspace, setSelectedWorkspace, loading, refreshWorkspaces } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [mounted] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered menu items for search
  const filteredMenuItems = searchQuery.trim() === ""
    ? searchMenuItems
    : searchMenuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for search (Ctrl+K, Esc, Arrow keys, Enter)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const navigateToMenu = (path: string) => {
    router.push(path);
    setIsSearchOpen(false);
    setSearchQuery("");
    searchInputRef.current?.blur();
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen && e.key !== "Escape") {
      setIsSearchOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % Math.max(1, filteredMenuItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev - 1 + filteredMenuItems.length) % Math.max(1, filteredMenuItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMenuItems.length > 0 && filteredMenuItems[activeSearchIndex]) {
        navigateToMenu(filteredMenuItems[activeSearchIndex].path);
      }
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: "My Workspace",
          type: "personal",
          currency: "IDR",
        }),
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
      } else {
        console.error("Failed to create workspace:", data.error);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <header className="h-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-2xs flex items-center justify-between px-3 md:px-4 shrink-0 z-30 transition-colors">
      {/* Left - Mobile Sidebar Toggle & HeroUI Workspace Selector (No plus button) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Toggle */}
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onClick={onToggleSidebar}
          className="h-7.5 w-7.5 cursor-pointer md:hidden text-default-600"
          aria-label="Toggle Menu"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* HeroUI Compound Select for Workspace (No '+' button) */}
        <div className="flex items-center">
          {workspaces.length > 0 ? (
            <Select
              aria-label="Select Workspace"
              placeholder="Select Workspace"
              selectedKey={selectedWorkspace?.id || null}
              onSelectionChange={(key) => {
                if (!key) return;
                const selected = workspaces.find((w) => w.id === String(key));
                if (selected) setSelectedWorkspace(selected);
              }}
              isDisabled={loading}
              className="w-40 sm:w-48"
            >
              <Select.Trigger className="h-7.5 px-2.5 rounded-lg border border-default-200/80 dark:border-default-700/80 bg-default-100/70 dark:bg-default-800/60 text-xs font-medium text-foreground hover:bg-default-200/60 dark:hover:bg-default-700/60 transition-colors flex items-center justify-between gap-1.5 focus:outline-none focus:ring-1.5 focus:ring-blue-500 cursor-pointer">
                <Select.Value className="truncate text-xs font-medium" />
                <Select.Indicator className="text-default-400 shrink-0" />
              </Select.Trigger>
              <Select.Popover className="min-w-48 z-50 p-1 shadow-xl bg-white dark:bg-gray-900 rounded-xl border border-default-200 dark:border-default-800">
                <ListBox className="outline-none space-y-0.5">
                  {workspaces.map((workspace) => (
                    <ListBox.Item
                      key={workspace.id}
                      id={workspace.id}
                      textValue={workspace.name}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-default-100 dark:hover:bg-default-800 text-foreground transition-colors outline-none data-selected:bg-blue-500/10 data-selected:text-blue-600 dark:data-selected:text-blue-400 font-medium"
                    >
                      <span className="truncate">{workspace.name}</span>
                      <ListBox.ItemIndicator className="text-blue-500" />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          ) : (
            <Button
              size="sm"
              className="h-7.5 px-2.5 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white cursor-pointer shadow-2xs"
              onClick={handleCreateWorkspace}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Center - Menu Search with Quick Results Dropdown */}
      <div className="flex-1 max-w-sm mx-3 sm:mx-6 relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-default-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              setActiveSearchIndex(0);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchInputKeyDown}
            placeholder="Search menu or page... (Ctrl+K)"
            className="w-full h-7.5 pl-8 pr-12 rounded-lg border border-default-200/80 dark:border-default-700/80 bg-default-100/70 dark:bg-default-800/50 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-default-400 bg-default-200/50 dark:bg-default-700/50 rounded pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Menu Search Dropdown Results */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-default-400 uppercase tracking-wider border-b border-default-100 dark:border-default-800 flex items-center justify-between">
              <span>Navigation Results</span>
              <span className="text-[9px] font-normal normal-case">
                {filteredMenuItems.length} found
              </span>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="py-6 text-center text-default-400 text-xs">
                No matching menu found
              </div>
            ) : (
              <div className="p-1 space-y-0.5">
                {filteredMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === activeSearchIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateToMenu(item.path)}
                      onMouseEnter={() => setActiveSearchIndex(index)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "hover:bg-default-100 dark:hover:bg-default-800 text-foreground"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{item.label}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-default-200/60 dark:bg-default-800 text-default-500">
                            {item.group}
                          </span>
                        </div>
                        <p className="text-[10px] text-default-400 truncate leading-tight">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-default-300 opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right - Online Status, Role Badge, Theme Toggler & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Online Status Indicator Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold select-none shadow-2xs"
          title="Status Akun: Online & Terkoneksi"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] tracking-wide">Online</span>
        </div>

        {/* Role Type UI Badge */}
        {(() => {
          const currentRole = ((selectedWorkspace as any)?.role || "owner").toUpperCase();
          const isOwner = currentRole === "OWNER";
          const isAdmin = currentRole === "ADMIN";
          const isStaff = currentRole === "STAFF";

          return (
            <div
              className={`hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-2xs ${
                isOwner
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : isAdmin
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                  : isStaff
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  : "bg-default-100 text-default-600 dark:text-default-400 border-default-200 dark:border-default-700"
              }`}
              title={`Role Akses: ${currentRole}`}
            >
              {isOwner && <ShieldCheck className="w-3 h-3 text-amber-500" />}
              {isAdmin && <Zap className="w-3 h-3 text-purple-500" />}
              {!isOwner && !isAdmin && <User className="w-3 h-3 text-blue-500" />}
              <span>{currentRole}</span>
            </div>
          );
        })()}

        {/* Quick Theme Switcher */}
        {mounted && (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-7.5 w-7.5 cursor-pointer text-default-600 hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
          </Button>
        )}

        {/* HeroUI User Dropdown */}
        <Dropdown>
          <Dropdown.Trigger
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg bg-default-100/70 hover:bg-default-200/70 dark:bg-default-800/50 dark:hover:bg-default-700/60 transition-colors cursor-pointer text-left outline-none border border-transparent hover:border-default-200 dark:hover:border-default-700"
            aria-label="User account menu"
          >
            {/* Avatar with live green online indicator ring */}
            <div className="relative shrink-0">
              <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-2xs">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
            </div>

            <div className="hidden sm:flex flex-col text-left max-w-28">
              <span className="text-xs font-semibold text-foreground truncate leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-default-500 truncate leading-tight">
                {user?.email || "user@example.com"}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-default-400 shrink-0 ml-0.5" />
          </Dropdown.Trigger>
          <Dropdown.Popover className="min-w-56 z-50 p-1.5 shadow-xl bg-white dark:bg-gray-900 rounded-xl border border-default-200/80 dark:border-default-800">
            {/* User Profile Card Header */}
            <div className="flex items-center gap-2.5 p-2 mb-1 rounded-lg bg-default-100/60 dark:bg-default-800/50">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-foreground truncate">{user?.name || "User"}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                    {((selectedWorkspace as any)?.role || "owner").toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-default-500 truncate">{user?.email || ""}</p>
              </div>
            </div>

            <Dropdown.Menu
              aria-label="User actions"
              onAction={(key) => {
                if (key === "settings") router.push("/settings");
                else if (key === "workspaces") router.push("/workspaces");
                else if (key === "theme") setTheme(theme === "dark" ? "light" : "dark");
                else if (key === "logout") {
                  logout();
                  router.push("/login");
                }
              }}
              className="outline-none space-y-0.5 text-xs"
            >
              <Dropdown.Section>
                <Dropdown.Item
                  id="settings"
                  textValue="Settings"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <Settings className="w-3.5 h-3.5 text-default-500" />
                  <span>Account Settings</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="workspaces"
                  textValue="Workspaces"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <Building2 className="w-3.5 h-3.5 text-default-500" />
                  <span>Workspaces</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="theme"
                  textValue="Toggle Theme"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                  </div>
                  <span className="text-[10px] text-default-400 font-mono">Toggle</span>
                </Dropdown.Item>
              </Dropdown.Section>

              <Dropdown.Section>
                <Dropdown.Item
                  id="logout"
                  textValue="Logout"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-danger hover:bg-danger/10 cursor-pointer mt-0.5 outline-none font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-danger" />
                  <span>Logout</span>
                </Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
