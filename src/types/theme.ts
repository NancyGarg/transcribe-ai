export type ThemeMode = 'light' | 'dark';

export interface Colors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  cardBackground: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryVariant: string;
  onPrimary: string;
  
  // Secondary colors
  secondary: string;
  secondaryVariant: string;
  onSecondary: string;
  
  // Accent colors
  accent: string;
  onAccent: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Border and divider
  border: string;
  divider: string;
  
  // Shadow
  shadow: string;

  // Speaker accents
  speaker1: string;
  speaker2: string;
  speaker3: string;
  speaker4: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: Colors;
}

