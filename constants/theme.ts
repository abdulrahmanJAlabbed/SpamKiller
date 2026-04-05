import { Platform } from 'react-native';

/**
 * Aegis Design Tokens — Obsidian Cyber Theme
 * A premium, high-contrast dark theme with neon accents and deep charcoal surfaces.
 */

export const Colors = {
  // Cyber Neon Cyan
  primary: '#00f5ff', 
  primaryLight: 'rgba(0, 245, 255, 0.12)',
  primaryBorder: 'rgba(0, 245, 255, 0.4)',
  primaryGlow: 'rgba(0, 245, 255, 0.08)',
  primaryActive: '#70ffff',

  // Obsidian Deep Neutrals
  backgroundDark: '#050505', // True obsidian
  backgroundLight: '#ffffff',
  surfaceDark: '#0d0d0d',    // Elevation 1
  surfaceLight: '#151515',   // Elevation 2
  borderDark: '#1a1a1a',     // Subtle dark border

  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',  // Muted gray
  textMuted: '#606060',      // Deep muted gray
  textDark: '#050505',

  white: '#ffffff',
  black: '#000000',

  // Cyber Status
  blockedBg: 'rgba(255, 0, 122, 0.15)', // Neon Pink
  blockedText: '#ff007a',
  blockedBorder: 'rgba(255, 0, 122, 0.3)',

  warningBg: 'rgba(255, 170, 0, 0.15)', // Cyber Amber
  warningText: '#ffaa00',
  warningBorder: 'rgba(255, 170, 0, 0.3)',

  successGreen: '#00ffaa', // Cyber Green

  // Utility effects
  glassBackground: 'rgba(5, 5, 5, 0.95)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
  glassCardBg: 'rgba(13, 13, 13, 0.7)',
  glassCardBorder: 'rgba(255, 255, 255, 0.08)',

  // Toggle & Controls
  toggleTrackOff: '#1a1a1a',
  toggleTrackOn: '#00f5ff',
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
  '2xl': 24, // Wider corners for premium feel
  full: 9999,
} as const;

export const FontSize = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 44,
  '5xl': 56,
} as const;

export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  heading: Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};

export const FontWeight = {
  thin: '100' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '900' as const,
};
