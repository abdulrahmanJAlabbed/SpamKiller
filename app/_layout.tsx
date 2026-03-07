/**
 * Root Layout — App entry point with Auth, Audio config, and Stack navigation
 */

import { Audio } from 'expo-av';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { registerForPushNotifications, setupNotificationListeners } from '@/services/notifications';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    // Prevent the app from interrupting audio playback (music, podcasts, etc.)
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: false,
          playsInSilentModeIOS: false,
          shouldDuckAndroid: true,
          // Don't interrupt other apps' audio
          interruptionModeIOS: 0, // MixWithOthers
          interruptionModeAndroid: 1, // DuckOthers
        });
      } catch (err) {
        console.warn('Audio config error:', err);
      }
    }

    configureAudio();

    // Register for push notifications
    registerForPushNotifications();

    // Set up notification listeners
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
});
