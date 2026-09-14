"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@heroui/react";
import { Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signIn } from "@/lib/auth";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError(result.error.message || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDummyLogin = async (dummyEmail: string, dummyPassword: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NovaJournal
          </h1>
          <p className="text-default-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 md:p-8 shadow-xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Email</label>
              <input
                type="email"
                className="w-full px-3.5 py-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-100/5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Password</label>
              <input
                type="password"
                className="w-full px-3.5 py-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-100/5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md cursor-pointer"
              isDisabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Create account
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-200 dark:border-default-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-default-500 text-xs uppercase tracking-wider">
                  Quick Login (Development)
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDummyLogin("test@example.com", "password123")}
                className="w-full h-14 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 disabled:opacity-50 transition-colors flex items-center gap-3 px-4 cursor-pointer text-foreground"
              >
                <span className="text-lg">👤</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">Test User</span>
                  <span className="text-xs text-default-500">test@example.com</span>
                </div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDummyLogin("admin@example.com", "admin123")}
                className="w-full h-14 bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800/50 rounded-lg hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 disabled:opacity-50 transition-colors flex items-center gap-3 px-4 cursor-pointer text-foreground"
              >
                <span className="text-lg">👑</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">Admin User</span>
                  <span className="text-xs text-default-500">admin@example.com</span>
                </div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
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
