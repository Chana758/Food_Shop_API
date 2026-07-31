// src/utils/khqr.js
import { KHQR, CURRENCY, COUNTRY, TAG } from 'ts-khqr';
import { BAKONG_ACCOUNT_ID, MERCHANT_NAME, MERCHANT_CITY } from '../config/khqrConfig';

/**
 * បង្កើត KHQR string ថ្មីៗ (dynamic) ដោយផ្អែកលើ amount របស់ order
 * ពេលនេះវាជា client-side generation ពិតប្រាកដ — មិនត្រូវការ call backend
 *
 * @param {number} amount      សរុបទឹកប្រាក់ត្រូវបង់ (USD)
 * @param {string} billNumber  លេខយោង unique សម្រាប់ order នេះ
 * @returns {{ qr: string, md5: string } | null}
 */
export function generateDynamicKHQR({ amount, billNumber }) {
  try {
    const result = KHQR.generate({
      tag: TAG.INDIVIDUAL,
      accountID: BAKONG_ACCOUNT_ID,
      merchantName: MERCHANT_NAME,
      merchantCity: MERCHANT_CITY,
      currency: CURRENCY.USD,
      amount: Number(Number(amount).toFixed(2)),
      countryCode: COUNTRY.KH,
      merchantCategoryCode: '5999',
      expirationTimestamp: Date.now() + 180 * 1000, // 3 នាទី — ស្របនឹង timer ខាង UI
      additionalData: {
        billNumber: billNumber || `KF-${Date.now()}`,
        storeLabel: MERCHANT_NAME,
        terminalLabel: 'Web-Checkout',
      },
    });

    if (result.status.code !== 0) {
      console.error('KHQR generation error:', result.status.message);
      return null;
    }

    return { qr: result.data.qr, md5: result.data.md5 };
  } catch (err) {
    console.error('KHQR generation threw:', err);
    return null;
  }
}