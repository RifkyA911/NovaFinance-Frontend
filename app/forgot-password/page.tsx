"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch {
      setError("Unable to process password reset request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the email associated with your NovaJournal account"
      badgeText="Account Recovery"
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-default-500 leading-relaxed">
            We will send a one-time verification link to your registered email address to help you recover access to your workspaces.
          </p>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 dark:text-danger-400 text-xs animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
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

          <Button
            type="submit"
            className="w-full h-10 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-xl shadow-md hover:opacity-95 transition-opacity mt-2 cursor-pointer"
            isDisabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Sending Reset Link...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Send Password Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Verification Link Dispatched</h3>
            <p className="text-xs text-default-500 max-w-xs mx-auto">
              If an account is associated with <span className="font-semibold text-foreground">{email}</span>, you will receive password reset instructions shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-800 text-xs font-medium text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 transition-colors cursor-pointer"
          >
            Send to a different email
          </button>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-default-200 dark:border-default-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-default-600 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
