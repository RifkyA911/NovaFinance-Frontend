"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  Bell,
  Shield,
  Palette,
  CreditCard,
  User,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-default-500 mt-0.5 text-xs sm:text-sm">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Profile Settings</h3>
              <p className="text-[11px] text-default-500">Update your personal information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block text-foreground">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  defaultValue="John"
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-foreground">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  defaultValue="Doe"
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
                className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground">Phone</label>
              <input
                type="tel"
                placeholder="+62 812 3456 7890"
                className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notification Settings</h3>
              <p className="text-[11px] text-default-500">Manage your notification preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Push Notifications</p>
                <p className="text-[11px] text-default-500">Receive push notifications on your device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-default-200 dark:bg-default-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Email Alerts</p>
                <p className="text-[11px] text-default-500">Receive email notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-default-200 dark:bg-default-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Security Settings</h3>
              <p className="text-[11px] text-default-500">Manage your security preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-[11px] text-default-500">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-default-200 dark:bg-default-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
              Change Password
            </Button>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              <p className="text-[11px] text-default-500">Customize your app experience</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Dark Mode</p>
                <p className="text-[11px] text-default-500">Switch between light and dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-default-200 dark:bg-default-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Language</p>
                <p className="text-[11px] text-default-500">Select your preferred language</p>
              </div>
              <select className="h-7.5 px-2.5 py-1 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="id">Indonesian</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Currency Settings */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Currency & Region</h3>
              <p className="text-[11px] text-default-500">Set your currency and regional preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Default Currency</p>
                <p className="text-[11px] text-default-500">Select your preferred currency</p>
              </div>
              <select className="h-7.5 px-2.5 py-1 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500">
                <option value="idr">IDR - Indonesian Rupiah</option>
                <option value="usd">USD - US Dollar</option>
                <option value="eur">EUR - Euro</option>
                <option value="sgd">SGD - Singapore Dollar</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Timezone</p>
                <p className="text-[11px] text-default-500">Set your local timezone</p>
              </div>
              <select className="h-7.5 px-2.5 py-1 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-default-100 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500">
                <option value="wib">Asia/Jakarta (WIB)</option>
                <option value="wita">Asia/Makassar (WITA)</option>
                <option value="wit">Asia/Jayapura (WIT)</option>
                <option value="utc">UTC</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-1">
          <Button className="h-8 px-3 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-xs cursor-pointer" size="sm">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
