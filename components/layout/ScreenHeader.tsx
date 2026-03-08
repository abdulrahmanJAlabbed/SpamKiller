/**
 * ScreenHeader — Reusable header with back button, title, and optional action
 */

import { Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onRightPress?: () => void;
}

export function ScreenHeader({
    title,
    showBack = false,
    onBack,
    rightIcon,
    onRightPress,
}: ScreenHeaderProps) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    return (
        <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {showBack ? (
                <Pressable
                    onPress={onBack ?? (() => router.back())}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                >
                    <MaterialCommunityIcons name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={Colors.textSecondary} />
                </Pressable>
            ) : (
                <View style={styles.iconBtn} />
            )}
            <Text style={styles.title}>{title}</Text>
            {rightIcon ? (
                <Pressable
                    onPress={onRightPress}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                >
                    <MaterialCommunityIcons name={rightIcon} size={24} color={Colors.textSecondary} />
                </Pressable>
            ) : (
                <View style={styles.iconBtn} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing['2xl'],
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: '600',
        letterSpacing: -0.3,
        fontFamily: 'Inter',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnPressed: {
        backgroundColor: Colors.primaryLight,
    },
});
