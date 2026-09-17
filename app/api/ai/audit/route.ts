/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { executeMultiProviderAi, AiProvider } from "../../../lib/ai-service";

interface AuditRequest {
  workspaceName?: string;
  currency?: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  transactionCount?: number;
  userApiKey?: string;
  userProvider?: AiProvider;
}

function generateLocalHeuristicAudit({
  currency = "IDR",
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  topCategories = [],
}: AuditRequest) {
  const isDeficit = monthlyExpense > monthlyIncome && monthlyIncome > 0;
  const isNoIncome = monthlyIncome === 0 && monthlyExpense > 0;
  const netCashflow = monthlyIncome - monthlyExpense;

  // 1. Calculate Health Score (0 - 100)
  let healthScore = 70;
  let status: "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis" = "Cukup Baik";

  if (isDeficit || isNoIncome) {
    healthScore = Math.max(30, Math.round(50 - (Math.abs(netCashflow) / (monthlyIncome || 1)) * 20));
    status = healthScore < 45 ? "Kritis" : "Perlu Perhatian";
  } else if (savingsRate >= 35) {
    healthScore = 95;
    status = "Sehat";
  } else if (savingsRate >= 20) {
    healthScore = 85;
    status = "Sehat";
  } else if (savingsRate >= 10) {
    healthScore = 75;
    status = "Cukup Baik";
  } else {
    healthScore = 58;
    status = "Perlu Perhatian";
  }

  // 2. Detect Specific Leakages from Top Categories
  const leakages: Array<{
    category: string;
    severity: "high" | "medium" | "low";
    detectedLeakage: string;
    insight: string;
    solution: string;
  }> = [];

  let totalSavingsPotential = 0;

  topCategories.forEach((cat) => {
    const pct = cat.percentage;
    const catName = cat.name.toLowerCase();

    // Leakage rule 1: Food / Coffee > 30% of total spend
    if (
      (catName.includes("makan") || catName.includes("kopi") || catName.includes("kuliner") || catName.includes("cafe")) &&
      pct >= 28
    ) {
      const excess = Math.round(cat.amount * 0.25);
      totalSavingsPotential += excess;
      leakages.push({
        category: cat.name,
        severity: pct >= 40 ? "high" : "medium",
        detectedLeakage: `Potensi kebocoran Rp ${excess.toLocaleString("id-ID")} / bulan`,
        insight: `Kategori ${cat.name} menyerap ${pct.toFixed(1)}% dari total pengeluaran Anda. Ini melampaui batas ideal pos konsumsi harian (20-25%).`,
        solution: `Batasi jajan/makan di luar atau pesan antar maksimal 2-3 kali seminggu untuk menghemat sekitar Rp ${excess.toLocaleString("id-ID")} per bulan.`,
      });
    }

    // Leakage rule 2: Shopping / Lifestyle / Entertainment > 20%
    else if (
      (catName.includes("belanja") || catName.includes("shopping") || catName.includes("hiburan") || catName.includes("lifestyle")) &&
      pct >= 20
    ) {
      const excess = Math.round(cat.amount * 0.35);
      totalSavingsPotential += excess;
      leakages.push({
        category: cat.name,
        severity: "medium",
        detectedLeakage: `Belanja impulsif ~Rp ${excess.toLocaleString("id-ID")} / bulan`,
        insight: `Pengeluaran ${cat.name} mencapai ${pct.toFixed(1)}% pengeluaran. Terdapat indikasi belanja keinginan non-esensial.`,
        solution: "Terapkan aturan jeda 48 jam sebelum checkout belanja online untuk menghindari pembelian impulsif.",
      });
    }

    // Leakage rule 3: Any single dominant category taking > 45%
    else if (pct >= 45 && !catName.includes("invest") && !catName.includes("tabung")) {
      const excess = Math.round(cat.amount * 0.15);
      totalSavingsPotential += excess;
      leakages.push({
        category: cat.name,
        severity: "high",
        detectedLeakage: `Konsentrasi beban Rp ${cat.amount.toLocaleString("id-ID")}`,
        insight: `Hampir separuh uang keluar (${pct.toFixed(1)}%) terkonsentrasi di pos ${cat.name}. Arus kas rentan jika terjadi pembengkakan tak terduga.`,
        solution: `Lakukan audit rinci pada item pembentuk ${cat.name} dan tetapkan batas pagu maksimal bulanan.`,
      });
    }
  });

  if (leakages.length === 0) {
    const topCat = topCategories[0];
    if (topCat) {
      const minorSavings = Math.round(topCat.amount * 0.1);
      totalSavingsPotential += minorSavings;
      leakages.push({
        category: topCat.name,
        severity: "low",
        detectedLeakage: `Optimasi efisiensi Rp ${minorSavings.toLocaleString("id-ID")}`,
        insight: `Pengeluaran Anda relatif stabil. Pos terbesar saat ini adalah '${topCat.name}' (${topCat.percentage.toFixed(1)}%).`,
        solution: "Lakukan pencatatan rutin setiap struk belanja agar tidak ada pengeluaran mikro yang lolos.",
      });
    }
  }

  // 3. Recommendations
  const recommendations: string[] = [];
  if (isDeficit) {
    recommendations.push(
      `Arus kas mengalami defisit bulanan sebesar Rp ${Math.abs(netCashflow).toLocaleString("id-ID")}. Hentikan sementara pos belanja non-primer.`
    );
    recommendations.push("Prioritaskan pelunasan tagihan berbunga tinggi dan tunda pembelian barang bernilai besar.");
  } else {
    recommendations.push(
      `Pertahankan rasio tabungan ${savingsRate.toFixed(1)}%. Alokasikan surplus bulanan (Rp ${netCashflow.toLocaleString("id-ID")}) langsung di awal gajian.`
    );
  }

  if (totalBalance < monthlyExpense * 3) {
    recommendations.push(
      `Total saldo likuid saat ini baru menutupi sekitar ${(totalBalance / (monthlyExpense || 1)).toFixed(1)} bulan pengeluaran. Bangun Dana Darurat hingga minimal 3-6 bulan.`
    );
  } else {
    recommendations.push(
      "Dana darurat likuid Anda dalam kondisi aman (>3 bulan pengeluaran). Mulai diversifikasikan sisa kas ke instrumen investasi produktif."
    );
  }

  return {
    healthScore,
    status,
    summary: isDeficit
      ? `Terdeteksi defisit kas sebesar Rp ${Math.abs(netCashflow).toLocaleString("id-ID")} bulan ini. Diperlukan pengetatan pada pos pengeluaran sekunder.`
      : savingsRate >= 25
      ? `Kondisi finansial sangat prima dengan tingkat tabungan ${savingsRate.toFixed(1)}%. Pengelolaan arus kas terstruktur dengan baik.`
      : `Kondisi keuangan stabil namun rasio tabungan (${savingsRate.toFixed(1)}%) masih memiliki ruang optimasi dari pengurangan kebocoran kas mikro.`,
    leakages,
    recommendations,
    savingsPotential: `Rp ${Math.max(100000, totalSavingsPotential).toLocaleString("id-ID")} / bulan`,
    engineUsed: "Nova Heuristic Engine (Built-in)",
  };
}

export async function POST(req: Request) {
  try {
    const body: AuditRequest = await req.json();
    const {
      workspaceName = "Workspace Keuangan",
      currency = "IDR",
      totalBalance = 0,
      monthlyIncome = 0,
      monthlyExpense = 0,
      savingsRate = 0,
      topCategories = [],
      transactionCount = 0,
      userApiKey = "",
      userProvider = "auto",
    } = body;

    const systemPrompt = `Anda adalah NovaJournal Chief Financial Auditor & Forensik Keuangan Indonesia.
Tugas Anda: Analisis data keuangan pengguna secara tajam, jujur, objektif, dan solutif.
Deteksi kebocoran uang kas (spending leakage), berikan skor kesehatan finansial (0-100), dan usulkan solusi praktis.

Kembalikan HANYA format JSON valid tanpa tag markdown:
{
  "healthScore": 82,
  "status": "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis",
  "summary": "Ringkasan diagnosis kas 2-3 kalimat tajam dan berbobot dalam bahasa Indonesia",
  "leakages": [
    {
      "category": "Nama Kategori Terkait",
      "severity": "high" | "medium" | "low",
      "detectedLeakage": "Estimasi nominal kebocoran atau deskripsi kebocoran",
      "insight": "Penjelasan mengapa pos ini bocor atau membebani kas",
      "solution": "Solusi konkret dan terukur untuk menambal kebocoran tersebut"
    }
  ],
  "recommendations": [
    "Saran aksi konkret 1",
    "Saran aksi konkret 2",
    "Saran aksi konkret 3"
  ],
  "savingsPotential": "Estimasi nominal penghematan per bulan (contoh: 'Rp 650.000 / bulan')"
}`;

    const userPrompt = `Data Finansial Bulan Ini:
- Workspace: ${workspaceName} (${currency})
- Saldo Likuid Total: Rp ${totalBalance.toLocaleString("id-ID")}
- Pemasukan Bulan Ini: Rp ${monthlyIncome.toLocaleString("id-ID")}
- Pengeluaran Bulan Ini: Rp ${monthlyExpense.toLocaleString("id-ID")}
- Rasio Tabungan (Savings Rate): ${savingsRate.toFixed(1)}%
- Jumlah Transaksi: ${transactionCount} transaksi
- Rincian Pengeluaran Teratas:
${topCategories.map((c, i) => `  ${i + 1}. ${c.name}: Rp ${c.amount.toLocaleString("id-ID")} (${c.percentage.toFixed(1)}%)`).join("\n") || "  (Belum ada rincian)"}

Lakukan audit forensik dan berikan JSON laporan kesehatan finansial.`;

    // Try executing through Multi-Provider Cascade (Groq -> Gemini -> DeepSeek -> Claude)
    try {
      const aiResult = await executeMultiProviderAi({
        systemPrompt,
        userPrompt,
        userApiKey,
        userProvider,
        temperature: 0.2,
      });

      if (aiResult.parsedJson) {
        return NextResponse.json({
          success: true,
          data: {
            ...aiResult.parsedJson,
            engineUsed: `${aiResult.provider} (${aiResult.model})`,
          },
        });
      }
    } catch (aiErr: any) {
      console.warn("AI Multi-provider failed, falling back to heuristic engine:", aiErr.message);
    }

    // Fallback Heuristic Engine (100% reliable, zero downtime)
    const localAudit = generateLocalHeuristicAudit(body);
    return NextResponse.json({
      success: true,
      data: localAudit,
    });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal melakukan audit keuangan." },
      { status: 500 }
    );
  }
}
