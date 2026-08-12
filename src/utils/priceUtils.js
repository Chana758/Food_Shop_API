// ─── Shared price & discount helpers ─────────────────────────────────────────

/**
 * Check whether a product has a valid, NOT-expired discount price.
 */
export const hasDiscount = (price, discount_price, discount_expires_at = null) => {
  const p = parseFloat(price) || 0;
  const d = parseFloat(discount_price) || 0;
  if (!(d > 0 && d < p)) return false;

  if (discount_expires_at) {
    const expiry = new Date(discount_expires_at);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return false; 
    }
  }
  return true;
};

/**
 * Return the effective selling price (discount_price if valid & not expired, else price)
 */
export const getFinalPrice = (price, discount_price, discount_expires_at = null) => {
  return hasDiscount(price, discount_price, discount_expires_at)
    ? parseFloat(discount_price)
    : parseFloat(price) || 0;
};

/**
 * Return discount percentage string e.g. "20% OFF"
 * Returns null if no valid (non-expired) discount
 */
export const getDiscountPercent = (price, discount_price, discount_expires_at = null) => {
  if (!hasDiscount(price, discount_price, discount_expires_at)) return null;
  const p   = parseFloat(price);
  const d   = parseFloat(discount_price);
  const pct = Math.round(((p - d) / p) * 100);
  return `${pct}% OFF`;
};

/**
 * Return savings amount e.g. 0.35
 */
export const getSavings = (price, discount_price, discount_expires_at = null) => {
  if (!hasDiscount(price, discount_price, discount_expires_at)) return 0;
  return parseFloat(price) - parseFloat(discount_price);
};

/**
 * Human-readable countdown label for a discount's expiry.
 * Returns null if there's no expiry set.
 * { label: string, urgent: boolean, expired: boolean }
 */
export const getDiscountExpiryLabel = (discount_expires_at) => {
  if (!discount_expires_at) return null;
  const expiry = new Date(discount_expires_at);
  if (isNaN(expiry.getTime())) return null;

  const diffMs = expiry.getTime() - Date.now();
  if (diffMs <= 0) return { label: 'Expired', urgent: true, expired: true };

  const hours = diffMs / 36e5;
  if (hours <= 24) {
    return { label: `Ends in ${Math.max(1, Math.ceil(hours))}h`, urgent: true, expired: false };
  }
  const days = Math.ceil(hours / 24);
  return { label: `Ends in ${days}d`, urgent: days <= 3, expired: false };
};

// ─── Currency support (NEW) ───────────────────────────────────────────────
// Symbol lookup + per-currency decimal/format rules. KHR conventionally has
// no decimal places and the symbol goes AFTER the number (e.g. "4,100៛"),
// while USD/THB use symbol-before with 2 decimals.
const CURRENCY_CONFIG = {
  USD: { symbol: '$', decimals: 2, position: 'before' },
  KHR: { symbol: '៛', decimals: 0, position: 'after'  },
  THB: { symbol: '฿', decimals: 2, position: 'before' },
};

/**
 * Format a number as money in the given currency.
 * `currency` is OPTIONAL — every existing call site using fmt(amount)
 * keeps working exactly as before (defaults to USD, 2 decimals, "$" prefix).
 *
 * Usage:
 *   fmt(1.5)             → "$1.50"          (unchanged old behavior)
 *   fmt(1.5, 'USD')      → "$1.50"
 *   fmt(6000, 'KHR')     → "6,000៛"
 *   fmt(52.3, 'THB')     → "฿52.30"
 */
export const fmt = (amount, currency = 'USD') => {
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const value = parseFloat(amount || 0);

  const numberStr = cfg.decimals > 0
    ? value.toFixed(cfg.decimals)
    : Math.round(value).toLocaleString('en-US');

  return cfg.position === 'after'
    ? `${numberStr}${cfg.symbol}`
    : `${cfg.symbol}${numberStr}`;
};