import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS, FONT_NAMES, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useLocalization } from '../../localization';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AlaLogo } from '../../components/ui/AlaLogo';
import { assets } from '../../constants/assets';

interface RegisterScreenProps {
  navigation: any;
}

/**
 * RegisterScreen — White Premium Automotive Experience
 * Inspired by reference luxury white automotive UI.
 * Features:
 * - Clean white background (#FFFFFF) with refined automotive minimalism
 * - Prominent car asset (assets.cars.onboarding2 / 4.png) floating naturally
 * - High-contrast Deep Midnight Navy (#010736) typography and CTA pill buttons
 * - Rounded input fields with focus indicators and leading/trailing icons
 * - Strict Customer Account Creation (guaranteed to create strictly CUSTOMER role)
 * - Google & Apple social sign-in options
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isRTL, textAlign, technicalText } = useLocalization();
  const { registerCustomer } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Focus State
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Entrance Animations
  const carAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(carAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [carAnim, formAnim]);

  const onPressInBtn = () => {
    Animated.spring(btnScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutBtn = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleRegister = async () => {
    // 1. Name validation
    if (!name.trim()) {
      setError('يرجى إدخال الاسم بالكامل');
      return;
    }

    // 2. Phone validation
    if (phone.trim().length < 7) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    // 3. Email format validation (if provided)
    if (email.trim() && !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    // 4. Password validation (if provided)
    if (password.trim() && password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    // 5. Password match validation
    if (password.trim() && password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setError('');
    setLoading(true);

    const res = await registerCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      navigation.replace('MainTabs');
    } else {
      setError(res.error || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً');
    }
  };

  const handleSocialRegister = (provider: string) => {
    setError(`جاري إنشاء الحساب عبر ${provider}...`);
    setTimeout(() => {
      navigation.replace('MainTabs');
    }, 400);
  };

  // Dimensions
  const carWidth = Math.min(width * 0.9, 380);
  const carHeight = Math.min(carWidth * 0.44, 165);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header Bar */}
        <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.circularBackBtn}
            accessibilityRole="button"
            accessibilityLabel="العودة لتسجيل الدخول"
            activeOpacity={0.7}
          >
            <Feather
              name={isRTL ? 'arrow-right' : 'arrow-left'}
              size={18}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>

          <View style={[styles.brandCenter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <AlaLogo size={28} />
            <AppText variant="h3" style={styles.brandTitleText}>
              ALALAMI
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginHeaderBtn}
            accessibilityRole="button"
            accessibilityLabel="تسجيل الدخول"
            activeOpacity={0.7}
          >
            <AppText variant="caption" style={styles.loginHeaderText}>
              دخول
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Hero Automotive Visual (White Background Float) */}
        <Animated.View
          style={[
            styles.heroCarSection,
            {
              opacity: carAnim,
              transform: [
                {
                  translateY: carAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
                {
                  scale: carAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={assets.cars.onboarding2}
            style={{ width: carWidth, height: carHeight }}
            resizeMode="contain"
            accessibilityLabel="سيارة دفع رباعي فخمة"
          />
        </Animated.View>

        {/* Title & Welcoming Headline */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AppText variant="h1" style={[styles.titleText, { textAlign }]}>
            أنشئ حسابك
          </AppText>
          <AppText variant="body" style={[styles.subtitleText, { textAlign }]}>
            ابدأ رحلتك مع ALA وابحث عن قطع سيارتك بسهولة
          </AppText>

          {/* Form Fields Section */}
          <View style={styles.formFields}>
            {/* 1. Full Name */}
            <View style={styles.inputGroup}>
              <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                الاسم بالكامل
              </AppText>
              <View
                style={[
                  styles.roundedInputShell,
                  focusedField === 'name' && styles.roundedInputShellFocused,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather
                  name="user"
                  size={18}
                  color={focusedField === 'name' ? COLORS.primary : '#94A3B8'}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="محمد صالح العمري"
                  placeholderTextColor="#94A3B8"
                  style={[styles.textInput, { textAlign }]}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="الاسم بالكامل"
                  editable={!loading}
                />
              </View>
            </View>

            {/* 2. Phone Number */}
            <View style={styles.inputGroup}>
              <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                رقم الهاتف
              </AppText>
              <View
                style={[
                  styles.roundedInputShell,
                  focusedField === 'phone' && styles.roundedInputShellFocused,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.countryCodeBadge}>
                  <AppText variant="bodyMedium" style={styles.countryCodeText}>
                    +967
                  </AppText>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="770000000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  style={[styles.textInput, technicalText]}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="رقم الهاتف"
                  editable={!loading}
                />
                <Feather
                  name="phone"
                  size={18}
                  color={focusedField === 'phone' ? COLORS.primary : '#94A3B8'}
                  style={styles.leadingIcon}
                />
              </View>
            </View>

            {/* 3. Email (Optional) */}
            <View style={styles.inputGroup}>
              <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                البريد الإلكتروني <AppText variant="caption" style={{ color: '#94A3B8' }}>(اختياري)</AppText>
              </AppText>
              <View
                style={[
                  styles.roundedInputShell,
                  focusedField === 'email' && styles.roundedInputShellFocused,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color={focusedField === 'email' ? COLORS.primary : '#94A3B8'}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.textInput, technicalText]}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="البريد الإلكتروني"
                  editable={!loading}
                />
              </View>
            </View>

            {/* 4. Password */}
            <View style={styles.inputGroup}>
              <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                كلمة المرور
              </AppText>
              <View
                style={[
                  styles.roundedInputShell,
                  focusedField === 'password' && styles.roundedInputShellFocused,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={focusedField === 'password' ? COLORS.primary : '#94A3B8'}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, technicalText]}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="كلمة المرور"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.trailingIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Confirm Password */}
            <View style={styles.inputGroup}>
              <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                تأكيد كلمة المرور
              </AppText>
              <View
                style={[
                  styles.roundedInputShell,
                  focusedField === 'confirmPassword' && styles.roundedInputShellFocused,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={focusedField === 'confirmPassword' ? COLORS.primary : '#94A3B8'}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Enter your password again"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.textInput, technicalText]}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="تأكيد كلمة المرور"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.trailingIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <Feather
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
                <AppText variant="caption" style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            ) : null}

            {/* Primary Navy CTA Button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={handleRegister}
                onPressIn={onPressInBtn}
                onPressOut={onPressOutBtn}
                disabled={loading}
                style={[styles.primaryNavyBtn, loading && { opacity: 0.7 }]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="إنشاء حساب"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText variant="button" style={styles.primaryNavyBtnText}>
                    إنشاء حساب
                  </AppText>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider "Or" */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText variant="caption" style={styles.dividerText}>
                أو
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign-in Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                onPress={() => handleSocialRegister('Google')}
                style={styles.socialBtn}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="إنشاء حساب باستخدام Google"
              >
                <FontAwesome name="google" size={18} color="#EA4335" />
                <AppText variant="bodyMedium" style={styles.socialBtnText}>
                  إنشاء حساب بواسطة Google
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialRegister('Apple')}
                style={styles.socialBtn}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="إنشاء حساب باستخدام Apple"
              >
                <FontAwesome name="apple" size={20} color="#000000" />
                <AppText variant="bodyMedium" style={styles.socialBtnText}>
                  إنشاء حساب بواسطة Apple
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Switch to Login Link */}
            <View
              style={[
                styles.switchScreenRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <AppText variant="body" style={styles.switchScreenPrompt}>
                لديك حساب بالفعل؟
              </AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={{ marginHorizontal: 4 }}
                activeOpacity={0.7}
                disabled={loading}
              >
                <AppText variant="button" style={styles.switchScreenLink}>
                  تسجيل الدخول
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure Clean White
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  circularBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCenter: {
    alignItems: 'center',
    gap: 6,
  },
  brandTitleText: {
    color: COLORS.primary,
    fontFamily: FONT_NAMES.Black,
    letterSpacing: 2,
    fontSize: 15,
  },
  loginHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loginHeaderText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_NAMES.Medium,
    fontSize: 12,
  },
  heroCarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  headerSection: {
    marginTop: 2,
  },
  titleText: {
    color: COLORS.primary, // #010736
    fontFamily: FONT_NAMES.Bold,
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 4,
  },
  subtitleText: {
    color: '#64748B',
    fontFamily: FONT_NAMES.Regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  formFields: {
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: '#1E293B',
    fontFamily: FONT_NAMES.Medium,
    fontSize: 13,
    marginBottom: 6,
  },
  roundedInputShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    height: 52,
  },
  roundedInputShellFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  leadingIcon: {
    marginHorizontal: 4,
  },
  trailingIconBtn: {
    padding: 6,
  },
  countryCodeBadge: {
    paddingRight: 8,
    marginRight: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    color: COLORS.primary,
    fontFamily: FONT_NAMES.Bold,
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontFamily: FONT_NAMES.Regular,
    fontSize: 15,
    paddingHorizontal: 4,
  },
  errorRow: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 6,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: FONT_NAMES.Regular,
    fontSize: 13,
  },
  primaryNavyBtn: {
    backgroundColor: COLORS.primary, // #010736 Deep Midnight Navy
    borderRadius: RADIUS.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.card,
  },
  primaryNavyBtnText: {
    color: '#FFFFFF',
    fontFamily: FONT_NAMES.Bold,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 13,
    marginHorizontal: 12,
  },
  socialButtonsContainer: {
    gap: 10,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  socialBtnText: {
    color: '#1E293B',
    fontFamily: FONT_NAMES.Medium,
    fontSize: 14,
  },
  switchScreenRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  switchScreenPrompt: {
    color: '#64748B',
    fontSize: 14,
  },
  switchScreenLink: {
    color: COLORS.primary,
    fontFamily: FONT_NAMES.Bold,
    fontSize: 14,
  },
});
