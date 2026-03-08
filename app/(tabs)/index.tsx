/**
 * Home Dashboard — System Protected status, threats counter, recent blocked messages
 */

import { BackgroundGlow } from '@/components/layout/BackgroundGlow';
import { GlassCard } from '@/components/ui/GlassCard';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter, type ScanResultItem } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function BlockedMessageCard({ item }: { item: ScanResultItem }) {
  const timeAgo = getTimeAgo(item.timestamp);
  return (
    <View style={styles.blockedCard}>
      <View style={styles.blockedLeft}>
        <View style={styles.blockedIconWrap}>
          <MaterialCommunityIcons name="shield-off" size={18} color="#ef4444" />
        </View>
        <View style={styles.blockedInfo}>
          <Text style={styles.blockedSender} numberOfLines={1}>
            {item.sender || 'Unknown'}
          </Text>
          <Text style={styles.blockedText} numberOfLines={1}>
            {item.text}
          </Text>
        </View>
      </View>
      <View style={styles.blockedRight}>
        <Text style={styles.blockedTime}>{timeAgo}</Text>
        <View style={styles.blockedBadge}>
          <Text style={styles.blockedBadgeText}>
            {item.result.matchedKeywords.length > 0
              ? item.result.matchedKeywords[0]
              : 'spam'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { threatsBlocked, scanResults, aiEnabled } = useSpamFilter();
  const shieldScale = useRef(new Animated.Value(0.8)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;

  // Visual toggle for SpamKiller ON/OFF
  const [isActive, setIsActive] = useState(true);

  const blockedMessages = scanResults.filter((r) => r.result.isSpam).slice(0, 5);

  useEffect(() => {
    // Shield entrance animation
    Animated.parallel([
      Animated.spring(shieldScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shieldOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggleShield = () => {
    setIsActive(!isActive);
    Animated.sequence([
      Animated.timing(shieldScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(shieldScale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BackgroundGlow />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="shield" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>Shield OS</Text>
        </View>
        {/* Profile Avatar removed per user request */}
      </View>

      {/* Main content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Shield icon (Clickable Toggle) */}
        <Animated.View
          style={[
            styles.shieldContainer,
            {
              transform: [{ scale: shieldScale }],
              opacity: shieldOpacity,
            },
          ]}
        >
          <Pressable onPress={handleToggleShield}>
            <View style={[
              styles.shieldCircle,
              !isActive && styles.shieldCircleInactive
            ]}>
              <MaterialCommunityIcons
                name={isActive ? "shield-check" : "shield-off-outline"}
                size={64}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Status text */}
        <Text style={styles.statusTitle}>
          {isActive ? 'System Protected' : 'Protection Disabled'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isActive ? 'SpamKiller is actively filtering SMS.' : 'Tap shield to enable SpamKiller.'}
        </Text>

        {aiEnabled && isActive && (
          <View style={styles.proBadge}>
            <MaterialCommunityIcons name="star-four-points" size={16} color="#f59e0b" />
            <Text style={styles.proBadgeText}>Neural Engine Active</Text>
          </View>
        )}

        {/* Threats blocked card */}
        <GlassCard style={styles.statsCard}>
          <Text style={styles.statsLabel}>THREATS BLOCKED</Text>
          <Text style={styles.statsValue}>{threatsBlocked.toLocaleString()}</Text>
        </GlassCard>

        {/* Recent Blocked Messages */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>RECENT BLOCKED</Text>
            {blockedMessages.length > 0 && (
              <View style={styles.recentCountBadge}>
                <Text style={styles.recentCountText}>{blockedMessages.length}</Text>
              </View>
            )}
          </View>

          {blockedMessages.length > 0 ? (
            <View style={styles.recentList}>
              {blockedMessages.map((item) => (
                <BlockedMessageCard key={item.id} item={item} />
              ))}
            </View>
          ) : (
            <View style={styles.recentEmpty}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={32}
                color={Colors.primaryBorder}
              />
              <Text style={styles.recentEmptyText}>
                No blocked messages yet. Threats will appear here when detected.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
    fontFamily: 'Inter',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 16,
    paddingBottom: 40,
  },
  shieldContainer: {
    marginBottom: 32,
  },
  shieldCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 0.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCircleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: Colors.borderDark,
    borderWidth: 1,
  },
  statusTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['4xl'],
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  statusSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.base,
    letterSpacing: 0.3,
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  proBadgeText: {
    color: '#f59e0b',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  statsCard: {
    width: '80%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: Colors.primaryGlow,
  },
  statsLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  statsValue: {
    color: Colors.textPrimary,
    fontSize: FontSize['4xl'],
    fontWeight: '300',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  blockedText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  blockedRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  blockedTime: {
    color: Colors.textMuted,
    fontSize: FontSize['2xs'],
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
  },
  recentEmptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
});
