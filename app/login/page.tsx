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

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

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
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
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
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred during quick sign in.");
    } finally {
      setLoading(false);
    }
  };

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
