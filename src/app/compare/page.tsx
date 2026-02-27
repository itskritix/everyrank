import { models, getComparisonPairs } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare AI Models Side-by-Side",
  description:
    "Compare any two AI models on pricing, benchmarks, context windows, and capabilities. Find the best model for your use case.",
};

export default function ComparePage() {
  const pairs = getComparisonPairs();

  // Group by provider matchups
  const crossProvider = pairs.filter(
    (p) => p.a.provider !== p.b.provider
  );
  const sameProvider = pairs.filter(
    (p) => p.a.provider === p.b.provider
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Compare AI Models</h1>
      <p className="text-muted mb-10">
        {pairs.length} possible comparisons across {models.length} models.
        Pick any two to see a detailed side-by-side breakdown.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Cross-Provider Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {crossProvider.slice(0, 30).map(({ a, b }) => (
            <Link
              key={`${a.id}-${b.id}`}
              href={`/compare/${a.id}-vs-${b.id}`}
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all text-sm"
            >
              <span className="font-medium">{a.name}</span>
              <span className="text-muted text-xs">vs</span>
              <span className="font-medium">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Same-Provider Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {sameProvider.map(({ a, b }) => (
            <Link
              key={`${a.id}-${b.id}`}
              href={`/compare/${a.id}-vs-${b.id}`}
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all text-sm"
            >
              <span className="font-medium">{a.name}</span>
              <span className="text-muted text-xs">vs</span>
              <span className="font-medium">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
