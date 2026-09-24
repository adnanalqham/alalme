import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, OrderItemRecord } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { OrderCard } from '../../components/order/OrderCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface OrdersScreenProps {
  navigation: any;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { orders } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderItemRecord | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      if (activeTab === 'ACTIVE') {
        return ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED';
      }
      if (activeTab === 'COMPLETED') {
        return ord.status === 'DELIVERED';
      }
      return true;
    });
  }, [orders, activeTab]);

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={t('myOrders')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <View style={[styles.tabWrapper, { flexDirection: rowDirection }]}>
          {[
            { id: 'ALL', labelAr: 'جميع الطلبات', labelEn: 'All Orders' },
            { id: 'ACTIVE', labelAr: 'الطلبات النشطة', labelEn: 'Active' },
            { id: 'COMPLETED', labelAr: 'المكتملة', labelEn: 'Completed' },
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, isSelected && styles.activeTabItem]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                  {isRTL ? tab.labelAr : tab.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Orders List or Empty State */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title={isRTL ? 'لا توجد طلبات في هذا القسم' : 'No orders found'}
          description={
            isRTL
              ? 'يمكنك تصفح القطع المتوافقة والطلب مباشرة من أفضل محلات قطع الغيار'
              : 'Browse compatible auto parts and place your first order'
          }
          actionLabel={t('browseCategories')}
          onAction={() => navigation.navigate('Categories')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => setSelectedOrder(order)}
            />
          ))}
        </ScrollView>
      )}

      {/* Order Details Modal (Section 20 Implementation) */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedOrder && (
              <>
                <View style={[styles.sheetHeader, { flexDirection: rowDirection }]}>
                  <View>
                    <Text style={[styles.sheetOrderNumber, technicalText]}>
                      {selectedOrder.id}
                    </Text>
                    <Text style={[styles.sheetShopName, { textAlign }]}>
                      {selectedOrder.shopName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                    style={styles.sheetCloseBtn}
                  >
                    <Feather name="x" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
                  {/* Timeline Tracker */}
                  <View style={styles.sheetTimelineBlock}>
                    <Text style={[styles.sheetSectionTitle, { textAlign }]}>
                      {isRTL ? 'مراحل الطلب' : 'Order Timeline'}
                    </Text>
                    {[
                      { key: 'PENDING', labelAr: 'تم إنشاء الطلب', labelEn: 'Order Placed' },
                      { key: 'CONFIRMED', labelAr: 'تم التأكيد من المحل', labelEn: 'Confirmed by Shop' },
                      { key: 'PREPARING', labelAr: 'جاري التجهيز والتغليف', labelEn: 'Preparing & Packing' },
                      { key: 'READY', labelAr: 'جاهز للشحن / الاستلام', labelEn: 'Ready for Pickup / Dispatch' },
                      { key: 'DELIVERED', labelAr: 'تم التسليم بنجاح', labelEn: 'Delivered' },
                    ].map((step, idx, arr) => {
                      const statusList = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
                      const currentIdx = statusList.indexOf(selectedOrder.status);
                      const isDone = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <View key={step.key} style={[styles.timelineRow, { flexDirection: rowDirection }]}>
                          <View style={styles.timelineIconCol}>
                            <View
                              style={[
                                styles.stepDot,
                                isDone ? styles.stepDotDone : styles.stepDotPending,
                                isCurrent && styles.stepDotCurrent,
                              ]}
                            >
                              {isDone && <Feather name="check" size={10} color={COLORS.white} />}
                            </View>
                            {idx < arr.length - 1 && (
                              <View
                                style={[
                                  styles.stepLine,
                                  isDone && currentIdx > idx
                                    ? styles.stepLineDone
                                    : styles.stepLinePending,
                                ]}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepLabel,
                              isDone && styles.stepLabelDone,
                              isCurrent && styles.stepLabelCurrent,
                              { textAlign },
                            ]}
                          >
                            {isRTL ? step.labelAr : step.labelEn}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Items List */}
                  <View style={styles.sheetItemsBlock}>
                    <Text style={[styles.sheetSectionTitle, { textAlign }]}>
                      {isRTL ? 'المنتجات المطلوبة' : 'Items'}
                    </Text>
                    {selectedOrder.items.map((item, idx) => (
                      <View key={idx} style={[styles.sheetItemRow, { flexDirection: rowDirection }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.sheetItemName, { textAlign }]}>{item.name}</Text>
                          <Text style={[styles.sheetItemQty, { textAlign }]}>
                            {isRTL ? 'الكمية' : 'Qty'}: {item.qty}
                          </Text>
                        </View>
                        <Text style={[styles.sheetItemPrice, technicalText]}>
                          ${item.price * item.qty}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Summary & Details */}
                  <View style={styles.sheetDetailsBlock}>
                    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                      <Text style={styles.detailLabel}>{t('deliveryMethod')}</Text>
                      <Text style={styles.detailVal}>
                        {selectedOrder.deliveryType === 'PICKUP'
                          ? t('pickupFromShop')
                          : selectedOrder.deliveryType === 'EXPRESS'
                          ? t('deliveryCompany')
                          : t('shopDelivery')}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                      <Text style={styles.detailLabel}>{t('paymentMethod')}</Text>
                      <Text style={styles.detailVal}>
                        {selectedOrder.paymentMethod === 'CASH'
                          ? t('cashOnDelivery')
                          : selectedOrder.paymentMethod === 'WALLET'
                          ? t('walletPayment')
                          : t('bankTransfer')}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                      <Text style={styles.detailLabel}>{t('subtotal')}</Text>
                      <Text style={[styles.detailVal, technicalText]}>${selectedOrder.subtotal}</Text>
                    </View>

                    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                      <Text style={styles.detailLabel}>{t('deliveryFee')}</Text>
                      <Text style={[styles.detailVal, technicalText]}>${selectedOrder.deliveryFee}</Text>
                    </View>

                    <View style={styles.sheetDivider} />

                    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                      <Text style={styles.totalTitle}>{t('total')}</Text>
                      <Text style={[styles.totalAmount, technicalText]}>${selectedOrder.total}</Text>
                    </View>
                  </View>
                </ScrollView>

                <Button
                  title={isRTL ? 'إغلاق' : 'Close'}
                  variant="secondary"
                  size="md"
                  onPress={() => setSelectedOrder(null)}
                  style={styles.sheetCloseBtnBottom}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabWrapper: {
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },
  activeTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 54, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.base,
    maxHeight: '85%',
    ...SHADOWS.modal,
  },
  sheetHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sheetOrderNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  sheetShopName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.navy,
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetScroll: {
    marginVertical: SPACING.sm,
  },
  sheetTimelineBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sheetSectionTitle: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  timelineRow: {
    alignItems: 'flex-start',
    minHeight: 28,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 8,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: COLORS.primary,
  },
  stepDotPending: {
    backgroundColor: COLORS.border,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.accentOrange,
  },
  stepLine: {
    width: 2,
    height: 16,
  },
  stepLineDone: {
    backgroundColor: COLORS.primary,
  },
  stepLinePending: {
    backgroundColor: COLORS.borderLight,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    flex: 1,
  },
  stepLabelDone: {
    color: COLORS.textPrimary,
  },
  stepLabelCurrent: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.accentOrange,
  },
  sheetItemsBlock: {
    marginBottom: SPACING.md,
  },
  sheetItemRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sheetItemName: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  sheetItemQty: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sheetItemPrice: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.primary,
  },
  sheetDetailsBlock: {
    backgroundColor: '#FAFBFD',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  detailVal: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 6,
  },
  totalTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  totalAmount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.accentOrange,
  },
  sheetCloseBtnBottom: {
    marginTop: SPACING.xs,
  },
});
