import React, { useState } from 'react';
import { X, Plus, Palette, Save } from 'lucide-react';
import { colord } from 'colord';

const SwatchEditor = ({ swatch, onSave, onClose }) => {
  const [name, setName] = useState(swatch?.name || 'New Swatch');
  const [colors, setColors] = useState(swatch?.colors || [
    { hex: '#FF6B6B', role: 'primary' },
    { hex: '#4ECDC4', role: 'secondary' },
    { hex: '#45B7D1', role: 'accent' },
    { hex: '#96CEB4', role: 'success' },
    { hex: '#FFEAA7', role: 'warning' }
  ]);

  const colorRoles = [
    'primary', 'secondary', 'accent', 'success', 'warning', 'error', 
    'text', 'background', 'surface', 'border', 'highlight', 'muted'
  ];

  const addColor = () => {
    setColors([...colors, { hex: '#FFFFFF', role: '' }]);
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const generateHarmony = (baseColorHex, harmonyType) => {
    const baseColor = colord(baseColorHex);
    if (!baseColor.isValid()) return;

    let harmonyColors = [];
    switch (harmonyType) {
      case 'analogous':
        harmonyColors = baseColor.harmonies('analogous');
        break;
      case 'complementary':
        harmonyColors = baseColor.harmonies('complementary');
        break;
      case 'triadic':
        harmonyColors = baseColor.harmonies('triadic');
        break;
      case 'monochromatic':
        harmonyColors = baseColor.harmonies('monochromatic');
        break;
    }

    const newColors = harmonyColors.slice(0, 5).map((color, index) => ({
      hex: color.toHex(),
      role: index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'accent' : ''
    }));

    setColors(newColors);
  };

  const handleSave = () => {
    const swatchData = {
      id: swatch?.id || Date.now().toString(),
      name,
      colors: colors.filter(c => c.hex), // Remove empty colors
      createdAt: swatch?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: swatch?.source || 'manual'
    };
    onSave(swatchData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Palette className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              {swatch ? 'Edit Swatch' : 'Create New Swatch'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Swatch Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Swatch Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter swatch name..."
            />
          </div>

          {/* Quick Harmony Generation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Generate from Base Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                onChange={(e) => generateHarmony(e.target.value, 'analogous')}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => colors[0] && generateHarmony(colors[0].hex, 'analogous')}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded"
                >
                  Analogous
                </button>
                <button
                  onClick={() => colors[0] && generateHarmony(colors[0].hex, 'complementary')}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded"
                >
                  Complementary
                </button>
                <button
                  onClick={() => colors[0] && generateHarmony(colors[0].hex, 'triadic')}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded"
                >
                  Triadic
                </button>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Colors ({colors.length})
              </label>
              <button
                onClick={addColor}
                className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Color
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={color.hex}
                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#FFFFFF"
                  />
                  <select
                    value={color.role || ''}
                    onChange={(e) => updateColor(index, 'role', e.target.value)}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">No role</option>
                    {colorRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeColor(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="flex space-x-2">
              {colors.map((color, index) => (
                <div key={index} className="flex-1">
                  <div 
                    className="h-16 rounded border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs text-center mt-1 text-gray-600">
                    {color.role || `Color ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Swatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwatchEditor;