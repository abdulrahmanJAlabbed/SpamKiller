/**
 * Root Layout — App entry point with Auth, Audio config, SMS listener, and Stack navigation
 */

import { Colors, FontSize } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { SpamFilterProvider } from '@/contexts/SpamFilterContext';
import { registerForPushNotifications, setupNotificationListeners } from '@/services/notifications';
import { requestSmsPermissions, startSmsListener } from '@/services/smsListener';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync } from 'expo-audio';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

// Initialize i18n translations
import '@/services/i18n';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [appIsUnlocked, setAppIsUnlocked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // 1. Check Biometric Auth
    const checkBiometrics = async () => {
      try {
        const bioEnabled = await AsyncStorage.getItem('@settings_biometric');
        if (bioEnabled === 'true') {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Shield OS',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false, // Forces fallback to device passcode/PIN
            fallbackLabel: 'Use Passcode',
          });
          if (result.success) {
            setAppIsUnlocked(true);
          } else {
            // Keep it locked if they fail or cancel
            setAppIsUnlocked(false);
          }
        } else {
          // Biometrics not enabled
          setAppIsUnlocked(true);
        }
      } catch (err) {
        setAppIsUnlocked(true); // Fail-safe: don't permanently lock out on runtime error
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkBiometrics();

    // 2. Audio config
    setAudioModeAsync({
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: false,
    }).catch((err) => console.warn('Audio config error:', err));

    // 3. Notifications & SMS Listener
    registerForPushNotifications();
    const notifCleanup = setupNotificationListeners();
    if (Platform.OS === 'android') {
      initSmsListener();
    }

    return notifCleanup;
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={[styles.root, styles.lockedScreen]}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!appIsUnlocked) {
    return (
      <View style={[styles.root, styles.lockedScreen]}>
        <MaterialCommunityIcons name="shield-lock" size={64} color={Colors.primary} />
        <Text style={styles.lockedTitle}>App Locked</Text>
        <Text style={styles.lockedSubtitle}>Authentication required to access SpamKiller.</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <SpamFilterProvider>
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.backgroundDark },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="ai-settings"
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="upgrade"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </View>
      </SpamFilterProvider>
    </AuthProvider>
  );
}

/**
 * Request SMS permissions once, then start the background listener.
 * On subsequent launches, permissions are already granted → auto-starts.
 */
async function initSmsListener() {
  const granted = await requestSmsPermissions();
  if (!granted) {
    console.log('[RootLayout] SMS permissions not granted, skipping listener');
    return;
  }

  // Default keywords — the SpamFilterContext will update these via the listener
  const defaultKeywords = ['spam', 'promo', 'crypto', 'winner', 'gift', 'click', 'verify'];

  const { notifySpamSilenced } = require('@/services/notifications');

  await startSmsListener(
    defaultKeywords,
    { aggressiveness: 50, keywordWeighting: 75 },
    // onSpam: fire a silent notification
    (msg) => {
      notifySpamSilenced(msg.sender, msg.text);
    },
    // onHam: do nothing — let the regular SMS notification through
    undefined,
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  lockedScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  lockedTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  lockedSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontFamily: 'Inter',
  },
});
