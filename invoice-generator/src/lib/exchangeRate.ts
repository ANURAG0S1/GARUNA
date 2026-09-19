import type { CurrencySymbol } from "./types";

const CURRENCY_CODES: Record<CurrencySymbol, string> = {
  $: "USD",
  "₹": "INR",
  "€": "EUR",
  "£": "GBP",
};

/**
 * Live INR conversion rate for a given invoice currency, fetched directly
 * from the browser (no API key needed). Throws on any failure — the caller
 * decides what to do (usually: fall back to asking the user).
 */
export async function fetchInrRate(currency: CurrencySymbol): Promise<number> {
  if (currency === "₹") return 1;

  const code = CURRENCY_CODES[currency] || "USD";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${code}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Exchange rate service responded with ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.INR;
    if (typeof rate !== "number" || !isFinite(rate) || rate <= 0) {
      throw new Error("INR rate missing from response");
    }
    return rate;
  } finally {
    clearTimeout(timeout);
  }
}
