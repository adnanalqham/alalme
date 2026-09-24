import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, CartItem } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { cart, updateCartQty, removeFromCart, addOrder } = useApp();

  // Checkout step state (Section 18: 1. Cart Items -> 2. Delivery & Address -> 3. Payment & Review)
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'DELIVERY' | 'PAYMENT'>('CART');
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'SHOP_DELIVERY' | 'EXPRESS'>('SHOP_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'WALLET'>('CASH');

  // Group cart items by shop (Section 17 requirement: Multi-Shop Grouping)
  const groupedByShop = useMemo(() => {
    const map: Record<string, { shopName: string; shopId: string; items: CartItem[] }> = {};
    cart.forEach(item => {
      const sId = item.product.shopId || 'shop_default';
      if (!map[sId]) {
        map[sId] = {
          shopId: sId,
          shopName: item.product.shopName || (isRTL ? 'البركة لقطع الغيار' : 'Al-Barakah Auto Parts'),
          items: [],
        };
      }
      map[sId].items.push(item);
    });
    return Object.values(map);
  }, [cart, isRTL]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = deliveryMethod === 'PICKUP' ? 0 : 5;
  const grandTotal = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;

    addOrder({
      shopName: groupedByShop[0]?.shopName || 'Al-Barakah Auto Parts',
      items: cart.map(i => ({
        name: isRTL ? i.product.nameAr : i.product.nameEn,
        qty: i.quantity,
        price: i.product.price,
      })),
      subtotal,
      deliveryFee,
      total: grandTotal,
      status: 'CONFIRMED',
      deliveryType: deliveryMethod,
      paymentMethod,
    });

    Alert.alert(
      isRTL ? 'تهانينا! تم تأكيد طلبك' : 'Order Confirmed!',
      isRTL
        ? 'تم إرسال طلبك بنجاح إلى المحل، وسيتم التواصل معك مباشرة للتسليم.'
        : 'Your order has been submitted to the shop for preparation.',
      [
        {
          text: isRTL ? 'عرض قائمة طلباتي' : 'View My Orders',
          onPress: () => navigation.navigate('Orders'),
        },
      ]
    );
  };

  if (cart.length === 0) {
    return (
      <ScreenContainer
        header={<ScreenHeader title={t('cart')} onBack={() => navigation.goBack()} />}
      >
        <EmptyState
          title={t('cartEmpty')}
          description={t('cartEmptySub')}
          actionLabel={t('browseCategories')}
          onAction={() => navigation.navigate('Categories')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      header={
        <ScreenHeader
          title={
            checkoutStep === 'CART'
              ? `${t('cart')} (${cart.length})`
              : checkoutStep === 'DELIVERY'
              ? (isRTL ? 'طريقة الاستلام والعنوان' : 'Delivery & Address')
              : (isRTL ? 'مراجعة وتأكيد الدفع' : 'Payment & Review')
          }
          onBack={() => {
            if (checkoutStep === 'PAYMENT') setCheckoutStep('DELIVERY');
            else if (checkoutStep === 'DELIVERY') setCheckoutStep('CART');
            else navigation.goBack();
          }}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      {/* Checkout Step Progress Bar (Section 18) */}
      <View style={[styles.stepBar, { flexDirection: rowDirection }]}>
        {[
          { key: 'CART', labelAr: '1. السلة', labelEn: '1. Cart' },
          { key: 'DELIVERY', labelAr: '2. الاستلام', labelEn: '2. Delivery' },
          { key: 'PAYMENT', labelAr: '3. التأكيد', labelEn: '3. Confirm' },
        ].map(step => {
          const isCurrent = checkoutStep === step.key;
          const isPassed =
            (step.key === 'CART' && (checkoutStep === 'DELIVERY' || checkoutStep === 'PAYMENT')) ||
            (step.key === 'DELIVERY' && checkoutStep === 'PAYMENT');

          return (
            <View
              key={step.key}
              style={[
                styles.stepChip,
                isCurrent && styles.activeStepChip,
                isPassed && styles.passedStepChip,
              ]}
            >
              <Text
                style={[
                  styles.stepChipText,
                  isCurrent && styles.activeStepChipText,
                  isPassed && styles.passedStepChipText,
                ]}
              >
                {isRTL ? step.labelAr : step.labelEn}
              </Text>
            </View>
          );
        })}
      </View>

      {/* STEP 1: Multi-Shop Cart Items */}
      {checkoutStep === 'CART' && (
        <View>
          {groupedByShop.map((group, gIdx) => {
            const shopSubtotal = group.items.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            );

            return (
              <View key={gIdx} style={styles.shopGroupCard}>
                {/* Shop Header */}
                <View style={[styles.shopHeader, { flexDirection: rowDirection }]}>
                  <MaterialCommunityIcons name="storefront-outline" size={18} color={COLORS.primary} />
                  <Text style={[styles.shopName, { textAlign }]}>{group.shopName}</Text>
                  <View style={styles.shopItemBadge}>
                    <Text style={styles.shopItemBadgeText}>
                      {group.items.length} {isRTL ? 'قطع' : 'items'}
                    </Text>
                  </View>
                </View>

                {/* Items in this shop */}
                {group.items.map(item => (
                  <View key={item.product.id} style={[styles.cartItemRow, { flexDirection: rowDirection }]}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { textAlign }]}>
                        {isRTL ? item.product.nameAr : item.product.nameEn}
                      </Text>
                      <Text style={[styles.itemPartNo, technicalText]}>
                        {t('partNo')}: {item.product.partNumber}
                      </Text>
                      <Text style={[styles.itemPrice, technicalText]}>
                        ${item.product.price}
                      </Text>
                    </View>

                    {/* Stepper + Delete Action */}
                    <View style={styles.actionCol}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeFromCart(item.product.id)}
                        accessibilityLabel="Delete item"
                      >
                        <Feather name="trash-2" size={16} color={COLORS.error} />
                      </TouchableOpacity>

                      <View style={[styles.stepper, { flexDirection: rowDirection }]}>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => updateCartQty(item.product.id, -1)}
                        >
                          <Feather name="minus" size={14} color={COLORS.navy} />
                        </TouchableOpacity>
                        <Text style={styles.stepQty}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => updateCartQty(item.product.id, 1)}
                        >
                          <Feather name="plus" size={14} color={COLORS.navy} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Shop Subtotal */}
                <View style={[styles.shopSubtotalRow, { flexDirection: rowDirection }]}>
                  <Text style={styles.shopSubtotalLabel}>
                    {isRTL ? 'إجمالي المحل:' : 'Shop subtotal:'}
                  </Text>
                  <Text style={[styles.shopSubtotalVal, technicalText]}>
                    ${shopSubtotal}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Pricing Summary Card */}
          <View style={styles.summaryCard}>
            <View style={[styles.summaryRow, { flexDirection: rowDirection }]}>
              <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
              <Text style={[styles.summaryVal, technicalText]}>${subtotal}</Text>
            </View>
            <View style={styles.divider} />
            <Button
              title={`${isRTL ? 'متابعة لاختيار الاستلام والتوصيل' : 'Proceed to Delivery'} (${subtotal} $)`}
              variant="orange"
              size="lg"
              onPress={() => setCheckoutStep('DELIVERY')}
            />
          </View>
        </View>
      )}

      {/* STEP 2: Delivery & Address */}
      {checkoutStep === 'DELIVERY' && (
        <View>
          {/* Address Box */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeaderRow, { flexDirection: rowDirection }]}>
              <Feather name="map-pin" size={18} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {t('deliveryAddress')}
              </Text>
            </View>
            <View style={styles.addressBox}>
              <Text style={[styles.addressTitle, { textAlign }]}>
                {isRTL ? 'صنعاء، شارع الستين الجنوبي' : 'Sana\'a, South 60th Street'}
              </Text>
              <Text style={[styles.addressSub, { textAlign }]}>
                {isRTL ? 'بجوار محطة النموذجية، ورشة العالمية' : 'Near Al-Namouthajiyah station, Al-Alame Workshop'}
              </Text>
            </View>
          </View>

          {/* Delivery Method Options */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('deliveryMethod')}</Text>
            <View style={styles.optionList}>
              {[
                { id: 'SHOP_DELIVERY', label: t('shopDelivery'), desc: isRTL ? 'توصيل مباشر من مندوب المحل' : 'Direct delivery from shop messenger', fee: '+$5' },
                { id: 'PICKUP', label: t('pickupFromShop'), desc: isRTL ? 'استلام يدوي فور جهوزية الطلب' : 'Self pickup when order is ready', fee: isRTL ? 'مجاني' : 'Free' },
                { id: 'EXPRESS', label: t('deliveryCompany'), desc: isRTL ? 'شحن سريع عبر شركات النقل المعتمدة' : 'Express courier across governorates', fee: '+$8' },
              ].map(method => {
                const isSelected = deliveryMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.optionItem, isSelected && styles.activeOptionItem, { flexDirection: rowDirection }]}
                    onPress={() => setDeliveryMethod(method.id as any)}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.activeRadioCircle]} />
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={[styles.optionLabel, { textAlign }]}>{method.label}</Text>
                      <Text style={[styles.optionDesc, { textAlign }]}>{method.desc}</Text>
                    </View>
                    <Text style={styles.optionFee}>{method.fee}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button
            title={isRTL ? 'متابعة إلى خيارات الدفع' : 'Proceed to Payment'}
            variant="orange"
            size="lg"
            onPress={() => setCheckoutStep('PAYMENT')}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      )}

      {/* STEP 3: Payment & Final Review */}
      {checkoutStep === 'PAYMENT' && (
        <View>
          {/* Payment Method Selector */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('paymentMethod')}</Text>
            <View style={styles.optionList}>
              {[
                { id: 'CASH', label: t('cashOnDelivery'), desc: isRTL ? 'الدفع نقداً عند استلام القطع وفحصها' : 'Pay in cash upon inspection' },
                { id: 'WALLET', label: t('walletPayment'), desc: isRTL ? 'محافظ إلكترونية (جوالي، كاش، ون كاش)' : 'Mobile e-wallets' },
                { id: 'TRANSFER', label: t('bankTransfer'), desc: isRTL ? 'تحويل حساب بنكي (الكريمي، بنك التضامن)' : 'Bank deposit transfer' },
              ].map(pay => {
                const isSelected = paymentMethod === pay.id;
                return (
                  <TouchableOpacity
                    key={pay.id}
                    style={[styles.optionItem, isSelected && styles.activeOptionItem, { flexDirection: rowDirection }]}
                    onPress={() => setPaymentMethod(pay.id as any)}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.activeRadioCircle]} />
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={[styles.optionLabel, { textAlign }]}>{pay.label}</Text>
                      <Text style={[styles.optionDesc, { textAlign }]}>{pay.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Final Order Review Summary */}
          <View style={styles.summaryCard}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {isRTL ? 'مراجعة الحساب النهائي' : 'Order Breakdown'}
            </Text>
            <View style={[styles.summaryRow, { flexDirection: rowDirection }]}>
              <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
              <Text style={[styles.summaryVal, technicalText]}>${subtotal}</Text>
            </View>
            <View style={[styles.summaryRow, { flexDirection: rowDirection }]}>
              <Text style={styles.summaryLabel}>{t('deliveryFee')}</Text>
              <Text style={[styles.summaryVal, technicalText]}>${deliveryFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, { flexDirection: rowDirection }]}>
              <Text style={styles.totalLabel}>{t('total')}</Text>
              <Text style={[styles.totalVal, technicalText]}>${grandTotal}</Text>
            </View>
          </View>

          <Button
            title={`${isRTL ? 'تأكيد وإرسال الطلب' : 'Confirm & Place Order'} • $${grandTotal}`}
            variant="orange"
            size="lg"
            onPress={handleConfirmOrder}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  stepBar: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  stepChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
  },
  activeStepChip: {
    backgroundColor: COLORS.primary,
  },
  passedStepChip: {
    backgroundColor: '#E8F5E9',
  },
  stepChipText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
  activeStepChipText: {
    color: COLORS.white,
  },
  passedStepChipText: {
    color: COLORS.success,
  },
  shopGroupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  shopHeader: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.xs,
  },
  shopName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    flex: 1,
  },
  shopItemBadge: {
    backgroundColor: '#F0F4FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  shopItemBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  cartItemRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F7F7F7',
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  itemName: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  itemPartNo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    marginTop: 4,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  stepper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepQty: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  shopSubtotalRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  shopSubtotalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  shopSubtotalVal: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  addressBox: {
    backgroundColor: '#F9FAFC',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressTitle: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  addressSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  optionList: {
    gap: 8,
    marginTop: 4,
  },
  optionItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeOptionItem: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8F9FD',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  activeRadioCircle: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionLabel: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  optionDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  optionFee: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.accentOrange,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  summaryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  totalVal: {
    ...TYPOGRAPHY.h2,
    color: COLORS.accentOrange,
  },
});
