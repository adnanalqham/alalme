import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useLocalization } from '../../localization';

interface HomeHeaderProps {
  location?: string;
  onLocationPress?: () => void;
  onNotificationsPress?: () => void;
  unreadNotifications?: number;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  location = "Sana'a, Yemen",
  onLocationPress,
  onNotificationsPress,
  unreadNotifications = 2,
}) => {
  const insets = useSafeAreaInsets();
  const { isRTL, t, rowDirection, textAlign } = useLocalization();

  // Dynamic safe-area padding for status bar and Dynamic Island
  const topPadding = Math.max(insets.top, 10);

  return (
    <View style={[styles.homeHeader, { paddingTop: topPadding, flexDirection: rowDirection }]}>
      {/* Location Selector Matching Reference Screen 1 */}
      <TouchableOpacity
        onPress={onLocationPress}
        style={[styles.locationBtn, { flexDirection: rowDirection }]}
        activeOpacity={0.7}
      >
        <View style={styles.pinCircle}>
          <Ionicons name="location-outline" size={16} color={COLORS.accentOrange} />
        </View>
        <View style={{ marginHorizontal: 8 }}>
          <Text style={[styles.locationLabel, { textAlign }]}>{t('myLocation')}</Text>
          <View style={{ flexDirection: rowDirection, alignItems: 'center' }}>
            <Text style={styles.locationValue}>{location}</Text>
            <Feather
              name="chevron-down"
              size={14}
              color={COLORS.textPrimary}
              style={{ marginHorizontal: 2 }}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification Bell with Badge */}
      <TouchableOpacity
        onPress={onNotificationsPress}
        style={styles.bellBtn}
        activeOpacity={0.7}
      >
        <Feather name="bell" size={20} color={COLORS.textPrimary} />
        {unreadNotifications > 0 && (
          <View style={styles.badgeDot} />
        )}
      </TouchableOpacity>
    </View>
  );
};

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { isRTL, rowDirection, textAlign } = useLocalization();

  const canShowBack = showBack && !!onBack;
  const topPadding = Math.max(insets.top, 10);

  return (
    <View style={[styles.screenHeader, { paddingTop: topPadding, flexDirection: rowDirection }]}>
      <View style={{ flexDirection: rowDirection, alignItems: 'center', flex: 1 }}>
        {canShowBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            {/* Mirror back arrow for RTL navigation flow */}
            <Feather
              name={isRTL ? 'arrow-right' : 'arrow-left'}
              size={20}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        )}
        <View style={{ marginHorizontal: canShowBack ? 8 : 0, flex: 1 }}>
          <Text style={[styles.screenTitle, { textAlign }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.screenSubtitle, { textAlign }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
    </View>
  );
};

// Unified Responsive Header abstraction
export interface AppHeaderProps extends ScreenHeaderProps, HomeHeaderProps {
  variant?: 'screen' | 'home';
}

export const AppHeader: React.FC<AppHeaderProps> = ({ variant = 'screen', ...props }) => {
  if (variant === 'home') {
    return <HomeHeader {...props} />;
  }
  return <ScreenHeader {...props} />;
};

const styles = StyleSheet.create({
  homeHeader: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  locationBtn: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentOrangeLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  locationValue: {
    ...TYPOGRAPHY.bodySmallBold,
    color: COLORS.textPrimary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  screenHeader: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  screenTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
