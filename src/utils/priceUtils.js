// src/utils/priceUtils.js
// ─── Shared price & discount helpers ─────────────────────────────────────────

/**
 * Check whether a product has a valid discount price
 * discount_price must exist, be > 0, and be less than the original price
 */
export const hasDiscount = (price, discount_price) => {
  const p = parseFloat(price)       || 0;
  const d = parseFloat(discount_price) || 0;
  return d > 0 && d < p;
};

/**
 * Return the effective selling price (discount_price if valid, else price)
 */
export const getFinalPrice = (price, discount_price) => {
  return hasDiscount(price, discount_price)
    ? parseFloat(discount_price)
    : parseFloat(price) || 0;
};

/**
 * Return discount percentage string e.g. "20% OFF"
 * Returns null if no valid discount
 */
export const getDiscountPercent = (price, discount_price) => {
  if (!hasDiscount(price, discount_price)) return null;
  const p    = parseFloat(price);
  const d    = parseFloat(discount_price);
  const pct  = Math.round(((p - d) / p) * 100);
  return `${pct}% OFF`;
};

/**
 * Return savings amount e.g. 0.35
 */
export const getSavings = (price, discount_price) => {
  if (!hasDiscount(price, discount_price)) return 0;
  return parseFloat(price) - parseFloat(discount_price);
};

/**
 * Format a number to 2-decimal USD string e.g. "$1.75"
 */
export const fmt = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;