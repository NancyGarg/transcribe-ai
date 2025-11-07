import React from 'react';
import { AppProvider } from './src/contexts';
import HomeScreen from './src/screens/HomeScreen';

function App() {
  return (
    <AppProvider>
      <HomeScreen />
    </AppProvider>
  );
}

export default App;
