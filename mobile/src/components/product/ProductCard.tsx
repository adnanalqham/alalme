import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { ProductItem } from '../../context/AppContext';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: ProductItem;
  isCompatible?: boolean;
  onPress: () => void;
  onAddToCart?: () => void;
  horizontal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCompatible,
  onPress,
  onAddToCart,
  horizontal = false,
}) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const name = isRTL ? product.nameAr : product.nameEn;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        horizontal ? styles.cardHorizontal : styles.cardVertical,
      ]}
    >
      {/* Product Image Frame */}
      <View style={horizontal ? styles.imgFrameHoriz : styles.imgFrameVert}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Availability / Condition Badge */}
        <View style={styles.badgeAnchor}>
          <Badge
            label={product.condition}
            tone={product.condition === 'OEM' ? 'cream' : 'info'}
          />
        </View>
      </View>

      {/* Info Content */}
      <View style={styles.infoArea}>
        {/* Compatibility indicator */}
        {isCompatible !== undefined && (
          <View style={[styles.compatRow, { flexDirection: rowDirection }]}>
            <MaterialCommunityIcons
              name={isCompatible ? 'check-decagram' : 'alert-circle-outline'}
              size={14}
              color={isCompatible ? COLORS.success : COLORS.danger}
            />
            <Text
              style={[
                styles.compatText,
                { color: isCompatible ? COLORS.success : COLORS.danger, marginHorizontal: 4 }
              ]}
            >
              {isCompatible ? t('compatibleBadge') : t('notCompatible')}
            </Text>
          </View>
        )}

        {/* Product Title */}
        <Text style={[styles.name, { textAlign }]} numberOfLines={2}>
          {name}
        </Text>

        {/* Technical numbers (Forced LTR) */}
        <View style={[styles.techRow, { flexDirection: rowDirection }]}>
          <Text style={styles.techLabel}>OEM:</Text>
          <Text style={[styles.techVal, technicalText]}>
            {product.oemNumber}
          </Text>
        </View>

        {/* Shop Name & Rating */}
        <View style={[styles.metaRow, { flexDirection: rowDirection }]}>
          <Text style={styles.shopName} numberOfLines={1}>
            🏪 {product.shopName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        {/* Price & Action */}
        <View style={[styles.footerRow, { flexDirection: rowDirection }]}>
          <View>
            {product.priceVisibility === 'SHOW_PRICE' ? (
              <Text style={styles.price}>
                ${product.price}
              </Text>
            ) : (
              <Text style={styles.contactPrice}>
                {t('contactShop')}
              </Text>
            )}
          </View>

          {onAddToCart && product.inStock && (
            <TouchableOpacity
              onPress={onAddToCart}
              style={styles.cartButton}
              activeOpacity={0.7}
            >
              <Feather name="shopping-bag" size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
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
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardVertical: {
    width: '100%',
    marginBottom: SPACING.base,
  },
  cardHorizontal: {
    width: 220,
    marginEnd: SPACING.md,
  },
  imgFrameVert: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  imgFrameHoriz: {
    width: '100%',
    height: 130,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeAnchor: {
    position: 'absolute',
    top: 8,
    start: 8,
  },
  infoArea: {
    padding: SPACING.md,
  },
  compatRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  compatText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  name: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  techRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  techLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  techVal: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  metaRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    flex: 1,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 3,
  },
  footerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  price: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  contactPrice: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.navy,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
