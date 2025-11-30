import React, { useState, useEffect } from 'react';
import { X, Copy, Palette, Trash2 } from 'lucide-react';
import { colord } from 'colord';

const FavoritesViewer = ({ onClose, onSelectColor }) => {
  const [favoriteColors, setFavoriteColors] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteColors');
    if (savedFavorites) {
      setFavoriteColors(JSON.parse(savedFavorites));
    }
  }, []);

  const handleCopyColor = async (color) => {
    await navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleRemoveFavorite = (colorToRemove) => {
    const newFavorites = favoriteColors.filter(color => color !== colorToRemove);
    setFavoriteColors(newFavorites);
    localStorage.setItem('favoriteColors', JSON.stringify(newFavorites));
  };

  const clearAllFavorites = () => {
    setFavoriteColors([]);
    localStorage.removeItem('favoriteColors');
  };

  if (favoriteColors.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Favorite Colors</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No favorite colors yet</p>
            <p className="text-sm text-gray-400">
              Click the heart icon on any color to add it to your favorites
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Favorite Colors ({favoriteColors.length})</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAllFavorites}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {favoriteColors.map((color, index) => {
              const colorObj = colord(color);
              const colorName = colorObj.toName()?.name || 'Custom';
              const isLight = colorObj.isLight();
              
              return (
                <div key={index} className="group">
                  <div
                    className="aspect-square rounded-lg cursor-pointer border border-gray-200 hover:border-gray-400 transition-all group-hover:scale-105 relative"
                    style={{ backgroundColor: color }}
                    onClick={() => onSelectColor?.(color)}
                    title={`Use ${colorName} (${color})`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyColor(color);
                          }}
                          className={`p-1 rounded-full ${
                            isLight ? 'bg-black bg-opacity-20' : 'bg-white bg-opacity-20'
                          } hover:scale-110 transition-transform`}
                          title="Copy color"
                        >
                          <Copy className={`w-3 h-3 ${isLight ? 'text-black' : 'text-white'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(color);
                          }}
                          className={`p-1 rounded-full ${
                            isLight ? 'bg-black bg-opacity-20' : 'bg-white bg-opacity-20'
                          } hover:scale-110 transition-transform`}
                          title="Remove from favorites"
                        >
                          <Trash2 className={`w-3 h-3 ${isLight ? 'text-black' : 'text-white'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className="text-xs font-mono text-gray-600">
                      {color}
                      {copiedColor === color && (
                        <div className="text-green-600 font-normal">Copied!</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{colorName}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Palette className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">How to use:</div>
                <ul className="space-y-1">
                  <li>• Click any color to use it in your current palette</li>
                  <li>• Hover over colors to copy or remove them</li>
                  <li>• Add colors to favorites by clicking the heart icon in the generator</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesViewer;