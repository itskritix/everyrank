import { models } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Token Cost Calculator — Calculate API Costs Per Model",
  description:
    "Calculate the exact cost of AI API calls. Enter your token count and see pricing across all models instantly. Free token cost calculator.",
};

export default function TokenCalculator() {
  const sorted = [...models].sort(
    (a, b) => a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice)
  );

  // Pre-calculated common scenarios
  const scenarios = [
    { name: "Small query", input: 1000, output: 500, desc: "Simple question + answer" },
    { name: "Document analysis", input: 50000, output: 2000, desc: "Analyzing a 20-page doc" },
    { name: "Code generation", input: 5000, output: 10000, desc: "Complex code task" },
    { name: "Long conversation", input: 100000, output: 5000, desc: "Extended chat session" },
    { name: "Full context load", input: 1000000, output: 10000, desc: "1M context + response" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Tools
      </Link>

      <h1 className="text-3xl font-bold mb-2">Token Cost Calculator</h1>
      <p className="text-muted mb-10">
        See exactly what AI API calls cost across every model. Prices per million tokens.
      </p>

      {/* Common scenarios */}
      {scenarios.map((scenario) => (
        <section key={scenario.name} className="mb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-lg font-semibold">{scenario.name}</h2>
            <span className="text-sm text-muted">
              {scenario.input.toLocaleString()} input + {scenario.output.toLocaleString()} output tokens
            </span>
            <span className="text-xs text-muted">({scenario.desc})</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-muted">
                  <th className="text-left py-2.5 px-4 font-medium">Model</th>
                  <th className="text-right py-2.5 px-4 font-medium">Input cost</th>
                  <th className="text-right py-2.5 px-4 font-medium">Output cost</th>
                  <th className="text-right py-2.5 px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((model) => {
                  const inputCost = (model.inputPrice * scenario.input) / 1000000;
                  const outputCost = (model.outputPrice * scenario.output) / 1000000;
                  const total = inputCost + outputCost;
                  return (
                    <tr
                      key={model.id}
                      className="border-b border-border hover:bg-card-hover"
                    >
                      <td className="py-2.5 px-4">
                        <Link
                          href={`/models/${model.id}`}
                          className="text-accent-light hover:underline"
                        >
                          {model.name}
                        </Link>
                        <span className="text-xs text-muted ml-2">{model.provider}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-muted">
                        {formatCost(inputCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-muted">
                        {formatCost(outputCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold">
                        {formatCost(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="text-xs text-muted mt-6">
        Prices based on standard API rates. Cached tokens, batch pricing, and volume discounts may reduce actual costs.
        Long-context pricing tiers not included in these estimates.
      </p>
    </div>
  );
}

function formatCost(cost: number): string {
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
