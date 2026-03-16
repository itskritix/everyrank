import Table from "cli-table3";
import chalk from "chalk";

export type OutputFormat = "table" | "json" | "csv";

export interface KeywordResult {
  keyword: string;
  popularity: number;
  trend?: string;
  relatedQueries?: string[];
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
      chalk.cyan("Related Queries"),
    ],
    colWidths: [25, 18, 14, 40],
    wordWrap: true,
  });

  for (const item of data) {
    const trendLabel =
      item.trend === "rising"
        ? chalk.green("^ rising")
        : item.trend === "declining"
          ? chalk.red("v declining")
          : chalk.yellow("~ stable");

    table.push([
      item.keyword,
      colorInterest(item.popularity),
      trendLabel,
      item.relatedQueries?.join(", ") || "-",
    ]);
  }

  return table.toString();
}

function formatCsv(data: KeywordResult[]): string {
  const header = "keyword,interest,trend,related_queries";
  const rows = data.map(
    (item) =>
      `"${item.keyword}",${item.popularity},"${item.trend || ""}","${(item.relatedQueries || []).join("; ")}"`
  );
  return [header, ...rows].join("\n");
}

function colorInterest(score: number): string {
  if (score >= 60) return chalk.green(String(score));
  if (score >= 30) return chalk.yellow(String(score));
  return chalk.red(String(score));
}
