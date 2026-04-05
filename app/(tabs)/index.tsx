/**
 * Home Dashboard — System Protected status, threats counter, recent blocked messages
 */

import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { GlassCard } from '@/components/ui/GlassCard';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter, type ScanResultItem } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing as ReanimatedEasing,
  interpolate,
  interpolateColor
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const BlockedMessageCard = React.memo(({ item, t, onPress }: { item: ScanResultItem; t: any; onPress: () => void }) => {
  const timeAgo = getTimeAgo(item.timestamp, t);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.blockedCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
          <View style={styles.blockedBadge}>
            <Text style={[styles.blockedBadgeText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {item.result.matchedKeywords.length > 0
                ? item.result.matchedKeywords[0]
                : t('home.spam')}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

function getTimeAgo(timestamp: number, t: any): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('home.justNow');
  if (mins < 60) return t('home.mAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('home.hAgo', { count: hours });
  return t('home.dAgo', { count: Math.floor(hours / 24) });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { threatsBlocked, totalScanned, scanResults, aiEnabled } = useSpamFilter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Reanimated values for 60fps performance
  const shieldScaleBase = useSharedValue(0.8);
  const shieldOpacity = useSharedValue(0);
  const breathValue = useSharedValue(0);
  const rgbValue = useSharedValue(0);

  // Visual toggle for SpamKiller ON/OFF
  const [isActive, setIsActive] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ScanResultItem | null>(null);
  const { filter } = useLocalSearchParams<{ filter: string }>();

  // Filter messages by category if param exists
  const blockedMessages = React.useMemo(() => {
    return scanResults
      .filter((r) => r.result.isSpam)
      .filter((r) => {
        if (!filter) return true;
        // Normalize: handle both 'scam' and 'catScam' formats
        const itemCat = (r.result.category || 'others').toLowerCase();
        const searchCat = filter.toLowerCase();
        return itemCat === searchCat || itemCat === `cat${searchCat}` || (searchCat.startsWith('cat') && itemCat === searchCat.substring(3));
      });
  }, [scanResults, filter]);

  const displayedMessages = React.useMemo(() => {
    return filter ? blockedMessages : blockedMessages.slice(0, 5);
  }, [blockedMessages, filter]);

  useEffect(() => {
    // Shield entrance
    shieldScaleBase.value = withTiming(1, { duration: 600, easing: ReanimatedEasing.out(ReanimatedEasing.back(1.5)) });
    shieldOpacity.value = withTiming(1, { duration: 600 });

    // Continuous breathing on UI thread
    breathValue.value = withRepeat(
      withTiming(1, { duration: 2500, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
      -1,
      true
    );

    // continuous RGB cycle on UI thread
    rgbValue.value = withRepeat(
      withTiming(1, { duration: 4000, easing: ReanimatedEasing.linear }),
      -1,
      false
    );
  }, []);

  const handleToggleShield = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
    shieldScaleBase.value = withTiming(0.9, { duration: 100 }, () => {
      shieldScaleBase.value = withTiming(1, { duration: 200, easing: ReanimatedEasing.out(ReanimatedEasing.back(2)) });
    });
  };

  // Reanimated Styles
  const shieldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: shieldScaleBase.value * (1 + breathValue.value * 0.05) }
    ],
    opacity: shieldOpacity.value
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(breathValue.value, [0, 1], [1, 1.2]) }],
    opacity: interpolate(breathValue.value, [0, 1], [0.2, 0.05])
  }));

  const aiIconAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      rgbValue.value,
      [0, 0.25, 0.5, 0.75, 1],
      ['#4285f4', '#9b72cb', '#d96570', '#1facff', '#4285f4']
    );

    return {
      borderColor: aiEnabled ? borderColor : Colors.borderDark,
      shadowColor: aiEnabled ? borderColor : 'transparent',
      shadowOpacity: aiEnabled ? interpolate(breathValue.value, [0, 1], [0.6, 0.9]) : 0,
      shadowRadius: interpolate(breathValue.value, [0, 1], [8, 16]),
      borderWidth: aiEnabled ? 1.5 : 1,
    };
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BackgroundTexture />

      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            aiEnabled ? router.push('/ai-settings') : router.push({ pathname: '/upgrade', params: { variant: 'ai' } });
          }}
        >
          <Animated.View style={[styles.headerAiIcon, aiIconAnimatedStyle]}>
            <MaterialCommunityIcons 
              name="creation" 
              size={22} 
              color={aiEnabled ? Colors.white : Colors.textMuted} 
            />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerTitle}>AEGIS OS</Text>
      </View>

      {/* Main content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shieldSection}>
          <View style={styles.shieldOuter}>
            <Animated.View style={[styles.shieldInner, shieldAnimatedStyle]}>
              <Pressable onPress={handleToggleShield}>
                <View style={[
                  styles.shieldCore,
                  !isActive && styles.shieldCoreInactive
                ]}>
                  <MaterialCommunityIcons
                    name={isActive ? "shield-star" : "shield-off"}
                    size={72}
                    color={isActive ? Colors.primary : Colors.textMuted}
                  />
                </View>
              </Pressable>
            </Animated.View>
            {isActive && (
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
            )}
          </View>
          
          {/* Status Rings */}
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle} numberOfLines={1} adjustsFontSizeToFit>
              {isActive ? t('home.systemProtected') : t('home.protectionDisabled')}
            </Text>
            <View style={styles.privilegedLine} />
            <Text style={styles.statusSubtitle} numberOfLines={1} adjustsFontSizeToFit>
              {isActive ? t('home.activelyFiltering') : t('home.tapToEnable')}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <GlassCard style={styles.miniStat}>
            <Text style={styles.miniStatLabel} numberOfLines={1} adjustsFontSizeToFit>{t('home.threatsBlocked')}</Text>
            <Text style={styles.miniStatValue} numberOfLines={1}>{threatsBlocked}</Text>
          </GlassCard>
          <GlassCard style={styles.miniStat}>
            <Text style={styles.miniStatLabel} numberOfLines={1} adjustsFontSizeToFit>{t('home.totalScanned')}</Text>
            <Text style={styles.miniStatValue} numberOfLines={1}>{totalScanned}</Text>
          </GlassCard>
        </View>

        {/* Recent Blocked Messages */}
        <View style={styles.recentSection}>
          <View style={[styles.recentHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.recentTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {filter ? t('home.filteredByCategory', { category: filter.toUpperCase() }) : t('home.recentBlocked')}
            </Text>
            {displayedMessages.length > 0 && (
              <View style={styles.recentCountBadge}>
                <Text style={styles.recentCountText}>{displayedMessages.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.recentList}>
            {displayedMessages.length > 0 ? (
              displayedMessages.map((item) => (
                <BlockedMessageCard
                  key={item.id}
                  item={item}
                  t={t}
                  onPress={() => setSelectedMessage(item)}
                />
              ))
            ) : (
              <View style={styles.recentEmpty}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={32}
                  color={Colors.primaryBorder}
                />
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
          <Animated.View style={styles.modalContentWrapper}>
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
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Bottom spacer for tab bar */}
      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  headerAiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 16,
    paddingBottom: 40,
  },
  shieldSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  shieldOuter: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  shieldInner: {
    zIndex: 2,
  },
  shieldCore: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  shieldCoreInactive: {
    borderColor: Colors.borderDark,
    shadowOpacity: 0,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    opacity: 0.2,
  },
  statusInfo: {
    alignItems: 'center',
    gap: 4,
  },
  privilegedLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    marginVertical: 4,
  },
  statusTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  statusSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
    width: '100%',
  },
  miniStat: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  miniStatLabel: {
    color: Colors.textMuted,
    fontSize: FontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  miniStatValue: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '900',
  },
  // Recent blocked
  recentSection: {
    width: '100%',
    gap: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  recentCountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  recentCountText: {
    color: '#ef4444',
    fontSize: FontSize['2xs'],
    fontWeight: '700',
  },
  recentList: {
    gap: 8,
  },
  blockedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  blockedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  blockedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedInfo: {
    flex: 1,
  },
  blockedSender: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  blockedText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  blockedRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  blockedTime: {
    color: Colors.textMuted,
    fontSize: FontSize['2xs'],
  },
  blockedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  blockedBadgeText: {
    color: '#ef4444',
    fontSize: FontSize['2xs'],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recentEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    width: '100%',
  },
  recentEmptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
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
  fullMessageText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '500',
  },
  verdictText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
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
});
