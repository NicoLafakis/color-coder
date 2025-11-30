import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Copy, Heart, MoreHorizontal, RefreshCw, X, Eye, Layers } from 'lucide-react';
import { colord } from 'colord';

const ColorStrip = ({ 
  color, 
  index, 
  isLocked, 
  onToggleLock, 
  onColorChange, 
  onCopyColor,
  onRemoveColor,
  onCheckContrast,
  onViewShades,
  onToggleFavorite,
  favoriteColors = [],
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver = false,
  isGenerating,
  canRemove = true
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  // Calculate contrast for text color
  const colorObj = colord(color);
  const isLight = colorObj.isLight();
  const textColor = isLight ? '#000000' : '#FFFFFF';
  const isFavorite = favoriteColors.includes(color.toUpperCase());

  // Handle copying color
  const handleCopy = async (format = 'hex') => {
    let copyValue = color;
    
    switch (format) {
      case 'rgb':
        copyValue = colorObj.toRgbString();
        break;
      case 'hsl':
        copyValue = colorObj.toHslString();
        break;
      case 'hex':
      default:
        copyValue = color;
        break;
    }

    await navigator.clipboard.writeText(copyValue);
    onCopyColor?.(copyValue);
    setShowCopied(true);
    setShowMenu(false);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Handle color input change
  const handleColorEdit = () => {
    setIsEditing(true);
    setInputValue(color);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputSubmit = () => {
    const newColor = colord(inputValue);
    if (newColor.isValid()) {
      onColorChange(index, newColor.toHex());
    } else {
      setInputValue(color); // Reset to original if invalid
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(color);
      setIsEditing(false);
    }
  };

  // Generate a new color for this strip
  const handleRefreshColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const lightness = 30 + Math.floor(Math.random() * 40); // 30-70%
    const newColor = colord({ h: hue, s: saturation, l: lightness }).toHex();
    onColorChange(index, newColor);
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      className={`relative flex-1 flex flex-col justify-between p-6 transition-all duration-300 ${
        isGenerating && !isLocked ? 'animate-pulse' : ''
      } ${isDraggedOver ? 'ring-2 ring-blue-400 ring-inset' : ''} ${!isGenerating ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ backgroundColor: color, color: textColor }}
      draggable={!isGenerating}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
    >
      {/* Top Row Buttons */}
      <div className="flex items-start justify-between">
        <div className="flex space-x-1">
          {/* Lock Button */}
          <button
            onClick={() => onToggleLock(index)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isLocked 
                ? 'bg-black bg-opacity-20 backdrop-blur-sm' 
                : 'hover:bg-black hover:bg-opacity-10'
            }`}
            title={isLocked ? 'Unlock color' : 'Lock color'}
          >
            {isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <Unlock className="w-5 h-5 opacity-60" />
            )}
          </button>

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite?.(color)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 bg-opacity-20 backdrop-blur-sm' 
                : 'hover:bg-black hover:bg-opacity-10'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'opacity-60'}`} />
          </button>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 transition-all duration-200 rounded-full hover:bg-black hover:bg-opacity-10"
          >
            <MoreHorizontal className="w-5 h-5 opacity-60" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 z-50 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl top-full min-w-48">
              <button
                onClick={() => handleCopy('hex')}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy HEX
              </button>
              <button
                onClick={() => handleCopy('rgb')}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy RGB
              </button>
              <button
                onClick={() => handleCopy('hsl')}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy HSL
              </button>
              <hr className="my-2" />
              <button
                onClick={handleRefreshColor}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                Generate New
              </button>
              <button
                onClick={() => {
                  onCheckContrast?.(index);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-3" />
                Check Contrast
              </button>
              <button
                onClick={() => {
                  onViewShades?.(index);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Layers className="w-4 h-4 mr-3" />
                View Shades
              </button>
              {canRemove && (
                <>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      onRemoveColor?.(index);
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-3" />
                    Remove Color
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Color Info */}
      <div className="text-center">
        {/* Color Name */}
        <div className="mb-2">
          <div className="mb-1 text-sm opacity-75">
            {colorObj.toName()?.name || 'Custom'}
          </div>
        </div>

        {/* Color Value - Editable */}
        <div className="text-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={handleInputKeyDown}
              className="font-mono text-xl text-center bg-transparent border-b-2 border-current outline-none"
              style={{ color: textColor }}
            />
          ) : (
            <button
              onClick={handleColorEdit}
              className="font-mono text-xl transition-opacity hover:opacity-80"
            >
              {color.toUpperCase()}
            </button>
          )}
        </div>

        {/* Copy Feedback */}
        {showCopied && (
          <div className="mt-2 text-sm opacity-90">
            Copied!
          </div>
        )}
      </div>

      {/* Quick Copy Button */}
      <div className="flex justify-center">
        <button
          onClick={() => handleCopy('hex')}
          className="p-2 transition-all duration-200 rounded-full hover:bg-black hover:bg-opacity-10"
          title="Copy HEX"
        >
          <Copy className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
};

export default ColorStrip;