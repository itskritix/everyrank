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
      <section>
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
    </div>
  );
}
