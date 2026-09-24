import { TextStyle } from 'react-native';

/**
 * Thmanyah Sans Font Family Configuration
 * Standardized font family identifiers matching expo-font naming convention.
 */
export const FONT_NAMES = {
  Light: 'ThmanyahSans-Light',
  Regular: 'ThmanyahSans-Regular',
  Medium: 'ThmanyahSans-Medium',
  Bold: 'ThmanyahSans-Bold',
  Black: 'ThmanyahSans-Black',
} as const;

/**
 * Strict Font Weights conforming to available font files:
 * 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black).
 * Fake weights (600, 800) are strictly forbidden.
 */
export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  bold: '700' as const,
  black: '900' as const,
};

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLarge'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'button'
  | 'caption'
  | 'small';

export interface TypographyToken {
  fontFamily?: string;
  fontWeight: '300' | '400' | '500' | '700' | '900';
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

/**
 * Central Typography Scale (Section 8)
 * - Display: 900 (Black) - For hero / highest level display titles
 * - H1: 700 (Bold) - Main screen headers
 * - H2: 700 (Bold) - Section headers
 * - H3: 700 (Bold) - Card & modal headers
 * - Body Large: 400 (Regular) - Introductory / featured text
 * - Body: 400 (Regular) - Standard body copy
 * - Body Medium: 500 (Medium) - Emphasized body text
 * - Label: 500 (Medium) - Form labels & badge text
 * - Button: 500 (Medium) - Interactive button labels
 * - Caption: 400 (Regular) - Footnotes, timestamps, hints
 * - Small: 400 (Regular) - Secondary metadata
 */
export const TYPOGRAPHY_SCALE: Record<TypographyVariant, TypographyToken> = {
  display: {
    fontFamily: FONT_NAMES.Black,
    fontWeight: '900',
    fontSize: 30,
    lineHeight: 38,
  },
  h1: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
  },
  h2: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
  },
  h3: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLarge: {
    fontFamily: FONT_NAMES.Regular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: FONT_NAMES.Regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: FONT_NAMES.Medium,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: FONT_NAMES.Medium,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: FONT_NAMES.Medium,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: FONT_NAMES.Regular,
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 15,
  },
  small: {
    fontFamily: FONT_NAMES.Regular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
};

/**
 * Backward-compatible TYPOGRAPHY mapping
 * Preserves legacy token names while strictly replacing fake weights (600 -> 700/500)
 */
export const TYPOGRAPHY = {
  display: TYPOGRAPHY_SCALE.display,
  h1: TYPOGRAPHY_SCALE.h1,
  h2: TYPOGRAPHY_SCALE.h2,
  h3: TYPOGRAPHY_SCALE.h3,
  h4: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700' as const,
    fontSize: 15,
    lineHeight: 20,
  },
  bodyLarge: TYPOGRAPHY_SCALE.bodyLarge,
  body: TYPOGRAPHY_SCALE.body,
  bodyRegular: TYPOGRAPHY_SCALE.body,
  bodyMedium: TYPOGRAPHY_SCALE.bodyMedium,
  // Replaced legacy fake 600 weight with strict 700 (bold)
  bodyBold: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700' as const,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: TYPOGRAPHY_SCALE.small,
  // Replaced legacy fake 600 weight with strict 700 (bold)
  bodySmallBold: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700' as const,
    fontSize: 12,
    lineHeight: 16,
  },
  label: TYPOGRAPHY_SCALE.label,
  button: TYPOGRAPHY_SCALE.button,
  caption: TYPOGRAPHY_SCALE.caption,
  captionRegular: TYPOGRAPHY_SCALE.caption,
  captionBold: {
    fontFamily: FONT_NAMES.Bold,
    fontWeight: '700' as const,
    fontSize: 11,
    lineHeight: 14,
  },
  btnText: {
    fontFamily: FONT_NAMES.Medium,
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  badgeText: {
    fontFamily: FONT_NAMES.Medium,
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 14,
  },
};
