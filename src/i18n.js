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
  .use(initReactI18next) // បញ្ជូន i18n ទៅឱ្យ react-i18next
  .init({
    resources,
    //  ៣. កំណត់ភាសាដំបូង៖ បើធ្លាប់រើសភាសាវានឹងទាញពី localStorage បើអត់ទេគឺយក 'en'
    lng: localStorage.getItem('language') || 'en', 
    fallbackLng: 'en', // ករណីរកពាក្យបកប្រែមិនឃើញ វានឹងបង្ហាញជាភាសាអង់គ្លេសជំនួស
    interpolation: {
      escapeValue: false // React ការពារ XSS រួចជាស្រេច ដូច្នេះមិនចាំបាច់ escape ទេ
    },
    react: {
      useSuspense: false // បិទ suspense ដើម្បីឱ្យការ Setup កាន់តែងាយស្រួល
    }
  });

//  ៤. រក្សាទុកជម្រើសភាសាទៅក្នុង Local Storage
// រាល់ពេលប្តូរភាសា វានឹង Save ទុក ដើម្បីពេល User បើកមកវិញ វានៅចាំភាសានោះដដែល
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;