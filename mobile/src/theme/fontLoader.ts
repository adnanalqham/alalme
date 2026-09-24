import { useFonts } from 'expo-font';
import * as Font from 'expo-font';
import { FONT_NAMES } from './typography';

/**
 * Thmanyah Sans OTF Font Mapping for React Native / Expo
 * Resolves to the 5 OTF font binaries located in mobile/assets/fonts/
 */
export const FONT_MAP = {
  [FONT_NAMES.Light]: require('../../assets/fonts/ThmanyahSans-Light.otf'),
  [FONT_NAMES.Regular]: require('../../assets/fonts/ThmanyahSans-Regular.otf'),
  [FONT_NAMES.Medium]: require('../../assets/fonts/ThmanyahSans-Medium.otf'),
  [FONT_NAMES.Bold]: require('../../assets/fonts/ThmanyahSans-Bold.otf'),
  [FONT_NAMES.Black]: require('../../assets/fonts/ThmanyahSans-Black.otf'),
};

/**
 * useAppFonts
 * Loads Thmanyah Sans OTF fonts via expo-font hook.
 * Returns true only after all 5 weights are loaded and ready in memory.
 * No arbitrary timeout fallback to ensure system font is never flashed.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(FONT_MAP);

  if (error) {
    console.error('[Typography] Fatal error loading Thmanyah Sans fonts:', error);
  }

  return loaded;
}

/**
 * Synchronously checks if all Thmanyah Sans font variants are loaded in runtime.
 */
export function areThmanyahFontsLoaded(): boolean {
  return (
    Font.isLoaded(FONT_NAMES.Light) &&
    Font.isLoaded(FONT_NAMES.Regular) &&
    Font.isLoaded(FONT_NAMES.Medium) &&
    Font.isLoaded(FONT_NAMES.Bold) &&
    Font.isLoaded(FONT_NAMES.Black)
  );
}

/**
 * Returns all currently loaded fonts via expo-font
 */
export function getLoadedFontList(): string[] {
  try {
    return Font.getLoadedFonts();
  } catch (e) {
    return [];
  }
}
