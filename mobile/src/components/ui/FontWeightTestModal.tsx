import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import { FONT_NAMES, COLORS, RADIUS, SPACING } from '../../theme';
import { useLocalization } from '../../localization';

interface FontWeightTestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FontWeightTestModal: React.FC<FontWeightTestModalProps> = ({ visible, onClose }) => {
  const { textAlign } = useLocalization();
  const [loadedStatuses, setLoadedStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      setLoadedStatuses({
        [FONT_NAMES.Light]: Font.isLoaded(FONT_NAMES.Light),
        [FONT_NAMES.Regular]: Font.isLoaded(FONT_NAMES.Regular),
        [FONT_NAMES.Medium]: Font.isLoaded(FONT_NAMES.Medium),
        [FONT_NAMES.Bold]: Font.isLoaded(FONT_NAMES.Bold),
        [FONT_NAMES.Black]: Font.isLoaded(FONT_NAMES.Black),
      });
    }
  }, [visible]);

  const testSample = 'قطع غيار السيارات';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>اختبار أوزان Thmanyah Sans الخمسة</Text>
          <Text style={styles.headerSub}>فحص runtime والتحقق البصري المباشر</Text>

          <View style={styles.weightRow}>
            <View style={styles.metaRow}>
              <Text style={styles.badgeText}>Light 300</Text>
              <Text style={styles.statusText}>
                {loadedStatuses[FONT_NAMES.Light] ? '✅ محمل' : '❌ غير محمل'}
              </Text>
            </View>
            <Text style={[styles.sampleText, { fontFamily: FONT_NAMES.Light, textAlign }]}>
              {testSample}
            </Text>
          </View>

          <View style={styles.weightRow}>
            <View style={styles.metaRow}>
              <Text style={styles.badgeText}>Regular 400</Text>
              <Text style={styles.statusText}>
                {loadedStatuses[FONT_NAMES.Regular] ? '✅ محمل' : '❌ غير محمل'}
              </Text>
            </View>
            <Text style={[styles.sampleText, { fontFamily: FONT_NAMES.Regular, textAlign }]}>
              {testSample}
            </Text>
          </View>

          <View style={styles.weightRow}>
            <View style={styles.metaRow}>
              <Text style={styles.badgeText}>Medium 500</Text>
              <Text style={styles.statusText}>
                {loadedStatuses[FONT_NAMES.Medium] ? '✅ محمل' : '❌ غير محمل'}
              </Text>
            </View>
            <Text style={[styles.sampleText, { fontFamily: FONT_NAMES.Medium, textAlign }]}>
              {testSample}
            </Text>
          </View>

          <View style={styles.weightRow}>
            <View style={styles.metaRow}>
              <Text style={styles.badgeText}>Bold 700</Text>
              <Text style={styles.statusText}>
                {loadedStatuses[FONT_NAMES.Bold] ? '✅ محمل' : '❌ غير محمل'}
              </Text>
            </View>
            <Text style={[styles.sampleText, { fontFamily: FONT_NAMES.Bold, textAlign }]}>
              {testSample}
            </Text>
          </View>

          <View style={styles.weightRow}>
            <View style={styles.metaRow}>
              <Text style={styles.badgeText}>Black 900</Text>
              <Text style={styles.statusText}>
                {loadedStatuses[FONT_NAMES.Black] ? '✅ محمل' : '❌ غير محمل'}
              </Text>
            </View>
            <Text style={[styles.sampleText, { fontFamily: FONT_NAMES.Black, textAlign }]}>
              {testSample}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>إغلاق الفحص</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
  },
  headerTitle: {
    fontFamily: FONT_NAMES.Bold,
    fontSize: 18,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: FONT_NAMES.Regular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  weightRow: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeText: {
    fontFamily: FONT_NAMES.Medium,
    fontSize: 11,
    color: COLORS.navy,
  },
  statusText: {
    fontSize: 11,
  },
  sampleText: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  closeBtnText: {
    fontFamily: FONT_NAMES.Medium,
    color: COLORS.white,
    fontSize: 14,
  },
});
