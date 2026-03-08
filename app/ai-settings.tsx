/**
 * AI Spam Detector Settings — Neural protection hero, detection controls, info cards
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AGGRESSIVENESS_LABELS: Record<number, string> = {
    25: 'Relaxed',
    50: 'Balanced',
    75: 'Aggressive',
    100: 'Maximum',
};

function getAggressivenessLabel(val: number): string {
    if (val <= 25) return 'Relaxed';
    if (val <= 50) return 'Balanced';
    if (val <= 75) return 'Aggressive';
    return 'Maximum';
}

export default function AISettingsScreen() {
    const insets = useSafeAreaInsets();
    const { aiEnabled, setAiEnabled } = useSpamFilter();

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="AI Threat Detection"
                showBack
                onBack={() => router.back()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIconWrapper}>
                        <View style={styles.heroGlow} />
                        <View style={styles.heroIconContainer}>
                            <MaterialCommunityIcons
                                name="shield-lock"
                                size={48}
                                color={aiEnabled ? Colors.primary : Colors.textMuted}
                            />
                        </View>
                    </View>
                    <Text style={styles.heroTitle}>Neural Protection</Text>
                    <Text style={styles.heroDescription}>
                        Shield OS uses local neural networks to automatically identify and block new spam patterns. Your communication data never leaves this device.
                    </Text>
                </View>

                {/* Main Toggle */}
                <GlassCard variant="solid" style={StyleSheet.flatten([styles.toggleCard, aiEnabled && styles.toggleCardActive])}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleContent}>
                            <Text style={styles.toggleLabel}>Auto AI Defense</Text>
                            <Text style={styles.toggleDescription}>
                                {aiEnabled ? 'Real-time filtering is actively protecting you.' : 'Protection is currently paused.'}
                            </Text>
                        </View>
                        <ToggleSwitch value={aiEnabled} onValueChange={setAiEnabled} />
                    </View>
                </GlassCard>

                {/* Info Cards */}
                <View style={styles.infoCards}>
                    <View style={[styles.infoCard, aiEnabled && styles.infoCardActive]}>
                        <MaterialCommunityIcons
                            name="head-cog"
                            size={22}
                            color={aiEnabled ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={styles.infoLabel}>Local ML</Text>
                        <Text style={styles.infoValue}>v4.2 Engine</Text>
                    </View>
                    <View style={[styles.infoCard, aiEnabled && styles.infoCardActive]}>
                        <MaterialCommunityIcons
                            name="shield-check"
                            size={22}
                            color={aiEnabled ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={styles.infoLabel}>Privacy First</Text>
                        <Text style={styles.infoValue}>Zero Cloud Logs</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
        paddingHorizontal: Spacing['2xl'],
        paddingBottom: 40,
    },
    // Hero
    heroSection: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 24,
    },
    heroIconWrapper: {
        position: 'relative',
        marginBottom: 24,
    },
    heroGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 24,
        opacity: 0.15,
        transform: [{ scale: 1.4 }],
    },
    heroIconContainer: {
        backgroundColor: Colors.primaryLight,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
    },
    heroTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize['3xl'],
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    heroDescription: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 16,
        fontFamily: 'Inter',
    },
    // Toggle
    toggleCard: {
        marginBottom: 32,
        padding: 16,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    toggleCardActive: {
        borderColor: Colors.primaryBorder,
        backgroundColor: 'rgba(147, 90, 246, 0.08)',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    toggleContent: {
        flex: 1,
        gap: 4,
    },
    toggleLabel: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    toggleDescription: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
        lineHeight: 20,
    },
    // Info Cards
    infoCards: {
        flexDirection: 'row',
        gap: 16,
    },
    infoCard: {
        flex: 1,
        padding: 16,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        backgroundColor: Colors.surfaceDark,
        gap: 8,
    },
    infoCardActive: {
        borderColor: Colors.primaryBorder,
        backgroundColor: Colors.primaryLight,
    },
    infoLabel: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    infoValue: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        fontFamily: 'Inter',
    },
});
