import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

//  ១. នាំចូលឯកសារបកប្រែ (Translation Files)
// បងត្រូវប្រាកដថាមាន file ទាំងនេះនៅក្នុង folder locales
import translationEN from './locales/en/translation.json';
import translationKH from './locales/kh/translation.json';

//  ២. រៀបចំធនធានភាសា (Resources)
const resources = {
  en: {
    translation: translationEN
  },
  kh: {
    translation: translationKH
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
   
    lng: localStorage.getItem('language') || 'en', 
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false 
    }
  });
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;