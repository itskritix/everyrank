import { models } from "@/data/models";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Context Window Comparison — How Many Words Fit?",
  description:
    "Compare context windows of every AI model. See how many words, pages, and books each model can process. Visual comparison of GPT-5, Claude, Gemini, and more.",
};

// Rough token-to-text conversions
const TOKENS_PER_WORD = 1.3;
const WORDS_PER_PAGE = 300;
const PAGES_PER_BOOK = 250;

export default function ContextWindowPage() {
  const byContext = [...models].sort(
    (a, b) => b.contextWindow - a.contextWindow
  );
  const maxCtx = byContext[0].contextWindow;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground mb-6 inline-block"
      >
        ← All Tools
      </Link>

      <h1 className="text-3xl font-bold mb-2">Context Window Comparison</h1>
      <p className="text-muted mb-10">
        How much text can each AI model process at once? Context windows compared visually with real-world equivalents.
      </p>

      {/* Quick reference */}
      <section className="mb-10 p-5 rounded-lg border border-border bg-card">
        <h2 className="text-sm font-semibold mb-3 text-muted">Quick Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted">1K tokens ≈</p>
            <p className="font-semibold">750 words</p>
          </div>
          <div>
            <p className="text-muted">1 page ≈</p>
            <p className="font-semibold">400 tokens</p>
          </div>
          <div>
            <p className="text-muted">1 book ≈</p>
            <p className="font-semibold">100K tokens</p>
          </div>
          <div>
            <p className="text-muted">1M tokens ≈</p>
            <p className="font-semibold">10 books</p>
          </div>
        </div>
      </section>

      {/* Visual bars */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Visual Comparison</h2>
        <div className="space-y-3">
          {byContext.map((model) => {
            const pct = (model.contextWindow / maxCtx) * 100;
            const words = Math.round(model.contextWindow / TOKENS_PER_WORD);
            const pages = Math.round(words / WORDS_PER_PAGE);
            const books = (pages / PAGES_PER_BOOK).toFixed(1);

            return (
              <div key={model.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/models/${model.id}`}
                    className="text-sm font-medium hover:text-accent-light transition-colors"
                  >
                    {model.name}
                    <span className="text-xs text-muted ml-2">{model.provider}</span>
                  </Link>
                  <span className="text-sm font-mono text-muted">
                    {fmtCtx(model.contextWindow)}
                  </span>
                </div>
                <div className="w-full h-6 bg-card rounded border border-border overflow-hidden">
                  <div
                    className="h-full bg-accent/30 rounded flex items-center px-2 group-hover:bg-accent/50 transition-colors"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    <span className="text-xs text-muted truncate">
                      ~{words.toLocaleString()} words · {pages.toLocaleString()} pages · {books} books
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full table */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Detailed Breakdown</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-muted">
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-right py-3 px-4 font-medium">Context</th>
                <th className="text-right py-3 px-4 font-medium">Max Output</th>
                <th className="text-right py-3 px-4 font-medium">~Words</th>
                <th className="text-right py-3 px-4 font-medium">~Pages</th>
                <th className="text-right py-3 px-4 font-medium">~Books</th>
                <th className="text-right py-3 px-4 font-medium">Input $/1M</th>
              </tr>
            </thead>
            <tbody>
              {byContext.map((model) => {
                const words = Math.round(model.contextWindow / TOKENS_PER_WORD);
                const pages = Math.round(words / WORDS_PER_PAGE);
                const books = (pages / PAGES_PER_BOOK).toFixed(1);

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
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {fmtCtx(model.contextWindow)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {fmtCtx(model.maxOutput)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {words.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {pages.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
                      {books}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${model.inputPrice.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted">
        Word counts are approximate (1 token ≈ 0.75 words for English text). Actual token counts
        vary by language, formatting, and content type. Code typically has more tokens per word than prose.
      </p>
    </div>
  );
}

function fmtCtx(tokens: number): string {
  if (tokens >= 1000000) return `${Math.round(tokens / 1000000 * 10) / 10}M`;
  return `${Math.round(tokens / 1000)}K`;
}
