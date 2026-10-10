/** ISO 4217 codes the store accepts. USD is a placeholder until the user confirms (catalog.md §8 q1). */
export const CURRENCIES = ["USD"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/** An amount in integer minor units (cents for USD): 3400 is $34.00. Never a float. */
export type Money = {
  readonly amount: number;
  readonly currency: CurrencyCode;
};
