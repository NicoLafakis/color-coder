import React, { useState } from 'react';
import { X, Copy, Palette } from 'lucide-react';
import { colord } from 'colord';

const ShadesViewer = ({ color, onClose, onSelectColor }) => {
  const [copiedColor, setCopiedColor] = useState(null);
  
  if (!color) return null;
  
  const colorObj = colord(color);
  const colorName = colorObj.toName()?.name || 'Custom';
  
  // Generate tints (lighter versions)
  const generateTints = () => {
    const tints = [];
    for (let i = 1; i <= 9; i++) {
      const lightness = Math.min(95, colorObj.toHsl().l + (i * 8));
      tints.push(colord({ h: colorObj.toHsl().h, s: colorObj.toHsl().s, l: lightness }));
    }
    return tints;
  };
  
  // Generate shades (darker versions)
  const generateShades = () => {
    const shades = [];
    for (let i = 1; i <= 9; i++) {
      const lightness = Math.max(5, colorObj.toHsl().l - (i * 8));
      shades.push(colord({ h: colorObj.toHsl().h, s: colorObj.toHsl().s, l: lightness }));
    }
    return shades;
  };
  
  // Generate tones (desaturated versions)
  const generateTones = () => {
    const tones = [];
    const originalSat = colorObj.toHsl().s;
    for (let i = 1; i <= 9; i++) {
      const saturation = Math.max(0, originalSat - (i * 10));
      tones.push(colord({ h: colorObj.toHsl().h, s: saturation, l: colorObj.toHsl().l }));
    }
    return tones;
  };
  
  // Generate analogous colors
  const generateAnalogous = () => {
    const analogous = [];
    const baseHue = colorObj.toHsl().h;
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue; // Skip the original color
      const hue = (baseHue + (i * 15) + 360) % 360;
      analogous.push(colord({ h: hue, s: colorObj.toHsl().s, l: colorObj.toHsl().l }));
    }
    return analogous;
  };
  
  const tints = generateTints();
  const shades = generateShades();
  const tones = generateTones();
  const analogous = generateAnalogous();
  
  const handleCopyColor = async (colorToCopy) => {
    const hexValue = colorToCopy.toHex();
    await navigator.clipboard.writeText(hexValue);
    setCopiedColor(hexValue);
    setTimeout(() => setCopiedColor(null), 2000);
  };
  
  const ColorRow = ({ title, colors, description }) => (
    <div className="mb-6">
      <div className="mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="grid grid-cols-9 gap-2">
        {colors.map((colorItem, index) => {
          const hex = colorItem.toHex();
          const isLight = colorItem.isLight();
          return (
            <div key={index} className="group relative">
              <div
                className="aspect-square rounded-lg cursor-pointer border border-gray-200 hover:border-gray-400 transition-all group-hover:scale-105"
                style={{ backgroundColor: hex }}
                onClick={() => onSelectColor?.(hex)}
                title={`Click to use this color (${hex})`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyColor(colorItem);
                    }}
                    className={`p-1 rounded-full ${
                      isLight ? 'bg-black bg-opacity-20' : 'bg-white bg-opacity-20'
                    } hover:scale-110 transition-transform`}
                    title="Copy color"
                  >
                    <Copy className={`w-3 h-3 ${isLight ? 'text-black' : 'text-white'}`} />
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-center text-gray-600 font-mono">
                {hex.toUpperCase()}
                {copiedColor === hex && (
                  <div className="text-green-600 font-normal">Copied!</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: color }}
              />
              <div>
                <h2 className="text-2xl font-semibold">Color Variations</h2>
                <p className="text-sm text-gray-600">
                  {colorName} ({color.toUpperCase()})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Original Color */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Original Color</h3>
            <div className="flex items-center space-x-4">
              <div
                className="w-20 h-20 rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onSelectColor?.(color)}
                title="Use original color"
              />
              <div>
                <div className="text-lg font-mono">{color.toUpperCase()}</div>
                <div className="text-sm text-gray-600">{colorName}</div>
                <div className="text-sm text-gray-500">
                  HSL: {Math.round(colorObj.toHsl().h)}°, {Math.round(colorObj.toHsl().s)}%, {Math.round(colorObj.toHsl().l)}%
                </div>
              </div>
            </div>
          </div>

          {/* Tints */}
          <ColorRow
            title="Tints"
            colors={tints}
            description="Lighter versions created by adding white"
          />

          {/* Shades */}
          <ColorRow
            title="Shades"
            colors={shades}
            description="Darker versions created by adding black"
          />

          {/* Tones */}
          <ColorRow
            title="Tones"
            colors={tones}
            description="Muted versions created by reducing saturation"
          />

          {/* Analogous Colors */}
          <ColorRow
            title="Analogous Colors"
            colors={analogous}
            description="Colors adjacent on the color wheel that create harmony"
          />

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Palette className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">How to use:</div>
                <ul className="space-y-1">
                  <li>• Click any color to replace the current color in your palette</li>
                  <li>• Hover over colors to see copy button</li>
                  <li>• Use tints for backgrounds, shades for accents, tones for subtle variations</li>
                  <li>• Analogous colors work well together in designs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadesViewer;