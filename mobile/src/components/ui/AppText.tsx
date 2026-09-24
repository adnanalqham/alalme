import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native';
import { TYPOGRAPHY_SCALE, TypographyVariant } from '../../theme';
import { useLocalization } from '../../localization';

export interface AppTextProps extends RNTextProps {
  /**
   * Central Typography Variant conforming to ALA Design Scale:
   * display (900), h1 (700), h2 (700), h3 (700),
   * bodyLarge (400), body (400), bodyMedium (500),
   * label (500), button (500), caption (400), small (400)
   */
  variant?: TypographyVariant;
  /**
   * Custom text color (falls back to current text theme color)
   */
  color?: string;
  /**
   * Explicit alignment override. Defaults to RTL-aware leading edge.
   */
  align?: TextStyle['textAlign'];
  /**
   * Technical text flag: For VIN, OEM, SKU, Part Numbers, Phones, Emails, URLs, Barcodes.
   * Forces LTR writing direction and left alignment so numbers and codes are never reversed.
   */
  isTechnical?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

/**
 * AppText — Centralized Typography Component
 * Enforces unified Thmanyah Sans typography tokens across all mobile screens.
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  align,
  isTechnical = false,
  children,
  style,
  ...rest
}) => {
  const { textAlign, technicalText } = useLocalization();

  const token = TYPOGRAPHY_SCALE[variant] || TYPOGRAPHY_SCALE.body;

  // React Native Rule: With custom fonts named per weight (ThmanyahSans-Bold, etc.),
  // rely solely on fontFamily instead of synthetic fontWeight overrides.
  const baseStyle: TextStyle = {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    color: color,
  };

  const alignmentStyle: TextStyle = isTechnical
    ? technicalText
    : { textAlign: align ?? textAlign };

  return (
    <RNText
      style={[baseStyle, alignmentStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
