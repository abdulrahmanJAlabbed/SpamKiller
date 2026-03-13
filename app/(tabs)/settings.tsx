/**
 * Settings Screen — Preferences, language dropdown, biometrics, coffee support
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { LanguageOption } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    // Core states
    const [notifications, setNotifications] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [notificationAccess, setNotificationAccess] = useState(false);

    // Language states
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

    // Loading state for init
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Sync selected language with i18n on load
        setSelectedLanguage(i18n.language || 'en');
    }, [i18n.language]);

    useEffect(() => {
        // Load initial persisted values for non-language settings
        const loadSettings = async () => {
            try {
                const bio = await AsyncStorage.getItem('@settings_biometric');
                if (bio === 'true') setBiometricAuth(true);
            } catch (err) {
                console.error('Failed to load settings', err);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    const handleSelectLanguage = async (code: string) => {
        setSelectedLanguage(code);
        setLanguageDropdownOpen(false);
        i18n.changeLanguage(code); // Instantly switches active language across the app
        try {
            await AsyncStorage.setItem('@settings_language', code);
        } catch (err) {
            console.error('Failed to save language', err);
        }
    };

    const handleToggleBiometric = async (value: boolean) => {
        if (value) {
            // Check what forms of local authentication are available on this device
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            // Support devices without biometrics but with a Passcode/PIN/Pattern set
            let canAuthenticate = false;

            if (hasHardware && isEnrolled) {
                canAuthenticate = true;
            } else {
                // Check if they at least have a passcode/PIN set up on the OS level
                const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

                // SecurityLevel.NONE = 0, SECRET = 1, BIOMETRIC_WEAK = 2, BIOMETRIC_STRONG = 3
                if (securityLevel > LocalAuthentication.SecurityLevel.NONE) {
                    canAuthenticate = true;
                }
            }

            if (!canAuthenticate) {
                Alert.alert(
                    t('settings.deviceNotSecured'),
                    t('settings.mustSetupPasscode')
                );
                return;
            }

            // Authenticate to enable (will prompt face/fingerprint OR passcode if missing)
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t('settings.enableAppLock'),
                cancelLabel: t('settings.cancel'),
                disableDeviceFallback: false,
                fallbackLabel: t('settings.usePasscode')
            });

            if (result.success) {
                setBiometricAuth(true);
                AsyncStorage.setItem('@settings_biometric', 'true');
            }
        } else {
            // Just disable
            setBiometricAuth(false);
            AsyncStorage.setItem('@settings_biometric', 'false');
        }
    };

    const handleOpenNotificationAccess = () => {
        if (Platform.OS === 'android') {
            const { Linking } = require('react-native');
            // Intent to open Notification Access settings
            Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
        } else {
            Alert.alert('Info', 'Notification suppression is managed by iOS system settings.');
        }
    };

    if (!isLoaded) {
        return (
            <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    }

    const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScreenHeader
                title={t('settings.title')}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Core Security Toggles */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.securityAlerts')}</Text>
                    <View style={[styles.securityGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        {/* App Lock Card */}
                        <Pressable
                            onPress={() => handleToggleBiometric(!biometricAuth)}
                            style={[
                                styles.securityFeatureCard,
                                biometricAuth && styles.securityFeatureCardActive
                            ]}
                        >
                            <View style={[styles.securityTopRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <View style={[styles.securityFeatureIcon, biometricAuth && styles.securityFeatureIconActive]}>
                                    <MaterialCommunityIcons
                                        name={biometricAuth ? "fingerprint" : "fingerprint-off"}
                                        size={28}
                                        color={biometricAuth ? Colors.primary : Colors.textMuted}
                                    />
                                </View>
                                <View style={[styles.securityStatusDot, biometricAuth && styles.securityStatusDotActive]} />
                            </View>
                            <View style={[styles.securityFeatureText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.securityFeatureTitle}>{t('settings.appLock')}</Text>
                                <Text style={[styles.securityFeatureSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {biometricAuth ? t('settings.securedBiometrics') : t('settings.tapEnable')}
                                </Text>
                            </View>
                        </Pressable>

                        {/* Notifications Card */}
                        <Pressable
                            onPress={() => setNotifications(!notifications)}
                            style={[
                                styles.securityFeatureCard,
                                notifications && styles.securityFeatureCardActive
                            ]}
                        >
                            <View style={[styles.securityTopRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <View style={[styles.securityFeatureIcon, notifications && styles.securityFeatureIconActive]}>
                                    <MaterialCommunityIcons
                                        name={notifications ? "bell-ring" : "bell-off-outline"}
                                        size={28}
                                        color={notifications ? Colors.primary : Colors.textMuted}
                                    />
                                </View>
                                <View style={[styles.securityStatusDot, notifications && styles.securityStatusDotActive]} />
                            </View>
                            <View style={[styles.securityFeatureText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.securityFeatureTitle}>{t('settings.alerts')}</Text>
                                <Text style={[styles.securityFeatureSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {notifications ? t('settings.liveUpdatesOn') : t('settings.currentlyMuted')}
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    {/* Notification Access / Suppression Section */}
                    <View style={{ marginTop: 24 }}>
                        <View style={styles.settingsCard}>
                            <View style={{ padding: 16 }}>
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={[styles.securityFeatureIcon, notificationAccess && styles.securityFeatureIconActive, { width: 40, height: 40 }]}>
                                            <MaterialCommunityIcons
                                                name="shield-alert-outline"
                                                size={22}
                                                color={notificationAccess ? Colors.primary : Colors.textMuted}
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.securityFeatureTitle}>{t('settings.notificationAccess')}</Text>
                                            <Text style={[styles.securityFeatureSubtitle, { color: notificationAccess ? '#10b981' : Colors.textMuted }]}>
                                                {notificationAccess ? t('settings.suppressionActive') : t('settings.suppressionInactive')}
                                            </Text>
                                        </View>
                                    </View>
                                    {notificationAccess && (
                                        <MaterialCommunityIcons name="check-decagram" size={24} color="#10b981" />
                                    )}
                                </View>
                                
                                <Text style={[styles.suppressDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('settings.suppressDesc')}
                                </Text>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.suppressButton,
                                        pressed && styles.suppressButtonPressed
                                    ]}
                                    onPress={handleOpenNotificationAccess}
                                >
                                    <Text style={styles.suppressButtonText}>{t('settings.enableSuppression')}</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={18} color="#000" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                {/* AI Settings link */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.aiProtection')}</Text>
                    <View style={styles.settingsCard}>
                        <SettingsRow
                            icon="creation"
                            label={t('settings.aiSpamDetector')}
                            description={t('settings.neuralConfig')}
                            onPress={() => router.push({ pathname: '/ai-settings' })}
                            showChevron
                        />
                    </View>
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.securityAlerts')}</Text>
                    <View style={styles.settingsCard}>
                         <SettingsRow
                            icon="shield-key-outline"
                            label={t('settings.privacyPolicy')}
                            onPress={() => {}}
                        />
                         <View style={styles.divider} />
                        <SettingsRow
                            icon="file-document-outline"
                            label={t('settings.termsOfService')}
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Language Dropdown */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.systemLanguage')}</Text>

                    {/* Dropdown trigger */}
                    <Pressable
                        onPress={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                        style={[
                            styles.dropdownTrigger,
                            { flexDirection: isRTL ? 'row-reverse' : 'row' },
                            languageDropdownOpen && styles.dropdownTriggerOpen,
                        ]}
                    >
                        <View style={[styles.dropdownSelected, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={styles.dropdownFlag}>{currentLang.flag}</Text>
                            <Text style={styles.dropdownName}>{currentLang.name}</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={languageDropdownOpen ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color={Colors.textMuted}
                        />
                    </Pressable>

                    {/* Dropdown options */}
                    {languageDropdownOpen && (
                        <View style={styles.dropdownList}>
                            {LANGUAGES.map((lang, index) => {
                                const isSelected = lang.code === selectedLanguage;
                                return (
                                    <React.Fragment key={lang.code}>
                                        {index > 0 && <View style={styles.dropdownDivider} />}
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.dropdownItem,
                                                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                                                isSelected && styles.dropdownItemSelected,
                                                pressed && styles.dropdownItemPressed,
                                            ]}
                                            onPress={() => handleSelectLanguage(lang.code)}
                                        >
                                            <View style={[styles.dropdownItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <Text style={styles.dropdownItemFlag}>{lang.flag}</Text>
                                                <Text style={[
                                                    styles.dropdownItemName,
                                                    isSelected && styles.dropdownItemNameSelected,
                                                ]}>
                                                    {lang.name}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <MaterialCommunityIcons
                                                    name="check-circle"
                                                    size={18}
                                                    color={Colors.primary}
                                                />
                                            )}
                                        </Pressable>
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Buy us a Coffee */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.supportUs')}</Text>
                    <View style={styles.coffeeCard}>
                        <View style={[styles.coffeeHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <MaterialCommunityIcons
                                name="coffee-outline"
                                size={26}
                                color="#f59e0b"
                            />
                            <View>
                                <Text style={styles.coffeeTitle}>{t('settings.enjoying')}</Text>
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.coffeeButton,
                                pressed && styles.coffeeButtonPressed,
                            ]}
                        >
                            <Text style={styles.coffeeButtonText}>{t('settings.buyCoffee')}</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    content: {
        paddingBottom: 40,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: 8,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: 8,
        marginBottom: 16,
        },
    // New Security Grid
    securityGrid: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    securityFeatureCard: {
        flex: 1,
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        padding: 16,
        gap: 16,
    },
    securityFeatureCardActive: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primaryBorder,
    },
    securityTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    securityFeatureIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.backgroundDark,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    securityFeatureIconActive: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primaryBorder,
    },
    securityStatusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.borderDark,
    },
    securityStatusDotActive: {
        backgroundColor: '#10b981', // Emerald green indicating ON
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 4,
    },
    securityFeatureText: {
        gap: 4,
    },
    securityFeatureTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '600',
        },
    securityFeatureSubtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
            lineHeight: 18,
    },
    // Generic Settings Card
    settingsCard: {
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        padding: 8,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderDark,
        marginHorizontal: 12,
    },
    // Dropdown
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surfaceDark,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownTriggerOpen: {
        borderColor: Colors.primary,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
    },
    dropdownSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownFlag: {
        fontSize: 20,
    },
    dropdownName: {
        color: Colors.textPrimary,
        fontSize: FontSize.base,
        fontWeight: '500',
        },
    dropdownList: {
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: Colors.primary,
        borderBottomLeftRadius: BorderRadius['2xl'],
        borderBottomRightRadius: BorderRadius['2xl'],
        overflow: 'hidden',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: Colors.borderDark,
        marginHorizontal: 12,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    dropdownItemSelected: {
        backgroundColor: Colors.primaryLight,
    },
    dropdownItemPressed: {
        backgroundColor: Colors.primaryLight,
    },
    dropdownItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownItemFlag: {
        fontSize: 18,
    },
    dropdownItemName: {
        color: Colors.textSecondary,
        fontSize: FontSize.base,
        },
    dropdownItemNameSelected: {
        color: Colors.primary,
        fontWeight: '600',
    },
    // Coffee Section
    coffeeCard: {
        borderRadius: BorderRadius['2xl'],
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)', // Amber subtle border
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        gap: 20,
    },
    coffeeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    coffeeTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginBottom: 4,
    },
    coffeeSubtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
    },
    coffeeButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 14,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    coffeeButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    coffeeButtonText: {
        color: Colors.backgroundDark,
        fontSize: FontSize.base,
        fontWeight: '700',
    },
    suppressDesc: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        lineHeight: 18,
        marginBottom: 20,
    },
    suppressButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: BorderRadius.xl,
    },
    suppressButtonPressed: {
        opacity: 0.8,
    },
    suppressButtonText: {
        color: '#000',
        fontSize: FontSize.base,
        fontWeight: '600',
    },
});
