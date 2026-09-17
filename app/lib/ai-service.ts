/* eslint-disable @typescript-eslint/no-explicit-any */

export type AiProvider = "auto" | "groq" | "gemini" | "deepseek" | "claude" | "openai";

export interface MultiAiRequest {
  systemPrompt: string;
  userPrompt: string;
  userApiKey?: string;
  userProvider?: AiProvider;
  temperature?: number;
}

export interface MultiAiResponse {
  success: boolean;
  content: string;
  provider: string;
  model: string;
  parsedJson?: any;
}

// Helper: detect provider from API Key format
export function detectProviderFromKey(key: string): AiProvider {
  if (!key) return "auto";
  const trimmed = key.trim();
  if (trimmed.startsWith("gsk_")) return "groq";
  if (trimmed.startsWith("AIzaSy")) return "gemini";
  if (trimmed.startsWith("sk-ant-")) return "claude";
  if (trimmed.startsWith("sk-")) return "deepseek"; // or openai
  return "auto";
}

// 1. Groq Call (Llama 3.3 70B - Ultra fast)
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<MultiAiResponse> {
  const model = "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(content);
  } catch {}

  return {
    success: true,
    content,
    provider: "Groq",
    model,
    parsedJson,
  };
}

// 2. Google Gemini Call (Gemini 2.0 Flash)
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<MultiAiResponse> {
  const model = "gemini-2.0-flash";
  const combinedText = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(content);
  } catch {}

  return {
    success: true,
    content,
    provider: "Google Gemini",
    model,
    parsedJson,
  };
}

// 3. DeepSeek Call (DeepSeek V3 Chat)
async function callDeepSeek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<MultiAiResponse> {
  const model = "deepseek-chat";
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(content);
  } catch {}

  return {
    success: true,
    content,
    provider: "DeepSeek",
    model,
    parsedJson,
  };
}

// 4. Anthropic Claude Call (Claude 3.5 Haiku)
async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<MultiAiResponse> {
  const model = "claude-3-5-haiku-20241022";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: `${systemPrompt}\nReturn pure JSON only without any markdown formatting or commentary.`,
      messages: [{ role: "user", content: userPrompt }],
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawContent = data?.content?.[0]?.text || "";
  // Strip possible ```json ``` markers
  const cleanContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  let parsedJson = null;
  try {
    parsedJson = JSON.parse(cleanContent);
  } catch {}

  return {
    success: true,
    content: cleanContent,
    provider: "Anthropic Claude",
    model,
    parsedJson,
  };
}

// Master Dispatcher with Automatic Multi-Provider Fallback Cascade
export async function executeMultiProviderAi(
  req: MultiAiRequest
): Promise<MultiAiResponse> {
  const { systemPrompt, userPrompt, userApiKey, userProvider = "auto", temperature = 0.2 } = req;

  // 1. Gather all potential API keys
  const groqKey =
    (userApiKey && userApiKey.startsWith("gsk_") ? userApiKey : "") ||
    process.env.GROQ_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    "";

  const geminiKey =
    (userApiKey && userApiKey.startsWith("AIzaSy") ? userApiKey : "") ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    "";

  const deepseekKey =
    (userApiKey && userProvider === "deepseek" ? userApiKey : "") ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
    "";

  const claudeKey =
    (userApiKey && userApiKey.startsWith("sk-ant-") ? userApiKey : "") ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    "";

  // Determine priority order
  const detected = detectProviderFromKey(userApiKey || "");
  const targetProvider = userProvider !== "auto" ? userProvider : detected;

  const attemptQueue: Array<{ name: string; fn: () => Promise<MultiAiResponse> }> = [];

  // If user provided a specific key, push that provider to front of queue
  if (targetProvider === "groq" && (userApiKey || groqKey)) {
    attemptQueue.push({ name: "Groq", fn: () => callGroq(userApiKey || groqKey, systemPrompt, userPrompt, temperature) });
  } else if (targetProvider === "gemini" && (userApiKey || geminiKey)) {
    attemptQueue.push({ name: "Gemini", fn: () => callGemini(userApiKey || geminiKey, systemPrompt, userPrompt, temperature) });
  } else if (targetProvider === "deepseek" && (userApiKey || deepseekKey)) {
    attemptQueue.push({ name: "DeepSeek", fn: () => callDeepSeek(userApiKey || deepseekKey, systemPrompt, userPrompt, temperature) });
  } else if (targetProvider === "claude" && (userApiKey || claudeKey)) {
    attemptQueue.push({ name: "Claude", fn: () => callClaude(userApiKey || claudeKey, systemPrompt, userPrompt, temperature) });
  }

  // Fallback cascades in order of speed and cost
  if (groqKey && targetProvider !== "groq") {
    attemptQueue.push({ name: "Groq", fn: () => callGroq(groqKey, systemPrompt, userPrompt, temperature) });
  }
  if (geminiKey && geminiKey.startsWith("AIzaSy") && targetProvider !== "gemini") {
    attemptQueue.push({ name: "Gemini", fn: () => callGemini(geminiKey, systemPrompt, userPrompt, temperature) });
  }
  if (deepseekKey && targetProvider !== "deepseek") {
    attemptQueue.push({ name: "DeepSeek", fn: () => callDeepSeek(deepseekKey, systemPrompt, userPrompt, temperature) });
  }
  if (claudeKey && targetProvider !== "claude") {
    attemptQueue.push({ name: "Claude", fn: () => callClaude(claudeKey, systemPrompt, userPrompt, temperature) });
  }

  // Execute queue sequentially until one succeeds
  const errors: string[] = [];
  for (const attempt of attemptQueue) {
    try {
      const res = await attempt.fn();
      if (res.parsedJson) {
        return res;
      }
    } catch (err: any) {
      console.warn(`[Multi-AI] Provider ${attempt.name} failed:`, err.message);
      errors.push(`${attempt.name}: ${err.message}`);
    }
  }

  throw new Error(
    `Semua provider AI tidak dapat diakses (${errors.join("; ") || "Tidak ada API key terdaftar"}).`
  );
}
