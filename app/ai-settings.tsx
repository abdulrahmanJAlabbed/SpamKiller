/**
 * AI Spam Detector Settings — Neural Sanctum Overhaul
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { NeuralCore } from '@/components/ui/NeuralCore';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AISettingsScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { 
        aiEnabled, 
        setAiEnabled, 
        isPremium, 
        setPremium, 
        restorePurchase 
    } = useSpamFilter();

    const [isRestoring, setIsRestoring] = useState(false);

    const handleToggle = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setAiEnabled(value);
    };

    const handleRestore = async () => {
        setIsRestoring(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await restorePurchase();
        setIsRestoring(false);
    };

    const handlePurchase = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        router.push('/upgrade');
    };

    return (
        <View style={styles.screen}>
            <BackgroundTexture />
            <View style={{ paddingTop: insets.top }}>
                <ScreenHeader
                    title={t('aiSettings.title')}
                    showBack
                    onBack={() => router.back()}
                />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Visualization */}
                <View style={styles.heroSection}>
                    <View style={styles.premiumBadge}>
                        <MaterialCommunityIcons name="shield-crown-outline" size={14} color="#f59e0b" />
                        <Text style={styles.premiumBadgeText}>
                            {isPremium ? 'ACCESS GRANTED' : 'RESTRICTED SECTOR'}
                        </Text>
                    </View>
                    
                    <NeuralCore active={aiEnabled} />

                    <View style={styles.heroInfo}>
                        <Text style={styles.heroTitle}>{t('aiSettings.heroTitle')}</Text>
                        <View style={[styles.statusBadge, { borderColor: aiEnabled ? Colors.primary : Colors.borderDark }]}>
                            <View style={[styles.statusDot, { backgroundColor: aiEnabled ? Colors.primary : Colors.textMuted }]} />
                            <Text style={[styles.statusText, { color: aiEnabled ? Colors.primary : Colors.textMuted }]}>
                                {aiEnabled ? t('aiSettings.fluxActive') : t('aiSettings.standby')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Main Toggle Card */}
                <GlassCard variant={aiEnabled ? "primary" : "solid"} style={styles.mainToggleCard}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleText}>
                            <Text style={styles.toggleLabel}>{t('aiSettings.autoAiDefense')}</Text>
                            <Text style={styles.toggleDesc}>
                                {aiEnabled ? t('aiSettings.realTimeActive') : t('aiSettings.protectionPaused')}
                            </Text>
                        </View>
                        <ToggleSwitch value={aiEnabled} onValueChange={handleToggle} />
                    </View>
                </GlassCard>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>{t('aiSettings.neuralLoad')}</Text>
                            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={16} color={Colors.textMuted} />
                        </View>
                        <Text style={styles.metricValue}>0.04<Text style={styles.metricUnit}>ms</Text></Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '15%', backgroundColor: Colors.primary }]} />
                        </View>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>{t('aiSettings.semanticIntegrity')}</Text>
                            <MaterialCommunityIcons name="shield-key-outline" size={16} color={Colors.textMuted} />
                        </View>
                        <Text style={styles.metricValue}>99.9<Text style={styles.metricUnit}>%</Text></Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '99.9%', backgroundColor: Colors.successGreen }]} />
                        </View>
                    </View>
                </View>

                {/* Purchase/Restore Section */}
                {!isPremium ? (
                    <View style={styles.monetizationSection}>
                        <Pressable 
                            style={({ pressed }) => [styles.purchaseButton, pressed && styles.pressed]}
                            onPress={handlePurchase}
                        >
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.backgroundDark} />
                            <Text style={styles.purchaseButtonText}>{t('aiSettings.unlockPremium')}</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
                            onPress={handleRestore}
                            disabled={isRestoring}
                        >
                            {isRestoring ? (
                                <ActivityIndicator size="small" color={Colors.textSecondary} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="refresh" size={18} color={Colors.textSecondary} />
                                    <Text style={styles.restoreButtonText}>{t('aiSettings.restore')}</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.premiumStatus}>
                        <MaterialCommunityIcons name="check-decagram" size={20} color={Colors.successGreen} />
                        <Text style={styles.premiumStatusText}>{t('aiSettings.purchased')}</Text>
                    </View>
                )}

                {/* Info Card */}
                <GlassCard variant="solid" style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="head-snowflake-outline" size={24} color={Colors.primary} />
                        <View style={styles.infoText}>
                            <Text style={styles.infoTitle}>{t('aiSettings.neuralProtection')}</Text>
                            <Text style={styles.infoDesc}>{t('aiSettings.neuralDesc')}</Text>
                        </View>
                    </View>
                </GlassCard>
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
        paddingHorizontal: Spacing.xl,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 8,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 24,
        gap: 6,
    },
    premiumBadgeText: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    heroInfo: {
        alignItems: 'center',
        marginTop: 24,
    },
    heroTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize['4xl'],
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mainToggleCard: {
        padding: 20,
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleText: {
        flex: 1,
        gap: 2,
    },
    toggleLabel: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    toggleDesc: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        opacity: 0.7,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricTitle: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    metricValue: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginBottom: 8,
    },
    metricUnit: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '400',
    },
    progressBarBg: {
        height: 2,
        backgroundColor: Colors.borderDark,
        borderRadius: 1,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 1,
    },
    monetizationSection: {
        marginBottom: 24,
        gap: 12,
    },
    purchaseButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: BorderRadius.xl,
        gap: 8,
    },
    purchaseButtonText: {
        color: Colors.backgroundDark,
        fontSize: FontSize.base,
        fontWeight: '700',
    },
    restoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    restoreButtonText: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    premiumStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: 'rgba(0, 255, 170, 0.05)',
        borderRadius: BorderRadius.xl,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 170, 0.1)',
    },
    premiumStatusText: {
        color: Colors.successGreen,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    infoCard: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    infoText: {
        flex: 1,
        gap: 4,
    },
    infoTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '700',
    },
    infoDesc: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        lineHeight: 18,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
