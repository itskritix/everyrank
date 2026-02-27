import { models, getModelById } from "@/data/models";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (let i = 0; i < models.length; i++) {
    for (let j = i + 1; j < models.length; j++) {
      params.push({ slug: `${models[i].id}-vs-${models[j].id}` });
      params.push({ slug: `${models[j].id}-vs-${models[i].id}` });
    }
  }
  return params;
}

function parseSlug(slug: string): { aId: string; bId: string } | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return { aId: match[1], bId: match[2] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};
  const a = getModelById(parsed.aId);
  const b = getModelById(parsed.bId);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} — Pricing, Benchmarks & Comparison`,
    description: `Compare ${a.name} and ${b.name} side-by-side. ${a.name}: $${a.inputPrice}/$${a.outputPrice} per 1M tokens. ${b.name}: $${b.inputPrice}/$${b.outputPrice} per 1M tokens. Which is better for your use case?`,
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();
  const a = getModelById(parsed.aId);
  const b = getModelById(parsed.bId);
  if (!a || !b) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.name} vs ${b.name}: Pricing, Benchmarks & Comparison`,
    description: `Compare ${a.name} and ${b.name} side-by-side on pricing, benchmarks, and capabilities.`,
    dateModified: new Date().toISOString(),
    publisher: { "@type": "Organization", name: "EveryRank", url: "https://everyrank.app" },
  };

  const priceDiff = {
    input: ((b.inputPrice - a.inputPrice) / a.inputPrice) * 100,
    output: ((b.outputPrice - a.outputPrice) / a.outputPrice) * 100,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/compare"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Comparisons
      </Link>

      <h1 className="text-3xl font-bold mb-2">
        {a.name} vs {b.name}
      </h1>
      <p className="text-muted mb-10">
        A detailed comparison of {a.name} ({a.provider}) and {b.name} (
        {b.provider}) across pricing, performance, and features.
      </p>

      {/* Side-by-side pricing */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pricing Comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Metric</th>
                <th className="text-right py-3 px-4 font-medium">{a.name}</th>
                <th className="text-right py-3 px-4 font-medium">{b.name}</th>
                <th className="text-right py-3 px-4 font-medium">Difference</th>
              </tr>
            </thead>
            <tbody>
              <CompRow
                label="Input / 1M tokens"
                aVal={`$${a.inputPrice.toFixed(2)}`}
                bVal={`$${b.inputPrice.toFixed(2)}`}
                aWins={a.inputPrice < b.inputPrice}
                bWins={b.inputPrice < a.inputPrice}
                diff={priceDiff.input}
              />
              <CompRow
                label="Output / 1M tokens"
                aVal={`$${a.outputPrice.toFixed(2)}`}
                bVal={`$${b.outputPrice.toFixed(2)}`}
                aWins={a.outputPrice < b.outputPrice}
                bWins={b.outputPrice < a.outputPrice}
                diff={priceDiff.output}
              />
              <CompRow
                label="Context window"
                aVal={formatContext(a.contextWindow)}
                bVal={formatContext(b.contextWindow)}
                aWins={a.contextWindow > b.contextWindow}
                bWins={b.contextWindow > a.contextWindow}
              />
              <CompRow
                label="Max output"
                aVal={formatContext(a.maxOutput)}
                bVal={formatContext(b.maxOutput)}
                aWins={a.maxOutput > b.maxOutput}
                bWins={b.maxOutput > a.maxOutput}
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* Benchmarks */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Benchmark Comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Benchmark</th>
                <th className="text-right py-3 px-4 font-medium">{a.name}</th>
                <th className="text-right py-3 px-4 font-medium">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {["mmluPro", "humanEval", "gpqa"].map((key) => {
                const aScore =
                  a.benchmarks[key as keyof typeof a.benchmarks];
                const bScore =
                  b.benchmarks[key as keyof typeof b.benchmarks];
                if (!aScore && !bScore) return null;
                const labels: Record<string, string> = {
                  mmluPro: "MMLU-Pro",
                  humanEval: "HumanEval",
                  gpqa: "GPQA",
                };
                return (
                  <tr
                    key={key}
                    className="border-b border-border hover:bg-card-hover"
                  >
                    <td className="py-3 px-4 text-muted">{labels[key]}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${
                        aScore && bScore && aScore > bScore
                          ? "text-green font-semibold"
                          : ""
                      }`}
                    >
                      {aScore ? `${aScore}%` : "—"}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${
                        aScore && bScore && bScore > aScore
                          ? "text-green font-semibold"
                          : ""
                      }`}
                    >
                      {bScore ? `${bScore}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Capability</th>
                <th className="text-center py-3 px-4 font-medium">
                  {a.name}
                </th>
                <th className="text-center py-3 px-4 font-medium">
                  {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {getAllCapabilities(a, b).map((cap) => (
                <tr
                  key={cap}
                  className="border-b border-border hover:bg-card-hover"
                >
                  <td className="py-3 px-4 capitalize">{cap}</td>
                  <td className="py-3 px-4 text-center">
                    {a.capabilities.includes(cap) ? (
                      <span className="text-green">✓</span>
                    ) : (
                      <span className="text-red">✗</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.capabilities.includes(cap) ? (
                      <span className="text-green">✓</span>
                    ) : (
                      <span className="text-red">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strengths side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-5 rounded-lg border border-border">
          <h3 className="font-semibold mb-3">{a.name} Strengths</h3>
          <ul className="space-y-2">
            {a.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-3 mt-6">{a.name} Weaknesses</h3>
          <ul className="space-y-2">
            {a.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red mt-0.5">✗</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 rounded-lg border border-border">
          <h3 className="font-semibold mb-3">{b.name} Strengths</h3>
          <ul className="space-y-2">
            {b.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-3 mt-6">{b.name} Weaknesses</h3>
          <ul className="space-y-2">
            {b.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red mt-0.5">✗</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary / Verdict */}
      <section className="mb-10 p-6 rounded-lg border border-accent/30 bg-accent/5">
        <h2 className="text-xl font-semibold mb-3">Quick Verdict</h2>
        <Verdict a={a} b={b} />
      </section>

      {/* Other comparisons */}
      <section>
        <h2 className="text-lg font-semibold mb-3">More Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {models
            .filter((m) => m.id !== a.id && m.id !== b.id)
            .slice(0, 6)
            .map((m) => (
              <Link
                key={m.id}
                href={`/compare/${a.id}-vs-${m.id}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
              >
                {a.name} vs {m.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function CompRow({
  label,
  aVal,
  bVal,
  aWins,
  bWins,
  diff,
}: {
  label: string;
  aVal: string;
  bVal: string;
  aWins: boolean;
  bWins: boolean;
  diff?: number;
}) {
  return (
    <tr className="border-b border-border hover:bg-card-hover">
      <td className="py-3 px-4 text-muted">{label}</td>
      <td
        className={`py-3 px-4 text-right font-mono ${
          aWins ? "text-green font-semibold" : ""
        }`}
      >
        {aVal}
      </td>
      <td
        className={`py-3 px-4 text-right font-mono ${
          bWins ? "text-green font-semibold" : ""
        }`}
      >
        {bVal}
      </td>
      <td className="py-3 px-4 text-right text-xs text-muted">
        {diff !== undefined && diff !== 0
          ? `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`
          : "—"}
      </td>
    </tr>
  );
}

function Verdict({
  a,
  b,
}: {
  a: (typeof models)[0];
  b: (typeof models)[0];
}) {
  const cheaper = a.inputPrice + a.outputPrice < b.inputPrice + b.outputPrice ? a : b;
  const moreExpensive = cheaper.id === a.id ? b : a;

  const aAvgBench =
    Object.values(a.benchmarks).filter(Boolean).reduce((s, v) => s + (v || 0), 0) /
    Object.values(a.benchmarks).filter(Boolean).length;
  const bAvgBench =
    Object.values(b.benchmarks).filter(Boolean).reduce((s, v) => s + (v || 0), 0) /
    Object.values(b.benchmarks).filter(Boolean).length;

  const smarter = aAvgBench > bAvgBench ? a : b;
  const biggerCtx = a.contextWindow > b.contextWindow ? a : b;

  return (
    <div className="space-y-2 text-sm">
      <p>
        <strong>Best value:</strong>{" "}
        <span className="text-green">{cheaper.name}</span> is the more
        affordable option at ${cheaper.inputPrice}/${cheaper.outputPrice} per 1M
        tokens.
      </p>
      <p>
        <strong>Higher benchmarks:</strong>{" "}
        <span className="text-accent-light">{smarter.name}</span> scores higher
        on average across available benchmarks ({smarter === a ? aAvgBench.toFixed(1) : bAvgBench.toFixed(1)}%
        avg).
      </p>
      {a.contextWindow !== b.contextWindow && (
        <p>
          <strong>Larger context:</strong>{" "}
          <span className="text-accent-light">{biggerCtx.name}</span> supports{" "}
          {formatContext(biggerCtx.contextWindow)} tokens.
        </p>
      )}
      <p className="text-muted mt-3">
        Choose <strong>{cheaper.name}</strong> if cost matters most. Choose{" "}
        <strong>{moreExpensive.name}</strong> if you need the best possible
        quality for complex tasks.
      </p>
    </div>
  );
}

function getAllCapabilities(
  a: (typeof models)[0],
  b: (typeof models)[0]
): string[] {
  const all = new Set([...a.capabilities, ...b.capabilities]);
  return Array.from(all).sort();
}

function formatContext(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}
