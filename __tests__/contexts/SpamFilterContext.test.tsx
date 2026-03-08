import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { SpamFilterProvider, useSpamFilter } from '../../contexts/SpamFilterContext';

// Mock the keywordService which is required in the Context to prevent native module crashes during tests.
jest.mock('../../services/keywordSync', () => ({
    syncKeywordsToExtension: jest.fn(),
    getExtensionFilterLog: jest.fn().mockResolvedValue([]),
}));

// Mock the spamFilter AI classifier to return predictable results
jest.mock('../../services/spamFilter', () => ({
    classifyMessage: jest.fn((text, keywords, settings) => {
        const isSpam = keywords.some((k: string) => text.toLowerCase().includes(k.toLowerCase()));
        return {
            isSpam: isSpam || (settings.aiEnabled && text.includes('ai-spam')),
            score: isSpam ? 0.99 : 0.05,
            matchedKeywords: isSpam ? [keywords.find((k: string) => text.toLowerCase().includes(k.toLowerCase()))] : []
        };
    }),
    classifyMessages: jest.fn(),
}));

describe('SpamFilterContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SpamFilterProvider>{children}</SpamFilterProvider>
    );

    it('initializes with default keywords', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });
        expect(result.current.keywords.length).toBeGreaterThan(0);
        expect(result.current.keywords.some(k => k.text === 'spam')).toBe(true);
    });

    it('adds a new valid keyword', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });

        act(() => {
            const success = result.current.addKeyword('FREE MONEY');
            expect(success).toBe(true);
        });

        expect(result.current.keywords.some(k => k.text === 'free money')).toBe(true);
    });

    it('rejects duplicate or empty keywords', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });

        act(() => {
            const success1 = result.current.addKeyword('  '); // empty
            const success2 = result.current.addKeyword('spam'); // duplicate of default

            expect(success1).toBe(false);
            expect(success2).toBe(false);
        });
    });

    it('removes a keyword by id', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });
        const initialCount = result.current.keywords.length;
        const targetId = result.current.keywords[0].id;

        act(() => {
            result.current.removeKeyword(targetId);
        });

        expect(result.current.keywords.length).toBe(initialCount - 1);
        expect(result.current.keywords.some(k => k.id === targetId)).toBe(false);
    });

    it('scans a message and increments counters when spam is found', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });

        expect(result.current.threatsBlocked).toBe(0);
        expect(result.current.totalScanned).toBe(0);

        let scanResult: any;
        act(() => {
            // Using a default keyword "spam"
            scanResult = result.current.scanMessage('This is a Spam message!');
        });

        expect(scanResult.result.isSpam).toBe(true);
        expect(scanResult.result.matchedKeywords).toContain('spam');

        // Note: totalScanned updates inside the hook state
        expect(result.current.threatsBlocked).toBe(1);
        expect(result.current.totalScanned).toBe(1);
        expect(result.current.scanResults.length).toBe(1);
    });

    it('respects AI settings for non-keyword spam when enabled', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });

        let scanResult: any;
        act(() => {
            scanResult = result.current.scanMessage('This is ai-spam message');
        });

        expect(scanResult.result.isSpam).toBe(true);
    });

    it('clears scan results correctly', () => {
        const { result } = renderHook(() => useSpamFilter(), { wrapper });

        act(() => {
            result.current.scanMessage('This is a spam message!'); // Add one
        });

        expect(result.current.scanResults.length).toBe(1);

        act(() => {
            result.current.clearResults();
        });

        expect(result.current.scanResults.length).toBe(0);
        // Counters should not reset on clear
        expect(result.current.totalScanned).toBe(1);
        expect(result.current.threatsBlocked).toBe(1);
    });
});
