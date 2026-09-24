import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Dimensions
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, ProductItem } from '../../context/AppContext';
import { ProductCard } from '../../components/product/ProductCard';

const { width } = Dimensions.get('window');

// 8 Standard automotive systems for quick access
const MAIN_SYSTEMS = [
  { id: 'cat-engine-parts', nameEn: 'Engine', nameAr: 'المحرك', icon: 'engine-outline' },
  { id: 'cat-brakes', nameEn: 'Brakes', nameAr: 'الفرامل', icon: 'car-brake-retarder' },
  { id: 'cat-suspension-system', nameEn: 'Suspension', nameAr: 'التعليق', icon: 'car-connected' },
  { id: 'cat-electrical-system', nameEn: 'Electrical', nameAr: 'الكهرباء', icon: 'lightning-bolt-outline' },
  { id: 'cat-filters', nameEn: 'Filters', nameAr: 'الفلاتر', icon: 'filter-variant' },
  { id: 'cat-heating-ventilation-ac', nameEn: 'A/C & HVAC', nameAr: 'التكييف', icon: 'snowflake' },
  { id: 'cat-gearbox-transmission', nameEn: 'Transmission', nameAr: 'ناقل الحركة', icon: 'car-clutch' },
  { id: 'cat-body-interior', nameEn: 'Body', nameAr: 'الهيكل', icon: 'car-door' },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { products, activeVehicle, garage, cart, addToCart, isVehicleCompatible } = useApp();

  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      navigation.navigate('Search', { query: searchText.trim() });
    } else {
      navigation.navigate('Search');
    }
  };

  const compatibleProducts = activeVehicle
    ? products.filter(p => isVehicleCompatible(p, activeVehicle))
    : products;

  return (
    <View style={styles.container}>
      {/* 1. Header: Location, Cart & Notifications */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10), flexDirection: rowDirection }]}>
        <TouchableOpacity
          style={[styles.locationBtn, { flexDirection: rowDirection }]}
          onPress={() => navigation.navigate('VehicleSelect')}
          activeOpacity={0.7}
        >
          <View style={styles.pinCircle}>
            <Feather name="map-pin" size={14} color={COLORS.accentOrange} />
          </View>
          <View style={{ marginHorizontal: 8 }}>
            <Text style={[styles.locationLabel, { textAlign }]}>{isRTL ? 'الموقع' : 'Location'}</Text>
            <View style={{ flexDirection: rowDirection, alignItems: 'center' }}>
              <Text style={styles.locationValue}>{isRTL ? 'صنعاء، اليمن' : "Sana'a, Yemen"}</Text>
              <Feather name="chevron-down" size={13} color={COLORS.textPrimary} style={{ marginHorizontal: 2 }} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.headerActions, { flexDirection: rowDirection }]}>
          {/* Cart Icon with badge */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.headerActionBtn}
            accessibilityLabel={isRTL ? 'سلة المشتريات' : 'Shopping Cart'}
          >
            <Feather name="shopping-bag" size={20} color={COLORS.primary} />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerActionBtn}
            accessibilityLabel={isRTL ? 'الإشعارات' : 'Notifications'}
          >
            <Feather name="bell" size={20} color={COLORS.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. Prominent Search Bar (Search-First Marketplace) */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Search')}
            style={[styles.searchBar, { flexDirection: rowDirection }]}
          >
            <Feather name="search" size={18} color={COLORS.navy} />
            <Text style={[styles.searchPlaceholder, { textAlign }]}>
              {isRTL ? 'ابحث باسم القطعة أو رقمها أو OEM...' : 'Search by part name, part no. or OEM...'}
            </Text>
            <View style={styles.searchFilterBtn}>
              <Feather name="sliders" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Active Vehicle / Vehicle Selector Bar */}
        <View style={styles.vehicleBarSection}>
          <TouchableOpacity
            style={[styles.vehicleBar, { flexDirection: rowDirection }]}
            onPress={() => navigation.navigate('VehicleSelect')}
            activeOpacity={0.8}
          >
            <View style={styles.vehicleIconCircle}>
              <MaterialCommunityIcons name="car-cog" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.vehicleBarLabel, { textAlign }]}>
                {activeVehicle
                  ? (isRTL ? 'السيارة النشطة (تصفية القطع)' : 'Active Vehicle (Filter)')
                  : (isRTL ? 'اختر سيارتك' : 'Select Your Vehicle')}
              </Text>
              <Text style={[styles.vehicleBarValue, { textAlign }]} numberOfLines={1}>
                {activeVehicle
                  ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.engine ? `(${activeVehicle.engine})` : ''}`
                  : (isRTL ? 'اضغط لاختيار السيارة وعرض القطع المتوافقة' : 'Tap to show compatible parts only')}
              </Text>
            </View>
            <View style={styles.changeVehicleBadge}>
              <Text style={styles.changeVehicleText}>
                {activeVehicle ? (isRTL ? 'تغيير' : 'Change') : (isRTL ? 'اختيار' : 'Select')}
              </Text>
              <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Main Automotive Categories Grid */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeaderRow, { flexDirection: rowDirection }]}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {isRTL ? 'تصنيفات قطع الغيار' : 'Parts Categories'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.viewAllLink}>{isRTL ? 'عرض الكل' : 'View All'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {MAIN_SYSTEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('Search', { category: item.id })}
                activeOpacity={0.7}
              >
                <View style={styles.catIconContainer}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {isRTL ? item.nameAr : item.nameEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. My Garage Quick Switch (If user has multiple vehicles) */}
        {garage.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeaderRow, { flexDirection: rowDirection }]}>
              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="garage-open-variant" size={18} color={COLORS.primary} />
                <Text style={[styles.sectionTitle, { textAlign }]}>
                  {isRTL ? 'سياراتي المحفوظة' : 'My Garage'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('VehicleSelect')}>
                <Text style={styles.viewAllLink}>{isRTL ? 'إدارة' : 'Manage'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.screenPadding, paddingHorizontal: SPACING.screenPadding }}>
              {garage.map(veh => {
                const isSelected = activeVehicle?.id === veh.id;
                return (
                  <TouchableOpacity
                    key={veh.id}
                    onPress={() => navigation.navigate('VehicleSelect')}
                    style={[
                      styles.garagePill,
                      isSelected && styles.activeGaragePill,
                      { flexDirection: rowDirection }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? 'check-circle' : 'car'}
                      size={16}
                      color={isSelected ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.garagePillText, isSelected && styles.activeGaragePillText]}>
                      {veh.year} {veh.make} {veh.model}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 6. Compatible & Popular Parts Section */}
        <View style={[styles.sectionContainer, { marginBottom: SPACING.xl }]}>
          <View style={[styles.sectionHeaderRow, { flexDirection: rowDirection }]}>
            <View>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {activeVehicle
                  ? (isRTL ? 'قطع متوافقة مع سيارتك' : 'Compatible with Your Car')
                  : (isRTL ? 'قطع غيار شائعة ومطلوبة' : 'Popular Auto Parts')}
              </Text>
              {activeVehicle && (
                <Text style={[styles.sectionSubtitle, { textAlign }]}>
                  {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.viewAllLink}>{isRTL ? 'المزيد' : 'See More'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {compatibleProducts.slice(0, 6).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isCompatible={activeVehicle ? isVehicleCompatible(p, activeVehicle) : true}
                onPress={() => navigation.navigate('ProductDetails', { product: p })}
                onAddToCart={() => addToCart(p)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationBtn: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  locationValue: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  headerActions: {
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accentOrange,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accentOrange,
  },
  searchSection: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    height: 48,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  searchPlaceholder: {
    flex: 1,
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  searchFilterBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBarSection: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
  },
  vehicleBar: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  vehicleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBarLabel: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  vehicleBarValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 13,
  },
  changeVehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 2,
  },
  changeVehicleText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    fontSize: 11,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginTop: SPACING.lg,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  viewAllLink: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    fontSize: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - SPACING.screenPadding * 2 - 24) / 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  catIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    fontSize: 11,
    textAlign: 'center',
  },
  garagePill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  activeGaragePill: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  garagePillText: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  activeGaragePillText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
