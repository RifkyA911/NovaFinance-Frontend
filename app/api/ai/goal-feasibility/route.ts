/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { executeMultiProviderAi, AiProvider } from "../../../lib/ai-service";

interface GoalFeasibilityRequest {
  goalTitle: string;
  category?: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string; // YYYY-MM-DD
  workspaceName?: string;
  currency?: string;
  monthlyIncome?: number;
  monthlyExpense?: number;
  totalBalance?: number;
  userApiKey?: string;
  userProvider?: AiProvider;
}

function calculateLocalFeasibility(req: GoalFeasibilityRequest) {
  const {
    goalTitle,
    targetAmount,
    currentAmount = 0,
    targetDate,
    monthlyIncome = 0,
    monthlyExpense = 0,
    totalBalance = 0,
  } = req;

  const remainingNeeded = Math.max(0, targetAmount - currentAmount);
  const now = new Date();
  const target = new Date(targetDate);
  const diffDays = Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(0.5, parseFloat((diffDays / 30.4).toFixed(1)));

  const monthlyRequired = Math.round(remainingNeeded / monthsRemaining);
  const currentNetCashflow = Math.max(0, monthlyIncome - monthlyExpense);

  // Score & Status calculation
  let feasibilityScore = 70;
  let status: "Sangat Realistis" | "Cukup Realistis" | "Perlu Penyesuaian" | "Sangat Berat / Risiko Defisit" = "Cukup Realistis";

  const coverageRatio = currentNetCashflow > 0 ? currentNetCashflow / monthlyRequired : 0;

  if (currentNetCashflow === 0 && monthlyIncome === 0) {
    feasibilityScore = 50;
    status = "Perlu Penyesuaian";
  } else if (coverageRatio >= 1.5) {
    feasibilityScore = 95;
    status = "Sangat Realistis";
  } else if (coverageRatio >= 1.0) {
    feasibilityScore = 85;
    status = "Sangat Realistis";
  } else if (coverageRatio >= 0.7) {
    feasibilityScore = 70;
    status = "Cukup Realistis";
  } else if (coverageRatio >= 0.4) {
    feasibilityScore = 52;
    status = "Perlu Penyesuaian";
  } else {
    feasibilityScore = 35;
    status = "Sangat Berat / Risiko Defisit";
  }

  // Calculate recommended timeline adjustment
  const idealMonths = currentNetCashflow > 0 ? Math.ceil(remainingNeeded / (currentNetCashflow * 0.8)) : Math.ceil(monthsRemaining * 1.5);
  const idealDate = new Date(now);
  idealDate.setMonth(idealDate.getMonth() + idealMonths);

  const gap = monthlyRequired - currentNetCashflow;

  const alternativeOptions = [
    {
      title: "Opsi Perpanjang Waktu (Timeline Optimization)",
      description: `Jika target diundur menjadi ${idealMonths} bulan (target: ${idealDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}), Anda cukup menabung sekitar Rp ${Math.round(remainingNeeded / idealMonths).toLocaleString("id-ID")} / bulan yang aman bagi arus kas Anda.`,
    },
    {
      title: "Opsi Efisiensi Belanja (Budget Optimization)",
      description: gap > 0
        ? `Terdapat selisih kebutuhan nabung Rp ${Math.round(gap).toLocaleString("id-ID")} / bulan. Pangkas pos belanja keinginan atau makan luar untuk menutup selisih ini.`
        : "Arus kas surplus Anda saat ini sudah mencukupi target bulanan ini tanpa perlu memangkas kebutuhan pokok.",
    },
    {
      title: "Perlindungan Dana Darurat",
      description: totalBalance < monthlyExpense * 3
        ? "Saldo likuid Anda saat ini masih terbatas. Pastikan alokasi target ini tidak mengorbankan pos Dana Darurat 3 bulan pengeluaran."
        : "Ketahanan kas likuid Anda dalam batas sehat (>3 bulan biaya hidup). Anda aman mengeksekusi target ini.",
    },
  ];

  return {
    feasibilityScore,
    status,
    summary: gap > 0
      ? `Untuk mencapai target "${goalTitle}", Anda membutuhkan alokasi Rp ${monthlyRequired.toLocaleString("id-ID")} / bulan. Sisa kas riil saat ini (Rp ${currentNetCashflow.toLocaleString("id-ID")}) belum mencukupi secara penuh (kurang Rp ${Math.round(gap).toLocaleString("id-ID")}/bln).`
      : `Target "${goalTitle}" sangat realistis! Kebutuhan menabung Rp ${monthlyRequired.toLocaleString("id-ID")} / bulan dapat ditutup sepenuhnya oleh surplus kas bulanan Anda (Rp ${currentNetCashflow.toLocaleString("id-ID")}).`,
    remainingNeeded,
    monthsRemaining,
    monthlyRequired,
    currentNetCashflow,
    gap: Math.round(gap),
    suggestedTargetDate: idealDate.toISOString().split("T")[0],
    alternativeOptions,
    engineUsed: "Nova Heuristic Financial Engine (Local)",
  };
}

export async function POST(req: Request) {
  try {
    const body: GoalFeasibilityRequest = await req.json();
    const {
      goalTitle,
      category = "other",
      targetAmount = 0,
      currentAmount = 0,
      targetDate,
      workspaceName = "Workspace Keuangan",
      currency = "IDR",
      monthlyIncome = 0,
      monthlyExpense = 0,
      totalBalance = 0,
      userApiKey = "",
      userProvider = "auto",
    } = body;

    if (!goalTitle || !targetAmount || !targetDate) {
      return NextResponse.json(
        { error: "Nama target, nominal target, dan tanggal target wajib diisi." },
        { status: 400 }
      );
    }

    const remainingNeeded = Math.max(0, targetAmount - currentAmount);
    const now = new Date();
    const target = new Date(targetDate);
    const diffDays = Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const monthsRemaining = Math.max(0.5, parseFloat((diffDays / 30.4).toFixed(1)));
    const monthlyRequired = Math.round(remainingNeeded / monthsRemaining);
    const currentNetCashflow = Math.max(0, monthlyIncome - monthlyExpense);

    const systemPrompt = `Anda adalah NovaJournal Chief Financial Planner & Konsultan Target Keuangan.
Tugas Anda: Analisis kelayakan finansial dari target/wishlist tabungan pengguna berdasarkan arus kas aktual.
Berikan Feasibility Score (0-100), diagnosis kelayakan objektif, dan opsi solusi penyesuaian konkret dalam bahasa Indonesia.

Kembalikan HANYA format JSON valid tanpa tag markdown:
{
  "feasibilityScore": 85,
  "status": "Sangat Realistis" | "Cukup Realistis" | "Perlu Penyesuaian" | "Sangat Berat / Risiko Defisit",
  "summary": "Ringkasan analisis kelayakan 2 kalimat lugas dan tajam",
  "remainingNeeded": ${remainingNeeded},
  "monthsRemaining": ${monthsRemaining},
  "monthlyRequired": ${monthlyRequired},
  "currentNetCashflow": ${currentNetCashflow},
  "gap": ${monthlyRequired - currentNetCashflow},
  "suggestedTargetDate": "YYYY-MM-DD (tanggal rekomendasi jika durasi perlu disesuaikan)",
  "alternativeOptions": [
    {
      "title": "Opsi Perpanjang Waktu (Timeline)",
      "description": "Saran penyesuaian bulan deadline agar pas dengan sisa uang"
    },
    {
      "title": "Opsi Efisiensi Anggaran (Budgeting)",
      "description": "Saran penghematan konkret untuk menutup kekurangan"
    },
    {
      "title": "Perlindungan Dana Darurat",
      "description": "Evaluasi risiko terhadap likuiditas kas"
    }
  ]
}`;

    const userPrompt = `Parameter Target Finansial:
- Judul Target: "${goalTitle}"
- Kategori: ${category}
- Target Nominal: Rp ${targetAmount.toLocaleString("id-ID")}
- Dana Awal / Terkumpul: Rp ${currentAmount.toLocaleString("id-ID")}
- Sisa Kebutuhan: Rp ${remainingNeeded.toLocaleString("id-ID")}
- Target Deadline: ${targetDate} (Sekitar ${monthsRemaining} bulan lagi)
- Kebutuhan Menabung: Rp ${monthlyRequired.toLocaleString("id-ID")} / bulan

Data Arus Kas Riil Pengguna:
- Workspace: ${workspaceName} (${currency})
- Pemasukan Bulanan: Rp ${monthlyIncome.toLocaleString("id-ID")}
- Pengeluaran Bulanan: Rp ${monthlyExpense.toLocaleString("id-ID")}
- Surplus Kas Bersih (Net Cashflow): Rp ${currentNetCashflow.toLocaleString("id-ID")} / bulan
- Total Saldo Likuid Tersedia: Rp ${totalBalance.toLocaleString("id-ID")}

Berikan analisis kelayakan target finansial secara presisi dan realistis.`;

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
      console.warn("Multi-provider AI goal feasibility failed, using local calculation:", aiErr.message);
    }

    // Local Heuristic calculation
    const localResult = calculateLocalFeasibility(body);
    return NextResponse.json({
      success: true,
      data: localResult,
    });
  } catch (error: any) {
    console.error("Goal Feasibility API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menganalisis kelayakan target." },
      { status: 500 }
    );
  }
}
