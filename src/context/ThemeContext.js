import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { STORAGE_KEYS } from '../storage/keys';
import { readStorage, writeStorage } from '../storage/storage';

const ThemeContext = createContext(null);
const validModes = new Set(['system', 'light', 'dark']);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const resolvedMode = themeMode === 'system' ? systemScheme ?? 'light' : themeMode;

  useEffect(() => {
    let active = true;
    async function loadTheme() {
      const savedMode = await readStorage(STORAGE_KEYS.THEME, 'system');
      if (!active) return;
      setThemeMode(validModes.has(savedMode) ? savedMode : 'system');
      setIsThemeLoading(false);
    }
    void loadTheme();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isThemeLoading) void writeStorage(STORAGE_KEYS.THEME, themeMode);
  }, [isThemeLoading, themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedMode, theme: colors[resolvedMode], isThemeLoading }}>
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