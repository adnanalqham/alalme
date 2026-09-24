import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, FlatList
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, ProductItem } from '../../context/AppContext';
import { ScreenHeader } from '../../components/ui/Header';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';

// Helper for Arabic normalization
function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Synonyms map to bridge common regional terms
const ALIASES_MAP: Record<string, string[]> = {
  'تيل': ['فحمات', 'فرامل', 'brake', 'pads'],
  'بريك': ['فرامل', 'فحمات', 'brake'],
  'هوب': ['اقراص', 'فرامل', 'disc', 'rotor'],
  'مساعد': ['مساعدات', 'صدمات', 'shock', 'strut'],
  'مساعدات': ['مساعد', 'صدمات', 'shock', 'strut'],
  'مقص': ['مقصات', 'تعليق', 'control arm'],
  'دودة': ['دركسون', 'توجيه', 'steering', 'rack'],
  'دركسون': ['دودة', 'توجيه', 'steering'],
  'دينمو': ['مولد', 'شحن', 'alternator'],
  'سلف': ['تشغيل', 'بادئ', 'starter'],
  'بوجي': ['بواجي', 'شمعات', 'spark', 'plug'],
  'بواجي': ['بوجي', 'شمعات', 'spark', 'plug'],
  'سيفون': ['فلتر زيت', 'صفاية', 'oil filter'],
  'رديتر': ['تبريد', 'مشعاع', 'radiator'],
  'كلتش': ['قابض', 'دبرياج', 'clutch'],
  'عكس': ['عكوس', 'دوران', 'axle', 'cv'],
};

interface SearchScreenProps {
  navigation: any;
  route?: {
    params?: {
      category?: string;
      vehicle?: string;
      query?: string;
    };
  };
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { products, activeVehicle, addToCart, isVehicleCompatible } = useApp();

  const [query, setQuery] = useState(route?.params?.query || '');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'MATCH' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('MATCH');
  const [filterCompatibleOnly, setFilterCompatibleOnly] = useState<boolean>(true);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Filter conditions
  const conditions = [
    { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
    { id: 'OEM', labelAr: 'أصلي OEM', labelEn: 'OEM' },
    { id: 'NEW', labelAr: 'جديد', labelEn: 'New' },
    { id: 'AFTERMARKET', labelAr: 'تجاري', labelEn: 'Aftermarket' },
    { id: 'USED', labelAr: 'مستعمل', labelEn: 'Used' },
  ];

  // Normalized Filter & Search Logic
  const filteredProducts = useMemo(() => {
    const rawQuery = query.trim();
    const normQ = normalizeSearchText(rawQuery);
    const queryTokens = normQ.split(' ').filter(Boolean);

    // Collect query expansion words (aliases)
    const expandedTokens = new Set<string>(queryTokens);
    for (const token of queryTokens) {
      if (ALIASES_MAP[token]) {
        ALIASES_MAP[token].forEach(syn => expandedTokens.add(normalizeSearchText(syn)));
      }
    }

    return products.filter(p => {
      // Vehicle compatibility filter
      if (filterCompatibleOnly && activeVehicle) {
        if (!isVehicleCompatible(p, activeVehicle)) return false;
      }

      // Condition filter
      if (selectedCondition !== 'ALL' && p.condition !== selectedCondition) {
        return false;
      }

      // In stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }

      // Query filter
      if (normQ.length > 0) {
        const pNameAr = normalizeSearchText(p.nameAr);
        const pNameEn = normalizeSearchText(p.nameEn);
        const pPartNo = p.partNumber ? p.partNumber.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const pOem = p.oemNumber ? p.oemNumber.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const pCleanQuery = rawQuery.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Direct SKU/OEM alphanumeric match
        if (pCleanQuery.length >= 3 && (pPartNo.includes(pCleanQuery) || pOem.includes(pCleanQuery))) {
          return true;
        }

        // Token and alias matching
        let matches = false;
        for (const token of expandedTokens) {
          if (pNameAr.includes(token) || pNameEn.includes(token)) {
            matches = true;
            break;
          }
        }
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'RATING') return b.rating - a.rating;
      return 0; // Default MATCH
    });
  }, [products, query, selectedCondition, sortBy, filterCompatibleOnly, inStockOnly, activeVehicle]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isRTL ? 'البحث عن قطع الغيار' : 'Search Auto Parts'}
        onBack={() => navigation.goBack()}
      />

      {/* Prominent Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={[styles.searchBox, { flexDirection: rowDirection }]}>
          <Feather name="search" size={18} color={COLORS.navy} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isRTL ? 'ابحث باسم القطعة، رقمها أو OEM...' : 'Search by part name, part no. or OEM...'}
            placeholderTextColor={COLORS.textMuted}
            style={[styles.searchInput, { textAlign }]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersContainer, { flexDirection: rowDirection }]}
        >
          {/* Active Vehicle Compatibility Pill */}
          {activeVehicle && (
            <TouchableOpacity
              style={[
                styles.filterPill,
                filterCompatibleOnly && styles.activePill,
                { flexDirection: rowDirection }
              ]}
              onPress={() => setFilterCompatibleOnly(c => !c)}
            >
              <MaterialCommunityIcons
                name={filterCompatibleOnly ? 'shield-check' : 'shield-outline'}
                size={14}
                color={filterCompatibleOnly ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.pillText, filterCompatibleOnly && styles.activePillText]}>
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </Text>
            </TouchableOpacity>
          )}

          {/* Condition Pills */}
          {conditions.map(c => {
            const isSelected = selectedCondition === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.filterPill, isSelected && styles.activePill]}
                onPress={() => setSelectedCondition(c.id)}
              >
                <Text style={[styles.pillText, isSelected && styles.activePillText]}>
                  {isRTL ? c.labelAr : c.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* In Stock Only */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              inStockOnly && styles.activePill,
              { flexDirection: rowDirection }
            ]}
            onPress={() => setInStockOnly(s => !s)}
          >
            <Feather
              name="check-circle"
              size={13}
              color={inStockOnly ? COLORS.white : COLORS.textMuted}
            />
            <Text style={[styles.pillText, inStockOnly && styles.activePillText]}>
              {isRTL ? 'متوفر بالمخزن' : 'In Stock'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Header Count & Sort */}
      <View style={[styles.resultsMetaBar, { flexDirection: rowDirection }]}>
        <Text style={[styles.resultsCountText, { textAlign }]}>
          {isRTL
            ? `النتائج (${filteredProducts.length} قطعة)`
            : `Results (${filteredProducts.length} parts)`}
        </Text>

        <View style={[styles.sortSelector, { flexDirection: rowDirection }]}>
          <TouchableOpacity
            onPress={() => setSortBy(s => s === 'PRICE_ASC' ? 'PRICE_DESC' : s === 'PRICE_DESC' ? 'MATCH' : 'PRICE_ASC')}
            style={[styles.sortBtn, { flexDirection: rowDirection }]}
          >
            <MaterialCommunityIcons name="swap-vertical" size={14} color={COLORS.primary} />
            <Text style={styles.sortBtnText}>
              {sortBy === 'PRICE_ASC' ? (isRTL ? 'الأقل سعراً' : 'Price: Low') :
               sortBy === 'PRICE_DESC' ? (isRTL ? 'الأعلى سعراً' : 'Price: High') :
               (isRTL ? 'المطابقة' : 'Relevance')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title={isRTL ? 'لا توجد نتائج مطابقة' : 'No matching parts found'}
          description={isRTL ? 'جرّب البحث باسم قطعة بديل (مثل فحمات، مساعدات، سلف) أو إلغاء تصفية السيارة' : 'Try searching by a common part name or clearing the vehicle filter.'}
          actionLabel={isRTL ? 'مسح الفلاتر والبحث' : 'Clear Filters'}
          onAction={() => {
            setQuery('');
            setSelectedCondition('ALL');
            setFilterCompatibleOnly(false);
            setInStockOnly(false);
          }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isCompatible={activeVehicle ? isVehicleCompatible(item, activeVehicle) : true}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              onAddToCart={() => addToCart(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarWrapper: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    height: 44,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  filterBarWrapper: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.screenPadding,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    gap: 4,
  },
  activePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    ...TYPOGRAPHY.captionRegular,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  activePillText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  resultsMetaBar: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCountText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  sortSelector: {
    alignItems: 'center',
  },
  sortBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sortBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
});
