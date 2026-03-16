import fetch, { Response } from "node-fetch";
import { KeywordResult, RelatedQuery } from "../utils/output";

const TRENDS_EXPLORE_URL =
  "https://trends.google.com/trends/api/explore";
const TRENDS_INTEREST_URL =
  "https://trends.google.com/trends/api/widgetdata/multiline";
const TRENDS_RELATED_URL =
  "https://trends.google.com/trends/api/widgetdata/relatedsearches";

interface TrendsWidget {
  id: string;
  token: string;
  request: any;
}

/**
 * Strip the ")]}'" prefix Google adds to prevent XSSI.
 */
function sanitizeJson(raw: string): any {
  const cleaned = raw.replace(/^\)\]\}',?\n?/, "");
  return JSON.parse(cleaned);
}

let cookieJar = "";

/**
 * First visit Google Trends homepage to get cookies (NID etc.)
 * This prevents 429 rate limits on the API calls.
 */
async function ensureCookies(): Promise<void> {
  if (cookieJar) return;

  const response = await fetch("https://trends.google.com/trends/?geo=US", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });

  const setCookies = response.headers.raw()["set-cookie"] || [];
  cookieJar = setCookies
    .map((c: string) => c.split(";")[0])
    .join("; ");
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    Referer: "https://trends.google.com/trends/explore",
  };
  if (cookieJar) {
    headers["Cookie"] = cookieJar;
  }
  return headers;
}

async function fetchWithRetry(
  url: string,
  retries: number = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, { headers: getHeaders() });

    if (response.ok) return response;

    if (response.status === 429 && attempt < retries) {
      // Wait before retrying: 2s, then 5s
      const delay = attempt === 0 ? 2000 : 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      // Refresh cookies
      cookieJar = "";
      await ensureCookies();
      continue;
    }

    throw new Error(`Google Trends request failed (${response.status})`);
  }

  throw new Error("Google Trends request failed after retries");
}

/**
 * Get the explore widgets (tokens) for a set of keywords.
 */
async function getExploreWidgets(
  keywords: string[],
  geo: string,
  timeRange: string
): Promise<TrendsWidget[]> {
  await ensureCookies();

  const comparisonItem = keywords.map((keyword) => ({
    keyword,
    geo: geo.toUpperCase(),
    time: timeRange,
  }));

  const req = JSON.stringify({ comparisonItem, category: 0, property: "" });
  const params = new URLSearchParams({ hl: "en-US", tz: "0", req });

  const response = await fetchWithRetry(
    `${TRENDS_EXPLORE_URL}?${params}`
  );

  const raw = await response.text();
  const data = sanitizeJson(raw);
  return data.widgets || [];
}

/**
 * Get interest over time for keywords.
 */
async function getInterestOverTime(
  widget: TrendsWidget
): Promise<{ avg: number; trend: string }[]> {
  const params = new URLSearchParams({
    hl: "en-US",
    tz: "0",
    req: JSON.stringify(widget.request),
    token: widget.token,
  });

  const response = await fetchWithRetry(
    `${TRENDS_INTEREST_URL}?${params}`
  );

  const raw = await response.text();
  const data = sanitizeJson(raw);

  const timelineData = data?.default?.timelineData || [];
  const results: { avg: number; trend: string }[] = [];

  if (timelineData.length === 0) return results;

  const numKeywords = timelineData[0]?.value?.length || 1;

  for (let i = 0; i < numKeywords; i++) {
    const values: number[] = timelineData.map(
      (point: any) => point.value?.[i] ?? 0
    );
    const avg = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );

    // Determine trend: compare last quarter avg to first quarter avg
    const quarter = Math.max(1, Math.floor(values.length / 4));
    const firstQ =
      values.slice(0, quarter).reduce((a, b) => a + b, 0) / quarter;
    const lastQ =
      values.slice(-quarter).reduce((a, b) => a + b, 0) / quarter;

    let trend = "stable";
    if (lastQ > firstQ * 1.15) trend = "rising";
    else if (lastQ < firstQ * 0.85) trend = "declining";

    results.push({ avg, trend });
  }

  return results;
}

/**
 * Get related queries for a keyword.
 */
async function getRelatedQueries(
  widget: TrendsWidget
): Promise<{ top: { query: string; value: number }[]; rising: { query: string; value: number }[] }> {
  const params = new URLSearchParams({
    hl: "en-US",
    tz: "0",
    req: JSON.stringify(widget.request),
    token: widget.token,
  });

  const response = await fetchWithRetry(
    `${TRENDS_RELATED_URL}?${params}`
  );

  const raw = await response.text();

  const data = sanitizeJson(raw);

  const ranked = data?.default?.rankedList || [];
  const top: { query: string; value: number }[] = [];
  const rising: { query: string; value: number }[] = [];

  // First list is "Top" (interest 0-100), second is "Rising" (% growth)
  if (ranked[0]) {
    for (const item of ranked[0].rankedKeyword || []) {
      top.push({ query: item.query, value: item.value });
    }
  }
  if (ranked[1]) {
    for (const item of ranked[1].rankedKeyword || []) {
      rising.push({ query: item.query, value: item.value });
    }
  }

  return { top, rising };
}

/**
 * Fetch Google Trends data for keywords.
 * Returns popularity (0-100 relative interest), trend direction, and related queries.
 */
export async function getGoogleTrendsData(
  keywords: string[],
  geo: string = "US",
  timeRange: string = "today 12-m"
): Promise<KeywordResult[]> {
  // Google Trends supports max 5 keywords at a time
  const batch = keywords.slice(0, 5);

  const widgets = await getExploreWidgets(batch, geo, timeRange);

  const interestWidget = widgets.find((w) => w.id.includes("TIMESERIES"));
  const relatedWidgets = widgets.filter((w) => w.id.includes("RELATED_QUERIES"));

  let interestData: { avg: number; trend: string }[] = [];

  if (interestWidget) {
    interestData = await getInterestOverTime(interestWidget);
  }

  const results: KeywordResult[] = [];

  for (let i = 0; i < batch.length; i++) {
    const interest = interestData[i];
    let relatedQueries: RelatedQuery[] = [];

    if (relatedWidgets[i]) {
      try {
        const related = await getRelatedQueries(relatedWidgets[i]);
        const topMapped = related.top.slice(0, 5).map((r) => ({
          query: r.query,
          interest: r.value,
          type: "top" as const,
        }));
        const risingMapped = related.rising.slice(0, 5).map((r) => ({
          query: r.query,
          interest: r.value,
          type: "rising" as const,
        }));
        relatedQueries = [...topMapped, ...risingMapped];
      } catch {
        // Related queries are optional
      }
    }

    results.push({
      keyword: batch[i],
      popularity: interest?.avg ?? 0,
      trend: interest?.trend ?? "unknown",
      relatedQueries,
    });
  }

  return results;
}
