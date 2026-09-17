"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signUp } from "@/lib/auth";
import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (result.error) {
        setError(result.error.message || "Registration failed. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your cash flow, wealth portfolio, and AI bookkeeping in minutes"
      badgeText="Join NovaJournal Free"
    >
      <form onSubmit={handleRegister} className="space-y-3.5">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 dark:text-danger-400 text-xs animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="w-full h-9.5 pl-9 pr-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              className="w-full h-9.5 pl-9 pr-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-9.5 pl-9 pr-9 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
                placeholder="Min. 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-default-400 hover:text-default-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full h-9.5 pl-9 pr-9 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-default-400"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-default-400 hover:text-default-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-default-100/60 dark:bg-default-800/40 text-[11px] text-default-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Includes free personal workspace & standard AI OCR tier.</span>
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-xl shadow-md hover:opacity-95 transition-opacity mt-2 cursor-pointer"
          isDisabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Creating your workspace...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-default-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  );
}
