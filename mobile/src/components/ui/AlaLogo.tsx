import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { assets } from '../../constants/assets';

interface AlaLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * AlaLogo — Official ALA Brand Emblem
 * Uses the authentic high-resolution image asset from mobile/assets/images/logo/
 * Preserves 1:1 aspect ratio, authentic colors, and transparent alpha channel.
 */
export const AlaLogo: React.FC<AlaLogoProps> = ({ size = 80, style }) => {
  return (
    <Image
      source={assets.logo}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};
