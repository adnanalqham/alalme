import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, FlatList
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { Button } from '../ui/Button';

// Mock Vehicle Database matching ALA schema
export const VEHICLE_DATABASE = {
  makes: ['Toyota', 'Hyundai', 'Nissan', 'Honda', 'Lexus'],
  models: {
    Toyota: ['Camry', 'Land Cruiser', 'Corolla', 'Hilux', 'Prado', 'Yaris'],
    Hyundai: ['Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Accent'],
    Nissan: ['Patrol', 'Sunny', 'Altima', 'X-Trail', 'Navara'],
    Honda: ['Accord', 'Civic', 'CR-V', 'Pilot'],
    Lexus: ['LX570', 'ES350', 'RX350', 'IS300'],
  } as Record<string, string[]>,
  years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
  engines: ['2.5L I4 Gas', '3.5L V6 Gas', '4.0L V6 Gas', '1.6L I4 Gas', '2.0L I4 Turbo', 'Diesel 2.8L'],
};

interface VehicleSelectorProps {
  onVehicleSelected?: (vehicle: { make: string; model: string; year: number; engine: string }) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ onVehicleSelected }) => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();

  const [make, setMake] = useState('Toyota');
  const [year, setYear] = useState<number>(2022);
  const [model, setModel] = useState('Camry');
  const [engine, setEngine] = useState('2.5L I4 Gas');

  // Dropdown Picker Modal state
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    items: (string | number)[];
    onSelect: (val: any) => void;
  }>({
    visible: false,
    title: '',
    items: [],
    onSelect: () => {},
  });

  const openPicker = (title: string, items: (string | number)[], onSelect: (val: any) => void) => {
    setPickerModal({ visible: true, title, items, onSelect });
  };

  const handleFind = () => {
    if (onVehicleSelected) {
      onVehicleSelected({ make, model, year, engine });
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Brand Field */}
      <Text style={[styles.fieldLabel, { textAlign }]}>{t('brand')}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { flexDirection: rowDirection }]}
        onPress={() => openPicker(t('brand'), VEHICLE_DATABASE.makes, val => {
          setMake(val);
          // auto-reset model to first available
          if (VEHICLE_DATABASE.models[val]) {
            setModel(VEHICLE_DATABASE.models[val][0]);
          }
        })}
      >
        <Text style={styles.dropdownValue}>{make || t('selectBrand')}</Text>
        <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* 2. Year Field */}
      <Text style={[styles.fieldLabel, { textAlign }]}>{t('year')}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { flexDirection: rowDirection }]}
        onPress={() => openPicker(t('year'), VEHICLE_DATABASE.years, setYear)}
      >
        <Text style={styles.dropdownValue}>{year || t('selectYear')}</Text>
        <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* 3. Model Field */}
      <Text style={[styles.fieldLabel, { textAlign }]}>{t('model')}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { flexDirection: rowDirection }]}
        onPress={() => openPicker(t('model'), VEHICLE_DATABASE.models[make] || [], setModel)}
      >
        <Text style={styles.dropdownValue}>{model || t('selectModel')}</Text>
        <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* 4. Engine Field */}
      <Text style={[styles.fieldLabel, { textAlign }]}>{t('engineType')}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { flexDirection: rowDirection }]}
        onPress={() => openPicker(t('engineType'), VEHICLE_DATABASE.engines, setEngine)}
      >
        <Text style={styles.dropdownValue}>{engine || t('selectEngine')}</Text>
        <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Primary Action Button Matching Reference Screen 3 (Car icon + Find Product) */}
      <Button
        title={t('findProduct')}
        onPress={handleFind}
        variant="orange"
        size="lg"
        icon={<MaterialCommunityIcons name="car-cog" size={20} color={COLORS.white} />}
        style={styles.findButton}
      />

      {/* Selection Modal */}
      <Modal visible={pickerModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, { flexDirection: rowDirection }]}>
              <Text style={styles.modalTitle}>{pickerModal.title}</Text>
              <TouchableOpacity
                onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pickerModal.items}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, { flexDirection: rowDirection }]}
                  onPress={() => {
                    pickerModal.onSelect(item);
                    setPickerModal(p => ({ ...p, visible: false }));
                  }}
                >
                  <Text style={[styles.pickerItemText, { textAlign }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  fieldLabel: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dropdown: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  dropdownValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  findButton: {
    marginTop: SPACING.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 54, 0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    maxHeight: 400,
    padding: SPACING.base,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pickerItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    width: '100%',
  },
});
