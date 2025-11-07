import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your global state
interface AppState {
  // Add your global state properties here
  // Example: user: User | null;
  // Example: theme: 'light' | 'dark';
}

interface AppContextType {
  state: AppState;
  // Add your state update functions here
  // Example: setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    // Initialize your state here
  });

  // Add your state update functions here
  // Example:
  // const setUser = (user: User | null) => {
  //   setState(prev => ({ ...prev, user }));
  // };

  const value: AppContextType = {
    state,
    // Add your functions to the value object
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

