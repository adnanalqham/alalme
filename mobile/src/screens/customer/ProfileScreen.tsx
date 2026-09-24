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
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';
import { AlaLogo } from '../../components/ui/AlaLogo';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { isRTL, language, setLanguage, t, rowDirection, textAlign, technicalText } = useLocalization();
  const { user, role, loginAs, logout } = useAuth();
  const { garage, activeVehicle } = useApp();

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      isRTL ? 'هل تريد بالتأكيد تسجيل الخروج؟' : 'Are you sure you want to log out?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <ScreenContainer
      header={<ScreenHeader title={t('profile')} showBack={false} />}
      contentContainerStyle={styles.scrollContent}
      scrollable
    >
      {/* 1. Practical Profile Header (Section 21: Name, Phone, Email, Role) */}
      <View style={[styles.userCard, { flexDirection: rowDirection }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { textAlign }]}>{user?.name || 'مستخدم العالمي'}</Text>
          <Text style={[styles.userPhone, technicalText]}>
            {user?.phone || '+967 771 234 567'}
          </Text>
          <Text style={[styles.userEmail, technicalText]}>
            {user?.email || 'user@alalami.ye'}
          </Text>

          <View style={[styles.roleRow, { flexDirection: rowDirection }]}>
            <Badge label={role} tone="navy" />
          </View>
        </View>
      </View>

      {/* 2. Language Switcher (Instant RTL / LTR Switching) */}
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('language')}</Text>
        <View style={[styles.langToggleRow, { flexDirection: rowDirection }]}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'ar' && styles.activeLangBtn]}
            onPress={() => setLanguage('ar')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langBtnText, language === 'ar' && styles.activeLangBtnText]}>
              العربية (RTL)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.activeLangBtn]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langBtnText, language === 'en' && styles.activeLangBtnText]}>
              English (LTR)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Standard Practical Navigation Menu (Section 21 Specification) */}
      <View style={styles.menuCard}>
        {/* سياراتي */}
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: rowDirection }]}
          onPress={() => navigation.navigate('VehicleSelect')}
        >
          <MaterialCommunityIcons name="car-cog" size={20} color={COLORS.primary} />
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={[styles.menuLabel, { textAlign }]}>{t('myGarage')}</Text>
            {activeVehicle && (
              <Text style={[styles.menuSubLabel, technicalText]}>
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </Text>
            )}
          </View>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* طلباتي */}
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: rowDirection }]}
          onPress={() => navigation.navigate('Orders')}
        >
          <Feather name="package" size={20} color={COLORS.primary} />
          <Text style={[styles.menuLabel, { textAlign, flex: 1, marginHorizontal: 10 }]}>
            {t('myOrders')}
          </Text>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* عناويني */}
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: rowDirection }]}
          onPress={() => Alert.alert(isRTL ? 'عناويني' : 'My Addresses', isRTL ? 'صنعاء، شارع الستين الجنوبي' : 'Sana\'a, South 60th St')}
        >
          <Feather name="map-pin" size={20} color={COLORS.primary} />
          <Text style={[styles.menuLabel, { textAlign, flex: 1, marginHorizontal: 10 }]}>
            {isRTL ? 'عناويني المحفوظة' : 'Saved Addresses'}
          </Text>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* الإشعارات */}
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: rowDirection }]}
          onPress={() => Alert.alert(t('notifications'), isRTL ? 'لا توجد إشعارات جديدة حالياً' : 'No new notifications')}
        >
          <Feather name="bell" size={20} color={COLORS.primary} />
          <Text style={[styles.menuLabel, { textAlign, flex: 1, marginHorizontal: 10 }]}>
            {t('notifications')}
          </Text>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* الإعدادات */}
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: rowDirection }]}
          onPress={() => Alert.alert(isRTL ? 'الإعدادات' : 'Settings', isRTL ? 'إصدار التطبيق 2.5.0 (مستقر)' : 'App Version 2.5.0')}
        >
          <Feather name="settings" size={20} color={COLORS.primary} />
          <Text style={[styles.menuLabel, { textAlign, flex: 1, marginHorizontal: 10 }]}>
            {isRTL ? 'إعدادات الحساب والتطبيق' : 'Account Settings'}
          </Text>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* تسجيل الخروج */}
        <TouchableOpacity
          style={[styles.menuItem, styles.lastMenuItem, { flexDirection: rowDirection }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color={COLORS.error} />
          <Text style={[styles.menuLabel, { textAlign, flex: 1, marginHorizontal: 10, color: COLORS.error }]}>
            {t('logout')}
          </Text>
          <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* 4. Role Testing Switcher (Preserved for Demo & Verification) */}
      <View style={styles.demoCard}>
        <View style={[styles.demoHeaderRow, { flexDirection: rowDirection }]}>
          <MaterialCommunityIcons name="shield-account-outline" size={18} color={COLORS.primary} />
          <Text style={[styles.demoTitle, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
            {t('demoSwitcherTitle')}
          </Text>
        </View>
        <Text style={[styles.demoSub, { textAlign }]}>{t('demoSwitcherSub')}</Text>

        <View style={styles.demoButtonsList}>
          <TouchableOpacity
            style={[styles.demoBtn, role === 'CUSTOMER' && styles.activeDemoBtn]}
            onPress={() => loginAs('customer')}
          >
            <Text style={styles.demoRole}>Customer ({isRTL ? 'عميل' : 'Customer'})</Text>
            <Text style={styles.demoUserDesc}>Salem Omar (صنعاء)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoBtn, role === 'SHOP_OWNER' && styles.activeDemoBtn]}
            onPress={() => loginAs('owner')}
          >
            <Text style={styles.demoRole}>Shop Owner ({isRTL ? 'مالك محل' : 'Shop Owner'})</Text>
            <Text style={styles.demoUserDesc}>Ahmed Ali (البركة لقطع الغيار)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoBtn, role === 'SHOP_EMPLOYEE' && styles.activeDemoBtn]}
            onPress={() => loginAs('employee')}
          >
            <Text style={styles.demoRole}>Shop Employee ({isRTL ? 'موظف محل' : 'Shop Employee'})</Text>
            <Text style={styles.demoUserDesc}>Khalid Nasser (مستودع ومخزون)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoBtn, role === 'ADMIN' && styles.activeDemoBtn]}
            onPress={() => loginAs('admin')}
          >
            <Text style={styles.demoRole}>Platform Admin ({isRTL ? 'إدارة المنصة' : 'Admin'})</Text>
            <Text style={styles.demoUserDesc}>Mona Saleh (اعتماد المحلات والعمولات)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Branding Footer (Section 6) */}
      <View style={{ alignItems: 'center', marginVertical: SPACING.xl, opacity: 0.9 }}>
        <AlaLogo size={52} />
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: COLORS.primary, marginTop: 8 }}>
          {isRTL ? 'العالمي لقطع الغيار' : 'ALALAMI Auto Spare Parts'}
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 }}>
          {isRTL ? 'المنصة الرائدة لسوق قطع غيار السيارات' : 'Leading Auto Spare Parts Marketplace'}
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl * 2,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  userPhone: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  roleRow: {
    marginTop: 6,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  sectionTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  langToggleRow: {
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  activeLangBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  langBtnText: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  activeLangBtnText: {
    color: COLORS.white,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  menuItem: {
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  menuSubLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  demoCard: {
    backgroundColor: '#F8F9FD',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    marginBottom: SPACING.lg,
  },
  demoHeaderRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  demoTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  demoSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  demoButtonsList: {
    gap: 6,
  },
  demoBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeDemoBtn: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: '#F3F7FC',
  },
  demoRole: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  demoUserDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
