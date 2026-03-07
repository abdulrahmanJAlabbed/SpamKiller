/**
 * Shield OS Design Tokens
 * Centralized theme for the SpamKiller app matching the Shield OS design system.
 */

export const Colors = {
  primary: '#935af6',
  primaryLight: 'rgba(147, 90, 246, 0.1)',
  primaryBorder: 'rgba(147, 90, 246, 0.2)',
  primaryGlow: 'rgba(147, 90, 246, 0.05)',

  backgroundLight: '#f6f5f8',
  backgroundDark: '#171022',
  surfaceDark: '#1f1630',
  borderDark: '#2e2839',

  textPrimary: '#f1f5f9',    // slate-100
  textSecondary: '#94a3b8',  // slate-400
  textMuted: '#64748b',      // slate-500
  textDark: '#0f172a',       // slate-900

  white: '#ffffff',
  black: '#000000',

  // Status colors
  blockedBg: 'rgba(127, 29, 29, 0.3)',
  blockedText: 'rgba(248, 113, 113, 0.7)',
  blockedBorder: 'rgba(127, 29, 29, 0.3)',

  snoozedBg: 'rgba(120, 53, 15, 0.3)',
  snoozedText: 'rgba(251, 191, 36, 0.7)',
  snoozedBorder: 'rgba(120, 53, 15, 0.3)',

  successGreen: '#22c55e',

  // Glass effects
  glassBackground: 'rgba(23, 16, 34, 0.7)',
  glassBorder: 'rgba(147, 90, 246, 0.2)',
  glassCardBg: 'rgba(147, 90, 246, 0.03)',
  glassCardBorder: 'rgba(147, 90, 246, 0.05)',

  // Toggle
  toggleTrackOff: 'rgba(147, 90, 246, 0.2)',
  toggleTrackOn: '#935af6',

  // Slider  
  sliderTrack: 'rgba(147, 90, 246, 0.2)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const FontSize = {
  '2xs': 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
} as const;

export const FontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
