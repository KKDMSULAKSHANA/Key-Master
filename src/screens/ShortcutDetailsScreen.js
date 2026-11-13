import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KeyCaps } from '../components/KeyCaps';
import { Toast } from '../components/Toast';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { getShortcutText } from '../utils/keyLabels';
import { playSelectionHaptic } from '../utils/haptics';
import { spacing } from '../theme/spacing';

const systems = [
  { name: 'Windows', field: 'windows' },
  { name: 'macOS', field: 'mac' },
  { name: 'Linux', field: 'linux' },
];
const keyFields = { Windows: 'windows', macOS: 'mac', Linux: 'linux' };

export function ShortcutDetailsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { computerType, hapticsEnabled } = usePreferences();
  const {
    shortcuts, isLoading, toggleFavorite, setShortcutLearned, saveNote,
    getNote, isFavorite, isLearned, isUserShortcut, deleteUserShortcut, saveUserShortcut,
  } = useShortcuts();
  const shortcutId = route.params?.shortcutId;
  const contextShortcut = shortcuts.find((item) => item.id === shortcutId);
  const [retainedShortcut, setRetainedShortcut] = useState(contextShortcut ?? null);
  const [toast, setToast] = useState('');
  const [undoMessage, setUndoMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const favorite = isFavorite(shortcutId);
  const learned = isLearned(shortcutId);
  const userCreated = isUserShortcut(shortcutId);
  const keyField = keyFields[computerType] ?? 'windows';

  useEffect(() => {
    if (contextShortcut) setRetainedShortcut(contextShortcut);
  }, [contextShortcut]);

  const related = useMemo(() => {
    if (!contextShortcut) return [];
    return shortcuts.filter((item) => item.id !== shortcutId
      && item.app === contextShortcut.app
      && item.category === contextShortcut.category
      && Array.isArray(item[keyField])).slice(0, 3);
  }, [contextShortcut, keyField, shortcutId, shortcuts]);

  const shortcut = contextShortcut ?? retainedShortcut;

  async function copyShortcut() {
    const keys = shortcut?.[keyField];
    if (!Array.isArray(keys)) return;
    try {
      await Clipboard.setStringAsync(getShortcutText(keys));
      setToast('Shortcut copied');
    } catch {
      setToast('Could not copy shortcut');
    }
  }

  function onUndoDismiss() {
    setUndoMessage('');
    if (isDeleting) navigation.goBack();
  }

  function undoAction() {
    if (isDeleting && retainedShortcut) {
      saveUserShortcut(retainedShortcut);
      setIsDeleting(false);
    } else {
      toggleFavorite(shortcutId);
    }
    setUndoMessage('');
  }

  function confirmDelete() {
    setDeleteDialog(false);
    if (!retainedShortcut) return;
    deleteUserShortcut(shortcutId);
    setIsDeleting(true);
    setUndoMessage('Shortcut deleted');
  }

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading shortcut…</Text></View>;
  }
  if (!shortcut) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={[styles.notFound, { color: theme.text }]}>Shortcut not found</Text></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.headerLine}>
            <Text style={[styles.meta, { color: theme.muted }]}>{shortcut.app} · {shortcut.category}</Text>
            {userCreated && <View style={[styles.mineBadge, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.mineText, { color: theme.primary }]}>Mine</Text></View>}
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{shortcut.title}</Text>
          <Text style={[styles.difficulty, { color: theme.muted }]}>{shortcut.difficulty}</Text>

          <View style={[styles.keyPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>{computerType} shortcut</Text>
            <KeyCaps keys={shortcut[keyField]} system={computerType} size="large" />
            <View style={styles.keyActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Copy shortcut" onPress={() => void copyShortcut()} style={[styles.copyButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="copy-outline" size={18} color={theme.onPrimary} />
                <Text style={[styles.copyText, { color: theme.onPrimary }]}>Copy shortcut</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Remove favorite' : 'Add favorite'}
                onPress={() => {
                  void playSelectionHaptic(hapticsEnabled);
                  toggleFavorite(shortcutId);
                  if (favorite) setUndoMessage('Removed from favorites');
                }}
                style={[styles.iconAction, { backgroundColor: theme.surfaceMuted }]}
              >
                <Ionicons name={favorite ? 'bookmark' : 'bookmark-outline'} size={20} color={favorite ? theme.accent : theme.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={learned ? 'Mark as not learned' : 'Mark as learned'}
                onPress={() => {
                  void playSelectionHaptic(hapticsEnabled);
                  setShortcutLearned(shortcutId, !learned);
                }}
                style={[styles.iconAction, { backgroundColor: theme.surfaceMuted }]}
              >
                <Ionicons name={learned ? 'checkmark-circle' : 'checkmark-circle-outline'} size={20} color={learned ? theme.success : theme.text} />
              </Pressable>
            </View>
          </View>

          <Section title="Other systems" theme={theme}>
            {systems.filter(({ name }) => name !== computerType).map(({ name, field }) => (
              <View key={field} style={[styles.otherSystem, { borderBottomColor: theme.border }]}>
                <Text style={[styles.otherLabel, { color: theme.text }]}>{name}</Text>
                {shortcut[field]
                  ? <KeyCaps keys={shortcut[field]} system={name} />
                  : <Text style={[styles.unavailable, { color: theme.muted }]}>Not available on {name}</Text>}
              </View>
            ))}
          </Section>

          <Section title="What it does" theme={theme}>
            <Text style={[styles.body, { color: theme.text }]}>{shortcut.description}</Text>
          </Section>
          <Section title="When to use it" theme={theme}>
            <Text style={[styles.body, { color: theme.text }]}>{shortcut.tip}</Text>
          </Section>

          <Section title="Personal note" theme={theme}>
            <TextInput
              accessibilityLabel="Personal note about this shortcut"
              maxLength={500}
              multiline
              onChangeText={(value) => saveNote(shortcutId, value)}
              placeholder="Add a note to help you remember…"
              placeholderTextColor={theme.muted}
              style={[styles.noteInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              textAlignVertical="top"
              value={getNote(shortcutId)}
            />
            <Text style={[styles.counter, { color: theme.muted }]}>{getNote(shortcutId).length}/500</Text>
          </Section>

          {!!shortcut.tags?.length && (
            <Section title="Related terms" theme={theme}>
              <View style={styles.tags}>
                {shortcut.tags.map((tag) => <View key={tag} style={[styles.tag, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text></View>)}
              </View>
            </Section>
          )}

          {!!related.length && (
            <Section title="Related shortcuts" theme={theme}>
              {related.map((item) => (
                <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => navigation.replace('Details', { shortcutId: item.id })} style={[styles.relatedRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.relatedCopy}>
                    <Text style={[styles.relatedTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.meta, { color: theme.muted }]}>{item.app}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={theme.muted} />
                </Pressable>
              ))}
            </Section>
          )}

          {userCreated && !isDeleting && (
            <View style={styles.manageActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Edit shortcut" onPress={() => navigation.navigate('AddEditShortcut', { shortcutId })} style={[styles.secondaryButton, { borderColor: theme.border }]}>
                <Ionicons name="create-outline" size={18} color={theme.primary} />
                <Text style={[styles.secondaryText, { color: theme.primary }]}>Edit</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Delete shortcut" onPress={() => setDeleteDialog(true)} style={[styles.secondaryButton, { borderColor: theme.danger }]}>
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
                <Text style={[styles.secondaryText, { color: theme.danger }]}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <Toast message={toast} onDismiss={() => setToast('')} />
      <UndoSnackbar message={undoMessage} onUndo={undoAction} onDismiss={onUndoDismiss} />
      <ConfirmDialog
        visible={deleteDialog}
        title="Delete this shortcut?"
        message="This removes your shortcut and its personal note from this device."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
      />
    </KeyboardAvoidingView>
  );
}

function Section({ title, theme, children }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  notFound: { fontSize: 18, fontWeight: '700' },
  headerLine: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  meta: { fontSize: 13 },
  mineBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mineText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  difficulty: { fontSize: 13, marginTop: -spacing.sm },
  keyPanel: { borderRadius: 16, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  sectionLabel: { fontSize: 12, fontWeight: '600' },
  keyActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  copyButton: { alignItems: 'center', borderRadius: 11, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  copyText: { fontSize: 14, fontWeight: '700' },
  iconAction: { alignItems: 'center', borderRadius: 11, height: 48, justifyContent: 'center', width: 48 },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  otherSystem: { alignItems: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, gap: 8, paddingVertical: spacing.sm },
  otherLabel: { fontSize: 14, fontWeight: '600' },
  unavailable: { fontSize: 13 },
  body: { fontSize: 15, lineHeight: 23 },
  noteInput: { borderRadius: 12, borderWidth: 1, fontSize: 14, lineHeight: 21, minHeight: 96, padding: 12 },
  counter: { alignSelf: 'flex-end', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  tagText: { fontSize: 12, fontWeight: '500' },
  relatedRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 54, paddingVertical: 8 },
  relatedCopy: { flex: 1, gap: 3 },
  relatedTitle: { fontSize: 14, fontWeight: '600' },
  manageActions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm },
  secondaryButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48 },
  secondaryText: { fontSize: 14, fontWeight: '700' },
});
