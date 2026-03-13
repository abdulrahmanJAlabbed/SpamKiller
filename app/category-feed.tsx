/**
 * Category Feed Screen — Shows filtered messages for a specific category
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useSpamFilter, type ScanResultItem } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutAnimation,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';

function BlockedMessageCard({ item, t, onPress }: { item: ScanResultItem; t: any; onPress: () => void }) {
  const timeAgo = getTimeAgo(item.timestamp, t);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <Pressable onPress={onPress}>
      <GlassCard style={[styles.blockedCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.blockedLeft, { flexDirection: isRTL ? 'row-reverse' : 'row', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }]}>
          <View style={styles.blockedIconWrap}>
            <MaterialCommunityIcons name="shield-off" size={18} color="#ef4444" />
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
  );
}

function getTimeAgo(timestamp: number, t: any): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('home.justNow');
  if (mins < 60) return t('home.mAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('home.hAgo', { count: hours });
  return t('home.dAgo', { count: Math.floor(hours / 24) });
}

export default function CategoryFeedScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const { scanResults } = useSpamFilter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const [selectedMessage, setSelectedMessage] = useState<ScanResultItem | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMessages = scanResults.filter(item => {
        const itemCat = (item.result.category || 'others').toLowerCase();
        const searchCat = (categoryId || 'others').toLowerCase();
        const matchesCategory = itemCat === searchCat || itemCat === `cat${searchCat}` || (searchCat.startsWith('cat') && itemCat === searchCat.substring(3));
        
        if (!matchesCategory) return false;
        if (!searchQuery.trim()) return true;
        
        const q = searchQuery.toLowerCase();
        return item.sender?.toLowerCase().includes(q) || item.text.toLowerCase().includes(q);
    });

    const getCategoryDisplay = () => {
        const keyMap: Record<string, string> = {
            'scam': 'catScam', 'promos': 'catPromos', 'otp': 'catOtp',
            'bank': 'catBank', 'delivery': 'catDelivery', 'health': 'catHealth',
            'work': 'catWork', 'others': 'catOthers'
        };
        const normalized = categoryId?.toLowerCase().startsWith('cat') ? categoryId.toLowerCase().substring(3) : categoryId?.toLowerCase();
        const key = keyMap[normalized || 'others'] || 'catOthers';
        return t(`activity.${key}`).toUpperCase();
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title={getCategoryDisplay()}
                showBack={true}
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
                            placeholder={t('home.unknown') + "..."}
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
                <View style={styles.recentSection}>
                    <View style={styles.recentList}>
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((item) => (
                                <BlockedMessageCard
                                    key={item.id}
                                    item={item}
                                    t={t}
                                    onPress={() => setSelectedMessage(item)}
                                />
                            ))
                        ) : (
                            <View style={styles.recentEmpty}>
                                <GlassCard style={styles.emptyIconCard}>
                                    <MaterialCommunityIcons
                                        name="shield-check-outline"
                                        size={48}
                                        color={Colors.primary}
                                    />
                                </GlassCard>
                                <Text style={styles.recentEmptyText}>
                                    {t('home.noBlockedMessages')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

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
                                            <Text style={styles.fullMessageText}>{selectedMessage.text}</Text>
                                        </View>

                                        <View style={styles.verdictSection}>
                                            <View style={styles.verdictHead}>
                                                <Text style={styles.verdictLabel}>{t('home.verdictNeural')}</Text>
                                                <Text style={styles.verdictValue}>{Math.round((selectedMessage.result.aiScore || 0.95) * 100)}% Match</Text>
                                            </View>
                                            <View style={styles.verdictBarContainer}>
                                                <View style={[styles.verdictBar, { width: `${(selectedMessage.result.aiScore || 0.95) * 100}%` }]} />
                                            </View>
                                        </View>

                                        <Pressable style={styles.closeBtn} onPress={() => setSelectedMessage(null)}>
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
    recentSection: {
        width: '100%',
        gap: 12,
    },
    recentList: {
        gap: 8,
    },
    blockedCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 12,
    },
    blockedLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    blockedIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
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
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        height: '100%',
        paddingTop: 4,
    },
    blockedTime: {
        color: Colors.textMuted,
        fontSize: FontSize['2xs'],
        fontWeight: '600',
    },
    recentEmpty: {
        alignItems: 'center',
        gap: 20,
        paddingVertical: 80,
        paddingHorizontal: 40,
        width: '100%',
    },
    emptyIconCard: {
        width: 100,
        height: 100,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 245, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(0, 245, 255, 0.1)',
    },
    recentEmptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContentWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: Colors.surfaceDark,
        borderColor: Colors.borderDark,
        padding: 24,
        borderRadius: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    modalIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    modalScroll: {
        maxHeight: 400,
    },
    modalBody: {
        gap: 20,
    },
    verdictSection: {
        gap: 10,
    },
    verdictHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    verdictBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    verdictLabel: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    verdictBarContainer: {
        height: 4,
        backgroundColor: Colors.borderDark,
        borderRadius: 2,
        overflow: 'hidden',
    },
    verdictBar: {
        height: '100%',
        backgroundColor: Colors.primary,
    },
    verdictValue: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    verdictText: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
    },
    fullMessageText: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        lineHeight: 22,
        fontWeight: '500',
    },
    engineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0, 245, 255, 0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    engineBadgeText: {
        color: Colors.primary,
        fontSize: 11,
        fontWeight: '600',
    },
    closeBtn: {
        marginTop: 10,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
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
});
