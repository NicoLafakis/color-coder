import React from 'react';
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { colord } from 'colord';

const ContrastChecker = ({ colors, selectedIndex, onClose }) => {
  if (selectedIndex === null || selectedIndex === undefined) return null;
  
  const selectedColor = colors[selectedIndex];
  const colorObj = colord(selectedColor);
  
  // Calculate contrast ratios with all other colors
  const contrastResults = colors.map((color, index) => {
    if (index === selectedIndex) return null;
    
    const otherColorObj = colord(color);
    const contrast = colorObj.contrast(otherColorObj);
    
    // WCAG ratings
    const ratings = {
      aa_normal: contrast >= 4.5,
      aa_large: contrast >= 3,
      aaa_normal: contrast >= 7,
      aaa_large: contrast >= 4.5
    };
    
    return {
      color,
      colorName: otherColorObj.toName()?.name || 'Custom',
      contrast: Math.round(contrast * 100) / 100,
      ratings,
      index
    };
  }).filter(Boolean);

  const getRatingIcon = (rating) => {
    if (rating) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getContrastLevel = (contrast) => {
    if (contrast >= 7) return { level: 'Excellent', color: 'text-green-600' };
    if (contrast >= 4.5) return { level: 'Good', color: 'text-blue-600' };
    if (contrast >= 3) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <h2 className="text-xl font-semibold">Contrast Analysis</h2>
              <p className="text-sm text-gray-600">
                {colorObj.toName()?.name || 'Custom'} ({selectedColor.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">WCAG Guidelines</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">Normal Text</div>
                <div>AA: 4.5:1 minimum</div>
                <div>AAA: 7:1 minimum</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">Large Text</div>
                <div>AA: 3:1 minimum</div>
                <div>AAA: 4.5:1 minimum</div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">Contrast with Other Colors</h3>
          
          <div className="space-y-3">
            {contrastResults.map((result) => {
              const contrastLevel = getContrastLevel(result.contrast);
              return (
                <div key={result.index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: result.color }}
                      />
                      <div>
                        <div className="font-medium">{result.colorName}</div>
                        <div className="text-sm text-gray-500">{result.color.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{result.contrast}:1</div>
                      <div className={`text-sm font-medium ${contrastLevel.color}`}>
                        {contrastLevel.level}
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div 
                      className="p-3 rounded text-center font-medium"
                      style={{ 
                        backgroundColor: selectedColor, 
                        color: result.color 
                      }}
                    >
                      Text on Background
                    </div>
                    <div 
                      className="p-3 rounded text-center font-medium"
                      style={{ 
                        backgroundColor: result.color, 
                        color: selectedColor 
                      }}
                    >
                      Background on Text
                    </div>
                  </div>

                  {/* WCAG Compliance */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium mb-2">Normal Text</div>
                      <div className="flex items-center space-x-2 mb-1">
                        {getRatingIcon(result.ratings.aa_normal)}
                        <span>AA Level</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRatingIcon(result.ratings.aaa_normal)}
                        <span>AAA Level</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">Large Text</div>
                      <div className="flex items-center space-x-2 mb-1">
                        {getRatingIcon(result.ratings.aa_large)}
                        <span>AA Level</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRatingIcon(result.ratings.aaa_large)}
                        <span>AAA Level</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContrastChecker;