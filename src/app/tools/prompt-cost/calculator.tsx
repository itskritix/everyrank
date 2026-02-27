"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { models } from "@/data/models";

function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

export default function PromptCostCalculator() {
  const [text, setText] = useState("");
  const [outputTokens, setOutputTokens] = useState(500);

  const charCount = text.length;
  const estimatedTokens = Math.ceil(charCount / 4);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const results = useMemo(() => {
    return [...models]
      .map((model) => {
        const inputCost = (model.inputPrice * estimatedTokens) / 1_000_000;
        const outputCost = (model.outputPrice * outputTokens) / 1_000_000;
        return { model, inputCost, outputCost, totalCost: inputCost + outputCost };
      })
      .sort((a, b) => a.totalCost - b.totalCost);
  }, [estimatedTokens, outputTokens]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        &larr; All Tools
      </Link>

      <h1 className="text-3xl font-bold mb-2">Prompt Cost Calculator</h1>
      <p className="text-muted mb-8 max-w-2xl">
        Paste your prompt and see what it costs across every AI model. Real pricing data, sorted cheapest first.
      </p>

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your prompt text here..."
        rows={6}
        className="w-full rounded-lg border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 resize-y min-h-[120px]"
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mt-4 mb-6">
        <div className="p-3 rounded-lg bg-card border border-border flex-1 min-w-[140px]">
          <p className="text-xs text-muted">Characters</p>
          <p className="text-lg font-mono font-semibold">{charCount.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border flex-1 min-w-[140px]">
          <p className="text-xs text-muted">Words</p>
          <p className="text-lg font-mono font-semibold">{wordCount.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border flex-1 min-w-[140px]">
          <p className="text-xs text-muted">Estimated Tokens</p>
          <p className="text-lg font-mono font-semibold">{estimatedTokens.toLocaleString()}</p>
        </div>
      </div>

      {/* Output token slider */}
      <div className="mb-8 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Expected Output Tokens</label>
          <span className="text-sm font-mono font-semibold">{outputTokens.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={100}
          max={4000}
          step={100}
          value={outputTokens}
          onChange={(e) => setOutputTokens(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>100</span>
          <span>4,000</span>
        </div>
      </div>

      {/* Results table */}
      {estimatedTokens > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Cost Breakdown ({estimatedTokens.toLocaleString()} input + {outputTokens.toLocaleString()} output tokens)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-muted">
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Model</th>
                  <th className="text-left py-3 px-4 font-medium">Provider</th>
                  <th className="text-right py-3 px-4 font-medium">Input Cost</th>
                  <th className="text-right py-3 px-4 font-medium">Output Cost</th>
                  <th className="text-right py-3 px-4 font-medium">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={r.model.id}
                    className={`border-b border-border hover:bg-card-hover ${
                      i < 3 ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-muted">{i + 1}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/models/${r.model.id}`}
                        className="text-accent-light hover:underline font-medium"
                      >
                        {r.model.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted">{r.model.provider}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {formatCost(r.inputCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {formatCost(r.outputCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {formatCost(r.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-xs text-muted mt-6">
        Token count is approximate (~4 characters per token for English text). Actual tokenization varies by model.
        Prices are standard API rates; cached tokens, batch pricing, and long-context tiers may differ.
      </p>
    </div>
  );
}
