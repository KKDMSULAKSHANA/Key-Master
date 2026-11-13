import { useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { KeyCaps } from '../components/KeyCaps';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { playAnswerHaptic, playSelectionHaptic } from '../utils/haptics';
import { getShortcutText } from '../utils/keyLabels';
import { spacing } from '../theme/spacing';

const systemFields = { Windows: 'windows', macOS: 'mac', Linux: 'linux' };

export function FlashcardsScreen({ navigation }) {
  const { theme } = useTheme();
  const { computerType, hapticsEnabled } = usePreferences();
  const { shortcuts, isLoading, setShortcutLearned } = useShortcuts();
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const flipValue = useRef(new Animated.Value(0)).current;
  const field = systemFields[computerType] ?? 'windows';
  const deck = useMemo(() => shortcuts.filter((shortcut) => Array.isArray(shortcut[field])), [field, shortcuts]);
  const current = deck[index];
  const frontRotation = flipValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotation = flipValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  function flipCard() {
    const next = !isFlipped;
    setIsFlipped(next);
    void playSelectionHaptic(hapticsEnabled);
    Animated.spring(flipValue, {
      toValue: next ? 1 : 0,
      friction: 9,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }

  async function rateCard(gotIt) {
    if (!current || !isFlipped) return;
    await playAnswerHaptic(hapticsEnabled, gotIt);
    setShortcutLearned(current.id, gotIt);
    if (gotIt) setKnownCount((count) => count + 1);
    else setReviewCount((count) => count + 1);

    if (index >= deck.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((value) => value + 1);
    setIsFlipped(false);
    flipValue.setValue(0);
  }

  function restartDeck() {
    setIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setKnownCount(0);
    setReviewCount(0);
    flipValue.setValue(0);
  }

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading flashcards…</Text></View>;
  }

  if (deck.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <EmptyState title="No flashcards available" message={`There are no shortcuts for ${computerType} yet.`} actionLabel="Back to Practice" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  if (isComplete) {
    return (
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="albums-outline" size={34} color={theme.primary} />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Session complete</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{deck.length} flashcards reviewed for {computerType}.</Text>
          <View style={styles.statsRow}>
            <SessionStat label="Got it" value={knownCount} icon="checkmark-circle-outline" color={theme.success} theme={theme} />
            <SessionStat label="Again" value={reviewCount} icon="refresh-outline" color={theme.accent} theme={theme} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Review the flashcards again" onPress={restartDeck} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.primaryText, { color: theme.onPrimary }]}>Review again</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Return to Practice" onPress={() => navigation.goBack()} style={[styles.secondaryButton, { borderColor: theme.border }]}>
            <Text style={[styles.secondaryText, { color: theme.text }]}>Back to Practice</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const spokenKeys = getShortcutText(current[field]);
  const cardLabel = isFlipped
    ? `${current.title}. ${spokenKeys}. Tap to hide the shortcut.`
    : `${current.title}. Tap to reveal the shortcut.`;

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Flashcards</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>{computerType} · Card {index + 1} of {deck.length}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Exit flashcards" onPress={() => navigation.goBack()} style={[styles.exitButton, { borderColor: theme.border }]}>
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>
        <View accessibilityLabel={`Card ${index + 1} of ${deck.length}`} style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${((index + 1) / deck.length) * 100}%` }]} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cardLabel}
          accessibilityState={{ expanded: isFlipped }}
          onPress={flipCard}
          style={styles.cardPressable}
        >
          <View style={styles.cardStage}>
            <Animated.View style={[styles.cardFace, styles.frontFace, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ perspective: 1000 }, { rotateY: frontRotation }] }]}>
              <View style={[styles.cardIcon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name="flash-outline" size={23} color={theme.primary} /></View>
              <Text style={[styles.faceLabel, { color: theme.primary }]}>WHAT DOES THIS DO?</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{current.title}</Text>
              <Text style={[styles.cardMeta, { color: theme.muted }]}>{current.app} · {current.category}</Text>
              <View style={styles.flipHint}>
                <Ionicons name="sync-outline" size={16} color={theme.muted} />
                <Text style={[styles.flipHintText, { color: theme.muted }]}>Tap to reveal the keys</Text>
              </View>
            </Animated.View>
            <Animated.View style={[styles.cardFace, styles.backFace, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ perspective: 1000 }, { rotateY: backRotation }] }]}>
              <Text style={[styles.faceLabel, { color: theme.primary }]}>KEY COMBINATION</Text>
              <KeyCaps keys={current[field]} system={computerType} size="large" />
              <Text style={[styles.cardMeta, { color: theme.muted }]}>{current.app}</Text>
              <Text style={[styles.cardDescription, { color: theme.text }]}>{current.description}</Text>
              <Text style={[styles.flipHintText, { color: theme.muted }]}>Tap to hide the keys</Text>
            </Animated.View>
          </View>
        </Pressable>

        <View style={styles.rateRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Again, review this shortcut later"
            disabled={!isFlipped}
            onPress={() => void rateCard(false)}
            style={({ pressed }) => [styles.rateButton, styles.againButton, { borderColor: theme.border, backgroundColor: theme.surface, opacity: !isFlipped ? 0.48 : pressed ? 0.82 : 1 }]}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.accent} />
            <Text style={[styles.rateText, { color: theme.text }]}>Again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Got it, mark this shortcut learned"
            disabled={!isFlipped}
            onPress={() => void rateCard(true)}
            style={({ pressed }) => [styles.rateButton, styles.gotItButton, { backgroundColor: theme.primary, opacity: !isFlipped ? 0.48 : pressed ? 0.84 : 1 }]}
          >
            <Ionicons name="checkmark" size={20} color={theme.onPrimary} />
            <Text style={[styles.rateText, { color: theme.onPrimary }]}>Got it</Text>
          </Pressable>
        </View>
        {!isFlipped && <Text style={[styles.footerHint, { color: theme.muted }]}>Reveal the card before choosing.</Text>}
      </View>
    </ScrollView>
  );
}

function SessionStat({ label, value, icon, color, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name={icon} size={21} color={color} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xxl },
  container: { alignSelf: 'center', gap: spacing.md, maxWidth: 620, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  exitButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  progressTrack: { borderRadius: 5, height: 8, overflow: 'hidden' },
  progressFill: { borderRadius: 5, height: '100%' },
  cardPressable: { alignSelf: 'center', maxWidth: 520, width: '100%' },
  cardStage: { height: 330, width: '100%' },
  cardFace: { alignItems: 'center', backfaceVisibility: 'hidden', borderRadius: 18, borderWidth: 1, gap: spacing.md, height: '100%', justifyContent: 'center', padding: spacing.lg, position: 'absolute', width: '100%' },
  frontFace: {},
  backFace: {},
  cardIcon: { alignItems: 'center', borderRadius: 14, height: 50, justifyContent: 'center', width: 50 },
  faceLabel: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 23, fontWeight: '700', lineHeight: 30, textAlign: 'center' },
  cardMeta: { fontSize: 13, textAlign: 'center' },
  flipHint: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  flipHintText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  cardDescription: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  rateRow: { flexDirection: 'row', gap: spacing.sm },
  rateButton: { alignItems: 'center', borderRadius: 12, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52 },
  againButton: { borderWidth: 1 },
  gotItButton: {},
  rateText: { fontSize: 15, fontWeight: '700' },
  footerHint: { fontSize: 12, textAlign: 'center' },
  summaryIcon: { alignItems: 'center', alignSelf: 'center', borderRadius: 25, borderWidth: 1, height: 68, justifyContent: 'center', marginTop: spacing.xl, width: 68 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  stat: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flex: 1, gap: 6, justifyContent: 'center', minHeight: 92 },
  statValue: { fontSize: 21, fontWeight: '700' },
  statLabel: { fontSize: 13 },
  primaryButton: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 50, marginTop: spacing.md },
  primaryText: { fontSize: 15, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48 },
  secondaryText: { fontSize: 14, fontWeight: '700' },
});
