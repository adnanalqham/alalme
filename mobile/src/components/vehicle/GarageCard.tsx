import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { SavedVehicle } from '../../context/AppContext';

interface GarageCardProps {
  vehicle: SavedVehicle;
  isActive?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}

export const GarageCard: React.FC<GarageCardProps> = ({
  vehicle,
  isActive = false,
  onSelect,
  onRemove,
}) => {
  const { isRTL, rowDirection, textAlign } = useLocalization();

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.75}
      style={[
        styles.card,
        { flexDirection: rowDirection },
        isActive ? styles.activeCard : null,
      ]}
    >
      {/* Car Icon Silhouette Frame */}
      <View style={[styles.iconBox, isActive ? styles.activeIconBox : null]}>
        <MaterialCommunityIcons
          name="car-side"
          size={24}
          color={isActive ? COLORS.primary : COLORS.navy}
        />
      </View>

      {/* Info details */}
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={[styles.vehicleTitle, { textAlign }]}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <Text style={[styles.vehicleEngine, { textAlign }]}>
          {vehicle.engine}
        </Text>
      </View>

      {/* Action / Chevron arrow (mirrored for RTL) */}
      <Feather
        name={isRTL ? 'chevron-left' : 'chevron-right'}
        size={20}
        color={isActive ? COLORS.primary : COLORS.textMuted}
      />
    </TouchableOpacity>
  );
};

interface AddVehicleButtonProps {
  onPress: () => void;
}

export const AddVehicleButton: React.FC<AddVehicleButtonProps> = ({ onPress }) => {
  const { t } = useLocalization();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.dashedButton}
    >
      <Text style={styles.dashedText}>
        {t('addAnotherVehicle')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  activeCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: '#FAFBFD',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBox: {
    backgroundColor: COLORS.cream,
  },
  vehicleTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  vehicleEngine: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dashedButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.accentOrange,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dashedText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.accentOrange,
  },
});
