import React, { useState } from 'react';
import { 
  Globe, 
  Palette, 
  Image, 
  Droplet, 
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import WebsiteAnalyzer from './WebsiteAnalyzer';

const ToolPanel = ({ onColorsFound, onCreateSwatch }) => {
  const [activeTools, setActiveTools] = useState({ analyzer: false });

  const toggleTool = (toolName) => {
    setActiveTools(prev => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  const tools = [
    {
      id: 'analyzer',
      name: 'Website Analyzer',
      icon: Globe,
      description: 'Extract color schemes from live websites',
      component: WebsiteAnalyzer,
      props: { onColorsFound }
    },
    {
      id: 'generator',
      name: 'AI Color Generator',
      icon: Zap,
      description: 'Generate palettes with AI assistance',
      disabled: true
    },
    {
      id: 'image',
      name: 'Image Extractor',
      icon: Image,
      description: 'Extract colors from uploaded images',
      disabled: true
    },
    {
      id: 'picker',
      name: 'Color Picker',
      icon: Droplet,
      description: 'Pick colors from your screen',
      disabled: true
    },
    {
      id: 'manual',
      name: 'Manual Creator',
      icon: Palette,
      description: 'Create custom color schemes manually',
      action: () => onCreateSwatch()
    }
  ];

  return (
    <div className="space-y-2">
      {tools.map(tool => {
        const Icon = tool.icon;
        const isActive = activeTools[tool.id];
        const Component = tool.component;

        return (
          <div key={tool.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => tool.action ? tool.action() : toggleTool(tool.id)}
              disabled={tool.disabled}
              className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                tool.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${isActive ? 'bg-indigo-50 border-indigo-200' : ''}`}
            >
              <div className="flex items-center">
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
                <div>
                  <div className={`text-sm font-medium ${isActive ? 'text-indigo-800' : 'text-gray-800'}`}>
                    {tool.name}
                    {tool.disabled && <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>}
                  </div>
                  <div className="text-xs text-gray-500">{tool.description}</div>
                </div>
              </div>
              {!tool.action && !tool.disabled && (
                isActive ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> :
                  <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {isActive && Component && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <Component {...(tool.props || {})} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToolPanel;