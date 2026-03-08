/**
 * Keyword Sync — Writes keywords to shared storage for iOS extension to read.
 *
 * On iOS: Uses expo-shared-group-preferences (or native module) to write
 * to the App Group "group.com.cellaz.SpamKiller" UserDefaults.
 *
 * On Android: Keywords are kept in-memory (smsListener.ts reads from context).
 */

import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.cellaz.SpamKiller';
const ANDROID_PREFS = 'SpamKillerPrefs';

/**
 * Sync keywords to shared storage so background extensions can read them.
 * iOS ILMessageFilterExtension uses App Group UserDefaults.
 * Android SmsReceiver uses SharedPreferences.
 */
export async function syncKeywordsToExtension(keywords: string[]): Promise<void> {
    try {
        if (Platform.OS === 'ios') {
            await SharedGroupPreferences.setItem('blockedKeywords', keywords, APP_GROUP);
            console.log(`[KeywordSync] Synced ${keywords.length} keywords to iOS App Group: ${APP_GROUP}`);
        } else if (Platform.OS === 'android') {
            // Android SharedPreferences usually store strings or string sets easily.
            // react-native-shared-group-preferences stringifies JSON by default under the hood.
            // Our Java receiver expects a comma separated string to make parsing simple.
            const keywordsStr = keywords.join(',');
            await SharedGroupPreferences.setItem('blockedKeywords', keywordsStr, ANDROID_PREFS);
            console.log(`[KeywordSync] Synced keywords to Android SharedPreferences: ${ANDROID_PREFS}`);
        }
    } catch (err) {
        console.error('[KeywordSync] Failed to sync keywords to native storage (is the dev client built?):', err);
    }
}
