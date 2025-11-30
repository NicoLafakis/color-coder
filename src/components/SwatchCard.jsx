import React, { useState } from 'react';
import { Edit3, Trash2, Copy, Download, Heart, HeartOff } from 'lucide-react';

const SwatchCard = ({ swatch, onEdit, onDelete, onDuplicate, onToggleFavorite, onExport }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySwatchData = () => {
    const swatchData = {
      name: swatch.name,
      colors: swatch.colors,
      roles: swatch.roles
    };
    copyToClipboard(JSON.stringify(swatchData, null, 2));
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-800 truncate">{swatch.name}</h3>
          {swatch.isFavorite && <Heart className="w-4 h-4 ml-2 text-red-500 fill-current" />}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleFavorite(swatch.id)}
            className="p-1 hover:bg-gray-100 rounded"
            title={swatch.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {swatch.isFavorite ? 
              <Heart className="w-4 h-4 text-red-500 fill-current" /> : 
              <HeartOff className="w-4 h-4 text-gray-400" />
            }
          </button>
          <button
            onClick={() => onEdit(swatch)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit swatch"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(swatch.id)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete swatch"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Color Preview */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {swatch.colors.map((color, index) => (
          <div key={index} className="relative group">
            <div 
              className="w-full h-12 rounded border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex)}
              title={`${color.role || 'Color'}: ${color.hex}`}
            />
            {color.role && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {color.role}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{swatch.colors.length} colors</span>
        {swatch.source && <span>from {swatch.source}</span>}
        <span>{new Date(swatch.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={copySwatchData}
          className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors flex items-center justify-center"
        >
          <Copy className="w-3 h-3 mr-1" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onDuplicate(swatch)}
          className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => onExport(swatch)}
          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded transition-colors"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SwatchCard;