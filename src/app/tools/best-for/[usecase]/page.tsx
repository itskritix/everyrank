import { models, getModelById, type AIModel } from "@/data/models";
import { useCases, getUseCaseById, type UseCase } from "@/data/use-cases";
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
    description: `Which AI model is best for ${uc.name.toLowerCase()}? Data-backed recommendations comparing ${models.length} models on quality, pricing, and capabilities.`,
  };
}

function scoreModel(model: AIModel, uc: UseCase): number {
  // Check required capabilities
  const hasRequired = uc.requiredCapabilities.every((cap) =>
    model.capabilities.includes(cap)
  );
  if (!hasRequired) return -1;

  // Benchmark score (0-100) — the most important signal of quality
  let benchScore = 0;
  if (uc.specificBenchmark && model.benchmarks[uc.specificBenchmark]) {
    benchScore = model.benchmarks[uc.specificBenchmark]!;
  } else {
    const scores = Object.values(model.benchmarks).filter(Boolean) as number[];
    benchScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 40;
  }

  // Pricing score (logarithmic — diminishing returns on cheapness)
  const combinedPrice = model.inputPrice + model.outputPrice;
  const maxPrice = Math.max(...models.map((m) => m.inputPrice + m.outputPrice));
  const priceRatio = combinedPrice / maxPrice;
  const priceScore = (1 - Math.pow(priceRatio, 0.4)) * 100;

  // Context score (capped at contextCap — beyond that, diminishing returns)
  const effectiveCtx = Math.min(model.contextWindow, uc.contextCap);
  const ctxScore = (effectiveCtx / uc.contextCap) * 100;

  // Output score (normalized, capped at 128K)
  const maxOutput = Math.min(model.maxOutput, 128000);
  const outputScore = (maxOutput / 128000) * 100;

  // Capability bonuses
  let capBonus = 0;
  for (const cap of uc.capabilityBonuses) {
    if (model.capabilities.includes(cap)) capBonus += 8;
  }

  // Category bonus
  const categoryBonus = uc.preferredCategory.includes(model.category) ? 5 : 0;

  return (
    benchScore * uc.weightBenchmarks +
    priceScore * uc.weightPricing +
    ctxScore * uc.weightContext +
    outputScore * uc.weightOutput +
    capBonus +
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

  // Curated top picks
  const curatedPicks = uc.topPicks
    .map((pick) => ({ pick, model: getModelById(pick.modelId) }))
    .filter((p) => p.model) as { pick: typeof uc.topPicks[0]; model: AIModel }[];

  // Full scored ranking
  const scored = models
    .map((m) => ({ model: m, score: scoreModel(m, uc) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);

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

      {/* Verdict */}
      <section className="mb-10 p-5 rounded-lg border border-accent/30 bg-accent/5">
        <h2 className="text-lg font-semibold mb-2">Our Verdict</h2>
        <p className="text-sm leading-relaxed">{uc.verdict}</p>
      </section>

      {/* Curated top picks */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Top Picks</h2>
        <div className="space-y-4">
          {curatedPicks.map(({ pick, model }, i) => (
            <div
              key={model.id}
              className={`p-5 rounded-lg border ${
                i === 0
                  ? "border-accent/50 bg-accent/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      i === 0 ? "bg-accent text-white" : "bg-card text-muted border border-border"
                    }`}>
                      #{i + 1}
                    </span>
                    <Link
                      href={`/models/${model.id}`}
                      className="text-lg font-semibold hover:text-accent-light transition-colors"
                    >
                      {model.name}
                    </Link>
                    <span className="text-sm text-muted">{model.provider}</span>
                  </div>
                  <p className="text-sm text-muted mb-1">{pick.reason}</p>
                  <p className="text-xs text-accent-light">Best for: {pick.bestFor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MiniStat label="Input" value={`$${model.inputPrice}/1M`} />
                <MiniStat label="Output" value={`$${model.outputPrice}/1M`} />
                <MiniStat label="Context" value={fmtCtx(model.contextWindow)} />
                <MiniStat label="Max Output" value={fmtCtx(model.maxOutput)} />
              </div>

              {model.benchmarks && (
                <div className="flex gap-4 mt-3 text-xs text-muted">
                  {model.benchmarks.mmluPro && (
                    <span>MMLU-Pro: <span className="font-mono text-foreground">{model.benchmarks.mmluPro}%</span></span>
                  )}
                  {model.benchmarks.humanEval && (
                    <span>HumanEval: <span className="font-mono text-foreground">{model.benchmarks.humanEval}%</span></span>
                  )}
                  {model.benchmarks.gpqa && (
                    <span>GPQA: <span className="font-mono text-foreground">{model.benchmarks.gpqa}%</span></span>
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

      {/* Full ranking table */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Full Ranking (All Compatible Models)</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Rank</th>
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-right py-3 px-4 font-medium">Input</th>
                <th className="text-right py-3 px-4 font-medium">Output</th>
                <th className="text-right py-3 px-4 font-medium">
                  {uc.specificBenchmark === "humanEval" ? "HumanEval" :
                   uc.specificBenchmark === "gpqa" ? "GPQA" :
                   uc.specificBenchmark === "mmluPro" ? "MMLU-Pro" : "Avg Bench"}
                </th>
                <th className="text-right py-3 px-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((item, i) => {
                const benchVal = uc.specificBenchmark
                  ? item.model.benchmarks[uc.specificBenchmark]
                  : null;
                const avgBench = !benchVal
                  ? Object.values(item.model.benchmarks).filter(Boolean)
                  : null;
                const displayBench = benchVal
                  ? `${benchVal}%`
                  : avgBench && avgBench.length > 0
                  ? `${((avgBench as number[]).reduce((a, b) => a + b, 0) / avgBench.length).toFixed(1)}%`
                  : "—";

                return (
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
                      {displayBench}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {item.score.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compare top picks */}
      {curatedPicks.length >= 2 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Compare Top Picks</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/compare/${curatedPicks[0].model.id}-vs-${curatedPicks[1].model.id}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              {curatedPicks[0].model.name} vs {curatedPicks[1].model.name}
            </Link>
            {curatedPicks.length >= 3 && (
              <>
                <Link
                  href={`/compare/${curatedPicks[0].model.id}-vs-${curatedPicks[2].model.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
                >
                  {curatedPicks[0].model.name} vs {curatedPicks[2].model.name}
                </Link>
                <Link
                  href={`/compare/${curatedPicks[1].model.id}-vs-${curatedPicks[2].model.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
                >
                  {curatedPicks[1].model.name} vs {curatedPicks[2].model.name}
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
