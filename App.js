import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { PreferencesProvider, usePreferences } from './src/context/PreferencesContext';
import { ShortcutsProvider } from './src/context/ShortcutsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { resolvedMode, theme, isThemeLoading } = useTheme();
  const { onboardingCompleted, isPreferencesLoading } = usePreferences();

  if (isPreferencesLoading || isThemeLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator initialRouteName={onboardingCompleted ? 'MainTabs' : 'Onboarding'} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PreferencesProvider>
          <ShortcutsProvider>
            <AppContent />
          </ShortcutsProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
