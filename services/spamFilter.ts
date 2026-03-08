/**
 * Spam Filter Service — Dual-layer spam detection (keyword + AI)
 * 
 * Layer 1: Keyword matching — fast, always available
 * Layer 2: AI ONNX model — requires native build, graceful fallback
 */

export interface SpamResult {
    isSpam: boolean;
    confidence: number;
    method: 'keyword' | 'ai' | 'both' | 'none';
    matchedKeywords: string[];
    aiScore: number | null;
}

/**
 * Classify a message using keyword matching and optionally AI.
 */
export function classifyMessage(
    text: string,
    keywords: string[],
    options: {
        aiEnabled?: boolean;
        aggressiveness?: number; // 0-100
        keywordWeighting?: number; // 0-100
    } = {},
): SpamResult {
    const { aggressiveness = 50, keywordWeighting = 75 } = options;

    // Layer 1: Keyword matching
    const keywordResult = matchKeywords(text, keywords, keywordWeighting);

    // Layer 2: AI model (placeholder — requires native build with onnxruntime)
    // In a native build, this would call the ONNX inference service
    const aiScore: number | null = null;

    // Combine results
    const isSpam = determineSpam(keywordResult, aiScore, aggressiveness);
    const method = getMethod(keywordResult.matched.length > 0, aiScore !== null);

    return {
        isSpam,
        confidence: calculateConfidence(keywordResult, aiScore, aggressiveness),
        method,
        matchedKeywords: keywordResult.matched,
        aiScore,
    };
}

/**
 * Batch classify multiple messages.
 */
export function classifyMessages(
    messages: { id: string; text: string; sender?: string }[],
    keywords: string[],
    options: {
        aiEnabled?: boolean;
        aggressiveness?: number;
        keywordWeighting?: number;
    } = {},
): Array<{ id: string; text: string; sender?: string; result: SpamResult }> {
    return messages.map((msg) => ({
        ...msg,
        result: classifyMessage(msg.text, keywords, options),
    }));
}

// ─── Internal helpers ────────────────────────────────────────────

interface KeywordMatchResult {
    matched: string[];
    score: number; // 0-1
}

function matchKeywords(
    text: string,
    keywords: string[],
    weighting: number,
): KeywordMatchResult {
    if (keywords.length === 0) {
        return { matched: [], score: 0 };
    }

    const lowerText = text.toLowerCase();
    const matched = keywords.filter((kw) => lowerText.includes(kw.toLowerCase()));

    if (matched.length === 0) {
        return { matched: [], score: 0 };
    }

    // Score: ratio of matched keywords, amplified by weighting
    const rawScore = matched.length / Math.max(keywords.length, 1);
    // Weighting amplifies the score: at 100% weighting, even 1 match = high score
    const weightFactor = weighting / 100;
    const score = Math.min(1, rawScore + (weightFactor * 0.5 * (matched.length > 0 ? 1 : 0)));

    return { matched, score };
}

function determineSpam(
    keywordResult: KeywordMatchResult,
    aiScore: number | null,
    aggressiveness: number,
): boolean {
    // Threshold decreases with aggressiveness (0-100)
    // At 0 aggressiveness: threshold = 0.8 (very conservative)
    // At 50: threshold = 0.4
    // At 100: threshold = 0.1 (very aggressive)
    const threshold = 0.8 - (aggressiveness / 100) * 0.7;

    // If we have both AI and keyword, combine them
    if (aiScore !== null && keywordResult.matched.length > 0) {
        const combined = (aiScore * 0.6) + (keywordResult.score * 0.4);
        return combined >= threshold;
    }

    // AI only
    if (aiScore !== null) {
        return aiScore >= threshold;
    }

    // Keyword only
    if (keywordResult.matched.length > 0) {
        return keywordResult.score >= threshold;
    }

    return false;
}

function calculateConfidence(
    keywordResult: KeywordMatchResult,
    aiScore: number | null,
    aggressiveness: number,
): number {
    if (aiScore !== null && keywordResult.matched.length > 0) {
        // Both sources agree — high confidence
        return Math.min(0.99, (aiScore * 0.6) + (keywordResult.score * 0.4));
    }

    if (aiScore !== null) {
        return aiScore;
    }

    if (keywordResult.matched.length > 0) {
        // Keyword-only confidence is based on how many matched
        return Math.min(0.95, keywordResult.score);
    }

    // No detection — confident it's clean
    return 1 - (aggressiveness / 200); // slightly less confident at high aggressiveness
}

function getMethod(
    hasKeyword: boolean,
    hasAi: boolean,
): SpamResult['method'] {
    if (hasKeyword && hasAi) return 'both';
    if (hasKeyword) return 'keyword';
    if (hasAi) return 'ai';
    return 'none';
}
