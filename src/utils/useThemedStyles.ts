import { StyleSheet, StyleSheetProperties } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

/**
 * Hook to create themed styles
 * @param styleCreator - A function that takes a theme and returns a StyleSheet
 * @returns The StyleSheet created with the current theme
 * 
 * @example
 * const styles = useThemedStyles((theme) =>
 *   StyleSheet.create({
 *     container: {
 *       backgroundColor: theme.colors.background,
 *       padding: 16,
 *     },
 *     text: {
 *       color: theme.colors.text,
 *     },
 *   })
 * );
 */
export const useThemedStyles = <T extends ReturnType<typeof StyleSheet.create>>(
  styleCreator: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return styleCreator(theme);
};

