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
  strengths: string[];
  weaknesses: string[];
}

export const models: AIModel[] = [
  // ── Anthropic ──────────────────────────────────────────
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Anthropic's most capable model. Excels at complex reasoning, agentic tool use, and long-form analysis.",
    inputPrice: 15,
    outputPrice: 75,
    contextWindow: 200000,
    maxOutput: 32000,
    releaseDate: "2025-05-22",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 89.0, humanEval: 94.8, gpqa: 74.8 },
    strengths: [
      "Best-in-class agentic tool use",
      "Strong at following complex instructions",
      "Excellent code generation and debugging",
    ],
    weaknesses: [
      "Most expensive Anthropic model",
      "Slower than Sonnet/Haiku",
      "200K context vs 1M for some competitors",
    ],
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Anthropic's balanced model. Strong reasoning at a lower price point than Opus.",
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 200000,
    maxOutput: 16000,
    releaseDate: "2025-05-22",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 84.5, humanEval: 93.0, gpqa: 68.2 },
    strengths: [
      "Great balance of quality and cost",
      "Fast response times",
      "Strong coding and analysis",
    ],
    weaknesses: [
      "Less capable than Opus on hardest tasks",
      "200K context limit",
    ],
  },
  {
    id: "claude-haiku-35",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    providerSlug: "anthropic",
    description:
      "Anthropic's fastest and cheapest model. Good for high-volume, latency-sensitive tasks.",
    inputPrice: 0.8,
    outputPrice: 4,
    contextWindow: 200000,
    maxOutput: 8192,
    releaseDate: "2024-10-29",
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
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's latest flagship model with strong reasoning, coding, and multimodal capabilities.",
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
      "128K context vs 200K+ for some competitors",
      "Less transparent about training data",
    ],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's efficient multimodal model. Strong performance at mid-range pricing.",
    inputPrice: 2.5,
    outputPrice: 10,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2024-05-13",
    category: "mid",
    capabilities: ["text", "vision", "tool-use", "code", "audio"],
    benchmarks: { mmluPro: 80.5, humanEval: 91.0, gpqa: 64.2 },
    strengths: [
      "Good multimodal performance",
      "Well-established, reliable",
      "Large ecosystem of tools",
    ],
    weaknesses: [
      "Being superseded by GPT-5",
      "Higher price than newer alternatives",
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
      "Weaker reasoning than full GPT-4o",
      "Can hallucinate more on complex topics",
    ],
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    providerSlug: "openai",
    description:
      "OpenAI's advanced reasoning model. Uses chain-of-thought to solve hard problems.",
    inputPrice: 2,
    outputPrice: 8,
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: "2025-04-16",
    category: "reasoning",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 87.0, humanEval: 94.5, gpqa: 79.2 },
    strengths: [
      "Excellent at math and science problems",
      "Strong logical reasoning",
      "200K context window",
    ],
    weaknesses: [
      "Slower due to reasoning overhead",
      "Higher effective cost due to reasoning tokens",
      "Overkill for simple tasks",
    ],
  },

  // ── Google ─────────────────────────────────────────────
  {
    id: "gemini-25-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    providerSlug: "google",
    description:
      "Google's flagship model with massive 1M context window and strong reasoning capabilities.",
    inputPrice: 1.25,
    outputPrice: 10,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2025-03-25",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "audio"],
    benchmarks: { mmluPro: 89.8, humanEval: 93.5, gpqa: 76.0 },
    strengths: [
      "1M token context window",
      "Top MMLU-Pro scores",
      "Competitive pricing for flagship",
    ],
    weaknesses: [
      "Can be verbose",
      "Google API ecosystem quirks",
    ],
  },
  {
    id: "gemini-25-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    providerSlug: "google",
    description:
      "Google's fast, affordable model with 1M context. Great value for most tasks.",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 1000000,
    maxOutput: 65536,
    releaseDate: "2025-04-17",
    category: "budget",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning"],
    benchmarks: { mmluPro: 76.0, humanEval: 89.5 },
    strengths: [
      "1M context at budget pricing",
      "Very fast",
      "Free tier available via Google AI Studio",
    ],
    weaknesses: [
      "Less capable than Pro on complex reasoning",
      "Output quality varies on edge cases",
    ],
  },

  // ── Meta (Open Source) ─────────────────────────────────
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    providerSlug: "meta",
    description:
      "Meta's flagship open-source model. 400B MoE architecture, competitive with proprietary models.",
    inputPrice: 0.31,
    outputPrice: 0.85,
    contextWindow: 1000000,
    maxOutput: 32000,
    releaseDate: "2025-04-05",
    category: "open-source",
    capabilities: ["text", "vision", "code"],
    benchmarks: { mmluPro: 80.5, humanEval: 90.2 },
    strengths: [
      "Open-source, self-hostable",
      "1M context window",
      "Very competitive pricing via providers",
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
      "Meta's efficient open-source model with an industry-leading 10M token context window.",
    inputPrice: 0.18,
    outputPrice: 0.63,
    contextWindow: 10000000,
    maxOutput: 32000,
    releaseDate: "2025-04-05",
    category: "open-source",
    capabilities: ["text", "vision", "code"],
    benchmarks: { mmluPro: 74.2, humanEval: 86.0 },
    strengths: [
      "10M token context window — largest available",
      "Open-source",
      "Very cheap via API providers",
    ],
    weaknesses: [
      "Lower benchmark scores than Maverick",
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
      "Absurdly cheap",
      "Strong coding performance",
      "Open-source",
    ],
    weaknesses: [
      "No vision support",
      "Smaller context than competitors",
      "Availability concerns (China-based)",
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
      "Open-source",
    ],
    weaknesses: [
      "Slower than non-reasoning models",
      "No vision or tool-use",
      "China-based availability concerns",
    ],
  },

  // ── xAI ────────────────────────────────────────────────
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "xAI",
    providerSlug: "xai",
    description:
      "xAI's latest model with strong reasoning and real-time web access capabilities.",
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: "2025-07-01",
    category: "flagship",
    capabilities: ["text", "vision", "tool-use", "code", "reasoning", "web-search"],
    benchmarks: { mmluPro: 86.0, humanEval: 93.0, gpqa: 72.0 },
    strengths: [
      "Built-in web search",
      "Real-time information access",
      "Strong reasoning",
    ],
    weaknesses: [
      "Expensive for its tier",
      "Smaller ecosystem than OpenAI/Anthropic",
      "Additional charges for tool invocations",
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
