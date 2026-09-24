import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS } from '../../theme';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'error' | 'info' | 'cream' | 'neutral' | 'navy' | 'orange';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  variant?: BadgeTone;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone, variant, style }) => {
  const activeTone = variant || tone || 'neutral';

  const getColors = () => {
    switch (activeTone) {
      case 'success':
        return { bg: COLORS.successLight, text: COLORS.success };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning };
      case 'danger':
      case 'error':
        return { bg: COLORS.dangerLight, text: COLORS.danger };
      case 'info':
        return { bg: COLORS.infoLight, text: COLORS.info };
      case 'cream':
        return { bg: COLORS.cream, text: COLORS.primary };
      case 'navy':
        return { bg: '#EEF2F6', text: COLORS.navy };
      case 'orange':
        return { bg: COLORS.accentOrangeLight, text: COLORS.accentOrange };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: COLORS.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.badgeText,
  },
});
