/**
 * Home Dashboard — System Protected status, threats counter, scan button
 */

import { BackgroundGlow } from '@/components/layout/BackgroundGlow';
import { GlassCard } from '@/components/ui/GlassCard';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [threatsBlocked] = useState(1248);
  const [isScanning, setIsScanning] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shieldScale = useRef(new Animated.Value(0.8)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;

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

  const handleScan = () => {
    setIsScanning(true);
    // Pulse animation during scan
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 },
    ).start(() => setIsScanning(false));
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
        <Pressable style={styles.avatarBtn}>
          <MaterialCommunityIcons name="account-circle-outline" size={28} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Main content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Shield icon */}
        <Animated.View
          style={[
            styles.shieldContainer,
            {
              transform: [{ scale: Animated.multiply(shieldScale, pulseAnim) }],
              opacity: shieldOpacity,
            },
          ]}
        >
          <View style={styles.shieldCircle}>
            <MaterialCommunityIcons
              name="shield-check"
              size={64}
              color={Colors.primary}
            />
          </View>
        </Animated.View>

        {/* Status text */}
        <Text style={styles.statusTitle}>System Protected</Text>
        <Text style={styles.statusSubtitle}>Last check: 2 minutes ago</Text>

        {/* Threats blocked card */}
        <GlassCard style={styles.statsCard}>
          <Text style={styles.statsLabel}>THREATS BLOCKED</Text>
          <Text style={styles.statsValue}>{threatsBlocked.toLocaleString()}</Text>
        </GlassCard>

        {/* Scan button */}
        <Pressable
          onPress={handleScan}
          disabled={isScanning}
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.scanButtonPressed,
            isScanning && styles.scanButtonDisabled,
          ]}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Initialize Scan'}
          </Text>
        </Pressable>
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
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
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
    marginBottom: 48,
    fontFamily: 'Inter',
  },
  statsCard: {
    width: '80%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 48,
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
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  scanButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '500',
    letterSpacing: -0.3,
    fontFamily: 'Inter',
  },
});
