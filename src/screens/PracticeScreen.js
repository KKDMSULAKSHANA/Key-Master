import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import apps from '../data/apps.json';
import { FilterChips } from '../components/FilterChips';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { buildQuizQuestions } from '../utils/quizBuilder';
import { spacing } from '../theme/spacing';

const appOptions = ['All', ...apps.map((app) => app.name)];
const difficultyOptions = ['Any', 'Beginner', 'Intermediate', 'Advanced'];
const modes = [
  { id: 'guessShortcut', title: 'Guess the shortcut', description: 'Read an action and choose its keys.', icon: 'keypad-outline' },
  { id: 'guessAction', title: 'Guess the action', description: 'Read a key combination and choose what it does.', icon: 'text-outline' },
];

function percent(session) {
  return session?.total ? Math.round((session.score / session.total) * 100) : 0;
}

export function PracticeScreen({ navigation }) {
  const { theme } = useTheme();
  const { computerType } = usePreferences();
  const { shortcuts, quizHistory, isLoading } = useShortcuts();
  const [selectedApp, setSelectedApp] = useState('All');
  const [difficulty, setDifficulty] = useState('Any');
  const [mode, setMode] = useState(modes[0].id);
  const questions = useMemo(() => buildQuizQuestions({
    shortcuts, system: computerType, app: selectedApp, difficulty, mode, count: 10,
  }), [computerType, difficulty, mode, selectedApp, shortcuts]);
  const latest = quizHistory[0];
  const best = Math.max(0, ...quizHistory.map(percent));

  function startQuiz() {
    if (questions.length === 0) return;
    navigation.navigate('Quiz', {
      questions,
      settings: { system: computerType, app: selectedApp, difficulty, mode },
    });
  }

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading practice…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Practice</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Build recall with short, focused quizzes.</Text>

        <View style={styles.statsRow}>
          <ScoreStat label="Last score" value={latest ? `${latest.score}/${latest.total}` : '—'} theme={theme} />
          <ScoreStat label="Best score" value={quizHistory.length ? `${best}%` : '—'} theme={theme} />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Choose a quiz mode</Text>
        <View style={styles.modeList}>
          {modes.map((item) => {
            const selected = mode === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={item.title}
                accessibilityState={{ selected }}
                onPress={() => setMode(item.id)}
                style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: selected ? theme.primary : theme.border }]}
              >
                <View style={[styles.modeIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name={item.icon} size={22} color={theme.primary} /></View>
                <View style={styles.modeCopy}>
                  <Text style={[styles.modeTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.modeDescription, { color: theme.muted }]}>{item.description}</Text>
                </View>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? theme.primary : theme.muted} />
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>App</Text>
        <FilterChips accessibilityPrefix="Quiz app" items={appOptions} selected={selectedApp} onSelect={setSelectedApp} />
        <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
        <FilterChips accessibilityPrefix="Quiz difficulty" items={difficultyOptions} selected={difficulty} onSelect={setDifficulty} />

        <View style={[styles.readyPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.readyCopy}>
            <Text style={[styles.readyTitle, { color: theme.text }]}>{questions.length} questions ready</Text>
            <Text style={[styles.modeDescription, { color: theme.muted }]}>{computerType} · {selectedApp === 'All' ? 'All apps' : selectedApp} · {difficulty}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Start quiz with ${questions.length} questions`} disabled={!questions.length} onPress={startQuiz} style={({ pressed }) => [styles.startButton, { backgroundColor: theme.primary, opacity: !questions.length ? 0.45 : pressed ? 0.84 : 1 }]}>
            <Text style={[styles.startText, { color: theme.onPrimary }]}>Start quiz</Text>
            <Ionicons name="arrow-forward" size={17} color={theme.onPrimary} />
          </Pressable>
        </View>
        {questions.length > 0 && questions.length < 10 && <Text style={[styles.note, { color: theme.muted }]}>There are fewer than ten matching shortcuts, so this round uses {questions.length}.</Text>}

        <Pressable accessibilityRole="button" accessibilityLabel="View learning progress" onPress={() => navigation.navigate('Progress')} style={[styles.progressLink, { borderColor: theme.border }]}>
          <Ionicons name="stats-chart-outline" size={19} color={theme.primary} />
          <Text style={[styles.progressText, { color: theme.text }]}>My progress</Text>
          <Ionicons name="chevron-forward" size={17} color={theme.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ScoreStat({ label, value, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: -spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, gap: 4, justifyContent: 'center', minHeight: 70 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: -spacing.sm },
  modeList: { gap: spacing.sm },
  modeCard: { alignItems: 'center', borderRadius: 13, borderWidth: 1.5, flexDirection: 'row', gap: spacing.sm, minHeight: 76, padding: spacing.sm },
  modeIcon: { alignItems: 'center', borderRadius: 10, height: 42, justifyContent: 'center', width: 42 },
  modeCopy: { flex: 1, gap: 3 },
  modeTitle: { fontSize: 14, fontWeight: '700' },
  modeDescription: { fontSize: 12, lineHeight: 18 },
  readyPanel: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  readyCopy: { flex: 1, gap: 4 },
  readyTitle: { fontSize: 15, fontWeight: '700' },
  startButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  startText: { fontSize: 13, fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 18, marginTop: -spacing.sm },
  progressLink: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, paddingHorizontal: spacing.md },
  progressText: { flex: 1, fontSize: 14, fontWeight: '600' },
});
