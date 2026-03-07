/**
 * CustomSlider — Styled slider for AI detection settings
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Using the built-in Slider from @react-native-community/slider or a simple custom implementation
import { Colors, FontSize } from '@/constants/theme';
import { Animated, PanResponder, type LayoutChangeEvent } from 'react-native';

interface CustomSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    label: string;
    description: string;
    displayValue: string;
}

export function CustomSlider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    label,
    description,
    displayValue,
}: CustomSliderProps) {
    const [trackWidth, setTrackWidth] = React.useState(0);
    const pan = React.useRef(new Animated.Value(0)).current;

    const normalizedValue = (value - min) / (max - min);
    const fillWidth = normalizedValue * 100;

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { },
            onPanResponderMove: (_, gestureState) => {
                if (trackWidth === 0) return;
                const newValue = Math.max(
                    min,
                    Math.min(max, min + ((gestureState.moveX - 24) / trackWidth) * (max - min)),
                );
                onValueChange(Math.round(newValue));
            },
            onPanResponderRelease: () => { },
        }),
    ).current;

    const onLayout = (event: LayoutChangeEvent) => {
        setTrackWidth(event.nativeEvent.layout.width);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
                <Text style={styles.displayValue}>{displayValue}</Text>
            </View>
            <View style={styles.trackContainer} onLayout={onLayout} {...panResponder.panHandlers}>
                <View style={styles.track}>
                    <View style={[styles.fill, { width: `${fillWidth}%` }]} />
                </View>
                <View
                    style={[
                        styles.thumb,
                        { left: `${fillWidth}%`, marginLeft: -9 },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    labelContainer: {
        flex: 1,
        gap: 4,
    },
    label: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    description: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
    },
    displayValue: {
        color: Colors.primary,
        fontSize: FontSize.base,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    trackContainer: {
        height: 20,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: 6,
        backgroundColor: Colors.sliderTrack,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    thumb: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.white,
        top: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
});
