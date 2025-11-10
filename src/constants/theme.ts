import { Colors, Theme } from '../types/theme';

// Light theme colors
export const lightColors: Colors = {
  // Background colors
  background: '#F5F5F0', // Beige/off-white to match design
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  cardBackground: '#EDEDE3',
  
  // Text colors
  text: '#1F251A',
  textSecondary: '#666B61',
  textTertiary: '#999999',
  
  // Primary colors
  primary: '#3ABA16',
  primaryVariant: '#0051D5',
  onPrimary: '#FFFFFF',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryVariant: '#3634A3',
  onSecondary: '#FFFFFF',
  
  // Accent colors
  accent: '#FF9500',
  onAccent: '#FFFFFF',
  
  // Status colors
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  
  // Border and divider
  border: '#E0E0E0',
  divider: '#D0D0D0',
  
  // Shadow
  shadow: '#000000',

  // Speaker accents
  speaker1: '#3ABA16',
  speaker2: '#5856D6',
  speaker3: '#FF9500',
  speaker4: '#FF3B30',
};

// Dark theme colors
export const darkColors: Colors = {
  // Background colors
  background: '#1A1A1A', // Dark gray instead of pure black for better contrast
  surface: '#2C2C2E',
  surfaceVariant: '#3A3A3C',
  cardBackground:'#ffffff30',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#EBEBF599',
  
  // Primary colors
  primary: '#3ABA16',
  primaryVariant: '#409CFF',
  onPrimary: '#2C2C2E',
  
  // Secondary colors
  secondary: '#5E5CE6',
  secondaryVariant: '#7D7AFF',
  onSecondary: '#FFFFFF',
  
  // Accent colors
  accent: '#FF9F0A',
  onAccent: '#000000',
  
  // Status colors
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  info: '#64D2FF',
  
  // Border and divider
  border: '#38383A',
  divider: '#48484A',
  
  // Shadow
  shadow: '#000000',

  // Speaker accents
  speaker1: '#3ADA56',
  speaker2: '#7D7AFF',
  speaker3: '#FFB357',
  speaker4: '#FF5E57',
};

// Light theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
};

// Dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
};

// Export theme mapping
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

