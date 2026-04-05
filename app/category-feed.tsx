/**
 * Category Feed Screen — Shows filtered messages for a specific category
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useSpamFilter, type ScanResultItem } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    FlatList,
    Platform,
    ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import * as Haptics from 'expo-haptics';

// ─── Helpers ─────────────────────────────────────────────────────

function getTimeAgo(timestamp: number, t: any): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('home.justNow');
    if (mins < 60) return t('home.mAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('home.hAgo', { count: hours });
    return t('home.dAgo', { count: Math.floor(hours / 24) });
}

// ─── Components ──────────────────────────────────────────────────

const BlockedMessageCard = React.memo(({ item, t, onPress }: { item: ScanResultItem; t: any; onPress: () => void }) => {
  const timeAgo = getTimeAgo(item.timestamp, t);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <Animated.View entering={FadeInDown.springify().damping(15)}>
        <Pressable 
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
            style={({ pressed }) => [
                styles.cardPressable,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
            ]}
        >
            <GlassCard style={[styles.blockedCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.blockedLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.blockedIconWrap, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}>
                    <MaterialCommunityIcons name="shield-off" size={20} color="#ef4444" />
                </View>
                <View style={[styles.blockedInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.blockedSender, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                    {item.sender || t('home.unknown')}
                    </Text>
                    <Text style={[styles.blockedText, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                    {item.text}
                    </Text>
                </View>
                </View>
                <View style={[styles.blockedRight, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <Text style={styles.blockedTime}>{timeAgo}</Text>
                </View>
            </GlassCard>
        </Pressable>
    </Animated.View>
  );
});

export default function CategoryFeedScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const { scanResults } = useSpamFilter();
    
    // Safety: useLocalSearchParams can return string | string[]
    const params = useLocalSearchParams<{ categoryId: string }>();
    const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;

    const [selectedMessage, setSelectedMessage] = useState<ScanResultItem | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMessages = useMemo(() => {
        if (!scanResults) return [];
        
        const searchCat = String(categoryId || 'others').toLowerCase();
        // Clean category string (e.g., 'catScam' -> 'scam')
        const normalizedSearch = searchCat.startsWith('cat') ? searchCat.substring(3) : searchCat;

        return scanResults.filter(item => {
            if (!item?.result) return false;
            const itemCatRaw = String(item.result.category || 'others').toLowerCase();
            const normalizedItem = itemCatRaw.startsWith('cat') ? itemCatRaw.substring(3) : itemCatRaw;
            
            const matchesCategory = normalizedItem === normalizedSearch;
            if (!matchesCategory) return false;
            
            if (!searchQuery?.trim()) return true;
            
            const q = searchQuery.toLowerCase();
            const sender = (item.sender || '').toLowerCase();
            const text = (item.text || '').toLowerCase();
            return sender.includes(q) || text.includes(q);
        });
    }, [scanResults, categoryId, searchQuery]);

    const getCategoryDisplay = useCallback(() => {
        const keyMap: Record<string, string> = {
            'scam': 'catScam', 'promos': 'catPromos', 'otp': 'catOtp',
            'bank': 'catBank', 'delivery': 'catDelivery', 'health': 'catHealth',
            'work': 'catWork', 'others': 'catOthers'
        };
        const normalized = categoryId?.toLowerCase()?.startsWith('cat') 
            ? categoryId.toLowerCase().substring(3) 
            : categoryId?.toLowerCase();
        
        const key = keyMap[normalized || 'others'] || 'catOthers';
        const label = t(`activity.${key}`);
        return (typeof label === 'string' ? label : key).toUpperCase();
    }, [categoryId, t]);

    const renderItem = ({ item }: { item: ScanResultItem }) => (
        <BlockedMessageCard
            item={item}
            t={t}
            onPress={() => setSelectedMessage(item)}
        />
    );

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title={getCategoryDisplay()}
                showBack={true}
                rightIcon={isSearching ? "close" : "magnify"}
                onRightPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setIsSearching(!isSearching);
                    if (isSearching) setSearchQuery('');
                }}
            />

            {isSearching && (
                <Animated.View 
                    entering={FadeInUp.duration(300)} 
                    exiting={FadeOut.duration(200)}
                    style={styles.searchContainer}
                >
                    <View style={[styles.searchInputWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={t('home.unknown') + "..."}
                            placeholderTextColor={Colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                </Animated.View>
            )}

            <FlatList
                data={filteredMessages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Animated.View entering={FadeInDown} style={styles.recentEmpty}>
                        <GlassCard style={styles.emptyIconCard}>
                            <MaterialCommunityIcons
                                name="shield-check-outline"
                                size={56}
                                color={Colors.primary}
                            />
                        </GlassCard>
                        <Text style={styles.recentEmptyText}>
                            {t('home.noBlockedMessages')}
                        </Text>
                    </Animated.View>
                }
            />

            {/* Engine Verdict Modal */}
            <Modal
                visible={!!selectedMessage}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedMessage(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedMessage(null)}>
                    <View style={styles.modalContentWrapper}>
                        <GlassCard style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIconBox}>
                                    <MaterialCommunityIcons name="shield-search" size={24} color={Colors.primary} />
                                </View>
                                <Text style={styles.modalTitle}>{t('home.verdictTitle')}</Text>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                {selectedMessage && (
                                    <View style={styles.modalBody}>
                                        <View style={styles.verdictBox}>
                                            <Text style={styles.verdictLabel}>{t('home.originalMessage')}</Text>
                                            <Text style={styles.fullMessageText}>{selectedMessage?.text || 'No Message Content'}</Text>
                                        </View>

                                        <View style={styles.verdictSection}>
                                            <View style={styles.verdictHead}>
                                                <Text style={styles.verdictLabel}>{t('home.verdictNeural')}</Text>
                                                <Text style={styles.verdictValue}>{Math.round((selectedMessage.result?.aiScore || 0.95) * 100)}% Match</Text>
                                            </View>
                                            <View style={styles.verdictBarContainer}>
                                                <View style={[styles.verdictBar, { width: `${(selectedMessage.result?.aiScore || 0.95) * 100}%` }]} />
                                            </View>
                                        </View>

                                        <Pressable 
                                            style={({ pressed }) => [
                                                styles.closeBtn,
                                                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                                            ]} 
                                            onPress={() => setSelectedMessage(null)}
                                        >
                                            <Text style={styles.closeBtnText}>{t('home.close')}</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </ScrollView>
                        </GlassCard>
                    </View>
                </Pressable>
            </Modal>
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
        paddingTop: 16,
    },
    cardPressable: {
        marginBottom: 12,
    },
    blockedCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    blockedLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    blockedIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.15)',
    },
    blockedInfo: {
        flex: 1,
    },
    blockedSender: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    blockedText: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        marginTop: 4,
        lineHeight: 18,
    },
    blockedRight: {
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    blockedTime: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        fontWeight: '600',
    },
    recentEmpty: {
        alignItems: 'center',
        gap: 24,
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyIconCard: {
        width: 110,
        height: 110,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 245, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(0, 245, 255, 0.1)',
    },
    recentEmptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.7,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContentWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: Colors.surfaceDark,
        borderColor: Colors.borderDark,
        padding: 28,
        borderRadius: 36,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    modalIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 245, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    modalScroll: {
        maxHeight: 450,
    },
    modalBody: {
        gap: 24,
    },
    verdictSection: {
        gap: 12,
    },
    verdictHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    verdictBox: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 18,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 10,
    },
    verdictLabel: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    verdictBarContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    verdictBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    verdictValue: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '800',
    },
    fullMessageText: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        lineHeight: 24,
        fontWeight: '500',
    },
    closeBtn: {
        marginTop: 12,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: Colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    searchContainer: {
        paddingHorizontal: Spacing['2xl'],
        paddingBottom: Spacing.lg,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
    },
});
