import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TextStyle, ViewStyle,
  TextInputProps
} from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../theme';
import { useLocalization } from '../../localization';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isTechnical?: boolean; // For part numbers, OEM codes, phones, emails
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isTechnical = false,
  containerStyle,
  style,
  ...rest
}) => {
  const { isRTL, textAlign, technicalText } = useLocalization();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { textAlign }]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputWrapper,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
        error ? styles.inputError : null
      ]}>
        {leftIcon && <View style={styles.iconSlot}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={COLORS.textPlaceholder}
          style={[
            styles.input,
            isTechnical ? technicalText : { textAlign },
            style,
          ]}
          {...rest}
        />

        {rightIcon && <View style={styles.iconSlot}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.errorText, { textAlign }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  iconSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginTop: 4,
  },
});
