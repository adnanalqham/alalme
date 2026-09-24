import React from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, useAppFonts } from './src/theme';
import { LocalizationProvider, useLocalization } from './src/localization';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './src/services/tokenCache';

declare const process: { env: Record<string, string | undefined> };

const CLERK_PUBLISHABLE_KEY =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) ||
  'pk_test_bXV0dWFsLWNoYW1vaXMtOTU0Ny5jbGVyay5hY2NvdW50cy5kZXYk';

// Auth Screens
import { SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen } from './src/screens/auth';

// Customer Screens
import { HomeScreen } from './src/screens/customer/HomeScreen';
import { CategoriesScreen } from './src/screens/customer/CategoriesScreen';
import { VehicleSelectScreen } from './src/screens/customer/VehicleSelectScreen';
import { SearchScreen } from './src/screens/customer/SearchScreen';
import { ProductDetailsScreen } from './src/screens/customer/ProductDetailsScreen';
import { CartScreen } from './src/screens/customer/CartScreen';
import { OrdersScreen } from './src/screens/customer/OrdersScreen';
import { ProfileScreen } from './src/screens/customer/ProfileScreen';

// Shop Screens
import {
  ShopDashboardScreen,
  ShopProductsScreen,
  ShopInventoryScreen,
  ShopOrdersScreen,
  ShopMoreScreen,
  PendingApprovalScreen,
} from './src/screens/shop';

// Admin Screens
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * MainTabs — Unified Role-Based Bottom Navigation
 * Resolves dynamically by user experience and granular permissions:
 * - Shop Owner Pending: Pending Approval Status Screen
 * - Shop Owner Approved: المتجر (Dashboard), الطلبات (Orders), المنتجات (Products), المخزون (Inventory), المزيد (More)
 * - Shop Employee: Dynamic tabs based on granted permissions + المزيد (More)
 * - Admin: Admin Dashboard + Management Tabs
 * - Customer & Guest: الرئيسية (Home), البحث (Search), السيارة (Garage), الطلبات (Orders), حسابي (Profile)
 */
const MainTabs = () => {
  const { isRTL } = useLocalization();
  const { experience, hasPermission } = useAuth();
  const insets = useSafeAreaInsets();

  const tabNavigatorOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.white,
      borderTopColor: COLORS.borderLight,
      borderTopWidth: 1,
      height: 56 + insets.bottom,
      paddingBottom: Math.max(insets.bottom, 6),
      paddingTop: 6,
    },
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textMuted,
    tabBarLabelStyle: {
      ...TYPOGRAPHY.captionBold,
      fontSize: 11,
    },
  };

  // 1. SHOP OWNER PENDING APPROVAL
  if (experience === 'SHOP_OWNER_PENDING') {
    return <PendingApprovalScreen />;
  }

  // 2. SHOP OWNER APPROVED NAVIGATION (Strict 5 items)
  if (experience === 'SHOP_OWNER_APPROVED') {
    return (
      <Tab.Navigator id="shop-owner-tabs" screenOptions={tabNavigatorOptions}>
        <Tab.Screen
          name="ShopHomeTab"
          component={ShopDashboardScreen}
          options={{
            tabBarLabel: isRTL ? 'المتجر' : 'Shop',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="storefront-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ShopOrdersTab"
          component={ShopOrdersScreen}
          options={{
            tabBarLabel: isRTL ? 'الطلبات' : 'Orders',
            tabBarIcon: ({ color, size }) => (
              <Feather name="shopping-bag" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ShopProductsTab"
          component={ShopProductsScreen}
          options={{
            tabBarLabel: isRTL ? 'المنتجات' : 'Products',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="tag-multiple-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ShopInventoryTab"
          component={ShopInventoryScreen}
          options={{
            tabBarLabel: isRTL ? 'المخزون' : 'Inventory',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="archive-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ShopMoreTab"
          component={ShopMoreScreen}
          options={{
            tabBarLabel: isRTL ? 'المزيد' : 'More',
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 3. SHOP EMPLOYEE DYNAMIC NAVIGATION (Filtered by permissions, max 5 items)
  if (experience === 'SHOP_EMPLOYEE') {
    return (
      <Tab.Navigator id="shop-employee-tabs" screenOptions={tabNavigatorOptions}>
        <Tab.Screen
          name="ShopHomeTab"
          component={ShopDashboardScreen}
          options={{
            tabBarLabel: isRTL ? 'الرئيسية' : 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
            ),
          }}
        />
        {hasPermission('orders.view') && (
          <Tab.Screen
            name="ShopOrdersTab"
            component={ShopOrdersScreen}
            options={{
              tabBarLabel: isRTL ? 'الطلبات' : 'Orders',
              tabBarIcon: ({ color, size }) => (
                <Feather name="shopping-bag" color={color} size={size} />
              ),
            }}
          />
        )}
        {hasPermission('products.view') && (
          <Tab.Screen
            name="ShopProductsTab"
            component={ShopProductsScreen}
            options={{
              tabBarLabel: isRTL ? 'المنتجات' : 'Products',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="tag-multiple-outline" color={color} size={size} />
              ),
            }}
          />
        )}
        {hasPermission('inventory.view') && (
          <Tab.Screen
            name="ShopInventoryTab"
            component={ShopInventoryScreen}
            options={{
              tabBarLabel: isRTL ? 'المخزون' : 'Inventory',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="archive-outline" color={color} size={size} />
              ),
            }}
          />
        )}
        <Tab.Screen
          name="ShopMoreTab"
          component={ShopMoreScreen}
          options={{
            tabBarLabel: isRTL ? 'المزيد' : 'More',
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 4. ADMIN NAVIGATION
  if (experience === 'ADMIN') {
    return (
      <Tab.Navigator id="admin-tabs" screenOptions={tabNavigatorOptions}>
        <Tab.Screen
          name="AdminHomeTab"
          component={AdminDashboardScreen}
          options={{
            tabBarLabel: isRTL ? 'الإدارة' : 'Admin',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="shield-crown-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MarketplaceTab"
          component={HomeScreen}
          options={{
            tabBarLabel: isRTL ? 'السوق' : 'Marketplace',
            tabBarIcon: ({ color, size }) => (
              <Feather name="shopping-bag" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            tabBarLabel: isRTL ? 'البحث' : 'Search',
            tabBarIcon: ({ color, size }) => (
              <Feather name="search" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AdminProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: isRTL ? 'حسابي' : 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 5. CUSTOMER & GUEST NAVIGATION (Strict 5 items)
  return (
    <Tab.Navigator id="customer-bottom-tabs" screenOptions={tabNavigatorOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: isRTL ? 'الرئيسية' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: isRTL ? 'البحث' : 'Search',
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="VehicleTab"
        component={VehicleSelectScreen}
        options={{
          tabBarLabel: isRTL ? 'السيارة' : 'My Car',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car-cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: isRTL ? 'الطلبات' : 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: isRTL ? 'حسابي' : 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigation Stack Container
const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root-stack"
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="VehicleSelect" component={VehicleSelectScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Shop Stack Screens */}
        <Stack.Screen name="ShopDashboard" component={ShopDashboardScreen} />
        <Stack.Screen name="ShopProducts" component={ShopProductsScreen} />
        <Stack.Screen name="ShopInventory" component={ShopInventoryScreen} />
        <Stack.Screen name="ShopOrders" component={ShopOrdersScreen} />
        <Stack.Screen name="ShopMore" component={ShopMoreScreen} />
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />

        {/* Admin Stack Screens */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <LocalizationProvider>
          <AuthProvider>
            <AppProvider>
              <View style={styles.root}>
                <AppNavigation />
              </View>
            </AppProvider>
          </AuthProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
