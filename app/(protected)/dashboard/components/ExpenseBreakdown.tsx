/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@heroui/react";
import { PieChart, Tag } from "lucide-react";

interface ExpenseBreakdownProps {
  categoryViewType: "expense" | "income";
  setCategoryViewType: (val: "expense" | "income") => void;
  spendingCategories: any[];
  formatCurrency: (val: number | string) => string;
}

export function ExpenseBreakdown({
  categoryViewType,
  setCategoryViewType,
  spendingCategories,
  formatCurrency
}: ExpenseBreakdownProps) {
  return (
    <section aria-label="Expense Breakdown">
      {/* Spending & Inflow by Category */}
      <div className="lg:col-span-2">
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs p-3.5 sm:p-4">
            <Card.Header className="flex items-center justify-between p-0 pb-3">
              <div>
                <Card.Title className="text-sm font-semibold text-foreground">
                  {categoryViewType === "expense" ? "Expense Breakdown" : "Income Breakdown"}
                </Card.Title>
                <Card.Description className="text-xs text-default-500">
                  Distribution by category this month
                </Card.Description>
              </div>
              <div className="flex items-center gap-1 bg-default-100 dark:bg-default-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setCategoryViewType("expense")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryViewType === "expense" ? "bg-red-500 text-white shadow-2xs" : "text-default-500"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setCategoryViewType("income")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryViewType === "income" ? "bg-green-500 text-white shadow-2xs" : "text-default-500"
                  }`}
                >
                  Income
                </button>
              </div>
            </Card.Header>
            <Card.Content className="p-0 pt-4">
              {spendingCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start content-start">
                  {spendingCategories.map((category, index) => {
                    const categoryName =
                      typeof category === "object" && category.name
                        ? category.name
                        : typeof category === "string"
                        ? category
                        : `Category ${index}`;
                    const percentageNum = Number(category.percentage) || 0;
                    const catColor = (category as { color?: string }).color || "#3b82f6";
                    return (
                      <div key={categoryName || index} className="relative group overflow-hidden p-3.5 rounded-2xl bg-linear-to-br from-default-100/80 to-default-50/40 dark:from-default-900/60 dark:to-default-800/20 border border-default-200/60 dark:border-default-700/60 hover:shadow-lg hover:border-default-300 dark:hover:border-default-600 transition-all duration-300">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-tr from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 pointer-events-none transition-opacity duration-500"></div>
                        
                        <div className="flex items-start justify-between mb-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                              <Tag className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{categoryName}</span>
                              <span className="text-[11px] font-medium text-default-500 mt-0.5">{category.percentage}% of total</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">Total</span>
                            <span className="font-mono font-bold text-sm" style={{ color: catColor }}>
                              {category.value ? formatCurrency(category.value) : "Rp 0"}
                            </span>
                          </div>
                          <div className="w-full bg-default-200/60 dark:bg-default-800/60 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentageNum}%`, backgroundColor: catColor, boxShadow: `0 0 8px ${catColor}60` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-default-200 dark:border-default-800 rounded-2xl bg-default-50/50 dark:bg-default-900/20">
                  <PieChart className="w-10 h-10 text-default-300 dark:text-default-700 mb-3" />
                  <p className="text-default-500 font-medium text-sm">No {categoryViewType} recorded</p>
                  <p className="text-default-400 text-xs mt-1">Transactions will appear here automatically</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
    </section>
  );
}
