export interface TopPick {
  modelId: string;
  reason: string;
  bestFor: string;
}

export interface UseCase {
  id: string;
  name: string;
  shortName: string;
  description: string;
  verdict: string;
  topPicks: TopPick[];
  keyFactors: string[];
  requiredCapabilities: string[];
  preferredCategory: string[];
  weightPricing: number; // 0-1
  weightBenchmarks: number;
  weightContext: number;
  weightOutput: number;
  capabilityBonuses: string[];
  contextCap: number; // diminishing returns above this
  specificBenchmark?: "mmluPro" | "humanEval" | "gpqa";
  tips: string[];
}

export const useCases: UseCase[] = [
  {
    id: "coding",
    name: "AI-Assisted Coding",
    shortName: "Coding",
    description:
      "Code generation, debugging, refactoring, and code review. Models need strong HumanEval scores and tool-use for IDE integration.",
    verdict:
      "GPT-5.3 Codex leads with 96.5% HumanEval and 65K output — it's the best pure coding model if you can afford it. Claude Opus 4.6 is the go-to for agentic coding (tool-use + reasoning). For budget coding, o3 at $0.40/$1.60 with 94.5% HumanEval is absurdly good value. Don't pick models based on context window alone — a cheap model with low HumanEval will generate buggy code regardless of how much context it can read.",
    topPicks: [
      { modelId: "gpt-53-codex", reason: "96.5% HumanEval, 65K output window, purpose-built for code", bestFor: "Raw code generation quality" },
      { modelId: "claude-opus-46", reason: "95% HumanEval + best-in-class tool-use for IDE/agent workflows", bestFor: "Agentic coding & complex debugging" },
      { modelId: "o3", reason: "94.5% HumanEval at $0.40/$1.60 — flagship coding quality at budget pricing", bestFor: "Best value for coding" },
    ],
    keyFactors: ["HumanEval score", "Tool-use support", "Max output tokens", "Speed"],
    requiredCapabilities: ["code"],
    preferredCategory: ["flagship", "mid", "reasoning"],
    weightPricing: 0.15,
    weightBenchmarks: 0.55,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: ["tool-use", "reasoning"],
    contextCap: 200000,
    specificBenchmark: "humanEval",
    tips: [
      "Max output matters — longer code completions without truncation",
      "Tool-use enables IDE integration (Copilot-style workflows)",
      "Reasoning models excel at complex debugging but are slower",
    ],
  },
  {
    id: "creative-writing",
    name: "Creative Writing & Content",
    shortName: "Creative Writing",
    description:
      "Blog posts, marketing copy, stories, and long-form content. Needs strong language ability and large output windows.",
    verdict:
      "Claude Sonnet 4.6 is the sweet spot — excellent creative voice at $3/$15, matching previous-gen Opus quality. For budget content at scale, GPT-4o Mini at $0.15/$0.60 handles 80% of writing tasks. Gemini 3.1 Pro has the strongest benchmarks overall, but Claude's writing style is generally preferred by editors and readers. If you're writing 100+ pieces a month, DeepSeek V3 at $0.14/$0.28 is surprisingly capable for drafts.",
    topPicks: [
      { modelId: "claude-sonnet-46", reason: "Best creative voice and tone control, Opus 4.5 quality at 1/5th the cost", bestFor: "Quality content that reads human" },
      { modelId: "gpt-5", reason: "Strong all-around writing with multimodal input, great for marketing copy", bestFor: "Marketing and business content" },
      { modelId: "gpt-4o-mini", reason: "80% of flagship writing quality at 3% of the cost", bestFor: "High-volume content on a budget" },
    ],
    keyFactors: ["Language quality", "Max output tokens", "Cost per 1M output"],
    requiredCapabilities: ["text"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.25,
    weightBenchmarks: 0.35,
    weightContext: 0.15,
    weightOutput: 0.25,
    capabilityBonuses: [],
    contextCap: 200000,
    tips: [
      "Output cost matters more than input cost for content generation",
      "Larger context windows help maintain consistency in long pieces",
      "Claude models are generally preferred for creative tone and voice",
    ],
  },
  {
    id: "data-analysis",
    name: "Data Analysis & Research",
    shortName: "Data Analysis",
    description:
      "Analyzing datasets, extracting insights, generating reports, and research synthesis. Needs strong reasoning and large context.",
    verdict:
      "Gemini 3.1 Pro dominates here — 94.3% GPQA Diamond, 1M context, and $2/$12 pricing. Feed it entire datasets in one shot. For complex multi-step analysis, o3's reasoning chains at $0.40/$1.60 are incredible value. Claude Opus 4.6 is the premium pick when you need tool-use + analysis combined. Don't use budget models for data analysis — the accuracy drop is real and can lead to wrong conclusions.",
    topPicks: [
      { modelId: "gemini-31-pro", reason: "94.3% GPQA, 1M context, $2 input — feed it entire datasets", bestFor: "Large-scale data analysis" },
      { modelId: "o3", reason: "79.2% GPQA with reasoning chains at $0.40/$1.60", bestFor: "Complex multi-step analysis on a budget" },
      { modelId: "claude-opus-46", reason: "75.5% GPQA + best tool-use for code execution workflows", bestFor: "Analysis with code execution" },
    ],
    keyFactors: ["Context window", "Reasoning ability", "GPQA score", "Tool-use"],
    requiredCapabilities: ["text", "reasoning"],
    preferredCategory: ["flagship", "reasoning"],
    weightPricing: 0.15,
    weightBenchmarks: 0.45,
    weightContext: 0.25,
    weightOutput: 0.15,
    capabilityBonuses: ["tool-use", "reasoning"],
    contextCap: 1000000,
    specificBenchmark: "gpqa",
    tips: [
      "Large context windows let you feed entire datasets in one prompt",
      "Reasoning models (o3, o4-mini, DeepSeek R1) excel at multi-step analysis",
      "Tool-use enables code execution for data processing",
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support Chatbot",
    shortName: "Customer Support",
    description:
      "Automated customer service, FAQ answering, ticket routing. Needs low latency, low cost, and reliable instruction following.",
    verdict:
      "GPT-4o Mini at $0.15/$0.60 is the default pick — fast, cheap, handles 90% of support queries. If you need tool-use (order lookups, account actions), Claude Haiku 4.5 at $0.80/$4 is the cheapest model with reliable tool calling. For premium support bots where quality matters more than cost, Claude Sonnet 4.6 is the best all-rounder. Don't use flagship models for support — you're burning money on capabilities you don't need.",
    topPicks: [
      { modelId: "gpt-4o-mini", reason: "Cheapest capable model with tool-use, fast responses", bestFor: "High-volume support at lowest cost" },
      { modelId: "claude-haiku-45", reason: "Reliable tool-use at budget pricing for order/account lookups", bestFor: "Support with API integrations" },
      { modelId: "claude-sonnet-46", reason: "Premium quality for complex support interactions", bestFor: "High-touch customer experience" },
    ],
    keyFactors: ["Cost per query", "Speed/latency", "Instruction following", "Tool-use"],
    requiredCapabilities: ["text", "tool-use"],
    preferredCategory: ["budget", "mid"],
    weightPricing: 0.45,
    weightBenchmarks: 0.25,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: ["tool-use"],
    contextCap: 128000,
    tips: [
      "Budget models handle most support queries just fine",
      "Cost per query matters — high volume means even $0.10 differences add up",
      "Tool-use is critical for looking up orders, accounts, etc.",
    ],
  },
  {
    id: "summarization",
    name: "Document Summarization",
    shortName: "Summarization",
    description:
      "Summarizing long documents, reports, meetings, and articles. Needs large context windows and good compression ability.",
    verdict:
      "Gemini 2.5 Flash at $0.15/$0.60 with 1M context is the best deal — summarize entire books for pennies. For higher quality summaries, Gemini 3.1 Pro's 1M context at $2 input gives noticeably better compression. Llama 4 Scout's 10M context is unique if you need to process truly massive documents, and at $0.18 input it's dirt cheap. Input cost is everything here — you're sending lots of text and generating little.",
    topPicks: [
      { modelId: "gemini-25-flash", reason: "1M context at $0.15 input — cheapest way to summarize long docs", bestFor: "Budget summarization at scale" },
      { modelId: "gemini-31-pro", reason: "1M context with best-in-class comprehension for accurate summaries", bestFor: "High-quality summaries" },
      { modelId: "llama-4-scout", reason: "10M context — the only model that can process truly massive corpora", bestFor: "Extremely long documents" },
    ],
    keyFactors: ["Context window", "Input cost", "Compression quality"],
    requiredCapabilities: ["text"],
    preferredCategory: ["budget", "mid"],
    weightPricing: 0.35,
    weightBenchmarks: 0.2,
    weightContext: 0.35,
    weightOutput: 0.1,
    capabilityBonuses: [],
    contextCap: 10000000,
    tips: [
      "Input cost dominates — you're sending lots of text but generating little",
      "1M context models (Gemini, Llama 4 Scout) can handle entire books",
      "Flash/budget models are usually sufficient for summarization",
    ],
  },
  {
    id: "translation",
    name: "Translation & Localization",
    shortName: "Translation",
    description:
      "Translating text between languages, localizing content, and multilingual support. Needs strong multilingual training.",
    verdict:
      "GPT-5 has the broadest and most accurate multilingual support at $1.25/$10. For European languages specifically, Mistral Large 3 at $2/$5 output is excellent value (trained heavily on EU languages). Budget pick: GPT-4o Mini at $0.15/$0.60 handles common language pairs well. For Asian languages, Claude Sonnet 4.6 and Gemini perform strongly. Avoid open-source models for translation — they're typically weaker on less common languages.",
    topPicks: [
      { modelId: "gpt-5", reason: "Broadest language support, most consistent quality across language pairs", bestFor: "General multilingual translation" },
      { modelId: "mistral-large-3", reason: "Excellent European languages at $2/$5 — trained on EU data", bestFor: "European language translation" },
      { modelId: "gpt-4o-mini", reason: "Handles common language pairs at 90%+ of flagship quality for 10% of the cost", bestFor: "Budget high-volume translation" },
    ],
    keyFactors: ["Multilingual quality", "MMLU-Pro score", "Cost efficiency"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget", "flagship"],
    weightPricing: 0.3,
    weightBenchmarks: 0.4,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: [],
    contextCap: 128000,
    specificBenchmark: "mmluPro",
    tips: [
      "GPT-4o and Claude have the broadest language support",
      "Mistral models excel at European languages specifically",
      "For high-volume translation, budget models can save 90%+ vs flagships",
    ],
  },
  {
    id: "math-science",
    name: "Math & Scientific Reasoning",
    shortName: "Math & Science",
    description:
      "Solving math problems, scientific analysis, physics simulations, and formal reasoning. Needs top-tier GPQA scores.",
    verdict:
      "Gemini 3.1 Pro destroys the competition here — 94.3% GPQA Diamond is the highest of any model, period. For budget math, o3 at $0.40/$1.60 with 79.2% GPQA and chain-of-thought reasoning is unbeatable value. DeepSeek R1 at $0.55/$2.19 is another budget reasoning option with strong math scores. Don't use budget non-reasoning models for math — they hallucinate numbers and skip steps.",
    topPicks: [
      { modelId: "gemini-31-pro", reason: "94.3% GPQA Diamond — highest of any model", bestFor: "Graduate-level science and complex math" },
      { modelId: "o3", reason: "79.2% GPQA with chain-of-thought at $0.40/$1.60", bestFor: "Best value for math reasoning" },
      { modelId: "deepseek-r1", reason: "71.5% GPQA at $0.55/$2.19 — cheapest reasoning model", bestFor: "Budget math with reasoning chains" },
    ],
    keyFactors: ["GPQA score", "Reasoning chains", "Mathematical accuracy"],
    requiredCapabilities: ["reasoning"],
    preferredCategory: ["reasoning", "flagship"],
    weightPricing: 0.1,
    weightBenchmarks: 0.65,
    weightContext: 0.1,
    weightOutput: 0.15,
    capabilityBonuses: ["reasoning"],
    contextCap: 200000,
    specificBenchmark: "gpqa",
    tips: [
      "Reasoning models (o3, DeepSeek R1) dominate here with chain-of-thought",
      "Gemini 3.1 Pro has the highest GPQA Diamond score (94.3%)",
      "Don't use budget models for math — accuracy drops significantly",
    ],
  },
  {
    id: "chatbot",
    name: "General Chatbot / Assistant",
    shortName: "Chatbot",
    description:
      "General-purpose conversational AI for apps, websites, and products. Needs balanced quality, speed, and cost.",
    verdict:
      "Claude Sonnet 4.6 at $3/$15 is the best quality-to-cost ratio for production chatbots — natural conversation, strong instruction following. GPT-5 at $1.25/$10 is cheaper with slightly less personality. For high-volume budget chatbots, GPT-4o Mini at $0.15/$0.60 handles most conversations well. Gemini 2.5 Flash at $0.15/$0.60 with 1M context is great if your chatbot needs to remember long conversation histories.",
    topPicks: [
      { modelId: "claude-sonnet-46", reason: "Best conversational quality and instruction following at mid-tier pricing", bestFor: "Quality chatbot experience" },
      { modelId: "gpt-5", reason: "Strong all-around at $1.25/$10 with audio support", bestFor: "Multimodal chatbot (text + voice)" },
      { modelId: "gpt-4o-mini", reason: "90% of GPT-4 quality at 3% of the cost", bestFor: "High-volume budget chatbot" },
    ],
    keyFactors: ["Response quality", "Latency", "Cost per conversation", "Tool-use"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.35,
    weightBenchmarks: 0.35,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: ["tool-use"],
    contextCap: 200000,
    tips: [
      "Mid-tier models offer the best quality/cost ratio for chatbots",
      "Claude Sonnet 4.6 and GPT-5 are the sweet spots for quality chatbots",
      "GPT-4o Mini and Gemini 2.5 Flash are solid budget picks for high-volume",
    ],
  },
  {
    id: "code-review",
    name: "Code Review & Security Audit",
    shortName: "Code Review",
    description:
      "Reviewing pull requests, finding bugs, security vulnerabilities, and suggesting improvements. Needs large context and strong code understanding.",
    verdict:
      "Claude Opus 4.6 is the gold standard for code review — 95% HumanEval, tool-use for codebase navigation, and the reasoning depth to catch subtle bugs. Claude Sonnet 4.6 is the value pick at $3/$15 with 94% HumanEval. For large codebases, Gemini 3.1 Pro's 1M context lets you load entire repos. Input cost matters most here — you're reading lots of code and outputting short reviews.",
    topPicks: [
      { modelId: "claude-opus-46", reason: "Best at catching subtle bugs and security issues with deep reasoning", bestFor: "Security audits and complex reviews" },
      { modelId: "claude-sonnet-46", reason: "94% HumanEval at 1/5th the Opus cost", bestFor: "Day-to-day PR reviews" },
      { modelId: "gemini-31-pro", reason: "1M context — load entire codebases for comprehensive review", bestFor: "Large codebase reviews" },
    ],
    keyFactors: ["Context window", "HumanEval score", "Security knowledge", "Precision"],
    requiredCapabilities: ["code"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.15,
    weightBenchmarks: 0.5,
    weightContext: 0.2,
    weightOutput: 0.15,
    capabilityBonuses: ["tool-use", "reasoning"],
    contextCap: 1000000,
    specificBenchmark: "humanEval",
    tips: [
      "Large context is key — you need to fit entire files or PRs",
      "Flagship models catch more subtle bugs and security issues",
      "Input cost dominates (reading lots of code, generating short reviews)",
    ],
  },
  {
    id: "image-understanding",
    name: "Image & Vision Analysis",
    shortName: "Vision",
    description:
      "Analyzing images, charts, screenshots, documents, and visual content. Needs multimodal vision capability.",
    verdict:
      "Gemini 3.1 Pro leads on vision benchmarks with the best chart/document understanding. Claude Opus 4.6 and GPT-4o are both strong alternatives with mature vision APIs. For budget vision, Claude Haiku 4.5 at $0.80/$4 handles basic image analysis. Most open-source models have limited or no vision support, so stick with proprietary models here.",
    topPicks: [
      { modelId: "gemini-31-pro", reason: "Best vision benchmarks, strong chart/document understanding, 1M context for multi-image", bestFor: "Document and chart analysis" },
      { modelId: "claude-opus-46", reason: "Excellent vision + tool-use combo for complex visual workflows", bestFor: "Vision-based agent workflows" },
      { modelId: "gpt-4o", reason: "Well-established vision API with large ecosystem", bestFor: "General image understanding" },
    ],
    keyFactors: ["Vision accuracy", "Document understanding", "Chart reading"],
    requiredCapabilities: ["vision"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.2,
    weightBenchmarks: 0.45,
    weightContext: 0.15,
    weightOutput: 0.2,
    capabilityBonuses: ["tool-use"],
    contextCap: 200000,
    tips: [
      "Not all models support vision — check capabilities first",
      "GPT-4o, Claude, and Gemini all have strong vision",
      "Open-source vision options are more limited (Llama 4 has basic support)",
    ],
  },
  {
    id: "rag",
    name: "RAG & Knowledge Base Q&A",
    shortName: "RAG",
    description:
      "Retrieval-augmented generation for answering questions from documents, wikis, and knowledge bases.",
    verdict:
      "Gemini 2.5 Flash at $0.15/$0.60 with 1M context is the RAG sweet spot — large context means fewer chunks needed, and the price per query is tiny. For higher accuracy on complex retrieved content, GPT-5 at $1.25/$10 gives more precise answers. If budget is critical, DeepSeek V3 at $0.14/$0.28 handles simple Q&A over retrieved chunks well. For RAG, input cost dominates — you're sending 5-20 chunks per query.",
    topPicks: [
      { modelId: "gemini-25-flash", reason: "1M context at $0.15 input — large context reduces chunking needs", bestFor: "Cost-effective RAG at scale" },
      { modelId: "gpt-5", reason: "Strong accuracy on complex retrieved content at moderate pricing", bestFor: "High-accuracy RAG" },
      { modelId: "deepseek-v3", reason: "Cheapest capable model for simple Q&A over retrieved docs", bestFor: "Budget RAG" },
    ],
    keyFactors: ["Context window", "Input cost", "Accuracy on retrieved text", "Speed"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.4,
    weightBenchmarks: 0.25,
    weightContext: 0.25,
    weightOutput: 0.1,
    capabilityBonuses: [],
    contextCap: 1000000,
    tips: [
      "Input cost is crucial — RAG sends lots of retrieved chunks per query",
      "Larger context windows reduce the need for aggressive chunking",
      "Budget models handle simple Q&A well; use flagships for complex reasoning over retrieved docs",
    ],
  },
  {
    id: "agents",
    name: "Autonomous AI Agents",
    shortName: "Agents",
    description:
      "Building autonomous agents that use tools, browse the web, execute code, and complete multi-step tasks.",
    verdict:
      "Claude Opus 4.6 is the undisputed leader for agents — best-in-class tool-use reliability, strong reasoning, and 32K output prevents truncated tool sequences. GPT-5.3 Codex is the coding-focused agent pick with 96.5% HumanEval and 65K output. For budget agents, Claude Sonnet 4.6 delivers 90% of Opus capability at 1/5th the cost. Don't use open-source or budget models for agents — unreliable tool-calling leads to cascading failures.",
    topPicks: [
      { modelId: "claude-opus-46", reason: "Best tool-use reliability + reasoning depth for multi-step workflows", bestFor: "General-purpose autonomous agents" },
      { modelId: "gpt-53-codex", reason: "96.5% HumanEval + 65K output for code-heavy agentic workflows", bestFor: "Coding agents (CI/CD, refactoring)" },
      { modelId: "claude-sonnet-46", reason: "90% of Opus agent quality at $3/$15", bestFor: "Budget-conscious agents" },
    ],
    keyFactors: ["Tool-use reliability", "Reasoning ability", "Max output", "SWE-Bench"],
    requiredCapabilities: ["tool-use", "reasoning", "code"],
    preferredCategory: ["flagship"],
    weightPricing: 0.1,
    weightBenchmarks: 0.5,
    weightContext: 0.15,
    weightOutput: 0.25,
    capabilityBonuses: ["tool-use", "reasoning"],
    contextCap: 200000,
    tips: [
      "Tool-use reliability is the #1 factor — the model must call tools correctly",
      "Claude Opus 4.6 and GPT-5.3 Codex lead in agentic benchmarks",
      "Large max output prevents truncated tool-call sequences",
    ],
  },
  {
    id: "legal",
    name: "Legal Document Analysis",
    shortName: "Legal",
    description:
      "Analyzing contracts, legal briefs, regulatory documents, and case law. Needs large context and precise language understanding.",
    verdict:
      "Gemini 3.1 Pro is the best fit — 1M context handles entire contracts, 91% MMLU-Pro for language precision, and $2 input means you can analyze thick legal documents affordably. Claude Opus 4.6 is the precision pick when you need nuanced interpretation of complex clauses. For volume work (reviewing many contracts), Gemini 2.5 Flash at $0.15 input with 1M context is unbeatable on cost.",
    topPicks: [
      { modelId: "gemini-31-pro", reason: "1M context + 91% MMLU-Pro — handles entire contracts with strong comprehension", bestFor: "Full contract analysis" },
      { modelId: "claude-opus-46", reason: "Most precise language understanding for nuanced clause interpretation", bestFor: "Complex legal reasoning" },
      { modelId: "gemini-25-flash", reason: "1M context at $0.15 input for bulk contract review", bestFor: "High-volume document review" },
    ],
    keyFactors: ["Context window", "Precision", "MMLU-Pro score", "Instruction following"],
    requiredCapabilities: ["text"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.2,
    weightBenchmarks: 0.4,
    weightContext: 0.3,
    weightOutput: 0.1,
    capabilityBonuses: ["reasoning"],
    contextCap: 1000000,
    specificBenchmark: "mmluPro",
    tips: [
      "Legal documents are long — 1M context models can handle entire contracts",
      "Precision matters more than creativity here",
      "Gemini's 1M context at $2 input is excellent value for document analysis",
    ],
  },
  {
    id: "education",
    name: "Education & Tutoring",
    shortName: "Education",
    description:
      "Tutoring students, explaining concepts, generating exercises, and adaptive learning. Needs clear explanations and patience.",
    verdict:
      "Claude Sonnet 4.6 gives the best step-by-step explanations — clear, patient, and adapts to the student's level. GPT-5 is a strong alternative with audio support for voice tutoring. For budget tutoring platforms, GPT-4o Mini handles Q&A and flashcard generation well at $0.15/$0.60. For math tutoring specifically, o3 with chain-of-thought reasoning at $0.40/$1.60 shows its work clearly.",
    topPicks: [
      { modelId: "claude-sonnet-46", reason: "Best at clear, patient explanations that adapt to student level", bestFor: "Interactive tutoring" },
      { modelId: "gpt-5", reason: "Strong explanations + audio support for voice-based tutoring", bestFor: "Multimodal tutoring" },
      { modelId: "gpt-4o-mini", reason: "Handles Q&A and exercise generation at minimal cost", bestFor: "Budget tutoring platforms" },
    ],
    keyFactors: ["Explanation quality", "MMLU-Pro score", "Cost per session", "Safety"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.35,
    weightBenchmarks: 0.35,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: ["reasoning"],
    contextCap: 128000,
    specificBenchmark: "mmluPro",
    tips: [
      "Mid-tier models give great explanations without flagship pricing",
      "Claude Sonnet excels at step-by-step explanations",
      "Budget models work well for simple Q&A and flashcard generation",
    ],
  },
  {
    id: "sql-database",
    name: "SQL & Database Queries",
    shortName: "SQL/Database",
    description:
      "Generating SQL queries, database optimization, schema design, and data modeling. Needs code ability and structured output.",
    verdict:
      "Claude Sonnet 4.6 generates the most reliable SQL with good schema understanding at $3/$15. For budget SQL generation, o3 at $0.40/$1.60 with 94.5% HumanEval handles complex joins well. GPT-4o Mini at $0.15/$0.60 is sufficient for simple CRUD queries. Don't overthink this — most mid-tier models generate correct SQL for common patterns. Flagship models only matter for complex optimization queries.",
    topPicks: [
      { modelId: "claude-sonnet-46", reason: "Reliable SQL generation with good schema understanding", bestFor: "Production SQL generation" },
      { modelId: "o3", reason: "94.5% HumanEval at budget pricing for complex queries", bestFor: "Complex SQL with reasoning" },
      { modelId: "gpt-4o-mini", reason: "Handles simple CRUD queries at minimal cost", bestFor: "Simple queries at scale" },
    ],
    keyFactors: ["Code generation quality", "Structured output", "HumanEval score"],
    requiredCapabilities: ["code"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.35,
    weightBenchmarks: 0.4,
    weightContext: 0.05,
    weightOutput: 0.2,
    capabilityBonuses: ["tool-use"],
    contextCap: 128000,
    specificBenchmark: "humanEval",
    tips: [
      "Most mid-tier models generate accurate SQL for common patterns",
      "Complex joins and optimization benefit from flagship models",
      "Budget models handle simple CRUD queries just fine",
    ],
  },
  {
    id: "email-writing",
    name: "Email & Business Writing",
    shortName: "Email Writing",
    description:
      "Drafting emails, business proposals, reports, and professional communications. Needs good tone control and conciseness.",
    verdict:
      "GPT-4o Mini at $0.15/$0.60 is genuinely all you need for most business emails. It handles tone, formatting, and conciseness well. If you need higher quality for executive communications, Claude Sonnet 4.6 gives more polished output. Gemini 2.5 Flash at $0.15/$0.60 is equally capable and cheaper on output. Flagships are complete overkill here — don't spend $5+ per million tokens on emails.",
    topPicks: [
      { modelId: "gpt-4o-mini", reason: "Best cost-to-quality for emails — handles tone and formatting well", bestFor: "Standard business email" },
      { modelId: "claude-sonnet-46", reason: "More polished, natural-sounding output for important communications", bestFor: "Executive and client-facing email" },
      { modelId: "gemini-25-flash", reason: "Equally capable at $0.15/$0.60 with 1M context for email threads", bestFor: "Email with long thread context" },
    ],
    keyFactors: ["Writing quality", "Tone control", "Speed", "Cost"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.45,
    weightBenchmarks: 0.25,
    weightContext: 0.1,
    weightOutput: 0.2,
    capabilityBonuses: [],
    contextCap: 128000,
    tips: [
      "This is one area where budget models genuinely perform well",
      "GPT-4o Mini at $0.15/$0.60 handles business writing excellently",
      "Flagships are overkill for most email tasks",
    ],
  },
];

export function getUseCaseById(id: string): UseCase | undefined {
  return useCases.find((uc) => uc.id === id);
}
