export interface UseCase {
  id: string;
  name: string;
  shortName: string;
  description: string;
  keyFactors: string[];
  requiredCapabilities: string[];
  preferredCategory: string[];
  weightPricing: number; // 0-1, how much pricing matters
  weightBenchmarks: number;
  weightContext: number;
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
    keyFactors: ["HumanEval score", "Tool-use support", "Max output tokens", "Speed"],
    requiredCapabilities: ["code"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.3,
    weightBenchmarks: 0.5,
    weightContext: 0.2,
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
    keyFactors: ["Language quality", "Max output tokens", "Cost per 1M output"],
    requiredCapabilities: ["text"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.4,
    weightBenchmarks: 0.3,
    weightContext: 0.3,
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
    keyFactors: ["Context window", "Reasoning ability", "GPQA score", "Tool-use"],
    requiredCapabilities: ["text", "reasoning"],
    preferredCategory: ["flagship", "reasoning"],
    weightPricing: 0.2,
    weightBenchmarks: 0.4,
    weightContext: 0.4,
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
    keyFactors: ["Cost per query", "Speed/latency", "Instruction following", "Tool-use"],
    requiredCapabilities: ["text", "tool-use"],
    preferredCategory: ["budget", "mid"],
    weightPricing: 0.6,
    weightBenchmarks: 0.2,
    weightContext: 0.2,
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
    keyFactors: ["Context window", "Input cost", "Compression quality"],
    requiredCapabilities: ["text"],
    preferredCategory: ["budget", "mid"],
    weightPricing: 0.4,
    weightBenchmarks: 0.2,
    weightContext: 0.4,
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
    keyFactors: ["Multilingual quality", "MMLU-Pro score", "Cost efficiency"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.5,
    weightBenchmarks: 0.3,
    weightContext: 0.2,
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
    keyFactors: ["GPQA score", "Reasoning chains", "Mathematical accuracy"],
    requiredCapabilities: ["reasoning"],
    preferredCategory: ["reasoning", "flagship"],
    weightPricing: 0.2,
    weightBenchmarks: 0.6,
    weightContext: 0.2,
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
    keyFactors: ["Response quality", "Latency", "Cost per conversation", "Tool-use"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.5,
    weightBenchmarks: 0.3,
    weightContext: 0.2,
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
    keyFactors: ["Context window", "HumanEval score", "Security knowledge", "Precision"],
    requiredCapabilities: ["code"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.3,
    weightBenchmarks: 0.4,
    weightContext: 0.3,
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
    keyFactors: ["Vision accuracy", "Document understanding", "Chart reading"],
    requiredCapabilities: ["vision"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.3,
    weightBenchmarks: 0.4,
    weightContext: 0.3,
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
    keyFactors: ["Context window", "Input cost", "Accuracy on retrieved text", "Speed"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.5,
    weightBenchmarks: 0.2,
    weightContext: 0.3,
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
    keyFactors: ["Tool-use reliability", "Reasoning ability", "Max output", "SWE-Bench"],
    requiredCapabilities: ["tool-use", "reasoning", "code"],
    preferredCategory: ["flagship"],
    weightPricing: 0.2,
    weightBenchmarks: 0.5,
    weightContext: 0.3,
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
    keyFactors: ["Context window", "Precision", "MMLU-Pro score", "Instruction following"],
    requiredCapabilities: ["text"],
    preferredCategory: ["flagship", "mid"],
    weightPricing: 0.3,
    weightBenchmarks: 0.4,
    weightContext: 0.3,
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
    keyFactors: ["Explanation quality", "MMLU-Pro score", "Cost per session", "Safety"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.5,
    weightBenchmarks: 0.3,
    weightContext: 0.2,
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
    keyFactors: ["Code generation quality", "Structured output", "HumanEval score"],
    requiredCapabilities: ["code"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.5,
    weightBenchmarks: 0.3,
    weightContext: 0.2,
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
    keyFactors: ["Writing quality", "Tone control", "Speed", "Cost"],
    requiredCapabilities: ["text"],
    preferredCategory: ["mid", "budget"],
    weightPricing: 0.6,
    weightBenchmarks: 0.2,
    weightContext: 0.2,
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
