import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * BackgroundTexture — Adds a subtle noise/grain effect to create depth and a premium feel.
 * Uses a slightly lighter color for the "grain" patches.
 */
export function BackgroundTexture() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.015, // Barely visible grain
    // In React Native, we can't easily do SVG noise filters without libraries,
    // so we use a very subtle tint overlay or would use a tiny tiled image.
    // For now, we'll keep it as a placeholder for visual structure.
  },
});
