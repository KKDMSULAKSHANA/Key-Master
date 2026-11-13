import { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const resolvedMode = themeMode === 'system' ? systemScheme ?? 'light' : themeMode;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme: colors[resolvedMode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}