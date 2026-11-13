import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

export function EmptyState({ icon = 'search-outline', title, message, actionLabel, onAction }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={36} color={theme.muted} />
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{title}</Text>
      {!!message && <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>}
      {!!actionLabel && !!onAction && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={[styles.button, { borderColor: theme.primary }]}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  button: { alignItems: 'center', borderRadius: 10, borderWidth: 1, justifyContent: 'center', marginTop: 4, minHeight: 46, paddingHorizontal: 16 },
  buttonText: { fontSize: 14, fontWeight: '600' },
});
