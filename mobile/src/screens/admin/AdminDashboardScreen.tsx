import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { isRTL, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { user } = useAuth();

  const [pendingShops, setPendingShops] = useState([
    { id: 'req1', name: 'Al-Nahdi Auto Spares', city: 'Aden (عدن)', phone: '+967 777 333 111', commission: '5%' },
    { id: 'req2', name: 'Gulf Parts Express', city: "Sana'a (صنعاء)", phone: '+967 777 444 222', commission: '5%' },
  ]);

  const handleApprove = (id: string, name: string) => {
    Alert.alert(
      isRTL ? 'اعتماد المحل' : 'Approve Shop',
      isRTL ? `تم اعتماد ${name} وتحديد العمولة 5% بنجاح` : `Approved ${name} with 5% commission successfully.`,
      [{ text: isRTL ? 'موافق' : 'OK' }]
    );
    setPendingShops(prev => prev.filter(s => s.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingShops(prev => prev.filter(s => s.id !== id));
  };

  return (
    <ScreenContainer
      header={<ScreenHeader title={t('adminConsole')} showBack={false} />}
      contentContainerStyle={styles.scrollContent}
      scrollable
    >
      {/* Admin Title Card */}
      <View style={styles.bannerCard}>
        <Text style={[styles.bannerTitle, { textAlign }]}>
          {isRTL ? 'لوحة القيادة المركزية لمنصة العالمي' : 'ALALAMI Central Operations'}
        </Text>
        <Text style={[styles.bannerSub, { textAlign }]}>
          {user?.name || 'Mona Saleh'} • Platform Admin
        </Text>
      </View>

      {/* 4 Marketplace GMV & Platform KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiRow, { flexDirection: rowDirection }]}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, technicalText]}>$248,600</Text>
            <Text style={[styles.kpiLabel, { textAlign }]}>{t('totalGmv')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: COLORS.accentOrange }, technicalText]}>$12,430</Text>
            <Text style={[styles.kpiLabel, { textAlign }]}>{t('commissions')}</Text>
          </View>
        </View>

        <View style={[styles.kpiRow, { flexDirection: rowDirection }]}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, technicalText]}>48</Text>
            <Text style={[styles.kpiLabel, { textAlign }]}>{t('approvedShops')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: COLORS.navy }, technicalText]}>{pendingShops.length}</Text>
            <Text style={[styles.kpiLabel, { textAlign }]}>{t('pendingShops')}</Text>
          </View>
        </View>
      </View>

      {/* Pending Shop Approvals Workflow */}
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { textAlign }]}>
          {t('pendingShops')} ({pendingShops.length})
        </Text>

        {pendingShops.length === 0 ? (
          <Text style={[styles.emptyNotice, { textAlign }]}>
            {isRTL ? 'لا توجد طلبات اعتماد جديدة في قائمة الانتظار' : 'No pending shop approval requests'}
          </Text>
        ) : (
          pendingShops.map(shop => (
            <View key={shop.id} style={styles.shopItem}>
              <View style={[styles.shopItemHeader, { flexDirection: rowDirection }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shopItemName, { textAlign }]}>{shop.name}</Text>
                  <Text style={[styles.shopItemCity, { textAlign }]}>
                    {shop.city} • <Text style={technicalText}>{shop.phone}</Text>
                  </Text>
                </View>
                <Badge label={`عمولة: ${shop.commission}`} tone="cream" />
              </View>

              <View style={[styles.approvalActions, { flexDirection: rowDirection }]}>
                <Button
                  title={t('approveShop')}
                  onPress={() => handleApprove(shop.id, shop.name)}
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title={t('rejectShop')}
                  onPress={() => handleReject(shop.id)}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Vehicle Database Management Card */}
      <View style={styles.sectionCard}>
        <View style={[styles.dbRow, { flexDirection: rowDirection }]}>
          <MaterialCommunityIcons name="database-cog" size={26} color={COLORS.primary} />
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={[styles.dbTitle, { textAlign }]}>{t('vehicleDatabase')}</Text>
            <Text style={[styles.dbSub, { textAlign }]}>
              {isRTL ? '12 شركة • 94 موديل • 30 منظومة تصنيف' : '12 Makes • 94 Models • 30 Taxonomy Systems'}
            </Text>
          </View>
          <Badge label={isRTL ? 'معتمد ومحدث' : 'Synced'} tone="success" />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  bannerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  bannerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.cream,
    marginTop: 4,
  },
  kpiGrid: {
    marginBottom: SPACING.md,
    gap: 8,
  },
  kpiRow: {
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  kpiValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  kpiLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  emptyNotice: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    paddingVertical: 12,
  },
  shopItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: 10,
  },
  shopItemHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopItemName: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  shopItemCity: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  approvalActions: {
    gap: 8,
    marginTop: 4,
  },
  dbRow: {
    alignItems: 'center',
  },
  dbTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  dbSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
