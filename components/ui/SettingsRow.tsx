/**
 * SettingsRow — Settings row with icon, labels, and toggle or chevron
 */

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ToggleSwitch } from './ToggleSwitch';

interface SettingsRowProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    description?: string;
    value?: boolean;
    onValueChange?: (val: boolean) => void;
    onPress?: () => void;
    showChevron?: boolean;
}

export function SettingsRow({
    icon,
    label,
    description,
    value,
    onValueChange,
    onPress,
    showChevron,
}: SettingsRowProps) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const Container = onPress ? Pressable : View;

    return (
        <Container
            onPress={onPress}
            style={({ pressed }: { pressed?: boolean }) => [
                styles.container,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={icon} size={22} color={Colors.primary} />
            </View>
            <View style={[styles.content, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.label}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
            {value !== undefined && onValueChange && (
                <ToggleSwitch value={value} onValueChange={onValueChange} />
            )}
            {showChevron && (
                <MaterialCommunityIcons name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={Colors.textMuted} />
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    pressed: {
        backgroundColor: Colors.primaryLight,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        gap: 2,
    },
    label: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    description: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
    },
});
