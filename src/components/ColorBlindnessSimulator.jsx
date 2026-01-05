import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  ChevronDown,
  X,
  Info
} from 'lucide-react';
import {
  CVD_TYPES,
  simulatePalette,
  detectConflicts,
  calculateAccessibilityScore
} from '../utils/colorBlindness';

const ColorBlindnessSimulator = ({ colors, onClose }) => {
  const [selectedType, setSelectedType] = useState('protanopia');
  const [showDropdown, setShowDropdown] = useState(false);

  // Simulate colors for selected CVD type
  const simulatedColors = useMemo(() =>
    simulatePalette(colors, selectedType),
    [colors, selectedType]
  );

  // Detect conflicts for selected type
  const conflicts = useMemo(() =>
    detectConflicts(colors, selectedType),
    [colors, selectedType]
  );

  // Calculate overall accessibility score
  const accessibilityScore = useMemo(() =>
    calculateAccessibilityScore(colors),
    [colors]
  );

  // Get all CVD types for the dropdown
  const cvdOptions = Object.values(CVD_TYPES).filter(t => t.id !== 'normal');

  const selectedCvd = CVD_TYPES[selectedType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Color Blindness Simulation</h2>
              <p className="text-xs text-gray-500">See how your palette appears to people with color vision deficiency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Accessibility Score */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">Accessibility Score</h3>
                <p className="text-xs text-gray-500">Based on color distinguishability across all CVD types</p>
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

            {/* Score bar */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${accessibilityScore >= 80 ? 'bg-green-500' :
                    accessibilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${accessibilityScore}%` }}
              />
            </div>
          </div>

          {/* CVD Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Simulation Type
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-3 h-3 rounded-full
                    ${selectedType.includes('protan') ? 'bg-red-400' :
                      selectedType.includes('deuter') ? 'bg-green-400' :
                        selectedType.includes('tritan') ? 'bg-blue-400' :
                          'bg-gray-400'}
                  `} />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedCvd.name}</p>
                    <p className="text-xs text-gray-500">{selectedCvd.description}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  {cvdOptions.map((cvd) => (
                    <button
                      key={cvd.id}
                      onClick={() => {
                        setSelectedType(cvd.id);
                        setShowDropdown(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors
                        ${selectedType === cvd.id ? 'bg-indigo-50' : ''}
                      `}
                    >
                      <div className={`
                        w-3 h-3 rounded-full
                        ${cvd.id.includes('protan') ? 'bg-red-400' :
                          cvd.id.includes('deuter') ? 'bg-green-400' :
                            cvd.id.includes('tritan') ? 'bg-blue-400' :
                              'bg-gray-400'}
                      `} />
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">{cvd.name}</p>
                        <p className="text-xs text-gray-500">{cvd.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{cvd.prevalence}</span>
                      {selectedType === cvd.id && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color Comparison */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Color Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Original Palette */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Normal Vision
                </p>
                <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-20 relative group"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono px-1 py-0.5 bg-black/50 text-white rounded">
                          {color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Palette */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <EyeOff className="w-3 h-3 mr-1" />
                  {selectedCvd.name}
                </p>
                <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  {simulatedColors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-20 relative group"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono px-1 py-0.5 bg-black/50 text-white rounded">
                          {color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Individual Color Comparison</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {colors.map((color, i) => {
                const hasConflict = conflicts.some(c => c.index1 === i || c.index2 === i);
                return (
                  <div key={i} className={`
                    p-2 rounded-lg border-2 transition-colors
                    ${hasConflict ? 'border-orange-300 bg-orange-50' : 'border-gray-100 bg-gray-50'}
                  `}>
                    <div className="flex space-x-1 mb-2">
                      <div
                        className="flex-1 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: color }}
                        title="Original"
                      />
                      <div
                        className="flex-1 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: simulatedColors[i] }}
                        title="Simulated"
                      />
                    </div>
                    <p className="text-[10px] text-center text-gray-500 font-mono truncate">
                      {color.toUpperCase()}
                    </p>
                    {hasConflict && (
                      <div className="flex items-center justify-center mt-1">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                Potential Conflicts ({conflicts.length})
              </h3>
              <div className="space-y-2">
                {conflicts.map((conflict, i) => (
                  <div
                    key={i}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${conflict.severity === 'high'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-orange-50 border-orange-200'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-200"
                          style={{ backgroundColor: conflict.color1 }}
                        />
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-200"
                          style={{ backgroundColor: conflict.color2 }}
                        />
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex space-x-1">
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-200"
                          style={{ backgroundColor: conflict.simulated1 }}
                        />
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-200"
                          style={{ backgroundColor: conflict.simulated2 }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${conflict.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                        {conflict.severity === 'high' ? 'Hard to distinguish' : 'May be confusing'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Distance: {conflict.normalDistance} → {conflict.simulatedDistance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Conflicts Message */}
          {conflicts.length === 0 && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">No conflicts detected!</p>
              <p className="text-green-600 text-sm mt-1">
                Your palette maintains good color distinction for {selectedCvd.name}
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About Color Vision Deficiency</p>
                <p className="text-blue-600 text-xs">
                  Approximately 8% of men and 0.5% of women have some form of color vision deficiency.
                  Designing with CVD in mind ensures your color choices work for everyone.
                  Consider using patterns, textures, or labels in addition to color to convey information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorBlindnessSimulator;
