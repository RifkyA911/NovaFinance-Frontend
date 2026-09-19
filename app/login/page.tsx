"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, User, UserCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signIn } from "@/lib/auth";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import AuthLayout from "@/components/auth/AuthLayout";
import FluidWaveTransition from "@/components/transitions/FluidWaveTransition";
import { playNovaLoginSound } from "@/app/lib/sound";

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWaveTransition, setShowWaveTransition] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !showWaveTransition) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router, showWaveTransition]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password combination");
        setLoading(false);
      } else {
        playNovaLoginSound();
        setShowWaveTransition(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDummyLogin = async (dummyEmail: string, dummyPassword: string) => {
    setEmail(dummyEmail);
    setPassword(dummyPassword);
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (result.error) {
        setError(result.error.message || "Quick login failed");
        setLoading(false);
      } else {
        playNovaLoginSound();
        setShowWaveTransition(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred during quick sign in.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      playNovaLoginSound();
      await (signIn as any).social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Google OAuth belum dikonfigurasi sepenuhnya. Masukkan GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET di .env backend.");
      setLoading(false);
    }
  };

  if (showWaveTransition) {
    return (
      <FluidWaveTransition
        durationSeconds={5}
        onComplete={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your financial dashboard"
      badgeText="Secure Authentication"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 dark:text-danger-400 text-xs animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Email Address</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-10 pl-9 pr-10 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-default-400 hover:text-default-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-xl shadow-md hover:opacity-95 transition-opacity mt-2 cursor-pointer"
          isDisabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-default-200 dark:border-default-800" />
          </div>
          <div className="relative bg-white dark:bg-gray-900 px-3 text-[11px] font-medium uppercase tracking-wider text-default-400">
            atau lanjutkan dengan
          </div>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full h-10 px-4 rounded-xl border border-default-200 dark:border-default-800 bg-white dark:bg-default-900 hover:bg-default-100 dark:hover:bg-default-800 text-foreground text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-5 text-center text-xs text-default-500">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Create free account
        </Link>
      </div>

      {/* Quick Login for Dev / Demo */}
      <div className="mt-6 pt-5 border-t border-default-200 dark:border-default-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider">
            Quick Demo Accounts
          </span>
          <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">
            Dev Ready
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDummyLogin("test@example.com", "password123")}
            className="p-2.5 rounded-xl border border-default-200 hover:border-blue-500 dark:border-default-800 dark:hover:border-blue-500/50 bg-default-50 dark:bg-default-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left group disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <User className="w-3.5 h-3.5" />
              <span>Test User</span>
            </div>
            <div className="text-[10px] text-default-400 mt-0.5 truncate">test@example.com</div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDummyLogin("admin@example.com", "admin123")}
            className="p-2.5 rounded-xl border border-default-200 hover:border-purple-500 dark:border-default-800 dark:hover:border-purple-500/50 bg-default-50 dark:bg-default-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all text-left group disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin User</span>
            </div>
            <div className="text-[10px] text-default-400 mt-0.5 truncate">admin@example.com</div>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY || ""}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
}
