import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
}) => {
  const getStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: COLORS.white,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'flat':
        return {
          ...base,
          backgroundColor: COLORS.background,
        };
      case 'elevated':
      default:
        return {
          ...base,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
          ...SHADOWS.card,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[getStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getStyle(), style]}>{children}</View>;
};
