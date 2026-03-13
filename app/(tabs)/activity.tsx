/**
 * Activity / Categories Vault
 * Shows modern AI categories for filtered messages using a grid layout
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
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
}

const CATEGORIES: Category[] = [
    { id: 'scam', icon: 'shield-alert-outline', color: '#ff4b2b' },
    { id: 'promos', icon: 'tag-outline', color: '#f59e0b' },
    { id: 'otp', icon: 'key-outline', color: '#10b981' },
    { id: 'bank', icon: 'bank-outline', color: '#3b82f6' },
    { id: 'delivery', icon: 'package-variant-closed', color: '#8b5cf6' },
    { id: 'health', icon: 'heart-pulse', color: '#ec4899' },
    { id: 'work', icon: 'briefcase-outline', color: '#6366f1' },
    { id: 'others', icon: 'dots-horizontal-circle-outline', color: '#94a3b8' },
];

export default function ActivityScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const { scanResults } = useSpamFilter();

    const categoryCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};
        scanResults.forEach(item => {
            let catRaw = item.result.category || 'others';
            let catId = (catRaw as string).toLowerCase();
            
            // Map 'catscam' -> 'scam', 'catpromos' -> 'promos' etc.
            if (catId.startsWith('cat')) {
                catId = catId.substring(3);
            }
            
            counts[catId] = (counts[catId] || 0) + 1;
        });
        return counts;
    }, [scanResults]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredCategories = React.useMemo(() => {
        if (!searchQuery.trim()) return CATEGORIES;
        const q = searchQuery.toLowerCase();
        return CATEGORIES.filter(cat => 
            t(`activity.${getCategoryKey(cat.id)}`).toLowerCase().includes(q)
        );
    }, [searchQuery, t]);

    const filteredMessages = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return scanResults.filter(msg => 
            (msg.sender?.toLowerCase().includes(q) || msg.text.toLowerCase().includes(q))
        );
    }, [searchQuery, scanResults]);

    const handleCategoryPress = (categoryId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
            pathname: '/category-feed',
            params: { categoryId }
        });
    };

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

                {(filteredCategories.length > 0) && (
                    <View style={[styles.gridContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        {filteredCategories.map((cat) => (
                            <Pressable
                                key={cat.id}
                                onPress={() => handleCategoryPress(cat.id)}
                                style={({ pressed }) => [
                                    styles.card,
                                    {
                                        backgroundColor: `${cat.color}10`, // 10% opacity hex
                                        borderColor: `${cat.color}20`,
                                        paddingLeft: isRTL ? 16 : 12,
                                        paddingRight: isRTL ? 12 : 16,
                                    },
                                    pressed && styles.cardPressed,
                                ]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${cat.color}15` }]}>
                                    <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                                </View>
                                <View style={[styles.textContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start', paddingTop: 8 }]}>
                                    <Text 
                                        style={[styles.cardLabel, { textAlign: isRTL ? 'right' : 'left' }]}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {t(`activity.${getCategoryKey(cat.id)}`)}
                                    </Text>
                                    <Text style={styles.cardCount} numberOfLines={1}>
                                        {categoryCounts[cat.id] || 0} {t('activity.silenced')}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {isSearching && filteredMessages.length > 0 && (
                    <View style={styles.messageResults}>
                        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('home.recentBlocked').toUpperCase()}
                        </Text>
                        {filteredMessages.map((msg) => (
                            <Pressable 
                                key={msg.id} 
                                style={styles.messageCard}
                                onPress={() => handleCategoryPress(msg.result.category || 'others')}
                            >
                                <View style={styles.messageIcon}>
                                    <MaterialCommunityIcons name="shield-off" size={16} color="#ef4444" />
                                </View>
                                <View style={styles.messageInfo}>
                                    <Text style={styles.messageSender} numberOfLines={1}>{msg.sender || t('home.unknown')}</Text>
                                    <Text style={styles.messageSnippet} numberOfLines={1}>{msg.text}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {isSearching && filteredCategories.length === 0 && filteredMessages.length === 0 && (
                    <View style={styles.noResults}>
                        <MaterialCommunityIcons name="text-search-variant" size={48} color={Colors.textMuted} />
                        <Text style={styles.noResultsText}>No matches found for "{searchQuery}"</Text>
                    </View>
                )}

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
        },
    subtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
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
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    cardLabel: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        },
    cardCount: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        },
    messageResults: {
        marginTop: 32,
        gap: 12,
    },
    sectionTitle: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: BorderRadius.lg,
        padding: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    messageIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageInfo: {
        flex: 1,
    },
    messageSender: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    messageSnippet: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    noResultsText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        textAlign: 'center',
    },
});
