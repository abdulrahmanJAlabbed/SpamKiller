/**
 * GlassCard — Glassmorphism container matching Shield OS design
 */

import { BorderRadius, Colors } from '@/constants/theme';
import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'solid' | 'primary';
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
    return (
        <View style={[styles.base, variantStyles[variant], style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.xl,
        padding: 24,
        overflow: 'hidden',
    },
});

const variantStyles = StyleSheet.create({
    default: {
        backgroundColor: Colors.glassCardBg,
        borderWidth: 1,
        borderColor: Colors.glassCardBorder,
    },
    solid: {
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    primary: {
        backgroundColor: Colors.primaryLight,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
    },
});
