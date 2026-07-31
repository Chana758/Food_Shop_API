// src/config/khqrConfig.js

// IMPORTANT: Replace the Bakong Account ID with your own account!
// You can find it in your banking app (ABA, ACLEDA, etc.)
// Settings → KHQR / Bakong
// Format example: "username@bankcode"
// e.g. "samchanna@aclb"
//
// Since KHQR is a unified standard developed by NBC,
// a single account ID can receive payments from multiple banks,
// including ABA, ACLEDA, Wing, Canadia, Vattanac, Prince Bank,
// Bakong App, and other KHQR-supported banks.

export const BAKONG_ACCOUNT_ID = 'khqr@aclb'; // 🔧 TODO: Replace with your own account ID
export const MERCHANT_NAME = 'KHMER FRESH';
export const MERCHANT_CITY = 'Phnom Penh';

// Badges displayed below the QR code to indicate
// that customers can scan and pay using these banks.
export const SUPPORTED_BANKS = [
  { code: 'ABA', label: 'ABA Bank' },
  { code: 'ACLEDA', label: 'ACLEDA Bank' },
  { code: 'WING', label: 'Wing Bank' },
  { code: 'CANADIA', label: 'Canadia Bank' },
  { code: 'VATTANAC', label: 'Vattanac Bank' },
  { code: 'BAKONG', label: 'Bakong' },
];