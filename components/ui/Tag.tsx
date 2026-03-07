/**
 * Tag — Keyword tag chip with remove button for the Rules Engine
 */

import { BorderRadius, Colors, FontSize } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TagProps {
    text: string;
    onRemove?: () => void;
}

export function Tag({ text, onRemove }: TagProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
            {onRemove && (
                <Pressable onPress={onRemove} hitSlop={8}>
                    <MaterialCommunityIcons name="close" size={14} color={Colors.textPrimary} />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
        backgroundColor: Colors.primaryLight,
    },
    text: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
});
