import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage获取保存的语言，默认为中文
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'zh';
  });

  useEffect(() => {
    // 保存语言设置到localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回key或者尝试英文翻译
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        if (language !== 'en') {
          // 尝试使用英文作为后备
          let fallback: any = translations.en;
          for (const fallbackKey of keys) {
            if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
              fallback = fallback[fallbackKey];
            } else {
              return key; // 如果英文也没有，返回key
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
