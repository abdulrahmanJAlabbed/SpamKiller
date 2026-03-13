/**
 * UpgradeModal — Reusable upgrade modal supporting Filter ($3) and Neural Shield ($10) variants
 */

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { UpgradeConfig, UpgradeVariant } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Animated } from 'react-native';

interface UpgradeModalProps {
    variant: UpgradeVariant;
}

export function UpgradeModal({ variant }: UpgradeModalProps) {
    const { t } = useTranslation();

    const UPGRADE_CONFIGS: Record<UpgradeVariant, UpgradeConfig> = {
        filter: {
            title: t('upgrade.filterTitle'),
            subtitle: t('upgrade.filterSubtitle'),
            description: t('upgrade.filterDesc'),
            price: '$3',
            icon: 'star-circle',
            features: [
                t('upgrade.filterFeat1'),
                t('upgrade.filterFeat2'),
                t('upgrade.filterFeat3'),
            ],
            ctaText: t('upgrade.filterCta'),
        },
        ai: {
            title: t('upgrade.aiTitle'),
            subtitle: t('upgrade.aiSubtitle'),
            description: t('upgrade.aiDesc'),
            price: '$10',
            icon: 'shield-check',
            features: [
                t('upgrade.aiFeat1'),
                t('upgrade.aiFeat2'),
                t('upgrade.aiFeat3'),
            ],
            ctaText: t('upgrade.aiCta'),
        },
        numbers: {
            title: t('upgrade.numbersTitle'),
            subtitle: t('upgrade.numbersSubtitle'),
            description: t('upgrade.numbersDesc'),
            price: '$7',
            icon: 'plus-network',
            features: [
                t('upgrade.numbersFeat1'),
                t('upgrade.numbersFeat2'),
                t('upgrade.numbersFeat3'),
            ],
            ctaText: t('upgrade.numbersCta'),
        },
    };

    const [isPurchasing, setIsPurchasing] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const config = UPGRADE_CONFIGS[variant];

    const handlePurchase = () => {
        setIsPurchasing(true);
        // Simulate payment gateway delay
        setTimeout(() => {
            setIsPurchasing(false);
            setIsSuccess(true);
            // Auto close after success
            setTimeout(() => {
                router.back();
            }, 2000);
        }, 1500);
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                {/* Hero icon */}
                <View style={styles.heroSection}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons
                            name={config.icon as any}
                            size={36}
                            color={Colors.white}
                        />
                    </View>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                    <Text style={styles.title}>{config.title}</Text>

                    {/* Subtitle badge */}
                    <View style={styles.subtitleBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.primary} />
                        <Text style={styles.subtitleText}>{config.subtitle}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        {config.description}{' '}
                        <Text style={styles.price}>{config.price}</Text>.
                    </Text>

                    {/* Features list */}
                    <View style={styles.features}>
                        {config.features.map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={18}
                                    color={Colors.primary}
                                />
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.ctaButton, 
                            pressed && styles.ctaPressed,
                            isSuccess && styles.ctaSuccess
                        ]}
                        onPress={handlePurchase}
                        disabled={isPurchasing || isSuccess}
                    >
                        {isPurchasing ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : isSuccess ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MaterialCommunityIcons name="check-bold" size={20} color={Colors.white} />
                                <Text style={styles.ctaText}>Access Granted</Text>
                            </View>
                        ) : (
                            <Text style={styles.ctaText}>{config.ctaText}</Text>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={() => router.back()}
                        style={styles.dismissButton}
                    >
                        <Text style={styles.dismissText}>{t('upgrade.notNow')}</Text>
                    </Pressable>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerItem}>
                        <MaterialCommunityIcons name="lock" size={12} color={Colors.textMuted} />
                        <Text style={styles.footerText}>{t('upgrade.securePayment')}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <MaterialCommunityIcons name="history" size={12} color={Colors.textMuted} />
                        <Text style={styles.footerText}>{t('upgrade.oneTimeCharge')}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 8, 16, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modal: {
        width: '100%',
        maxWidth: 380,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    heroSection: {
        height: 128,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryLight,
        overflow: 'hidden',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.primaryLight,
    },
    heroIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        maxHeight: 400,
    },
    contentInner: {
        paddingHorizontal: 32,
        paddingTop: 24,
        paddingBottom: 32,
        alignItems: 'center',
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSize['2xl'],
        fontWeight: '700',
        letterSpacing: -0.3,
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    subtitleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
    },
    subtitleText: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    description: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        lineHeight: 22,
        textAlign: 'center',
        marginTop: 12,
        fontFamily: 'Inter',
    },
    price: {
        color: Colors.white,
        fontWeight: '700',
    },
    features: {
        width: '100%',
        gap: 12,
        marginTop: 24,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        fontFamily: 'Inter',
    },
    ctaButton: {
        width: '100%',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    ctaPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    ctaSuccess: {
        backgroundColor: '#10b981',
    },
    ctaText: {
        color: Colors.white,
        fontSize: FontSize.base,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    dismissButton: {
        marginTop: 12,
        paddingVertical: 12,
    },
    dismissText: {
        color: Colors.textMuted,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.borderDark,
        backgroundColor: Colors.primaryLight,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.7,
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        fontWeight: '500',
        fontFamily: 'Inter',
    },
});
