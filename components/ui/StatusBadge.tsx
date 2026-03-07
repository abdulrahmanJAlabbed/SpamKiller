/**
 * StatusBadge — Color-coded status badge for Activity Vault items
 */

import { BorderRadius, Colors, FontSize } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
    status: 'blocked' | 'snoozed' | 'allowed';
}

const statusConfig = {
    blocked: {
        bg: Colors.blockedBg,
        text: Colors.blockedText,
        border: Colors.blockedBorder,
        label: 'BLOCKED',
    },
    snoozed: {
        bg: Colors.snoozedBg,
        text: Colors.snoozedText,
        border: Colors.snoozedBorder,
        label: 'SNOOZED',
    },
    allowed: {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: 'rgba(34, 197, 94, 0.7)',
        border: 'rgba(34, 197, 94, 0.2)',
        label: 'ALLOWED',
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: config.bg,
                    borderColor: config.border,
                },
            ]}
        >
            <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
    },
    text: {
        fontSize: FontSize['2xs'],
        fontWeight: '700',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
});
