/**
 * Keyword Sync — Writes keywords to shared storage for iOS extension to read.
 *
 * On iOS: Uses expo-shared-group-preferences (or native module) to write
 * to the App Group "group.com.cellaz.SpamKiller" UserDefaults.
 *
 * On Android: Keywords are kept in-memory (smsListener.ts reads from context).
 */

import { NativeModules, Platform } from 'react-native';

const APP_GROUP = 'group.com.cellaz.SpamKiller';

/**
 * Sync keywords to the iOS App Group so the ILMessageFilterExtension can read them.
 * Call this every time keywords change in SpamFilterContext.
 */
export async function syncKeywordsToExtension(keywords: string[]): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
        // Method 1: Use native module if available
        const SharedDefaults = NativeModules.SharedDefaults;
        if (SharedDefaults?.setArray) {
            await SharedDefaults.setArray('spam_keywords', keywords, APP_GROUP);
            console.log(`[KeywordSync] Synced ${keywords.length} keywords to iOS extension`);
            return;
        }

        // Method 2: Fallback — log warning
        console.warn(
            '[KeywordSync] No native SharedDefaults module found. ' +
            'To sync keywords to the iOS extension, add a native module or use ' +
            'expo-shared-group-preferences.'
        );
    } catch (err) {
        console.error('[KeywordSync] Failed to sync keywords:', err);
    }
}

/**
 * Read the filtered message log from the iOS extension.
 * The extension writes to App Group UserDefaults under "filtered_log".
 */
export async function getExtensionFilterLog(): Promise<
    Array<{ sender: string; preview: string; date: string }>
> {
    if (Platform.OS !== 'ios') return [];

    try {
        const SharedDefaults = NativeModules.SharedDefaults;
        if (SharedDefaults?.getArray) {
            const log = await SharedDefaults.getArray('filtered_log', APP_GROUP);
            return log || [];
        }
    } catch {
        // ignore
    }

    return [];
}
