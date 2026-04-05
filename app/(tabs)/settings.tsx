/**
 * Settings Screen — Preferences, language dropdown, biometrics, coffee support
 */

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { LanguageOption } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpamFilter } from '@/contexts/SpamFilterContext';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    NativeModules,
    AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SecurityCard } from '@/components/ui/SecurityCard';
import { LanguageModal } from '@/components/ui/LanguageModal';
import * as Haptics from 'expo-haptics';
import { Linking } from 'react-native';

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
    const { resetAllData } = useSpamFilter();

    // Core states
    const [notifications, setNotifications] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [notificationAccess, setNotificationAccess] = useState(false);

    const { PermissionModule } = NativeModules;
    const isIOS = Platform.OS === 'ios';

    /**
     * checkNotificationAccess — Verifies if the app has the required 
     * notification listener permissions on Android.
     */
    const checkNotificationAccess = async () => {
        if (Platform.OS === 'android' && PermissionModule?.isNotificationListenerEnabled) {
            try {
                const isEnabled = await PermissionModule.isNotificationListenerEnabled();
                setNotificationAccess(isEnabled);
            } catch (err) {
                console.error('Failed to check notification access:', err);
            }
        }
    };

    useEffect(() => {
        checkNotificationAccess();

        // Listen for app state changes to re-check when returning from settings
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkNotificationAccess();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Language states
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

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

    /**
     * handleSelectLanguage — Updates app-wide language, saves preference 
     * to storage, and provides haptic feedback.
     */
    const handleSelectLanguage = async (code: string) => {
        setSelectedLanguage(code);
        setLanguageModalVisible(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        i18n.changeLanguage(code); 
        try {
            await AsyncStorage.setItem('@settings_language', code);
        } catch (err) {
            console.error('Failed to save language', err);
        }
    };

    /**
     * handleToggleBiometric — Manages biometric authentication state, 
     * requiring verification before activation.
     */
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const { Linking } = require('react-native');
        if (Platform.OS === 'android') {
            Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
        } else {
            Linking.openSettings();
        }
    };

    const handleClearData = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            t('settings.confirmClearTitle'),
            t('settings.confirmClearMsg'),
            [
                { text: t('settings.cancel'), style: 'cancel' },
                { 
                    text: t('settings.reset'), 
                    style: 'destructive',
                    onPress: async () => {
                        await resetAllData();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert(t('settings.clearSuccess'), t('settings.clearSuccessMsg'));
                    }
                }
            ]
        );
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
                        <SecurityCard 
                            icon={biometricAuth ? "fingerprint" : "fingerprint-off"}
                            title={t('settings.appLock')}
                            subtitle={biometricAuth ? t('settings.securedBiometrics') : t('settings.tapEnable')}
                            isActive={biometricAuth}
                            onPress={() => handleToggleBiometric(!biometricAuth)}
                            isRTL={isRTL}
                        />

                        <SecurityCard 
                            icon={notifications ? "bell-ring" : "bell-off-outline"}
                            title={t('settings.alerts')}
                            subtitle={notifications ? t('settings.liveUpdatesOn') : t('settings.currentlyMuted')}
                            isActive={notifications}
                            onPress={() => setNotifications(!notifications)}
                            isRTL={isRTL}
                        />
                    </View>

                    {/* Notification Access / Suppression Section */}
                    <View style={{ marginTop: 24 }}>
                        <Pressable 
                            style={({ pressed }) => [
                                styles.settingsCard,
                                pressed && { backgroundColor: Colors.primaryLight }
                            ]}
                            onPress={handleOpenNotificationAccess}
                        >
                            <View style={{ padding: 16 }}>
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={[styles.securityFeatureIcon, (notificationAccess || isIOS) && styles.securityFeatureIconActive, { width: 44, height: 44 }]}>
                                            <MaterialCommunityIcons
                                                name="shield-check-outline"
                                                size={24}
                                                color={(notificationAccess || isIOS) ? Colors.primary : Colors.textMuted}
                                            />
                                        </View>
                                        <View style={{ gap: 2 }}>
                                            <Text style={styles.securityFeatureTitle}>
                                                {isIOS ? t('settings.iosMessageFiltering') : t('settings.notificationAccess')}
                                            </Text>
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                                                <View style={[styles.statusDot, (notificationAccess || isIOS) && styles.statusDotActive, { width: 6, height: 6 }]} />
                                                <Text style={[styles.securityFeatureSubtitle, { color: (notificationAccess || isIOS) ? '#10b981' : Colors.textMuted, fontWeight: '600' }]}>
                                                    {isIOS ? t('settings.suppressionActive') : (notificationAccess ? t('settings.suppressionActive') : t('settings.suppressionInactive'))}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons 
                                        name={isRTL ? "chevron-left" : "chevron-right"} 
                                        size={22} 
                                        color={Colors.textMuted} 
                                    />
                                </View>
                                
                                <Text style={[styles.suppressDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {isIOS ? t('settings.iosFilterDesc') : t('settings.suppressDesc')}
                                </Text>
                            </View>
                        </Pressable>
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
                            onPress={() => router.push('/privacy')}
                            showChevron
                        />
                         <View style={styles.divider} />
                        <SettingsRow
                            icon="file-document-outline"
                            label={t('settings.termsOfService')}
                            onPress={() => router.push('/terms')}
                            showChevron
                        />
                    </View>
                </View>

                {/* Language Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('settings.systemLanguage')}</Text>

                    <Pressable
                        onPress={() => setLanguageModalVisible(true)}
                        style={({ pressed }) => [
                            styles.dropdownTrigger,
                            { flexDirection: isRTL ? 'row-reverse' : 'row' },
                            pressed && { backgroundColor: Colors.primaryLight },
                        ]}
                    >
                        <View style={[styles.dropdownSelected, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={styles.dropdownFlag}>{currentLang.flag}</Text>
                            <Text style={styles.dropdownName}>{currentLang.name}</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={isRTL ? "chevron-left" : "chevron-right"}
                            size={22}
                            color={Colors.textMuted}
                        />
                    </Pressable>

                    <LanguageModal 
                        visible={languageModalVisible}
                        onClose={() => setLanguageModalVisible(false)}
                        selectedLanguage={selectedLanguage}
                        onSelectLanguage={handleSelectLanguage}
                    />
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

                {/* Data Management */}
                <View style={[styles.section, { marginTop: 16 }]}>
                    <Text style={[styles.sectionTitle, { color: '#ef4444', textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('settings.dataManagement')}
                    </Text>
                    <View style={styles.settingsCard}>
                        <SettingsRow
                            icon="delete-sweep-outline"
                            label={t('settings.clearAllData')}
                            description={t('settings.clearAllDataDesc')}
                            onPress={handleClearData}
                            labelStyle={{ color: '#ef4444' }}
                            iconColor="#ef4444"
                        />
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
        overflow: 'hidden',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.borderDark,
    },
    statusDotActive: {
        backgroundColor: '#10b981',
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
