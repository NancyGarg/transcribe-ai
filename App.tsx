import React, { useMemo, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import {
  AppProvider,
  ThemeProvider,
  RecordingProvider,
  useTheme,
  useRecordingContext,
} from './src/contexts';
import {
  HomeScreen,
  SettingsScreen,
  LibraryScreen,
  RecordingDetailsScreen,
} from './src/screens';
import { RootStackParamList } from './src/navigation/types';
import Header from './src/components/Header';
import ConfirmModal from './src/components/modals/ConfirmModal';
import Toast from 'react-native-toast-message';
import { showSuccessToast, showErrorToast } from './src/services/toast';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

interface HeaderConfiguratorProps {
  title: string;
  hasDelete?: boolean;
}

const createScreenOptions = (
  theme: ReturnType<typeof useTheme>['theme'],
  navigationOptions?: HeaderConfiguratorProps
): NativeStackNavigationOptions => ({
  headerShown: true,
  header: ({ navigation, route }) => (
    <ScreenHeader
      title={navigationOptions?.title ?? route.name}
      navigation={navigation}
      route={route}
      hasDelete={navigationOptions?.hasDelete}
    />
  ),
  contentStyle: { backgroundColor: theme.colors.background },
});

const ScreenHeader: React.FC<{
  title: string;
  navigation: any;
  route: any;
  hasDelete?: boolean;
}> = ({ title, navigation, route, hasDelete }) => {
  const { deleteRecording } = useRecordingContext();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleDelete = async () => {
    const recordingId = route.params?.recordingId;
    if (!recordingId) {
      setConfirmVisible(false);
      return;
    }
    try {
      await deleteRecording(recordingId);
      showSuccessToast('Recording deleted');
      setConfirmVisible(false);
      navigation.goBack();
    } catch (error) {
      showErrorToast('Unable to delete recording');
    }
  };

  return (
    <>
      <Header
        title={title}
        canGoBack={navigation.canGoBack()}
        onBackPress={navigation.goBack}
        rightActionIcon={hasDelete ? 'delete-outline' : undefined}
        onRightActionPress={hasDelete ? () => setConfirmVisible(true) : undefined}
      />
      <ConfirmModal
        visible={confirmVisible}
        title="Delete recording"
        message="Are you sure you want to delete this recording? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
};

const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { deleteRecording } = useRecordingContext();

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    }),
    [theme]
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={createScreenOptions(theme, { title: 'Settings' })}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={createScreenOptions(theme, { title: 'Library' })}
        />
        <Stack.Screen
          name="RecordingDetails"
          component={RecordingDetailsScreen}
          options={createScreenOptions(theme, {
            title: 'Recording Details',
            hasDelete: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App() {
  return (
    <ThemeProvider initialMode="system">
      <AppProvider>
        <SafeAreaProvider>
          <RecordingProvider>
            <AppNavigator />
            <Toast />
          </RecordingProvider>
        </SafeAreaProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
