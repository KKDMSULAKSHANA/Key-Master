import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import bundledShortcuts from '../data/shortcuts.json';
import { STORAGE_KEYS } from '../storage/keys';
import { readStorage, writeStorage } from '../storage/storage';

const ShortcutsContext = createContext(null);

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function shortcutArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item.id === 'string')
    : [];
}

export function ShortcutsProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [learned, setLearned] = useState([]);
  const [notes, setNotes] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [userShortcuts, setUserShortcuts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSavedData() {
      const [savedFavorites, savedLearned, savedNotes, savedSearches, savedHistory, savedUserShortcuts] =
        await Promise.all([
          readStorage(STORAGE_KEYS.FAVORITES, []),
          readStorage(STORAGE_KEYS.LEARNED, []),
          readStorage(STORAGE_KEYS.NOTES, {}),
          readStorage(STORAGE_KEYS.RECENT_SEARCHES, []),
          readStorage(STORAGE_KEYS.QUIZ_HISTORY, []),
          readStorage(STORAGE_KEYS.USER_SHORTCUTS, []),
        ]);

      if (!active) {
        return;
      }

      setFavorites(stringArray(savedFavorites));
      setLearned(stringArray(savedLearned));
      setNotes(objectValue(savedNotes));
      setRecentSearches(stringArray(savedSearches).slice(0, 5));
      setQuizHistory(Array.isArray(savedHistory) ? savedHistory : []);
      setUserShortcuts(shortcutArray(savedUserShortcuts));
      setIsLoading(false);
    }

    void loadSavedData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.LEARNED, learned);
  }, [learned, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.NOTES, notes);
  }, [notes, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.RECENT_SEARCHES, recentSearches);
  }, [recentSearches, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.QUIZ_HISTORY, quizHistory);
  }, [quizHistory, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    void writeStorage(STORAGE_KEYS.USER_SHORTCUTS, userShortcuts);
  }, [userShortcuts, isLoading]);

  const shortcuts = useMemo(() => {
    const userIds = new Set(userShortcuts.map((shortcut) => shortcut.id));
    const bundled = bundledShortcuts.filter((shortcut) => !userIds.has(shortcut.id));
    return [...bundled, ...userShortcuts];
  }, [userShortcuts]);

  function toggleFavorite(shortcutId) {
    setFavorites((current) => current.includes(shortcutId)
      ? current.filter((id) => id !== shortcutId)
      : [...current, shortcutId]);
  }

  function setShortcutLearned(shortcutId, isLearned = true) {
    setLearned((current) => isLearned
      ? current.includes(shortcutId) ? current : [...current, shortcutId]
      : current.filter((id) => id !== shortcutId));
  }

  function saveNote(shortcutId, note) {
    setNotes((current) => {
      const next = { ...current };
      if (note.trim()) {
        next[shortcutId] = note;
      } else {
        delete next[shortcutId];
      }
      return next;
    });
  }

  function addRecentSearch(search) {
    const value = search.trim();
    if (!value) return;
    setRecentSearches((current) => [
      value,
      ...current.filter((item) => item.toLowerCase() !== value.toLowerCase()),
    ].slice(0, 5));
  }

  function saveQuizSession(session) {
    setQuizHistory((current) => [session, ...current].slice(0, 100));
  }

  function saveUserShortcut(shortcut) {
    setUserShortcuts((current) => [
      ...current.filter((item) => item.id !== shortcut.id),
      shortcut,
    ]);
  }

  function deleteUserShortcut(shortcutId) {
    setUserShortcuts((current) => current.filter((item) => item.id !== shortcutId));
    setFavorites((current) => current.filter((id) => id !== shortcutId));
    setLearned((current) => current.filter((id) => id !== shortcutId));
    setNotes((current) => {
      const next = { ...current };
      delete next[shortcutId];
      return next;
    });
  }

  function clearFavorites() {
    setFavorites([]);
  }

  function clearLearned() {
    setLearned([]);
  }

  function clearNotes() {
    setNotes({});
  }

  function clearUserShortcuts() {
    const userIds = new Set(userShortcuts.map((shortcut) => shortcut.id));
    setUserShortcuts([]);
    setFavorites((current) => current.filter((id) => !userIds.has(id)));
    setLearned((current) => current.filter((id) => !userIds.has(id)));
    setNotes((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !userIds.has(id))));
  }

  function resetShortcutData() {
    setFavorites([]);
    setLearned([]);
    setNotes({});
    setRecentSearches([]);
    setQuizHistory([]);
    setUserShortcuts([]);
  }

  const value = {
    shortcuts,
    bundledShortcuts,
    userShortcuts,
    isLoading,
    favorites,
    learned,
    notes,
    recentSearches,
    quizHistory,
    toggleFavorite,
    setShortcutLearned,
    saveNote,
    addRecentSearch,
    saveQuizSession,
    saveUserShortcut,
    deleteUserShortcut,
    clearFavorites,
    clearLearned,
    clearNotes,
    clearUserShortcuts,
    resetShortcutData,
    isFavorite: (shortcutId) => favorites.includes(shortcutId),
    isLearned: (shortcutId) => learned.includes(shortcutId),
    getNote: (shortcutId) => notes[shortcutId] ?? '',
    isUserShortcut: (shortcutId) => userShortcuts.some((item) => item.id === shortcutId),
  };

  return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
}

export function useShortcuts() {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error('useShortcuts must be used within ShortcutsProvider');
  }
  return context;
}