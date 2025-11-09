import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeMode } from '../types/theme';
import { themes } from '../constants/theme';

interface ThemeContextType {
  theme: Theme;
  /** Resolved theme mode after considering system preference */
  themeMode: ThemeMode;
  /** User-selected preference (light, dark, or system) */
  themePreference: ThemeMode | 'system';
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode | 'system';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
}) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemeMode | 'system'>(
    initialMode
  );

  // Determine the actual theme mode (system, light, or dark)
  const actualThemeMode: ThemeMode =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  // Get the current theme based on the mode
  const theme = themes[actualThemeMode];

  // Update theme when system color scheme changes (if mode is 'system')
  useEffect(() => {
    if (themePreference === 'system') {
      // Theme will automatically update when systemColorScheme changes
    }
  }, [systemColorScheme, themePreference]);

  const toggleTheme = useCallback(() => {
    setThemePreference((prev) => {
      if (prev === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  }, [systemColorScheme]);

  const setThemeMode = useCallback((mode: ThemeMode | 'system') => {
    setThemePreference(mode);
  }, []);

  const value: ThemeContextType = useMemo(
    () => ({
      theme,
      themeMode: actualThemeMode,
      themePreference,
      toggleTheme,
      setThemeMode,
      isDark: actualThemeMode === 'dark',
    }),
    [theme, actualThemeMode, themePreference, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

