import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import apps from '../data/apps.json';
import shortcuts from '../data/shortcuts.json';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { appInfo } from '../constants/appInfo';
import { spacing } from '../theme/spacing';

const steps = [
  { icon: 'laptop-outline', title: 'Choose your system', detail: 'Select Windows, macOS, or Linux in Settings so key combinations match your computer.' },
  { icon: 'search-outline', title: 'Search', detail: 'Search actions, keys, apps, descriptions, or tags in Browse.' },
  { icon: 'keypad-outline', title: 'Open a shortcut', detail: 'View the key combination, usage tip, related entries, and other system mappings.' },
  { icon: 'school-outline', title: 'Practice', detail: 'Choose a quiz mode, app, and difficulty. Each round is built from the bundled shortcut guide.' },
  { icon: 'bookmark-outline', title: 'Save', detail: 'Favorite useful entries, mark skills learned, and keep a personal note on this device.' },
];

export function HelpAboutScreen() {
  const { theme } = useTheme();
  const { userShortcuts } = useShortcuts();
  const totalCount = shortcuts.length + userShortcuts.length;

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Help & About</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>A quick guide to using KeyMaster.</Text>

        <View style={styles.steps}>
          {steps.map((step, index) => (
            <View key={step.title} style={[styles.step, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}><Text style={[styles.numberText, { color: theme.onPrimary }]}>{index + 1}</Text></View>
              <View style={[styles.stepIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name={step.icon} size={19} color={theme.primary} /></View>
              <View style={styles.stepCopy}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                <Text style={[styles.stepDetail, { color: theme.muted }]}>{step.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.offlinePanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.offlineIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name="cloud-offline-outline" size={21} color={theme.success} /></View>
          <View style={styles.offlineCopy}>
            <Text style={[styles.offlineTitle, { color: theme.text }]}>Works fully offline</Text>
            <Text style={[styles.stepDetail, { color: theme.muted }]}>The shortcut catalog is bundled with the app. Your preferences, saved items, notes, custom shortcuts, and quiz history stay in local app storage on this device.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Local library</Text>
          <View style={[styles.countPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <CountRow label="Bundled shortcuts" value={shortcuts.length} theme={theme} />
            <CountRow label="Your shortcuts" value={userShortcuts.length} theme={theme} />
            <CountRow label="Available in this guide" value={totalCount} theme={theme} />
            <CountRow label="Apps and systems" value={apps.length} theme={theme} last />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About this project</Text>
          <View style={[styles.aboutPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <InfoRow label="App" value="KeyMaster: Offline Keyboard Shortcuts Guide for Students" theme={theme} />
            <InfoRow label="Student" value={appInfo.studentName} theme={theme} />
            <InfoRow label="Index number" value={appInfo.indexNumber} theme={theme} />
            <InfoRow label="Module" value={appInfo.moduleName} theme={theme} />
            <InfoRow label="Version" value={appInfo.appVersion} theme={theme} last />
          </View>
        </View>

        <Text style={[styles.note, { color: theme.muted }]}>Shortcut behavior can differ between app versions, operating-system settings, keyboard layouts, and distributions.</Text>
      </View>
    </ScrollView>
  );
}

function CountRow({ label, value, theme, last = false }) {
  return (
    <View style={[styles.countRow, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.rowLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value, theme, last = false }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.rowLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.lg, maxWidth: 640, width: '100%' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.md },
  steps: { gap: spacing.sm },
  step: { alignItems: 'flex-start', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  stepNumber: { alignItems: 'center', borderRadius: 9, height: 28, justifyContent: 'center', width: 28 },
  numberText: { fontSize: 13, fontWeight: '700' },
  stepIcon: { alignItems: 'center', borderRadius: 9, height: 34, justifyContent: 'center', width: 34 },
  stepCopy: { flex: 1, gap: 3, paddingTop: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDetail: { fontSize: 12, lineHeight: 18 },
  offlinePanel: { alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  offlineIcon: { alignItems: 'center', borderRadius: 10, height: 40, justifyContent: 'center', width: 40 },
  offlineCopy: { flex: 1, gap: 5 },
  offlineTitle: { fontSize: 15, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  countPanel: { borderRadius: 13, borderWidth: 1, paddingHorizontal: spacing.md },
  countRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 46 },
  rowLabel: { fontSize: 13, lineHeight: 19 },
  rowValue: { fontSize: 13, fontWeight: '700', marginLeft: spacing.md, textAlign: 'right' },
  aboutPanel: { borderRadius: 13, borderWidth: 1, paddingHorizontal: spacing.md },
  infoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', minHeight: 46, paddingVertical: 11 },
  infoValue: { flex: 1 },
  note: { fontSize: 12, lineHeight: 18 },
});
