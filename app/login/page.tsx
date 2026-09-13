"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Input, Button } from "@heroui/react";
import { signIn } from "@/lib/auth";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
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
      console.log("Attempting login with:", email);
      console.log("Email type:", typeof email);
      console.log("Email length:", email.length);
      
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      console.log("Login result:", result);

      if (result.error) {
        console.error("Login error:", result.error);
        setError(result.error.message || "Login failed");
      } else {
        console.log("Login successful, redirecting to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDummyLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email,
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
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              labelPlacement="outside"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
            />
            <Input
              label="Password"
              labelPlacement="outside"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
            />
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
            <a href="/register" className="text-blue-600 hover:text-blue-700">
              Create account
            </a>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-200 dark:border-default-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-default-500">Quick Login (Development)</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDummyLogin("test@example.com", "password123")}
                className="w-full h-14 bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md hover:from-blue-100 hover:to-blue-200 disabled:bg-gray-100 transition-colors flex items-center gap-3 px-4"
              >
                <span className="text-lg">👤</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Test User</span>
                  <span className="text-xs text-gray-500">test@example.com</span>
                </div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDummyLogin("admin@example.com", "admin123")}
                className="w-full h-14 bg-linear-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-md hover:from-purple-100 hover:to-purple-200 disabled:bg-gray-100 transition-colors flex items-center gap-3 px-4"
              >
                <span className="text-lg">👑</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Admin User</span>
                  <span className="text-xs text-gray-500">admin@example.com</span>
                </div>
              </button>
            </div>
          </div>
        </div>
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
