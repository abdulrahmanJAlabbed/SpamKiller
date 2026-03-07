/**
 * Settings Screen — Preferences, language selector, cloud sync
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { LanguageItem } from '@/components/ui/LanguageItem';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { LanguageOption } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const [autoProtection, setAutoProtection] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="Preferences"
                rightIcon="check"
                onRightPress={() => { }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Core Security Toggles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CORE SECURITY</Text>
                    <View style={styles.settingsCard}>
                        <SettingsRow
                            icon="shield-check"
                            label="Auto-Protection"
                            description="Real-time threat mitigation"
                            value={autoProtection}
                            onValueChange={setAutoProtection}
                        />
                        <View style={styles.divider} />
                        <SettingsRow
                            icon="bell-ring"
                            label="Notifications"
                            description="Security alerts & updates"
                            value={notifications}
                            onValueChange={setNotifications}
                        />
                        <View style={styles.divider} />
                        <SettingsRow
                            icon="fingerprint"
                            label="Biometric Auth"
                            description="FaceID or TouchID login"
                            value={biometricAuth}
                            onValueChange={setBiometricAuth}
                        />
                    </View>
                </View>

                {/* AI Settings link */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI PROTECTION</Text>
                    <View style={styles.settingsCard}>
                        <SettingsRow
                            icon="brain"
                            label="AI Spam Detector"
                            description="Neural network protection"
                            onPress={() => router.push({ pathname: '/ai-settings' })}
                            showChevron
                        />
                    </View>
                </View>

                {/* Language Selector */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>SYSTEM LANGUAGE</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{LANGUAGES.length} AVAILABLE</Text>
                        </View>
                    </View>
                    <View style={styles.languageCard}>
                        {LANGUAGES.map((lang, index) => (
                            <React.Fragment key={lang.code}>
                                {index > 0 && <View style={styles.divider} />}
                                <LanguageItem
                                    flag={lang.flag}
                                    name={lang.name}
                                    isSelected={selectedLanguage === lang.code}
                                    onPress={() => setSelectedLanguage(lang.code)}
                                />
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Cloud Sync */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CLOUD SYNCHRONIZATION</Text>
                    <View style={styles.syncCard}>
                        <View style={styles.syncHeader}>
                            <MaterialCommunityIcons
                                name="cloud-check"
                                size={22}
                                color={Colors.primary}
                            />
                            <Text style={styles.syncTitle}>Everything's backed up</Text>
                        </View>
                        <Text style={styles.syncDescription}>
                            Your preferences and secure keys are encrypted and synced across
                            your devices using 256-bit AES protection.
                        </Text>
                        <View style={styles.syncFooter}>
                            <View>
                                <Text style={styles.syncLabel}>LAST SYNCED</Text>
                                <Text style={styles.syncValue}>2 minutes ago</Text>
                            </View>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.syncButton,
                                    pressed && styles.syncButtonPressed,
                                ]}
                            >
                                <Text style={styles.syncButtonText}>Sync Now</Text>
                            </Pressable>
                        </View>
                        {/* Decorative orb */}
                        <View style={styles.syncOrb} />
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    content: {
        paddingBottom: 40,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: 8,
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    badge: {
        backgroundColor: Colors.primaryBorder,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        color: Colors.primary,
        fontSize: FontSize['2xs'],
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    settingsCard: {
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        padding: 8,
        overflow: 'hidden',
    },
    languageCard: {
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderDark,
        marginHorizontal: 12,
    },
    syncCard: {
        borderRadius: BorderRadius['2xl'],
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
        backgroundColor: Colors.primaryLight,
        overflow: 'hidden',
        position: 'relative',
    },
    syncHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    syncTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    syncDescription: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        lineHeight: 20,
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    syncFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    syncLabel: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        fontWeight: '700',
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    syncValue: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: '500',
        marginTop: 2,
        fontFamily: 'Inter',
    },
    syncButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.lg,
    },
    syncButtonPressed: {
        opacity: 0.9,
    },
    syncButtonText: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    syncOrb: {
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: Colors.primaryLight,
        opacity: 0.5,
    },
});
