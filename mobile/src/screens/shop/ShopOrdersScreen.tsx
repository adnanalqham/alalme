import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { useApp, OrderItemRecord } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';

export const ShopOrdersScreen: React.FC = () => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { canConfirmOrders, canUpdateOrders } = useAuth();
  const { orders, updateOrderStatus } = useApp();

  const [activeTab, setActiveTab] = useState<string>('ALL');

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const handleUpdateStatus = (orderId: string, nextStatus: OrderItemRecord['status']) => {
    if (nextStatus === 'CONFIRMED' || nextStatus === 'CANCELLED') {
      if (!canConfirmOrders) {
        Alert.alert(
          isRTL ? 'صلاحية غير متوفرة' : 'Permission Denied',
          isRTL
            ? 'ليس لديك صلاحية تأكيد أو رفض الطلبات (orders.confirm).'
            : 'You do not have permission to confirm or reject orders.'
        );
        return;
      }
    } else {
      if (!canUpdateOrders) {
        Alert.alert(
          isRTL ? 'صلاحية غير متوفرة' : 'Permission Denied',
          isRTL
            ? 'ليس لديك صلاحية تحديث حالة الطلبات (orders.update).'
            : 'You do not have permission to update order status.'
        );
        return;
      }
    }

    updateOrderStatus(orderId, nextStatus);
    Alert.alert(
      isRTL ? 'تم التحديث' : 'Order Updated',
      isRTL ? `تم تحديث حالة الطلب إلى: ${nextStatus}` : `Order status changed to: ${nextStatus}`
    );
  };

  const getStatusTone = (status: OrderItemRecord['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY':
        return 'navy';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={isRTL ? 'طلبات المتجر' : 'Shop Orders'}
          showBack={false}
        />
      }
      scrollable
    >
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabBar, { flexDirection: rowDirection }]}
      >
        {[
          { key: 'ALL', labelAr: 'الكل', labelEn: 'All' },
          { key: 'PENDING', labelAr: 'قيد المراجعة', labelEn: 'Pending' },
          { key: 'CONFIRMED', labelAr: 'مؤكد', labelEn: 'Confirmed' },
          { key: 'PREPARING', labelAr: 'قيد التجهيز', labelEn: 'Preparing' },
          { key: 'READY', labelAr: 'جاهز للتسليم', labelEn: 'Ready' },
          { key: 'DELIVERED', labelAr: 'مكتمل', labelEn: 'Delivered' },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {isRTL ? tab.labelAr : tab.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Orders List */}
      <View style={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={COLORS.textMuted} />
            <Text style={[styles.emptyTitle, { textAlign }]}>
              {isRTL ? 'لا توجد طلبات في هذه الحالة' : 'No orders in this status'}
            </Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={[styles.orderHeader, { flexDirection: rowDirection }]}>
                <View>
                  <Text style={[styles.orderIdText, { textAlign }]}>{order.id}</Text>
                  <Text style={[styles.orderDateText, { textAlign }]}>{order.date}</Text>
                </View>
                <Badge label={order.status} tone={getStatusTone(order.status) as any} />
              </View>

              {/* Order Items Summary */}
              <View style={styles.itemsSummary}>
                {order.items.map((it, idx) => (
                  <View key={idx} style={[styles.itemRow, { flexDirection: rowDirection }]}>
                    <Text style={[styles.itemSummaryText, { textAlign }]}>
                      {it.name} (x{it.qty})
                    </Text>
                    <Text style={styles.itemSummaryPrice}>${it.price * it.qty}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.totalRow, { flexDirection: rowDirection }]}>
                <Text style={[styles.totalLabel, { textAlign }]}>{isRTL ? 'الإجمالي:' : 'Total:'}</Text>
                <Text style={styles.totalValue}>${order.total}</Text>
              </View>

              {/* Action Buttons Based on Lifecycle */}
              <View style={[styles.actionRow, { flexDirection: rowDirection }]}>
                {order.status === 'PENDING' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnConfirm, !canConfirmOrders && styles.btnDisabled]}
                      onPress={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                    >
                      <Feather name="check" size={16} color={COLORS.white} />
                      <Text style={styles.actionBtnTextWhite}>{isRTL ? 'تأكيد الطلب' : 'Confirm'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnReject, !canConfirmOrders && styles.btnDisabled]}
                      onPress={() => handleUpdateStatus(order.id, 'CANCELLED')}
                    >
                      <Feather name="x" size={16} color={COLORS.danger} />
                      <Text style={styles.actionBtnTextDanger}>{isRTL ? 'رفض' : 'Reject'}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {order.status === 'CONFIRMED' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary, !canUpdateOrders && styles.btnDisabled]}
                    onPress={() => handleUpdateStatus(order.id, 'PREPARING')}
                  >
                    <MaterialCommunityIcons name="package-variant" size={16} color={COLORS.white} />
                    <Text style={styles.actionBtnTextWhite}>{isRTL ? 'بدء التجهيز' : 'Start Preparing'}</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'PREPARING' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary, !canUpdateOrders && styles.btnDisabled]}
                    onPress={() => handleUpdateStatus(order.id, 'READY')}
                  >
                    <Feather name="check-circle" size={16} color={COLORS.white} />
                    <Text style={styles.actionBtnTextWhite}>{isRTL ? 'جاهز للتسليم' : 'Mark as Ready'}</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'READY' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnSuccess, !canUpdateOrders && styles.btnDisabled]}
                    onPress={() => handleUpdateStatus(order.id, 'DELIVERED')}
                  >
                    <Feather name="truck" size={16} color={COLORS.white} />
                    <Text style={styles.actionBtnTextWhite}>{isRTL ? 'تم التسليم بنجاح' : 'Complete Delivery'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  ordersList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  orderHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  orderIdText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  orderDateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsSummary: {
    paddingVertical: SPACING.xs,
    gap: 4,
  },
  itemRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSummaryText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  itemSummaryPrice: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  totalRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  actionRow: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  actionBtnConfirm: {
    backgroundColor: COLORS.primary,
  },
  actionBtnReject: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.navy,
  },
  actionBtnSuccess: {
    backgroundColor: COLORS.success,
  },
  actionBtnTextWhite: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
  },
  actionBtnTextDanger: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.danger,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
