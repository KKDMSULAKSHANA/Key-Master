import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import apps from '../data/apps.json';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { KeyCaps } from '../components/KeyCaps';
import { HintCard } from '../components/HintCard';

const systemFields = { Windows: 'windows', macOS: 'mac', Linux: 'linux' };

export function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { computerType, dismissedHints, dismissHint } = usePreferences();
  const { shortcuts, favorites, learned, quizHistory, isLoading } = useShortcuts();
  const keyField = systemFields[computerType] ?? 'windows';
  const available = useMemo(() => shortcuts.filter((shortcut) => Array.isArray(shortcut[keyField])), [keyField, shortcuts]);
  const todayShortcut = available.length
    ? available[(Math.floor(Date.now() / 86400000) + 4) % available.length]
    : null;
  const lastSession = quizHistory[0];
  const appCounts = apps.map((app) => ({
    ...app,
    count: available.filter((shortcut) => shortcut.app === app.name).length,
  }));

  const openTab = (name) => navigation.navigate(name);
  const openShortcut = (shortcut) => navigation.navigate('Details', { shortcutId: shortcut.id });

  if (isLoading) {
    return <View style={[styles.loading, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading your shortcuts…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>KEYMASTER · OFFLINE</Text>
            <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>Good to see you</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>A quicker way to work with your keyboard.</Text>
          </View>
          <View style={[styles.offlineBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="cloud-offline-outline" size={16} color={theme.success} />
            <Text style={[styles.offlineText, { color: theme.success }]}>Offline</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change computer type"
          onPress={() => navigation.navigate('Onboarding', { preferencesOnly: true })}
          style={[styles.systemChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="laptop-outline" size={18} color={theme.primary} />
          <Text style={[styles.systemText, { color: theme.text }]}>{computerType}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.muted} />
        </Pressable>

        {!dismissedHints.home && (
          <HintCard
            icon="search-outline"
            title="Find a shortcut fast"
            message="Search by action, app, key, or a phrase you remember."
            onDismiss={() => dismissHint('home')}
          />
        )}

        {todayShortcut && (
          <View style={[styles.feature, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={[styles.sectionEyebrow, { color: theme.primary }]}>TODAY'S PICK</Text>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Shortcut of the day</Text>
              </View>
              <Ionicons name="sparkles-outline" size={21} color={theme.accent} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>{todayShortcut.title}</Text>
            <Text style={[styles.featureMeta, { color: theme.muted }]}>{todayShortcut.app} · {todayShortcut.category}</Text>
            <KeyCaps keys={todayShortcut[keyField]} system={computerType} />
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${todayShortcut.title}`} onPress={() => openShortcut(todayShortcut)} style={styles.featureLink}>
              <Text style={[styles.linkText, { color: theme.primary }]}>View shortcut</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore by app</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>Shortcuts available for {computerType}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse all shortcuts" onPress={() => openTab('Browse')} style={styles.smallAction}>
            <Text style={[styles.linkText, { color: theme.primary }]}>All</Text>
          </Pressable>
        </View>
        <View style={styles.appGrid}>
          {appCounts.map((app) => (
            <Pressable
              key={app.id}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${app.name}, ${app.count} shortcuts`}
              onPress={() => navigation.navigate('Browse', { app: app.name })}
              style={({ pressed }) => [styles.appCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name={app.icon} size={20} color={theme.primary} />
              <Text numberOfLines={2} style={[styles.appName, { color: theme.text }]}>{app.name}</Text>
              <Text style={[styles.appCount, { color: theme.muted }]}>{app.count} shortcuts</Text>
            </Pressable>
          ))}
        </View>

        {lastSession && (
          <Pressable accessibilityRole="button" accessibilityLabel="Continue to practice" onPress={() => openTab('Practice')} style={[styles.continueRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.continueIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name="play" size={17} color={theme.primary} /></View>
            <View style={styles.continueCopy}>
              <Text style={[styles.continueTitle, { color: theme.text }]}>Continue where you left off</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>Last quiz: {lastSession.score ?? 0}/{lastSession.total ?? 0}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>
        )}

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick actions</Text>
        </View>
        <View style={styles.quickActions}>
          <QuickAction icon="search-outline" label="Search" onPress={() => openTab('Browse')} theme={theme} />
          <QuickAction icon="school-outline" label="Practice" onPress={() => openTab('Practice')} theme={theme} />
          <QuickAction icon="add-outline" label="Add shortcut" onPress={() => navigation.navigate('AddEditShortcut')} theme={theme} />
        </View>

        <View style={styles.statsRow}>
          <Stat label="Learned" value={learned.length} theme={theme} />
          <Stat label="Favorites" value={favorites.length} theme={theme} />
          <Pressable accessibilityRole="button" accessibilityLabel="View progress" onPress={() => navigation.navigate('Progress')} style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{quizHistory.length}</Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>Quiz sessions</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="View progress details" onPress={() => navigation.navigate('Progress')} style={styles.progressLink}>
          <Text style={[styles.linkText, { color: theme.primary }]}>View progress</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress, theme }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.82 : 1 }]}>
      <Ionicons name={icon} size={20} color={theme.primary} />
      <Text style={[styles.quickLabel, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  heading: { fontSize: typography.size.heading, fontWeight: '700', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 3 },
  offlineBadge: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 10 },
  offlineText: { fontSize: 12, fontWeight: '700' },
  systemChip: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 42, paddingHorizontal: 13 },
  systemText: { fontSize: 14, fontWeight: '600' },
  feature: { borderRadius: 16, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  featureTitle: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  featureMeta: { fontSize: 13 },
  featureLink: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 42 },
  linkText: { fontSize: 14, fontWeight: '700' },
  smallAction: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  appCard: { borderRadius: 12, borderWidth: 1, flexBasis: '48%', flexGrow: 1, gap: 6, minHeight: 104, padding: spacing.sm },
  appName: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  appCount: { fontSize: 12 },
  continueRow: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 66, padding: spacing.sm },
  continueIcon: { alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 },
  continueCopy: { flex: 1 },
  continueTitle: { fontSize: 14, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: spacing.sm },
  quickAction: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, gap: 6, justifyContent: 'center', minHeight: 78, paddingHorizontal: 4 },
  quickLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 68, paddingVertical: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  progressLink: { alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 42, paddingHorizontal: 4 },
});
