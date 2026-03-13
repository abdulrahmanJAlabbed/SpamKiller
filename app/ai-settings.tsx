/**
 * AI Spam Detector Settings — Neural protection hero, detection controls, info cards
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
    const { t, i18n } = useTranslation();
    const { aiEnabled, setAiEnabled } = useSpamFilter();

    // Pulse animation for the hero icon
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        // Animation removed per user request for a more stable UI
        pulseAnim.setValue(1);
    }, [aiEnabled, pulseAnim]);

    const handleToggle = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setAiEnabled(value);
    };

    return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
            <BackgroundTexture />
            <ScreenHeader
                title={t('aiSettings.title')}
                showBack
                onBack={() => router.back()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.premiumBadge}>
                        <MaterialCommunityIcons name="star-four-points" size={14} color="#f59e0b" />
                        <Text style={styles.premiumBadgeText}>AEGIS TIER-1 ACCESS</Text>
                    </View>
                    <View style={styles.heroIconWrapper}>
                        <Animated.View 
                            style={[
                                styles.heroGlow, 
                                { 
                                    opacity: aiEnabled ? 0.3 : 0.05,
                                    transform: [{ scale: pulseAnim }]
                                }
                            ]} 
                        />
                        <View style={[styles.heroIconContainer, !aiEnabled && styles.heroIconContainerDisabled]}>
                            <MaterialCommunityIcons
                                name="creation"
                                size={56}
                                color={aiEnabled ? Colors.primary : Colors.textMuted}
                            />
                        </View>
                        <View style={styles.statusDotWrapper}>
                           <View style={[styles.statusDot, { backgroundColor: aiEnabled ? Colors.primary : Colors.textMuted }]} />
                        </View>
                    </View>
                    <Text style={styles.heroTitle}>Neural Silence Engine</Text>
                    <Text style={styles.heroDescription}>
                        Deep semantic analysis of incoming traffic. On-device intelligence neutralizes deceptive intent with elite-grade accuracy.
                    </Text>
                </View>

                {/* Main Toggle */}
                <GlassCard variant="solid" style={StyleSheet.flatten([styles.toggleCard, aiEnabled && styles.toggleCardActive])}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleContent}>
                            <Text style={styles.toggleLabel}>Auto AI Defense</Text>
                            <Text style={styles.toggleDescription}>
                                {aiEnabled ? 'Deep packet inspection is active.' : 'Neural engine is on standby.'}
                            </Text>
                        </View>
                        <ToggleSwitch value={aiEnabled} onValueChange={handleToggle} />
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
        backgroundColor: Colors.surfaceDark,
        padding: 32,
        borderRadius: 48,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    heroIconContainerDisabled: {
        backgroundColor: Colors.surfaceDark,
        borderColor: Colors.borderDark,
        shadowOpacity: 0,
    },
    statusDotWrapper: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: Colors.backgroundDark,
        padding: 4,
        borderRadius: 10,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        marginBottom: 20,
        gap: 6,
    },
    premiumBadgeText: {
        color: '#f59e0b',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    heroTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize['2xl'],
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    heroDescription: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 16,
        fontWeight: '300',
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
        backgroundColor: Colors.primaryLight,
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
    },
    toggleDescription: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
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
    },
    infoValue: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
    },
});
