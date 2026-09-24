// ============================================================================
// mobile/src/components/vehicle/BrandLogo.tsx
// Professional Automotive Brand Logo component for React Native Expo
// Supports vector SVG rendering, automatic brand resolution, and reliable fallback.
// ============================================================================

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { resolveBrand } from '../../services/brandResolver';
import { BRAND_SVG_XML } from './brandSvgData';

interface BrandLogoProps {
  makeName: string;
  makeNameAr?: string;
  slug?: string;
  logoUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  makeName,
  makeNameAr,
  slug,
  logoUrl,
  size = 44,
  style,
}) => {
  // Resolve canonical brand details and slug
  const brandMeta = useMemo(() => {
    return resolveBrand(slug || makeName, makeNameAr);
  }, [slug, makeName, makeNameAr]);

  const svgXml = useMemo(() => {
    return BRAND_SVG_XML[brandMeta.slug] || null;
  }, [brandMeta.slug]);

  // Generate fallback initials (e.g., 'MB' for Mercedes-Benz, 'BMW', or 'T' for Toyota)
  const fallbackInitials = useMemo(() => {
    const raw = (brandMeta.nameEn || makeName || '').trim();
    if (!raw) return '?';
    if (raw.toUpperCase() === 'BMW') return 'BMW';
    if (raw.toLowerCase().includes('mercedes')) return 'MB';
    if (raw.toLowerCase().includes('land rover')) return 'LR';
    const words = raw.split(/[\s-]+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  }, [brandMeta.nameEn, makeName]);

  const containerSize = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.22),
  };

  const svgSize = Math.round(size * 0.74);

  return (
    <View
      style={[
        styles.container,
        containerSize,
        style,
        {
          // Strict LTR orientation: never mirror or flip vehicle logos in RTL mode
          direction: 'ltr',
        },
      ]}
    >
      {svgXml ? (
        <SvgXml xml={svgXml} width={svgSize} height={svgSize} />
      ) : (
        <View
          style={[
            styles.fallbackBadge,
            {
              backgroundColor: brandMeta.accentColor ? `${brandMeta.accentColor}12` : '#F1F5F9',
              borderColor: brandMeta.accentColor ? `${brandMeta.accentColor}30` : '#CBD5E1',
            },
          ]}
        >
          <Text
            style={[
              styles.fallbackText,
              {
                fontSize: size >= 48 ? 14 : 11,
                color: brandMeta.accentColor || '#334155',
              },
            ]}
            numberOfLines={1}
          >
            {fallbackInitials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallbackBadge: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  fallbackText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
