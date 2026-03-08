/**
 * Silenced Screen — Add a specific phone number to silence
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SilencedScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [silencedList, setSilencedList] = useState([
        '+1 (555) 019-2831',
        '+44 7700 900077',
    ]);

    const handleSilenceNumber = () => {
        const trimmed = phoneNumber.trim();
        if (!trimmed) return;

        // Prevent duplicates
        if (!silencedList.includes(trimmed)) {
            setSilencedList(prev => [trimmed, ...prev]);
        }

        setPhoneNumber('');
    };

    const handleRemoveNumber = (num: string) => {
        setSilencedList(prev => prev.filter(n => n !== num));
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScreenHeader title={t('silenced.title')} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.description}>
                    {t('silenced.description')}
                </Text>

                {/* Input area */}
                <View style={styles.inputArea}>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder={t('silenced.placeholder')}
                            placeholderTextColor={Colors.textMuted}
                            style={styles.input}
                            keyboardType="phone-pad"
                            onSubmitEditing={handleSilenceNumber}
                        />
                        <Pressable
                            onPress={handleSilenceNumber}
                            style={({ pressed }) => [
                                styles.addBtn,
                                pressed && styles.addBtnPressed,
                                !phoneNumber.trim() && styles.addBtnDisabled,
                            ]}
                            disabled={!phoneNumber.trim()}
                        >
                            <MaterialCommunityIcons name="volume-off" size={22} color={Colors.white} />
                        </Pressable>
                    </View>
                </View>

                {/* List */}
                <View style={styles.listSection}>
                    <Text style={styles.listTitle}>{t('silenced.listTitle', { count: silencedList.length })}</Text>

                    <View style={styles.list}>
                        {silencedList.map((num) => (
                            <View key={num} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <View style={styles.iconWrap}>
                                        <MaterialCommunityIcons name="phone-off" size={18} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.numberText}>{num}</Text>
                                </View>
                                <Pressable
                                    onPress={() => handleRemoveNumber(num)}
                                    style={({ pressed }) => [
                                        styles.removeBtn,
                                        pressed && { opacity: 0.7 }
                                    ]}
                                >
                                    <Text style={styles.removeText}>{t('silenced.remove')}</Text>
                                </Pressable>
                            </View>
                        ))}

                        {silencedList.length === 0 && (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons
                                    name="phone-check-outline"
                                    size={48}
                                    color={Colors.primaryBorder}
                                />
                                <Text style={styles.emptyTitle}>{t('silenced.noSilencedNumbers')}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    content: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.md,
        paddingBottom: 40,
    },
    description: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        fontFamily: 'Inter',
        lineHeight: 20,
        marginBottom: 32,
    },
    // Input
    inputArea: {
        marginBottom: 40,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'Inter',
    },
    addBtn: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.xl,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addBtnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.95 }],
    },
    addBtnDisabled: {
        opacity: 0.4,
    },
    // List
    listSection: {
        gap: 16,
    },
    listTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    list: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surfaceDark,
        padding: 12,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    removeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    removeText: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    emptyTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
});
