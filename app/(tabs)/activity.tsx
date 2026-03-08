/**
 * Activity / Categories Vault
 * Shows modern AI categories for filtered messages using a grid layout
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutAnimation,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CategoryIcon = keyof typeof MaterialCommunityIcons.glyphMap;

interface Category {
    id: string;
    icon: CategoryIcon;
    color: string;
    bgColor: string;
    count: number;
}

const CATEGORIES: Category[] = [
    { id: 'scam', icon: 'shield-alert', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', count: 42 },
    { id: 'promos', icon: 'tag-multiple', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', count: 128 },
    { id: 'otp', icon: 'key-variant', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', count: 56 },
    { id: 'bank', icon: 'bank', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', count: 24 },
    { id: 'delivery', icon: 'truck-delivery', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', count: 18 },
    { id: 'health', icon: 'heart-pulse', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)', count: 7 },
    { id: 'work', icon: 'briefcase', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)', count: 35 },
    { id: 'others', icon: 'dots-grid', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', count: 89 },
];

export default function ActivityScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const getCategoryKey = (id: string) => {
        const keyMap: Record<string, string> = {
            'scam': 'catScam', 'promos': 'catPromos', 'otp': 'catOtp',
            'bank': 'catBank', 'delivery': 'catDelivery', 'health': 'catHealth',
            'work': 'catWork', 'others': 'catOthers'
        };
        return keyMap[id] || 'catOthers';
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title={t('activity.title')}
                rightIcon={isSearching ? "close" : "magnify"}
                onRightPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsSearching(!isSearching);
                    if (isSearching) setSearchQuery('');
                }}
            />

            {isSearching && (
                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={t('blocklist.blockTextPlaceholder') || "Search..."}
                            placeholderTextColor={Colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('activity.subtitle')}
                </Text>

                <View style={[styles.gridContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat.id}
                            style={({ pressed }) => [
                                styles.card,
                                { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                                pressed && styles.cardPressed,
                            ]}
                        >
                            <View style={[styles.iconWrapper, { backgroundColor: cat.bgColor }]}>
                                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
                            </View>
                            <View style={[styles.textContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start', paddingTop: 8 }]}>
                                <Text style={[styles.cardLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t(`activity.${getCategoryKey(cat.id)}`)}</Text>
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
    searchContainer: {
        paddingHorizontal: Spacing['2xl'],
        paddingBottom: Spacing.md,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 12,
        height: 48,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontFamily: 'Inter',
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
