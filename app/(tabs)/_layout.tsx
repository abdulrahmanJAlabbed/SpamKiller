/**
 * Tab Layout — Custom glassmorphic tab bar with 4 tabs
 */

import { Colors, FontSize } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIcon = keyof typeof MaterialCommunityIcons.glyphMap;

interface TabConfig {
  name: string;
  icon: TabIcon;
  iconFilled: TabIcon;
}

const TABS: TabConfig[] = [
  { name: 'index', icon: 'home-outline', iconFilled: 'home' },
  { name: 'blocklist', icon: 'shield-outline', iconFilled: 'shield-check' },
  { name: 'silenced', icon: 'volume-off', iconFilled: 'volume-off' },
  { name: 'activity', icon: 'view-grid-outline', iconFilled: 'view-grid' },
  { name: 'settings', icon: 'cog-outline', iconFilled: 'cog' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = TABS[index];
          if (!tab) return null;

          const tabNameKey = tab.name === 'index' ? 'home' : tab.name === 'activity' ? 'categories' : tab.name;

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
                {t(`tabs.${tabNameKey}`)}
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
