import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

export const showToast = (
  type: ToastType,
  title: string,
  message?: string
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showSuccessToast = (title: string, message?: string) =>
  showToast('success', title, message);

export const showErrorToast = (title: string, message?: string) =>
  showToast('error', title, message);

export const showInfoToast = (title: string, message?: string) =>
  showToast('info', title, message);
