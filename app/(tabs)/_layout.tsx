/**
 * Tab Layout — Custom glassmorphic tab bar with 4 tabs
 */

import { Colors, FontSize } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIcon = keyof typeof MaterialCommunityIcons.glyphMap;

interface TabConfig {
  name: string;
  icon: TabIcon;
  iconFilled: TabIcon;
  label: string;
}

const TABS: TabConfig[] = [
  { name: 'index', icon: 'home-outline', iconFilled: 'home', label: 'Home' },
  { name: 'security', icon: 'shield-outline', iconFilled: 'shield-check', label: 'Security' },
  { name: 'activity', icon: 'chart-timeline-variant', iconFilled: 'chart-timeline-variant-shimmer', label: 'Activity' },
  { name: 'settings', icon: 'cog-outline', iconFilled: 'cog', label: 'Settings' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = TABS[index];
          if (!tab) return null;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tab}
            >
              <MaterialCommunityIcons
                name={isFocused ? tab.iconFilled : tab.icon}
                size={24}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? Colors.primary : Colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.glassBackground,
    borderTopWidth: 0.5,
    borderTopColor: Colors.glassBorder,
    paddingTop: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: FontSize['2xs'],
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});
