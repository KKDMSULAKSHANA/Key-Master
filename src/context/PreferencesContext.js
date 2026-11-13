import { createContext, useContext, useState } from 'react';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [computerType, setComputerType] = useState('Windows');

  return (
    <PreferencesContext.Provider value={{ computerType, setComputerType }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}