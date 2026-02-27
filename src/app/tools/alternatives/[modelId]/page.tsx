import { models, getModelById, type AIModel } from "@/data/models";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return models.map((m) => ({ modelId: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelId: string }>;
}): Promise<Metadata> {
  const { modelId } = await params;
  const model = getModelById(modelId);
  if (!model) return {};
  return {
    title: `Best ${model.name} Alternatives (2026) — Cheaper & Better Options`,
    description: `Looking for ${model.name} alternatives? Compare ${models.length - 1} AI models by price, benchmarks, and capabilities. Find cheaper or more capable options.`,
  };
}

// --- Scoring ---

function capabilityOverlap(a: AIModel, b: AIModel): number {
  const setA = new Set(a.capabilities);
  const shared = b.capabilities.filter((c) => setA.has(c)).length;
  const union = new Set([...a.capabilities, ...b.capabilities]).size;
  return union > 0 ? shared / union : 0;
}

function scoreAlternative(source: AIModel, alt: AIModel): number {
  if (alt.id === source.id) return -1;

  let score = 0;

  // Capability overlap (0-30)
  score += capabilityOverlap(source, alt) * 30;

  // Same category bonus (0-15)
  if (alt.category === source.category) score += 15;

  // Price similarity — within 3x is good, within 10x is ok (0-20)
  const sourcePrice = source.inputPrice + source.outputPrice;
  const altPrice = alt.inputPrice + alt.outputPrice;
  const ratio = sourcePrice > 0 && altPrice > 0
    ? Math.max(sourcePrice, altPrice) / Math.min(sourcePrice, altPrice)
    : 10;
  if (ratio <= 3) score += 20;
  else if (ratio <= 10) score += 10;

  // Cheaper bonus (0-10)
  if (altPrice < sourcePrice) score += 10;

  // Benchmark similarity or better (0-25)
  const sourceBench = avgBenchmark(source);
  const altBench = avgBenchmark(alt);
  if (sourceBench > 0 && altBench > 0) {
    const diff = altBench - sourceBench;
    if (diff >= 0) score += 25; // better or equal
    else if (diff >= -5) score += 18; // slightly worse
    else if (diff >= -15) score += 10; // moderately worse
  }

  return score;
}

function avgBenchmark(m: AIModel): number {
  const vals = Object.values(m.benchmarks).filter(Boolean) as number[];
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function fmtCtx(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}

function priceDiff(source: number, alt: number): { label: string; className: string } {
  if (alt < source) {
    const pct = Math.round(((source - alt) / source) * 100);
    return { label: `${pct}% cheaper`, className: "text-green" };
  }
  if (alt > source) {
    const pct = Math.round(((alt - source) / source) * 100);
    return { label: `${pct}% more`, className: "text-red-400" };
  }
  return { label: "Same price", className: "text-muted" };
}

function benchDiff(source: number | undefined, alt: number | undefined): { label: string; className: string } {
  if (!source || !alt) return { label: "—", className: "text-muted" };
  const diff = alt - source;
  if (diff > 0) return { label: `+${diff.toFixed(1)}%`, className: "text-green" };
  if (diff < 0) return { label: `${diff.toFixed(1)}%`, className: "text-red-400" };
  return { label: "Same", className: "text-muted" };
}

function whyGoodAlternative(source: AIModel, alt: AIModel): string {
  const reasons: string[] = [];
  const sourcePrice = source.inputPrice + source.outputPrice;
  const altPrice = alt.inputPrice + alt.outputPrice;

  if (altPrice < sourcePrice * 0.5) {
    reasons.push(`dramatically cheaper (${Math.round((1 - altPrice / sourcePrice) * 100)}% less)`);
  } else if (altPrice < sourcePrice) {
    reasons.push(`${Math.round((1 - altPrice / sourcePrice) * 100)}% cheaper`);
  }

  const sourceBench = avgBenchmark(source);
  const altBench = avgBenchmark(alt);
  if (altBench > sourceBench + 2) {
    reasons.push("higher benchmark scores");
  } else if (altBench >= sourceBench - 2) {
    reasons.push("comparable performance");
  }

  if (alt.contextWindow > source.contextWindow * 2) {
    reasons.push(`${fmtCtx(alt.contextWindow)} context (${Math.round(alt.contextWindow / source.contextWindow)}x more)`);
  }

  if (alt.maxOutput > source.maxOutput * 2) {
    reasons.push(`${fmtCtx(alt.maxOutput)} max output`);
  }

  const extraCaps = alt.capabilities.filter((c) => !source.capabilities.includes(c));
  if (extraCaps.length > 0) {
    reasons.push(`adds ${extraCaps.join(", ")}`);
  }

  if (alt.category === "open-source") {
    reasons.push("open-source and self-hostable");
  }

  if (reasons.length === 0) {
    if (alt.category === source.category) reasons.push("same category, different trade-offs");
    else reasons.push(`${alt.category} tier option`);
  }

  const sentence = reasons.slice(0, 3).join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

const categoryLabels: Record<AIModel["category"], string> = {
  flagship: "Flagship",
  mid: "Mid-Tier",
  budget: "Budget",
  reasoning: "Reasoning",
  "open-source": "Open Source",
};

// --- Page ---

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  const model = getModelById(modelId);
  if (!model) notFound();

  const sourcePrice = model.inputPrice + model.outputPrice;

  const alternatives = models
    .map((alt) => ({ model: alt, score: scoreAlternative(model, alt) }))
    .filter((a) => a.score >= 0)
    .sort((a, b) => b.score - a.score);

  const topAlternatives = alternatives.slice(0, 8);
  const popularModels = models.filter((m) => m.id !== model.id).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Best ${model.name} Alternatives in 2026`,
    description: `Comparing ${alternatives.length} AI models as alternatives to ${model.name}. Find cheaper or more capable options.`,
    dateModified: new Date().toISOString(),
    publisher: { "@type": "Organization", name: "EveryRank", url: "https://everyrank.app" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        &larr; All Tools
      </Link>

      {/* Hero */}
      <h1 className="text-3xl font-bold mb-3">
        Best {model.name} Alternatives
      </h1>
      <p className="text-muted mb-8 max-w-2xl">
        {model.name} by {model.provider} is a {categoryLabels[model.category].toLowerCase()} model
        priced at ${model.inputPrice}/{model.outputPrice} per 1M tokens (in/out).
        {sourcePrice > 10
          ? " It's on the expensive side — there are cheaper options with similar quality."
          : sourcePrice > 3
          ? " Looking for a better deal or different capabilities? Here are the best options."
          : " It's already affordable, but you might want different strengths or features."}
      </p>

      {/* Source model quick stats */}
      <div className="mb-10 p-5 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold">{model.name}</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-light">
            {model.provider}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted">
            {categoryLabels[model.category]}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Input" value={`$${model.inputPrice}/1M`} />
          <MiniStat label="Output" value={`$${model.outputPrice}/1M`} />
          <MiniStat label="Context" value={fmtCtx(model.contextWindow)} />
          <MiniStat label="Max Output" value={fmtCtx(model.maxOutput)} />
        </div>
      </div>

      {/* Why switch */}
      {model.weaknesses.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Why Switch from {model.name}?
          </h2>
          <div className="space-y-2">
            {model.weaknesses.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                <span className="text-sm">{w}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top alternatives */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Top Alternatives</h2>
        <div className="space-y-4">
          {topAlternatives.map(({ model: alt }, i) => {
            const altPrice = alt.inputPrice + alt.outputPrice;
            const inputDiff = priceDiff(model.inputPrice, alt.inputPrice);
            const outputDiff = priceDiff(model.outputPrice, alt.outputPrice);
            const reason = whyGoodAlternative(model, alt);

            return (
              <div
                key={alt.id}
                className={`p-5 rounded-lg border ${
                  i === 0
                    ? "border-accent/50 bg-accent/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          i === 0
                            ? "bg-accent text-white"
                            : "bg-card text-muted border border-border"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <Link
                        href={`/models/${alt.id}`}
                        className="text-lg font-semibold hover:text-accent-light transition-colors"
                      >
                        {alt.name}
                      </Link>
                      <span className="text-sm text-muted">{alt.provider}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted">
                        {categoryLabels[alt.category]}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-2">{reason}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted">Input</p>
                    <p className="text-sm font-mono font-semibold">
                      ${alt.inputPrice}/1M
                    </p>
                    <p className={`text-xs ${inputDiff.className}`}>
                      {inputDiff.label}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted">Output</p>
                    <p className="text-sm font-mono font-semibold">
                      ${alt.outputPrice}/1M
                    </p>
                    <p className={`text-xs ${outputDiff.className}`}>
                      {outputDiff.label}
                    </p>
                  </div>
                  <MiniStat label="Context" value={fmtCtx(alt.contextWindow)} />
                  <MiniStat label="Max Output" value={fmtCtx(alt.maxOutput)} />
                </div>

                {/* Benchmarks comparison */}
                <div className="flex flex-wrap gap-4 text-xs text-muted">
                  {model.benchmarks.mmluPro && (
                    <span>
                      MMLU-Pro:{" "}
                      <span className="font-mono text-foreground">
                        {alt.benchmarks.mmluPro ? `${alt.benchmarks.mmluPro}%` : "—"}
                      </span>
                      {alt.benchmarks.mmluPro && (
                        <span className={`ml-1 ${benchDiff(model.benchmarks.mmluPro, alt.benchmarks.mmluPro).className}`}>
                          ({benchDiff(model.benchmarks.mmluPro, alt.benchmarks.mmluPro).label})
                        </span>
                      )}
                    </span>
                  )}
                  {model.benchmarks.humanEval && (
                    <span>
                      HumanEval:{" "}
                      <span className="font-mono text-foreground">
                        {alt.benchmarks.humanEval ? `${alt.benchmarks.humanEval}%` : "—"}
                      </span>
                      {alt.benchmarks.humanEval && (
                        <span className={`ml-1 ${benchDiff(model.benchmarks.humanEval, alt.benchmarks.humanEval).className}`}>
                          ({benchDiff(model.benchmarks.humanEval, alt.benchmarks.humanEval).label})
                        </span>
                      )}
                    </span>
                  )}
                  {model.benchmarks.gpqa && (
                    <span>
                      GPQA:{" "}
                      <span className="font-mono text-foreground">
                        {alt.benchmarks.gpqa ? `${alt.benchmarks.gpqa}%` : "—"}
                      </span>
                      {alt.benchmarks.gpqa && (
                        <span className={`ml-1 ${benchDiff(model.benchmarks.gpqa, alt.benchmarks.gpqa).className}`}>
                          ({benchDiff(model.benchmarks.gpqa, alt.benchmarks.gpqa).label})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Compare link */}
                <div className="mt-3">
                  <Link
                    href={`/compare/${model.id}-vs-${alt.id}`}
                    className="text-xs text-accent-light hover:underline"
                  >
                    Full comparison: {model.name} vs {alt.name} &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full comparison table */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Full Comparison Table</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-right py-3 px-4 font-medium">Input $/1M</th>
                <th className="text-right py-3 px-4 font-medium">Output $/1M</th>
                <th className="text-right py-3 px-4 font-medium">Context</th>
                <th className="text-right py-3 px-4 font-medium">MMLU-Pro</th>
                <th className="text-right py-3 px-4 font-medium">HumanEval</th>
                <th className="text-center py-3 px-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((item, i) => {
                const inputD = priceDiff(model.inputPrice, item.model.inputPrice);
                const outputD = priceDiff(model.outputPrice, item.model.outputPrice);
                return (
                  <tr
                    key={item.model.id}
                    className={`border-b border-border hover:bg-card-hover ${
                      i < 3 ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/models/${item.model.id}`}
                        className="text-accent-light hover:underline font-medium"
                      >
                        {item.model.name}
                      </Link>
                      <span className="text-xs text-muted ml-2">
                        {item.model.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono">
                        ${item.model.inputPrice.toFixed(2)}
                      </span>
                      <span className={`block text-xs ${inputD.className}`}>
                        {inputD.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono">
                        ${item.model.outputPrice.toFixed(2)}
                      </span>
                      <span className={`block text-xs ${outputD.className}`}>
                        {outputD.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {fmtCtx(item.model.contextWindow)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {item.model.benchmarks.mmluPro ? (
                        <span>
                          {item.model.benchmarks.mmluPro}%
                          <span className={`block text-xs ${benchDiff(model.benchmarks.mmluPro, item.model.benchmarks.mmluPro).className}`}>
                            {benchDiff(model.benchmarks.mmluPro, item.model.benchmarks.mmluPro).label}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {item.model.benchmarks.humanEval ? (
                        <span>
                          {item.model.benchmarks.humanEval}%
                          <span className={`block text-xs ${benchDiff(model.benchmarks.humanEval, item.model.benchmarks.humanEval).className}`}>
                            {benchDiff(model.benchmarks.humanEval, item.model.benchmarks.humanEval).label}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {item.score.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Head-to-head compare links */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Head-to-Head Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {topAlternatives.slice(0, 6).map(({ model: alt }) => (
            <Link
              key={alt.id}
              href={`/compare/${model.id}-vs-${alt.id}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              {model.name} vs {alt.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Other alternatives pages */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Alternatives for Other Models
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularModels.map((m) => (
            <Link
              key={m.id}
              href={`/tools/alternatives/${m.id}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
            >
              {m.name} Alternatives
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
