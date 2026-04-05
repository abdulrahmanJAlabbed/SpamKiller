import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PrivacyScreen() {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const isRTL = i18n.dir() === 'rtl';

    const sections = [
        { title: t('legal.privacySection1Title'), text: t('legal.privacySection1Text'), icon: 'brain' },
        { title: t('legal.privacySection2Title'), text: t('legal.privacySection2Text'), icon: 'database-off' },
        { title: t('legal.privacySection3Title'), text: t('legal.privacySection3Text'), icon: 'shield-check' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <BackgroundTexture />
            <ScreenHeader 
                title={t('legal.privacyTitle')} 
                showBack 
                onBack={() => router.back()} 
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.hero, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={32} color={Colors.primary} />
                    </View>
                    <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('legal.privacyTitle')}
                    </Text>
                    <Text style={[styles.lastUpdated, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('legal.lastUpdated')}
                    </Text>
                    <Text style={[styles.intro, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('legal.privacyIntro')}
                    </Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.sectionCard}>
                        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={styles.sectionIcon}>
                                <MaterialCommunityIcons 
                                    name={section.icon as any} 
                                    size={20} 
                                    color={Colors.primary} 
                                />
                            </View>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        <Text style={[styles.sectionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {section.text}
                        </Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <MaterialCommunityIcons name="security" size={16} color={Colors.textMuted} />
                    <Text style={styles.footerText}>Aegis OS — Neural Security Standard</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: 40,
    },
    hero: {
        marginBottom: 32,
        gap: 12,
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSize['3xl'],
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    lastUpdated: {
        color: Colors.primary,
        fontSize: FontSize.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    intro: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        lineHeight: 24,
        marginTop: 8,
    },
    sectionCard: {
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        padding: 20,
        marginBottom: 16,
    },
    sectionHeader: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    sectionText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.5,
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
