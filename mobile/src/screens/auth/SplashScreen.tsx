import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar } from 'react-native';
import { COLORS, FONT_NAMES, SPACING } from '../../theme';
import { AlaLogo } from '../../components/ui/AlaLogo';
import { AppText } from '../../components/ui/AppText';

interface SplashScreenProps {
  onFinish?: () => void;
  navigation?: any;
}

/**
 * SplashScreen — Luxury Automotive Brand Introduction
 * Features dark navy #010736 background, vector ALA emblem, and smooth fade animation.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Smooth Fade-in and gentle Scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // 2. Transition to Onboarding
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (navigation) {
        navigation.replace('Onboarding');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, taglineAnim, onFinish, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AlaLogo size={160} />

        <AppText
          variant="display"
          style={styles.brandTitle}
        >
          ALALAMI
        </AppText>

        <AppText
          variant="h2"
          style={styles.brandArabic}
        >
          العالمي لقطع الغيار
        </AppText>
      </Animated.View>

      <Animated.View
        style={[
          styles.footerContainer,
          { opacity: taglineAnim },
        ]}
      >
        <View style={styles.goldLine} />
        <AppText
          variant="caption"
          style={styles.tagline}
        >
          المنصة الرائدة لسوق قطع غيار السيارات
        </AppText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // #010736
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.cream, // #FCF1D0
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 4,
    marginTop: SPACING.lg,
    fontFamily: FONT_NAMES.Black,
  },
  brandArabic: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 4,
    fontFamily: FONT_NAMES.Bold,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  goldLine: {
    width: 36,
    height: 2,
    backgroundColor: COLORS.cream,
    opacity: 0.6,
    marginBottom: SPACING.sm,
    borderRadius: 1,
  },
  tagline: {
    color: 'rgba(252, 241, 208, 0.75)',
    letterSpacing: 0.5,
    fontFamily: FONT_NAMES.Regular,
    fontSize: 12,
  },
});
