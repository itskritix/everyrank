import { models } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI API Monthly Cost Estimator — Calculate Your Monthly Spend",
  description:
    "Estimate your monthly AI API costs. See what different usage levels cost across all models. Plan your budget with real pricing data.",
};

export default function APICostEstimator() {
  const sorted = [...models].sort(
    (a, b) => a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice)
  );

  // Usage tiers (daily requests × avg tokens per request)
  const tiers = [
    {
      name: "Solo Developer",
      desc: "Personal projects, learning, prototyping",
      dailyRequests: 50,
      avgInputTokens: 3000,
      avgOutputTokens: 1500,
    },
    {
      name: "Small App",
      desc: "Early-stage product with ~100 daily users",
      dailyRequests: 500,
      avgInputTokens: 4000,
      avgOutputTokens: 2000,
    },
    {
      name: "Growing Startup",
      desc: "Production app with ~1,000 daily active users",
      dailyRequests: 5000,
      avgInputTokens: 5000,
      avgOutputTokens: 2000,
    },
    {
      name: "Scale-up",
      desc: "High-traffic product with 10K+ daily users",
      dailyRequests: 50000,
      avgInputTokens: 4000,
      avgOutputTokens: 1500,
    },
    {
      name: "Enterprise / Heavy Agent",
      desc: "Agentic workflows, high-volume processing",
      dailyRequests: 200000,
      avgInputTokens: 8000,
      avgOutputTokens: 4000,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Tools
      </Link>

      <h1 className="text-3xl font-bold mb-2">Monthly API Cost Estimator</h1>
      <p className="text-muted mb-10">
        Estimate your monthly AI API spend based on real usage patterns. All prices in USD.
      </p>

      {tiers.map((tier) => {
        const monthlyInputTokens =
          tier.dailyRequests * tier.avgInputTokens * 30;
        const monthlyOutputTokens =
          tier.dailyRequests * tier.avgOutputTokens * 30;

        const costs = sorted.map((model) => ({
          model,
          monthly:
            (model.inputPrice * monthlyInputTokens) / 1000000 +
            (model.outputPrice * monthlyOutputTokens) / 1000000,
        }));

        return (
          <section key={tier.name} className="mb-10">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <p className="text-sm text-muted">
                {tier.desc} — {tier.dailyRequests.toLocaleString()} requests/day,{" "}
                ~{tier.avgInputTokens.toLocaleString()} input + {tier.avgOutputTokens.toLocaleString()} output tokens each
              </p>
              <p className="text-xs text-muted mt-1">
                Monthly: {(monthlyInputTokens / 1000000).toFixed(1)}M input tokens + {(monthlyOutputTokens / 1000000).toFixed(1)}M output tokens
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-muted">
                    <th className="text-left py-2.5 px-4 font-medium">Model</th>
                    <th className="text-right py-2.5 px-4 font-medium">Monthly Cost</th>
                    <th className="text-right py-2.5 px-4 font-medium">Per Request</th>
                    <th className="text-right py-2.5 px-4 font-medium">Daily</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map(({ model, monthly }) => {
                    const perRequest = monthly / (tier.dailyRequests * 30);
                    const daily = monthly / 30;

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
                          <span className="text-xs text-muted ml-2">
                            {model.provider}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold">
                          {fmtCost(monthly)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-muted">
                          {fmtSmallCost(perRequest)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-muted">
                          {fmtCost(daily)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <div className="mt-6 p-4 rounded-lg border border-border bg-card text-sm text-muted">
        <p className="font-semibold text-foreground mb-1">About these estimates</p>
        <p>
          Costs are based on standard API pricing. Actual costs may be lower with cached tokens,
          batch APIs, or volume discounts. Reasoning model costs may be higher due to internal
          thinking tokens that count toward output. Long-context pricing tiers not included.
        </p>
      </div>
    </div>
  );
}

function fmtCost(cost: number): string {
  if (cost >= 1000) return `$${(cost / 1000).toFixed(1)}K`;
  if (cost >= 1) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(3)}`;
}

function fmtSmallCost(cost: number): string {
  if (cost < 0.0001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}
