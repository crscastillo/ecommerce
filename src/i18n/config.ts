export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const localeNames = {
  en: 'English',
  es: 'Español (Costa Rica)'
};

export const defaultLocale: Locale = 'en';