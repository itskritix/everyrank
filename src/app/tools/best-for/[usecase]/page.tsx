import { models, type AIModel } from "@/data/models";
import { useCases, getUseCaseById } from "@/data/use-cases";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return useCases.map((uc) => ({ usecase: uc.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ usecase: string }>;
}): Promise<Metadata> {
  const { usecase } = await params;
  const uc = getUseCaseById(usecase);
  if (!uc) return {};
  return {
    title: `Best AI Model for ${uc.name} (2026) — Top Picks & Pricing`,
    description: `Which AI model is best for ${uc.name.toLowerCase()}? We compare ${models.length} models on pricing, benchmarks, and capabilities to find the top picks for ${uc.name.toLowerCase()}.`,
  };
}

function scoreModel(model: AIModel, uc: ReturnType<typeof getUseCaseById>): number {
  if (!uc) return 0;

  // Check required capabilities
  const hasRequired = uc.requiredCapabilities.every((cap) =>
    model.capabilities.includes(cap)
  );
  if (!hasRequired) return -1;

  // Pricing score (lower is better, normalize to 0-100)
  const maxPrice = Math.max(...models.map((m) => m.inputPrice + m.outputPrice));
  const priceScore = (1 - (model.inputPrice + model.outputPrice) / maxPrice) * 100;

  // Benchmark score
  let benchScore = 0;
  if (uc.specificBenchmark && model.benchmarks[uc.specificBenchmark]) {
    benchScore = model.benchmarks[uc.specificBenchmark]!;
  } else {
    const scores = Object.values(model.benchmarks).filter(Boolean) as number[];
    benchScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  }

  // Context score (normalize)
  const maxCtx = Math.max(...models.map((m) => m.contextWindow));
  const ctxScore = (model.contextWindow / maxCtx) * 100;

  // Category bonus
  const categoryBonus = uc.preferredCategory.includes(model.category) ? 10 : 0;

  return (
    priceScore * uc.weightPricing +
    benchScore * uc.weightBenchmarks +
    ctxScore * uc.weightContext +
    categoryBonus
  );
}

export default async function BestForPage({
  params,
}: {
  params: Promise<{ usecase: string }>;
}) {
  const { usecase } = await params;
  const uc = getUseCaseById(usecase);
  if (!uc) notFound();

  const scored = models
    .map((m) => ({ model: m, score: scoreModel(m, uc) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3);
  const rest = scored.slice(3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Best AI Model for ${uc.name} in 2026`,
    description: uc.description,
    dateModified: new Date().toISOString(),
    publisher: { "@type": "Organization", name: "EveryRank", url: "https://everyrank.app" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Tools
      </Link>

      <h1 className="text-3xl font-bold mb-3">
        Best AI Model for {uc.name}
      </h1>
      <p className="text-muted mb-8 max-w-2xl">{uc.description}</p>

      {/* Top 3 picks */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Top Picks</h2>
        <div className="space-y-4">
          {top.map((item, i) => (
            <div
              key={item.model.id}
              className={`p-5 rounded-lg border ${
                i === 0
                  ? "border-accent/50 bg-accent/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      i === 0 ? "bg-accent text-white" : "bg-card text-muted border border-border"
                    }`}>
                      #{i + 1}
                    </span>
                    <Link
                      href={`/models/${item.model.id}`}
                      className="text-lg font-semibold hover:text-accent-light transition-colors"
                    >
                      {item.model.name}
                    </Link>
                    <span className="text-sm text-muted">{item.model.provider}</span>
                  </div>
                  <p className="text-sm text-muted">{item.model.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-muted">Score</p>
                  <p className="text-lg font-mono font-semibold">{item.score.toFixed(0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MiniStat label="Input" value={`$${item.model.inputPrice}/1M`} />
                <MiniStat label="Output" value={`$${item.model.outputPrice}/1M`} />
                <MiniStat label="Context" value={fmtCtx(item.model.contextWindow)} />
                <MiniStat label="Max Output" value={fmtCtx(item.model.maxOutput)} />
              </div>

              {item.model.benchmarks && (
                <div className="flex gap-4 mt-3 text-xs text-muted">
                  {item.model.benchmarks.mmluPro && (
                    <span>MMLU-Pro: <span className="font-mono text-foreground">{item.model.benchmarks.mmluPro}%</span></span>
                  )}
                  {item.model.benchmarks.humanEval && (
                    <span>HumanEval: <span className="font-mono text-foreground">{item.model.benchmarks.humanEval}%</span></span>
                  )}
                  {item.model.benchmarks.gpqa && (
                    <span>GPQA: <span className="font-mono text-foreground">{item.model.benchmarks.gpqa}%</span></span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* What to look for */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Matters for {uc.shortName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold mb-2">Key Factors</h3>
            <ul className="space-y-1.5">
              {uc.keyFactors.map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-accent-light mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold mb-2">Tips</h3>
            <ul className="space-y-1.5">
              {uc.tips.map((t, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green mt-0.5">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Required capabilities */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold mb-3 text-muted">Required Capabilities</h2>
        <div className="flex flex-wrap gap-2">
          {uc.requiredCapabilities.map((cap) => (
            <span
              key={cap}
              className="text-sm px-3 py-1 rounded-full bg-accent/10 text-accent-light border border-accent/20"
            >
              {cap}
            </span>
          ))}
        </div>
      </section>

      {/* Full ranking table */}
      {rest.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Full Ranking</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-muted">
                  <th className="text-left py-3 px-4 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 font-medium">Model</th>
                  <th className="text-right py-3 px-4 font-medium">Input</th>
                  <th className="text-right py-3 px-4 font-medium">Output</th>
                  <th className="text-right py-3 px-4 font-medium">Context</th>
                  <th className="text-right py-3 px-4 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((item, i) => (
                  <tr
                    key={item.model.id}
                    className={`border-b border-border hover:bg-card-hover ${
                      i < 3 ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-muted">#{i + 1}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/models/${item.model.id}`}
                        className="text-accent-light hover:underline font-medium"
                      >
                        {item.model.name}
                      </Link>
                      <span className="text-xs text-muted ml-2">{item.model.provider}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${item.model.inputPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${item.model.outputPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {fmtCtx(item.model.contextWindow)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {item.score.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Compare top picks */}
      {top.length >= 2 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Compare Top Picks</h2>
          <div className="flex flex-wrap gap-2">
            {top.length >= 2 && (
              <Link
                href={`/compare/${top[0].model.id}-vs-${top[1].model.id}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
              >
                {top[0].model.name} vs {top[1].model.name}
              </Link>
            )}
            {top.length >= 3 && (
              <>
                <Link
                  href={`/compare/${top[0].model.id}-vs-${top[2].model.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
                >
                  {top[0].model.name} vs {top[2].model.name}
                </Link>
                <Link
                  href={`/compare/${top[1].model.id}-vs-${top[2].model.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
                >
                  {top[1].model.name} vs {top[2].model.name}
                </Link>
              </>
            )}
          </div>
        </section>
      )}

      {/* Other use cases */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Other Use Cases</h2>
        <div className="flex flex-wrap gap-2">
          {useCases
            .filter((u) => u.id !== uc.id)
            .slice(0, 8)
            .map((u) => (
              <Link
                key={u.id}
                href={`/tools/best-for/${u.id}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
              >
                Best for {u.shortName}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded bg-card border border-border">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-mono font-semibold">{value}</p>
    </div>
  );
}

function fmtCtx(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}
