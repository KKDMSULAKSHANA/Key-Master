import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import apps from '../data/apps.json';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { formatShortDate, formatWeekday } from '../utils/date';
import { calculateStreak } from '../utils/streak';
import { spacing } from '../theme/spacing';

function percent(session) {
  return session?.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
}

export function ProgressScreen({ navigation }) {
  const { theme } = useTheme();
  const { shortcuts, learned, favorites, quizHistory, isLoading } = useShortcuts();
  const learnedIds = useMemo(() => new Set(learned), [learned]);
  const appProgress = apps.map((app) => {
    const total = shortcuts.filter((shortcut) => shortcut.app === app.name).length;
    const completed = shortcuts.filter((shortcut) => shortcut.app === app.name && learnedIds.has(shortcut.id)).length;
    return { ...app, total, completed, ratio: total ? completed / total : 0 };
  });
  const validSessions = quizHistory.filter((session) => session && session.total > 0 && typeof session.score === 'number');
  const average = validSessions.length
    ? Math.round(validSessions.reduce((sum, session) => sum + percent(session), 0) / validSessions.length)
    : 0;
  const best = validSessions.length ? Math.max(...validSessions.map(percent)) : 0;
  const recent = [...validSessions].slice(0, 7).reverse();
  const streak = calculateStreak(validSessions);
  const maxScore = Math.max(1, ...recent.map((session) => session.score));

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading progress…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>My progress</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>A snapshot of what you have practiced and learned.</Text>

        <View style={styles.summaryGrid}>
          <Metric icon="checkmark-circle-outline" label="Shortcuts learned" value={learned.length} theme={theme} />
          <Metric icon="bookmark-outline" label="Favorites" value={favorites.length} theme={theme} />
          <Metric icon="analytics-outline" label="Quiz average" value={validSessions.length ? `${average}%` : '—'} theme={theme} />
          <Metric icon="trophy-outline" label="Best score" value={validSessions.length ? `${best}%` : '—'} theme={theme} />
        </View>

        <View style={[styles.streakPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.streakIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name="flame-outline" size={22} color={theme.accent} /></View>
          <View style={styles.streakCopy}>
            <Text style={[styles.streakTitle, { color: theme.text }]}>{streak} day{streak === 1 ? '' : 's'}</Text>
            <Text style={[styles.smallText, { color: theme.muted }]}>Current practice streak</Text>
          </View>
          <Text style={[styles.sessionCount, { color: theme.primary }]}>{validSessions.length} session{validSessions.length === 1 ? '' : 's'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learned by app</Text>
          <Text style={[styles.smallText, { color: theme.muted }]}>Shortcuts you have marked as learned.</Text>
          <View style={styles.appRows}>
            {appProgress.map((app) => (
              <View key={app.id} style={styles.appRow}>
                <View style={styles.appRowHead}>
                  <Text style={[styles.appName, { color: theme.text }]}>{app.name}</Text>
                  <Text style={[styles.appCount, { color: theme.muted }]}>{app.completed}/{app.total}</Text>
                </View>
                <View accessibilityLabel={`${app.name}: ${app.completed} of ${app.total} learned`} style={[styles.barTrack, { backgroundColor: theme.surfaceMuted }]}>
                  <View style={[styles.barFill, { backgroundColor: theme.primary, width: `${app.ratio * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent quiz sessions</Text>
              <Text style={[styles.smallText, { color: theme.muted }]}>Your last seven completed rounds.</Text>
            </View>
            {validSessions.length > 0 && <Text style={[styles.smallText, { color: theme.primary }]}>{average}% average</Text>}
          </View>
          {recent.length === 0 ? (
            <View style={[styles.emptyChart, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.smallText, { color: theme.muted }]}>Complete a quiz to see your scores here.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Start practicing" onPress={() => navigation.navigate('Practice')} style={styles.practiceLink}>
                <Text style={[styles.practiceText, { color: theme.primary }]}>Start practicing</Text>
                <Ionicons name="arrow-forward" size={15} color={theme.primary} />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.chart, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {recent.map((session) => {
                const height = Math.max(8, Math.round((session.score / maxScore) * 90));
                return (
                  <View key={session.id} style={styles.chartColumn}>
                    <Text style={[styles.chartValue, { color: theme.muted }]}>{session.score}/{session.total}</Text>
                    <View style={styles.barSpace}>
                      <View style={[styles.sessionBar, { backgroundColor: percent(session) >= 80 ? theme.success : theme.primary, height }]} />
                    </View>
                    <Text style={[styles.chartDay, { color: theme.muted }]}>{formatWeekday(session.date)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {validSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest round</Text>
            <Text style={[styles.smallText, { color: theme.muted }]}>{formatShortDate(validSessions[0].date)} · {validSessions[0].system} · {validSessions[0].score}/{validSessions[0].total}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Metric({ icon, label, value, theme }) {
  return (
    <View style={[styles.metric, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name={icon} size={19} color={theme.primary} />
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.lg, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexBasis: '47%', flexGrow: 1, gap: 5, justifyContent: 'center', minHeight: 94, padding: spacing.sm },
  metricValue: { fontSize: 21, fontWeight: '700' },
  metricLabel: { fontSize: 11, textAlign: 'center' },
  streakPanel: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 70, padding: spacing.sm },
  streakIcon: { alignItems: 'center', borderRadius: 10, height: 42, justifyContent: 'center', width: 42 },
  streakCopy: { flex: 1, gap: 3 },
  streakTitle: { fontSize: 17, fontWeight: '700' },
  sessionCount: { fontSize: 12, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  smallText: { fontSize: 12, lineHeight: 18 },
  appRows: { gap: spacing.md, marginTop: spacing.xs },
  appRow: { gap: 6 },
  appRowHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  appName: { flex: 1, fontSize: 13, fontWeight: '600' },
  appCount: { fontSize: 12 },
  barTrack: { borderRadius: 5, height: 8, overflow: 'hidden' },
  barFill: { borderRadius: 5, height: '100%' },
  chartHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  emptyChart: { alignItems: 'flex-start', borderRadius: 13, borderWidth: 1, gap: 8, padding: spacing.md },
  practiceLink: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 44 },
  practiceText: { fontSize: 13, fontWeight: '700' },
  chart: { alignItems: 'flex-end', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, height: 190, justifyContent: 'space-evenly', padding: spacing.md },
  chartColumn: { alignItems: 'center', flex: 1, gap: 7, height: '100%' },
  chartValue: { fontSize: 10, fontWeight: '600' },
  barSpace: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', width: '100%' },
  sessionBar: { borderRadius: 5, maxWidth: 30, minWidth: 14, width: '72%' },
  chartDay: { fontSize: 10 },
});
