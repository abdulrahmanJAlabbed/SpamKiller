/**
 * ToggleSwitch — Custom animated toggle switch matching Shield OS purple design
 */

import { Colors } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

export function ToggleSwitch({ value, onValueChange, disabled = false }: ToggleSwitchProps) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: value ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
            tension: 60,
        }).start();
    }, [value, animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
    });

    const trackColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.toggleTrackOff, Colors.toggleTrackOn],
    });

    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            onPress={() => !disabled && onValueChange(!value)}
            style={[styles.container, disabled && styles.disabled]}
        >
            <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
                <Animated.View
                    style={[
                        styles.thumb,
                        { transform: [{ translateX }] },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    track: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
