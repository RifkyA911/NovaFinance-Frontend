/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Sparkles,
  Key,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Users,
  Check,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Settings() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // AI Configuration State (Primary Hub)
  const [aiProvider, setAiProvider] = useState<"auto" | "groq" | "gemini" | "deepseek" | "claude">("auto");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");

  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const p = localStorage.getItem("novajournal_ai_provider");
      if (p) setAiProvider(p as any);

      const k = localStorage.getItem("novajournal_ai_key");
      if (k) setPrimaryKey(k);

      const groq = localStorage.getItem("novajournal_ai_groq_key");
      if (groq) setGroqKey(groq);

      const gemini = localStorage.getItem("novajournal_ai_gemini_key");
      if (gemini) setGeminiKey(gemini);

      const deepseek = localStorage.getItem("novajournal_ai_deepseek_key");
      if (deepseek) setDeepseekKey(deepseek);

      const claude = localStorage.getItem("novajournal_ai_claude_key");
      if (claude) setClaudeKey(claude);
    } catch {}
  }, [isAuthenticated, router]);

  const handleSaveAiConfig = () => {
    try {
      localStorage.setItem("novajournal_ai_provider", aiProvider);
      localStorage.setItem("novajournal_ai_groq_key", groqKey.trim());
      localStorage.setItem("novajournal_ai_gemini_key", geminiKey.trim());
      localStorage.setItem("novajournal_ai_deepseek_key", deepseekKey.trim());
      localStorage.setItem("novajournal_ai_claude_key", claudeKey.trim());

      // Auto resolve unified primary key
      let resolvedKey = primaryKey.trim();
      if (!resolvedKey) {
        if (aiProvider === "groq" && groqKey) resolvedKey = groqKey.trim();
        else if (aiProvider === "gemini" && geminiKey) resolvedKey = geminiKey.trim();
        else if (aiProvider === "deepseek" && deepseekKey) resolvedKey = deepseekKey.trim();
        else if (aiProvider === "claude" && claudeKey) resolvedKey = claudeKey.trim();
        else {
          resolvedKey = groqKey.trim() || geminiKey.trim() || deepseekKey.trim() || claudeKey.trim();
        }
      }
      localStorage.setItem("novajournal_ai_key", resolvedKey);
      setPrimaryKey(resolvedKey);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestAi = async () => {
    setTestingAi(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      let activeKey = primaryKey.trim();
      if (!activeKey) {
        if (aiProvider === "groq") activeKey = groqKey.trim();
        else if (aiProvider === "gemini") activeKey = geminiKey.trim();
        else if (aiProvider === "deepseek") activeKey = deepseekKey.trim();
        else if (aiProvider === "claude") activeKey = claudeKey.trim();
        else activeKey = groqKey.trim() || geminiKey.trim() || deepseekKey.trim() || claudeKey.trim();
      }

      const res = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Makan siang 35000 pakai GoPay",
          apiKey: activeKey || undefined,
          provider: aiProvider,
        }),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menguji respon model AI.");
      }

      setTestResult({
        success: true,
        message: `Koneksi berhasil via ${data.source || aiProvider}!`,
        latency,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Gagal terhubung ke API Provider.",
      });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-default-500 mt-0.5 text-xs sm:text-sm">Manage your account, preferences, and AI engines</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan Tersimpan!</span>
            </div>
          )}
        </div>

        {/* AI Intelligence & Multi-Provider Hub (PRIMARY CONFIGURATION) */}
        <Card className="p-4 sm:p-5 rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/20 bg-linear-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-default-200/80 dark:border-default-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">AI Intelligence & Multi-Provider Hub</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Primary Config
                  </span>
                </div>
                <p className="text-xs text-default-500">
                  Konfigurasi pusat kecerdasan buatan untuk seluruh otomasi di NovaJournal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs px-3 font-medium cursor-pointer"
                onPress={handleTestAi}
                isDisabled={testingAi}
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${testingAi ? "animate-spin" : ""}`} />
                <span>Tes Koneksi</span>
              </Button>
            </div>
          </div>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.latency && (
                <span className="text-[11px] font-mono font-semibold opacity-80">
                  {testResult.latency} ms
                </span>
              )}
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1 block text-foreground flex items-center justify-between">
                <span>Default Global AI Provider</span>
                <span className="text-[11px] font-normal text-default-400">
                  Digunakan otomatis jika tidak ada override lokal
                </span>
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
              >
                <option value="auto">⚡ Auto-Fallback Pintar (Groq → Gemini → DeepSeek → Claude → Local Engine)</option>
                <option value="groq">⚡ Groq (Llama 3.3 70B - Sangat Cepat & Free Tier Tersedia)</option>
                <option value="gemini">✨ Google Gemini 2.0 Flash (Multimodal & Handal)</option>
                <option value="deepseek">🧠 DeepSeek Chat (DeepSeek-V3 / Reasoning)</option>
                <option value="claude">🎭 Anthropic Claude 3.5 Haiku (Penalaran Presisi)</option>
              </select>
            </div>

            {/* Provider API Keys Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Groq API Key
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Dapatkan Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500" /> Google Gemini API Key
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Dapatkan Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-cyan-500" /> DeepSeek API Key
                  </span>
                  <a
                    href="https://platform.deepseek.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Dapatkan Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-purple-500" /> Anthropic Claude API Key
                  </span>
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Dapatkan Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Custom Unified / Overriding Key */}
            <div className="pt-1">
              <label className="text-xs font-medium mb-1 block text-foreground flex items-center justify-between">
                <span>Active Unified Key (Opsional / Override Cepat)</span>
                <span className="text-[10px] text-default-400">
                  Otomatis terisi dari provider di atas jika dikosongkan
                </span>
              </label>
              <input
                type="password"
                placeholder="Kosongkan untuk menggunakan key provider aktif di atas..."
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                className="w-full h-8 px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scope Explanation Banner */}
          <div className="p-3 rounded-xl bg-default-100/70 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Cakupan Penggunaan Konfigurasi Ini (Utama):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-default-600 dark:text-default-400">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 space-y-0.5">
                <span className="font-semibold text-foreground block">🪄 1. Magic Quick Add</span>
                <span>Auto-parse teks transaksi di halaman Transaksi.</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 space-y-0.5">
                <span className="font-semibold text-foreground block">🛡️ 3. Financial Auditor</span>
                <span>Audit cashflow & kebocoran belanja di Dashboard.</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 space-y-0.5">
                <span className="font-semibold text-foreground block">🎯 4. Goal Simulator</span>
                <span>Uji kelayakan target tabungan di menu Goals.</span>
              </div>
            </div>
            <p className="text-[10px] text-default-400 pt-0.5 italic">
              *Catatan: Pada ketiga menu di atas, Anda tetap dapat mengganti model atau key secara instan via gear/opsi dropdown sebagai pilihan alternatif (secondary override).
            </p>
          </div>

          {/* Save AI Config Button */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="primary"
              className="h-8 px-4 text-xs bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer shadow-xs"
              onPress={handleSaveAiConfig}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Simpan Konfigurasi AI</span>
            </Button>
          </div>
        </Card>

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

        {/* Currency & Region Settings */}
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
          </div>
        </Card>

        {/* Role-Based Access Control (RBAC) & Team Privileges */}
        <Card id="rbac" className="p-4 sm:p-5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>Access Control & RBAC Matrix</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold">
                    ACTIVE WORKSPACE
                  </span>
                </h3>
                <p className="text-[11px] text-default-500">Fine-grained role permissions and privileges across your workspace entities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-500">Current Role:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                OWNER
              </span>
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-default-200/60 dark:border-default-800/60 text-default-400 text-[11px]">
                  <th className="py-2.5 font-medium">Capability / Module</th>
                  <th className="py-2.5 text-center font-medium">Owner</th>
                  <th className="py-2.5 text-center font-medium">Admin</th>
                  <th className="py-2.5 text-center font-medium">Accountant</th>
                  <th className="py-2.5 text-center font-medium">Member</th>
                  <th className="py-2.5 text-center font-medium">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-100 dark:divide-default-800/50 text-foreground">
                {[
                  { cap: "Create, Edit & Delete Transactions", owner: true, admin: true, acc: true, member: true, viewer: false },
                  { cap: "Double-Entry Ledger Reconciliation", owner: true, admin: true, acc: true, member: false, viewer: false },
                  { cap: "Master Wallets & Bank Accounts", owner: true, admin: true, acc: false, member: false, viewer: false },
                  { cap: "Multi-Provider AI OCR & Auditing", owner: true, admin: true, acc: true, member: true, viewer: false },
                  { cap: "Export Audit-Ready Excel (.xlsx) & PDF", owner: true, admin: true, acc: true, member: true, viewer: true },
                  { cap: "Workspace Settings & API Keys", owner: true, admin: false, acc: false, member: false, viewer: false },
                  { cap: "Invite Members & Assign Roles", owner: true, admin: true, acc: false, member: false, viewer: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-colors">
                    <td className="py-2 font-medium text-default-700 dark:text-default-300">{row.cap}</td>
                    <td className="py-2 text-center text-emerald-500 font-bold">{row.owner ? "✓" : "—"}</td>
                    <td className="py-2 text-center text-emerald-500 font-bold">{row.admin ? "✓" : "—"}</td>
                    <td className="py-2 text-center text-emerald-500 font-bold">{row.acc ? "✓" : "—"}</td>
                    <td className="py-2 text-center text-emerald-500 font-bold">{row.member ? "✓" : "—"}</td>
                    <td className="py-2 text-center text-default-400">{row.viewer ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-default-600 dark:text-default-400">Team seat allocation: <strong className="text-foreground">1 of 5 seats used</strong></span>
            </div>
            <Link
              href="/workspaces"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>Manage Workspace Seats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
