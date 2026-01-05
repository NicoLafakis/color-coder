import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Shuffle,
  Palette,
  Code,
  Layers
} from 'lucide-react';
import { colord } from 'colord';
import {
  GRADIENT_TYPES,
  INTERPOLATION_MODES,
  GRADIENT_PRESETS,
  generateId,
  createGradientFromPalette,
  generateGradientCSS,
  generateFullCSS,
  generateSVGGradient,
  reverseGradient
} from '../utils/gradients';

const GradientGenerator = ({ colors, onClose }) => {
  // Initialize with palette colors
  const [gradient, setGradient] = useState(() =>
    createGradientFromPalette(colors.slice(0, 5), 'linear', 90)
  );

  const [activeTab, setActiveTab] = useState('editor'); // editor, presets, code
  const [copied, setCopied] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const gradientBarRef = useRef(null);

  // Generate CSS
  const gradientCSS = useMemo(() => generateGradientCSS(gradient), [gradient]);
  const fullCSS = useMemo(() => generateFullCSS(gradient), [gradient]);
  const svgGradient = useMemo(() => generateSVGGradient(gradient), [gradient]);

  // Handle type change
  const handleTypeChange = (type) => {
    setGradient(prev => ({ ...prev, type }));
  };

  // Handle angle change
  const handleAngleChange = (angle) => {
    setGradient(prev => ({ ...prev, angle: parseInt(angle) }));
  };

  // Handle stop color change
  const handleStopColorChange = (stopId, color) => {
    setGradient(prev => ({
      ...prev,
      stops: prev.stops.map(stop =>
        stop.id === stopId ? { ...stop, color } : stop
      )
    }));
  };

  // Handle stop position change
  const handleStopPositionChange = (stopId, position) => {
    setGradient(prev => ({
      ...prev,
      stops: prev.stops.map(stop =>
        stop.id === stopId ? { ...stop, position: Math.max(0, Math.min(100, position)) } : stop
      )
    }));
  };

  // Add new stop
  const addStop = () => {
    const newPosition = 50;
    // Find color at this position by interpolating
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    let color = '#888888';

    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (newPosition >= sortedStops[i].position && newPosition <= sortedStops[i + 1].position) {
        const t = (newPosition - sortedStops[i].position) /
          (sortedStops[i + 1].position - sortedStops[i].position);
        const c1 = colord(sortedStops[i].color).toRgb();
        const c2 = colord(sortedStops[i + 1].color).toRgb();
        color = colord({
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t)
        }).toHex();
        break;
      }
    }

    const newStop = {
      id: generateId(),
      color,
      position: newPosition
    };

    setGradient(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setSelectedStopId(newStop.id);
  };

  // Remove stop
  const removeStop = (stopId) => {
    if (gradient.stops.length <= 2) return; // Minimum 2 stops
    setGradient(prev => ({
      ...prev,
      stops: prev.stops.filter(stop => stop.id !== stopId)
    }));
    if (selectedStopId === stopId) {
      setSelectedStopId(null);
    }
  };

  // Handle click on gradient bar to add stop
  const handleGradientBarClick = (e) => {
    if (!gradientBarRef.current) return;

    const rect = gradientBarRef.current.getBoundingClientRect();
    const position = Math.round(((e.clientX - rect.left) / rect.width) * 100);

    // Find color at this position
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    let color = '#888888';

    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
        const t = (position - sortedStops[i].position) /
          (sortedStops[i + 1].position - sortedStops[i].position);
        const c1 = colord(sortedStops[i].color).toRgb();
        const c2 = colord(sortedStops[i + 1].color).toRgb();
        color = colord({
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t)
        }).toHex();
        break;
      }
    }

    const newStop = {
      id: generateId(),
      color,
      position
    };

    setGradient(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setSelectedStopId(newStop.id);
  };

  // Reverse gradient
  const handleReverse = () => {
    setGradient(prev => reverseGradient(prev));
  };

  // Randomize gradient
  const handleRandomize = () => {
    const randomStops = gradient.stops.map(stop => ({
      ...stop,
      color: colord({
        h: Math.random() * 360,
        s: 50 + Math.random() * 50,
        l: 30 + Math.random() * 40
      }).toHex()
    }));
    setGradient(prev => ({ ...prev, stops: randomStops }));
  };

  // Load preset
  const loadPreset = (preset) => {
    setGradient({
      ...preset,
      id: generateId(),
      stops: preset.stops.map(s => ({ ...s, id: generateId() }))
    });
  };

  // Load from palette
  const loadFromPalette = () => {
    setGradient(createGradientFromPalette(colors.slice(0, 5), gradient.type, gradient.angle));
  };

  // Copy to clipboard
  const handleCopy = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Export CSS file
  const handleExport = () => {
    const blob = new Blob([fullCSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-100"
          style={{ background: gradientCSS }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Layers className="w-5 h-5 text-white drop-shadow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white drop-shadow">Gradient Generator</h2>
              <p className="text-xs text-white/80 drop-shadow">Create beautiful CSS gradients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white drop-shadow" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'editor', label: 'Editor', icon: Layers },
            { id: 'presets', label: 'Presets', icon: Palette },
            { id: 'code', label: 'Code', icon: Code }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Preview */}
              <div
                className="h-40 rounded-xl shadow-inner border border-gray-200"
                style={{ background: gradientCSS }}
              />

              {/* Gradient Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gradient Type
                </label>
                <div className="flex gap-2">
                  {Object.values(GRADIENT_TYPES).map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${gradient.type === type.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle Control (for linear and conic) */}
              {(gradient.type === 'linear' || gradient.type === 'conic') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Angle: {gradient.angle}°
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradient.angle}
                      onChange={(e) => handleAngleChange(e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div
                      className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer"
                      style={{
                        background: `conic-gradient(from ${gradient.angle}deg, #6366f1 0deg, #6366f1 10deg, transparent 10deg)`
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        const angle = Math.round((Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360);
                        handleAngleChange(angle);
                      }}
                    >
                      <div
                        className="w-1 h-4 bg-indigo-600 rounded-full origin-bottom"
                        style={{ transform: `rotate(${gradient.angle}deg)` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Color Stops */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">
                    Color Stops ({gradient.stops.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={loadFromPalette}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Load from palette"
                    >
                      <Palette className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={handleReverse}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Reverse gradient"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={handleRandomize}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Randomize colors"
                    >
                      <Shuffle className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={addStop}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Add stop"
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Gradient Bar with Stops */}
                <div
                  ref={gradientBarRef}
                  className="relative h-8 rounded-lg cursor-crosshair mb-4"
                  style={{ background: `linear-gradient(90deg, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})` }}
                  onClick={handleGradientBarClick}
                >
                  {gradient.stops.map(stop => (
                    <div
                      key={stop.id}
                      className={`
                        absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 cursor-pointer
                        transform -translate-x-1/2 transition-all
                        ${selectedStopId === stop.id
                          ? 'border-indigo-600 scale-125 z-10'
                          : 'border-white shadow-md'}
                      `}
                      style={{
                        left: `${stop.position}%`,
                        backgroundColor: stop.color
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStopId(stop.id);
                      }}
                    />
                  ))}
                </div>

                {/* Stop Editor */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {sortedStops.map(stop => (
                    <div
                      key={stop.id}
                      className={`
                        p-2 rounded-lg border-2 transition-all cursor-pointer
                        ${selectedStopId === stop.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                      onClick={() => setSelectedStopId(stop.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative">
                          <div
                            className="w-8 h-8 rounded-lg border border-gray-200"
                            style={{ backgroundColor: stop.color }}
                          />
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-mono text-gray-500">{stop.color}</p>
                          <p className="text-xs font-bold text-gray-700">{stop.position}%</p>
                        </div>
                        {gradient.stops.length > 2 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStop(stop.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => handleStopPositionChange(stop.id, parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {GRADIENT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all"
                >
                  <div
                    className="h-24"
                    style={{
                      background: preset.type === 'linear'
                        ? `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                        : preset.type === 'radial'
                          ? `radial-gradient(${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                          : `conic-gradient(from ${preset.angle || 0}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                    }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-white">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              {/* CSS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">CSS</label>
                  <button
                    onClick={() => handleCopy(fullCSS, 'css')}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {copied === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'css' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                  {fullCSS}
                </pre>
              </div>

              {/* Inline CSS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Inline Style</label>
                  <button
                    onClick={() => handleCopy(`background: ${gradientCSS};`, 'inline')}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {copied === 'inline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'inline' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                  {`background: ${gradientCSS};`}
                </pre>
              </div>

              {/* SVG */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">SVG Gradient</label>
                  <button
                    onClick={() => handleCopy(svgGradient, 'svg')}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {copied === 'svg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'svg' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                  {svgGradient}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500">
            Click on the gradient bar to add color stops
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;
