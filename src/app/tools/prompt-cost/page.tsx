import type { Metadata } from "next";
import PromptCostCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Prompt Cost Calculator — How Much Does Your Prompt Cost?",
  description:
    "Paste your prompt and see exactly what it costs across every AI model. Compare input and output costs instantly with real pricing data.",
};

export default function PromptCostPage() {
  return <PromptCostCalculator />;
}
