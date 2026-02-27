export interface AIModel {
  id: string;
  name: string;
  provider: string;
  providerSlug: string;
  description: string;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  contextWindow: number; // in tokens
  maxOutput: number; // in tokens
  releaseDate: string;
  category: "flagship" | "mid" | "budget" | "reasoning" | "open-source";
  capabilities: string[];
  benchmarks: {
    mmluPro?: number;
    humanEval?: number;
    gpqa?: number;
  };
  longContextPricing?: {
    threshold: number; // tokens above which premium pricing kicks in
    inputPrice: number;
    outputPrice: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export const models: AIModel[] = [
  // ── Anthropic ──────────────────────────────────────────
  {
    id: "claude-opus-46",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Anthropic's most capable model with 1M context beta. Top-tier coding, agentic tool use, and complex reasoning.",
    inputPrice: 5,
    outputPrice: 25,
    contextWindow: 200000,
    maxOutput: 32000,
    releaseDate: "2026-02-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 89.5, humanEval: 95.0, gpqa: 75.5 },
    longContextPricing: { threshold: 200000, inputPrice: 10, outputPrice: 37.5 },
    strengths: [
      "Best-in-class agentic tool use and coding",
      "1M context available in beta (Tier 4)",
      "Strong at following complex multi-step instructions",
    ],
    weaknesses: [
      "Premium pricing ($10/$37.50 at 1M context)",
      "1M context beta is Tier 4 only",
    ],
  },
  {
    id: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Matches Opus 4.5 quality at Sonnet pricing. Best value in the Claude lineup for production use. 1M context in beta.",
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 200000,
    maxOutput: 16000,
    releaseDate: "2026-02-01",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 86.0, humanEval: 94.0, gpqa: 70.0 },
    longContextPricing: { threshold: 200000, inputPrice: 6, outputPrice: 22.5 },
    strengths: [
      "Opus 4.5 quality at 1/5th the cost",
      "Best value for production workloads",
      "1M context in beta",
    ],
    weaknesses: [
      "Long context pricing doubles above 200K",
      "Slightly below Opus 4.6 on hardest tasks",
    ],
  },
  {
    id: "claude-sonnet-45",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Previous-gen Sonnet. Still strong for most tasks at the same price as 4.6.",
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 200000,
    maxOutput: 16000,
    releaseDate: "2025-05-22",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 84.5, humanEval: 93.0, gpqa: 68.2 },
    strengths: [
      "Well-tested and stable",
      "Strong coding and analysis",
    ],
    weaknesses: [
      "Superseded by Sonnet 4.6",
      "Same price as the newer model",
    ],
  },
  {
    id: "claude-haiku-45",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Anthropic's fastest and cheapest model. Good for high-volume, latency-sensitive tasks.",
    inputPrice: 0.8,
    outputPrice: 4,
    contextWindow: 200000,
    maxOutput: 8192,
    releaseDate: "2025-10-01",
    category: "budget",
    capabilities: ["text", "vision", "tool-use", "code"],
    benchmarks: { mmluPro: 69.4, humanEval: 88.1 },
    strengths: [
      "Very fast responses",
      "Cheapest Anthropic option",
      "Good for classification and extraction",
    ],
    weaknesses: [
      "Weakest reasoning in the Claude family",
      "Can struggle with nuanced instructions",
    ],
  },

  // ── OpenAI ─────────────────────────────────────────────
  {
    id: "gpt-53-codex",
    name: "GPT-5.3 Codex",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's latest coding-focused model. Currently available in ChatGPT, API access coming soon.",
    inputPrice: 2,
    outputPrice: 16,
    contextWindow: 200000,
    maxOutput: 65536,
    releaseDate: "2026-02-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 90.0, humanEval: 96.5, gpqa: 78.0 },
    strengths: [
      "Best coding model from OpenAI",
      "Large output window (65K tokens)",
      "Strong reasoning for complex tasks",
    ],
    weaknesses: [
      "API access not yet available",
      "Premium pricing",
    ],
  },
  {
    id: "gpt-52-codex",
    name: "GPT-5.2 Codex",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's previous coding model. Strong performance at moderate pricing.",
    inputPrice: 1.75,
    outputPrice: 14,
    contextWindow: 200000,
    maxOutput: 65536,
    releaseDate: "2026-01-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 89.0, humanEval: 95.5, gpqa: 76.0 },
    strengths: [
      "Strong coding performance",
      "Available via API now",
      "200K context window",
    ],
    weaknesses: [
      "Being superseded by 5.3",
      "Higher output cost than some competitors",
    ],
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's general-purpose flagship with strong reasoning, coding, and multimodal capabilities.",
    inputPrice: 1.25,
    outputPrice: 10,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2025-12-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "audio"],
    benchmarks: { mmluPro: 88.5, humanEval: 95.0, gpqa: 73.5 },
    strengths: [
      "Strong all-around performance",
      "Good price for flagship tier",
      "Multimodal including audio",
    ],
    weaknesses: [
      "128K context vs 200K+ for newer models",
      "Codex variants better for pure coding",
    ],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's efficient multimodal workhorse. Well-established with large ecosystem.",
    inputPrice: 2.5,
    outputPrice: 10,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2024-05-13",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "audio"],
    benchmarks: { mmluPro: 80.5, humanEval: 91.0, gpqa: 64.2 },
    strengths: [
      "Well-established and reliable",
      "Large ecosystem of tools and integrations",
    ],
    weaknesses: [
      "Being superseded by GPT-5 series",
      "Higher price than newer, better alternatives",
    ],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's budget model. Near GPT-4 quality at a fraction of the cost.",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2024-07-18",
    category: "budget",
    capabilities: ["text", "vision", "tool-use", "code"],
    benchmarks: { mmluPro: 68.0, humanEval: 87.2 },
    strengths: [
      "Extremely cheap",
      "Fast responses",
      "Good enough for many production tasks",
    ],
    weaknesses: [
      "Weaker reasoning than full models",
      "Can hallucinate more on complex topics",
    ],
  },
  {
    id: "o4-mini",
    name: "o4-mini",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's efficient reasoning model. Good chain-of-thought at lower cost than o3.",
    inputPrice: 1.1,
    outputPrice: 4.4,
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: "2025-04-16",
    category: "reasoning",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 85.0, humanEval: 93.5, gpqa: 76.0 },
    strengths: [
      "Affordable reasoning model",
      "200K context window",
      "Good for math and science",
    ],
    weaknesses: [
      "Slower than non-reasoning models",
      "Reasoning tokens add to effective cost",
    ],
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's reasoning model. Recently repriced to be very competitive.",
    inputPrice: 0.4,
    outputPrice: 1.6,
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: "2025-04-16",
    category: "reasoning",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 87.0, humanEval: 94.5, gpqa: 79.2 },
    strengths: [
      "Recently repriced — now very cheap",
      "Excellent logical reasoning",
      "200K context window",
    ],
    weaknesses: [
      "Slower due to reasoning overhead",
      "Overkill for simple tasks",
    ],
  },

  // ── Google ─────────────────────────────────────────────
  {
    id: "gemini-31-pro",
    name: "Gemini 3.1 Pro",
    provider: "Google",
    providerSlug: "google",
    description:
      "Google's newest flagship. #1 on 12 of 18 benchmarks. 77.1% ARC-AGI-2, 94.3% GPQA Diamond.",
    inputPrice: 2,
    outputPrice: 12,
    contextWindow: 1000000,
    maxOutput: 64000,
    releaseDate: "2026-02-19",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "audio"],
    benchmarks: { mmluPro: 91.0, humanEval: 95.0, gpqa: 94.3 },
    longContextPricing: { threshold: 200000, inputPrice: 4, outputPrice: 18 },
    strengths: [
      "#1 on 12 of 18 tracked benchmarks",
      "94.3% GPQA Diamond — highest of any model",
      "Same price as Gemini 3 Pro (free upgrade)",
      "1M context with configurable thinking levels",
    ],
    weaknesses: [
      "Still in preview",
      "Context-tiered pricing ($4/$18 above 200K)",
    ],
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    providerSlug: "google",
    description:
      "Google's previous flagship. Still strong, same pricing as 3.1 Pro.",
    inputPrice: 2,
    outputPrice: 12,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2026-01-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "audio"],
    benchmarks: { mmluPro: 89.8, humanEval: 94.0, gpqa: 77.0 },
    longContextPricing: { threshold: 200000, inputPrice: 4, outputPrice: 18 },
    strengths: [
      "Stable and well-tested",
      "1M token context window",
      "Strong multimodal with audio",
    ],
    weaknesses: [
      "Being superseded by 3.1 Pro",
      "Context-tiered pricing ($4/$18 above 200K)",
    ],
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    providerSlug: "google",
    description:
      "Google's fast and affordable model. Great value with 1M context.",
    inputPrice: 0.5,
    outputPrice: 3,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2026-01-01",
    category: "budget",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 78.0, humanEval: 90.0 },
    strengths: [
      "1M context at budget pricing",
      "Very fast",
      "Free tier available via Google AI Studio",
    ],
    weaknesses: [
      "Less capable than Pro on complex reasoning",
      "Audio input priced separately ($1/1M)",
    ],
  },
  {
    id: "gemini-25-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    providerSlug: "google",
    description:
      "Previous-gen Google flagship. Still strong and slightly cheaper than Gemini 3 Pro.",
    inputPrice: 1.25,
    outputPrice: 10,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2025-03-25",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "audio"],
    benchmarks: { mmluPro: 87.5, humanEval: 93.5, gpqa: 76.0 },
    strengths: [
      "Competitive pricing for its capabilities",
      "1M context window",
      "Well-tested and stable",
    ],
    weaknesses: [
      "Being superseded by Gemini 3 Pro",
    ],
  },
  {
    id: "gemini-25-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    providerSlug: "google",
    description:
      "Budget-tier Google model with 1M context. Extremely affordable.",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2025-04-17",
    category: "budget",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 76.0, humanEval: 89.5 },
    strengths: [
      "One of the cheapest models available",
      "1M context at budget pricing",
      "Free tier available",
    ],
    weaknesses: [
      "Weaker than Flash 3 on most benchmarks",
      "Output quality inconsistent on edge cases",
    ],
  },

  // ── Meta (Open Source) ─────────────────────────────────
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    providerSlug: "meta",
    description:
      "Meta's flagship open-source model. 400B MoE, competitive with proprietary flagships.",
    inputPrice: 0.31,
    outputPrice: 0.85,
    contextWindow: 1000000,
    maxOutput: 32000,
    releaseDate: "2025-04-05",
    category: "open-source",
    capabilities: ["text", "vision", "code"],
    benchmarks: { mmluPro: 80.5, humanEval: 90.2 },
    strengths: [
      "Open-source and self-hostable",
      "1M context window",
      "Very competitive via API providers",
    ],
    weaknesses: [
      "Requires significant compute to self-host",
      "Fewer tool-use capabilities than proprietary models",
    ],
  },
  {
    id: "llama-4-scout",
    name: "Llama 4 Scout",
    provider: "Meta",
    providerSlug: "meta",
    description:
      "Industry-leading 10M token context window. Open-source and ultra cheap via providers.",
    inputPrice: 0.18,
    outputPrice: 0.63,
    contextWindow: 10000000,
    maxOutput: 32000,
    releaseDate: "2025-04-05",
    category: "open-source",
    capabilities: ["text", "vision", "code"],
    benchmarks: { mmluPro: 74.2, humanEval: 86.0 },
    strengths: [
      "10M token context — largest available",
      "Open-source",
      "Ultra cheap via API providers",
    ],
    weaknesses: [
      "Lower benchmarks than Maverick",
      "Limited tool-use support",
    ],
  },

  // ── DeepSeek ───────────────────────────────────────────
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    providerSlug: "deepseek",
    description:
      "Ultra-affordable open-source model competitive with GPT-4o at a fraction of the cost.",
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 164000,
    maxOutput: 16384,
    releaseDate: "2025-03-01",
    category: "open-source",
    capabilities: ["text", "code", "reasoning"],
    benchmarks: { mmluPro: 78.0, humanEval: 89.0 },
    strengths: [
      "Cheapest capable model available",
      "Strong coding performance",
      "Open-source",
    ],
    weaknesses: [
      "No vision support",
      "Smaller context than competitors",
      "China-based — availability concerns",
    ],
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    providerSlug: "deepseek",
    description:
      "DeepSeek's reasoning model. Chain-of-thought at rock-bottom pricing.",
    inputPrice: 0.55,
    outputPrice: 2.19,
    contextWindow: 128000,
    maxOutput: 64000,
    releaseDate: "2025-01-20",
    category: "reasoning",
    capabilities: ["text", "code", "reasoning"],
    benchmarks: { mmluPro: 84.0, humanEval: 92.0, gpqa: 71.5 },
    strengths: [
      "Cheapest reasoning model available",
      "Strong math and science performance",
      "Open-source with off-peak discounts",
    ],
    weaknesses: [
      "Slower than non-reasoning models",
      "No vision or tool-use",
      "China-based — availability concerns",
    ],
  },

  // ── xAI ────────────────────────────────────────────────
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "xAI",
    providerSlug: "xai",
    description:
      "xAI's flagship with built-in web search and real-time information access.",
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2025-07-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "web-search"],
    benchmarks: { mmluPro: 86.0, humanEval: 93.0, gpqa: 72.0 },
    strengths: [
      "Built-in web search and real-time data",
      "Strong reasoning",
      "$25 free credits for new users",
    ],
    weaknesses: [
      "Premium pricing for its benchmark tier",
      "Additional charges for tool invocations ($2.50-$5/1K calls)",
      "Smaller ecosystem than OpenAI/Anthropic",
    ],
  },

  // ── Zhipu AI (GLM) ────────────────────────────────────
  {
    id: "glm-5",
    name: "GLM-5",
    provider: "Zhipu AI",
    providerSlug: "zhipu",
    description:
      "Zhipu AI's 744B MoE flagship. Open-weight under MIT license. Strong on SWE-Bench and agentic tasks.",
    inputPrice: 1,
    outputPrice: 3.2,
    contextWindow: 200000,
    maxOutput: 128000,
    releaseDate: "2026-02-11",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 70.4, humanEval: 91.0, gpqa: 72.0 },
    strengths: [
      "Open-weight (MIT license) — self-hostable",
      "77.8% SWE-Bench Verified — top-tier coding",
      "128K max output — huge generation window",
    ],
    weaknesses: [
      "MMLU-Pro lags behind Western flagships",
      "744B parameters — heavy to self-host",
      "China-based — availability concerns",
    ],
  },
  {
    id: "glm-47",
    name: "GLM-4.7",
    provider: "Zhipu AI",
    providerSlug: "zhipu",
    description:
      "Zhipu's best coding and reasoning model. 358B MoE, open-weight, strong math and browsing benchmarks.",
    inputPrice: 0.6,
    outputPrice: 2.2,
    contextWindow: 200000,
    maxOutput: 128000,
    releaseDate: "2025-12-22",
    category: "mid",
    capabilities: ["text", "vision", "code", "reasoning"],
    benchmarks: { mmluPro: 84.3, gpqa: 85.7 },
    strengths: [
      "Excellent value — strong benchmarks at $0.60/$2.20",
      "Open-weight (MIT license)",
      "Top scores on AIME 25 and BrowseComp",
    ],
    weaknesses: [
      "No tool-use support yet",
      "358B parameters — still heavy for self-hosting",
      "Smaller ecosystem than OpenAI/Anthropic",
    ],
  },

  // ── MiniMax ──────────────────────────────────────────
  {
    id: "minimax-m25",
    name: "MiniMax M2.5",
    provider: "MiniMax",
    providerSlug: "minimax",
    description:
      "230B MoE (10B active). Frontier-level performance at 1/20th the cost of proprietary flagships. MIT license.",
    inputPrice: 0.3,
    outputPrice: 1.2,
    contextWindow: 200000,
    maxOutput: 128000,
    releaseDate: "2026-02-12",
    category: "open-source",
    capabilities: ["text", "code", "reasoning"],
    benchmarks: { mmluPro: 82.0, humanEval: 90.0 },
    strengths: [
      "Frontier quality at budget pricing ($0.30/$1.20)",
      "80.2% SWE-Bench Verified — among the best",
      "Open-source (MIT) with 10B active params — easy to run",
    ],
    weaknesses: [
      "Text-only — no vision or audio",
      "No tool-use support",
      "Newer provider — smaller ecosystem",
    ],
  },

  // ── Mistral ────────────────────────────────────────────
  {
    id: "mistral-large-3",
    name: "Mistral Large 3",
    provider: "Mistral",
    providerSlug: "mistral",
    description:
      "Mistral's most capable model. Strong European AI alternative with competitive pricing.",
    inputPrice: 2,
    outputPrice: 5,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2026-01-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 83.0, humanEval: 91.0 },
    strengths: [
      "Low output cost ($5/1M) for a flagship",
      "Strong multilingual support",
      "European data sovereignty option",
    ],
    weaknesses: [
      "Lower benchmarks than top-tier competitors",
      "Smaller ecosystem",
    ],
  },
  {
    id: "mistral-medium-3",
    name: "Mistral Medium 3",
    provider: "Mistral",
    providerSlug: "mistral",
    description:
      "Balanced Mistral model. Good performance at budget-friendly pricing.",
    inputPrice: 0.4,
    outputPrice: 2,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2026-01-01",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code"],
    benchmarks: { mmluPro: 76.0, humanEval: 87.0 },
    strengths: [
      "Very affordable for mid-tier quality",
      "Good multilingual performance",
    ],
    weaknesses: [
      "Lags behind on reasoning benchmarks",
      "Smaller community and tooling",
    ],
  },
];

export function getModelById(id: string): AIModel | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): AIModel[] {
  return models.filter(
    (m) => m.providerSlug === provider.toLowerCase()
  );
}

export function getModelsByCategory(category: AIModel["category"]): AIModel[] {
  return models.filter((m) => m.category === category);
}

export function getAllProviders(): string[] {
  return [...new Set(models.map((m) => m.provider))];
}

export function getComparisonPairs(): { a: AIModel; b: AIModel }[] {
  const pairs: { a: AIModel; b: AIModel }[] = [];
  for (let i = 0; i < models.length; i++) {
    for (let j = i + 1; j < models.length; j++) {
      pairs.push({ a: models[i], b: models[j] });
    }
  }
  return pairs;
}
