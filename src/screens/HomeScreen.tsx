import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const HomeScreen: React.FC = () => {
  const { state } = useAppContext();
  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <Text style={styles.title}>Hello World</Text>
      <Text style={styles.subtitle}>App is ready with state management</Text>
      <Text style={styles.themeText}>Current theme: {theme.mode}</Text>
      <Text style={styles.hintText}>
        Use the floating button to toggle theme
      </Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    themeText: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      marginBottom: 16,
    },
    hintText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 8,
      fontStyle: 'italic',
    },
  });

export default HomeScreen;

