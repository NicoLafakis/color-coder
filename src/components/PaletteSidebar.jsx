import React, { useState } from 'react';
import { 
  Heart, 
  Clock, 
  Globe, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Copy
} from 'lucide-react';

const PaletteSidebar = ({ 
  swatches = [], 
  onLoadPalette, 
  onDeleteSwatch, 
  onToggleFavorite,
  isVisible,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('saved'); // saved, explore
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, name, favorite

  // Filter and sort swatches
  const filteredSwatches = swatches
    .filter(swatch => {
      if (searchTerm) {
        return swatch.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'favorite':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleLoadPalette = (swatch) => {
    const colors = swatch.colors.map(color => 
      typeof color === 'string' ? color : color.hex
    );
    onLoadPalette?.(colors);
  };

  const handleCopyPalette = async (swatch) => {
    const colors = swatch.colors.map(color => 
      typeof color === 'string' ? color : color.hex
    );
    await navigator.clipboard.writeText(colors.join(', '));
  };

  const PalettePreview = ({ swatch }) => (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Color Preview */}
      <div className="flex h-16">
        {swatch.colors.slice(0, 5).map((color, index) => {
          const colorHex = typeof color === 'string' ? color : color.hex;
          return (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: colorHex }}
            />
          );
        })}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {swatch.name}
          </h4>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {swatch.isFavorite && (
              <Heart className="w-3 h-3 text-red-500 fill-current" />
            )}
            <button
              onClick={() => onToggleFavorite?.(swatch.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Heart className={`w-3 h-3 ${swatch.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{swatch.colors.length} colors</span>
          <span>{new Date(swatch.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleLoadPalette(swatch)}
            className="flex-1 text-xs bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Load
          </button>
          <button
            onClick={() => handleCopyPalette(swatch)}
            className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteSwatch?.(swatch.id)}
            className="text-xs bg-red-100 text-red-700 py-1 px-2 rounded hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Palettes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mb-4">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>Saved</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'explore'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            disabled
          >
            <div className="flex items-center justify-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>Explore</span>
              <span className="text-xs bg-gray-200 px-1 rounded">Soon</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'saved' && (
          <>
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search palettes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="favorite">Favorites</option>
                </select>
              </div>
            </div>

            {/* Palette List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredSwatches.length > 0 ? (
                <div className="space-y-3">
                  {filteredSwatches.map(swatch => (
                    <PalettePreview key={swatch.id} swatch={swatch} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {searchTerm ? 'No palettes found' : 'No saved palettes'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search term'
                      : 'Generate some palettes and save them to see them here'
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'explore' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-600 mb-1">Coming Soon</h3>
              <p className="text-xs text-gray-500">
                Explore community palettes and trending colors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaletteSidebar;