import { models, getModelById } from "@/data/models";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return models.map((model) => ({ id: model.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = getModelById(id);
  if (!model) return {};
  return {
    title: `${model.name} — Pricing, Benchmarks & Review`,
    description: `${model.name} by ${model.provider}: $${model.inputPrice}/$${model.outputPrice} per 1M tokens, ${formatContext(model.contextWindow)} context. ${model.description}`,
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModelById(id);
  if (!model) notFound();

  const others = models.filter(
    (m) => m.id !== model.id && m.category === model.category
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/models"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Models
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-muted mb-1">{model.provider}</p>
          <h1 className="text-3xl font-bold">{model.name}</h1>
          <p className="text-muted mt-2 max-w-2xl">{model.description}</p>
        </div>
        <span className="text-xs capitalize px-2 py-1 rounded bg-card border border-border text-muted">
          {model.category}
        </span>
      </div>

      {/* Key specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Input price" value={`$${model.inputPrice}/1M`} />
        <Stat label="Output price" value={`$${model.outputPrice}/1M`} />
        <Stat label="Context window" value={formatContext(model.contextWindow)} />
        <Stat label="Max output" value={formatContext(model.maxOutput)} />
      </div>

      {/* Capabilities */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Capabilities</h2>
        <div className="flex flex-wrap gap-2">
          {model.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-sm px-3 py-1 rounded-full bg-accent/10 text-accent-light border border-accent/20"
            >
              {cap}
            </span>
          ))}
        </div>
      </section>

      {/* Benchmarks */}
      {model.benchmarks && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Benchmarks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {model.benchmarks.mmluPro && (
              <BenchmarkCard
                name="MMLU-Pro"
                score={model.benchmarks.mmluPro}
                max={100}
              />
            )}
            {model.benchmarks.humanEval && (
              <BenchmarkCard
                name="HumanEval"
                score={model.benchmarks.humanEval}
                max={100}
              />
            )}
            {model.benchmarks.gpqa && (
              <BenchmarkCard
                name="GPQA"
                score={model.benchmarks.gpqa}
                max={100}
              />
            )}
          </div>
        </section>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <section>
          <h2 className="text-lg font-semibold mb-3">Strengths</h2>
          <ul className="space-y-2">
            {model.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3">Weaknesses</h2>
          <ul className="space-y-2">
            {model.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red mt-0.5">✗</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Compare with similar */}
      {others.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            Compare with similar models
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/compare/${model.id}-vs-${other.id}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:bg-card-hover transition-all"
              >
                {model.name} vs {other.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-lg font-mono font-semibold">{value}</p>
    </div>
  );
}

function BenchmarkCard({
  name,
  score,
  max,
}: {
  name: string;
  score: number;
  max: number;
}) {
  const pct = (score / max) * 100;
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">{name}</span>
        <span className="text-sm font-mono font-semibold">{score}%</span>
      </div>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-light rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatContext(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}
