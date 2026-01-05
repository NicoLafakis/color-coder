import React, { useState, useEffect } from 'react';
import {
  Palette,
  X,
  Settings as SettingsIcon,
  Save
} from 'lucide-react';
import { colord, extend } from "colord";
import harmonies from "colord/plugins/harmonies";
import names from "colord/plugins/names";
import PaletteGenerator from './components/PaletteGenerator';
import PaletteSidebar from './components/PaletteSidebar';
import SwatchEditor from './components/SwatchEditor';
import { HistoryProvider } from './context/HistoryContext';

// Setup the colord library with necessary plugins
extend([harmonies, names]);

// --- Main App Component ---

export default function App() {
  // Core state
  const [swatches, setSwatches] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // Load saved swatches from localStorage on mount
  useEffect(() => {
    const savedSwatches = localStorage.getItem('color-coder-swatches');
    if (savedSwatches) {
      const parsed = JSON.parse(savedSwatches);
      setSwatches(parsed);
    } else {
      // Add some default swatches for new users
      const defaultSwatches = [
        {
          id: '1',
          name: 'Ocean Breeze',
          colors: [
            { hex: '#0EA5E9', role: 'primary' },
            { hex: '#0284C7', role: 'secondary' },
            { hex: '#075985', role: 'accent' },
            { hex: '#BAE6FD', role: 'surface' },
            { hex: '#F0F9FF', role: 'background' }
          ],
          createdAt: new Date().toISOString(),
          isFavorite: true,
          source: 'default'
        },
        {
          id: '2',
          name: 'Sunset Warmth',
          colors: [
            { hex: '#F97316', role: 'primary' },
            { hex: '#EA580C', role: 'secondary' },
            { hex: '#DC2626', role: 'accent' },
            { hex: '#FED7AA', role: 'surface' },
            { hex: '#FFF7ED', role: 'background' }
          ],
          createdAt: new Date().toISOString(),
          isFavorite: false,
          source: 'default'
        }
      ];
      setSwatches(defaultSwatches);
    }
  }, []);

  // Save swatches to localStorage whenever swatches change
  useEffect(() => {
    localStorage.setItem('color-coder-swatches', JSON.stringify(swatches));
  }, [swatches]);

  // Save palette from generator
  const handleSavePalette = (paletteData) => {
    const newSwatch = {
      id: Date.now().toString(),
      name: paletteData.name || `Palette ${new Date().toLocaleTimeString()}`,
      colors: paletteData.colors,
      createdAt: new Date().toISOString(),
      source: paletteData.source || 'generated',
      isFavorite: false
    };
    setSwatches(prev => [newSwatch, ...prev]);
  };

  // Load palette into generator
  const handleLoadPalette = (colors) => {
    // This will be handled by the PaletteGenerator component
    console.log('Loading palette:', colors);
  };

  // Delete swatch
  const handleDeleteSwatch = (swatchId) => {
    if (window.confirm('Are you sure you want to delete this palette?')) {
      setSwatches(prev => prev.filter(s => s.id !== swatchId));
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (swatchId) => {
    setSwatches(prev => prev.map(s => 
      s.id === swatchId ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  // Save from editor
  const handleSaveFromEditor = (swatchData) => {
    if (swatchData.id && swatches.find(s => s.id === swatchData.id)) {
      // Update existing swatch
      setSwatches(prev => prev.map(s => s.id === swatchData.id ? swatchData : s));
    } else {
      // Create new swatch
      const newSwatch = {
        ...swatchData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setSwatches(prev => [newSwatch, ...prev]);
    }
    setIsEditorOpen(false);
    setSelectedSwatch(null);
  };

  return (
    <HistoryProvider>
    <div className="relative h-screen font-sans bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-900">Color Coder</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Saved Palettes Button */}
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center px-3 py-2 space-x-2 text-sm transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Save className="w-4 h-4" />
            <span>Saved ({swatches.length})</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Generator */}
      <PaletteGenerator
        onSavePalette={handleSavePalette}
        onShowSettings={() => setShowSettings(true)}
      />

      {/* Sidebar */}
      <PaletteSidebar
        swatches={swatches}
        onLoadPalette={handleLoadPalette}
        onDeleteSwatch={handleDeleteSwatch}
        onToggleFavorite={handleToggleFavorite}
        isVisible={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Color Generation</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-600">Generate harmonious colors</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">Avoid similar hues</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Interface</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-600">Show spacebar hint</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-600">Show color names</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swatch Editor Modal */}
      {isEditorOpen && (
        <SwatchEditor
          swatch={selectedSwatch}
          onSave={handleSaveFromEditor}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedSwatch(null);
          }}
        />
      )}
    </div>
    </HistoryProvider>
  );
}