import { models } from "@/data/models";
import Link from "next/link";

export default function Home() {
  const sorted = [...models].sort((a, b) => a.inputPrice - b.inputPrice);
  const flagships = models.filter((m) => m.category === "flagship");
  const cheapest = sorted.slice(0, 5);

  const popularComparisons = [
    ["claude-opus-4", "gpt-5"],
    ["gemini-25-pro", "claude-sonnet-4"],
    ["gpt-4o-mini", "gemini-25-flash"],
    ["deepseek-v3", "llama-4-maverick"],
    ["claude-opus-4", "gemini-25-pro"],
    ["gpt-5", "gemini-25-pro"],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Compare every AI model.
          <br />
          <span className="text-accent-light">Price. Speed. Quality.</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto mb-8">
          Side-by-side comparisons of {models.length} AI models across pricing,
          benchmarks, context windows, and capabilities. Updated regularly.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/models"
            className="bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Browse Models
          </Link>
          <Link
            href="/compare"
            className="border border-border hover:border-muted text-foreground px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Compare
          </Link>
        </div>
      </section>

      {/* Quick pricing table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">AI Model Pricing Overview</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-left py-3 px-4 font-medium">Provider</th>
                <th className="text-right py-3 px-4 font-medium">
                  Input / 1M tokens
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  Output / 1M tokens
                </th>
                <th className="text-right py-3 px-4 font-medium">Context</th>
                <th className="text-center py-3 px-4 font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((model) => (
                <tr
                  key={model.id}
                  className="border-b border-border hover:bg-card-hover transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/models/${model.id}`}
                      className="text-accent-light hover:underline font-medium"
                    >
                      {model.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted">{model.provider}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    ${model.inputPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    ${model.outputPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted">
                    {formatContext(model.contextWindow)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CategoryBadge category={model.category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popular comparisons */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularComparisons.map(([aId, bId]) => {
            const a = models.find((m) => m.id === aId)!;
            const b = models.find((m) => m.id === bId)!;
            return (
              <Link
                key={`${aId}-${bId}`}
                href={`/compare/${aId}-vs-${bId}`}
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
              >
                <span className="font-medium text-sm">{a.name}</span>
                <span className="text-muted text-xs">vs</span>
                <span className="font-medium text-sm">{b.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Flagship models */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Flagship Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flagships.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="p-5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-muted">{model.provider}</p>
                </div>
                <span className="text-xs font-mono text-green bg-green/10 px-2 py-1 rounded">
                  ${model.inputPrice} / ${model.outputPrice}
                </span>
              </div>
              <p className="text-sm text-muted mt-2">{model.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Cheapest models */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Most Affordable Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cheapest.map((model, i) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="p-5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-muted">#{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-xs text-muted">{model.provider}</p>
                </div>
              </div>
              <p className="text-sm font-mono text-green">
                ${model.inputPrice} input / ${model.outputPrice} output
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatContext(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    flagship: "text-accent-light bg-accent/10",
    mid: "text-blue-400 bg-blue-400/10",
    budget: "text-green bg-green/10",
    reasoning: "text-yellow bg-yellow/10",
    "open-source": "text-purple-400 bg-purple-400/10",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[category] || ""}`}>
      {category}
    </span>
  );
}
