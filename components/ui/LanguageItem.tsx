/**
 * LanguageItem — Language selector row with flag, name, and radio indicator
 */

import { Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface LanguageItemProps {
    flag: string;
    name: string;
    isSelected: boolean;
    onPress: () => void;
}

export function LanguageItem({ flag, name, isSelected, onPress }: LanguageItemProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.left}>
                <Text style={styles.flag}>{flag}</Text>
                <Text style={styles.name}>{name}</Text>
            </View>
            <View
                style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                ]}
            >
                {isSelected && (
                    <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
    },
    pressed: {
        backgroundColor: Colors.primaryLight,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    flag: {
        fontSize: 18,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },
});
