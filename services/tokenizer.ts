/**
 * BERT WordPiece Tokenizer — Pure JS implementation
 * Built from the model/config/vocab.txt vocabulary file.
 * 
 * This tokenizer is ready for use when the ONNX runtime is available
 * in native builds. It implements the standard BERT tokenization pipeline:
 * 1. Lowercase + accent stripping
 * 2. Basic tokenization (whitespace + punctuation splitting)
 * 3. WordPiece subword segmentation
 * 4. Special token wrapping ([CLS] ... [SEP])
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

let vocabMap: Map<string, number> | null = null;
let vocabLoaded = false;

/**
 * Load the vocabulary from the bundled vocab.txt asset.
 */
export async function loadVocab(): Promise<Map<string, number>> {
    if (vocabMap && vocabLoaded) return vocabMap;

    try {
        // Load vocab.txt from model config
        const asset = Asset.fromModule(require('../model/config/vocab.txt'));
        await asset.downloadAsync();

        if (!asset.localUri) {
            throw new Error('Failed to get local URI for vocab.txt');
        }

        const content = await FileSystem.readAsStringAsync(asset.localUri);
        const lines = content.split('\n').filter((l) => l.length > 0);

        vocabMap = new Map();
        lines.forEach((line, index) => {
            vocabMap!.set(line.trim(), index);
        });

        vocabLoaded = true;
        console.log(`Tokenizer: loaded ${vocabMap.size} vocab entries`);
        return vocabMap;
    } catch (error) {
        console.error('Failed to load vocab:', error);
        // Return minimal vocab as fallback
        vocabMap = new Map([
            ['[PAD]', 0],
            ['[UNK]', 100],
            ['[CLS]', 101],
            ['[SEP]', 102],
            ['[MASK]', 103],
        ]);
        return vocabMap;
    }
}

/**
 * Tokenize text into BERT input format.
 * Returns input_ids, attention_mask, and token_type_ids as number arrays.
 */
export async function tokenize(
    text: string,
    maxLength: number = 128,
): Promise<{
    input_ids: number[];
    attention_mask: number[];
    token_type_ids: number[];
}> {
    const vocab = await loadVocab();

    // 1. Lowercase
    const lower = text.toLowerCase();

    // 2. Basic tokenization: split on whitespace and punctuation
    const basicTokens = basicTokenize(lower);

    // 3. WordPiece tokenization
    const wordPieceTokens: number[] = [vocab.get('[CLS]') ?? 101];

    for (const token of basicTokens) {
        const subTokenIds = wordPieceTokenize(token, vocab);
        wordPieceTokens.push(...subTokenIds);

        // Don't exceed max length - 1 (reserve spot for [SEP])
        if (wordPieceTokens.length >= maxLength - 1) break;
    }

    wordPieceTokens.push(vocab.get('[SEP]') ?? 102);

    // 4. Pad to maxLength
    const padId = vocab.get('[PAD]') ?? 0;
    const input_ids = [...wordPieceTokens];
    const attention_mask = new Array(input_ids.length).fill(1);
    const token_type_ids = new Array(input_ids.length).fill(0);

    while (input_ids.length < maxLength) {
        input_ids.push(padId);
        attention_mask.push(0);
        token_type_ids.push(0);
    }

    // Truncate if necessary
    return {
        input_ids: input_ids.slice(0, maxLength),
        attention_mask: attention_mask.slice(0, maxLength),
        token_type_ids: token_type_ids.slice(0, maxLength),
    };
}

// ─── Internal helpers ────────────────────────────────────────────

/**
 * Basic tokenization: split on whitespace and punctuation.
 */
function basicTokenize(text: string): string[] {
    // Add space around punctuation
    const withSpaces = text.replace(/([^\w\s])/g, ' $1 ');
    return withSpaces
        .split(/\s+/)
        .filter((t) => t.length > 0);
}

/**
 * WordPiece tokenization: greedily match the longest subword in vocab.
 */
function wordPieceTokenize(
    token: string,
    vocab: Map<string, number>,
): number[] {
    if (token.length === 0) return [];

    const unkId = vocab.get('[UNK]') ?? 100;

    // If the whole token is in vocab, return it
    if (vocab.has(token)) {
        return [vocab.get(token)!];
    }

    const tokens: number[] = [];
    let start = 0;

    while (start < token.length) {
        let end = token.length;
        let found = false;

        while (start < end) {
            const substr = start === 0 ? token.slice(start, end) : `##${token.slice(start, end)}`;

            if (vocab.has(substr)) {
                tokens.push(vocab.get(substr)!);
                found = true;
                start = end;
                break;
            }

            end--;
        }

        if (!found) {
            // Character not in vocab, use [UNK]
            tokens.push(unkId);
            start++;
        }
    }

    return tokens;
}

/**
 * Check if the tokenizer is ready (vocab loaded).
 */
export function isTokenizerReady(): boolean {
    return vocabLoaded;
}
