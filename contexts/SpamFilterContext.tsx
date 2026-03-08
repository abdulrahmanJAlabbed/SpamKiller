/**
 * SpamFilterContext — Shared state for spam filter across all screens
 * 
 * Provides keywords, AI settings, scan results, and threat counter
 * to all screens via React context.
 */

import { classifyMessage, classifyMessages, type SpamResult } from '@/services/spamFilter';
import type { BlockedKeyword } from '@/types';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

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

    // Stats
    threatsBlocked: number;
    totalScanned: number;
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
    const [scanResults, setScanResults] = useState<ScanResultItem[]>([]);
    const [threatsBlocked, setThreatsBlocked] = useState(0);
    const [totalScanned, setTotalScanned] = useState(0);

    const keywordTexts = keywords.map((k) => k.text);

    // Sync keywords to iOS extension App Group whenever they change
    React.useEffect(() => {
        const { syncKeywordsToExtension } = require('@/services/keywordSync');
        syncKeywordsToExtension(keywordTexts);
    }, [keywordTexts]);

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
        const result = classifyMessage(text, keywordTexts, {
            aiEnabled,
            aggressiveness,
            keywordWeighting,
        });

        const item: ScanResultItem = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            text,
            sender,
            result,
            timestamp: Date.now(),
        };

        setScanResults((prev) => [item, ...prev]);
        setTotalScanned((prev) => prev + 1);
        if (result.isSpam) {
            setThreatsBlocked((prev) => prev + 1);
        }

        return item;
    }, [keywordTexts, aiEnabled, aggressiveness, keywordWeighting]);

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
    }, []);

    return (
        <SpamFilterContext.Provider
            value={{
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
            }}
        >
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
