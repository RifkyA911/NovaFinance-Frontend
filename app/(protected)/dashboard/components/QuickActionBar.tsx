"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@heroui/react";
import {
  TrendingUp,
  CreditCard,
  Landmark,
  Workflow,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function QuickActionBar() {
  const router = useRouter();

  const actions = [
    {
      id: "income",
      title: "Record Income",
      subtitle: "Gaji, invoice, omset & profit",
      badge: "+ Pemasukan",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white",
      hoverBorder: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      path: "/transactions/new?type=income",
    },
    {
      id: "expense",
      title: "Record Expense",
      subtitle: "Biaya hidup, operasional, belanja",
      badge: "- Pengeluaran",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: CreditCard,
      iconBg: "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white",
      hoverBorder: "hover:border-rose-500/50 hover:shadow-rose-500/5",
      path: "/transactions/new?type=expense",
    },
    {
      id: "wallets",
      title: "Wallets & Accounts",
      subtitle: "Kelola bank, e-wallet & kas",
      badge: "Master Akun",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: Landmark,
      iconBg: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white",
      hoverBorder: "hover:border-blue-500/50 hover:shadow-blue-500/5",
      path: "/wallets",
    },
    {
      id: "money-flow",
      title: "Money Flow Viz",
      subtitle: "Diagram interaktif alur kas",
      badge: "Interactive",
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      icon: Workflow,
      iconBg: "bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white",
      hoverBorder: "hover:border-cyan-500/50 hover:shadow-cyan-500/5",
      path: "/money-flow",
    },
    {
      id: "goals",
      title: "Goals & Wishlist",
      subtitle: "Target tabungan & simulasi AI",
      badge: "AI Powered",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: Target,
      iconBg: "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white",
      hoverBorder: "hover:border-purple-500/50 hover:shadow-purple-500/5",
      path: "/goals",
    },
  ];

  return (
    <section aria-label="Quick Actions Command Bar" className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-default-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Quick Operation Hub
          </span>
          <span className="text-[10px] text-default-400 hidden sm:inline">
            Akses cepat pencatatan dan manajemen finansial
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.id}
              onClick={() => router.push(act.path)}
              className={`group p-3 sm:p-3.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${act.hoverBorder}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs ${act.iconBg}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${act.badgeColor}`}
                >
                  {act.badge}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h4>
                  <ArrowRight className="w-3 h-3 text-default-300 group-hover:text-foreground group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-[11px] text-default-500 line-clamp-1">
                  {act.subtitle}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
