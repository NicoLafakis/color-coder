import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const HistoryContext = createContext(null);

const MAX_HISTORY_ENTRIES = 50;
const STORAGE_KEY = 'color-coder-history';

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed.entries || []);
        setCurrentIndex(parsed.currentIndex ?? -1);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          entries: history.slice(-MAX_HISTORY_ENTRIES),
          currentIndex
        }));
      } catch (e) {
        console.error('Failed to save history:', e);
      }
    }
  }, [history, currentIndex]);

  // Add a new palette state to history
  const pushState = useCallback((paletteState) => {
    // Skip if we're currently navigating (prevents recording during undo/redo)
    if (isNavigating) {
      setIsNavigating(false);
      return;
    }

    setHistory(prev => {
      // If we're not at the end, truncate forward history
      const newHistory = currentIndex < prev.length - 1
        ? prev.slice(0, currentIndex + 1)
        : prev;

      const entry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        colors: [...paletteState.colors],
        lockedIndices: [...(paletteState.lockedIndices || [])],
        harmonyMode: paletteState.harmonyMode || 'random',
        isFavorite: false
      };

      // Limit history size
      const updatedHistory = [...newHistory, entry].slice(-MAX_HISTORY_ENTRIES);
      setCurrentIndex(updatedHistory.length - 1);

      return updatedHistory;
    });
  }, [currentIndex, isNavigating]);

  // Navigate to a specific history entry
  const goToEntry = useCallback((index) => {
    if (index >= 0 && index < history.length) {
      setIsNavigating(true);
      setCurrentIndex(index);
      return history[index];
    }
    return null;
  }, [history]);

  // Undo - go back one step
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      return goToEntry(currentIndex - 1);
    }
    return null;
  }, [currentIndex, goToEntry]);

  // Redo - go forward one step
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      return goToEntry(currentIndex + 1);
    }
    return null;
  }, [currentIndex, history.length, goToEntry]);

  // Check if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Toggle favorite on a history entry
  const toggleFavorite = useCallback((entryId) => {
    setHistory(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, isFavorite: !entry.isFavorite }
        : entry
    ));
  }, []);

  // Clear all history except favorites
  const clearHistory = useCallback((keepFavorites = true) => {
    if (keepFavorites) {
      const favorites = history.filter(e => e.isFavorite);
      setHistory(favorites);
      setCurrentIndex(favorites.length - 1);
    } else {
      setHistory([]);
      setCurrentIndex(-1);
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [history]);

  // Get current entry
  const currentEntry = history[currentIndex] || null;

  const value = {
    history,
    currentIndex,
    currentEntry,
    pushState,
    goToEntry,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleFavorite,
    clearHistory,
    isNavigating,
    setIsNavigating
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}

export default HistoryContext;
