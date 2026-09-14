import { NextResponse } from "next/server";

interface AnalysisInput {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  spendingCategories: Array<{ name: string; value: number; percentage: string }>;
}

function generateFallbackAnalysis({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  spendingCategories,
}: AnalysisInput) {
  const isHealthy = savingsRate >= 20;
  const isDeficit = monthlyExpense > monthlyIncome && monthlyIncome > 0;
  const topCategory = spendingCategories[0]?.name || "kebutuhan harian";

  let healthScore = 70;
  let status: "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis" = "Cukup Baik";

  if (isDeficit) {
    healthScore = 45;
    status = "Perlu Perhatian";
  } else if (savingsRate >= 30) {
    healthScore = 90;
    status = "Sehat";
  } else if (savingsRate >= 15) {
    healthScore = 80;
    status = "Sehat";
  }

  return {
    summary: isDeficit
      ? `Arus kas bulan ini mengalami defisit karena pengeluaran melebihi pemasukan. Prioritaskan pengendalian pengeluaran pada pos ${topCategory}.`
      : isHealthy
      ? `Kondisi arus kas Anda terkelola dengan baik dengan tingkat tabungan ${savingsRate}%. Pertahankan konsistensi ini untuk memperkuat fondasi keuangan.`
      : `Arus kas stabil dengan tingkat tabungan ${savingsRate}%. Terdapat ruang optimasi terutama pada efisiensi pengeluaran ${topCategory}.`,
    healthScore,
    status,
    insights: [
      {
        title: isDeficit ? "Peringatan Arus Kas" : "Tingkat Tabungan",
        description: isDeficit
          ? `Pengeluaran bulan ini melampaui pemasukan sebesar Rp ${(monthlyExpense - monthlyIncome).toLocaleString("id-ID")}.`
          : `Anda berhasil menyisihkan ${savingsRate}% dari pemasukan bulan ini ke pos tabungan/aset.`,
        type: isDeficit ? "warning" : "positive",
      },
      {
        title: "Fokus Pengeluaran Utama",
        description: `Pos '${topCategory}' merupakan kontributor pengeluaran terbesar. Evaluasi pos ini untuk efisiensi lebih lanjut.`,
        type: "info",
      },
    ],
    recommendations: [
      isDeficit
        ? "Tunda pengeluaran non-esensial hingga arus kas kembali surplus."
        : "Sisihkan surplus bulanan ke rekening tabungan terpisah atau instrumen rendah risiko.",
      `Tetapkan batas pagu maksimal untuk kategori ${topCategory} sebesar 85% dari alokasi saat ini.`,
      `Pastikan total saldo likuid (Rp ${totalBalance.toLocaleString("id-ID")}) mencukupi kebutuhan operasional minimal 3-6 bulan.`,
    ],
    savingsPotential: "Potensi penghematan 10-15% dengan pembatasan belanja impulsif",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      workspaceName = "Workspace",
      currency = "IDR",
      totalBalance = 0,
      monthlyIncome = 0,
      monthlyExpense = 0,
      savingsRate = 0,
      spendingCategories = [],
      accounts = [],
      transactionCount = 0,
    } = body;

    const apiKey =
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        generateFallbackAnalysis({
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories,
        })
      );
    }

    const prompt = `Anda adalah NovaJournal AI Financial Advisor profesional. Analisis data finansial pengguna berikut secara analitis dan berikan kesimpulan tajam serta rekomendasi konkret:
- Nama Workspace: ${workspaceName}
- Mata Uang: ${currency}
- Total Saldo Riil: ${totalBalance}
- Pemasukan Bulan Ini: ${monthlyIncome}
- Pengeluaran Bulan Ini: ${monthlyExpense}
- Rasio Tabungan (Savings Rate): ${savingsRate}%
- Total Transaksi Bulan Ini: ${transactionCount}
- Kategori Pengeluaran Teratas: ${JSON.stringify(spendingCategories.slice(0, 5))}
- Akun/Dompet Terhubung: ${JSON.stringify(accounts.slice(0, 5))}

Berikan analisis dalam format JSON murni:
{
  "summary": "Kesimpulan diagnosis keuangan ringkas dan berbobot (maksimal 2-3 kalimat)",
  "healthScore": 85,
  "status": "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis",
  "insights": [
    {
      "title": "Judul Insight 1",
      "description": "Penjelasan mendalam mengenai data pengeluaran/pemasukan",
      "type": "positive" | "warning" | "info"
    },
    {
      "title": "Judul Insight 2",
      "description": "Penjelasan mendalam mengenai data",
      "type": "positive" | "warning" | "info"
    }
  ],
  "recommendations": [
    "Saran aksi terukur 1",
    "Saran aksi terukur 2",
    "Saran aksi terukur 3"
  ],
  "savingsPotential": "Estimasi peluang efisiensi biaya atau akumulasi aset"
}
HANYA kembalikan JSON valid tanpa tag format markdown.`;

    // Attempt call with gemini-3.6-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API call returned status:", response.status);
      return NextResponse.json(
        generateFallbackAnalysis({
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories,
        })
      );
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        generateFallbackAnalysis({
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories,
        })
      );
    }

    try {
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(
        generateFallbackAnalysis({
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories,
        })
      );
    }
  } catch (error) {
    console.error("AI Suggestion Route Error:", error);
    return NextResponse.json({
      summary: "Arus kas Anda saat ini stabil. Lanjutkan pencatatan teratur untuk mempertahankan stabilitas anggaran.",
      healthScore: 75,
      status: "Cukup Baik",
      insights: [
        {
          title: "Konsistensi Pencatatan",
          description: "Pencatatan yang konsisten membantu menjaga visibilitas pengeluaran bulanan.",
          type: "info",
        },
      ],
      recommendations: [
        "Evaluasi pengeluaran setiap akhir pekan untuk mencegah pembengkakan saldo.",
        "Sisihkan minimal 15% dari pemasukan ke rekening dana darurat.",
      ],
      savingsPotential: "Potensi penghematan 10% dengan monitoring mingguan",
    });
  }
}
