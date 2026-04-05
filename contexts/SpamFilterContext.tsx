/**
 * SpamFilterContext — Shared state for spam filter across all screens
 * 
 * Provides keywords, AI settings, scan results, and threat counter
 * to all screens via React context.
 */

import { classifyMessage, classifyMessages, type SpamResult } from '@/services/spamFilter';
import type { BlockedKeyword } from '@/types';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────

export interface ScanResultItem {
    id: string;
    text: string;
    sender?: string;
    result: SpamResult;
    timestamp: number;
}

interface SpamFilterContextValue {
    // Keywords
    keywords: BlockedKeyword[];
    addKeyword: (text: string) => boolean;
    removeKeyword: (id: string) => void;

    // AI Settings
    aiEnabled: boolean;
    setAiEnabled: (val: boolean) => void;
    aggressiveness: number;
    setAggressiveness: (val: number) => void;
    keywordWeighting: number;
    setKeywordWeighting: (val: number) => void;

    // Scanning
    scanResults: ScanResultItem[];
    scanMessage: (text: string, sender?: string) => ScanResultItem;
    scanMessages: (messages: { id: string; text: string; sender?: string }[]) => ScanResultItem[];
    clearResults: () => void;
    silencedNumbers: string[];
    addSilencedNumber: (num: string) => void;
    removeSilencedNumber: (num: string) => void;

    // Stats
    threatsBlocked: number;
    totalScanned: number;

    // Premium/Monetization
    isPremium: boolean;
    setPremium: (val: boolean) => void;
    restorePurchase: () => Promise<void>;

    // Debug/Simulation
    injectMessage: (text: string, sender: string) => void;
    resetAllData: () => Promise<void>;
}

// ─── Default keywords ────────────────────────────────────────────

const DEFAULT_KEYWORDS: BlockedKeyword[] = [
    { id: '1', text: 'spam' },
    { id: '2', text: 'promo' },
    { id: '3', text: 'crypto' },
    { id: '4', text: 'winner' },
    { id: '5', text: 'gift' },
    { id: '6', text: 'click' },
    { id: '7', text: 'verify' },
    { id: '8', text: 'urgent' },
    { id: '9', text: 'lottery' },
    { id: 'test-1', text: 'hey' },
    { id: 'test-2', text: 'prize' },
    { id: 'test-3', text: 'account' },
];

const INITIAL_RESULTS: ScanResultItem[] = [
    {
        id: 'mock-1',
        sender: 'UPS Alert',
        text: 'Your package is held at our warehouse. Click here to verify address: bit.ly/spam-link',
        timestamp: Date.now() - 3600000,
        result: { isSpam: true, confidence: 0.98, method: 'both', matchedKeywords: ['verify'], aiScore: 0.95, category: 'catDelivery' }
    },
    {
        id: 'mock-2',
        sender: 'Chase Bank',
        text: 'Urgent: Unusual activity on your account. Please log in to secure your funds.',
        timestamp: Date.now() - 7200000,
        result: { isSpam: true, confidence: 0.92, method: 'ai', matchedKeywords: [], aiScore: 0.92, category: 'catBank' }
    },
    {
        id: 'mock-3',
        sender: 'Aunt May',
        text: 'Hi Peter! Just wanted to check in and see if you wanted to come over for dinner tonight?',
        timestamp: Date.now() - 10000000,
        result: { isSpam: false, confidence: 0.99, method: 'none', matchedKeywords: [], aiScore: 0.05, category: 'catOthers' }
    },
    {
        id: 'mock-4',
        sender: '555-0102',
        text: 'CONGRATULATIONS! You have won a $1000 Walmart gift card. Text STOP to opt out.',
        timestamp: Date.now() - 15000000,
        result: { isSpam: true, confidence: 0.99, method: 'both', matchedKeywords: ['winner', 'gift'], aiScore: 0.99, category: 'catScam' }
    },
    {
        id: 'mock-5',
        sender: 'Google',
        text: 'Your Google verification code is: 123456. Do not share this code.',
        timestamp: Date.now() - 18000000,
        result: { isSpam: false, confidence: 0.99, method: 'none', matchedKeywords: [], aiScore: 0.01, category: 'catOtp' }
    },
    {
        id: 'mock-6',
        sender: 'Pizza Hut',
        text: '50% OFF all pizzas today! Order now with code PIZZA50. Limited time only.',
        timestamp: Date.now() - 22000000,
        result: { isSpam: false, confidence: 0.85, method: 'none', matchedKeywords: [], aiScore: 0.15, category: 'catPromos' }
    },
    {
        id: 'mock-7',
        sender: 'Dr. Smith',
        text: 'Your medical test results are ready. Please log in to the patient portal to view them.',
        timestamp: Date.now() - 25000000,
        result: { isSpam: false, confidence: 0.99, method: 'none', matchedKeywords: [], aiScore: 0.02, category: 'catHealth' }
    },
];

// ─── Context ─────────────────────────────────────────────────────

const SpamFilterContext = createContext<SpamFilterContextValue | null>(null);

export function SpamFilterProvider({ children }: { children: ReactNode }) {
    // Keywords state
    const [keywords, setKeywords] = useState<BlockedKeyword[]>(DEFAULT_KEYWORDS);

    // AI settings
    const [aiEnabled, setAiEnabled] = useState(true);
    const [aggressiveness, setAggressiveness] = useState(50);
    const [keywordWeighting, setKeywordWeighting] = useState(75);

    // Scan results
    const [scanResults, setScanResults] = useState<ScanResultItem[]>(INITIAL_RESULTS);
    const [threatsBlocked, setThreatsBlocked] = useState(3);
    const [totalScanned, setTotalScanned] = useState(7);

    // Premium state
    const [isPremium, setPremium] = useState(false);

    const keywordTexts = keywords.map((k) => k.text);

    // Sync keywords to iOS extension App Group whenever they change
    React.useEffect(() => {
        const { syncKeywordsToExtension } = require('@/services/keywordSync');
        syncKeywordsToExtension(keywordTexts);
        console.log(`[Aegis] Protected with ${keywordTexts.length} active keyword filters.`);
    }, [keywordTexts]);

    const [silencedNumbers, setSilencedNumbers] = useState<string[]>(['+123456789', '+1 (555) 019-2831', '+44 7700 900077']);

    const addSilencedNumber = useCallback((num: string) => {
        setSilencedNumbers(prev => prev.includes(num) ? prev : [num, ...prev]);
    }, []);

    const removeSilencedNumber = useCallback((num: string) => {
        setSilencedNumbers(prev => prev.filter(n => n !== num));
    }, []);

    // Persist silenced numbers whenever they change
    React.useEffect(() => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const { SILENCED_NUMBERS_KEY } = require('@/services/smsListener');
        AsyncStorage.setItem(SILENCED_NUMBERS_KEY, JSON.stringify(silencedNumbers));
    }, [silencedNumbers]);

    // Load background-captured messages from storage on mount
    React.useEffect(() => {
        const loadBackgroundMessages = async () => {
            const { getSilencedMessages } = require('@/services/smsListener');
            const backgroundMsgs = await getSilencedMessages();
            if (backgroundMsgs && backgroundMsgs.length > 0) {
                // Merge with initial mock results, avoiding duplicates
                setScanResults((prev) => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems: ScanResultItem[] = backgroundMsgs
                        .filter((m: any) => !existingIds.has(m.id))
                        .map((m: any) => ({
                            id: m.id,
                            text: m.text,
                            sender: m.sender,
                            result: m.result,
                            timestamp: m.timestamp
                        }));
                    return [...newItems, ...prev];
                });

                // Update stats
                setThreatsBlocked((prev) => prev + backgroundMsgs.length);
                setTotalScanned((prev) => prev + backgroundMsgs.length);
            }
        };
        loadBackgroundMessages();
    }, []);

    const addKeyword = useCallback((text: string): boolean => {
        const trimmed = text.trim().toLowerCase();
        if (!trimmed) return false;
        if (keywords.some((k) => k.text === trimmed)) return false;

        setKeywords((prev) => [...prev, { id: Date.now().toString(), text: trimmed }]);
        return true;
    }, [keywords]);

    const removeKeyword = useCallback((id: string) => {
        setKeywords((prev) => prev.filter((k) => k.id !== id));
    }, []);

    const scanMessage = useCallback((text: string, sender?: string): ScanResultItem => {
        const safeText = String(text || '');
        let result = classifyMessage(safeText, keywordTexts, {
            aiEnabled,
            aggressiveness,
            keywordWeighting,
        });

        // Check manual silenced list
        if (sender && silencedNumbers.some(n => sender.includes(n) || n.includes(sender))) {
            result = {
                ...result,
                isSpam: true,
                method: 'keyword',
                category: 'catScam'
            };
        }

        const item: ScanResultItem = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            text: safeText,
            sender,
            result,
            timestamp: Date.now(),
        };

        console.log(`[SpamFilterContext] Scanning: [${sender}] "${text.substring(0, 30)}..."`);
        console.log(`[SpamFilterContext] Verdict: ${result.isSpam ? 'SPAM' : 'HAM'} (Cat: ${result.category}, Score: ${result.confidence.toFixed(2)})`);

        setScanResults((prev) => [item, ...prev]);
        setTotalScanned((prev) => prev + 1);
        if (result.isSpam) {
            setThreatsBlocked((prev) => prev + 1);
        }

        return item;
    }, [keywordTexts, aiEnabled, aggressiveness, keywordWeighting, silencedNumbers]);

    // Live SMS Listener for Android
    React.useEffect(() => {
        const { startSmsListener, stopSmsListener } = require('@/services/smsListener');
        const { notifySpamSilenced } = require('@/services/notifications');

        if (Platform.OS === 'android') {
            startSmsListener(
                keywordTexts,
                { aggressiveness, keywordWeighting },
                // onSpam callback
                (msg: any) => {
                    // Update state in real-time
                    setScanResults((prev) => [msg, ...prev]);
                    setThreatsBlocked((prev) => prev + 1);
                    setTotalScanned((prev) => prev + 1);
                    notifySpamSilenced(msg.sender, msg.text);
                }
            );
        }

        return () => stopSmsListener();
    }, [keywordTexts, aggressiveness, keywordWeighting]);

    const scanMessages = useCallback(
        (messages: { id: string; text: string; sender?: string }[]): ScanResultItem[] => {
            const classified = classifyMessages(messages, keywordTexts, {
                aiEnabled,
                aggressiveness,
                keywordWeighting,
            });

            const items: ScanResultItem[] = classified.map((c) => ({
                id: c.id,
                text: c.text,
                sender: c.sender,
                result: c.result,
                timestamp: Date.now(),
            }));

            setScanResults((prev) => [...items, ...prev]);
            setTotalScanned((prev) => prev + messages.length);

            const newThreats = items.filter((i) => i.result.isSpam).length;
            if (newThreats > 0) {
                setThreatsBlocked((prev) => prev + newThreats);
            }

            return items;
        },
        [keywordTexts, aiEnabled, aggressiveness, keywordWeighting],
    );

    const clearResults = useCallback(() => {
        setScanResults([]);
        setThreatsBlocked(0);
        setTotalScanned(0);
    }, []);

    const restorePurchase = useCallback(async () => {
        // Mocking a restoration process
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setPremium(true);
                resolve();
            }, 1500);
        });
    }, []);

    const injectMessage = useCallback((text: string, sender: string) => {
        scanMessage(text, sender);
    }, [scanMessage]);

    const resetAllData = useCallback(async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const { SILENCED_STORAGE_KEY, SILENCED_NUMBERS_KEY } = require('@/services/smsListener');
        
        // 1. Reset memory state
        setKeywords(DEFAULT_KEYWORDS);
        setScanResults([]);
        setThreatsBlocked(0);
        setTotalScanned(0);
        setSilencedNumbers([]);
        
        // 2. Clear storage
        try {
            await AsyncStorage.multiRemove([
                SILENCED_STORAGE_KEY,
                SILENCED_NUMBERS_KEY,
                '@settings_biometric',
            ]);
            console.log('[Aegis] Storage purged successfully.');
        } catch (err) {
            console.error('[Aegis] Failed to clear storage:', err);
        }
    }, []);

    const value = React.useMemo(() => ({
        keywords,
        addKeyword,
        removeKeyword,
        aiEnabled,
        setAiEnabled,
        aggressiveness,
        setAggressiveness,
        keywordWeighting,
        setKeywordWeighting,
        scanResults,
        scanMessage,
        scanMessages,
        clearResults,
        threatsBlocked,
        totalScanned,
        silencedNumbers,
        addSilencedNumber,
        removeSilencedNumber,
        injectMessage,
        isPremium,
        setPremium,
        restorePurchase,
        resetAllData,
    }), [
        keywords, addKeyword, removeKeyword, aiEnabled, aggressiveness, 
        keywordWeighting, scanResults, scanMessage, scanMessages, 
        clearResults, threatsBlocked, totalScanned, silencedNumbers, 
        addSilencedNumber, removeSilencedNumber, injectMessage, 
        isPremium, restorePurchase, resetAllData
    ]);

    return (
        <SpamFilterContext.Provider value={value}>
            {children}
        </SpamFilterContext.Provider>
    );
}

export function useSpamFilter() {
    const ctx = useContext(SpamFilterContext);
    if (!ctx) {
        throw new Error('useSpamFilter must be used within a SpamFilterProvider');
    }
    return ctx;
}

export default SpamFilterContext;
