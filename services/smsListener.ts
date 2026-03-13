/**
 * SMS Listener Service — Android real-time SMS interception & auto-classify
 *
 * Uses @maniac-tech/react-native-expo-read-sms to listen for incoming SMS,
 * runs them through spamFilter.classifyMessage(), and fires a silent
 * notification (or none) for spam messages.
 *
 * Usage: call startSmsListener() once from _layout.tsx after permissions granted.
 */

import { classifyMessage, type SpamResult } from '@/services/spamFilter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────

export interface SilencedMessage {
    id: string;
    sender: string;
    text: string;
    result: SpamResult;
    timestamp: number;
}

type OnSpamCallback = (msg: SilencedMessage) => void;
type OnHamCallback = (sender: string, text: string) => void;

let isListening = false;
let onSpamDetected: OnSpamCallback | null = null;
let onHamDetected: OnHamCallback | null = null;

// ─── Permission Handling ─────────────────────────────────────────

/**
 * Request READ_SMS + RECEIVE_SMS permissions on Android.
 * Returns true if both granted. No-op on iOS.
 */
export async function requestSmsPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
        const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);

        const readGranted = results[PermissionsAndroid.PERMISSIONS.READ_SMS] === 'granted';
        const receiveGranted = results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === 'granted';

        console.log(`SMS permissions: read=${readGranted}, receive=${receiveGranted}`);
        return readGranted && receiveGranted;
    } catch (err) {
        console.error('SMS permission request failed:', err);
        return false;
    }
}

/**
 * Check if SMS permissions are already granted.
 */
export async function hasSmsPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
        const read = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
        const receive = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        return read && receive;
    } catch {
        return false;
    }
}

// ─── Listener ────────────────────────────────────────────────────

/**
 * Start listening for incoming SMS. Call once after permissions are granted.
 * Uses @maniac-tech/react-native-expo-read-sms under the hood.
 *
 * @param keywords Current keyword blocklist
 * @param options Filter options (aggressiveness, keywordWeighting)
 * @param onSpam Called when a spam message is detected
 * @param onHam Called when a clean message arrives
 */
export async function startSmsListener(
    keywords: string[],
    options: { aggressiveness?: number; keywordWeighting?: number } = {},
    onSpam?: OnSpamCallback,
    onHam?: OnHamCallback,
): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (isListening) return true;

    const hasPerms = await hasSmsPermissions();
    if (!hasPerms) {
        console.warn('SMS permissions not granted, cannot start listener');
        return false;
    }

    onSpamDetected = onSpam || null;
    onHamDetected = onHam || null;

    try {
        // Dynamic import to avoid crash on iOS
        const SmsModule = require('@maniac-tech/react-native-expo-read-sms');
        const { startReadSMS } = SmsModule;

        startReadSMS((status: string, sms: string, error: any) => {
            console.log(`[SmsListener] Raw SMS received: status=${status}, data=${sms}`);
            if (error) {
                console.error('SMS read error:', error);
                return;
            }

            if (status === 'success' && sms) {
                // Parse JSON if possible
                let sender = 'Unknown';
                let body = sms;

                try {
                    if (sms.startsWith('{')) {
                        const parsed = JSON.parse(sms);
                        if (parsed.address) sender = parsed.address;
                        if (parsed.body) body = parsed.body;
                    } else if (sms.startsWith('[') && sms.includes(',')) {
                        // Robust [Sender, Body...] format
                        const inner = sms.substring(1, sms.endsWith(']') ? sms.length - 1 : sms.length);
                        const commaIdx = inner.indexOf(',');
                        if (commaIdx !== -1) {
                            const parsedSender = inner.substring(0, commaIdx).trim();
                            const parsedBody = inner.substring(commaIdx + 1).trim();
                            console.log(`[SmsListener] Parsed Emulator SMS: sender="${parsedSender}", body="${parsedBody}"`);
                            handleIncomingSms(parsedSender, parsedBody, keywords, options);
                            return;
                        }
                    }
                    console.log(`[SmsListener] Parsed SMS: sender=${sender}, body=${body}`);
                } catch (e) {
                    console.log('[SmsListener] SMS parsing failed or not in expected format, using as raw body');
                }

                handleIncomingSms(sender, body, keywords, options);
            }
        });

        isListening = true;
        console.log('SMS listener started');
        return true;
    } catch (err) {
        console.error('Failed to start SMS listener:', err);
        return false;
    }
}

/**
 * Stop listening for SMS.
 */
export function stopSmsListener(): void {
    if (!isListening) return;

    try {
        const SmsModule = require('@maniac-tech/react-native-expo-read-sms');
        SmsModule.stopReadSMS?.();
    } catch {
        // ignore
    }

    isListening = false;
    onSpamDetected = null;
    onHamDetected = null;
    console.log('SMS listener stopped');
}

// ─── Internal ────────────────────────────────────────────────────

async function handleIncomingSms(
    sender: string,
    smsBody: string,
    keywords: string[],
    options: { aggressiveness?: number; keywordWeighting?: number },
): Promise<void> {
    // 1. Check if sender is in silenced numbers list
    try {
        const storedSilenced = await AsyncStorage.getItem(SILENCED_NUMBERS_KEY);
        const silencedList: string[] = storedSilenced ? JSON.parse(storedSilenced) : [];
        if (silencedList.includes(sender)) {
            console.log(`[SpamKiller] BLOCKED: Message from silenced number [${sender}]`);
            // Treat as spam
            const msg: SilencedMessage = {
                id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
                sender,
                text: smsBody,
                result: {
                    isSpam: true,
                    confidence: 1.0,
                    method: 'none',
                    matchedKeywords: [],
                    aiScore: null,
                    category: 'catOthers'
                },
                timestamp: Date.now(),
            };
            storeSilencedMessage(msg);
            onSpamDetected?.(msg);
            return;
        }
    } catch (err) {
        console.error('Failed to check silenced numbers:', err);
    }

    // 2. Run through normal classifier
    const result = classifyMessage(smsBody, keywords, {
        aiEnabled: true,
        aggressiveness: options.aggressiveness ?? 50,
        keywordWeighting: options.keywordWeighting ?? 75,
    });

    if (result.isSpam) {
        const msg: SilencedMessage = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            sender,
            text: smsBody,
            result,
            timestamp: Date.now(),
        };

        // Store silenced message
        storeSilencedMessage(msg);

        // Callback
        onSpamDetected?.(msg);

        console.log(`[SpamKiller] SILENCED: [${sender}] "${smsBody.substring(0, 50)}..." (${result.confidence.toFixed(2)} confidence)`);
    } else {
        onHamDetected?.(sender, smsBody);
    }
}

// ─── Persistent Storage ──────────────────────────────────────────

export const SILENCED_STORAGE_KEY = '@spamkiller_silenced';
export const SILENCED_NUMBERS_KEY = '@spamkiller_silenced_numbers';
const MAX_STORED = 100;

async function storeSilencedMessage(msg: SilencedMessage): Promise<void> {
    try {
        const existing = await AsyncStorage.getItem(SILENCED_STORAGE_KEY);
        const messages: SilencedMessage[] = existing ? JSON.parse(existing) : [];
        messages.unshift(msg);
        // Keep only last N
        if (messages.length > MAX_STORED) messages.length = MAX_STORED;
        await AsyncStorage.setItem(SILENCED_STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
        console.error('Failed to store silenced message:', err);
    }
}

export async function getSilencedMessages(): Promise<SilencedMessage[]> {
    try {
        const data = await AsyncStorage.getItem(SILENCED_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export async function clearSilencedMessages(): Promise<void> {
    try {
        await AsyncStorage.removeItem(SILENCED_STORAGE_KEY);
    } catch {
        // ignore
    }
}
