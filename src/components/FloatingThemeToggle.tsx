import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const FloatingThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = createStyles(theme, insets.bottom);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleTheme}
      activeOpacity={0.8}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
      accessibilityHint="Double tap to toggle between light and dark theme"
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme, bottomInset: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: Math.max(bottomInset, 20) + 10, // Account for safe area, minimum 30px from bottom
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8, // Android shadow
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      zIndex: 9999,
    },
    iconContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: 24,
    },
  });

export default FloatingThemeToggle;

