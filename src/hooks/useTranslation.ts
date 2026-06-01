import { translations, type Language } from '@/constants/translations';
import { useAuth } from '@/store/auth.context';

export const useTranslation = () => {
  const { user } = useAuth();
  const lang = (user?.preferredLanguage || 'en') as Language;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t, lang };
};
