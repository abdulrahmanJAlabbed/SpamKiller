/**
 * SpamKiller / Shield OS — Type Definitions
 */

export interface ActivityItem {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    status: 'blocked' | 'snoozed' | 'allowed';
    timestamp: string;
    source: string;
}

export interface BlockedKeyword {
    id: string;
    text: string;
}

export interface UserPreferences {
    autoProtection: boolean;
    notifications: boolean;
    biometricAuth: boolean;
    language: string;
    aiDetectionEnabled: boolean;
    detectionAggressiveness: number;
    keywordWeighting: number;
}

export interface LanguageOption {
    code: string;
    name: string;
    flag: string;
}

export type UpgradeVariant = 'filter' | 'ai';

export interface UpgradeConfig {
    title: string;
    subtitle: string;
    description: string;
    price: string;
    icon: string;
    features: string[];
    ctaText: string;
}
