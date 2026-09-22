import { NextResponse } from "next/server";

interface AnalysisInput {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  spendingCategories: Array<{ name: string; value: number; percentage: string }>;
  currency?: string;
  runwayMonths?: number;
}

function generateFallbackAnalysis({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  spendingCategories,
  currency = "IDR",
}: AnalysisInput) {
  const isHealthy = savingsRate >= 20;
  const isDeficit = monthlyExpense > monthlyIncome && monthlyIncome > 0;
  const topCategory = spendingCategories[0]?.name || "operasional umum";
  const monthlyBurn = monthlyExpense > monthlyIncome ? monthlyExpense - monthlyIncome : monthlyExpense;
  const calculatedRunway = monthlyBurn > 0 ? (totalBalance / monthlyBurn).toFixed(1) : "12+";

  let healthScore = 75;
  let status: "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis" = "Cukup Baik";

  if (isDeficit) {
    healthScore = 45;
    status = "Perlu Perhatian";
  } else if (savingsRate >= 30) {
    healthScore = 92;
    status = "Sehat";
  } else if (savingsRate >= 15) {
    healthScore = 82;
    status = "Sehat";
  }

  return {
    summary: isDeficit
      ? `Arus kas periode ini mengalami defisit operasional karena pengeluaran melebihi pemasukan. Prioritaskan pengendalian pengeluaran pos '${topCategory}' untuk memperpanjang runway kas.`
      : isHealthy
      ? `Kondisi likuiditas sangat prima dengan tingkat laba bersih/tabungan ${savingsRate}%. Cadangan kas mencukupi estimasi runway ${calculatedRunway} bulan ke depan.`
      : `Kondisi keuangan stabil dengan margin simpanan ${savingsRate}%. Terdapat ruang efisiensi pada pos '${topCategory}' untuk mempercepat pertumbuhan aset likuid.`,
    healthScore,
    status,
    runwayMonths: calculatedRunway,
    insights: [
      {
        title: isDeficit ? "Peringatan Defisit Arus Kas" : "Efisiensi Margin Bersih",
        description: isDeficit
          ? `Pengeluaran melebihi pemasukan sebesar ${currency} ${(monthlyExpense - monthlyIncome).toLocaleString("id-ID")}. Runway kas diperkirakan ${calculatedRunway} bulan jika pola ini berlanjut.`
          : `Entitas berhasil mengamankan ${savingsRate}% dari total omzet/pemasukan sebagai free cashflow likuid.`,
        type: isDeficit ? "warning" : "positive",
      },
      {
        title: "Pos Pengeluaran Terbesar",
        description: `Pos '${topCategory}' menyerap porsi pengeluaran paling dominan. Monitor pagu anggaran berkala agar tidak melampaui batas wajar.`,
        type: "info",
      },
      {
        title: "Kapasitas Runway Likuid",
        description: `Dengan saldo kas ${currency} ${totalBalance.toLocaleString("id-ID")}, estimasi ketahanan operasional berada di kisaran ${calculatedRunway} bulan.`,
        type: "info",
      },
    ],
    recommendations: [
      isDeficit
        ? "Segera bekukan pengeluaran non-primer hingga rasio arus kas kembali positif."
        : "Alokasikan 20-30% dari laba bersih ke instrumen pasar uang atau cadangan ekspansi usaha.",
      `Kendalikan realisasi pengeluaran pada pos '${topCategory}' dengan pagu maksimal 80% dari bulan sebelumnya.`,
      "Pertahankan cadangan likuiditas minimum setara 3 sampai 6 bulan beban operasional tetap.",
    ],
    savingsPotential: `Peluang penghematan 10-18% pada pos '${topCategory}' melalui negosiasi ulang atau pembatasan belanja berkala.`,
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
      userQuestion = "",
    } = body;

    const monthlyBurn = monthlyExpense > monthlyIncome ? monthlyExpense - monthlyIncome : monthlyExpense;
    const runwayMonths = monthlyBurn > 0 ? (totalBalance / monthlyBurn).toFixed(1) : "12+";

    const apiKey =
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      "";

    // Fallback if no API key configured
    if (!apiKey) {
      if (userQuestion) {
        return NextResponse.json({
          answer: `Berdasarkan data keuangan ${workspaceName}, total pemasukan saat ini adalah ${currency} ${monthlyIncome.toLocaleString("id-ID")}, total pengeluaran ${currency} ${monthlyExpense.toLocaleString("id-ID")}, dengan saldo likuid ${currency} ${totalBalance.toLocaleString("id-ID")}. Runway kas Anda berkisar ${runwayMonths} bulan. ${
            monthlyExpense > monthlyIncome
              ? "Disarankan untuk memangkas biaya non-esensial sesegera mungkin."
              : "Arus kas Anda dalam posisi sehat, prioritaskan akumulasi aset cadangan."
          }`,
          keyMetricsSummary: `Kas: ${currency} ${totalBalance.toLocaleString("id-ID")} | Margin: ${savingsRate}% | Runway: ${runwayMonths} Bln`,
          recommendations: [
            "Optimalkan pos pengeluaran terbesar",
            "Jaga rasio cadangan kas minimal 3 bulan operasional",
          ],
        });
      }

      return NextResponse.json(
        generateFallbackAnalysis({
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories,
          currency,
        })
      );
    }

    // Interactive Question Mode vs Executive Conclusion Mode
    let prompt = "";
    if (userQuestion) {
      prompt = `Anda adalah CFO & Financial Advisor AI untuk ${workspaceName}.
Jawablah pertanyaan pengguna berikut secara spesifik, lugas, profesional, dan berbasis data keuangan real-time berikut:

DATA ENTITAS:
- Entitas: ${workspaceName} (${currency})
- Saldo Kas Tersedia: ${currency} ${totalBalance.toLocaleString("id-ID")}
- Pemasukan Periode Ini: ${currency} ${monthlyIncome.toLocaleString("id-ID")}
- Pengeluaran Periode Ini: ${currency} ${monthlyExpense.toLocaleString("id-ID")}
- Net Cashflow / Laba Bersih: ${currency} ${(monthlyIncome - monthlyExpense).toLocaleString("id-ID")}
- Savings / Profit Margin: ${savingsRate}%
- Estimasi Runway: ${runwayMonths} bulan
- Kategori Pengeluaran: ${JSON.stringify(spendingCategories.slice(0, 6))}
- Rekening / Vaults: ${JSON.stringify(accounts.slice(0, 5))}

PERTANYAAN PENGGUNA:
"${userQuestion}"

FORMAT RESPONSE (Wajib JSON murni tanpa markdown triple-backticks):
{
  "answer": "Jawaban komprehensif, berbasis angka, taktis, dan mudah dipahami dalam 2-4 paragraf.",
  "keyMetricsSummary": "Ringkasan metrik relevan (contoh: Kas: Rp X | Burn Rate: Rp Y | Runway: Z bln)",
  "recommendations": [
    "Saran taktis konkret 1",
    "Saran taktis konkret 2",
    "Saran taktis konkret 3"
  ]
}`;
    } else {
      prompt = `Anda adalah CFO Eksekutif & AI Financial Analyst untuk entitas ${workspaceName}.
Analisis metrik keuangan berikut secara mendalam, objektif, dan berikan diagnosis eksekutif:

DATA KEUANGAN:
- Entitas: ${workspaceName} (${currency})
- Saldo Kas Likuid: ${currency} ${totalBalance.toLocaleString("id-ID")}
- Total Inflow (Pemasukan): ${currency} ${monthlyIncome.toLocaleString("id-ID")}
- Total Outflow (Pengeluaran): ${currency} ${monthlyExpense.toLocaleString("id-ID")}
- Laba Bersih Operasional: ${currency} ${(monthlyIncome - monthlyExpense).toLocaleString("id-ID")}
- Margin Tabungan/Laba (Savings Rate): ${savingsRate}%
- Total Transaksi: ${transactionCount}
- Kategori Pengeluaran Teratas: ${JSON.stringify(spendingCategories.slice(0, 6))}
- Dompet / Akun Terhubung: ${JSON.stringify(accounts.slice(0, 5))}

Berikan analisis dalam format JSON murni:
{
  "summary": "Kesimpulan diagnosis keuangan tajam dan berbobot (maksimal 2-3 kalimat)",
  "healthScore": 88,
  "status": "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis",
  "runwayMonths": "${runwayMonths}",
  "insights": [
    {
      "title": "Judul Analisis 1",
      "description": "Penjelasan mendalam mengenai rasio arus kas atau efisiensi pengeluaran",
      "type": "positive" | "warning" | "info"
    },
    {
      "title": "Judul Analisis 2",
      "description": "Evaluasi pos pengeluaran terbesar dan dampaknya pada modal kerja",
      "type": "positive" | "warning" | "info"
    },
    {
      "title": "Ketahanan Runway Kas",
      "description": "Uraian ketahanan kas operasional dan proyeksi likuiditas",
      "type": "info"
    }
  ],
  "recommendations": [
    "Rekomendasi strategis aksi terukur 1",
    "Rekomendasi strategis aksi terukur 2",
    "Rekomendasi strategis aksi terukur 3"
  ],
  "savingsPotential": "Peluang penghematan terukur pada pos terbesar"
}
HANYA kembalikan JSON valid tanpa tag format markdown.`;
    }

    // Call Google Gemini API with fallback models & timeout
    const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let parsedData: any = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(9500),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.25,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            parsedData = JSON.parse(cleaned);
            break;
          }
        }
      } catch (err) {
        console.warn(`[AI Analytics] Model ${model} call error:`, err);
      }
    }

    if (parsedData) {
      return NextResponse.json(parsedData);
    }

    // Graceful fallback if all models fail
    if (userQuestion) {
      return NextResponse.json({
        answer: `Berdasarkan data keuangan ${workspaceName}, posisi saldo kas saat ini adalah ${currency} ${totalBalance.toLocaleString("id-ID")} dengan margin laba ${savingsRate}%. Estimasi ketahanan kas (runway) adalah ${runwayMonths} bulan. Tetap monitor pengeluaran rutin untuk menjaga kestabilan likuiditas.`,
        keyMetricsSummary: `Kas: ${currency} ${totalBalance.toLocaleString("id-ID")} | Margin: ${savingsRate}% | Runway: ${runwayMonths} Bln`,
        recommendations: [
          "Pantau realisasi anggaran setiap minggu",
          "Kendalikan pengeluaran operasional non-esensial",
        ],
      });
    }

    return NextResponse.json(
      generateFallbackAnalysis({
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        savingsRate,
        spendingCategories,
        currency,
      })
    );
  } catch (error) {
    console.error("AI Analytics Suggestion Route Error:", error);
    return NextResponse.json({
      summary: "Arus kas Anda saat ini stabil. Lanjutkan pencatatan teratur untuk mempertahankan stabilitas anggaran.",
      healthScore: 80,
      status: "Cukup Baik",
      runwayMonths: "6+",
      insights: [
        {
          title: "Konsistensi Pencatatan",
          description: "Pencatatan yang konsisten menjaga transparansi arus kas operasional.",
          type: "info",
        },
      ],
      recommendations: [
        "Evaluasi pengeluaran setiap akhir pekan untuk mencegah pembengkakan saldo.",
        "Sisihkan minimal 15% dari pemasukan ke rekening dana cadangan.",
      ],
      savingsPotential: "Potensi penghematan 10-15% dengan evaluasi pengeluaran berkala.",
    });
  }
}
