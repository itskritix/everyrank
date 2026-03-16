import { Command } from "commander";
import chalk from "chalk";
import { getGoogleTrendsData } from "../services/google-trends";
import { formatOutput, OutputFormat } from "../utils/output";

const TIME_RANGES: Record<string, string> = {
  "1h": "now 1-H",
  "4h": "now 4-H",
  "1d": "now 1-d",
  "7d": "now 7-d",
  "1m": "today 1-m",
  "3m": "today 3-m",
  "12m": "today 12-m",
  "5y": "today 5-y",
};

export function registerTrendsCommand(program: Command): void {
  program
    .command("trends")
    .description(
      "Research keyword popularity & trends using Google Trends (free, no API key)"
    )
    .argument(
      "<keywords...>",
      "One or more keywords to research (max 5, comma or space separated)"
    )
    .option(
      "-g, --geo <code>",
      "Country/region code (e.g., US, GB, IN)",
      "US"
    )
    .option(
      "-t, --time <range>",
      "Time range: 1h, 4h, 1d, 7d, 1m, 3m, 12m, 5y",
      "12m"
    )
    .option(
      "-f, --format <format>",
      "Output format: table, json, csv",
      "table"
    )
    .action(async (keywords: string[], options) => {
      const allKeywords = keywords
        .flatMap((k) => k.split(",").map((s) => s.trim()))
        .filter(Boolean)
        .slice(0, 5);

      if (allKeywords.length === 0) {
        console.error(chalk.red("Please provide at least one keyword."));
        process.exit(1);
      }

      const timeRange = TIME_RANGES[options.time] || options.time;

      console.log(
        chalk.gray(
          `Fetching Google Trends data for: ${allKeywords.join(", ")}...`
        )
      );

      try {
        const results = await getGoogleTrendsData(
          allKeywords,
          options.geo,
          timeRange
        );

        if (results.length === 0) {
          console.log(chalk.yellow("No trends data found."));
          return;
        }

        console.log(
          chalk.bold(
            `\nGoogle Trends — ${options.geo} — Last ${options.time}\n`
          )
        );
        console.log(formatOutput(results, options.format as OutputFormat));
        console.log(
          chalk.gray(
            "\nInterest scores are relative (0-100) within the selected time range and region."
          )
        );
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}
