/**
 * useThemeColor — Returns Shield OS colors (simplified for flat theme)
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors,
) {
  // Shield OS uses a single dark theme
  const colorFromProps = props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorName];
  }
}
