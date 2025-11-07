import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const FloatingThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = createStyles(theme, insets.top);

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

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: Math.max(topInset, 20) + 19, // Account for safe area, minimum 30px from bottom
      right: 70,
      width: 24,
      height: 24,
      borderRadius: 12,
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
      fontSize: 10,
    },
  });

export default FloatingThemeToggle;

