import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.glassCard}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.spinner}
          />
          <Text style={styles.message}>{message ?? 'Processing…'}</Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(14,14,14,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    glassCard: {
      width: '100%',
      maxWidth: 260,
      borderRadius: 24,
      paddingVertical: 28,
      paddingHorizontal: 24,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.26,
      shadowRadius: 24,
    },
    spinner: {
      marginBottom: 18,
    },
    message: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
  });

export default LoadingOverlay;
