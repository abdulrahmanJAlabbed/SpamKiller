/**
 * Blocklist Screen — Manual Rules Engine with keyword blocklist
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Tag } from '@/components/ui/Tag';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_FREE_SLOTS = 7;

export default function BlocklistScreen() {
    const insets = useSafeAreaInsets();
    const { keywords, addKeyword, removeKeyword } = useSpamFilter();
    const [inputText, setInputText] = useState('');

    const slotsUsed = keywords.length;
    const slotsFull = slotsUsed >= MAX_FREE_SLOTS;

    const handleAddKeyword = useCallback(() => {
        const trimmed = inputText.trim().toLowerCase();
        if (!trimmed) return;

        if (slotsFull) {
            router.push({ pathname: '/upgrade', params: { variant: 'filter' } });
            return;
        }

        const success = addKeyword(trimmed);
        if (!success) {
            Alert.alert('Duplicate', 'This keyword is already in your blocklist.');
            return;
        }

        setInputText('');
    }, [inputText, slotsFull, addKeyword]);

    const handleRemoveKeyword = useCallback((id: string) => {
        removeKeyword(id);
    }, [removeKeyword]);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="Blocklist"
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Usage limit card */}
                <GlassCard style={styles.usageCard}>
                    <View style={styles.usageHeader}>
                        <Text style={styles.usageLabel}>USAGE LIMIT</Text>
                        <Text style={styles.usageCount}>
                            {slotsUsed} / {MAX_FREE_SLOTS} Slots
                        </Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(slotsUsed / MAX_FREE_SLOTS) * 100}%` },
                            ]}
                        />
                    </View>
                    <View style={styles.usageFooter}>
                        <Text style={styles.usageFooterText}>Free tier active</Text>
                        <Pressable onPress={() => router.push('/upgrade?variant=filter')}>
                            <Text style={styles.upgradeLink}>Upgrade for more slots</Text>
                        </Pressable>
                    </View>
                </GlassCard>

                {/* Active blocklist */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACTIVE BLOCKLIST</Text>
                    <View style={styles.tagsContainer}>
                        {keywords.map((keyword) => (
                            <Tag
                                key={keyword.id}
                                text={keyword.text}
                                onRemove={() => handleRemoveKeyword(keyword.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Add keyword input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Block text..."
                            placeholderTextColor={Colors.textMuted}
                            style={styles.input}
                            onSubmitEditing={handleAddKeyword}
                            returnKeyType="done"
                        />
                        <Pressable
                            onPress={handleAddKeyword}
                            style={({ pressed }) => [
                                styles.addButton,
                                pressed && styles.addButtonPressed,
                            ]}
                        >
                            <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
                        </Pressable>
                    </View>
                    <Text style={styles.inputHint}>
                        Rules are applied instantly to all incoming traffic.
                    </Text>
                </View>
            </ScrollView>

            <View style={{ height: 100 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    content: {
        paddingHorizontal: Spacing['2xl'],
        paddingBottom: 40,
    },
    usageCard: {
        marginBottom: 40,
    },
    usageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    usageLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    usageCount: {
        color: Colors.primary,
        fontSize: FontSize.base,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    progressTrack: {
        height: 6,
        backgroundColor: Colors.primaryLight,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    usageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    usageFooterText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
    },
    upgradeLink: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 24,
        fontFamily: 'Inter',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    inputSection: {
        marginTop: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.primaryBorder,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        paddingVertical: 16,
        fontFamily: 'Inter',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonPressed: {
        backgroundColor: Colors.primary,
    },
    inputHint: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: 12,
        fontWeight: '300',
        fontFamily: 'Inter',
    },
});
