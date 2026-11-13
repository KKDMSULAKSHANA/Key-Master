import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ShortcutDetailsScreen } from '../screens/ShortcutDetailsScreen';
import { AddEditShortcutScreen } from '../screens/AddEditShortcutScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

export function AppNavigator({ initialRouteName = 'Onboarding' }) {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          contentStyle: { backgroundColor: theme.background },
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={ShortcutDetailsScreen} options={{ title: 'Shortcut details' }} />
        <Stack.Screen name="AddEditShortcut" component={AddEditShortcutScreen} options={{ title: 'Add shortcut' }} />
        <Stack.Screen name="Quiz" component={PlaceholderScreen} />
        <Stack.Screen name="QuizResult" component={PlaceholderScreen} options={{ title: 'Quiz result' }} />
        <Stack.Screen name="Flashcards" component={PlaceholderScreen} />
        <Stack.Screen name="Progress" component={PlaceholderScreen} />
        <Stack.Screen name="HelpAbout" component={PlaceholderScreen} options={{ title: 'Help and about' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}