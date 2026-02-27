import { models, getAllProviders, getModelsByProvider, type AIModel } from "@/data/models";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// --- Helpers ---

function fmtCtx(tokens: number): string {
  if (tokens >= 1000000) return `${Math.round(tokens / 1000000 * 10) / 10}M`;
  return `${Math.round(tokens / 1000)}K`;
}

function fmtPrice(price: number): string {
  if (price < 0.01) return "$0.00";
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(2)}`;
}

function avgBenchmarks(m: AIModel): number {
  const scores = Object.values(m.benchmarks).filter(Boolean) as number[];
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function getProviderSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of models) {
    if (!map.has(m.providerSlug)) {
      map.set(m.providerSlug, m.provider);
    }
  }
  return map;
}

function getAllProviderSlugs(): string[] {
  return [...new Set(models.map((m) => m.providerSlug))].sort();
}

function getProviderPairs(): { slugA: string; slugB: string; nameA: string; nameB: string }[] {
  const slugMap = getProviderSlugMap();
  const slugs = getAllProviderSlugs();
  const pairs: { slugA: string; slugB: string; nameA: string; nameB: string }[] = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      pairs.push({
        slugA: slugs[i],
        slugB: slugs[j],
        nameA: slugMap.get(slugs[i])!,
        nameB: slugMap.get(slugs[j])!,
      });
    }
  }
  return pairs;
}

function parseSlug(slug: string): { slugA: string; slugB: string } | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return { slugA: match[1], slugB: match[2] };
}

const categoryOrder: Record<string, number> = {
  flagship: 0,
  mid: 1,
  reasoning: 2,
  budget: 3,
  "open-source": 4,
};

const categoryLabel: Record<string, string> = {
  flagship: "Flagship",
  mid: "Mid-Tier",
  reasoning: "Reasoning",
  budget: "Budget",
  "open-source": "Open Source",
};

// --- Static generation ---

export function generateStaticParams() {
  const pairs = getProviderPairs();
  const params: { slug: string }[] = [];
  for (const p of pairs) {
    params.push({ slug: `${p.slugA}-vs-${p.slugB}` });
    params.push({ slug: `${p.slugB}-vs-${p.slugA}` });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};
  const slugMap = getProviderSlugMap();
  const nameA = slugMap.get(parsed.slugA);
  const nameB = slugMap.get(parsed.slugB);
  if (!nameA || !nameB) return {};
  const modelsA = getModelsByProvider(parsed.slugA);
  const modelsB = getModelsByProvider(parsed.slugB);
  return {
    title: `${nameA} vs ${nameB} (2026) — Models, Pricing & Benchmarks Compared`,
    description: `Compare ${nameA} (${modelsA.length} models) and ${nameB} (${modelsB.length} models) side-by-side on pricing, benchmarks, context windows, and capabilities. Find the best provider for your use case.`,
  };
}

// --- Provider stats ---

interface ProviderStats {
  name: string;
  slug: string;
  models: AIModel[];
  modelCount: number;
  minPrice: number;
  maxPrice: number;
  avgBench: number;
  avgContext: number;
  categories: string[];
  capabilities: string[];
}

function getProviderStats(slug: string): ProviderStats | null {
  const slugMap = getProviderSlugMap();
  const name = slugMap.get(slug);
  if (!name) return null;
  const providerModels = getModelsByProvider(slug);
  if (providerModels.length === 0) return null;

  const prices = providerModels.map((m) => m.inputPrice + m.outputPrice);
  const benchScores = providerModels.map(avgBenchmarks).filter((s) => s > 0);
  const allCaps = new Set(providerModels.flatMap((m) => m.capabilities));
  const allCats = [...new Set(providerModels.map((m) => m.category))];

  return {
    name,
    slug,
    models: providerModels,
    modelCount: providerModels.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgBench: benchScores.length > 0
      ? benchScores.reduce((a, b) => a + b, 0) / benchScores.length
      : 0,
    avgContext: providerModels.reduce((s, m) => s + m.contextWindow, 0) / providerModels.length,
    categories: allCats.sort((a, b) => (categoryOrder[a] ?? 99) - (categoryOrder[b] ?? 99)),
    capabilities: [...allCaps].sort(),
  };
}

// --- Page ---

export default async function ProviderComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const a = getProviderStats(parsed.slugA);
  const b = getProviderStats(parsed.slugB);
  if (!a || !b) notFound();

  const allModels = [...a.models, ...b.models].sort((x, y) => {
    const catDiff = (categoryOrder[x.category] ?? 99) - (categoryOrder[y.category] ?? 99);
    if (catDiff !== 0) return catDiff;
    return (x.inputPrice + x.outputPrice) - (y.inputPrice + y.outputPrice);
  });

  // Head-to-head: find best model per category from each provider
  const headToHead = getHeadToHead(a, b);

  // Verdict data
  const cheaperProvider = a.minPrice < b.minPrice ? a : b;
  const higherBenchProvider = a.avgBench > b.avgBench ? a : b;
  const biggerContextProvider = a.avgContext > b.avgContext ? a : b;
  const moreModelsProvider = a.modelCount > b.modelCount ? a : b;

  // Other provider pairs for links
  const allPairs = getProviderPairs();
  const otherPairs = allPairs.filter(
    (p) =>
      !(p.slugA === a.slug && p.slugB === b.slug) &&
      !(p.slugA === b.slug && p.slugB === a.slug)
  );

  // Model-level comparison links
  const crossModelPairs: { modelA: AIModel; modelB: AIModel }[] = [];
  for (const mA of a.models) {
    for (const mB of b.models) {
      crossModelPairs.push({ modelA: mA, modelB: mB });
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.name} vs ${b.name}: Models, Pricing & Benchmarks Compared`,
    description: `A comprehensive comparison of ${a.name} and ${b.name} AI model providers.`,
    dateModified: new Date().toISOString(),
    publisher: { "@type": "Organization", name: "EveryRank", url: "https://everyrank.app" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <Link
        href="/compare"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        &larr; All Comparisons
      </Link>

      <h1 className="text-3xl font-bold mb-3">
        {a.name} vs {b.name}
      </h1>
      <p className="text-muted mb-10 max-w-3xl">
        A comprehensive comparison of {a.name} ({a.modelCount} model{a.modelCount !== 1 ? "s" : ""}) and{" "}
        {b.name} ({b.modelCount} model{b.modelCount !== 1 ? "s" : ""}) across pricing, benchmarks,
        context windows, and capabilities. Updated for 2026.
      </p>

      {/* Provider overview cards */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Provider Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProviderCard stats={a} />
          <ProviderCard stats={b} />
        </div>
      </section>

      {/* Model lineup comparison table */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Model Lineup Comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-left py-3 px-4 font-medium">Provider</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-right py-3 px-4 font-medium">Input&nbsp;$/1M</th>
                <th className="text-right py-3 px-4 font-medium">Output&nbsp;$/1M</th>
                <th className="text-right py-3 px-4 font-medium">Context</th>
                <th className="text-right py-3 px-4 font-medium">Avg&nbsp;Bench</th>
              </tr>
            </thead>
            <tbody>
              {allModels.map((m) => {
                const bench = avgBenchmarks(m);
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-border hover:bg-card-hover ${
                      m.providerSlug === a.slug ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/models/${m.id}`}
                        className="text-accent-light hover:underline font-medium"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted">{m.provider}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted">
                        {categoryLabel[m.category] ?? m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{fmtPrice(m.inputPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono">{fmtPrice(m.outputPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono">{fmtCtx(m.contextWindow)}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {bench > 0 ? `${bench.toFixed(1)}%` : "\u2014"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Head-to-head matchups */}
      {headToHead.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Head-to-Head by Category</h2>
          <div className="space-y-4">
            {headToHead.map((matchup) => (
              <div
                key={matchup.category}
                className="p-5 rounded-lg border border-border"
              >
                <h3 className="text-sm font-semibold text-muted mb-3">
                  {categoryLabel[matchup.category] ?? matchup.category}
                </h3>
                {matchup.modelA && matchup.modelB ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MatchupCard model={matchup.modelA} isWinner={matchup.winner === "a"} />
                    <MatchupCard model={matchup.modelB} isWinner={matchup.winner === "b"} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchup.modelA ? (
                      <>
                        <MatchupCard model={matchup.modelA} isWinner={true} />
                        <div className="p-4 rounded-lg bg-card border border-border flex items-center justify-center text-muted text-sm">
                          No {categoryLabel[matchup.category]?.toLowerCase()} model from {b.name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-lg bg-card border border-border flex items-center justify-center text-muted text-sm">
                          No {categoryLabel[matchup.category]?.toLowerCase()} model from {a.name}
                        </div>
                        <MatchupCard model={matchup.modelB!} isWinner={true} />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verdict */}
      <section className="mb-10 p-6 rounded-lg border border-accent/30 bg-accent/5">
        <h2 className="text-xl font-semibold mb-3">Verdict</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Best on price:</strong>{" "}
            <span className="text-green">{cheaperProvider.name}</span> offers the cheapest
            option at {fmtPrice(cheaperProvider.minPrice)}/1M tokens combined,
            vs {fmtPrice(cheaperProvider === a ? b.minPrice : a.minPrice)}/1M from {cheaperProvider === a ? b.name : a.name}.
          </p>
          <p>
            <strong>Higher benchmarks:</strong>{" "}
            <span className="text-accent-light">{higherBenchProvider.name}</span> averages{" "}
            {higherBenchProvider.avgBench.toFixed(1)}% across models,
            vs {(higherBenchProvider === a ? b.avgBench : a.avgBench).toFixed(1)}% from{" "}
            {higherBenchProvider === a ? b.name : a.name}.
          </p>
          {a.avgContext !== b.avgContext && (
            <p>
              <strong>Larger context:</strong>{" "}
              <span className="text-accent-light">{biggerContextProvider.name}</span> averages{" "}
              {fmtCtx(biggerContextProvider.avgContext)} context window across models.
            </p>
          )}
          <p>
            <strong>More models:</strong>{" "}
            <span className="text-accent-light">{moreModelsProvider.name}</span> offers{" "}
            {moreModelsProvider.modelCount} models
            vs {moreModelsProvider === a ? b.modelCount : a.modelCount} from{" "}
            {moreModelsProvider === a ? b.name : a.name}.
          </p>
          <p className="text-muted mt-3">
            Choose <strong>{cheaperProvider.name}</strong> if cost is your priority.
            Choose <strong>{higherBenchProvider.name}</strong> if you need the highest quality
            across your workloads.
          </p>
        </div>
      </section>

      {/* Model-level comparisons */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Model-Level Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {crossModelPairs.slice(0, 12).map(({ modelA, modelB }) => (
            <Link
              key={`${modelA.id}-${modelB.id}`}
              href={`/compare/${modelA.id}-vs-${modelB.id}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              {modelA.name} vs {modelB.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Other provider comparisons */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Other Provider Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {otherPairs.map((p) => (
            <Link
              key={`${p.slugA}-${p.slugB}`}
              href={`/compare/providers/${p.slugA}-vs-${p.slugB}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              {p.nameA} vs {p.nameB}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// --- Components ---

function ProviderCard({ stats }: { stats: ProviderStats }) {
  return (
    <div className="p-5 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-3">{stats.name}</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <MiniStat label="Models" value={String(stats.modelCount)} />
        <MiniStat
          label="Price range"
          value={`${fmtPrice(stats.minPrice)} – ${fmtPrice(stats.maxPrice)}`}
        />
        <MiniStat
          label="Avg benchmarks"
          value={stats.avgBench > 0 ? `${stats.avgBench.toFixed(1)}%` : "\u2014"}
        />
        <MiniStat label="Avg context" value={fmtCtx(stats.avgContext)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {stats.capabilities.map((cap) => (
          <span
            key={cap}
            className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted capitalize"
          >
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}

function MatchupCard({ model, isWinner }: { model: AIModel; isWinner: boolean }) {
  const bench = avgBenchmarks(model);
  return (
    <div
      className={`p-4 rounded-lg border ${
        isWinner ? "border-accent/50 bg-accent/5" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={`/models/${model.id}`}
          className="font-semibold hover:text-accent-light transition-colors"
        >
          {model.name}
        </Link>
        <span className="text-xs text-muted">{model.provider}</span>
        {isWinner && (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent text-white ml-auto">
            Winner
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-xs text-muted">Input</span>
          <p className="font-mono">{fmtPrice(model.inputPrice)}/1M</p>
        </div>
        <div>
          <span className="text-xs text-muted">Output</span>
          <p className="font-mono">{fmtPrice(model.outputPrice)}/1M</p>
        </div>
        <div>
          <span className="text-xs text-muted">Context</span>
          <p className="font-mono">{fmtCtx(model.contextWindow)}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Avg Bench</span>
          <p className="font-mono">{bench > 0 ? `${bench.toFixed(1)}%` : "\u2014"}</p>
        </div>
      </div>
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

// --- Head-to-head logic ---

interface Matchup {
  category: string;
  modelA: AIModel | null;
  modelB: AIModel | null;
  winner: "a" | "b" | "tie";
}

function getHeadToHead(a: ProviderStats, b: ProviderStats): Matchup[] {
  const categories = [...new Set([...a.categories, ...b.categories])].sort(
    (x, y) => (categoryOrder[x] ?? 99) - (categoryOrder[y] ?? 99)
  );

  return categories.map((cat) => {
    const bestA = getBestInCategory(a.models, cat);
    const bestB = getBestInCategory(b.models, cat);

    let winner: "a" | "b" | "tie" = "tie";
    if (bestA && bestB) {
      const benchA = avgBenchmarks(bestA);
      const benchB = avgBenchmarks(bestB);
      if (benchA > benchB) winner = "a";
      else if (benchB > benchA) winner = "b";
    } else if (bestA) {
      winner = "a";
    } else if (bestB) {
      winner = "b";
    }

    return { category: cat, modelA: bestA, modelB: bestB, winner };
  });
}

function getBestInCategory(providerModels: AIModel[], category: string): AIModel | null {
  const inCat = providerModels.filter((m) => m.category === category);
  if (inCat.length === 0) return null;
  return inCat.sort((x, y) => avgBenchmarks(y) - avgBenchmarks(x))[0];
}
