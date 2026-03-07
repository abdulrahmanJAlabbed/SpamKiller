/**
 * IconButton — Circular icon button using MaterialCommunityIcons
 */

import { BorderRadius, Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

interface IconButtonProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress?: () => void;
    size?: number;
    color?: string;
    style?: ViewStyle;
}

export function IconButton({
    icon,
    onPress,
    size = 24,
    color = Colors.textSecondary,
    style,
}: IconButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                style,
            ]}
        >
            <MaterialCommunityIcons name={icon} size={size} color={color} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: Colors.primaryLight,
    },
});
