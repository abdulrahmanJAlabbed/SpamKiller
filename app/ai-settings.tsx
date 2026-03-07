/**
 * AI Spam Detector Settings — Neural protection hero, detection controls, info cards
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { CustomSlider } from '@/components/ui/CustomSlider';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
    const [aiEnabled, setAiEnabled] = useState(true);
    const [aggressiveness, setAggressiveness] = useState(50);
    const [keywordWeighting, setKeywordWeighting] = useState(75);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="AI Spam Detector"
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
                                color={Colors.primary}
                            />
                        </View>
                    </View>
                    <Text style={styles.heroTitle}>Neural Protection</Text>
                    <Text style={styles.heroDescription}>
                        Shield OS uses local neural networks to identify spam patterns.
                        Your communication data never leaves this device.
                    </Text>
                </View>

                {/* Main Toggle */}
                <GlassCard variant="solid" style={styles.toggleCard}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleContent}>
                            <Text style={styles.toggleLabel}>Enable Auto AI Detection</Text>
                            <Text style={styles.toggleDescription}>
                                Real-time filtering for calls and SMS.
                            </Text>
                        </View>
                        <ToggleSwitch value={aiEnabled} onValueChange={setAiEnabled} />
                    </View>
                </GlassCard>

                {/* Advanced Controls */}
                <View style={styles.controlsSection}>
                    <Text style={styles.controlsTitle}>ADVANCED CONTROLS</Text>

                    <View style={styles.slidersContainer}>
                        <CustomSlider
                            value={aggressiveness}
                            onValueChange={setAggressiveness}
                            label="Detection Aggressiveness"
                            description="Higher levels may block more legitimate contacts."
                            displayValue={getAggressivenessLabel(aggressiveness)}
                        />

                        <View style={styles.sliderDivider} />

                        <CustomSlider
                            value={keywordWeighting}
                            onValueChange={setKeywordWeighting}
                            label="Keyword Weighting"
                            description="Sensitivity to common spam trigger phrases."
                            displayValue={`${keywordWeighting}%`}
                        />
                    </View>
                </View>

                {/* Info Cards */}
                <View style={styles.infoCards}>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons
                            name="head-cog"
                            size={22}
                            color={Colors.primary}
                        />
                        <Text style={styles.infoLabel}>Local ML</Text>
                        <Text style={styles.infoValue}>v4.2 Engine</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons
                            name="shield-check"
                            size={22}
                            color={Colors.primary}
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
    },
    // Controls
    controlsSection: {
        marginBottom: 32,
    },
    controlsTitle: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 24,
        fontFamily: 'Inter',
    },
    slidersContainer: {
        gap: 24,
    },
    sliderDivider: {
        height: 1,
        backgroundColor: Colors.borderDark,
        marginVertical: 8,
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
        borderColor: Colors.primaryBorder,
        backgroundColor: Colors.primaryLight,
        gap: 8,
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
