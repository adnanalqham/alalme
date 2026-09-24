import React from 'react';
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
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';
import { AlaLogo } from '../../components/ui/AlaLogo';

export const ShopMoreScreen: React.FC = () => {
  const { isRTL, t, rowDirection, textAlign } = useLocalization();
  const { user, role, experience, logout, loginAs, hasPermission } = useAuth();

  const handleAction = (title: string, permRequired?: string) => {
    if (permRequired && !hasPermission(permRequired)) {
      Alert.alert(
        isRTL ? 'صلاحية غير متوفرة' : 'Access Denied',
        isRTL
          ? `ليس لديك صلاحية الوصول إلى: ${title}`
          : `You do not have permission to access: ${title}`
      );
      return;
    }
    Alert.alert(
      title,
      isRTL ? 'هذه الخاصية مفعلة في لوحة إدارة المحل.' : 'This feature is active in the shop management system.'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      isRTL ? 'تسجيل الخروج' : 'Logout',
      isRTL ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' : 'Are you sure you want to log out?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: isRTL ? 'خروج' : 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          title={isRTL ? 'المزيد' : 'More'}
          showBack={false}
        />
      }
      scrollable
    >
      {/* Shop Info Card */}
      <View style={styles.shopCard}>
        <View style={[styles.shopRow, { flexDirection: rowDirection }]}>
          <View style={styles.shopAvatarBox}>
            <AlaLogo size={36} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shopNameText, { textAlign }]}>
              {user?.shopName || 'Al-Barakah Auto Parts'}
            </Text>
            <Text style={[styles.shopBranchText, { textAlign }]}>
              {user?.branchName || 'Aden Main Branch'}
            </Text>
            <View style={[styles.badgeContainer, { flexDirection: rowDirection }]}>
              <Badge
                label={
                  role === 'SHOP_OWNER'
                    ? (isRTL ? 'مالك المحل' : 'Shop Owner')
                    : (isRTL ? 'موظف المحل' : 'Shop Employee')
                }
                tone="navy"
              />
              <Badge
                label={isRTL ? 'معتمد رسمي' : 'Verified'}
                tone="success"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Operational Modules */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign }]}>
          {isRTL ? 'إدارة المتجر والعمليات' : 'Shop Management'}
        </Text>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={[styles.menuItem, { flexDirection: rowDirection }]}
            onPress={() => handleAction(isRTL ? 'إدارة الموظفين والصلاحيات' : 'Team & Permissions', 'employees.view')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="users" size={18} color="#4F46E5" />
            </View>
            <Text style={[styles.menuItemText, { textAlign }]}>
              {isRTL ? 'فريق العمل والموظفون' : 'Employees & Permissions'}
            </Text>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={[styles.menuItem, { flexDirection: rowDirection }]}
            onPress={() => handleAction(isRTL ? 'فروع المتجر' : 'Shop Branches', 'branches.view')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="map-pin" size={18} color="#059669" />
            </View>
            <Text style={[styles.menuItemText, { textAlign }]}>
              {isRTL ? 'فروع المتجر' : 'Shop Branches'}
            </Text>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={[styles.menuItem, { flexDirection: rowDirection }]}
            onPress={() => handleAction(isRTL ? 'تقارير المبيعات والأداء' : 'Sales & Reports', 'reports.view')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="bar-chart-2" size={18} color="#D97706" />
            </View>
            <Text style={[styles.menuItemText, { textAlign }]}>
              {isRTL ? 'تقارير المبيعات والإحصائيات' : 'Reports & Analytics'}
            </Text>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={[styles.menuItem, { flexDirection: rowDirection }]}
            onPress={() => handleAction(isRTL ? 'إعدادات المتجر وساعات العمل' : 'Shop Settings', 'settings.manage')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="settings" size={18} color={COLORS.textPrimary} />
            </View>
            <Text style={[styles.menuItemText, { textAlign }]}>
              {isRTL ? 'إعدادات المتجر وساعات العمل' : 'Shop Settings & Hours'}
            </Text>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switching Simulator for Testing RBAC */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign }]}>
          {isRTL ? 'تبديل الحساب التجريبي (اختبار RBAC)' : 'Test Role Switcher (RBAC)'}
        </Text>

        <View style={styles.rolePickerCard}>
          <Text style={[styles.rolePickerHint, { textAlign }]}>
            {isRTL
              ? 'اختر حساباً لمعاينة تغير الواجهة والصلاحيات فوراً:'
              : 'Select an account to preview dynamic interface changes:'}
          </Text>

          <View style={styles.roleBtnGrid}>
            <TouchableOpacity
              style={[styles.roleSwitchBtn, experience === 'CUSTOMER' && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('customer')}
            >
              <Text style={[styles.roleSwitchText, experience === 'CUSTOMER' && styles.roleSwitchTextActive]}>
                {isRTL ? 'عميل (Customer)' : 'Customer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, experience === 'SHOP_OWNER_APPROVED' && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('owner_approved')}
            >
              <Text style={[styles.roleSwitchText, experience === 'SHOP_OWNER_APPROVED' && styles.roleSwitchTextActive]}>
                {isRTL ? 'مالك متجر معتمد' : 'Owner (Approved)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, experience === 'SHOP_OWNER_PENDING' && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('owner_pending')}
            >
              <Text style={[styles.roleSwitchText, experience === 'SHOP_OWNER_PENDING' && styles.roleSwitchTextActive]}>
                {isRTL ? 'مالك متجر (قيد المراجعة)' : 'Owner (Pending)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, user?.id === DEMO_USERS.employee_full.id && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('employee_full')}
            >
              <Text style={[styles.roleSwitchText, user?.id === DEMO_USERS.employee_full.id && styles.roleSwitchTextActive]}>
                {isRTL ? 'موظف بكامل الصلاحيات' : 'Employee (Full)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, user?.id === DEMO_USERS.employee_limited.id && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('employee_limited')}
            >
              <Text style={[styles.roleSwitchText, user?.id === DEMO_USERS.employee_limited.id && styles.roleSwitchTextActive]}>
                {isRTL ? 'موظف صلاحيات مقيدة' : 'Employee (Limited)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, role === 'ADMIN' && styles.roleSwitchBtnActive]}
              onPress={() => loginAs('admin')}
            >
              <Text style={[styles.roleSwitchText, role === 'ADMIN' && styles.roleSwitchTextActive]}>
                {isRTL ? 'مشرف (Admin)' : 'Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutBtn, { flexDirection: rowDirection }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>
            {isRTL ? 'تسجيل الخروج' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  shopCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  shopRow: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  shopAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  shopNameText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  shopBranchText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeContainer: {
    gap: 6,
    marginTop: 6,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    gap: SPACING.md,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  rolePickerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  rolePickerHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  roleBtnGrid: {
    gap: 8,
  },
  roleSwitchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  roleSwitchBtnActive: {
    backgroundColor: COLORS.navyLight,
    borderColor: COLORS.primary,
  },
  roleSwitchText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  roleSwitchTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.xxl,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.danger,
  },
});
