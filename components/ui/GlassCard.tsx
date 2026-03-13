/**
 * GlassCard — Glassmorphism container matching Shield OS design
 */

import { BorderRadius, Colors } from '@/constants/theme';
import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp, Platform } from 'react-native';

interface GlassCardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
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
