import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, StyleProp
} from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'orange' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { isRTL, rowDirection } = useLocalization();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      opacity: disabled ? 0.5 : 1,
    };

    // Sizes
    if (size === 'sm') {
      base.paddingVertical = 8;
      base.paddingHorizontal = 12;
      base.borderRadius = RADIUS.sm;
    } else if (size === 'lg') {
      base.paddingVertical = 15;
      base.paddingHorizontal = 20;
      base.borderRadius = RADIUS.lg;
    } else {
      base.paddingVertical = 12;
      base.paddingHorizontal = 16;
    }

    // Variants
    switch (variant) {
      case 'orange':
        return {
          ...base,
          backgroundColor: COLORS.accentOrange,
          ...SHADOWS.floatingCTA,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: COLORS.cream,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: COLORS.primary,
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: COLORS.danger,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          ...base,
          backgroundColor: COLORS.primary,
          ...SHADOWS.card,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      ...TYPOGRAPHY.btnText,
    };

    if (size === 'sm') base.fontSize = 12;
    if (size === 'lg') base.fontSize = 16;

    switch (variant) {
      case 'secondary':
        return { ...base, color: COLORS.primary };
      case 'outline':
      case 'ghost':
        return { ...base, color: COLORS.primary };
      case 'orange':
      case 'danger':
      case 'primary':
      default:
        return { ...base, color: COLORS.white };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginHorizontal: 8 } : null, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};
