/**
 * Keyword Sync — Writes keywords to shared storage for iOS extension to read.
 *
 * On iOS: Uses expo-shared-group-preferences (or native module) to write
 * to the App Group "group.com.cellaz.SpamKiller" UserDefaults.
 *
 * On Android: Keywords are kept in-memory (smsListener.ts reads from context).
 */

import { Platform } from 'react-native';

// Lazy load SharedGroupPreferences - may not be available in dev client
let SharedGroupPreferences: any = null;
try {
    SharedGroupPreferences = require('react-native-shared-group-preferences');
} catch (e) {
    console.warn('[KeywordSync] react-native-shared-group-preferences not available in this build');
}

const APP_GROUP = 'group.com.cellaz.SpamKiller';
const ANDROID_PREFS = 'SpamKillerPrefs';

/**
 * Sync keywords to shared storage so background extensions can read them.
 * iOS ILMessageFilterExtension uses App Group UserDefaults.
 * Android SmsReceiver uses SharedPreferences.
 * 
 * In dev client, this may be unavailable but shouldn't crash the app.
 */
export async function syncKeywordsToExtension(keywords: string[]): Promise<void> {
    try {
        if (!SharedGroupPreferences) {
            console.warn('[KeywordSync] Skipping sync - native module not available in this build context');
            return;
        }

        if (Platform.OS === 'ios') {
            if (typeof SharedGroupPreferences?.setItem === 'function') {
                await SharedGroupPreferences.setItem('blockedKeywords', keywords, APP_GROUP);
                console.log(`[KeywordSync] Synced ${keywords.length} keywords to iOS App Group: ${APP_GROUP}`);
            }
        } else if (Platform.OS === 'android') {
            const keywordsStr = keywords.join(',');
            // Add safety check for Android SharedGroupPreferences compatibility
            if (typeof SharedGroupPreferences?.setItem === 'function') {
                await SharedGroupPreferences.setItem('blockedKeywords', keywordsStr, ANDROID_PREFS);
                console.log(`[KeywordSync] Synced keywords to Android SharedPreferences: ${ANDROID_PREFS}`);
            } else {
                console.warn('[KeywordSync] SharedGroupPreferences.setItem is not a function on this platform');
            }
        }
    } catch (err) {
        console.warn('[KeywordSync] Failed to sync keywords to native storage:', err);
        // Don't throw - allow app to continue even if sync fails
    }
}
