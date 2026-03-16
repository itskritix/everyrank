import Table from "cli-table3";
import chalk from "chalk";

export type OutputFormat = "table" | "json" | "csv";

export interface RelatedQuery {
  query: string;
  interest: number;
  type: "top" | "rising";
}

export interface KeywordResult {
  keyword: string;
  popularity: number;
  trend?: string;
  relatedQueries?: RelatedQuery[];
}

export function formatOutput(
  data: KeywordResult[],
  format: OutputFormat = "table"
): string {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "csv":
      return formatCsv(data);
    case "table":
    default:
      return formatTable(data);
  }
}

function formatTable(data: KeywordResult[]): string {
  if (data.length === 0) {
    return chalk.yellow("No results found.");
  }

  const table = new Table({
    head: [
      chalk.cyan("Keyword"),
      chalk.cyan("Interest (0-100)"),
      chalk.cyan("Trend"),
      chalk.cyan("Top Related"),
      chalk.cyan("Rising Related"),
    ],
    colWidths: [22, 18, 14, 30, 30],
    wordWrap: true,
  });

  for (const item of data) {
    const trendLabel =
      item.trend === "rising"
        ? chalk.green("^ rising")
        : item.trend === "declining"
          ? chalk.red("v declining")
          : chalk.yellow("~ stable");

    const topQueries = (item.relatedQueries || [])
      .filter((r) => r.type === "top")
      .map((r) => `${r.query} (${colorInterest(r.interest)})`)
      .join("\n") || "-";

    const risingQueries = (item.relatedQueries || [])
      .filter((r) => r.type === "rising")
      .map((r) => `${r.query} (+${r.interest}%)`)
      .join("\n") || "-";

    table.push([
      item.keyword,
      colorInterest(item.popularity),
      trendLabel,
      topQueries,
      risingQueries,
    ]);
  }

  return table.toString();
}

function formatCsv(data: KeywordResult[]): string {
  const header = "keyword,interest,trend,related_query,related_score,related_type";
  const rows: string[] = [];
  for (const item of data) {
    if (item.relatedQueries && item.relatedQueries.length > 0) {
      for (const rq of item.relatedQueries) {
        rows.push(
          `"${item.keyword}",${item.popularity},"${item.trend || ""}","${rq.query}",${rq.interest},"${rq.type}"`
        );
      }
    } else {
      rows.push(
        `"${item.keyword}",${item.popularity},"${item.trend || ""}","","",""`
      );
    }
  }
  return [header, ...rows].join("\n");
}

function colorInterest(score: number): string {
  if (score >= 60) return chalk.green(String(score));
  if (score >= 30) return chalk.yellow(String(score));
  return chalk.red(String(score));
}
