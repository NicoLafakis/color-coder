import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code,
  FileJson,
  FileCode,
  Palette,
  Layers,
  Settings2
} from 'lucide-react';
import {
  TOKEN_FORMATS,
  generateTokens,
  getFileExtension,
  getMimeType
} from '../utils/designTokens';

const DesignTokenExport = ({ colors, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('cssVariables');
  const [includeShades, setIncludeShades] = useState(false);
  const [prefix, setPrefix] = useState('color');
  const [copied, setCopied] = useState(false);

  // Generate tokens based on current settings
  const tokens = useMemo(() => {
    return generateTokens(colors, selectedFormat, {
      includeShades,
      prefix
    });
  }, [colors, selectedFormat, includeShades, prefix]);

  // Handle copy
  const handleCopy = async () => {
    await navigator.clipboard.writeText(tokens);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download
  const handleDownload = () => {
    const extension = getFileExtension(selectedFormat);
    const mimeType = getMimeType(selectedFormat);
    const blob = new Blob([tokens], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-tokens.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get icon for format
  const getFormatIcon = (formatId) => {
    switch (formatId) {
      case 'cssVariables':
      case 'scss':
        return FileCode;
      case 'tailwind':
        return Code;
      default:
        return FileJson;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Layers className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Design Token Export</h2>
              <p className="text-xs text-gray-500">Export your palette for design systems and development</p>
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
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar - Format Selection */}
            <div className="lg:w-72 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Export Format</h3>

              <div className="space-y-2">
                {Object.values(TOKEN_FORMATS).map(format => {
                  const Icon = getFormatIcon(format.id);
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`
                        w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all
                        ${selectedFormat === format.id
                          ? 'bg-violet-100 border-2 border-violet-400'
                          : 'bg-white border-2 border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        selectedFormat === format.id ? 'text-violet-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-bold text-sm ${
                          selectedFormat === format.id ? 'text-violet-700' : 'text-gray-700'
                        }`}>
                          {format.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format.description}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500">
                          .{format.extension}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Options */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Options
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeShades}
                      onChange={(e) => setIncludeShades(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700">Include shade variants</span>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Variable prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="color"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Source Colors
                </h3>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main - Code Preview */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">
                  {TOKEN_FORMATS[selectedFormat].name} Output
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto">
                  <code>{tokens}</code>
                </pre>

                {/* Line numbers overlay */}
                <div className="absolute top-4 left-4 pointer-events-none select-none">
                  {tokens.split('\n').map((_, i) => (
                    <div key={i} className="text-gray-600 text-xs font-mono leading-[1.625]">
                      {/* Line number styling handled by pre styling */}
                    </div>
                  ))}
                </div>
              </div>

              {/* Format-specific info */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-sm font-bold text-blue-800 mb-2">Usage</h4>
                {selectedFormat === 'cssVariables' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>Add this to your stylesheet. Use variables like:</p>
                    <code className="block bg-blue-100 p-2 rounded">
                      background-color: var(--{prefix}-primary);
                    </code>
                  </div>
                )}
                {selectedFormat === 'scss' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>Import and use SCSS variables:</p>
                    <code className="block bg-blue-100 p-2 rounded">
                      @import 'design-tokens';<br />
                      .button {'{'} background: ${prefix}-primary; {'}'}
                    </code>
                  </div>
                )}
                {selectedFormat === 'tailwind' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>Add to your tailwind.config.js, then use:</p>
                    <code className="block bg-blue-100 p-2 rounded">
                      {'<div className="bg-primary text-secondary">'}
                    </code>
                  </div>
                )}
                {selectedFormat === 'styleDictionary' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>Use with Style Dictionary build system:</p>
                    <code className="block bg-blue-100 p-2 rounded">
                      npx style-dictionary build
                    </code>
                  </div>
                )}
                {selectedFormat === 'tokensStudio' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>Import into Figma Tokens plugin:</p>
                    <p>Plugins → Tokens Studio → Import JSON</p>
                  </div>
                )}
                {selectedFormat === 'w3c' && (
                  <div className="text-xs text-blue-700 space-y-2">
                    <p>W3C Design Tokens Community Group standard format.</p>
                    <p>Compatible with most modern design token tools.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500">
            {includeShades ? 'Includes 11 shade variants per color' : `${colors.length} colors`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download .{getFileExtension(selectedFormat)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTokenExport;
