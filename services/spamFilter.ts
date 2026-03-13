/**
 * Spam Filter Service — Dual-layer spam detection (keyword + AI)
 * 
 * Layer 1: Keyword matching — fast, always available
 * Layer 2: AI ONNX model — requires native build, graceful fallback
 */

export type MessageCategory = 
    | 'catScam' 
    | 'catPromos' 
    | 'catOtp' 
    | 'catBank' 
    | 'catDelivery' 
    | 'catHealth' 
    | 'catWork' 
    | 'catOthers';

export interface SpamResult {
    isSpam: boolean;
    confidence: number;
    method: 'keyword' | 'ai' | 'both' | 'none';
    matchedKeywords: string[];
    aiScore: number | null;
    category: MessageCategory;
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

    // Layer 3: Categorization
    const category = categorizeMessage(text, isSpam);

    return {
        isSpam,
        confidence: calculateConfidence(keywordResult, aiScore, aggressiveness),
        method,
        matchedKeywords: keywordResult.matched,
        aiScore,
        category,
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
    
    const matched = keywords.filter((kw) => {
        const pattern = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
        return pattern.test(lowerText);
    });

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
    const threshold = 0.8 - (aggressiveness / 100) * 0.7;

    // RULE: If any blocklist keyword matches, it's definitively spam
    if (keywordResult.matched.length > 0) {
        return true; 
    }

    // AI only fallback
    if (aiScore !== null) {
        return aiScore >= threshold;
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

/**
 * Assign a category to the message based on keywords and patterns.
 */
function categorizeMessage(text: string, isSpam: boolean): MessageCategory {
    const t = text.toLowerCase();

    // 1. Scam & Phishing (High priority if isSpam)
    if (isSpam) {
        const scamPatterns = ['winner', 'won', 'claim', 'gift card', 'lottery', 'inheritance', 'bank account freeze', 'verify address', 'unusual activity'];
        if (scamPatterns.some(p => t.includes(p))) return 'catScam';
    }

    // 2. OTP & Auth
    const otpPatterns = ['otp', 'verification code', 'code is', 'don\'t share', 'your code', 'verification', 'auth'];
    if (otpPatterns.some(p => t.includes(p))) return 'catOtp';

    // 3. Banking & Bills
    const bankPatterns = ['bank', 'chase', 'wells fargo', 'boa', 'payment', 'bill', 'statement', 'balance', 'credit card'];
    if (bankPatterns.some(p => t.includes(p))) return 'catBank';

    // 4. Deliveries
    const deliveryPatterns = ['ups', 'fedex', 'usps', 'dhl', 'package', 'delivered', 'tracking', 'shipped', 'delivery'];
    if (deliveryPatterns.some(p => t.includes(p))) return 'catDelivery';

    // 5. Health & Medical
    const healthPatterns = ['doctor', 'appointment', 'pharmacy', 'prescription', 'health', 'medical', 'test result', 'clinic'];
    if (healthPatterns.some(p => t.includes(p))) return 'catHealth';

    // 6. Work & Teams
    const workPatterns = ['meeting', 'calendar', 'slack', 'jira', 'confluence', 'zoom', 'invite', 'team', 'shift', 'manager'];
    if (workPatterns.some(p => t.includes(p))) return 'catWork';

    // 7. Promos & Coupons
    const promoPatterns = ['off', 'save', 'discount', 'deal', 'offer', 'sale', 'shop', 'limited time', 'coupon', 'promo'];
    if (promoPatterns.some(p => t.includes(p))) return 'catPromos';

    // Default
    return isSpam ? 'catScam' : 'catOthers';
}
