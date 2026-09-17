/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import {
  TrendingUp,
  Sparkles,
  Calculator,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WealthProjectorProps {
  initialCapital: number;
  formatCurrency: (val: number | string) => string;
}

export function WealthProjector({
  initialCapital,
  formatCurrency,
}: WealthProjectorProps) {
  const [monthlyDCA, setMonthlyDCA] = useState<number>(3000000); // 3jt / bulan
  const [expectedCAGR, setExpectedCAGR] = useState<number>(11); // 11% p.a. (historis IHSG + dividend)
  const [years, setYears] = useState<number>(10);

  // Generate projection simulation year by year
  const projectionData = useMemo(() => {
    const data = [];
    let capitalInvested = initialCapital;
    let expectedWealth = initialCapital;
    let bullWealth = initialCapital;
    let bearWealth = initialCapital;

    const r = expectedCAGR / 100;
    const rBull = (expectedCAGR + 4) / 100;
    const rBear = Math.max(0.02, (expectedCAGR - 4) / 100);

    const currentYear = new Date().getFullYear();

    data.push({
      year: `${currentYear}`,
      capital: Math.round(capitalInvested),
      expected: Math.round(expectedWealth),
      bull: Math.round(bullWealth),
      bear: Math.round(bearWealth),
    });

    for (let y = 1; y <= years; y++) {
      const annualAddition = monthlyDCA * 12;
      capitalInvested += annualAddition;

      // Compound interest with monthly annuity
      expectedWealth = (expectedWealth + annualAddition) * (1 + r);
      bullWealth = (bullWealth + annualAddition) * (1 + rBull);
      bearWealth = (bearWealth + annualAddition) * (1 + rBear);

      data.push({
        year: `+${y} Thn (${currentYear + y})`,
        capital: Math.round(capitalInvested),
        expected: Math.round(expectedWealth),
        bull: Math.round(bullWealth),
        bear: Math.round(bearWealth),
      });
    }

    return data;
  }, [initialCapital, monthlyDCA, expectedCAGR, years]);

  const finalNode = projectionData[projectionData.length - 1];
  const totalProfit = finalNode ? finalNode.expected - finalNode.capital : 0;
  const growthMultiplier = finalNode && finalNode.capital > 0 ? (finalNode.expected / finalNode.capital).toFixed(1) : "1.0";

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Monte Carlo Wealth Projector & Compound Interest
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Proyeksi Masa Depan
              </span>
            </h3>
            <p className="text-[11px] text-default-500">
              Simulasi akumulasi kekayaan dengan investasi rutin (DCA) dan bunga majemuk
            </p>
          </div>
        </div>

        {/* Quick Horizon Buttons */}
        <div className="flex items-center gap-1 bg-default-100 dark:bg-default-800 p-0.5 rounded-lg text-xs">
          {[5, 10, 15, 20].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setYears(yr)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                years === yr
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              {yr} Tahun
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Sliders Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-default-50/70 dark:bg-default-900/40 border border-default-200/60 dark:border-default-800">
        {/* Slider 1: Monthly DCA */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-default-600 dark:text-default-400">
              Investasi Rutin Bulanan (DCA):
            </span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
              {formatCurrency(monthlyDCA)}/bln
            </span>
          </div>
          <input
            type="range"
            min={500000}
            max={20000000}
            step={500000}
            value={monthlyDCA}
            onChange={(e) => setMonthlyDCA(Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-default-200 dark:bg-default-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-default-400 font-mono">
            <span>Rp 500rb</span>
            <span>Rp 10jt</span>
            <span>Rp 20jt</span>
          </div>
        </div>

        {/* Slider 2: Expected CAGR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-default-600 dark:text-default-400">
              Ekspektasi Return Tahunan (CAGR):
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
              {expectedCAGR}% / tahun
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={25}
            step={0.5}
            value={expectedCAGR}
            onChange={(e) => setExpectedCAGR(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-default-200 dark:bg-default-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-default-400 font-mono">
            <span>4% (Konservatif)</span>
            <span>11% (Rata-rata IHSG)</span>
            <span>25% (Agresif)</span>
          </div>
        </div>
      </div>

      {/* Forecast Result Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border border-purple-500/20">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">
            Estimasi Nilai Masa Depan ({years} Tahun)
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
            {formatCurrency(finalNode?.expected || 0)}
          </p>
          <span className="text-[10px] text-default-400">
            Rentang Bull/Bear: {formatCurrency(finalNode?.bear || 0).split(",")[0]} -{" "}
            {formatCurrency(finalNode?.bull || 0).split(",")[0]}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">
            Total Modal Disetor
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-foreground mt-0.5">
            {formatCurrency(finalNode?.capital || 0)}
          </p>
          <span className="text-[10px] text-default-400">
            Modal Awal + {years * 12}x setoran DCA
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">
            Compound Interest (Bunga Majemuk)
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            +{formatCurrency(totalProfit)}
          </p>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {growthMultiplier}x lipat dari modal pokok!
          </span>
        </div>
      </div>

      {/* Projection Area Chart with Confidence Bands */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `Rp ${(v / 1e6).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                color: "#fff",
                fontSize: "11px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              }}
              formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Area
              type="monotone"
              dataKey="bull"
              name="Bull Market (Optimis)"
              stroke="#10b981"
              strokeDasharray="4 4"
              fill="url(#bullGrad)"
            />
            <Area
              type="monotone"
              dataKey="expected"
              name="Ekspektasi Pertumbuhan"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#expectedGrad)"
            />
            <Area
              type="monotone"
              dataKey="capital"
              name="Total Modal Disetor"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="url(#capitalGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
