import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator();
const tabIcons = {
  Home: 'home-outline',
  Browse: 'search-outline',
  Practice: 'school-outline',
  Saved: 'bookmark-outline',
  Settings: 'settings-outline',
};

export function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          minHeight: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Settings" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}