import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import {
  AppProvider,
  ThemeProvider,
  RecordingProvider,
  useTheme,
  useRecordingContext,
} from './src/contexts';
import { HomeScreen, SettingsScreen, LibraryScreen, RecordingDetailsScreen } from './src/screens';
import { RootStackParamList } from './src/navigation/types';
import Header from './src/components/Header';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }) => ({
            headerShown: true,
            header: () => (
              <Header
                title="Settings"
                canGoBack={navigation.canGoBack()}
                onBackPress={navigation.goBack}
              />
            ),
          })}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={({ navigation }) => ({
            headerShown: true,
            header: () => (
              <Header
                title="Library"
                canGoBack={navigation.canGoBack()}
                onBackPress={navigation.goBack}
              />
            ),
          })}
        />
        <Stack.Screen
          name="RecordingDetails"
          component={RecordingDetailsScreen}
          options={({ navigation, route }) => ({
            headerShown: true,
            header: () => (
              <Header
                title="Recording Details"
                canGoBack={navigation.canGoBack()}
                onBackPress={navigation.goBack}
                rightActionIcon="delete-outline"
                onRightActionPress={async () => {
                  await deleteRecording(route.params.recordingId);
                  navigation.goBack();
                }}
              />
            ),
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
          </RecordingProvider>
        </SafeAreaProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
