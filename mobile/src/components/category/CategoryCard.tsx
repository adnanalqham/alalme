import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../theme';
import { useLocalization } from '../../localization';

export interface CategoryData {
  id: string;
  nameEn: string;
  nameAr: string;
  count: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  imageUri?: string;
}

interface CategoryCardProps {
  category: CategoryData;
  onPress: () => void;
  variant?: 'grid' | 'browse'; // 'grid' for Home, 'browse' for Categories screen
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  variant = 'grid',
}) => {
  const { isRTL, textAlign, rowDirection } = useLocalization();
  const name = isRTL ? category.nameAr : category.nameEn;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        variant === 'browse' ? styles.browseCard : styles.gridCard,
      ]}
    >
      {/* Component Cutout Frame Matching Reference Images */}
      <View style={styles.imageFrame}>
        {category.imageUri ? (
          <Image source={{ uri: category.imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name={category.iconName} size={38} color={COLORS.navy} />
        )}
      </View>

      {/* Title and Items Count Matching Reference Screens */}
      <View style={styles.infoArea}>
        <View style={[styles.titleRow, { flexDirection: rowDirection }]}>
          <Text style={[styles.title, { textAlign }]} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.countText}>
            ({category.count})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  browseCard: {
    flex: 1,
    marginHorizontal: 6,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  imageFrame: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  image: {
    width: 54,
    height: 54,
  },
  infoArea: {
    width: '100%',
  },
  titleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  countText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
});
