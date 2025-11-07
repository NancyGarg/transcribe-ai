import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, ThemeProvider } from './src/contexts';
import HomeScreen from './src/screens/HomeScreen';
import { FloatingThemeToggle } from './src/components';

const AppContent: React.FC = () => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <HomeScreen />
        <FloatingThemeToggle />
      </View>
    </SafeAreaProvider>
  );
};

function App() {
  return (
    <ThemeProvider initialMode="system">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
