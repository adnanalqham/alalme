import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useApp, SavedVehicle } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import {
  mobileVehicleService,
  VehicleMakeItem,
  VehicleModelItem,
  VehicleSpecItem,
} from '../../services/vehicleService';
import { BrandLogo } from '../../components/vehicle/BrandLogo';

interface VehicleSelectScreenProps {
  navigation: any;
}

export const VehicleSelectScreen: React.FC<VehicleSelectScreenProps> = ({ navigation }) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { garage, activeVehicle, setActiveVehicle, addVehicleToGarage, removeVehicleFromGarage } = useApp();

  // Async data states
  const [makes, setMakes] = useState<VehicleMakeItem[]>([]);
  const [models, setModels] = useState<VehicleModelItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [specs, setSpecs] = useState<VehicleSpecItem[]>([]);

  // Selection form state
  const [selectedMake, setSelectedMake] = useState<VehicleMakeItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModelItem | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [selectedSpec, setSelectedSpec] = useState<VehicleSpecItem | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(garage.length === 0);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dropdown Picker Modal
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    type: 'make' | 'model' | 'year' | 'spec';
    items: any[];
  }>({
    visible: false,
    title: '',
    type: 'make',
    items: [],
  });

  // Modal search input with debounce
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filterQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [filterQuery]);

  // Initial Load of Makes
  useEffect(() => {
    let isMounted = true;
    const loadInitialMakes = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await mobileVehicleService.getMakes();
        if (isMounted) {
          setMakes(data);
          if (data.length > 0) {
            const defaultMake = data[0];
            setSelectedMake(defaultMake);
            // Pre-load models for default make
            const initialModels = await mobileVehicleService.getModels(defaultMake.id);
            if (isMounted) {
              setModels(initialModels);
              if (initialModels.length > 0) {
                setSelectedModel(initialModels[0]);
                const initialYears = await mobileVehicleService.getYears(initialModels[0].id);
                setYears(initialYears);
                if (initialYears.length > 0) {
                  setSelectedYear(initialYears[0]);
                  const initialSpecs = await mobileVehicleService.getSpecifications(initialModels[0].id, initialYears[0]);
                  setSpecs(initialSpecs);
                }
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(isRTL ? 'تعذر تحميل بيانات السيارات حالياً' : 'Unable to load vehicle data at this time');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialMakes();
    return () => {
      isMounted = false;
    };
  }, [isRTL]);

  // Handle Make Change
  const handleMakeChange = async (make: VehicleMakeItem) => {
    setSelectedMake(make);
    setLoading(true);
    try {
      const fetchedModels = await mobileVehicleService.getModels(make.id);
      setModels(fetchedModels);
      if (fetchedModels.length > 0) {
        const firstModel = fetchedModels[0];
        setSelectedModel(firstModel);
        const fetchedYears = await mobileVehicleService.getYears(firstModel.id);
        setYears(fetchedYears);
        if (fetchedYears.length > 0) {
          setSelectedYear(fetchedYears[0]);
          const fetchedSpecs = await mobileVehicleService.getSpecifications(firstModel.id, fetchedYears[0]);
          setSpecs(fetchedSpecs);
          setSelectedSpec(null); // Spec is optional
        }
      } else {
        setSelectedModel(null);
        setSpecs([]);
        setSelectedSpec(null);
      }
    } catch (e) {
      console.warn('Error fetching models:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Model Change
  const handleModelChange = async (model: VehicleModelItem) => {
    setSelectedModel(model);
    setLoading(true);
    try {
      const fetchedYears = await mobileVehicleService.getYears(model.id);
      setYears(fetchedYears);
      if (fetchedYears.length > 0) {
        const defaultYr = fetchedYears.includes(selectedYear) ? selectedYear : fetchedYears[0];
        setSelectedYear(defaultYr);
        const fetchedSpecs = await mobileVehicleService.getSpecifications(model.id, defaultYr);
        setSpecs(fetchedSpecs);
        setSelectedSpec(null);
      }
    } catch (e) {
      console.warn('Error fetching years:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Year Change
  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    if (selectedModel) {
      try {
        const fetchedSpecs = await mobileVehicleService.getSpecifications(selectedModel.id, year);
        setSpecs(fetchedSpecs);
        setSelectedSpec(null);
      } catch (e) {
        setSpecs([]);
      }
    }
  };

  const openPicker = (
    title: string,
    type: 'make' | 'model' | 'year' | 'spec',
    items: any[]
  ) => {
    setFilterQuery('');
    setDebouncedQuery('');
    setPickerModal({ visible: true, title, type, items });
  };

  // Filtered Items inside picker modal
  const filteredModalItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return pickerModal.items;

    if (pickerModal.type === 'make') {
      return (pickerModal.items as VehicleMakeItem[]).filter(
        m => m.name.en.toLowerCase().includes(q) || m.name.ar.includes(q)
      );
    }
    if (pickerModal.type === 'model') {
      return (pickerModal.items as VehicleModelItem[]).filter(
        m => m.name.en.toLowerCase().includes(q) || m.name.ar.includes(q)
      );
    }
    if (pickerModal.type === 'year') {
      return (pickerModal.items as number[]).filter(yr => String(yr).includes(q));
    }
    if (pickerModal.type === 'spec') {
      return (pickerModal.items as (VehicleSpecItem | null)[]).filter(s => {
        if (!s) return true;
        const text = `${s.trim || ''} ${s.engine_cylinders ? s.engine_cylinders + ' Cyl' : ''} ${s.fuel_type || ''}`.toLowerCase();
        return text.includes(q);
      });
    }
    return pickerModal.items;
  }, [pickerModal, debouncedQuery]);

  const handleConfirmAndSave = (searchDirectly: boolean = true) => {
    if (!selectedMake || !selectedModel) {
      Alert.alert(isRTL ? 'تنبيه' : 'Notice', isRTL ? 'يرجى اختيار الشركة والموديل' : 'Please select make and model');
      return;
    }

    const makeName = isRTL && selectedMake.name?.ar ? selectedMake.name.ar : selectedMake.name.en;
    const modelName = isRTL && selectedModel.name?.ar ? selectedModel.name.ar : selectedModel.name.en;
    const engineText = selectedSpec
      ? `${selectedSpec.engine_cylinders ? selectedSpec.engine_cylinders + ' Cyl ' : ''}${selectedSpec.fuel_type || ''}`.trim()
      : 'Standard';

    // Check if vehicle already exists
    const existing = garage.find(
      v =>
        (v.make_id === selectedMake.id || v.make.toLowerCase() === selectedMake.name.en.toLowerCase()) &&
        (v.model_id === selectedModel.id || v.model.toLowerCase() === selectedModel.name.en.toLowerCase()) &&
        v.year === selectedYear
    );

    if (existing) {
      setActiveVehicle(existing);
      if (searchDirectly) {
        navigation.navigate('Search', { vehicle: `${existing.year} ${existing.make} ${existing.model}` });
      } else {
        setIsAddMode(false);
      }
      return;
    }

    addVehicleToGarage({
      make: selectedMake.name.en,
      model: selectedModel.name.en,
      year: selectedYear,
      engine: engineText,
      badge: engineText !== 'Standard' ? engineText : undefined,
      isDefault: garage.length === 0,
      make_id: selectedMake.id,
      model_id: selectedModel.id,
      vehicle_spec_id: selectedSpec?.id || null,
    });

    if (searchDirectly) {
      navigation.navigate('Search', { vehicle: `${selectedYear} ${selectedMake.name.en} ${selectedModel.name.en}` });
    } else {
      setIsAddMode(false);
    }
  };

  const handleDeleteVehicle = (vehicle: SavedVehicle) => {
    Alert.alert(
      t('deleteVehicle'),
      `${t('confirmDeleteVehicle')}\n(${vehicle.year} ${vehicle.make} ${vehicle.model})`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteVehicle'),
          style: 'destructive',
          onPress: () => removeVehicleFromGarage(vehicle.id),
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <ScreenHeader
          title={t('selectYourVehicle')}
          onBack={() => navigation.goBack()}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      {/* 1. Saved Vehicles / My Garage Section */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
          <View style={[styles.headerIconWrap, { flexDirection: rowDirection }]}>
            <MaterialCommunityIcons name="garage" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
              {t('myGarage')} ({garage.length})
            </Text>
          </View>

          {!isAddMode && (
            <TouchableOpacity
              onPress={() => setIsAddMode(true)}
              style={[styles.addInlineBtn, { flexDirection: rowDirection }]}
            >
              <Feather name="plus" size={16} color={COLORS.accentOrange} />
              <Text style={styles.addInlineText}>{t('addNewVehicle')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Garage Cards or Empty State */}
      {garage.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="car-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>{t('noVehiclesSaved')}</Text>
          <Text style={[styles.emptySubtitle, { textAlign: 'center' }]}>
            {t('noVehiclesSavedSub')}
          </Text>
          <Button
            title={t('addNewVehicle')}
            variant="primary"
            size="md"
            onPress={() => setIsAddMode(true)}
            style={styles.emptyActionBtn}
          />
        </View>
      ) : (
        <View style={styles.garageList}>
          {garage.map((v) => {
            const isActive = activeVehicle?.id === v.id;
            return (
              <View
                key={v.id}
                style={[
                  styles.compactVehicleCard,
                  isActive && styles.activeVehicleCard,
                ]}
              >
                <View style={[styles.cardTopRow, { flexDirection: rowDirection }]}>
                  <BrandLogo
                    makeName={v.make}
                    size={42}
                    style={[styles.carBadgeIcon, isActive && styles.activeCarBadgeIcon]}
                  />

                  <View style={styles.carInfo}>
                    <View style={[styles.carTitleRow, { flexDirection: rowDirection }]}>
                      <Text style={[styles.carTitle, technicalText]}>
                        {v.year} {v.make} {v.model}
                      </Text>
                      {isActive && (
                        <View style={styles.activeTag}>
                          <Text style={styles.activeTagText}>{t('activeCarBadge')}</Text>
                        </View>
                      )}
                    </View>
                    {v.engine ? (
                      <Text style={[styles.carEngine, technicalText]}>
                        {v.engine}
                      </Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteVehicle(v)}
                    style={styles.deleteBtn}
                    accessibilityLabel={t('deleteVehicle')}
                  >
                    <Feather name="trash-2" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                {/* Practical Action Row */}
                <View style={[styles.cardActionRow, { flexDirection: rowDirection }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveVehicle(v);
                      navigation.navigate('Search', { vehicle: `${v.year} ${v.make} ${v.model}` });
                    }}
                    style={[styles.findPartsBtn, { flexDirection: rowDirection }]}
                  >
                    <Feather name="search" size={14} color={COLORS.white} />
                    <Text style={styles.findPartsBtnText}>{t('viewCompatibleParts')}</Text>
                  </TouchableOpacity>

                  {!isActive && (
                    <TouchableOpacity
                      onPress={() => setActiveVehicle(v)}
                      style={[styles.setActiveBtn, { flexDirection: rowDirection }]}
                    >
                      <Feather name="check" size={14} color={COLORS.primary} />
                      <Text style={styles.setActiveBtnText}>{t('setAsActive')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 2. Step-by-Step Vehicle Selector / Add Form */}
      {isAddMode && (
        <View style={styles.formContainer}>
          <View style={[styles.formHeaderRow, { flexDirection: rowDirection }]}>
            <View>
              <Text style={[styles.formTitle, { textAlign }]}>{t('selectYourVehicle')}</Text>
              <Text style={[styles.formSubtitle, { textAlign }]}>{t('selectVehicleSubtitle')}</Text>
            </View>
            {garage.length > 0 && (
              <TouchableOpacity onPress={() => setIsAddMode(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Error Message with Retry */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          )}

          {/* Step 1: Brand (Make) */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { textAlign }]}>1. {t('brand')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, { flexDirection: rowDirection }]}
              onPress={() => openPicker(t('brand'), 'make', makes)}
            >
              <View style={[styles.selectorMakeWrap, { flexDirection: rowDirection }]}>
                {selectedMake && (
                  <BrandLogo
                    makeName={selectedMake.name.en}
                    makeNameAr={selectedMake.name.ar}
                    slug={selectedMake.slug}
                    logoUrl={selectedMake.logo_url}
                    size={30}
                    style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
                  />
                )}
                <Text style={[styles.selectorValue, technicalText]}>
                  {selectedMake ? `${selectedMake.name.en} (${selectedMake.name.ar})` : '---'}
                </Text>
              </View>
              <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step 2: Model */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { textAlign }]}>2. {t('model')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, { flexDirection: rowDirection }]}
              onPress={() => openPicker(t('model'), 'model', models)}
              disabled={models.length === 0}
            >
              <Text style={[styles.selectorValue, technicalText]}>
                {selectedModel ? `${selectedModel.name.en} (${selectedModel.name.ar})` : '---'}
              </Text>
              <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step 3: Year */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { textAlign }]}>3. {t('year')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, { flexDirection: rowDirection }]}
              onPress={() => openPicker(t('year'), 'year', years)}
              disabled={years.length === 0}
            >
              <Text style={[styles.selectorValue, technicalText]}>{selectedYear || '---'}</Text>
              <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step 4: Engine / Spec (Optional!) */}
          <View style={styles.fieldBlock}>
            <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
              <Text style={styles.fieldLabel}>4. {t('engineType')}</Text>
              <Text style={styles.optionalBadge}>{isRTL ? '(اختياري)' : '(Optional)'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.selectorButton, { flexDirection: rowDirection }]}
              onPress={() => openPicker(t('engineType'), 'spec', [null, ...specs])}
            >
              <Text style={[styles.selectorValue, technicalText]}>
                {selectedSpec
                  ? `${selectedSpec.trim || ''} - ${selectedSpec.fuel_type || ''}`.trim()
                  : isRTL ? 'بدون تحديد مواصفات (قياسي)' : 'Standard / Any Spec'}
              </Text>
              <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step 5: Real Confirmation Card */}
          {selectedMake && selectedModel && (
            <View style={styles.confirmationBox}>
              <View style={[styles.confirmHeaderRow, { flexDirection: rowDirection, alignItems: 'center' }]}>
                <BrandLogo
                  makeName={selectedMake.name.en}
                  makeNameAr={selectedMake.name.ar}
                  slug={selectedMake.slug}
                  logoUrl={selectedMake.logo_url}
                  size={42}
                  style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}
                />
                <View style={{ flex: 1 }}>
                  <View style={[styles.confirmBadgeRow, { flexDirection: rowDirection }]}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.success} />
                    <Text style={[styles.confirmLabel, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                      {t('thisIsYourVehicle')}
                    </Text>
                  </View>
                  <Text style={[styles.confirmedVehicleText, technicalText]}>
                    {selectedYear} {selectedMake.name.en} {selectedModel.name.en}
                  </Text>
                </View>
              </View>
              <Text style={[styles.confirmedEngineText, technicalText]}>
                {selectedSpec
                  ? `${selectedSpec.trim || ''} ${selectedSpec.fuel_type || ''}`
                  : (isRTL ? 'المواصفات القياسية' : 'Standard Specifications')}
              </Text>

              <View style={styles.confirmActions}>
                <Button
                  title={`${t('saveToGarage')} و ${t('findProduct')}`}
                  variant="orange"
                  size="md"
                  onPress={() => handleConfirmAndSave(true)}
                  icon={<Feather name="check" size={18} color={COLORS.white} />}
                  style={styles.confirmSaveBtn}
                />

                <Button
                  title={t('searchThisVehicle')}
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    navigation.navigate('Search', {
                      vehicle: `${selectedYear} ${selectedMake.name.en} ${selectedModel.name.en}`,
                    });
                  }}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Dynamic Searchable Dropdown Modal with 300ms Debounce */}
      <Modal visible={pickerModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { flexDirection: rowDirection }]}>
              <Text style={styles.modalTitle}>{pickerModal.title}</Text>
              <TouchableOpacity
                onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Fast Filter Bar */}
            <View style={[styles.modalSearchBox, { flexDirection: rowDirection }]}>
              <Feather name="search" size={16} color={COLORS.textMuted} />
              <TextInput
                style={[styles.modalSearchInput, { textAlign }]}
                placeholder={isRTL ? 'بحث سريع...' : 'Quick search...'}
                value={filterQuery}
                onChangeText={setFilterQuery}
                autoCorrect={false}
              />
              {filterQuery.length > 0 && (
                <TouchableOpacity onPress={() => setFilterQuery('')}>
                  <Feather name="x-circle" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredModalItems}
              keyExtractor={(item, index) => `${pickerModal.type}_${index}_${item?.id || item}`}
              renderItem={({ item }) => {
                if (pickerModal.type === 'make') {
                  const m = item as VehicleMakeItem;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItemMake, { flexDirection: rowDirection }]}
                      onPress={() => {
                        handleMakeChange(m);
                        setPickerModal(p => ({ ...p, visible: false }));
                      }}
                    >
                      <BrandLogo
                        makeName={m.name.en}
                        makeNameAr={m.name.ar}
                        slug={m.slug}
                        logoUrl={m.logo_url}
                        size={38}
                        style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
                      />
                      <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-start' }}>
                        <Text style={[styles.modalMakeEn, technicalText]}>{m.name.en}</Text>
                        <Text style={styles.modalMakeAr}>{m.name.ar}</Text>
                      </View>
                      <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  );
                }

                let label = '';
                if (pickerModal.type === 'model') {
                  const m = item as VehicleModelItem;
                  label = `${m.name.en} — ${m.name.ar}`;
                } else if (pickerModal.type === 'year') {
                  label = String(item);
                } else if (pickerModal.type === 'spec') {
                  if (!item) {
                    label = isRTL ? 'بدون تحديد محرك (اختياري / قياسي)' : 'Standard / No specific engine';
                  } else {
                    const s = item as VehicleSpecItem;
                    label = `${s.trim || 'Standard'} ${s.engine_cylinders ? `(${s.engine_cylinders} Cyl)` : ''} ${s.fuel_type || ''}`.trim();
                  }
                }

                return (
                  <TouchableOpacity
                    style={[styles.modalItem, { flexDirection: rowDirection }]}
                    onPress={() => {
                      if (pickerModal.type === 'model') handleModelChange(item);
                      if (pickerModal.type === 'year') handleYearChange(item);
                      if (pickerModal.type === 'spec') setSelectedSpec(item);
                      setPickerModal(p => ({ ...p, visible: false }));
                    }}
                  >
                    <Text style={[styles.modalItemText, technicalText]}>{label}</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>
                    {isRTL ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconWrap: {
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  addInlineBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addInlineText: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.accentOrange,
    marginHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.base,
    maxWidth: 280,
  },
  emptyActionBtn: {
    minWidth: 180,
  },
  garageList: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  compactVehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  activeVehicleCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: '#FAFCFF',
  },
  cardTopRow: {
    alignItems: 'center',
  },
  carBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCarBadgeIcon: {
    backgroundColor: '#EBF1FA',
  },
  carInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  carTitleRow: {
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  carTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  carEngine: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  activeTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  cardActionRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    justifyContent: 'flex-start',
    gap: SPACING.sm,
  },
  findPartsBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    gap: 6,
  },
  findPartsBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
  },
  setActiveBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    gap: 6,
  },
  setActiveBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  formHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.sm,
  },
  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  formSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cancelBtn: {
    padding: SPACING.xs,
  },
  cancelBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorBoxText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    flex: 1,
  },
  fieldBlock: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  fieldLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
  },
  optionalBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  selectorButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  confirmationBox: {
    backgroundColor: '#F5F8FC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#D4E2F4',
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  confirmHeaderRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  confirmLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.success,
  },
  confirmedVehicleText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 16,
  },
  confirmedEngineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  confirmActions: {
    gap: SPACING.sm,
  },
  confirmSaveBtn: {
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 54, 0.55)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    maxHeight: 520,
    padding: SPACING.base,
    ...SHADOWS.cardHover,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchBox: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
    gap: 6,
  },
  modalSearchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    padding: 0,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  modalItemMake: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: 'center',
  },
  modalMakeInfo: {
    flex: 1,
  },
  modalMakeEn: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  modalMakeAr: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectorMakeWrap: {
    alignItems: 'center',
    flex: 1,
  },
  confirmBadgeRow: {
    alignItems: 'center',
    marginBottom: 2,
  },
  modalEmpty: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  modalEmptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});
