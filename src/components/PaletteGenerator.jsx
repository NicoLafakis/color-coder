import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Save,
  Heart,
  Download,
  Share2,
  Settings,
  Lock,
  Unlock,
  Shuffle
} from 'lucide-react';
import { colord, extend } from 'colord';
import harmonies from 'colord/plugins/harmonies';
import names from 'colord/plugins/names';

// Extend colord with necessary plugins
extend([harmonies, names]);
import ColorStrip from './ColorStrip';
import ContrastChecker from './ContrastChecker';
import ShadesViewer from './ShadesViewer';
import DesignPrinciples from './DesignPrinciples';
import { Palette as PaletteIcon, Layout, Info } from 'lucide-react';

const PaletteGenerator = ({ onSavePalette, onShowSettings }) => {
  const [colors, setColors] = useState([]);
  const [lockedColors, setLockedColors] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSpacebarHint, setShowSpacebarHint] = useState(true);
  const [paletteSize, setPaletteSize] = useState(5);
  const [showContrastChecker, setShowContrastChecker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [showShadesViewer, setShowShadesViewer] = useState(false);
  const [keyboardFeedback, setKeyboardFeedback] = useState(null);
  const [favoriteColors, setFavoriteColors] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [generationMode, setGenerationMode] = useState('random'); // random, monotone, duotone, tritone
  const [showDesignPrinciples, setShowDesignPrinciples] = useState(false);

  // Generate a random color
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const lightness = 30 + Math.floor(Math.random() * 40); // 30-70%
    return colord({ h: hue, s: saturation, l: lightness }).toHex();
  };

  // Generate initial palette
  const generatePalette = useCallback((keepLocked = false) => {
    setIsGenerating(true);

    // Small delay for animation effect
    setTimeout(() => {
      setColors(currentColors => {
        let newColors = [];

        // Decide the seed color
        const firstLockedIndex = lockedColors.indexOf(true);
        const hasLocked = firstLockedIndex !== -1;

        // If we "keep locked" but none are locked, or if we don't keep locked, generate a new seed base
        const baseColor = (keepLocked && hasLocked)
          ? currentColors[firstLockedIndex]
          : generateRandomColor();

        if (generationMode === 'random') {
          for (let i = 0; i < paletteSize; i++) {
            if (keepLocked && lockedColors[i] && currentColors[i]) {
              newColors.push(currentColors[i]);
            } else {
              newColors.push(generateRandomColor());
            }
          }
          return newColors;
        }

        // Harmony modes (Monotone, Duotone, Tritone)
        const harmonyType = generationMode === 'monotone' ? 'monochromatic' :
          generationMode === 'duotone' ? 'complementary' :
            generationMode === 'tritone' ? 'triadic' : 'complementary';

        let harmonyRes = [];
        try {
          harmonyRes = colord(baseColor).harmonies(harmonyType);
          if (!harmonyRes || !Array.isArray(harmonyRes)) {
            harmonyRes = [colord(baseColor)];
          }
        } catch (e) {
          console.error("Harmony generation failed:", e);
          harmonyRes = [colord(baseColor)];
        }

        const baseHarmonyColors = harmonyRes.map(c => c.toHex());

        for (let i = 0; i < paletteSize; i++) {
          if (keepLocked && lockedColors[i] && currentColors[i]) {
            newColors.push(currentColors[i]);
          } else {
            if (i < baseHarmonyColors.length) {
              newColors.push(baseHarmonyColors[i]);
            } else {
              // Create variations for the remaining slots
              const seedIndex = i % baseHarmonyColors.length;
              const seed = baseHarmonyColors[seedIndex];
              const shift = Math.floor(i / baseHarmonyColors.length) * 15;

              if (i % 2 === 0) {
                newColors.push(colord(seed).lighten(shift / 100).toHex());
              } else {
                newColors.push(colord(seed).darken(shift / 100).toHex());
              }
            }
          }
        }
        return newColors;
      });
      setIsGenerating(false);
      setShowSpacebarHint(false);
    }, 200);
  }, [lockedColors, paletteSize, generationMode]);

  // Initialize with first palette
  useEffect(() => {
    if (colors.length === 0) {
      generatePalette();
      setLockedColors(new Array(paletteSize).fill(false));
    }
  }, [colors.length, paletteSize]);

  // Load favorite colors from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteColors');
    if (savedFavorites) {
      setFavoriteColors(JSON.parse(savedFavorites));
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Skip if typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Spacebar - Generate new palette
      if (event.code === 'Space') {
        event.preventDefault();
        generatePalette(true); // Keep locked colors
        return;
      }

      // CTRL + Number keys - Toggle lock for specific colors
      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        const numberKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
        const keyIndex = numberKeys.indexOf(event.code);

        if (keyIndex !== -1) {
          event.preventDefault();
          const colorIndex = keyIndex; // 0-based index
          if (colorIndex < colors.length) {
            toggleLock(colorIndex);
            const lockStatus = !lockedColors[colorIndex] ? 'locked' : 'unlocked';
            setKeyboardFeedback(`Color ${colorIndex + 1} ${lockStatus}`);
            setTimeout(() => setKeyboardFeedback(null), 1500);
          }
          return;
        }

        // CTRL + C - Copy palette
        if (event.code === 'KeyC') {
          event.preventDefault();
          const paletteString = colors.join(', ');
          navigator.clipboard.writeText(paletteString);
          setKeyboardFeedback('Palette copied to clipboard!');
          setTimeout(() => setKeyboardFeedback(null), 2000);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [generatePalette]);

  // Toggle lock for a specific color
  const toggleLock = (index) => {
    const newLockedColors = [...lockedColors];
    newLockedColors[index] = !newLockedColors[index];
    setLockedColors(newLockedColors);
  };

  // Change a specific color
  const changeColor = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  // Remove a color from palette
  const removeColor = (index) => {
    if (colors.length <= 3) return; // Minimum 3 colors

    const newColors = colors.filter((_, i) => i !== index);
    const newLockedColors = lockedColors.filter((_, i) => i !== index);

    setColors(newColors);
    setLockedColors(newLockedColors);
    setPaletteSize(newColors.length);
  };

  // Check contrast for a color
  const checkContrast = (index) => {
    setSelectedColorIndex(index);
    setShowContrastChecker(true);
  };

  // View shades for a color
  const viewShades = (index) => {
    setSelectedColorIndex(index);
    setShowShadesViewer(true);
  };

  // Select a color from shades viewer
  const selectColorFromShades = (newColor) => {
    if (selectedColorIndex !== null) {
      changeColor(selectedColorIndex, newColor);
    }
    setShowShadesViewer(false);
    setSelectedColorIndex(null);
  };

  // Toggle favorite color
  const toggleFavorite = (color) => {
    const colorUpper = color.toUpperCase();
    const isCurrentlyFavorite = favoriteColors.includes(colorUpper);

    let newFavorites;
    if (isCurrentlyFavorite) {
      newFavorites = favoriteColors.filter(fav => fav !== colorUpper);
    } else {
      newFavorites = [...favoriteColors, colorUpper];
    }

    setFavoriteColors(newFavorites);
    localStorage.setItem('favoriteColors', JSON.stringify(newFavorites));

    // Show feedback
    const action = isCurrentlyFavorite ? 'removed from' : 'added to';
    setKeyboardFeedback(`Color ${action} favorites`);
    setTimeout(() => setKeyboardFeedback(null), 1500);
  };

  // Drag and drop functions
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    const newColors = [...colors];
    const newLockedColors = [...lockedColors];

    // Move color and locked state
    const draggedColor = newColors[draggedIndex];
    const draggedLocked = newLockedColors[draggedIndex];

    newColors.splice(draggedIndex, 1);
    newLockedColors.splice(draggedIndex, 1);

    newColors.splice(dropIndex, 0, draggedColor);
    newLockedColors.splice(dropIndex, 0, draggedLocked);

    setColors(newColors);
    setLockedColors(newLockedColors);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnter = (index) => {
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  // Handle saving palette
  const handleSavePalette = () => {
    const palette = {
      colors: colors.map((color, index) => ({
        hex: color,
        role: index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'accent' : ''
      })),
      name: `Palette ${new Date().toLocaleTimeString()}`,
      source: 'generated'
    };
    onSavePalette?.(palette);
  };

  // Export palette
  const exportPalette = () => {
    const paletteData = {
      colors: colors,
      created: new Date().toISOString(),
      format: 'hex'
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palette-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Share palette
  const sharePalette = async () => {
    const paletteUrl = `https://colorhunt.co/palette/${colors.join('-').replace(/#/g, '')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Color Palette',
          text: `Check out this color palette: ${colors.join(', ')}`,
          url: paletteUrl
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(colors.join(', '));
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(colors.join(', '));
    }
  };

  const handleCopyColor = (colorValue) => {
    // This will be handled by the ColorStrip component
    console.log('Color copied:', colorValue);
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Color Generator</h1>
            {showSpacebarHint && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Press <kbd className="bg-white px-2 py-1 rounded shadow text-xs">SPACE</kbd> to generate!
              </div>
            )}

            {/* Mode Select */}
            <div className="flex bg-gray-100 p-1 rounded-lg ml-2">
              {[
                { id: 'random', label: 'Random', icon: <Shuffle className="w-3.5 h-3.5" /> },
                { id: 'monotone', label: 'Monotone', icon: <PaletteIcon className="w-3.5 h-3.5" /> },
                { id: 'duotone', label: 'Duotone', icon: <Layout className="w-3.5 h-3.5" /> },
                { id: 'tritone', label: 'Tritone', icon: <Info className="w-3.5 h-3.5" /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setGenerationMode(mode.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${generationMode === mode.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Lock All / Unlock All */}
            <button
              onClick={() => setLockedColors(lockedColors.every(locked => locked) ? new Array(5).fill(false) : new Array(5).fill(true))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={lockedColors.every(locked => locked) ? 'Unlock all colors' : 'Lock all colors'}
            >
              {lockedColors.every(locked => locked) ? (
                <Unlock className="w-5 h-5 text-gray-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Design Principles Toggle */}
            <button
              onClick={() => setShowDesignPrinciples(true)}
              className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
              title="View Design Insights & Principles"
            >
              <Layout className="w-4 h-4" />
              <span className="font-medium">Design Insights</span>
            </button>

            {/* Generate Button */}
            <button
              onClick={() => generatePalette(true)}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Generate</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSavePalette}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>

            {/* Export Button */}
            <button
              onClick={exportPalette}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export palette"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>

            {/* Share Button */}
            <button
              onClick={sharePalette}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share palette"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onShowSettings}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Feedback */}
      {keyboardFeedback && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg z-10 transition-all duration-300">
          {keyboardFeedback}
        </div>
      )}

      {/* Color Strips */}
      <div className="flex-1 flex">
        {colors.map((color, index) => (
          <ColorStrip
            key={`${color}-${index}`}
            color={color}
            index={index}
            isLocked={lockedColors[index]}
            onToggleLock={toggleLock}
            onColorChange={changeColor}
            onCopyColor={handleCopyColor}
            onRemoveColor={removeColor}
            onCheckContrast={checkContrast}
            onViewShades={viewShades}
            onToggleFavorite={toggleFavorite}
            favoriteColors={favoriteColors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDraggedOver={draggedOverIndex === index}
            canRemove={colors.length > 3}
            isGenerating={isGenerating}
          />
        ))}
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Colors: {colors.length}</span>
            <span>Locked: {lockedColors.filter(locked => locked).length}</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>SPACEBAR: Generate • CTRL+1-9: Lock/Unlock • CTRL+C: Copy</span>
          </div>
        </div>
      </div>

      {/* Contrast Checker Modal */}
      {showContrastChecker && (
        <ContrastChecker
          colors={colors}
          selectedIndex={selectedColorIndex}
          onClose={() => {
            setShowContrastChecker(false);
            setSelectedColorIndex(null);
          }}
        />
      )}

      {/* Shades Viewer Modal */}
      {showShadesViewer && selectedColorIndex !== null && (
        <ShadesViewer
          color={colors[selectedColorIndex]}
          onClose={() => {
            setShowShadesViewer(false);
            setSelectedColorIndex(null);
          }}
          onSelectColor={selectColorFromShades}
        />
      )}

      {/* Design Principles Modal */}
      {showDesignPrinciples && (
        <DesignPrinciples
          colors={colors}
          onClose={() => setShowDesignPrinciples(false)}
        />
      )}
    </div>
  );
};

export default PaletteGenerator;