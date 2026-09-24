/**
 * Centralized Asset Registry for ALA Mobile Application
 * Avoids repetitive inline require statements across screens and components.
 */
export const assets = {
  logo: require('../../assets/images/logo/logo.png'),
  cars: {
    onboarding1: require('../../assets/images/cars/3.png'),
    onboarding2: require('../../assets/images/cars/4.png'),
  },
};

// Backward-compatible alias for existing screens
export const onboardingImages = {
  first: assets.cars.onboarding1,
  second: assets.cars.onboarding2,
};
