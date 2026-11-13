import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const destinations = {
  Onboarding: [{ label: 'Continue to KeyMaster', screen: 'MainTabs' }],
  Home: [
    { label: 'Browse shortcuts', screen: 'Browse' },
    { label: 'Open a shortcut', screen: 'Details' },
    { label: 'Add a shortcut', screen: 'AddEditShortcut' },
    { label: 'View progress', screen: 'Progress' },
    { label: 'Help and about', screen: 'HelpAbout' },
  ],
  Browse: [{ label: 'Open a shortcut', screen: 'Details' }],
  Practice: [
    { label: 'Start a quiz', screen: 'Quiz' },
    { label: 'Open flashcards', screen: 'Flashcards' },
    { label: 'View progress', screen: 'Progress' },
  ],
  Settings: [
    { label: 'My progress', screen: 'Progress' },
    { label: 'Help and about', screen: 'HelpAbout' },
  ],
};

export function PlaceholderScreen({ route, navigation, title }) {
  const { theme } = useTheme();
  const screenTitle = title ?? route?.params?.title ?? route?.name ?? 'KeyMaster';
  const actions = destinations[route?.name] ?? [];

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {screenTitle}
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Your offline keyboard shortcut guide.
        </Text>
        {actions.map((action) => (
          <Pressable
            key={action.screen}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => navigation.navigate(action.screen)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  panel: {
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 640,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    fontSize: typography.size.heading,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.regular,
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    fontSize: typography.size.regular,
    fontWeight: typography.weight.semibold,
  },
});