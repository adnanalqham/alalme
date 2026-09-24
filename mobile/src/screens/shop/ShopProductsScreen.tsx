import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { useApp, ProductItem } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';

export const ShopProductsScreen: React.FC = () => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { canCreateProducts } = useAuth();
  const { products, addProduct } = useApp();

  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // New Product Form state
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [oemNumber, setOemNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [condition, setCondition] = useState<'OEM' | 'NEW' | 'AFTERMARKET' | 'USED'>('OEM');

  const filtered = products.filter(p => {
    const matchCondition = filterCondition === 'ALL' || p.condition === filterCondition;
    const matchSearch =
      !searchQuery.trim() ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.oemNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCondition && matchSearch;
  });

  const handleSaveProduct = () => {
    if (!nameAr.trim() && !nameEn.trim()) {
      Alert.alert(isRTL ? 'تنبيه' : 'Alert', isRTL ? 'يرجى إدخال اسم القطعة' : 'Please enter part name');
      return;
    }
    if (!partNumber.trim()) {
      Alert.alert(isRTL ? 'تنبيه' : 'Alert', isRTL ? 'يرجى إدخال رقم القطعة' : 'Please enter part number');
      return;
    }

    const priceNum = Number(price) || 0;
    const stockNum = Number(stockQty) || 1;

    addProduct({
      nameAr: nameAr.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      partNumber: partNumber.trim(),
      oemNumber: oemNumber.trim() || partNumber.trim(),
      manufacturer: manufacturer.trim() || 'OEM Genuine',
      category: 'general',
      price: priceNum,
      priceVisibility: 'SHOW_PRICE',
      inStock: stockNum > 0,
      stockQty: stockNum,
      condition,
      shopId: 's1',
      shopName: 'Al-Barakah Auto Parts',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
      compatibleVehicles: [{ make: 'Toyota', model: 'Camry', yearStart: 2018, yearEnd: 2024 }],
      descriptionAr: 'قطعة غيار معتمدة ذات جودة عالية.',
      descriptionEn: 'Certified high quality automotive spare part.',
    });

    setModalVisible(false);
    setNameAr('');
    setNameEn('');
    setPartNumber('');
    setOemNumber('');
    setManufacturer('');
    setPrice('');
    setStockQty('');
    Alert.alert(isRTL ? 'نجاح' : 'Success', isRTL ? 'تمت إضافة القطعة إلى المتجر' : 'Part added to shop catalog');
  };

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={isRTL ? 'منتجات المتجر' : 'Shop Products'}
          showBack={false}
          rightAction={
            canCreateProducts ? (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={[styles.addHeaderBtn, { flexDirection: rowDirection }]}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={16} color={COLORS.primary} />
                <Text style={styles.addHeaderBtnText}>{isRTL ? 'إضافة قطعة' : 'Add Part'}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      }
      scrollable
    >
      {/* Search Input */}
      <View style={[styles.searchBox, { flexDirection: rowDirection }]}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={[styles.searchInput, { textAlign }]}
          placeholder={isRTL ? 'بحث بالاسم أو رقم القطعة أو OEM...' : 'Search by name, part #, or OEM...'}
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Condition Filter Badges */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, { flexDirection: rowDirection }]}
      >
        {['ALL', 'OEM', 'NEW', 'AFTERMARKET', 'USED'].map(cond => {
          const active = filterCondition === cond;
          return (
            <TouchableOpacity
              key={cond}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilterCondition(cond)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {cond === 'ALL'
                  ? (isRTL ? 'الكل' : 'All')
                  : cond === 'OEM'
                  ? (isRTL ? 'أصلي OEM' : 'OEM')
                  : cond === 'NEW'
                  ? (isRTL ? 'جديد' : 'New')
                  : cond === 'AFTERMARKET'
                  ? (isRTL ? 'تجاري' : 'Aftermarket')
                  : (isRTL ? 'مستعمل' : 'Used')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product List */}
      <View style={styles.listContainer}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="package-variant" size={48} color={COLORS.textMuted} />
            <Text style={[styles.emptyTitle, { textAlign }]}>
              {isRTL ? 'لا توجد منتجات مطابقة' : 'No matching products found'}
            </Text>
            <Text style={[styles.emptySubtitle, { textAlign }]}>
              {isRTL ? 'حاول تغيير معايير البحث أو إضافة منتج جديد' : 'Try adjusting filters or add a new part'}
            </Text>
          </View>
        ) : (
          filtered.map(p => (
            <View key={p.id} style={styles.productCard}>
              <View style={[styles.productHeader, { flexDirection: rowDirection }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productTitle, { textAlign }]}>
                    {isRTL ? p.nameAr : p.nameEn}
                  </Text>
                  <Text style={[styles.partNumberText, { textAlign }]}>
                    {isRTL ? 'رقم القطعة:' : 'Part #:'} {p.partNumber}
                  </Text>
                  {p.oemNumber ? (
                    <Text style={[styles.oemText, { textAlign }]}>
                      OEM: {p.oemNumber}
                    </Text>
                  ) : null}
                </View>
                <Badge label={p.condition} tone="navy" />
              </View>

              <View style={[styles.productFooter, { flexDirection: rowDirection }]}>
                <View>
                  <Text style={[styles.priceLabel, { textAlign }]}>
                    {isRTL ? 'السعر:' : 'Price:'}
                  </Text>
                  <Text style={styles.priceValue}>
                    ${p.price}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.stockLabel, { textAlign }]}>
                    {isRTL ? 'الكمية بالمخزن:' : 'Stock:'}
                  </Text>
                  <Text style={[styles.stockValue, p.stockQty <= 5 && styles.stockWarning]}>
                    {p.stockQty} {isRTL ? 'قطعة' : 'units'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={[styles.modalHeader, { flexDirection: rowDirection }]}>
              <Text style={styles.modalTitle}>
                {isRTL ? 'إضافة قطعة غيار جديدة' : 'Add New Spare Part'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'اسم القطعة بالعربية' : 'Part Name (Arabic)'}</Text>
              <TextInput
                style={[styles.modalInput, { textAlign }]}
                placeholder={isRTL ? 'مثال: فحمات فرامل أمامية سيراميك' : 'e.g. Front Ceramic Brake Pads'}
                value={nameAr}
                onChangeText={setNameAr}
              />

              <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'اسم القطعة بالإنجليزية' : 'Part Name (English)'}</Text>
              <TextInput
                style={[styles.modalInput, { textAlign }]}
                placeholder="Front Brake Pads"
                value={nameEn}
                onChangeText={setNameEn}
              />

              <View style={[styles.inputRow, { flexDirection: rowDirection }]}>
                <View style={{ flex: 1, marginEnd: 8 }}>
                  <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'رقم القطعة' : 'Part Number'}</Text>
                  <TextInput
                    style={[styles.modalInput, { textAlign }]}
                    placeholder="04465-33471"
                    value={partNumber}
                    onChangeText={setPartNumber}
                  />
                </View>
                <View style={{ flex: 1, marginStart: 8 }}>
                  <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'رقم OEM الأصلي' : 'OEM Number'}</Text>
                  <TextInput
                    style={[styles.modalInput, { textAlign }]}
                    placeholder="04465-33470"
                    value={oemNumber}
                    onChangeText={setOemNumber}
                  />
                </View>
              </View>

              <View style={[styles.inputRow, { flexDirection: rowDirection }]}>
                <View style={{ flex: 1, marginEnd: 8 }}>
                  <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'السعر ($)' : 'Price ($)'}</Text>
                  <TextInput
                    style={[styles.modalInput, { textAlign }]}
                    placeholder="45"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1, marginStart: 8 }}>
                  <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'الكمية المتوفرة' : 'Stock Quantity'}</Text>
                  <TextInput
                    style={[styles.modalInput, { textAlign }]}
                    placeholder="10"
                    keyboardType="numeric"
                    value={stockQty}
                    onChangeText={setStockQty}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { textAlign }]}>{isRTL ? 'حالة القطعة' : 'Condition'}</Text>
              <View style={[styles.conditionSelector, { flexDirection: rowDirection }]}>
                {(['OEM', 'NEW', 'AFTERMARKET', 'USED'] as const).map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.conditionOption, condition === c && styles.conditionOptionSelected]}
                    onPress={() => setCondition(c)}
                  >
                    <Text style={[styles.conditionOptionText, condition === c && styles.conditionOptionTextSelected]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProduct} activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>{isRTL ? 'حفظ وإضافة للمتجر' : 'Save & Publish to Shop'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  addHeaderBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  addHeaderBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  searchBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    height: 46,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  filterRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  productHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  productTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  partNumberText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  oemText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.navy,
    marginTop: 1,
  },
  productFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  priceValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 16,
  },
  stockLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  stockValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.success,
  },
  stockWarning: {
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
  emptySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  modalScroll: {
    paddingVertical: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  inputRow: {
    justifyContent: 'space-between',
  },
  conditionSelector: {
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  conditionOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  conditionOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  conditionOptionText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
  },
  conditionOptionTextSelected: {
    color: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },
});
