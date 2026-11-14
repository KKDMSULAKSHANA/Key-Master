import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

const themeModes = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const dangerousActions = {
  favorites: { title: 'Clear favorites?', message: 'Remove all saved favorites from this device.', label: 'Clear favorites' },
  learned: { title: 'Clear learned shortcuts?', message: 'Reset your learned list and progress by shortcut.', label: 'Clear learned' },
  notes: { title: 'Clear personal notes?', message: 'Remove all notes you have saved on this device.', label: 'Clear notes' },
  userShortcuts: { title: 'Delete your shortcuts?', message: 'Remove all shortcuts you created, along with their notes and saved status.', label: 'Delete shortcuts' },
  reset: { title: 'Reset KeyMaster?', message: 'This removes all saved activity and preferences. The app will return to first-time setup.', label: 'Reset everything' },
};

export function SettingsScreen({ navigation }) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const {
    computerType, hapticsEnabled, setHapticsEnabled, resetPreferences,
  } = usePreferences();
  const {
    shortcuts, bundledShortcuts, userShortcuts, favorites, learned,
    clearFavorites, clearLearned, clearNotes, clearUserShortcuts, resetShortcutData,
  } = useShortcuts();
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState('');

  function openRoot(screen, params) {
    const root = navigation.getParent();
    root?.navigate(screen, params);
  }

  function applyDangerAction() {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'favorites') {
      clearFavorites();
      setToast('Favorites cleared');
    } else if (action === 'learned') {
      clearLearned();
      setToast('Learned list cleared');
    } else if (action === 'notes') {
      clearNotes();
      setToast('Notes cleared');
    } else if (action === 'userShortcuts') {
      clearUserShortcuts();
      setToast('Your shortcuts deleted');
    } else if (action === 'reset') {
      resetShortcutData();
      resetPreferences();
      setThemeMode('system');
      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  }

  const actionConfig = confirmAction ? dangerousActions[confirmAction] : null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Make KeyMaster work the way you do.</Text>

          <Section title="Your computer" theme={theme}>
            <SettingRow
              icon="laptop-outline"
              title="Computer type"
              detail={`Currently ${computerType}`}
              action="Change"
              onPress={() => openRoot('Onboarding', { preferencesOnly: true })}
              theme={theme}
            />
          </Section>

          <Section title="Appearance" theme={theme}>
            <Text style={[styles.helper, { color: theme.muted }]}>Theme</Text>
            <View accessibilityRole="radiogroup" style={[styles.segmentGroup, { backgroundColor: theme.surfaceMuted }]}>
              {themeModes.map((mode) => {
                const selected = themeMode === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    accessibilityRole="radio"
                    accessibilityLabel={`${mode.label} theme`}
                    accessibilityState={{ selected }}
                    onPress={() => setThemeMode(mode.id)}
                    style={[styles.segment, selected && { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <Text style={[styles.segmentText, { color: selected ? theme.text : theme.muted }]}>{mode.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          <Section title="Practice" theme={theme}>
            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name="phone-portrait-outline" size={18} color={theme.primary} /></View>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Haptic feedback</Text>
                <Text style={[styles.rowDetail, { color: theme.muted }]}>Vibration during practice when supported</Text>
              </View>
              <Switch
                accessibilityLabel="Haptic feedback"
                accessibilityRole="switch"
                onValueChange={setHapticsEnabled}
                thumbColor={hapticsEnabled ? theme.primary : undefined}
                trackColor={{ false: theme.border, true: theme.surfaceMuted }}
                value={hapticsEnabled}
              />
            </View>
            <SettingRow icon="stats-chart-outline" title="My progress" detail="Learning and quiz activity" onPress={() => openRoot('Progress')} theme={theme} />
          </Section>

          <Section title="About" theme={theme}>
            <SettingRow icon="help-circle-outline" title="How to use KeyMaster" detail="Search, save, and practice shortcuts" onPress={() => openRoot('HelpAbout')} theme={theme} />
            <SettingRow icon="information-circle-outline" title="About this app" detail="Offline shortcut reference for students" onPress={() => openRoot('HelpAbout')} theme={theme} />
          </Section>

          <Section title="Danger zone" theme={theme}>
            <DangerRow icon="bookmark-outline" label="Clear favorites" onPress={() => setConfirmAction('favorites')} theme={theme} />
            <DangerRow icon="checkmark-circle-outline" label="Clear learned shortcuts" onPress={() => setConfirmAction('learned')} theme={theme} />
            <DangerRow icon="document-text-outline" label="Clear personal notes" onPress={() => setConfirmAction('notes')} theme={theme} />
            <DangerRow icon="trash-outline" label={`Delete my shortcuts (${userShortcuts.length})`} onPress={() => setConfirmAction('userShortcuts')} theme={theme} />
            <Pressable accessibilityRole="button" accessibilityLabel="Reset everything" onPress={() => setConfirmAction('reset')} style={[styles.resetButton, { borderColor: theme.danger }]}>
              <Ionicons name="refresh-outline" size={18} color={theme.danger} />
              <Text style={[styles.resetText, { color: theme.danger }]}>Reset everything</Text>
            </Pressable>
          </Section>

          <Text style={[styles.footer, { color: theme.muted }]}>{shortcuts.length} total shortcuts · {bundledShortcuts.length} bundled · {favorites.length} favorites · {learned.length} learned</Text>
        </View>
      </ScrollView>
      <Toast message={toast} onDismiss={() => setToast('')} />
      <ConfirmDialog
        visible={!!actionConfig}
        title={actionConfig?.title ?? ''}
        message={actionConfig?.message ?? ''}
        confirmLabel={actionConfig?.label ?? 'Confirm'}
        destructive
        onCancel={() => setConfirmAction(null)}
        onConfirm={applyDangerAction}
      />
    </View>
  );
}

function Section({ title, theme, children }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, title, detail, action, onPress, theme }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}${detail ? `, ${detail}` : ''}`} onPress={onPress} style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name={icon} size={18} color={theme.primary} /></View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {!!detail && <Text style={[styles.rowDetail, { color: theme.muted }]}>{detail}</Text>}
      </View>
      {action ? <Text style={[styles.actionText, { color: theme.primary }]}>{action}</Text> : <Ionicons name="chevron-forward" size={18} color={theme.muted} />}
    </Pressable>
  );
}

function DangerRow({ icon, label, onPress, theme }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.dangerRow, { borderBottomColor: theme.border }]}>
      <Ionicons name={icon} size={18} color={theme.danger} />
      <Text style={[styles.dangerLabel, { color: theme.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={17} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.lg, maxWidth: 640, width: '100%' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.md },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionContent: { borderRadius: 13, borderWidth: 1, overflow: 'hidden', paddingHorizontal: spacing.sm },
  row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.sm, minHeight: 66, paddingVertical: 8 },
  rowIcon: { alignItems: 'center', borderRadius: 9, height: 36, justifyContent: 'center', width: 36 },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowDetail: { fontSize: 12, lineHeight: 17 },
  actionText: { fontSize: 13, fontWeight: '700', paddingHorizontal: 5 },
  helper: { fontSize: 12, fontWeight: '600', paddingTop: spacing.sm },
  segmentGroup: { borderRadius: 10, flexDirection: 'row', gap: 4, marginBottom: spacing.sm, padding: 4 },
  segment: { alignItems: 'center', borderColor: 'transparent', borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44 },
  segmentText: { fontSize: 13, fontWeight: '600' },
  switchRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.sm, minHeight: 68, paddingVertical: 8 },
  dangerRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.sm, minHeight: 50 },
  dangerLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  resetButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: spacing.sm, minHeight: 46 },
  resetText: { fontSize: 13, fontWeight: '700' },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
