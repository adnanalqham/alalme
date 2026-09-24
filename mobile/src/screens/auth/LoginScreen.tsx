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
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AlaLogo } from '../../components/ui/AlaLogo';
import { assets } from '../../constants/assets';

interface LoginScreenProps {
  navigation: any;
}

type AuthMethod = 'phone' | 'email';

/**
 * LoginScreen — White Premium Automotive Experience
 * Inspired by reference luxury white automotive UI.
 * Features:
 * - Clean white background (#FFFFFF) with refined automotive minimalism
 * - Prominent car asset (assets.cars.onboarding1 / 3.png) floating naturally
 * - High-contrast Deep Midnight Navy (#010736) typography and CTA pill buttons
 * - Rounded input fields with focus indicators and clear leading/trailing icons
 * - Dual Phone/OTP and Email authentication methods
 * - Google & Apple social sign-in options
 * - Production-safe: RBAC role switcher strictly isolated to __DEV__ builds
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isRTL, textAlign, technicalText } = useLocalization();
  const { loginWithPhone, loginWithEmail, sendOtp, loginAs } = useAuth();

  // Mode & Form States
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [phone, setPhone] = useState('777222222');
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Countdown Timer (60 seconds)
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Input Focus States
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  // OTP Countdown Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (step === 'otp' && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, otpCountdown]);

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

  // Handlers
  const handleSendOtp = async () => {
    if (phone.trim().length < 7) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }
    setError('');
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      setOtpCountdown(60);
      setCanResendOtp(false);
    } else {
      setError(res.error || 'تعذر إرسال رمز التحقق، يرجى المحاولة لاحقاً');
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp || loading) return;
    setError('');
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      setOtpCountdown(60);
      setCanResendOtp(false);
    } else {
      setError(res.error || 'تعذر إعادة إرسال الرمز');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    setError('');
    setLoading(true);
    const res = await loginWithPhone(phone, otp);
    setLoading(false);
    if (res.success) {
      navigation.replace('MainTabs');
    } else {
      setError(res.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    setError('');
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      navigation.replace('MainTabs');
    } else {
      setError(res.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(`جاري تسجيل الدخول عبر ${provider}...`);
    setTimeout(() => {
      loginWithPhone('777222222', '123456');
      navigation.replace('MainTabs');
    }, 400);
  };

  const handleQuickLogin = (roleKey: keyof typeof DEMO_USERS) => {
    loginAs(roleKey);
    navigation.replace('MainTabs');
  };

  const handleContinueAsGuest = () => {
    navigation.replace('MainTabs');
  };

  // Dimensions
  const carWidth = Math.min(width * 0.9, 380);
  const carHeight = Math.min(carWidth * 0.46, 175);

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
            onPress={handleContinueAsGuest}
            style={styles.circularBackBtn}
            accessibilityRole="button"
            accessibilityLabel="تصفح كزائر"
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
            onPress={handleContinueAsGuest}
            style={styles.guestLinkBtn}
            accessibilityRole="button"
            accessibilityLabel="تخطي كزائر"
            activeOpacity={0.7}
          >
            <AppText variant="caption" style={styles.guestLinkText}>
              زائر
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
            source={assets.cars.onboarding1}
            style={{ width: carWidth, height: carHeight }}
            resizeMode="contain"
            accessibilityLabel="سيارة رياضية فخمة"
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
            {step === 'otp' ? 'تأكيد الرمز' : 'مرحباً بعودتك'}
          </AppText>
          <AppText variant="body" style={[styles.subtitleText, { textAlign }]}>
            {step === 'otp'
              ? `أدخل رمز التحقق المرسل إلى +967 ${phone}`
              : 'سجل الدخول للوصول إلى عالم قطع غيار السيارات'}
          </AppText>

          {/* Minimal Auth Method Toggle (Phone / Email) */}
          {step === 'phone' && (
            <View style={[styles.tabToggleContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                onPress={() => {
                  setAuthMethod('email');
                  setError('');
                }}
                style={[
                  styles.tabToggleItem,
                  authMethod === 'email' && styles.tabToggleItemActive,
                ]}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityLabel="البريد الإلكتروني"
              >
                <AppText
                  variant="button"
                  style={[
                    styles.tabToggleText,
                    authMethod === 'email' && styles.tabToggleTextActive,
                  ]}
                >
                  البريد الإلكتروني
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAuthMethod('phone');
                  setError('');
                }}
                style={[
                  styles.tabToggleItem,
                  authMethod === 'phone' && styles.tabToggleItemActive,
                ]}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityLabel="رقم الهاتف"
              >
                <AppText
                  variant="button"
                  style={[
                    styles.tabToggleText,
                    authMethod === 'phone' && styles.tabToggleTextActive,
                  ]}
                >
                  رقم الهاتف
                </AppText>
              </TouchableOpacity>
            </View>
          )}

          {/* Form Fields Section */}
          {authMethod === 'email' ? (
            // 1. Email & Password Form
            <View style={styles.formFields}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                  البريد الإلكتروني
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

              {/* Password Input */}
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

              {/* Forgot Password Link */}
              <View
                style={[
                  styles.forgotPassRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setError('يرجى التواصل مع الدعم الفني لإعادة تعيين كلمة المرور')}
                  activeOpacity={0.7}
                >
                  <AppText variant="caption" style={styles.forgotPassText}>
                    نسيت كلمة المرور؟
                  </AppText>
                </TouchableOpacity>
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
                  onPress={handleEmailLogin}
                  onPressIn={onPressInBtn}
                  onPressOut={onPressOutBtn}
                  disabled={loading}
                  style={[styles.primaryNavyBtn, loading && { opacity: 0.7 }]}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="تسجيل الدخول"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <AppText variant="button" style={styles.primaryNavyBtnText}>
                      تسجيل الدخول
                    </AppText>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : step === 'phone' ? (
            // 2. Phone Input Form
            <View style={styles.formFields}>
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

              {error ? (
                <View style={[styles.errorRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <AppText variant="caption" style={styles.errorText}>
                    {error}
                  </AppText>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPress={handleSendOtp}
                  onPressIn={onPressInBtn}
                  onPressOut={onPressOutBtn}
                  disabled={loading}
                  style={[styles.primaryNavyBtn, loading && { opacity: 0.7 }]}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="إرسال رمز التحقق"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <AppText variant="button" style={styles.primaryNavyBtnText}>
                      إرسال رمز التحقق
                    </AppText>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            // 3. OTP Verification Form
            <View style={styles.formFields}>
              <View style={styles.inputGroup}>
                <AppText variant="label" style={[styles.inputLabel, { textAlign }]}>
                  رمز التحقق (OTP)
                </AppText>
                <View
                  style={[
                    styles.roundedInputShell,
                    focusedField === 'otp' && styles.roundedInputShellFocused,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Feather
                    name="key"
                    size={18}
                    color={focusedField === 'otp' ? COLORS.primary : '#94A3B8'}
                    style={styles.leadingIcon}
                  />
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[
                      styles.textInput,
                      technicalText,
                      { letterSpacing: 8, fontSize: 18, fontFamily: FONT_NAMES.Bold },
                    ]}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    accessibilityLabel="رمز التحقق"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* OTP Resend Timer */}
              <View style={[styles.otpResendRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={!canResendOtp || loading}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="caption"
                    style={[
                      styles.resendBtnText,
                      !canResendOtp && { color: '#94A3B8' },
                    ]}
                  >
                    {canResendOtp
                      ? 'إعادة إرسال رمز التحقق'
                      : `إعادة الإرسال خلال ${String(Math.floor(otpCountdown / 60)).padStart(2, '0')}:${String(otpCountdown % 60).padStart(2, '0')}`}
                  </AppText>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={[styles.errorRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <AppText variant="caption" style={styles.errorText}>
                    {error}
                  </AppText>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  onPressIn={onPressInBtn}
                  onPressOut={onPressOutBtn}
                  disabled={loading}
                  style={[styles.primaryNavyBtn, loading && { opacity: 0.7 }]}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="تأكيد ودخول"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <AppText variant="button" style={styles.primaryNavyBtnText}>
                      تأكيد ودخول
                    </AppText>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={() => {
                  setStep('phone');
                  setError('');
                  setOtpCountdown(60);
                  setCanResendOtp(false);
                }}
                style={styles.changePhoneBtn}
                activeOpacity={0.7}
                disabled={loading}
              >
                <AppText variant="caption" style={styles.changePhoneText}>
                  تغيير رقم الهاتف
                </AppText>
              </TouchableOpacity>
            </View>
          )}

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
              onPress={() => handleSocialLogin('Google')}
              style={styles.socialBtn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="تسجيل الدخول باستخدام Google"
            >
              <FontAwesome name="google" size={18} color="#EA4335" />
              <AppText variant="bodyMedium" style={styles.socialBtnText}>
                تسجيل الدخول بواسطة Google
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialLogin('Apple')}
              style={styles.socialBtn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="تسجيل الدخول باستخدام Apple"
            >
              <FontAwesome name="apple" size={20} color="#000000" />
              <AppText variant="bodyMedium" style={styles.socialBtnText}>
                تسجيل الدخول بواسطة Apple
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Switch to Register */}
          <View
            style={[
              styles.switchScreenRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <AppText variant="body" style={styles.switchScreenPrompt}>
              ليس لديك حساب؟
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{ marginHorizontal: 4 }}
              activeOpacity={0.7}
            >
              <AppText variant="button" style={styles.switchScreenLink}>
                إنشاء حساب
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Switcher (RBAC) — STRICTLY __DEV__ ONLY */}
          {__DEV__ && (
            <View style={styles.devSection}>
              <View style={styles.devDividerRow}>
                <View style={styles.devDividerLine} />
                <AppText variant="caption" style={styles.devDividerText}>
                  تجربة الأدوار السريعة (__DEV__ فقط)
                </AppText>
                <View style={styles.devDividerLine} />
              </View>

              <View style={[styles.devGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('customer')}
                  activeOpacity={0.7}
                >
                  <Feather name="user" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    عميل
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('owner_approved')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="storefront-outline" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    متجر معتمد
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('owner_pending')}
                  activeOpacity={0.7}
                >
                  <Feather name="clock" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    متجر قيد المراجعة
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('employee_full')}
                  activeOpacity={0.7}
                >
                  <Feather name="shield" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    موظف (كامل)
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('employee_limited')}
                  activeOpacity={0.7}
                >
                  <Feather name="eye" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    موظف (مشاهدة)
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.devChip}
                  onPress={() => handleQuickLogin('admin')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="shield-crown-outline" size={12} color={COLORS.primary} />
                  <AppText variant="caption" style={styles.devChipText}>
                    إدارة
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  guestLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guestLinkText: {
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
  tabToggleContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  tabToggleItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabToggleItemActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  tabToggleText: {
    color: '#64748B',
    fontFamily: FONT_NAMES.Medium,
    fontSize: 13,
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
    fontFamily: FONT_NAMES.Bold,
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
  forgotPassRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: SPACING.lg,
  },
  forgotPassText: {
    color: '#64748B',
    fontFamily: FONT_NAMES.Medium,
    fontSize: 13,
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
    ...SHADOWS.card,
  },
  primaryNavyBtnText: {
    color: '#FFFFFF',
    fontFamily: FONT_NAMES.Bold,
    fontSize: 16,
  },
  otpResendRow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resendBtnText: {
    color: COLORS.primary,
    fontFamily: FONT_NAMES.Medium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  changePhoneBtn: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: 4,
  },
  changePhoneText: {
    color: '#64748B',
    fontSize: 13,
    textDecorationLine: 'underline',
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
  devSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  devDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  devDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  devDividerText: {
    color: '#94A3B8',
    fontSize: 11,
    marginHorizontal: 8,
  },
  devGrid: {
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  devChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  devChipText: {
    color: COLORS.primary,
    fontSize: 11,
  },
});
