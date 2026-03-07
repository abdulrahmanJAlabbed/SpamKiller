/**
 * BackgroundGlow — Decorative gradient orbs matching Shield OS ambient effects
 */

import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BackgroundGlowProps {
    intensity?: 'subtle' | 'normal' | 'strong';
}

export function BackgroundGlow({ intensity = 'normal' }: BackgroundGlowProps) {
    const opacityMap = {
        subtle: 0.03,
        normal: 0.06,
        strong: 0.1,
    };
    const opacity = opacityMap[intensity];

    return (
        <View style={styles.container} pointerEvents="none">
            <View
                style={[
                    styles.orbTopLeft,
                    { backgroundColor: Colors.primary, opacity },
                ]}
            />
            <View
                style={[
                    styles.orbBottomRight,
                    { backgroundColor: Colors.primary, opacity },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
        overflow: 'hidden',
    },
    orbTopLeft: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        borderRadius: 9999,
    },
    orbBottomRight: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        borderRadius: 9999,
    },
});
