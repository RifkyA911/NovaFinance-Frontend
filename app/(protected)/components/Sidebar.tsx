"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Wallet, label: "Transactions", path: "/transactions" },
  { icon: Building2, label: "Workspaces", path: "/workspaces" },
  { icon: TrendingUp, label: "Portfolio", path: "/portfolio" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle, isMobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-900 border-r border-default-200 dark:border-default-700 h-screen flex flex-col transition-all duration-300 fixed md:relative z-50 ${collapsed ? 'w-16' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-default-200 dark:border-default-700 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NovaJournal
              </span>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={() => {
              onToggle?.();
              onMobileMenuClose?.();
            }}
            className="cursor-pointer"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                onMobileMenuClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-100/50 hover:scale-105"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-default-200 dark:border-default-700">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-default-100 dark:bg-default-100/50">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-default-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-danger hover:bg-default-100 dark:hover:bg-default-100/50 transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
    </>
  );
}
