import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface HeaderProps {
  title?: string;
  showTitle?: boolean;
  canGoBack?: boolean;
  onBackPress?: () => void;
  rightActionIcon?: string;
  onRightActionPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showTitle, 
  canGoBack,
  onBackPress,
  rightActionIcon,
  onRightActionPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.sideContainer}>
          {canGoBack ? (
            <TouchableOpacity
              accessibilityLabel="Go back"
              onPress={onBackPress}
              style={styles.iconButton}
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      {showTitle &&  <View style={styles.titleContainer}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>}
        <View style={styles.sideContainerRight}>
          {rightActionIcon ? (
            <TouchableOpacity
              accessibilityLabel="Header action"
              onPress={onRightActionPress}
              style={styles.iconButton}
            >
              <MaterialIcons
                name={rightActionIcon}
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: theme.colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    sideContainer: {
      width: 48,
      alignItems: 'flex-start',
    },
    sideContainerRight: {
      width: 48,
      alignItems: 'flex-end',
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconPlaceholder: {
      width: 36,
      height: 36,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
  });

export default Header;
