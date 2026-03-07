/**
 * Activity Vault — Activity log with tabs and status badges
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { ActivityItem } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabFilter = 'all' | 'blocked' | 'snoozed';

const ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        title: 'System Update Intercepted',
        subtitle: '10:24 AM',
        icon: 'shield-lock',
        status: 'blocked',
        timestamp: 'Today',
        source: 'Kernel Shield',
    },
    {
        id: '2',
        title: 'Unauthorized Haptic Request',
        subtitle: '09:15 AM',
        icon: 'vibrate',
        status: 'snoozed',
        timestamp: 'Today',
        source: 'Browser',
    },
    {
        id: '3',
        title: 'Microphone Access Denied',
        subtitle: '08:02 AM',
        icon: 'microphone-off',
        status: 'blocked',
        timestamp: 'Today',
        source: 'Social App',
    },
    {
        id: '4',
        title: 'GPS Ping Throttled',
        subtitle: '11:58 PM',
        icon: 'map-marker-off',
        status: 'snoozed',
        timestamp: 'Yesterday',
        source: 'Maps Service',
    },
    {
        id: '5',
        title: 'Tracking Domain Blocked',
        subtitle: '10:30 PM',
        icon: 'dns',
        status: 'blocked',
        timestamp: 'Yesterday',
        source: 'AdGuard',
    },
];

const TABS: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All Activities' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'snoozed', label: 'Snoozed' },
];

export default function ActivityScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabFilter>('all');

    const filteredActivities =
        activeTab === 'all'
            ? ACTIVITIES
            : ACTIVITIES.filter((a) => a.status === activeTab);

    // Group by timestamp
    const grouped = filteredActivities.reduce<Record<string, ActivityItem[]>>((acc, item) => {
        if (!acc[item.timestamp]) acc[item.timestamp] = [];
        acc[item.timestamp].push(item);
        return acc;
    }, {});

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerArea}>
                <ScreenHeader
                    title="Activity Vault"
                    rightIcon="magnify"
                />

                {/* Tabs */}
                <View style={styles.tabs}>
                    {TABS.map((tab) => (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={[
                                styles.tab,
                                activeTab === tab.key && styles.tabActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.tabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Activity list */}
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {Object.entries(grouped).map(([timestamp, items]) => (
                    <View key={timestamp} style={styles.section}>
                        <Text style={styles.sectionTitle}>{timestamp}</Text>
                        <View style={styles.itemsContainer}>
                            {items.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={({ pressed }) => [
                                        styles.activityCard,
                                        pressed && styles.activityCardPressed,
                                    ]}
                                >
                                    <View style={styles.activityLeft}>
                                        <View style={styles.activityIcon}>
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={20}
                                                color={Colors.primary}
                                            />
                                        </View>
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityTitle}>{item.title}</Text>
                                            <Text style={styles.activitySubtitle}>
                                                {item.subtitle} • {item.source}
                                            </Text>
                                        </View>
                                    </View>
                                    <StatusBadge status={item.status} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}

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
    headerArea: {
        backgroundColor: Colors.backgroundDark,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primaryBorder,
        paddingHorizontal: Spacing['2xl'],
    },
    tab: {
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        color: Colors.textMuted,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    tabTextActive: {
        color: Colors.primary,
    },
    content: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing['2xl'],
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 16,
        opacity: 0.7,
        fontFamily: 'Inter',
    },
    itemsContainer: {
        gap: 12,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.glassCardBg,
        borderWidth: 1,
        borderColor: Colors.glassCardBorder,
    },
    activityCardPressed: {
        backgroundColor: Colors.primaryLight,
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    activitySubtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: 4,
        fontFamily: 'Inter',
    },
});
