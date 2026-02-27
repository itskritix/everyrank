import { models } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Model Pricing — Compare Costs Per Million Tokens",
  description:
    "Complete AI model pricing comparison. Input and output costs per million tokens for GPT-5, Claude, Gemini, Llama, DeepSeek, and Grok models.",
};

export default function PricingPage() {
  const byInput = [...models].sort((a, b) => a.inputPrice - b.inputPrice);
  const byOutput = [...models].sort((a, b) => a.outputPrice - b.outputPrice);
  const byCombined = [...models].sort(
    (a, b) => a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">AI Model Pricing</h1>
      <p className="text-muted mb-10">
        All prices in USD per million tokens. Sorted by combined cost (input +
        output) by default.
      </p>

      {/* Cost calculator */}
      <section className="mb-12 p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Quick Cost Estimate</h2>
        <p className="text-sm text-muted mb-4">
          For 1 million input tokens and 100K output tokens (typical API usage):
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-right py-3 px-4 font-medium">
                  Input cost
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  Output cost
                </th>
                <th className="text-right py-3 px-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {byCombined.map((model) => {
                const inputCost = model.inputPrice * 1;
                const outputCost = model.outputPrice * 0.1;
                const total = inputCost + outputCost;
                return (
                  <tr
                    key={model.id}
                    className="border-b border-border hover:bg-card-hover"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/models/${model.id}`}
                        className="text-accent-light hover:underline font-medium"
                      >
                        {model.name}
                      </Link>
                      <span className="text-xs text-muted ml-2">
                        {model.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${inputCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${outputCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Full pricing table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Full Pricing Table (sorted by input cost)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-left py-3 px-4 font-medium">Provider</th>
                <th className="text-right py-3 px-4 font-medium">
                  Input / 1M
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  Output / 1M
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  Context
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  Max Output
                </th>
                <th className="text-center py-3 px-4 font-medium">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              {byInput.map((model) => (
                <tr
                  key={model.id}
                  className="border-b border-border hover:bg-card-hover"
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
                    {formatCtx(model.contextWindow)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted">
                    {formatCtx(model.maxOutput)}
                  </td>
                  <td className="py-3 px-4 text-center text-xs capitalize text-muted">
                    {model.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatCtx(tokens: number): string {
  if (tokens >= 1000000) return `${tokens / 1000000}M`;
  return `${tokens / 1000}K`;
}
