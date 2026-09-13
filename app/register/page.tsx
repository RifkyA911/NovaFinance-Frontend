"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Link } from "@heroui/react";
import { Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  if (!authLoading && isAuthenticated) {
    router.push("/dashboard");
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        // Registration successful, redirect to login
        router.push("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NovaJournal
          </h1>
          <p className="text-default-500 mt-2">Create your account</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block text-default-700 dark:text-default-300">
                Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-default-700 dark:text-default-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-default-700 dark:text-default-300">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-default-700 dark:text-default-300">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg"
              isDisabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-default-500">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
