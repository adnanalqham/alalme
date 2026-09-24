import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, ProductItem } from '../../context/AppContext';
import { ScreenHeader } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface ProductDetailsScreenProps {
  navigation: any;
  route?: {
    params?: {
      product?: ProductItem;
    };
  };
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { activeVehicle, isVehicleCompatible, addToCart, products } = useApp();

  // Active product item (can be switched if user chooses another shop offer)
  const [activeProduct, setActiveProduct] = useState<ProductItem>(
    route?.params?.product || products[0]
  );
  const [quantity, setQuantity] = useState(1);

  const isCompatible = isVehicleCompatible(activeProduct, activeVehicle);
  const isPriceHidden = activeProduct.priceVisibility === 'HIDE_PRICE';

  // Find other offers from different shops for the same part number
  const otherOffers = products.filter(
    p => p.id !== activeProduct.id &&
         ((p.partNumber && p.partNumber === activeProduct.partNumber) ||
          (p.oemNumber && p.oemNumber === activeProduct.oemNumber) ||
          (p.nameEn && p.nameEn === activeProduct.nameEn))
  );

  const shopPhone = '777111111'; // Default marketplace shop hotline if not set

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `مرحباً ${activeProduct.shopName}، أستفسر عن توفر وسعر القطعة:\n${activeProduct.nameAr || activeProduct.nameEn}\nرقم القطعة: ${activeProduct.partNumber}\nعبر تطبيق العالمي لقطع الغيار.`
    );
    Linking.openURL(`whatsapp://send?phone=+967${shopPhone}&text=${text}`).catch(() => {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Notice',
        isRTL ? `يمكنك التواصل هاتفياً على الرقم ${shopPhone}` : `You can call the shop directly at ${shopPhone}`
      );
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${shopPhone}`);
  };

  const handleAddToCart = (itemToCart = activeProduct) => {
    addToCart(itemToCart, quantity);
    Alert.alert(
      isRTL ? 'تمت الإضافة للسلة' : 'Added to Cart',
      isRTL
        ? `تمت إضافة ${quantity} من ${itemToCart.nameAr || itemToCart.nameEn} من محرك "${itemToCart.shopName}"`
        : `Added ${quantity} x ${itemToCart.nameEn} to your cart`,
      [
        { text: isRTL ? 'مواصلة التسوق' : 'Continue Shopping', style: 'cancel' },
        { text: isRTL ? 'الذهاب للسلة' : 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const handleBuyNow = () => {
    addToCart(activeProduct, quantity);
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isRTL ? activeProduct.nameAr : activeProduct.nameEn}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Image Stage */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: activeProduct.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.conditionTag}>
            <Badge label={activeProduct.condition} tone="navy" />
          </View>
        </View>

        {/* 2. Primary Information Card */}
        <View style={styles.detailsCard}>
          {/* Vehicle Compatibility Banner */}
          {activeVehicle && (
            <View style={[
              styles.fitmentBanner,
              { flexDirection: rowDirection },
              isCompatible ? styles.compatibleBanner : styles.incompatibleBanner
            ]}>
              <MaterialCommunityIcons
                name={isCompatible ? 'check-decagram' : 'alert-circle'}
                size={20}
                color={isCompatible ? COLORS.success : COLORS.danger}
              />
              <Text style={[styles.fitmentText, { textAlign }]}>
                {isCompatible
                  ? `${t('compatibleBadge')} (${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model})`
                  : `${t('notCompatible')} (${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model})`}
              </Text>
            </View>
          )}

          {/* Part Title */}
          <Text style={[styles.productTitle, { textAlign }]}>
            {isRTL ? activeProduct.nameAr : activeProduct.nameEn}
          </Text>

          <Text style={[styles.manufacturerText, { textAlign }]}>
            {isRTL ? `الشركة المصنعة: ${activeProduct.manufacturer}` : `Manufacturer: ${activeProduct.manufacturer}`}
          </Text>

          {/* Technical Identification (Forced LTR) */}
          <View style={[styles.techRow, { flexDirection: rowDirection }]}>
            <View style={styles.techBadge}>
              <Text style={styles.techLabel}>Part No: </Text>
              <Text style={[styles.techValue, technicalText]}>{activeProduct.partNumber}</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techLabel}>OEM: </Text>
              <Text style={[styles.techValue, technicalText]}>{activeProduct.oemNumber}</Text>
            </View>
          </View>

          {/* Price & Stock Section */}
          <View style={[styles.priceRow, { flexDirection: rowDirection }]}>
            {!isPriceHidden ? (
              <View>
                <Text style={styles.priceValue}>${activeProduct.price}</Text>
                <Text style={styles.priceSub}>{isRTL ? 'السعر المعلن للمحل' : 'Listed Shop Price'}</Text>
              </View>
            ) : (
              <View style={styles.hiddenPriceContainer}>
                <Text style={styles.hiddenPriceLabel}>
                  {isRTL ? 'السعر غير معلن' : 'Price Upon Request'}
                </Text>
                <Text style={styles.hiddenPriceSub}>
                  {isRTL ? 'تواصل مع المحل لمعرفة السعر والتجهيز' : 'Contact shop for price & stock'}
                </Text>
              </View>
            )}

            <View style={[styles.stockStatus, { flexDirection: rowDirection }]}>
              <View style={[styles.stockDot, { backgroundColor: activeProduct.inStock ? COLORS.success : COLORS.error }]} />
              <Text style={styles.stockText}>
                {activeProduct.inStock
                  ? (isRTL ? `متوفر (${activeProduct.stockQty} قطعة)` : `In Stock (${activeProduct.stockQty})`)
                  : (isRTL ? 'غير متوفر حالياً' : 'Out of Stock')}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Shop Info & Direct Communication */}
        <View style={styles.shopCard}>
          <View style={[styles.shopHeader, { flexDirection: rowDirection }]}>
            <View style={styles.shopAvatar}>
              <FontAwesome5 name="store" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.shopName, { textAlign }]}>{activeProduct.shopName}</Text>
              <View style={[styles.ratingRow, { flexDirection: rowDirection }]}>
                <Feather name="map-pin" size={12} color={COLORS.textMuted} />
                <Text style={styles.shopLocationText}>
                  {isRTL ? 'صنعاء - شارع الستين' : "Sana'a - 60th St."}
                </Text>
                <Text style={{ marginHorizontal: 4, color: COLORS.border }}>•</Text>
                <Feather name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{activeProduct.rating}</Text>
              </View>
            </View>

            <View style={[styles.contactActions, { flexDirection: rowDirection }]}>
              <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={handleWhatsApp}
                accessibilityLabel={isRTL ? 'مراسلة عبر واتساب' : 'WhatsApp'}
              >
                <FontAwesome5 name="whatsapp" size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.phoneBtn}
                onPress={handleCall}
                accessibilityLabel={isRTL ? 'اتصال هاتفي' : 'Call'}
              >
                <Feather name="phone" size={15} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Multi-Shop Comparison (Section 13: Compare Other Shop Offers for same part) */}
        {otherOffers.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={[styles.sectionHeadingRow, { flexDirection: rowDirection }]}>
              <Text style={styles.sectionHeading}>
                {isRTL ? 'عروض المحلات الأخرى لنفس القطعة' : 'Other Shop Offers for This Part'}
              </Text>
              <Text style={styles.offersCountBadge}>
                {otherOffers.length} {isRTL ? 'محلات' : 'shops'}
              </Text>
            </View>

            <View style={styles.offersList}>
              {otherOffers.map(offer => (
                <View key={offer.id} style={[styles.offerCard, { flexDirection: rowDirection }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.offerShopName, { textAlign }]}>{offer.shopName}</Text>
                    <Text style={[styles.offerMeta, { textAlign }]}>
                      {offer.condition} • {isRTL ? 'صنعاء' : "Sana'a"} • {offer.inStock ? (isRTL ? 'جاهز للتسليم' : 'Ready') : (isRTL ? 'بالطلب' : 'On order')}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginHorizontal: 10 }}>
                    {offer.priceVisibility === 'SHOW_PRICE' ? (
                      <Text style={styles.offerPriceText}>${offer.price}</Text>
                    ) : (
                      <Text style={styles.offerContactText}>{isRTL ? 'تواصل للمحل' : 'Contact'}</Text>
                    )}
                  </View>

                  <View style={[styles.offerActions, { flexDirection: rowDirection }]}>
                    <TouchableOpacity
                      style={styles.offerSelectBtn}
                      onPress={() => setActiveProduct(offer)}
                    >
                      <Text style={styles.offerSelectBtnText}>{isRTL ? 'اختيار' : 'Select'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.offerCartBtn}
                      onPress={() => handleAddToCart(offer)}
                    >
                      <Feather name="shopping-bag" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. Specifications & Compatibility Table */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { textAlign }]}>{t('specifications')}</Text>
          <View style={styles.specTable}>
            <View style={[styles.specRow, { flexDirection: rowDirection }]}>
              <Text style={styles.specKey}>{t('condition')}</Text>
              <Text style={styles.specVal}>{activeProduct.condition}</Text>
            </View>
            <View style={[styles.specRow, { flexDirection: rowDirection }]}>
              <Text style={styles.specKey}>{t('brand')}</Text>
              <Text style={styles.specVal}>{activeProduct.manufacturer}</Text>
            </View>
            <View style={[styles.specRow, { flexDirection: rowDirection }]}>
              <Text style={styles.specKey}>{t('partNo')}</Text>
              <Text style={[styles.specVal, technicalText]}>{activeProduct.partNumber}</Text>
            </View>
            <View style={[styles.specRow, { flexDirection: rowDirection }]}>
              <Text style={styles.specKey}>{t('oemNo')}</Text>
              <Text style={[styles.specVal, technicalText]}>{activeProduct.oemNumber}</Text>
            </View>
            <View style={[styles.specRow, { flexDirection: rowDirection }]}>
              <Text style={styles.specKey}>{isRTL ? 'السيارات المتوافقة' : 'Compatible With'}</Text>
              <Text style={styles.specVal}>
                {activeProduct.compatibleVehicles?.map(v => `${v.make} ${v.model} (${v.yearStart}-${v.yearEnd})`).join(', ') || 'General OEM'}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. Description Section */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { textAlign }]}>{t('description')}</Text>
          <Text style={[styles.descriptionText, { textAlign }]}>
            {isRTL ? activeProduct.descriptionAr : activeProduct.descriptionEn}
          </Text>
        </View>
      </ScrollView>

      {/* 7. Bottom Bar: Quantity & Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12), flexDirection: rowDirection }]}>
        {!isPriceHidden && (
          <View style={[styles.stepper, { flexDirection: rowDirection }]}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Feather name="minus" size={16} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity(q => q + 1)}
            >
              <Feather name="plus" size={16} color={COLORS.navy} />
            </TouchableOpacity>
          </View>
        )}

        {/* Dynamic CTAs */}
        <View style={[styles.actionButtons, { flexDirection: rowDirection }]}>
          {!isPriceHidden ? (
            <>
              <Button
                title={t('addToCart')}
                onPress={() => handleAddToCart()}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title={t('buyNow')}
                onPress={handleBuyNow}
                variant="orange"
                style={{ flex: 1 }}
              />
            </>
          ) : (
            <>
              <Button
                title={isRTL ? 'تواصل عبر واتساب' : 'WhatsApp Shop'}
                onPress={handleWhatsApp}
                variant="orange"
                style={{ flex: 1 }}
              />
              <Button
                title={isRTL ? 'اتصال هاتفي' : 'Call Shop'}
                onPress={handleCall}
                variant="secondary"
                style={{ flex: 1 }}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.white,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  conditionTag: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  fitmentBanner: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  compatibleBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  incompatibleBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  fitmentText: {
    ...TYPOGRAPHY.captionBold,
    flex: 1,
    fontSize: 12,
  },
  productTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  manufacturerText: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  techRow: {
    gap: 8,
    marginBottom: SPACING.base,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  techLabel: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  techValue: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    fontSize: 11,
  },
  priceRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  priceValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontSize: 22,
  },
  priceSub: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  hiddenPriceContainer: {
    flex: 1,
  },
  hiddenPriceLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.accentOrange,
    fontSize: 16,
    fontWeight: 'bold',
  },
  hiddenPriceSub: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  stockStatus: {
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  shopCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  shopHeader: {
    alignItems: 'center',
  },
  shopAvatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  ratingRow: {
    alignItems: 'center',
    marginTop: 2,
  },
  shopLocationText: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
    marginHorizontal: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginHorizontal: 2,
  },
  contactActions: {
    gap: 8,
  },
  whatsappBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionBlock: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  offersCountBadge: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    fontSize: 11,
  },
  offersList: {
    gap: 8,
  },
  offerCard: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  offerShopName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  offerMeta: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  offerPriceText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 14,
  },
  offerContactText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.accentOrange,
    fontSize: 12,
  },
  offerActions: {
    gap: 6,
  },
  offerSelectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  offerSelectBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
    fontSize: 11,
  },
  offerCartBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTable: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  specRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    justifyContent: 'space-between',
  },
  specKey: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  specVal: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  descriptionText: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.nav,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stepBtn: {
    padding: 8,
  },
  stepQty: {
    ...TYPOGRAPHY.bodyBold,
    minWidth: 26,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flex: 1,
    gap: 8,
  },
});
