import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AlaLogo } from '../../components/ui/AlaLogo';
import { Badge } from '../../components/ui/Badge';

export const PendingApprovalScreen: React.FC<{ navigation?: any }> = () => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { user, logout, loginAs } = useAuth();

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/967771603365');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <View style={styles.contentCard}>
        {/* Brand Logo */}
        <View style={styles.logoRow}>
          <AlaLogo size={70} />
        </View>

        {/* Clock/Pending Icon */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="clock-outline" size={40} color="#D97706" />
        </View>

        <Badge label={isRTL ? 'قيد المراجعة والاعتماد' : 'Pending Verification'} tone="warning" />

        <Text style={[styles.mainTitle, { textAlign }]}>
          {isRTL ? 'طلب إنشاء متجرك قيد المراجعة' : 'Your Shop is Pending Review'}
        </Text>

        <Text style={[styles.descText, { textAlign }]}>
          {isRTL
            ? `مرحباً ${user?.name || ''}. تم تسجيل طلب متجرك بنجاح، ويقوم فريق إدارة منصة العالمي بمراجعة النشاط التجاري وتفعيل الصلاحيات خلال وقت قصير.`
            : `Welcome ${user?.name || ''}. Your shop application has been submitted and is currently being reviewed by the ALALAMI team.`}
        </Text>

        {/* Shop Info Summary Box */}
        <View style={styles.shopBox}>
          <View style={[styles.shopRow, { flexDirection: rowDirection }]}>
            <MaterialCommunityIcons name="storefront" size={24} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.shopName, { textAlign }]}>
                {user?.shopName || 'Al-Najah Modern Auto Parts'}
              </Text>
              <Text style={[styles.shopBranch, { textAlign }]}>
                {user?.branchName || 'Sana\'a Branch'}
              </Text>
            </View>
            <Badge label="PENDING" tone="warning" />
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.checklist}>
          <View style={[styles.checkRow, { flexDirection: rowDirection }]}>
            <Feather name="check-circle" size={16} color={COLORS.success} />
            <Text style={[styles.checkText, { textAlign }]}>
              {isRTL ? 'تم استلام بيانات المتجر ورقم التواصل' : 'Application & contact received'}
            </Text>
          </View>
          <View style={[styles.checkRow, { flexDirection: rowDirection }]}>
            <MaterialCommunityIcons name="progress-clock" size={16} color="#D97706" />
            <Text style={[styles.checkText, { textAlign, color: COLORS.primary, fontWeight: '700' }]}>
              {isRTL ? 'جاري فحص البيانات وتحديد فئة العمولة' : 'Verification of commercial details in progress'}
            </Text>
          </View>
          <View style={[styles.checkRow, { flexDirection: rowDirection }]}>
            <Feather name="circle" size={16} color={COLORS.textMuted} />
            <Text style={[styles.checkText, { textAlign, color: COLORS.textMuted }]}>
              {isRTL ? 'تفعيل لوحة إدارة المنتجات والمخزون' : 'Unlocking catalog & inventory tools'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSupport, { flexDirection: rowDirection }]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={18} color={COLORS.white} />
            <Text style={styles.actionBtnTextWhite}>
              {isRTL ? 'تواصل مع الدعم عبر واتساب' : 'Contact Support via WhatsApp'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGuest, { flexDirection: rowDirection }]}
            onPress={() => loginAs('customer')}
            activeOpacity={0.85}
          >
            <Feather name="shopping-cart" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnTextPrimary}>
              {isRTL ? 'التصفح كعميل للتسوق' : 'Browse Marketplace as Customer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnLogout, { flexDirection: rowDirection }]}
            onPress={() => logout()}
            activeOpacity={0.85}
          >
            <Feather name="log-out" size={16} color={COLORS.danger} />
            <Text style={styles.actionBtnTextDanger}>
              {isRTL ? 'تسجيل الخروج' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  logoRow: {
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  mainTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  descText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  shopBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  shopRow: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  shopName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  shopBranch: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  checklist: {
    width: '100%',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  checkRow: {
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnSupport: {
    backgroundColor: '#059669',
  },
  actionBtnGuest: {
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionBtnLogout: {
    backgroundColor: '#FEE2E2',
    marginTop: 4,
  },
  actionBtnTextWhite: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },
  actionBtnTextPrimary: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  actionBtnTextDanger: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.danger,
  },
});
