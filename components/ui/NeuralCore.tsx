import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withDelay,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NeuralCoreProps {
    active: boolean;
}

export function NeuralCore({ active }: NeuralCoreProps) {
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);
    const internalRotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1,
            false
        );
        internalRotation.value = withRepeat(
            withTiming(-360, { duration: 15000, easing: Easing.linear }),
            -1,
            false
        );
        pulse.value = withRepeat(
            withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const outerRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
        opacity: active ? withTiming(0.8) : withTiming(0.2),
        borderColor: active ? Colors.primary : Colors.textMuted,
    }));

    const middleRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${internalRotation.value}deg` }],
        opacity: active ? withTiming(0.6) : withTiming(0.1),
        borderColor: active ? Colors.primary : Colors.textMuted,
    }));

    const coreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: active ? pulse.value : 1 }],
        backgroundColor: active ? Colors.primary : Colors.surfaceLight,
        shadowOpacity: active ? interpolate(pulse.value, [1, 1.2], [0.3, 0.8], Extrapolate.CLAMP) : 0,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: active ? pulse.value * 1.5 : 0.8 }],
        opacity: active ? interpolate(pulse.value, [1, 1.2], [0.1, 0.3], Extrapolate.CLAMP) : 0.05,
    }));

    return (
        <View style={styles.container}>
            {/* Ambient Glow */}
            <Animated.View style={[styles.glow, glowStyle]} />

            {/* Outer Hexagon/Ring */}
            <Animated.View style={[styles.ring, styles.outerRing, outerRingStyle]}>
                <View style={styles.node} />
                <View style={[styles.node, { bottom: 0, top: undefined }]} />
            </Animated.View>

            {/* Middle Fragmented Ring */}
            <Animated.View style={[styles.ring, styles.middleRing, middleRingStyle]}>
                <View style={[styles.segment, { transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.segment, { transform: [{ rotate: '225deg' }] }]} />
            </Animated.View>

            {/* Core Orb */}
            <Animated.View style={[styles.core, coreStyle]}>
                <MaterialCommunityIcons 
                    name="brain" 
                    size={32} 
                    color={active ? Colors.backgroundDark : Colors.textMuted} 
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.primary,
    },
    ring: {
        position: 'absolute',
        borderRadius: 1000,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    outerRing: {
        width: 180,
        height: 180,
        borderColor: Colors.primary,
        padding: 10,
    },
    middleRing: {
        width: 130,
        height: 130,
        borderColor: Colors.primary,
        borderStyle: 'solid',
        opacity: 0.5,
    },
    core: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 10,
    },
    node: {
        position: 'absolute',
        top: -4,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    segment: {
        position: 'absolute',
        top: -2,
        left: '50%',
        width: 20,
        height: 4,
        backgroundColor: Colors.primary,
        borderRadius: 2,
    }
});
