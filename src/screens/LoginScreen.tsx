import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const LoginScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { login } = useAuth();
  const styles = createStyles(theme);

  const handleLogin = () => {
    // Dummy login - just set authenticated state
    login();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons
            name="mic"
            size={64}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.title}>Transcribe AI</Text>
          <Text style={styles.subtitle}>
            Sign in to start recording and transcribing your audio
          </Text>
        </View>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="login"
            size={20}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.signInButtonText}>Login with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      gap: 48,
    },
    header: {
      alignItems: 'center',
      gap: 16,
    },
    icon: {
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 16,
    },
    signInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      gap: 12,
      minWidth: 200,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    signInButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

export default LoginScreen;

