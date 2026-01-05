import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Pipette,
  RefreshCw,
  Copy,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { extractColorsFromImage, getColorAtPixel, rgbToHex } from '../utils/colorExtraction';

const ImageExtractor = ({ onExtractColors, onClose }) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [eyedropperColor, setEyedropperColor] = useState(null);
  const [pickedColors, setPickedColors] = useState([]);

  // Settings - load from localStorage or use defaults
  const [colorCount, setColorCount] = useState(() => {
    const saved = localStorage.getItem('imageExtractor-colorCount');
    return saved ? parseInt(saved, 10) : 6;
  });
  const [ignoreWhite, setIgnoreWhite] = useState(() => {
    const saved = localStorage.getItem('imageExtractor-ignoreWhite');
    return saved !== null ? saved === 'true' : true;
  });
  const [ignoreBlack, setIgnoreBlack] = useState(() => {
    const saved = localStorage.getItem('imageExtractor-ignoreBlack');
    return saved !== null ? saved === 'true' : true;
  });
  const [ignoreGray, setIgnoreGray] = useState(() => {
    const saved = localStorage.getItem('imageExtractor-ignoreGray');
    return saved !== null ? saved === 'true' : false;
  });

  // Persist settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('imageExtractor-colorCount', colorCount.toString());
  }, [colorCount]);

  useEffect(() => {
    localStorage.setItem('imageExtractor-ignoreWhite', ignoreWhite.toString());
  }, [ignoreWhite]);

  useEffect(() => {
    localStorage.setItem('imageExtractor-ignoreBlack', ignoreBlack.toString());
  }, [ignoreBlack]);

  useEffect(() => {
    localStorage.setItem('imageExtractor-ignoreGray', ignoreGray.toString());
  }, [ignoreGray]);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, or GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please use an image under 10MB.');
      return;
    }

    setError(null);
    setIsExtracting(true);
    setPickedColors([]);

    try {
      const result = await extractColorsFromImage(file);
      setImage(file);
      setImageUrl(result.imageUrl);
      setExtractedColors(result.colors);
    } catch (err) {
      setError('Failed to extract colors from image. Please try another image.');
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const reextractColors = async () => {
    if (!image) return;

    setIsExtracting(true);
    try {
      const result = await extractColorsFromImage(image);
      setExtractedColors(result.colors);
    } catch (err) {
      setError('Failed to re-extract colors.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImageClick = useCallback((e) => {
    if (!eyedropperActive || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = imageRef.current.getBoundingClientRect();

    // Calculate click position relative to image
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const color = getColorAtPixel(imageData, x, y);

    if (color) {
      setPickedColors(prev => {
        // Don't add duplicates
        if (prev.includes(color.hex)) return prev;
        return [...prev, color.hex];
      });
    }
  }, [eyedropperActive]);

  const handleImageMouseMove = useCallback((e) => {
    if (!eyedropperActive || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = imageRef.current.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const color = getColorAtPixel(imageData, x, y);
      setEyedropperColor(color?.hex);
    }
  }, [eyedropperActive]);

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, []);

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
  };

  const removePickedColor = (hex) => {
    setPickedColors(prev => prev.filter(c => c !== hex));
  };

  const usePalette = () => {
    // Combine extracted and picked colors
    const allColors = [
      ...extractedColors.map(c => c.hex),
      ...pickedColors
    ].slice(0, 10); // Max 10 colors

    if (allColors.length > 0) {
      onExtractColors(allColors);
      onClose();
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageUrl(null);
    setExtractedColors([]);
    setPickedColors([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Extract from Image</h2>
              <p className="text-xs text-gray-500">Upload an image to extract its color palette</p>
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
          {!imageUrl ? (
            /* Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center space-y-4">
                <div className={`
                  p-4 rounded-full transition-colors
                  ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse • PNG, JPG, WEBP, GIF
                  </p>
                </div>
              </div>

              {isExtracting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-gray-600 font-medium">Extracting colors...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Image Preview & Colors */
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Uploaded"
                    onLoad={handleImageLoad}
                    onClick={handleImageClick}
                    onMouseMove={handleImageMouseMove}
                    className={`
                      w-full max-h-64 object-contain
                      ${eyedropperActive ? 'cursor-crosshair' : 'cursor-default'}
                    `}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Eyedropper Preview */}
                  {eyedropperActive && eyedropperColor && (
                    <div className="absolute top-2 right-2 flex items-center space-x-2 bg-black/75 text-white px-3 py-1.5 rounded-lg text-sm">
                      <div
                        className="w-5 h-5 rounded border border-white/30"
                        style={{ backgroundColor: eyedropperColor }}
                      />
                      <span className="font-mono">{eyedropperColor.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Image Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEyedropperActive(!eyedropperActive)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${eyedropperActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <Pipette className="w-4 h-4" />
                      <span>Eyedropper</span>
                    </button>

                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Settings</span>
                      {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    onClick={clearImage}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Colors to extract
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={colorCount}
                          onChange={(e) => setColorCount(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{colorCount} colors</span>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={ignoreWhite}
                            onChange={(e) => setIgnoreWhite(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-600">Ignore whites</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={ignoreBlack}
                            onChange={(e) => setIgnoreBlack(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-600">Ignore blacks</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={ignoreGray}
                            onChange={(e) => setIgnoreGray(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-600">Ignore grays</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={reextractColors}
                      disabled={isExtracting}
                      className="mt-3 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                      <span>Re-extract</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Extracted Colors */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <span>Extracted Colors</span>
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                    {extractedColors.length}
                  </span>
                </h3>

                <div className="grid grid-cols-6 gap-3">
                  {extractedColors.map((color, index) => (
                    <div key={index} className="group relative">
                      <div
                        className="aspect-square rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                      <p className="mt-1 text-xs text-center text-gray-500 font-mono truncate">
                        {color.hex.toUpperCase()}
                      </p>
                      <p className="text-xs text-center text-gray-400">
                        {color.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Picked Colors (from eyedropper) */}
              {pickedColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Pipette className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Picked Colors</span>
                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 rounded-full text-xs text-indigo-600">
                      {pickedColors.length}
                    </span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {pickedColors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 pl-1 pr-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div
                          className="w-6 h-6 rounded-md border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono text-gray-600">{color.toUpperCase()}</span>
                        <button
                          onClick={() => removePickedColor(color)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            {extractedColors.length > 0
              ? `${extractedColors.length + pickedColors.length} colors ready to use`
              : 'Upload an image to get started'
            }
          </p>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={usePalette}
              disabled={extractedColors.length === 0 && pickedColors.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Use as Palette</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageExtractor;
