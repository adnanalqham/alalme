import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';

export const ShopInventoryScreen: React.FC = () => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { canAdjustInventory } = useAuth();
  const { products, updateProductStock } = useApp();

  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchSearch =
      !search.trim() ||
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchLow = !filterLowStockOnly || p.stockQty <= 5;
    return matchSearch && matchLow;
  });

  const lowStockCount = products.filter(p => p.stockQty <= 5).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQty, 0);

  const handleAdjust = (productId: string, currentStock: number, delta: number) => {
    if (!canAdjustInventory) {
      Alert.alert(
        isRTL ? 'صلاحية غير متوفرة' : 'Permission Denied',
        isRTL
          ? 'ليس لديك صلاحية تعديل المخزون (inventory.adjust). تواصل مع مدير المحل.'
          : 'You do not have permission to adjust inventory (inventory.adjust).'
      );
      return;
    }
    const nextStock = Math.max(0, currentStock + delta);
    updateProductStock(productId, nextStock);
  };

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={isRTL ? 'مخزون المحل' : 'Shop Inventory'}
          showBack={false}
        />
      }
      scrollable
    >
      {/* Overview Stat Cards */}
      <View style={[styles.statsRow, { flexDirection: rowDirection }]}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: COLORS.navyLight }]}>
            <MaterialCommunityIcons name="archive-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{totalStockUnits}</Text>
          <Text style={[styles.statLabel, { textAlign }]}>
            {isRTL ? 'إجمالي القطع' : 'Total Units'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.statCard, filterLowStockOnly && styles.statCardSelected]}
          onPress={() => setFilterLowStockOnly(v => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="alert-triangle" size={18} color="#D97706" />
          </View>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{lowStockCount}</Text>
          <Text style={[styles.statLabel, { textAlign }]}>
            {isRTL ? 'مخزون منخفض' : 'Low Stock Alert'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={[styles.searchBox, { flexDirection: rowDirection }]}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={[styles.searchInput, { textAlign }]}
          placeholder={isRTL ? 'بحث بالاسم أو رقم القطعة...' : 'Search by name or part #...'}
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Inventory Items List */}
      <View style={styles.listContainer}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={44} color={COLORS.textMuted} />
            <Text style={[styles.emptyTitle, { textAlign }]}>
              {isRTL ? 'لا توجد قطع مطابقة' : 'No matching items'}
            </Text>
          </View>
        ) : (
          filtered.map(item => {
            const isLow = item.stockQty <= 5;
            const isOut = item.stockQty === 0;

            return (
              <View key={item.id} style={styles.inventoryCard}>
                <View style={[styles.cardTop, { flexDirection: rowDirection }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { textAlign }]}>
                      {isRTL ? item.nameAr : item.nameEn}
                    </Text>
                    <Text style={[styles.itemPartNumber, { textAlign }]}>
                      {item.partNumber} · {item.manufacturer}
                    </Text>
                  </View>
                  <Badge
                    label={
                      isOut
                        ? (isRTL ? 'نفذ المخزون' : 'Out of Stock')
                        : isLow
                        ? (isRTL ? 'منخفض' : 'Low Stock')
                        : (isRTL ? 'متوفر' : 'In Stock')
                    }
                    tone={isOut ? 'danger' : isLow ? 'warning' : 'success'}
                  />
                </View>

                {/* Stock Control Bar */}
                <View style={[styles.controlRow, { flexDirection: rowDirection }]}>
                  <View>
                    <Text style={[styles.unitPriceText, { textAlign }]}>
                      {isRTL ? 'سعر البيع:' : 'Price:'} ${item.price}
                    </Text>
                  </View>

                  <View style={[styles.qtyAdjuster, { flexDirection: rowDirection }]}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, (!canAdjustInventory || item.stockQty === 0) && styles.qtyBtnDisabled]}
                      onPress={() => handleAdjust(item.id, item.stockQty, -1)}
                      disabled={!canAdjustInventory || item.stockQty === 0}
                    >
                      <Feather name="minus" size={16} color={canAdjustInventory && item.stockQty > 0 ? COLORS.primary : COLORS.textMuted} />
                    </TouchableOpacity>

                    <Text style={[styles.qtyValue, isLow && styles.qtyValueWarning]}>
                      {item.stockQty}
                    </Text>

                    <TouchableOpacity
                      style={[styles.qtyBtn, !canAdjustInventory && styles.qtyBtnDisabled]}
                      onPress={() => handleAdjust(item.id, item.stockQty, 1)}
                      disabled={!canAdjustInventory}
                    >
                      <Feather name="plus" size={16} color={canAdjustInventory ? COLORS.primary : COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  statCardSelected: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    height: 44,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  inventoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  cardTop: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  itemName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  itemPartNumber: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  controlRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPriceText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  qtyAdjuster: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  qtyValueWarning: {
    color: COLORS.warning,
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
