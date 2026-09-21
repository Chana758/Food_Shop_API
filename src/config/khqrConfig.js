
export const BAKONG_ACCOUNT_ID = 'abaakhppxxx@abaa';
export const MERCHANT_NAME = 'KHMER FRESH';
export const MERCHANT_CITY = 'Phnom Penh';

export const SUPPORTED_BANKS = [
  { code: 'ABA', label: 'ABA Bank' },
  { code: 'ACLEDA', label: 'ACLEDA Bank' },
  { code: 'WING', label: 'Wing Bank' },
  { code: 'CANADIA', label: 'Canadia Bank' },
  { code: 'VATTANAC', label: 'Vattanac Bank' },
  { code: 'BAKONG', label: 'Bakong' },
];

//  NEW — enable a fake/demo "Test Pay" button in POS so staff can
// rehearse the checkout flow without a real KHQR scan. Set to false
// (or remove usage) before going to production.
export const ENABLE_TEST_PAYMENT = import.meta.env.DEV;