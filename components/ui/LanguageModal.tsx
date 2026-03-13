import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import type { LanguageOption } from '@/types';

let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  BlurView = null;
}


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

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
}

export function LanguageModal({
  visible,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}: LanguageModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {Platform.OS === 'ios' && BlurView ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,5,5,0.7)' }]} />
        )}
      </Pressable>

      <View style={styles.centeredView}>
        <View style={styles.modalContent}>
          <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.modalTitle}>{t('settings.systemLanguage')}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {LANGUAGES.map((lang, index) => {
              const isSelected = lang.code === selectedLanguage;
              return (
                <Pressable
                  key={lang.code}
                  style={({ pressed }) => [
                    styles.langItem,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    isSelected && styles.langItemSelected,
                    pressed && styles.langItemPressed,
                  ]}
                  onPress={() => onSelectLanguage(lang.code)}
                >
                  <View style={[styles.langLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                      {lang.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 8,
  },
  langItem: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  langItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  langItemPressed: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.8,
  },
  langLeft: {
    alignItems: 'center',
    gap: 16,
  },
  flag: {
    fontSize: 22,
  },
  langName: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  langNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
