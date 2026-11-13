import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FilterChips } from '../components/FilterChips';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

const systems = [
  { name: 'Windows', field: 'windows', modifiers: ['Ctrl', 'Alt', 'Shift', 'Win'] },
  { name: 'macOS', field: 'mac', modifiers: ['Cmd', 'Option', 'Control', 'Shift'] },
  { name: 'Linux', field: 'linux', modifiers: ['Ctrl', 'Alt', 'Shift', 'Super'] },
];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const commonKeys = ['A', 'C', 'D', 'F', 'L', 'P', 'S', 'T', 'V', 'W', 'Z', 'Enter', 'Esc', 'Space', 'Tab', 'Delete', 'Backspace', 'F1', 'F5', 'Left', 'Right', 'Up', 'Down'];
const allowedKeys = new Set([
  'Ctrl', 'Alt', 'Shift', 'Win', 'Cmd', 'Option', 'Control', 'Super', 'Tab', 'Enter',
  'Esc', 'Space', 'Backspace', 'Delete', 'Home', 'End', 'PgUp', 'PgDn', 'Left', 'Right',
  'Up', 'Down', 'PrintScreen', 'Plus', 'Minus', 'Equals', 'Period', 'Comma', 'Backtick',
  'Slash', 'Semicolon', 'Quote', 'BracketLeft', 'BracketRight', 'Backslash',
  ...Array.from({ length: 12 }, (_, index) => `F${index + 1}`),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ...'0123456789',
]);
const keyAliases = { ' ': 'Space', Escape: 'Esc', ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down', Print: 'PrintScreen' };

function emptyKeyChoices(enabled) {
  return enabled ? { modifiers: [], mainKey: '' } : null;
}

function initialKeyChoices(shortcut, computerType) {
  return Object.fromEntries(systems.map(({ name, field }) => {
    const keys = shortcut?.[field];
    if (!shortcut && name !== computerType) return [field, null];
    if (!Array.isArray(keys)) return [field, emptyKeyChoices(!shortcut && name === computerType)];
    const modifiers = keys.filter((key) => ['Ctrl', 'Alt', 'Shift', 'Win', 'Cmd', 'Option', 'Control', 'Super'].includes(key));
    const mainKey = keys.find((key) => !modifiers.includes(key)) ?? '';
    return [field, { modifiers, mainKey }];
  }));
}

function normalizeMainKey(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const alias = keyAliases[trimmed];
  if (alias) return alias;
  if (/^[a-z]$/i.test(trimmed)) return trimmed.toUpperCase();
  if (/^\d$/.test(trimmed)) return trimmed;
  return trimmed;
}

function makeTags(title, app, category) {
  const sourceWords = `${title} ${app} ${category}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const result = [];
  for (const word of sourceWords) {
    if (!result.includes(word)) result.push(word);
    if (result.length === 5) break;
  }
  while (result.length < 3) result.push(['shortcut', 'keyboard', 'key'][result.length]);
  return result;
}

export function AddEditShortcutScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { computerType } = usePreferences();
  const { shortcuts, isLoading, saveUserShortcut, isUserShortcut } = useShortcuts();
  const shortcutId = route.params?.shortcutId;
  const current = shortcuts.find((item) => item.id === shortcutId);
  const isEditing = !!current && isUserShortcut(shortcutId);
  const [title, setTitle] = useState(current?.title ?? '');
  const [app, setApp] = useState(current?.app ?? '');
  const [category, setCategory] = useState(current?.category ?? '');
  const [description, setDescription] = useState(current?.description ?? '');
  const [tip, setTip] = useState(current?.tip ?? '');
  const [difficulty, setDifficulty] = useState(current?.difficulty ?? 'Beginner');
  const [keyChoices, setKeyChoices] = useState(() => initialKeyChoices(current, computerType));
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const savedRef = useRef(false);

  const duplicate = useMemo(() => shortcuts.some((item) => item.id !== shortcutId
    && item.app.trim().toLowerCase() === app.trim().toLowerCase()
    && item.title.trim().toLowerCase() === title.trim().toLowerCase()), [app, shortcutId, shortcuts, title]);

  useEffect(() => navigation.addListener('beforeRemove', (event) => {
    if (!dirty || savedRef.current) return;
    event.preventDefault();
    setPendingAction(event.data.action);
    setDiscardVisible(true);
  }), [dirty, navigation]);

  function update(setter, value) {
    setter(value);
    setDirty(true);
  }

  function setKeys(field, change) {
    setKeyChoices((currentKeys) => {
      const existing = currentKeys[field];
      const next = existing ? { ...existing } : { modifiers: [], mainKey: '' };
      if (typeof change === 'function') return { ...currentKeys, [field]: change(next) };
      return { ...currentKeys, [field]: { ...next, ...change } };
    });
    setDirty(true);
  }

  function toggleSystem(field, enabled) {
    setKeyChoices((currentKeys) => ({
      ...currentKeys,
      [field]: enabled ? currentKeys[field] ?? { modifiers: [], mainKey: '' } : null,
    }));
    setDirty(true);
  }

  function toggleModifier(field, modifier) {
    setKeys(field, (currentKeys) => ({
      ...currentKeys,
      modifiers: currentKeys.modifiers.includes(modifier)
        ? currentKeys.modifiers.filter((item) => item !== modifier)
        : [...currentKeys.modifiers, modifier],
    }));
  }

  function validate() {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Enter an action name.';
    if (!app.trim()) nextErrors.app = 'Enter an app or system name.';
    if (!category.trim()) nextErrors.category = 'Enter a category.';
    if (!description.trim()) nextErrors.description = 'Describe what the shortcut does.';
    if (!tip.trim()) nextErrors.tip = 'Add a tip for when to use it.';
    const enabledChoices = systems.map(({ field }) => keyChoices[field]).filter(Boolean);
    const hasCombination = enabledChoices.some((choice) => normalizeMainKey(choice.mainKey) || choice.modifiers.length > 0);
    const hasInvalidCombination = enabledChoices.some((choice) => {
      const mainKey = normalizeMainKey(choice.mainKey);
      return (!mainKey && choice.modifiers.length === 0) || (mainKey && !allowedKeys.has(mainKey));
    });
    if (!hasCombination || hasInvalidCombination) {
      nextErrors.keys = 'Complete each enabled system combination with supported key names.';
    }
    setErrors(nextErrors);
    setDuplicateWarning(duplicate);
    return Object.keys(nextErrors).length === 0 && !duplicate;
  }

  function save() {
    if (!validate()) return;
    const cleanTitle = title.trim();
    const cleanApp = app.trim();
    const cleanCategory = category.trim();
    const combinations = Object.fromEntries(systems.map(({ field }) => {
      const choice = keyChoices[field];
      if (!choice) return [field, null];
      const mainKey = normalizeMainKey(choice.mainKey);
      return [field, [...choice.modifiers, ...(mainKey ? [mainKey] : [])]];
    }));
    const record = {
      id: current?.id ?? `custom-${Date.now()}`,
      title: cleanTitle,
      app: cleanApp,
      category: cleanCategory,
      ...combinations,
      description: description.trim(),
      tip: tip.trim(),
      difficulty,
      tags: makeTags(cleanTitle, cleanApp, cleanCategory),
      createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    savedRef.current = true;
    saveUserShortcut(record);
    navigation.goBack();
  }

  function discardChanges() {
    setDiscardVisible(false);
    if (pendingAction) {
      savedRef.current = true;
      navigation.dispatch(pendingAction);
    }
  }

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading shortcut form…</Text></View>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{isEditing ? 'Edit shortcut' : 'Add a shortcut'}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Your shortcut is saved only on this device.</Text>

          <Field label="Action" error={errors.title} theme={theme}>
            <Input accessibilityLabel="Shortcut action" value={title} onChangeText={(value) => update(setTitle, value)} placeholder="e.g. Reopen closed tab" theme={theme} maxLength={70} />
            <Counter value={title.length} max={70} theme={theme} />
          </Field>
          <Field label="App or system" error={errors.app} theme={theme}>
            <Input accessibilityLabel="App or system name" value={app} onChangeText={(value) => update(setApp, value)} placeholder="e.g. Google Chrome" theme={theme} maxLength={50} />
          </Field>
          <Field label="Category" error={errors.category} theme={theme}>
            <Input accessibilityLabel="Shortcut category" value={category} onChangeText={(value) => update(setCategory, value)} placeholder="e.g. Tabs" theme={theme} maxLength={32} />
          </Field>
          {duplicateWarning && <Text accessibilityLiveRegion="polite" style={[styles.warning, { color: theme.danger }]}>This app already has a shortcut with that action name.</Text>}

          <View style={styles.formField}>
            <Text style={[styles.label, { color: theme.text }]}>Key combinations</Text>
            {errors.keys && <Text style={[styles.error, { color: theme.danger }]}>{errors.keys}</Text>}
            {systems.map(({ name, field, modifiers }) => {
              const choice = keyChoices[field];
              const enabled = !!choice;
              return (
                <View key={field} style={[styles.keySystem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.systemHead}>
                    <Text style={[styles.systemName, { color: theme.text }]}>{name}</Text>
                    <Pressable
                      accessibilityRole="switch"
                      accessibilityLabel={`${name} shortcut available`}
                      accessibilityState={{ checked: enabled }}
                      onPress={() => toggleSystem(field, !enabled)}
                      style={[styles.availability, { backgroundColor: enabled ? theme.primary : theme.surfaceMuted, borderColor: theme.border }]}
                    >
                      <Text style={[styles.availabilityText, { color: enabled ? theme.onPrimary : theme.muted }]}>{enabled ? 'Available' : 'Not available'}</Text>
                    </Pressable>
                  </View>
                  {enabled && (
                    <>
                      <Text style={[styles.helper, { color: theme.muted }]}>Modifiers</Text>
                      <FilterChips
                        accessibilityPrefix={`${name} modifier`}
                        items={modifiers}
                        selected={choice.modifiers}
                        onSelect={(modifier) => toggleModifier(field, modifier)}
                      />
                      <View style={styles.selectedModifiers}>
                        {choice.modifiers.map((modifier) => <View key={modifier} style={[styles.selectedModifier, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.selectedModifierText, { color: theme.text }]}>{modifier}</Text></View>)}
                      </View>
                      <Text style={[styles.helper, { color: theme.muted }]}>Main key (optional for a single-key shortcut)</Text>
                      <Input
                        accessibilityLabel={`${name} main key`}
                        value={choice.mainKey}
                        onChangeText={(value) => setKeys(field, { mainKey: value })}
                        placeholder="Type a letter, number or key name"
                        theme={theme}
                        maxLength={16}
                        autoCapitalize="characters"
                      />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.keyOptions}>
                        {commonKeys.map((key) => (
                          <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Choose ${key} as ${name} main key`} onPress={() => setKeys(field, { mainKey: key })} style={[styles.keyOption, { backgroundColor: normalizeMainKey(choice.mainKey) === key ? theme.primary : theme.surfaceMuted, borderColor: theme.border }]}>
                            <Text style={[styles.keyOptionText, { color: normalizeMainKey(choice.mainKey) === key ? theme.onPrimary : theme.text }]}>{key}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </View>
              );
            })}
          </View>

          <Field label="What it does" error={errors.description} theme={theme}>
            <Input accessibilityLabel="Shortcut description" value={description} onChangeText={(value) => update(setDescription, value)} placeholder="Describe the result of pressing these keys…" theme={theme} multiline maxLength={240} />
            <Counter value={description.length} max={240} theme={theme} />
          </Field>
          <Field label="When to use it" error={errors.tip} theme={theme}>
            <Input accessibilityLabel="When to use the shortcut" value={tip} onChangeText={(value) => update(setTip, value)} placeholder="Add a useful study or workflow tip…" theme={theme} multiline maxLength={180} />
            <Counter value={tip.length} max={180} theme={theme} />
          </Field>
          <View style={styles.formField}>
            <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
            <FilterChips accessibilityPrefix="Difficulty" items={difficulties} selected={difficulty} onSelect={(value) => update(setDifficulty, value)} />
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel={isEditing ? 'Save shortcut changes' : 'Add shortcut'} onPress={save} style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}>
            <Text style={[styles.saveText, { color: theme.onPrimary }]}>{isEditing ? 'Save changes' : 'Add shortcut'}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={discardVisible}
        title="Discard your changes?"
        message="Your unsaved shortcut details will be lost."
        confirmLabel="Discard"
        destructive
        onCancel={() => setDiscardVisible(false)}
        onConfirm={discardChanges}
      />
    </View>
  );
}

function Field({ label, error, theme, children }) {
  return (
    <View style={styles.formField}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {children}
      {error && <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.danger }]}>{error}</Text>}
    </View>
  );
}

function Input({ theme, multiline = false, ...props }) {
  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={theme.muted}
      style={[styles.input, multiline && styles.multiline, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

function Counter({ value, max, theme }) {
  return <Text style={[styles.counter, { color: theme.muted }]}>{value}/{max}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.sm },
  formField: { gap: 7 },
  label: { fontSize: 14, fontWeight: '700' },
  input: { borderRadius: 11, borderWidth: 1, fontSize: 15, minHeight: 48, paddingHorizontal: 12, paddingVertical: 10 },
  multiline: { minHeight: 90, paddingTop: 12 },
  error: { fontSize: 12, lineHeight: 17 },
  warning: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  counter: { alignSelf: 'flex-end', fontSize: 11 },
  keySystem: { borderRadius: 13, borderWidth: 1, gap: spacing.sm, padding: spacing.sm },
  systemHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  systemName: { fontSize: 15, fontWeight: '700' },
  availability: { alignItems: 'center', borderRadius: 14, borderWidth: 1, justifyContent: 'center', minHeight: 38, paddingHorizontal: 10 },
  availabilityText: { fontSize: 12, fontWeight: '700' },
  helper: { fontSize: 12, fontWeight: '600' },
  selectedModifiers: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selectedModifier: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  selectedModifierText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700' },
  keyOptions: { gap: 7, paddingVertical: 3 },
  keyOption: { alignItems: 'center', borderRadius: 9, borderWidth: 1, justifyContent: 'center', minHeight: 42, minWidth: 42, paddingHorizontal: 8 },
  keyOptionText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700' },
  saveButton: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', marginTop: spacing.sm, minHeight: 52 },
  saveText: { fontSize: 15, fontWeight: '700' },
});
