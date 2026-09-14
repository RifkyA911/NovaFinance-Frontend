"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { Wallet, BarChart3, PieChart, TrendingUp, Shield, Zap, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted] = useState(true);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-default-200 dark:border-default-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NovaJournal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-default-600" />}
              </Button>
            )}
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Financial Management
          </h1>
          <p className="text-xl text-default-600 dark:text-default-400 mb-8">
            Track your income, expenses, and investments in one place. Make smarter financial decisions with powerful analytics.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Transactions</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Monitor all your income and expenses with detailed categorization and filtering.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visual Analytics</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Get insights with beautiful charts and graphs showing your financial health.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Portfolio Tracking</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Manage your investments and track portfolio performance over time.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Your financial data is encrypted and stored securely with enterprise-grade security.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Responsive</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Lightning-fast performance with real-time updates and instant data sync.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Currency</h3>
            <p className="text-sm text-default-600 dark:text-default-400">
              Support for multiple currencies with automatic conversion and exchange rates.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-linear-to-r from-blue-500 to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of users who are already managing their money smarter.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 font-medium">
              Get Started Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-default-200 dark:border-default-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-default-600 dark:text-default-400">
          <p>© 2026 NovaJournal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
