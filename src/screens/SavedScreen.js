import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ShortcutCard } from '../components/ShortcutCard';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { playSelectionHaptic } from '../utils/haptics';
import { spacing } from '../theme/spacing';

export function SavedScreen({ navigation }) {
  const { theme } = useTheme();
  const { computerType, hapticsEnabled } = usePreferences();
  const { shortcuts, favorites, learned, toggleFavorite, setShortcutLearned, isLoading } = useShortcuts();
  const [segment, setSegment] = useState('Favorites');
  const [undoMessage, setUndoMessage] = useState('');
  const [lastRemoved, setLastRemoved] = useState(null);

  const rows = useMemo(() => {
    const ids = segment === 'Favorites' ? favorites : learned;
    return ids.map((id) => shortcuts.find((shortcut) => shortcut.id === id)).filter(Boolean);
  }, [favorites, learned, segment, shortcuts]);

  function removeShortcut(shortcut) {
    void playSelectionHaptic(hapticsEnabled);
    const wasFavorite = segment === 'Favorites';
    setLastRemoved({ id: shortcut.id, wasFavorite });
    if (wasFavorite) toggleFavorite(shortcut.id);
    else setShortcutLearned(shortcut.id, false);
    setUndoMessage(wasFavorite ? 'Removed from favorites' : 'Removed from learned');
  }

  function undoRemoval() {
    if (!lastRemoved) return;
    if (lastRemoved.wasFavorite) toggleFavorite(lastRemoved.id);
    else setShortcutLearned(lastRemoved.id, true);
    setLastRemoved(null);
    setUndoMessage('');
  }

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading saved shortcuts…</Text></View>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Saved</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Your favorites and shortcuts you have learned.</Text>
          <View accessibilityRole="tablist" style={[styles.segments, { backgroundColor: theme.surfaceMuted }]}>
            {['Favorites', 'Learned'].map((item) => {
              const selected = segment === item;
              const count = item === 'Favorites' ? favorites.length : learned.length;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="tab"
                  accessibilityLabel={`${item}, ${count}`}
                  accessibilityState={{ selected }}
                  onPress={() => setSegment(item)}
                  style={[styles.segment, selected && { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <Text style={[styles.segmentText, { color: selected ? theme.text : theme.muted }]}>{item}</Text>
                  <Text style={[styles.count, { color: selected ? theme.primary : theme.muted }]}>{count}</Text>
                </Pressable>
              );
            })}
          </View>

          {rows.length === 0 ? (
            <EmptyState
              icon={segment === 'Favorites' ? 'bookmark-outline' : 'checkmark-circle-outline'}
              title={segment === 'Favorites' ? 'No favorites yet' : 'Nothing learned yet'}
              message={segment === 'Favorites' ? 'Save useful shortcuts and they will be easy to find here.' : 'Mark a shortcut as learned to build your personal reference list.'}
              actionLabel={segment === 'Favorites' ? 'Browse shortcuts' : 'Practice now'}
              onAction={() => navigation.navigate(segment === 'Favorites' ? 'Browse' : 'Practice')}
            />
          ) : (
            rows.map((shortcut) => (
              <View key={shortcut.id} style={styles.savedRow}>
                <View style={styles.cardWrap}>
                  <ShortcutCard
                    shortcut={shortcut}
                    system={computerType}
                    isFavorite={segment === 'Favorites'}
                    onPress={() => navigation.navigate('Details', { shortcutId: shortcut.id })}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${shortcut.title} from ${segment.toLowerCase()}`}
                  onPress={() => removeShortcut(shortcut)}
                  style={[styles.removeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <Ionicons name="close" size={19} color={theme.muted} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <UndoSnackbar
        message={undoMessage}
        onUndo={undoRemoval}
        onDismiss={() => { setUndoMessage(''); setLastRemoved(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.sm },
  segments: { borderRadius: 12, flexDirection: 'row', gap: 4, padding: 4 },
  segment: { alignItems: 'center', borderColor: 'transparent', borderRadius: 9, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 44 },
  segmentText: { fontSize: 14, fontWeight: '700' },
  count: { fontSize: 12, fontWeight: '700' },
  savedRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  cardWrap: { flex: 1 },
  removeButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
});
