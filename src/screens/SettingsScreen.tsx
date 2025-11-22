import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Theme, ThemeMode } from '../types';

const THEME_OPTIONS: Array<{
  label: string;
  value: ThemeMode | 'system';
  description: string;
}> = [
  {
    label: 'System default',
    value: 'system',
    description: 'Follow your device appearance settings.',
  },
  {
    label: 'Light',
    value: 'light',
    description: 'Use a light appearance across the app.',
  },
  {
    label: 'Dark',
    value: 'dark',
    description: 'Use a dark appearance across the app.',
  },
];

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, themePreference, setThemeMode, isDark } = useTheme();
  const { logout } = useAuth();

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <Text style={styles.sectionSubtitle}>
          Choose how TranscribeAi adapts its appearance across the app.
        </Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Dark mode</Text>
          <Switch
            value={themePreference === 'dark'}
            onValueChange={(value) =>
              setThemeMode(value ? 'dark' : 'light')
            }
            trackColor={{
              false: theme.colors.surfaceVariant,
              true: theme.colors.primary,
            }}
            thumbColor={themePreference === 'dark' ? theme.colors.onPrimary : theme.colors.text}
            ios_backgroundColor={theme.colors.surfaceVariant}
          />
        </View>
        <View style={styles.divider} />
        {THEME_OPTIONS.map((option) => {
          const selected = themePreference === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setThemeMode(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </TouchableOpacity>
          );
        })}
        <View style={styles.currentModeBanner}>
          <Text style={styles.currentModeText}>
            Currently using <Text style={styles.highlight}>{themeMode}</Text> mode
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="logout"
          size={20}
          color={theme.colors.error}
        />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
      gap: 24,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      gap: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 12,
    },
    optionSelected: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    optionContent: {
      flex: 1,
      gap: 4,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    optionLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    optionDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    radioSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    currentModeBanner: {
      marginTop: 4,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    currentModeText: {
      fontSize: 13,
      color: theme.colors.text,
      textAlign: 'center',
    },
    highlight: {
      fontWeight: '700',
      color: theme.colors.primary,
      textTransform: 'capitalize',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.error,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.error,
    },
  });

export default SettingsScreen;
