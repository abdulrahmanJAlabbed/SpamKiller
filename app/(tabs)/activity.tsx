/**
 * Activity / Categories Vault
 * Shows modern AI categories for filtered messages using a grid layout
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CategoryIcon = keyof typeof MaterialCommunityIcons.glyphMap;

interface Category {
    id: string;
    label: string;
    icon: CategoryIcon;
    color: string;
    bgColor: string;
    count: number;
}

const CATEGORIES: Category[] = [
    { id: 'scam', label: 'Scam & Phishing', icon: 'shield-alert', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', count: 42 },
    { id: 'promos', label: 'Promos & Coupons', icon: 'tag-multiple', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', count: 128 },
    { id: 'otp', label: 'OTP & Auth', icon: 'key-variant', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', count: 56 },
    { id: 'bank', label: 'Banking & Bills', icon: 'bank', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', count: 24 },
    { id: 'delivery', label: 'Deliveries', icon: 'truck-delivery', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', count: 18 },
    { id: 'health', label: 'Health & Medical', icon: 'heart-pulse', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)', count: 7 },
    { id: 'work', label: 'Work & Teams', icon: 'briefcase', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)', count: 35 },
    { id: 'others', label: 'Others', icon: 'dots-grid', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', count: 89 },
];

export default function ActivityScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader title="Categories" rightIcon="magnify" onRightPress={() => { }} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    AI automatically categorizes your incoming messages.
                </Text>

                <View style={styles.gridContainer}>
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat.id}
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                        >
                            <View style={[styles.iconWrapper, { backgroundColor: cat.bgColor }]}>
                                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardLabel}>{cat.label}</Text>
                                <Text style={styles.cardCount}>{cat.count} messages</Text>
                            </View>
                        </Pressable>
                    ))}
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
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.md,
    },
    subtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
        marginBottom: 24,
        lineHeight: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    card: {
        width: '47%',
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        padding: 20,
        gap: 16,
        alignItems: 'flex-start',
    },
    cardPressed: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primaryBorder,
        transform: [{ scale: 0.98 }],
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        gap: 4,
    },
    cardLabel: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    cardCount: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        fontFamily: 'Inter',
    },
});
