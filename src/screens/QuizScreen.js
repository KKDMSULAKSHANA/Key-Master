import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KeyCaps } from '../components/KeyCaps';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

export function QuizScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { saveQuizSession } = useShortcuts();
  const questions = route.params?.questions ?? [];
  const settings = route.params?.settings ?? { system: 'Windows', mode: 'guessShortcut' };
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [exitVisible, setExitVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const exitAllowed = useRef(false);
  const question = questions[questionIndex];

  useEffect(() => navigation.addListener('beforeRemove', (event) => {
    if (exitAllowed.current) return;
    event.preventDefault();
    setPendingAction(event.data.action);
    setExitVisible(true);
  }), [navigation]);

  function answer(option) {
    if (selectedAnswer !== null || !question) return;
    setSelectedAnswer(option);
    if (option === question.correctAnswer) {
      setScore((current) => current + 1);
    } else {
      setMistakes((current) => [...current, {
        prompt: question.prompt,
        title: question.title,
        app: question.app,
        selectedAnswer: option,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        mode: settings.mode,
      }]);
    }
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelectedAnswer(null);
      return;
    }
    const finalScore = score;
    const session = {
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      score: finalScore,
      total: questions.length,
      system: settings.system,
      app: settings.app,
      difficulty: settings.difficulty,
      mode: settings.mode,
      mistakes,
    };
    saveQuizSession(session);
    exitAllowed.current = true;
    navigation.replace('QuizResult', { session, settings });
  }

  function confirmExit() {
    setExitVisible(false);
    exitAllowed.current = true;
    if (pendingAction) navigation.dispatch(pendingAction);
    else navigation.goBack();
  }

  if (!question) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No quiz questions available</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Return to practice" onPress={() => navigation.goBack()} style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.emptyButtonText, { color: theme.onPrimary }]}>Back to Practice</Text>
        </Pressable>
      </View>
    );
  }

  const isCorrect = selectedAnswer === question.correctAnswer;
  const isGuessShortcut = settings.mode !== 'guessAction';
  const progress = (questionIndex + 1) / questions.length;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <View style={styles.progressCopy}>
              <Text style={[styles.questionCount, { color: theme.text }]}>Question {questionIndex + 1} of {questions.length}</Text>
              <Text style={[styles.scoreLabel, { color: theme.muted }]}>Score {score}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Exit quiz" onPress={() => { setPendingAction(null); setExitVisible(true); }} style={[styles.exitButton, { borderColor: theme.border }]}>
              <Ionicons name="close" size={18} color={theme.text} />
              <Text style={[styles.exitText, { color: theme.text }]}>Exit</Text>
            </Pressable>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Quiz progress"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
            style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}
          >
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progress * 100}%` }]} />
          </View>

          <View style={[styles.questionPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.questionLabel, { color: theme.primary }]}>{settings.mode === 'guessAction' ? 'IDENTIFY THE ACTION' : 'CHOOSE THE KEYS'}</Text>
            <Text accessibilityRole="header" style={[styles.prompt, { color: theme.text }]}>{question.prompt}</Text>
          </View>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const selected = selectedAnswer === option;
              const correctOption = selectedAnswer !== null && option === question.correctAnswer;
              const borderColor = correctOption ? theme.success : selected ? theme.danger : theme.border;
              return (
                <Pressable
                  key={`${option}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={isGuessShortcut ? option.split(' + ').join(' plus ') : option}
                  accessibilityState={{ disabled: selectedAnswer !== null }}
                  disabled={selectedAnswer !== null}
                  onPress={() => answer(option)}
                  style={({ pressed }) => [styles.option, { backgroundColor: theme.surface, borderColor, opacity: pressed && selectedAnswer === null ? 0.82 : 1 }]}
                >
                  <View style={[styles.optionLetter, { backgroundColor: theme.surfaceMuted }]}>
                    <Text style={[styles.optionLetterText, { color: theme.muted }]}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <View style={styles.optionValue}>
                    {isGuessShortcut
                      ? <KeyCaps keys={option.split(' + ')} system={settings.system} />
                      : <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>}
                  </View>
                  {correctOption && <Ionicons name="checkmark-circle" size={20} color={theme.success} />}
                  {selected && !isCorrect && <Ionicons name="close-circle" size={20} color={theme.danger} />}
                </Pressable>
              );
            })}
          </View>

          {selectedAnswer !== null && (
            <View style={[styles.feedback, { backgroundColor: theme.surface, borderColor: isCorrect ? theme.success : theme.danger }]}>
              <View style={styles.feedbackHeading}>
                <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={21} color={isCorrect ? theme.success : theme.danger} />
                <Text accessibilityRole="header" style={[styles.feedbackTitle, { color: isCorrect ? theme.success : theme.danger }]}>{isCorrect ? 'Correct!' : 'Not quite'}</Text>
              </View>
              {!isCorrect && <Text style={[styles.feedbackAnswer, { color: theme.text }]}>Correct answer: {question.correctAnswer}</Text>}
              <Text style={[styles.explanation, { color: theme.muted }]}>{question.explanation}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={questionIndex === questions.length - 1 ? 'View quiz result' : 'Next question'} onPress={nextQuestion} style={[styles.nextButton, { backgroundColor: theme.primary }]}>
                <Text style={[styles.nextText, { color: theme.onPrimary }]}>{questionIndex === questions.length - 1 ? 'See results' : 'Next question'}</Text>
                <Ionicons name="arrow-forward" size={17} color={theme.onPrimary} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={exitVisible}
        title="Exit this quiz?"
        message="Your answers in this round will not be saved as a completed session."
        confirmLabel="Exit quiz"
        destructive
        onCancel={() => { setExitVisible(false); setPendingAction(null); }}
        onConfirm={confirmExit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 640, width: '100%' },
  center: { alignItems: 'center', flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyButton: { alignItems: 'center', borderRadius: 11, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.md },
  emptyButtonText: { fontSize: 14, fontWeight: '700' },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  progressCopy: { gap: 3 },
  questionCount: { fontSize: 15, fontWeight: '700' },
  scoreLabel: { fontSize: 12 },
  exitButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 4, justifyContent: 'center', minHeight: 44, minWidth: 76 },
  exitText: { fontSize: 13, fontWeight: '600' },
  progressTrack: { borderRadius: 5, height: 8, overflow: 'hidden' },
  progressFill: { borderRadius: 5, height: '100%' },
  questionPanel: { borderRadius: 15, borderWidth: 1, gap: 8, padding: spacing.md },
  questionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  prompt: { fontSize: 19, fontWeight: '700', lineHeight: 27 },
  options: { gap: spacing.sm },
  option: { alignItems: 'center', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', gap: spacing.sm, minHeight: 60, paddingHorizontal: 10, paddingVertical: 8 },
  optionLetter: { alignItems: 'center', borderRadius: 8, height: 32, justifyContent: 'center', width: 32 },
  optionLetterText: { fontSize: 12, fontWeight: '700' },
  optionValue: { flex: 1 },
  optionText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  feedback: { borderRadius: 13, borderWidth: 1, gap: 8, padding: spacing.md },
  feedbackHeading: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  feedbackTitle: { fontSize: 16, fontWeight: '700' },
  feedbackAnswer: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  explanation: { fontSize: 13, lineHeight: 20 },
  nextButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 2, minHeight: 48 },
  nextText: { fontSize: 14, fontWeight: '700' },
});
