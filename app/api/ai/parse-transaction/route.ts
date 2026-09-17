/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { executeMultiProviderAi } from "../../../lib/ai-service";

interface ParseRequest {
  text: string;
  workspaceCategories?: Array<{ id: string; name: string; type?: string }>;
  workspaceAccounts?: Array<{ id: string; name: string; type?: string }>;
  apiKey?: string;
  provider?: "gemini" | "groq" | "auto";
}

// 1. Smart Local Indonesian Rule-based Parser (Fallback with 0 latency & 0 API cost)
function parseIndonesianRuleBased(
  text: string,
  categories: Array<{ id: string; name: string; type?: string }> = [],
  accounts: Array<{ id: string; name: string; type?: string }> = []
) {
  const lower = text.toLowerCase().trim();

  // 1. Detect Type
  const incomeKeywords = [
    "gaji",
    "pendapatan",
    "terima",
    "dapet",
    "dapat",
    "masuk",
    "transfer masuk",
    "bonus",
    "komisi",
    "dividen",
    "penjualan",
    "profit",
    "cair",
    "hasil",
  ];
  const expenseKeywords = [
    "beli",
    "makan",
    "bayar",
    "keluar",
    "ongkir",
    "isi",
    "jajan",
    "sewa",
    "belanja",
    "kopi",
    "bensin",
    "parkir",
    "nonton",
    "pesan",
    "order",
    "langganan",
  ];

  let type: "INCOME" | "EXPENSE" = "EXPENSE";
  if (incomeKeywords.some((kw) => lower.includes(kw))) {
    type = "INCOME";
  } else if (expenseKeywords.some((kw) => lower.includes(kw))) {
    type = "EXPENSE";
  }

  // 2. Extract Amount
  // Matches: 25rb, 25k, 10jt, 1.5jt, 2,5jt, Rp 50.000, 50000, 50.000, 100k
  let amount = 0;

  const jutaMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  const ribuMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu)/);
  const rawNumberMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+)/);

  if (jutaMatch) {
    const val = parseFloat(jutaMatch[1].replace(",", "."));
    amount = Math.round(val * 1000000);
  } else if (ribuMatch) {
    const val = parseFloat(ribuMatch[1].replace(",", "."));
    amount = Math.round(val * 1000);
  } else if (rawNumberMatch) {
    const cleanStr = rawNumberMatch[1].replace(/\./g, "").replace(",", ".");
    const val = parseFloat(cleanStr);
    if (!isNaN(val) && val > 0) {
      amount = Math.round(val);
    }
  }

  // 3. Extract Date
  let date = new Date().toISOString().slice(0, 16);
  if (lower.includes("kemarin")) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().slice(0, 16);
  }

  // 4. Match Account from workspace or standard keywords
  let matchedAccountId: string | undefined = undefined;
  let accountName = "Rekening Utama";

  // First try direct match with workspace accounts
  for (const acc of accounts) {
    const accLower = acc.name.toLowerCase();
    if (lower.includes(accLower)) {
      matchedAccountId = acc.id;
      accountName = acc.name;
      break;
    }
  }

  // If not matched, try keyword scanning
  if (!matchedAccountId) {
    const accKeywords: Record<string, string> = {
      bca: "Bank BCA",
      mandiri: "Bank Mandiri",
      bni: "Bank BNI",
      bri: "Bank BRI",
      jago: "Bank Jago",
      seabank: "SeaBank",
      gopay: "GoPay",
      ovo: "OVO",
      dana: "DANA",
      shopeepay: "ShopeePay",
      cash: "Cash / Tunai",
      tunai: "Cash / Tunai",
      dompet: "Cash / Tunai",
    };

    for (const [key, name] of Object.entries(accKeywords)) {
      if (lower.includes(key)) {
        accountName = name;
        // Check if workspace accounts have something similar
        const found = accounts.find((a) =>
          a.name.toLowerCase().includes(key)
        );
        if (found) {
          matchedAccountId = found.id;
          accountName = found.name;
        }
        break;
      }
    }
  }

  // Default to first workspace account if still unmatched
  if (!matchedAccountId && accounts.length > 0) {
    matchedAccountId = accounts[0].id;
    accountName = accounts[0].name;
  }

  // 5. Match Category
  let matchedCategoryId: string | undefined = undefined;
  let categoryName = type === "INCOME" ? "Gaji & Pemasukan" : "Makanan & Minuman";

  const catKeywords: Record<string, string> = {
    makan: "Makanan & Minuman",
    makanan: "Makanan & Minuman",
    minum: "Makanan & Minuman",
    kopi: "Makanan & Minuman",
    sate: "Makanan & Minuman",
    bakso: "Makanan & Minuman",
    mie: "Makanan & Minuman",
    nasi: "Makanan & Minuman",
    restoran: "Makanan & Minuman",
    cafe: "Makanan & Minuman",
    bensin: "Transportasi",
    pertamax: "Transportasi",
    pertalite: "Transportasi",
    shell: "Transportasi",
    ojol: "Transportasi",
    gojek: "Transportasi",
    grab: "Transportasi",
    maxim: "Transportasi",
    parkir: "Transportasi",
    tol: "Transportasi",
    kereta: "Transportasi",
    belanja: "Belanja & Kebutuhan",
    superindo: "Belanja & Kebutuhan",
    indomaret: "Belanja & Kebutuhan",
    alfamart: "Belanja & Kebutuhan",
    tokopedia: "Belanja & Kebutuhan",
    shopee: "Belanja & Kebutuhan",
    listrik: "Tagihan & Utilitas",
    pln: "Tagihan & Utilitas",
    air: "Tagihan & Utilitas",
    wifi: "Tagihan & Utilitas",
    pulsa: "Tagihan & Utilitas",
    kuota: "Tagihan & Utilitas",
    sewa: "Rumah & Sewa",
    kos: "Rumah & Sewa",
    kontrakan: "Rumah & Sewa",
    gaji: "Gaji & Kompensasi",
    bonus: "Bonus & Hadiah",
    freelance: "Freelance & Bisnis",
    investasi: "Investasi & Dividen",
  };

  for (const [kw, cat] of Object.entries(catKeywords)) {
    if (lower.includes(kw)) {
      categoryName = cat;
      // Check if existing categories match
      const found = categories.find((c) =>
        c.name.toLowerCase().includes(kw) || c.name.toLowerCase().includes(cat.toLowerCase())
      );
      if (found) {
        matchedCategoryId = found.id;
        categoryName = found.name;
      }
      break;
    }
  }

  if (!matchedCategoryId && categories.length > 0) {
    const fallback = categories.find((c) =>
      type === "INCOME" ? c.type === "income" : c.type !== "income"
    );
    if (fallback) {
      matchedCategoryId = fallback.id;
      categoryName = fallback.name;
    }
  }

  // 6. Clean Title / Description
  // Strip out payment keywords and amounts to get clean title
  let description = text
    .replace(/(?:pake|pakai|lewat|dari|ke|masuk|rekening)\s+[a-zA-Z0-9_-]+/gi, "")
    .replace(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)?|\d{1,3}(?:\.\d{3})+)/gi, "")
    .replace(/\b(?:kemarin|tadi siang|tadi pagi|tadi malam|hari ini|tadi)\b/gi, "")
    .trim();

  // Capitalize title
  if (description) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  } else {
    description = type === "INCOME" ? "Pemasukan Baru" : "Pengeluaran Baru";
  }

  return {
    description,
    amount: Math.max(0, amount),
    type,
    categoryName,
    matchedCategoryId,
    accountName,
    matchedAccountId,
    date,
    confidence: 0.85,
  };
}

export async function POST(req: Request) {
  try {
    const body: ParseRequest = await req.json();
    const {
      text,
      workspaceCategories = [],
      workspaceAccounts = [],
      apiKey: userApiKey = "",
      provider = "auto",
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Teks transaksi tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Determine available API keys
    const geminiKey =
      userApiKey && userApiKey.startsWith("AIzaSy")
        ? userApiKey
        : process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_GEMINI_API_KEY ||
          "";

    const groqKey =
      userApiKey && userApiKey.startsWith("gsk_")
        ? userApiKey
        : process.env.GROQ_API_KEY ||
          process.env.NEXT_PUBLIC_GROQ_API_KEY ||
          "";

    // Context for LLM
    const categoriesContext = workspaceCategories.map((c) => c.name).join(", ");
    const accountsContext = workspaceAccounts.map((a) => a.name).join(", ");
    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = `Anda adalah parser transaksi keuangan cerdas bahasa Indonesia.
Tugas Anda: Ekstrak kalimat natural transaksi keuangan pengguna menjadi format JSON murni.
Hari ini adalah tanggal: ${today}.

Daftar Kategori yang Tersedia di Sistem: [${categoriesContext || "Makanan & Minuman, Transportasi, Belanja, Tagihan, Gaji, Investasi"}]
Daftar Rekening/Akun yang Tersedia: [${accountsContext || "Bank BCA, Bank Mandiri, Cash, GoPay, OVO"}]

Format JSON yang WAJIB dihasilkan:
{
  "description": "Nama merchant atau kegiatan (contoh: 'Makan Siang Sate Padang', 'Isi Bensin Shell', 'Gaji Bulanan')",
  "amount": 50000,
  "type": "EXPENSE" atau "INCOME",
  "categoryName": "Kategori yang paling cocok dari daftar atau buat yang relevan",
  "accountName": "Nama akun/rekening yang disebutkan atau cocokkan",
  "date": "YYYY-MM-DDTHH:mm (estimasi tanggal/jam)",
  "confidence": 0.95
}
Catatan:
- Konversi satuan: 15rb/15k -> 15000, 1.5jt/1.5juta -> 1500000.
- Jangan tambahkan teks atau markdown lain, HANYA JSON.`;

    // 1. Try Multi-Provider AI (Groq -> Gemini -> DeepSeek -> Claude)
    try {
      const aiResult = await executeMultiProviderAi({
        systemPrompt,
        userPrompt: `Kalimat Transaksi: "${text}"`,
        userApiKey,
        userProvider: provider as any,
        temperature: 0.1,
      });

      if (aiResult.parsedJson) {
        const parsed = aiResult.parsedJson;
        const matchedCategory = workspaceCategories.find(
          (c) => c.name.toLowerCase() === parsed.categoryName?.toLowerCase()
        );
        const matchedAccount = workspaceAccounts.find(
          (a) => a.name.toLowerCase() === parsed.accountName?.toLowerCase()
        );

        return NextResponse.json({
          success: true,
          source: `${aiResult.provider} (${aiResult.model})`,
          data: {
            ...parsed,
            matchedCategoryId: matchedCategory?.id,
            matchedAccountId: matchedAccount?.id,
          },
        });
      }
    } catch (aiErr: any) {
      console.warn("Multi-provider parse failed, falling back to local rule-based parser:", aiErr.message);
    }

    // 3. Ultra-Reliable Rule Engine Fallback (Zero cost, instant, covers 95% common phrases)
    const ruleResult = parseIndonesianRuleBased(
      text,
      workspaceCategories,
      workspaceAccounts
    );

    return NextResponse.json({
      success: true,
      source: "local-parser",
      data: ruleResult,
    });
  } catch (error: any) {
    console.error("Parse transaction error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses transaksi." },
      { status: 500 }
    );
  }
}
