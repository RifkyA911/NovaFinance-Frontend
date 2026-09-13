"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
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
  const { logout, isAuthenticated } = useAuth();
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
    <div className="min-h-screen bg-background p-6">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-default-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Profile Settings</h3>
              <p className="text-sm text-default-500">Update your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                labelPlacement="outside"
                placeholder="John"
                defaultValue="John"
                variant="bordered"
              />
              <Input
                label="Last Name"
                labelPlacement="outside"
                placeholder="Doe"
                defaultValue="Doe"
                variant="bordered"
              />
            </div>
            <Input
              label="Email"
              labelPlacement="outside"
              type="email"
              placeholder="john@example.com"
              defaultValue="john@example.com"
              variant="bordered"
            />
            <Input
              label="Phone"
              labelPlacement="outside"
              type="tel"
              placeholder="+62 812 3456 7890"
              variant="bordered"
            />
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <p className="text-sm text-default-500">Manage your notification preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-default-500">Receive push notifications on your device</p>
              </div>
              <Switch isSelected={notifications} onValueChange={setNotifications} color="primary" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-default-500">Receive email notifications for important updates</p>
              </div>
              <Switch isSelected={emailAlerts} onValueChange={setEmailAlerts} color="primary" />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security Settings</h3>
              <p className="text-sm text-default-500">Manage your security preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-default-500">Add an extra layer of security to your account</p>
              </div>
              <Switch isSelected={twoFactor} onValueChange={setTwoFactor} color="primary" />
            </div>
            <Button variant="bordered" className="w-full border-default-200">
              Change Password
            </Button>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-default-500">Customize your app experience</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-default-500">Switch between light and dark theme</p>
              </div>
              <Switch isSelected={darkMode} onValueChange={setDarkMode} color="primary" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-default-500">Select your preferred language</p>
              </div>
              <Select className="w-48" variant="bordered" defaultSelectedKeys={["en"]} aria-label="Language">
                <SelectItem key="en">English</SelectItem>
                <SelectItem key="id">Indonesian</SelectItem>
                <SelectItem key="es">Spanish</SelectItem>
              </Select>
            </div>
          </div>
        </Card>

        {/* Currency Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Currency & Region</h3>
              <p className="text-sm text-default-500">Set your currency and regional preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Currency</p>
                <p className="text-sm text-default-500">Select your preferred currency</p>
              </div>
              <Select className="w-64" variant="bordered" defaultSelectedKeys={["idr"]} aria-label="Currency">
                <SelectItem key="idr">IDR - Indonesian Rupiah</SelectItem>
                <SelectItem key="usd">USD - US Dollar</SelectItem>
                <SelectItem key="eur">EUR - Euro</SelectItem>
                <SelectItem key="sgd">SGD - Singapore Dollar</SelectItem>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Timezone</p>
                <p className="text-sm text-default-500">Set your local timezone</p>
              </div>
              <Select className="w-64" variant="bordered" defaultSelectedKeys={["wib"]} aria-label="Timezone">
                <SelectItem key="wib">Asia/Jakarta (WIB)</SelectItem>
                <SelectItem key="wita">Asia/Makassar (WITA)</SelectItem>
                <SelectItem key="wit">Asia/Jayapura (WIT)</SelectItem>
                <SelectItem key="utc">UTC</SelectItem>
              </Select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
