import React, { useState, useRef } from 'react';
import {
  View, Image, StyleSheet, TouchableOpacity, FlatList,
  useWindowDimensions, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_NAMES, SPACING, RADIUS } from '../../theme';
import { useLocalization } from '../../localization';
import { assets } from '../../constants/assets';
import { AppText } from '../../components/ui/AppText';
import { AlaLogo } from '../../components/ui/AlaLogo';

interface SlideData {
  id: string;
  image?: any;
  isBrandVisual?: boolean;
  title: string;
  description: string;
  ctaText: string;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    image: assets.cars.onboarding1,
    title: 'قطع سيارتك تبدأ من هنا',
    description: 'ابحث عن قطع الغيار المناسبة لسيارتك بسهولة.',
    ctaText: 'التالي',
  },
  {
    id: '2',
    image: assets.cars.onboarding2,
    title: 'اعثر على القطعة المناسبة',
    description: 'حدد سيارتك وابحث عن القطع المتوافقة معها من المحلات.',
    ctaText: 'التالي',
  },
  {
    id: '3',
    isBrandVisual: true,
    title: 'قارن واختر بثقة',
    description: 'قارن العروض والأسعار وتواصل مع المحل أو اطلب القطعة مباشرة.',
    ctaText: 'ابدأ الآن',
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

/**
 * OnboardingScreen — Luxury Automotive Onboarding Experience
 * Renders verified 3.png and 4.png car assets directly on dark navy #010736 background
 * with responsive breathing room, Thmanyah Sans typography, and smooth slide navigation.
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isRTL, textAlign } = useLocalization();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Responsive automotive image dimensions
  const carWidth = Math.min(width * 0.92, 440);
  const carHeight = Math.min(height * 0.38, 290);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Navigate to Login/Auth or MainTabs
    navigation.replace('Login');
  };

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < SLIDES.length) {
      setCurrentIndex(newIndex);
    }
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Top Header: Brand Logo & Skip Button */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 14),
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={styles.topBrand}>
          <AlaLogo size={32} />
          <AppText
            variant="label"
            style={styles.topBrandText}
          >
            ALALAMI
          </AppText>
        </View>

        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <AppText
              variant="caption"
              style={styles.skipText}
            >
              تخطي
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Slides Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {/* Visual Section: Real Car Asset or Brand Visual */}
            <View style={[styles.visualArea, { height: carHeight + 20 }]}>
              {item.image ? (
                // Foreground Automotive Asset directly on #010736 background (NO CARD)
                <Image
                  source={item.image}
                  style={[styles.carImage, { width: carWidth, height: carHeight }]}
                  resizeMode="contain"
                />
              ) : (
                // Slide 3: Luxury Brand Visual with Steering Wheel Emblem & Radial Accents
                <View style={[styles.brandVisualContainer, { width: carWidth, height: carHeight }]}>
                  <View style={styles.outerRing}>
                    <View style={styles.innerRing}>
                      <AlaLogo size={110} />
                    </View>
                  </View>
                  <View style={styles.trustBadge}>
                    <AppText variant="caption" style={styles.trustBadgeText}>
                      ضمان التوافق مع سيارتك 100%
                    </AppText>
                  </View>
                </View>
              )}
            </View>

            {/* Typography Content */}
            <View style={styles.contentArea}>
              <AppText
                variant="h1"
                style={[styles.title, { textAlign }]}
              >
                {item.title}
              </AppText>

              <AppText
                variant="bodyLarge"
                style={[styles.description, { textAlign }]}
              >
                {item.description}
              </AppText>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls: Indicators & CTA */}
      <View
        style={[
          styles.bottomControls,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        {/* Pagination Dots */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.ctaButton,
            isLastSlide ? styles.ctaButtonGold : styles.ctaButtonNavy,
          ]}
          activeOpacity={0.85}
        >
          <AppText
            variant="button"
            style={[
              styles.ctaText,
              isLastSlide ? styles.ctaTextGold : styles.ctaTextWhite,
            ]}
          >
            {SLIDES[currentIndex].ctaText}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // #010736
  },
  topBar: {
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBrandText: {
    color: COLORS.cream,
    letterSpacing: 2,
    fontFamily: FONT_NAMES.Bold,
    fontSize: 13,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(34, 57, 111, 0.4)', // subtle navy highlight
  },
  skipText: {
    color: 'rgba(252, 241, 208, 0.85)',
    fontFamily: FONT_NAMES.Medium,
    fontSize: 13,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  visualArea: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  // Rule 5: NO card, NO border, car sits directly on background
  carImage: {
    backgroundColor: 'transparent',
  },
  brandVisualContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(252, 241, 208, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 57, 111, 0.25)',
  },
  innerRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: 'rgba(252, 241, 208, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 7, 54, 0.6)',
  },
  trustBadge: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(252, 241, 208, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(252, 241, 208, 0.25)',
  },
  trustBadgeText: {
    color: COLORS.cream,
    fontFamily: FONT_NAMES.Medium,
    fontSize: 11,
  },
  contentArea: {
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    lineHeight: 34,
    fontFamily: FONT_NAMES.Bold,
    marginBottom: SPACING.sm,
  },
  description: {
    color: 'rgba(243, 245, 250, 0.75)',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FONT_NAMES.Regular,
  },
  bottomControls: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: COLORS.cream, // #FCF1D0
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(252, 241, 208, 0.25)',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonNavy: {
    backgroundColor: COLORS.navy, // #22396F
    borderWidth: 1,
    borderColor: 'rgba(252, 241, 208, 0.3)',
  },
  ctaButtonGold: {
    backgroundColor: COLORS.cream, // #FCF1D0
  },
  ctaText: {
    fontSize: 16,
    fontFamily: FONT_NAMES.Medium,
  },
  ctaTextWhite: {
    color: COLORS.white,
  },
  ctaTextGold: {
    color: COLORS.primary, // #010736
  },
});
