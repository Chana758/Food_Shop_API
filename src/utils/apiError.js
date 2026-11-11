// src/utils/apiError.js
//
// The Laravel API answers in English. This turns an axios error into a short
// message in the current language for the common cases, so admin forms don't
// show raw English (or technical) text in Khmer mode.

const FIELD_RULES = [
  { field: 'email',    includes: 'taken',        key: 'auth.emailTaken' },
  { field: 'email',    includes: '',             key: 'auth.invalidEmail' },
  { field: 'password', includes: 'confirmation', key: 'auth.passwordMismatch' },
  { field: 'password', includes: '',             key: 'auth.passwordMin' },
  { field: 'phone',    includes: '',             key: 'auth.invalidPhone' },
  { field: 'name',     includes: 'taken',        key: 'apiError.nameTaken' },
  { field: 'slug',     includes: 'taken',        key: 'apiError.nameTaken' },
  { field: 'sku',      includes: 'taken',        key: 'apiError.skuTaken' },
  { field: 'image',    includes: '',             key: 'apiError.badImage' },
];

/**
 * @param {unknown} err - error thrown by axiosInstance
 * @param {Function} t  - i18next t()
 * @param {string} [fallbackKey] - translation key used when nothing matches
 */
export const apiErrorMessage = (err, t, fallbackKey = 'error.generic') => {
  if (!err?.response) return t('error.network');

  const { status, data } = err.response;

  if (status === 422 && data?.errors) {
    const [field, messages] = Object.entries(data.errors)[0] ?? [];
    const msg = String(messages?.[0] ?? '').toLowerCase();
    const rule = FIELD_RULES.find((r) => r.field === field && msg.includes(r.includes));
    return rule ? t(rule.key) : t('auth.checkFields');
  }

  if (status === 403) return t('apiError.forbidden');
  if (status === 404) return t('error.notFound');
  return t(fallbackKey);
};
