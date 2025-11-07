import { Colors, Theme } from '../types/theme';

// Light theme colors
export const lightColors: Colors = {
  // Background colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E0E0E0',
  
  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Primary colors
  primary: '#007AFF',
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
};

// Dark theme colors
export const darkColors: Colors = {
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#EBEBF599',
  
  // Primary colors
  primary: '#0A84FF',
  primaryVariant: '#409CFF',
  onPrimary: '#FFFFFF',
  
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

