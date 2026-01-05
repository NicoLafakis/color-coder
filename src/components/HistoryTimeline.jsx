import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Clock,
  Star,
  Trash2,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { useHistory } from '../context/HistoryContext';

// Mini palette preview component
const PaletteThumbnail = ({ colors, isActive, isFavorite, onClick, onToggleFavorite }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200
        ${isActive
          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
          : 'hover:scale-105 hover:shadow-md'
        }
      `}
    >
      <div className="flex h-8">
        {colors.slice(0, 6).map((color, i) => (
          <div
            key={i}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Favorite star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`
          absolute top-0.5 right-0.5 p-0.5 rounded-full transition-all
          ${isFavorite
            ? 'opacity-100 text-yellow-400'
            : 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-yellow-400'
          }
        `}
      >
        <Star className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

const HistoryTimeline = ({ onRestorePalette }) => {
  const {
    history,
    currentIndex,
    undo,
    redo,
    canUndo,
    canRedo,
    goToEntry,
    toggleFavorite,
    clearHistory
  } = useHistory();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleUndo = () => {
    const entry = undo();
    if (entry) {
      onRestorePalette(entry);
    }
  };

  const handleRedo = () => {
    const entry = redo();
    if (entry) {
      onRestorePalette(entry);
    }
  };

  const handleGoToEntry = (index) => {
    const entry = goToEntry(index);
    if (entry) {
      onRestorePalette(entry);
    }
  };

  const handleClearHistory = (keepFavorites) => {
    clearHistory(keepFavorites);
    setShowClearConfirm(false);
  };

  // Get recent history (last 10 items for compact view)
  const recentHistory = [...history].reverse().slice(0, 10);
  const hasMoreHistory = history.length > 10;

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Compact Timeline Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Undo/Redo Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`
                flex items-center space-x-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${canUndo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`
                flex items-center space-x-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${canRedo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Redo</span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{history.length} saved</span>
            </div>
          </div>

          {/* Center: Recent History Thumbnails */}
          <div className="hidden md:flex items-center space-x-2 flex-1 justify-center px-4 overflow-hidden">
            {recentHistory.slice(0, 8).map((entry, i) => {
              const actualIndex = history.length - 1 - i;
              return (
                <PaletteThumbnail
                  key={entry.id}
                  colors={entry.colors}
                  isActive={actualIndex === currentIndex}
                  isFavorite={entry.isFavorite}
                  onClick={() => handleGoToEntry(actualIndex)}
                  onToggleFavorite={() => toggleFavorite(entry.id)}
                />
              );
            })}
            {hasMoreHistory && (
              <span className="text-xs text-gray-400">+{history.length - 8} more</span>
            )}
          </div>

          {/* Right: Expand/Clear Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Timeline View */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-x border-gray-200 rounded-t-xl shadow-lg max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                Palette History
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {[...history].reverse().map((entry, i) => {
                const actualIndex = history.length - 1 - i;
                const timestamp = new Date(entry.timestamp);
                const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={entry.id} className="space-y-1">
                    <PaletteThumbnail
                      colors={entry.colors}
                      isActive={actualIndex === currentIndex}
                      isFavorite={entry.isFavorite}
                      onClick={() => handleGoToEntry(actualIndex)}
                      onToggleFavorite={() => toggleFavorite(entry.id)}
                    />
                    <p className="text-[10px] text-gray-400 text-center truncate">
                      {timeStr}
                    </p>
                  </div>
                );
              })}
            </div>

            {history.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                No history yet. Generate some palettes!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear History?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will remove all palette history. You can choose to keep your favorites.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleClearHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Clear all except favorites
              </button>
              <button
                onClick={() => handleClearHistory(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
              >
                Clear everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;
