import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { KeyCaps } from './KeyCaps';

export function ShortcutCard({ shortcut, system = 'Windows', onPress, isFavorite = false }) {
  const { theme } = useTheme();
  const keyField = system === 'macOS' ? 'mac' : system === 'Linux' ? 'linux' : 'windows';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shortcut.title}, ${shortcut.app}. Open shortcut details.`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>{shortcut.title}</Text>
          <Text numberOfLines={1} style={[styles.meta, { color: theme.muted }]}>{shortcut.app} · {shortcut.category}</Text>
        </View>
        {isFavorite && <Ionicons accessibilityLabel="Favorite" name="bookmark" size={18} color={theme.accent} />}
      </View>
      <KeyCaps keys={shortcut[keyField]} system={system} />
      <Text numberOfLines={2} style={[styles.description, { color: theme.muted }]}>{shortcut.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  titleBlock: { flex: 1, gap: 4 },
  title: { fontSize: typography.size.regular, fontWeight: typography.weight.semibold, lineHeight: 21 },
  meta: { fontSize: typography.size.small },
  description: { fontSize: typography.size.body, lineHeight: 19 },
});
