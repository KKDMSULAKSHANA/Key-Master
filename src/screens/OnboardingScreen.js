import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePreferences } from '../context/PreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { STORAGE_KEYS } from '../storage/keys';
import { writeStorage } from '../storage/storage';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const slides = [
  { icon: 'keypad-outline', title: 'Shortcuts, made clear', description: 'Find reliable keyboard combinations for the computer and apps you use.' },
  { icon: 'search-outline', title: 'Search as you think', description: 'Look up an action, app, key, or phrase. Your guide works offline.' },
  { icon: 'school-outline', title: 'Learn at your pace', description: 'Practice with quick quizzes and keep the shortcuts you want to remember.' },
];
const systems = ['Windows', 'macOS', 'Linux'];
const goals = [3, 5, 10];

export function OnboardingScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { computerType, setComputerType, setDailyGoal, setOnboardingCompleted } = usePreferences();
  const [slide, setSlide] = useState(0);
  const [system, setSystem] = useState(computerType);
  const [goal, setGoal] = useState(5);
  const isPreferencesStep = slide === slides.length;

  async function finishOnboarding() {
    setComputerType(system);
    setDailyGoal(goal);
    setOnboardingCompleted(true);
    await Promise.all([
      writeStorage(STORAGE_KEYS.COMPUTER_TYPE, system),
      writeStorage(STORAGE_KEYS.DAILY_GOAL, goal),
      writeStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, true),
    ]);
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }

  function skipIntro() {
    if (isPreferencesStep) {
      void finishOnboarding();
    } else {
      setSlide(slides.length);
    }
  }

  const activeSlide = slides[Math.min(slide, slides.length - 1)];

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.topRow}>
        <View style={[styles.brandMark, { backgroundColor: theme.primary }]}>
          <Text style={[styles.brandLetter, { color: theme.onPrimary }]}>K</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={route?.params?.preferencesOnly || isPreferencesStep ? 'Keep current preferences' : 'Skip introduction'} onPress={() => {
          if (route?.params?.preferencesOnly) navigation.goBack();
          else skipIntro();
        }} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.primary }]}>{isPreferencesStep ? 'Use defaults' : 'Skip'}</Text>
        </Pressable>
      </View>

      {!isPreferencesStep && !route?.params?.preferencesOnly ? (
        <View style={styles.introContent}>
          <View style={[styles.illustration, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name={activeSlide.icon} size={48} color={theme.primary} />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{activeSlide.title}</Text>
          <Text style={[styles.description, { color: theme.muted }]}>{activeSlide.description}</Text>
          <View accessibilityLabel={`Slide ${slide + 1} of ${slides.length}`} style={styles.dots}>
            {slides.map((item, index) => (
              <View key={item.title} style={[styles.dot, { backgroundColor: index === slide ? theme.primary : theme.border }]} />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={slide === slides.length - 1 ? 'Choose your computer' : 'Next introduction slide'}
            onPress={() => setSlide((current) => current + 1)}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}
          >
            <Text style={[styles.primaryText, { color: theme.onPrimary }]}>{slide === slides.length - 1 ? 'Choose your computer' : 'Continue'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.preferencesContent}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{route?.params?.preferencesOnly ? 'Change your preferences' : 'Set up your guide'}</Text>
          <Text style={[styles.description, { color: theme.muted }]}>Choose the system you use most. You can change it later.</Text>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Computer type</Text>
          <View style={styles.optionList}>
            {systems.map((item) => {
              const selected = system === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityLabel={item}
                  accessibilityState={{ selected }}
                  onPress={() => setSystem(item)}
                  style={[styles.option, { backgroundColor: theme.surface, borderColor: selected ? theme.primary : theme.border }]}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>{item}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Daily goal</Text>
          <View style={styles.goalRow}>
            {goals.map((item) => {
              const selected = goal === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityLabel={`${item} shortcuts per day`}
                  accessibilityState={{ selected }}
                  onPress={() => setGoal(item)}
                  style={[styles.goalOption, { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border }]}
                >
                  <Text style={[styles.goalNumber, { color: selected ? theme.onPrimary : theme.text }]}>{item}</Text>
                  <Text style={[styles.goalLabel, { color: selected ? theme.onPrimary : theme.muted }]}>per day</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start using KeyMaster"
            onPress={() => void finishOnboarding()}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}
          >
            <Text style={[styles.primaryText, { color: theme.onPrimary }]}>{route?.params?.preferencesOnly ? 'Save preferences' : 'Start learning'}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 640, width: '100%', alignSelf: 'center' },
  brandMark: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  brandLetter: { fontSize: 24, fontWeight: '700' },
  skipButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 64 },
  skipText: { fontSize: 14, fontWeight: '600' },
  introContent: { alignItems: 'center', alignSelf: 'center', flex: 1, justifyContent: 'center', maxWidth: 480, paddingBottom: spacing.xl, width: '100%' },
  illustration: { alignItems: 'center', borderRadius: 28, borderWidth: 1, height: 112, justifyContent: 'center', marginBottom: spacing.xl, width: 112 },
  title: { fontSize: typography.size.heading, fontWeight: typography.weight.bold, lineHeight: 34, textAlign: 'center' },
  description: { fontSize: typography.size.regular, lineHeight: 24, marginTop: spacing.sm, maxWidth: 420, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginVertical: spacing.xl },
  dot: { borderRadius: 5, height: 8, width: 8 },
  primaryButton: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', marginTop: spacing.md, minHeight: 50, paddingHorizontal: spacing.lg, width: '100%' },
  primaryText: { fontSize: 15, fontWeight: '700' },
  preferencesContent: { alignSelf: 'center', maxWidth: 520, paddingTop: spacing.xl, width: '100%' },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.lg },
  optionList: { gap: spacing.sm },
  option: { alignItems: 'center', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: spacing.md },
  optionText: { fontSize: 15, fontWeight: '600' },
  goalRow: { flexDirection: 'row', gap: spacing.sm },
  goalOption: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 66 },
  goalNumber: { fontSize: 18, fontWeight: '700' },
  goalLabel: { fontSize: 12, marginTop: 2 },
});
