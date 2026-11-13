import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../storage/keys';
import { readStorage, writeStorage } from '../storage/storage';

const PreferencesContext = createContext(null);
const validSystems = new Set(['Windows', 'macOS', 'Linux']);
const validGoals = new Set([3, 5, 10]);

export function PreferencesProvider({ children }) {
  const [computerType, setComputerType] = useState('Windows');
  const [dailyGoal, setDailyGoal] = useState(5);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [dismissedHints, setDismissedHints] = useState({});
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      const [savedSystem, savedGoal, savedOnboarding, savedHaptics, savedHints] = await Promise.all([
        readStorage(STORAGE_KEYS.COMPUTER_TYPE, 'Windows'),
        readStorage(STORAGE_KEYS.DAILY_GOAL, 5),
        readStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, false),
        readStorage(STORAGE_KEYS.HAPTICS, true),
        readStorage(STORAGE_KEYS.DISMISSED_HINTS, {}),
      ]);
      if (!active) return;
      setComputerType(validSystems.has(savedSystem) ? savedSystem : 'Windows');
      setDailyGoal(validGoals.has(savedGoal) ? savedGoal : 5);
      setOnboardingCompleted(savedOnboarding === true);
      setHapticsEnabled(savedHaptics !== false);
      setDismissedHints(savedHints && typeof savedHints === 'object' && !Array.isArray(savedHints) ? savedHints : {});
      setIsPreferencesLoading(false);
    }

    void loadPreferences();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isPreferencesLoading) void writeStorage(STORAGE_KEYS.COMPUTER_TYPE, computerType);
  }, [computerType, isPreferencesLoading]);

  useEffect(() => {
    if (!isPreferencesLoading) void writeStorage(STORAGE_KEYS.DAILY_GOAL, dailyGoal);
  }, [dailyGoal, isPreferencesLoading]);

  useEffect(() => {
    if (!isPreferencesLoading) void writeStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, onboardingCompleted);
  }, [isPreferencesLoading, onboardingCompleted]);

  useEffect(() => {
    if (!isPreferencesLoading) void writeStorage(STORAGE_KEYS.HAPTICS, hapticsEnabled);
  }, [hapticsEnabled, isPreferencesLoading]);

  useEffect(() => {
    if (!isPreferencesLoading) void writeStorage(STORAGE_KEYS.DISMISSED_HINTS, dismissedHints);
  }, [dismissedHints, isPreferencesLoading]);

  function dismissHint(hintId) {
    setDismissedHints((current) => ({ ...current, [hintId]: true }));
  }

  function resetPreferences() {
    setComputerType('Windows');
    setDailyGoal(5);
    setOnboardingCompleted(false);
    setHapticsEnabled(true);
    setDismissedHints({});
  }

  return (
    <PreferencesContext.Provider value={{
      computerType, setComputerType, dailyGoal, setDailyGoal,
      onboardingCompleted, setOnboardingCompleted,
      hapticsEnabled, setHapticsEnabled, dismissedHints, dismissHint,
      resetPreferences, isPreferencesLoading,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}