#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { registerTrendsCommand } from "./commands/trends";

const program = new Command();

program
  .name("everyrank")
  .description("CLI keyword research tool powered by Google Trends")
  .version("1.0.0")
  .addHelpText(
    "after",
    `
${chalk.bold("Examples:")}
  ${chalk.gray("# Compare keyword popularity")}
  everyrank trends "meditation" "yoga" "mindfulness"

  ${chalk.gray("# Check trends in a specific country")}
  everyrank trends "fitness" --geo IN

  ${chalk.gray("# Check short-term trends (last 7 days)")}
  everyrank trends "iphone" --time 7d

  ${chalk.gray("# Output as JSON")}
  everyrank trends "react" "vue" "angular" --format json

  ${chalk.gray("# Output as CSV")}
  everyrank trends "python" "javascript" --format csv
`
  );

registerTrendsCommand(program);

program.action(() => {
  program.outputHelp();
});

program.parse(process.argv);
