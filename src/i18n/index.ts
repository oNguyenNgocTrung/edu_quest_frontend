import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viCommon from './locales/vi/common.json';
import viAuth from './locales/vi/auth.json';
import viOnboarding from './locales/vi/onboarding.json';
import viChild from './locales/vi/child.json';
import viParent from './locales/vi/parent.json';
import viLanding from './locales/vi/landing.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enOnboarding from './locales/en/onboarding.json';
import enChild from './locales/en/child.json';
import enParent from './locales/en/parent.json';
import enLanding from './locales/en/landing.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viCommon,
        auth: viAuth,
        onboarding: viOnboarding,
        child: viChild,
        parent: viParent,
        landing: viLanding,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        onboarding: enOnboarding,
        child: enChild,
        parent: enParent,
        landing: enLanding,
      },
    },
    fallbackLng: 'vi',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;
