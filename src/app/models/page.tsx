import { models, getAllProviders } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All AI Models — Pricing, Benchmarks & Specs",
  description:
    "Browse all AI models with pricing, benchmarks, context windows, and capabilities. Compare GPT-5, Claude, Gemini, Llama, DeepSeek, and Grok.",
};

export default function ModelsPage() {
  const providers = getAllProviders();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All AI Models</h1>
      <p className="text-muted mb-10">
        {models.length} models across {providers.length} providers. Click any
        model for full details.
      </p>

      {providers.map((provider) => {
        const providerModels = models.filter((m) => m.provider === provider);
        return (
          <section key={provider} className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-muted">
              {provider}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providerModels.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="p-5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all group"
                >
                  <h3 className="font-semibold group-hover:text-accent-light transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                    <span className="text-green">
                      ${model.inputPrice} / ${model.outputPrice}
                    </span>
                    <span className="text-muted">
                      {formatContext(model.contextWindow)} ctx
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {model.capabilities.slice(0, 4).map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border text-muted"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function formatContext(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}
