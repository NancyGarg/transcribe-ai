import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonLabel, styles.cancelLabel]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonLabel, styles.confirmLabel]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 24,
      gap: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    message: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    cancelLabel: {
      color: theme.colors.text,
    },
    confirmLabel: {
      color: theme.colors.onPrimary,
    },
  });

export default ConfirmModal;
