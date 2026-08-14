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

const CURRENCY_CONFIG = {
  USD: { symbol: '$', decimals: 2, position: 'before' },
  KHR: { symbol: '៛', decimals: 0, position: 'after'  },
  THB: { symbol: '฿', decimals: 2, position: 'before' },
};


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