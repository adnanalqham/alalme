import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import {
  MASTER_CATEGORIES,
  MainCategoryItem,
  SubcategoryItem,
  PartTypeItem,
} from '../../data/taxonomyCategories';

interface CategoriesScreenProps {
  navigation: any;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { activeVehicle } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<MainCategoryItem | null>(null);
  const [filterText, setFilterText] = useState<string>('');

  // Filter categories by query
  const filteredCategories = useMemo(() => {
    if (!filterText.trim()) return MASTER_CATEGORIES;
    const q = filterText.trim().toLowerCase();
    return MASTER_CATEGORIES.filter(
      c =>
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.subcategories.some(
          sub =>
            sub.nameAr.toLowerCase().includes(q) ||
            sub.nameEn.toLowerCase().includes(q) ||
            sub.partTypes.some(
              pt => pt.nameAr.toLowerCase().includes(q) || pt.nameEn.toLowerCase().includes(q)
            )
        )
    );
  }, [filterText]);

  const handleSelectPartType = (part: PartTypeItem) => {
    navigation.navigate('Search', { query: part.nameAr });
  };

  const handleSelectCategory = (cat: MainCategoryItem) => {
    setSelectedCategory(cat);
  };

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={selectedCategory ? (isRTL ? selectedCategory.nameAr : selectedCategory.nameEn) : t('browseCategories')}
          onBack={selectedCategory ? () => setSelectedCategory(null) : () => navigation.goBack()}
        />
      }
    >
      {/* Category Search Filter Bar */}
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBox, { flexDirection: rowDirection }]}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={filterText}
            onChangeText={setFilterText}
            placeholder={isRTL ? 'ابحث في التصنيفات وأنواع القطع...' : 'Filter categories & parts...'}
            placeholderTextColor={COLORS.textMuted}
            style={[styles.searchInput, { textAlign }]}
          />
          {filterText.length > 0 && (
            <TouchableOpacity onPress={() => setFilterText('')} style={styles.clearBtn}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      {selectedCategory ? (
        /* Drill-Down View: Category -> Subcategory -> Part Type (Section 16 Specification) */
        <ScrollView
          contentContainerStyle={styles.drilldownContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Breadcrumb / Return Pill */}
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[styles.breadcrumbRow, { flexDirection: rowDirection }]}
          >
            <Feather name={isRTL ? 'chevron-right' : 'chevron-left'} size={16} color={COLORS.primary} />
            <Text style={styles.breadcrumbText}>
              {isRTL ? 'جميع التصنيفات' : 'All Categories'} / {isRTL ? selectedCategory.nameAr : selectedCategory.nameEn}
            </Text>
          </TouchableOpacity>

          {/* Subcategories & Part Types */}
          {selectedCategory.subcategories.map(sub => (
            <View key={sub.id} style={styles.subcategorySection}>
              <View style={[styles.subcategoryHeader, { flexDirection: rowDirection }]}>
                <View style={styles.subAccentBar} />
                <Text style={styles.subcategoryTitle}>
                  {isRTL ? sub.nameAr : sub.nameEn}
                </Text>
              </View>

              <View style={styles.partTypesContainer}>
                {sub.partTypes.map(pt => (
                  <TouchableOpacity
                    key={pt.id}
                    onPress={() => handleSelectPartType(pt)}
                    activeOpacity={0.7}
                    style={[styles.partTypeRow, { flexDirection: rowDirection }]}
                  >
                    <View style={styles.partTypeDot} />
                    <View style={styles.partTypeInfo}>
                      <Text style={[styles.partTypeName, { textAlign }]}>
                        {isRTL ? pt.nameAr : pt.nameEn}
                      </Text>
                      <Text style={[styles.partTypeSub, { textAlign }]}>
                        {isRTL ? pt.nameEn : pt.nameAr}
                      </Text>
                    </View>
                    <Feather
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Simple, Practical 2-Column Grid (No heavy gradient cards, small icons, clear labels) */
        <ScrollView
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {filteredCategories.map(cat => {
              const totalParts = cat.subcategories.reduce(
                (sum, sub) => sum + sub.partTypes.length,
                0
              );

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                  style={styles.categoryCard}
                >
                  <View style={[styles.iconWrapper, { flexDirection: rowDirection }]}>
                    <MaterialCommunityIcons
                      name={cat.iconName as any}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {isRTL ? cat.nameAr : cat.nameEn}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {cat.subcategories.length} {isRTL ? 'أقسام فرعية' : 'subcategories'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 42,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.xs,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  gridContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.card,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    minHeight: 36,
  },
  categoryCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  drilldownContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  breadcrumbRow: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: 4,
  },
  breadcrumbText: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.primary,
    marginHorizontal: 4,
  },
  subcategorySection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  subcategoryHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  subAccentBar: {
    width: 3,
    height: 16,
    backgroundColor: COLORS.accentOrange,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  subcategoryTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  partTypesContainer: {
    gap: 2,
  },
  partTypeRow: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    justifyContent: 'space-between',
  },
  partTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.navy,
    marginHorizontal: 6,
  },
  partTypeInfo: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  partTypeName: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  partTypeSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
