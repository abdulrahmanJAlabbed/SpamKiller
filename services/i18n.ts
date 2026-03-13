import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import ar from '../locales/ar.json';
import de from '../locales/de.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ja from '../locales/ja.json';
import ru from '../locales/ru.json';
import tr from '../locales/tr.json';
import zh from '../locales/zh.json';

const STORE_LANGUAGE_KEY = '@settings_language';

const resources = {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    ja: { translation: ja },
    zh: { translation: zh },
    tr: { translation: tr },
    ru: { translation: ru },
};

const languageDetectorPlugin = {
    type: 'languageDetector' as const,
    async: true,
    init: () => { },
    detect: async function (callback: (lang: string) => void) {
        // Guard against SSR / Node environments
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            return callback('en');
        }

        try {
            const language = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
            if (language) {
                callback(language);
            } else {
                callback('en');
            }
        } catch (error) {
            console.log('Error reading language', error);
            callback('en');
        }
    },
    cacheUserLanguage: async function (language: string) {
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            return;
        }

        try {
            await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error caching language', error);
        }
    },
};

i18n
    .use(initReactI18next)
    .use(languageDetectorPlugin)
    .init({
        resources,
        compatibilityJSON: 'v4',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
