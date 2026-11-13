import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ShortcutDetailsScreen } from '../screens/ShortcutDetailsScreen';
import { AddEditShortcutScreen } from '../screens/AddEditShortcutScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { QuizResultScreen } from '../screens/QuizResultScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { HelpAboutScreen } from '../screens/HelpAboutScreen';
import { FlashcardsScreen } from '../screens/FlashcardsScreen';
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
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Practice quiz' }} />
        <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ title: 'Quiz result' }} />
        <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{ title: 'Flashcards' }} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="HelpAbout" component={HelpAboutScreen} options={{ title: 'Help and about' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}