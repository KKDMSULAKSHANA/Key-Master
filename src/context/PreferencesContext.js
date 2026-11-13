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
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      const [savedSystem, savedGoal, savedOnboarding] = await Promise.all([
        readStorage(STORAGE_KEYS.COMPUTER_TYPE, 'Windows'),
        readStorage(STORAGE_KEYS.DAILY_GOAL, 5),
        readStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, false),
      ]);
      if (!active) return;
      setComputerType(validSystems.has(savedSystem) ? savedSystem : 'Windows');
      setDailyGoal(validGoals.has(savedGoal) ? savedGoal : 5);
      setOnboardingCompleted(savedOnboarding === true);
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

  return (
    <PreferencesContext.Provider value={{ computerType, setComputerType, dailyGoal, setDailyGoal, onboardingCompleted, setOnboardingCompleted, isPreferencesLoading }}>
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