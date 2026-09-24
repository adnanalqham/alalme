import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { OrderItemRecord } from '../../context/AppContext';
import { Badge } from '../ui/Badge';

interface OrderCardProps {
  order: OrderItemRecord;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();

  const getStatusBadge = () => {
    switch (order.status) {
      case 'DELIVERED':
        return <Badge label={t('statusDelivered')} tone="success" />;
      case 'READY':
        return <Badge label={t('statusReady')} tone="info" />;
      case 'PREPARING':
        return <Badge label={t('statusPreparing')} tone="warning" />;
      case 'CONFIRMED':
        return <Badge label={t('statusConfirmed')} tone="info" />;
      case 'CANCELLED':
        return <Badge label={t('statusCancelled')} tone="error" />;
      case 'PENDING':
      default:
        return <Badge label={t('statusPending')} tone="cream" />;
    }
  };

  const getDeliveryTypeLabel = () => {
    switch (order.deliveryType) {
      case 'PICKUP':
        return t('pickupFromShop');
      case 'EXPRESS':
        return t('deliveryCompany');
      case 'SHOP_DELIVERY':
      default:
        return t('shopDelivery');
    }
  };

  const totalItemsCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header: Order ID + Date & Status Badge */}
      <View style={[styles.headerRow, { flexDirection: rowDirection }]}>
        <View style={[styles.orderMetaRow, { flexDirection: rowDirection }]}>
          <Text style={[styles.orderNumber, technicalText]}>{order.id}</Text>
          <Text style={[styles.orderDate, technicalText]}>• {order.date}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Shop Info with genuine icon, not emoji */}
      <View style={[styles.shopRow, { flexDirection: rowDirection }]}>
        <MaterialCommunityIcons name="storefront-outline" size={16} color={COLORS.navy} />
        <Text style={[styles.shopName, { textAlign }]}>{order.shopName}</Text>
      </View>

      {/* Item Summary Rows */}
      <View style={styles.itemsBlock}>
        {order.items.map((item, idx) => (
          <View key={idx} style={[styles.itemRow, { flexDirection: rowDirection }]}>
            <Text style={[styles.itemName, { textAlign }]} numberOfLines={1}>
              {item.name} × {item.qty}
            </Text>
            <Text style={[styles.itemPrice, technicalText]}>
              ${item.price * item.qty}
            </Text>
          </View>
        ))}
      </View>

      {/* Progress Timeline Indicator */}
      <View style={[styles.timelineTrack, { flexDirection: rowDirection }]}>
        {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'].map((st, i) => {
          const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
          const currentIdx = statusOrder.indexOf(order.status);
          const isPassed = currentIdx >= i;
          const isCurrent = currentIdx === i;

          return (
            <View key={st} style={styles.timelineStep}>
              <View
                style={[
                  styles.timelineDot,
                  isPassed ? styles.timelineDotPassed : styles.timelineDotPending,
                  isCurrent && styles.timelineDotCurrent,
                ]}
              />
              {i < 4 && (
                <View
                  style={[
                    styles.timelineLine,
                    isPassed && currentIdx > i
                      ? styles.timelineLinePassed
                      : styles.timelineLinePending,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Footer: Delivery Method & Total Amount */}
      <View style={[styles.footerRow, { flexDirection: rowDirection }]}>
        <View style={[styles.deliveryTypeTag, { flexDirection: rowDirection }]}>
          <Feather name="truck" size={12} color={COLORS.textMuted} />
          <Text style={styles.deliveryTypeText}>
            {getDeliveryTypeLabel()} ({totalItemsCount} {isRTL ? 'قطع' : 'items'})
          </Text>
        </View>

        <View style={[styles.totalWrapper, { flexDirection: rowDirection }]}>
          <Text style={styles.totalLabel}>{t('total')}:</Text>
          <Text style={[styles.totalAmount, technicalText]}>${order.total}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderMetaRow: {
    alignItems: 'center',
    gap: 6,
  },
  orderNumber: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  orderDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  shopRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  shopName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.navy,
  },
  itemsBlock: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  itemRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  itemName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  timelineTrack: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
    paddingHorizontal: 4,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineDotPassed: {
    backgroundColor: COLORS.primary,
  },
  timelineDotPending: {
    backgroundColor: COLORS.border,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.accentOrange,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    flex: 1,
    height: 2,
  },
  timelineLinePassed: {
    backgroundColor: COLORS.primary,
  },
  timelineLinePending: {
    backgroundColor: COLORS.borderLight,
  },
  footerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  deliveryTypeTag: {
    alignItems: 'center',
    gap: 4,
  },
  deliveryTypeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  totalWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
  totalAmount: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 15,
  },
});
