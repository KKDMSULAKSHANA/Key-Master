import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KeyCaps } from '../components/KeyCaps';
import { useShortcuts } from '../context/ShortcutsContext';
import { usePreferences } from '../context/PreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { buildQuizQuestions } from '../utils/quizBuilder';
import { spacing } from '../theme/spacing';

function feedbackMessage(score, total) {
  const ratio = total ? score / total : 0;
  if (ratio === 1) return 'Perfect round. You have these shortcuts down.';
  if (ratio >= 0.8) return 'Strong recall. A little more practice will make it stick.';
  if (ratio >= 0.5) return 'Good progress. Review the tricky ones and try again.';
  return 'Every round is practice. Review the answers and build from here.';
}

export function QuizResultScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { shortcuts } = useShortcuts();
  const { computerType } = usePreferences();
  const session = route.params?.session ?? { score: 0, total: 0, mistakes: [] };
  const settings = route.params?.settings ?? { system: session.system ?? 'Windows', app: session.app ?? 'All', difficulty: session.difficulty ?? 'Any', mode: session.mode ?? 'guessShortcut' };
  const [reviewVisible, setReviewVisible] = useState(false);
  const mistakes = session.mistakes ?? [];
  const ratio = session.total ? session.score / session.total : 0;
  const icon = ratio >= 0.8 ? 'trophy-outline' : ratio >= 0.5 ? 'star-outline' : 'refresh-outline';

  const review = useMemo(() => mistakes.map((item, index) => ({ ...item, index: index + 1 })), [mistakes]);

  function tryAgain() {
    const questions = buildQuizQuestions({
      shortcuts,
      system: settings.system ?? computerType,
      app: settings.app,
      difficulty: settings.difficulty,
      mode: settings.mode,
      count: 10,
    });
    if (!questions.length) return;
    navigation.replace('Quiz', { questions, settings });
  }

  function goHome() {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={[styles.resultIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name={icon} size={36} color={theme.accent} />
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Quiz complete</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{feedbackMessage(session.score, session.total)}</Text>
        <View style={[styles.scorePanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.score, { color: theme.text }]}>{session.score}<Text style={[styles.scoreTotal, { color: theme.muted }]}> / {session.total}</Text></Text>
          <Text style={[styles.scoreCaption, { color: theme.muted }]}>correct answers</Text>
          <View style={[styles.scoreTrack, { backgroundColor: theme.surfaceMuted }]}>
            <View style={[styles.scoreFill, { backgroundColor: ratio >= 0.8 ? theme.success : theme.primary, width: `${ratio * 100}%` }]} />
          </View>
          <Text style={[styles.percent, { color: theme.primary }]}>{Math.round(ratio * 100)}%</Text>
        </View>

        {mistakes.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel={reviewVisible ? 'Hide mistakes' : `Review ${mistakes.length} mistakes`} onPress={() => setReviewVisible((current) => !current)} style={[styles.reviewToggle, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Ionicons name="eye-outline" size={18} color={theme.primary} />
            <Text style={[styles.reviewToggleText, { color: theme.text }]}>{reviewVisible ? 'Hide mistakes' : `Review mistakes (${mistakes.length})`}</Text>
            <Ionicons name={reviewVisible ? 'chevron-up' : 'chevron-down'} size={17} color={theme.muted} />
          </Pressable>
        ) : (
          <View style={[styles.allCorrect, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle" size={19} color={theme.success} />
            <Text style={[styles.allCorrectText, { color: theme.text }]}>No mistakes this round.</Text>
          </View>
        )}

        {reviewVisible && review.map((item) => (
          <View key={`${item.title}-${item.index}`} style={[styles.mistake, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.mistakeNumber, { color: theme.primary }]}>QUESTION {item.index}</Text>
            <Text style={[styles.mistakePrompt, { color: theme.text }]}>{item.prompt}</Text>
            <Text style={[styles.answerLabel, { color: theme.danger }]}>Your answer</Text>
            <AnswerValue value={item.selectedAnswer} mode={item.mode} system={settings.system} theme={theme} />
            <Text style={[styles.answerLabel, { color: theme.success }]}>Correct answer</Text>
            <AnswerValue value={item.correctAnswer} mode={item.mode} system={settings.system} theme={theme} />
            <Text style={[styles.explanation, { color: theme.muted }]}>{item.explanation}</Text>
          </View>
        ))}

        <Pressable accessibilityRole="button" accessibilityLabel="Try the quiz again" onPress={tryAgain} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}>
          <Text style={[styles.primaryText, { color: theme.onPrimary }]}>Try again</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={goHome} style={[styles.secondaryButton, { borderColor: theme.border }]}>
          <Text style={[styles.secondaryText, { color: theme.text }]}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function AnswerValue({ value, mode, system, theme }) {
  if (mode !== 'guessAction' && value) {
    return <KeyCaps keys={value.split(' + ')} system={system} />;
  }
  return <Text style={[styles.answerValue, { color: theme.text }]}>{value}</Text>;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', alignItems: 'center', gap: spacing.md, maxWidth: 600, width: '100%' },
  resultIcon: { alignItems: 'center', borderRadius: 28, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: spacing.sm, width: 72 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: -spacing.sm, maxWidth: 440, textAlign: 'center' },
  scorePanel: { alignItems: 'center', borderRadius: 16, borderWidth: 1, gap: 7, padding: spacing.lg, width: '100%' },
  score: { fontSize: 42, fontWeight: '700' },
  scoreTotal: { fontSize: 22, fontWeight: '600' },
  scoreCaption: { fontSize: 13 },
  scoreTrack: { borderRadius: 5, height: 8, marginTop: spacing.sm, overflow: 'hidden', width: '100%' },
  scoreFill: { borderRadius: 5, height: '100%' },
  percent: { fontSize: 14, fontWeight: '700' },
  reviewToggle: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 9, minHeight: 50, paddingHorizontal: spacing.md, width: '100%' },
  reviewToggleText: { flex: 1, fontSize: 14, fontWeight: '600' },
  allCorrect: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: spacing.md, width: '100%' },
  allCorrectText: { fontSize: 14, fontWeight: '600' },
  mistake: { alignSelf: 'stretch', borderRadius: 13, borderWidth: 1, gap: 8, padding: spacing.md },
  mistakeNumber: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  mistakePrompt: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
  answerLabel: { fontSize: 12, fontWeight: '700' },
  answerValue: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  explanation: { fontSize: 13, lineHeight: 20, marginTop: 2 },
  primaryButton: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 50, width: '100%' },
  primaryText: { fontSize: 15, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48, width: '100%' },
  secondaryText: { fontSize: 14, fontWeight: '700' },
});
