// Flat-rate shipping calculator. Amounts are in AED (the store's base
// currency) and converted to the checkout currency at display/charge time.
// Tune these once you have real courier rates for your suppliers.
export const GCC_COUNTRIES = ["AE", "SA", "KW", "QA", "BH", "OM"] as const;

interface ShippingRule {
  flatFeeAed: number;
  freeThresholdAed: number;
}

const RULES: Record<string, ShippingRule> = {
  AE: { flatFeeAed: 15, freeThresholdAed: 200 },
  SA: { flatFeeAed: 25, freeThresholdAed: 300 },
  KW: { flatFeeAed: 25, freeThresholdAed: 300 },
  QA: { flatFeeAed: 25, freeThresholdAed: 300 },
  BH: { flatFeeAed: 25, freeThresholdAed: 300 },
  OM: { flatFeeAed: 25, freeThresholdAed: 300 },
};

const DEFAULT_RULE: ShippingRule = { flatFeeAed: 35, freeThresholdAed: 400 };

export function calculateShippingFeeAed(country: string, subtotalAed: number): number {
  const rule = RULES[country] ?? DEFAULT_RULE;
  return subtotalAed >= rule.freeThresholdAed ? 0 : rule.flatFeeAed;
}
