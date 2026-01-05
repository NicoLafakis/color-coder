import React, { useState, useMemo } from 'react';
import {
  Moon,
  Sun,
  X,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Download,
  ArrowRight,
  Info
} from 'lucide-react';
import { colord } from 'colord';
import {
  DARK_MODE_ALGORITHMS,
  COLOR_ROLES,
  generateDarkPalette,
  generateThemeCSS,
  calculateDarkModeScore
} from '../utils/darkMode';

const DarkModeGenerator = ({ colors, onClose, onApplyDarkPalette }) => {
  const [algorithm, setAlgorithm] = useState('invertLightness');
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const [copied, setCopied] = useState(null);
  const [customAdjustments, setCustomAdjustments] = useState({});
  const [previewMode, setPreviewMode] = useState('split'); // split, light, dark

  // Generate dark palette based on selected algorithm
  const darkPalette = useMemo(() => {
    const generated = generateDarkPalette(colors, algorithm);

    // Apply custom adjustments
    return generated.map((item, index) => {
      if (customAdjustments[index]) {
        const adjustedColor = colord(item.dark)
          .lighten(customAdjustments[index].lightness || 0)
          .saturate(customAdjustments[index].saturation || 0)
          .rotate(customAdjustments[index].hue || 0)
          .toHex();
        return { ...item, dark: adjustedColor };
      }
      return item;
    });
  }, [colors, algorithm, customAdjustments]);

  // Extract light and dark colors arrays
  const lightColors = colors;
  const darkColors = darkPalette.map(p => p.dark);

  // Calculate accessibility score
  const accessibilityScore = useMemo(() =>
    calculateDarkModeScore(darkColors),
    [darkColors]
  );

  // Generate CSS output
  const cssOutput = useMemo(() =>
    generateThemeCSS(lightColors, darkColors),
    [lightColors, darkColors]
  );

  // Handle copying
  const handleCopy = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Handle custom adjustment
  const handleAdjustment = (index, property, value) => {
    setCustomAdjustments(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [property]: value
      }
    }));
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setCustomAdjustments({});
  };

  // Apply dark palette to main generator
  const handleApply = () => {
    onApplyDarkPalette?.(darkColors);
    onClose();
  };

  // Export CSS file
  const handleExportCSS = () => {
    const blob = new Blob([cssOutput], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-colors.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dark Mode Generator</h2>
              <p className="text-xs text-gray-400">Generate a complementary dark theme from your palette</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Algorithm Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700">
                Generation Algorithm
              </label>
              <button
                onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                {showAlgorithmInfo ? 'Hide info' : 'Learn more'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(DARK_MODE_ALGORITHMS).map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setAlgorithm(algo.id)}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all
                    ${algorithm === algo.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <p className="font-bold text-sm text-gray-900">{algo.name}</p>
                  {showAlgorithmInfo && (
                    <p className="text-xs text-gray-500 mt-1">{algo.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Score */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">Dark Mode Accessibility Score</h3>
                <p className="text-xs text-gray-500">Based on WCAG contrast ratios with dark background</p>
              </div>
              <div className={`
                text-3xl font-black
                ${accessibilityScore >= 80 ? 'text-green-600' :
                  accessibilityScore >= 50 ? 'text-yellow-600' : 'text-red-600'}
              `}>
                {accessibilityScore}
                <span className="text-lg text-gray-400">/100</span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  accessibilityScore >= 80 ? 'bg-green-500' :
                  accessibilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${accessibilityScore}%` }}
              />
            </div>
          </div>

          {/* Preview Mode Toggle */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setPreviewMode('light')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${previewMode === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${previewMode === 'split' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              Split View
            </button>
            <button
              onClick={() => setPreviewMode('dark')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${previewMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>

          {/* Color Comparison */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Color Comparison</h3>

            {/* Palette Preview */}
            <div className={`grid ${previewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
              {/* Light Palette */}
              {(previewMode === 'split' || previewMode === 'light') && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-700">Light Mode</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    {lightColors.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-16 relative group"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                            colord(color).isLight() ? 'bg-black/20 text-black' : 'bg-white/20 text-white'
                          }`}>
                            {color.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dark Palette */}
              {(previewMode === 'split' || previewMode === 'dark') && (
                <div className="bg-gray-900 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Dark Mode</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-700">
                    {darkColors.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-16 relative group"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                            colord(color).isLight() ? 'bg-black/20 text-black' : 'bg-white/20 text-white'
                          }`}>
                            {color.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Individual Color Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {darkPalette.map((item, index) => {
                const role = COLOR_ROLES[index] || { name: `Color ${index + 1}` };
                const adjustment = customAdjustments[index] || {};

                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {role.name}
                      </span>
                      <button
                        onClick={() => handleCopy(item.dark, `color-${index}`)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy dark color"
                      >
                        {copied === `color-${index}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-200 shadow-inner"
                        style={{ backgroundColor: item.light }}
                        title={`Light: ${item.light}`}
                      />
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-600 shadow-inner"
                        style={{ backgroundColor: item.dark }}
                        title={`Dark: ${item.dark}`}
                      />
                      <div className="flex-1 text-right">
                        <p className="text-[10px] font-mono text-gray-400">{item.light}</p>
                        <p className="text-xs font-mono font-bold text-gray-700">{item.dark}</p>
                      </div>
                    </div>

                    {/* Fine-tune Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-8">L</span>
                        <input
                          type="range"
                          min="-0.3"
                          max="0.3"
                          step="0.05"
                          value={adjustment.lightness || 0}
                          onChange={(e) => handleAdjustment(index, 'lightness', parseFloat(e.target.value))}
                          className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-8">S</span>
                        <input
                          type="range"
                          min="-0.3"
                          max="0.3"
                          step="0.05"
                          value={adjustment.saturation || 0}
                          onChange={(e) => handleAdjustment(index, 'saturation', parseFloat(e.target.value))}
                          className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CSS Output */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700">CSS Variables</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(cssOutput, 'css')}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  {copied === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'css' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleExportCSS}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
              {cssOutput}
            </pre>
          </div>

          {/* UI Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">UI Preview</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Light Mode Preview */}
              <div
                className="p-4 rounded-xl border"
                style={{ backgroundColor: lightColors[4] || '#ffffff' }}
              >
                <div
                  className="p-3 rounded-lg mb-3"
                  style={{ backgroundColor: lightColors[3] || '#f5f5f5' }}
                >
                  <p className="text-sm font-bold mb-2" style={{ color: lightColors[0] }}>
                    Light Mode Card
                  </p>
                  <p className="text-xs" style={{ color: colord(lightColors[4] || '#ffffff').isDark() ? '#fff' : '#333' }}>
                    Preview text content
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-bold"
                  style={{ backgroundColor: lightColors[0] }}
                >
                  Primary Button
                </button>
              </div>

              {/* Dark Mode Preview */}
              <div
                className="p-4 rounded-xl border border-gray-700"
                style={{ backgroundColor: darkColors[4] || '#121212' }}
              >
                <div
                  className="p-3 rounded-lg mb-3"
                  style={{ backgroundColor: darkColors[3] || '#1e1e1e' }}
                >
                  <p className="text-sm font-bold mb-2" style={{ color: darkColors[0] }}>
                    Dark Mode Card
                  </p>
                  <p className="text-xs" style={{ color: colord(darkColors[4] || '#121212').isLight() ? '#333' : '#ccc' }}>
                    Preview text content
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-bold"
                  style={{ backgroundColor: darkColors[0] }}
                >
                  Primary Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={resetAdjustments}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Reset Adjustments</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Apply Dark Palette
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkModeGenerator;
