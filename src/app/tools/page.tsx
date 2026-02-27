import { models } from "@/data/models";
import { useCases } from "@/data/use-cases";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Tools — Token Calculator, Model Finder & More",
  description:
    "Free tools to help you choose the right AI model. Token cost calculator, context window comparison, API cost estimator, and model recommendations for every use case.",
};

const tools = [
  {
    name: "Token Cost Calculator",
    description: "Calculate the exact cost of your API calls across all models. Enter your token count, see the price.",
    href: "/tools/token-calculator",
    icon: "💰",
  },
  {
    name: "Context Window Comparison",
    description: "See how many words, pages, and books fit in each model's context window. Visual comparison.",
    href: "/tools/context-window",
    icon: "📏",
  },
  {
    name: "API Monthly Cost Estimator",
    description: "Estimate your monthly API spend based on daily usage patterns. Compare costs across models.",
    href: "/tools/api-cost-estimator",
    icon: "📊",
  },
  {
    name: "Prompt Cost Calculator",
    description: "Paste your prompt text and see exactly what it costs across every AI model. Instant cost breakdown.",
    href: "/tools/prompt-cost",
    icon: "✏️",
  },
];

export default function ToolsIndex() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Free AI Tools</h1>
      <p className="text-muted mb-10">
        Tools to help you compare, choose, and budget for AI models.
      </p>

      {/* Main tools */}
      <section className="mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all group"
            >
              <span className="text-2xl mb-3 block">{tool.icon}</span>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-accent-light transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-muted">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Best model for... */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold mb-2">
          Best AI Model For...
        </h2>
        <p className="text-muted mb-6 text-sm">
          Data-backed recommendations for {useCases.length} common use cases. Which model should you actually use?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {useCases.map((uc) => (
            <Link
              key={uc.id}
              href={`/tools/best-for/${uc.id}`}
              className="px-4 py-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all text-sm"
            >
              <span className="font-medium">Best for {uc.shortName}</span>
              <span className="text-muted block text-xs mt-0.5 truncate">
                {uc.description.slice(0, 60)}...
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* X Alternatives */}
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Model Alternatives
        </h2>
        <p className="text-muted mb-6 text-sm">
          Thinking about switching? See the best alternatives for each of the {models.length} models we track.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/tools/alternatives/${m.id}`}
              className="px-4 py-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all text-sm"
            >
              <span className="font-medium">{m.name} Alternatives</span>
              <span className="text-muted block text-xs mt-0.5">
                {m.provider} &middot; ${m.inputPrice}/${m.outputPrice} per 1M
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Provider Comparisons */}
      <ProviderComparisons />
    </div>
  );
}

function ProviderComparisons() {
  const providerSlugs = [...new Set(models.map((m) => m.providerSlug))].sort();
  const providerNames: Record<string, string> = {};
  for (const m of models) {
    if (!providerNames[m.providerSlug]) providerNames[m.providerSlug] = m.provider;
  }

  const pairs: { slugA: string; slugB: string; nameA: string; nameB: string }[] = [];
  for (let i = 0; i < providerSlugs.length; i++) {
    for (let j = i + 1; j < providerSlugs.length; j++) {
      pairs.push({
        slugA: providerSlugs[i],
        slugB: providerSlugs[j],
        nameA: providerNames[providerSlugs[i]],
        nameB: providerNames[providerSlugs[j]],
      });
    }
  }

  return (
    <section className="mt-14">
      <h2 className="text-xl font-semibold mb-2">Provider Comparisons</h2>
      <p className="text-muted mb-6 text-sm">
        Compare AI providers head-to-head across their full model lineups, pricing, and benchmarks.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {pairs.map((p) => (
          <Link
            key={`${p.slugA}-${p.slugB}`}
            href={`/compare/providers/${p.slugA}-vs-${p.slugB}`}
            className="px-4 py-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all text-sm"
          >
            <span className="font-medium">{p.nameA} vs {p.nameB}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
