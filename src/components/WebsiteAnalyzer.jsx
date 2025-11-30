import React, { useState } from 'react';
import { Globe, RefreshCw, AlertCircle, CheckCircle, Layers } from 'lucide-react';

const WebsiteAnalyzer = ({ onColorsFound }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState(null);

  // Analyze a website by calling our serverless API
  const analyzeWebsite = async (targetUrl) => {
    setIsAnalyzing(true);
    setError('');

    try {
      // Determine API endpoint based on environment
      const apiUrl = import.meta.env.DEV
        ? '/api/analyze'  // Vite proxy in development
        : '/api/analyze'; // Same path works in production on Vercel

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to analyze website');
      }

      // Transform API response into palette format
      const colorScheme = {
        name: `${data.hostname} - Color Palette`,
        colors: data.colors.map((color, index) => ({
          hex: color.hex,
          role: getRoleFromIndex(index),
          usage: `Found ${color.count} times (${color.frequency}%)`,
          frequency: color.frequency
        })),
        source: `crawled-${data.hostname}`,
        confidence: Math.min(0.95, 0.5 + (data.colors.length / 20)),
        totalColorsFound: data.totalColorsFound
      };

      setLastAnalysis({
        url: targetUrl,
        timestamp: new Date().toISOString(),
        schemes: [colorScheme],
        totalColors: data.totalColorsFound
      });

      // Pass the results to parent component
      onColorsFound?.([colorScheme]);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze website. Please check the URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Assign semantic roles based on position (most frequent first)
  const getRoleFromIndex = (index) => {
    const roles = ['primary', 'secondary', 'background', 'text', 'accent', 'surface', 'border'];
    return roles[index] || '';
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!url) return;

    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
      new URL(processedUrl); // Validate URL
      analyzeWebsite(processedUrl);
    } catch {
      setError('Please enter a valid URL (e.g., example.com or https://example.com)');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <Globe className="w-5 h-5 text-indigo-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Website Color Analyzer</h3>
      </div>

      {/* URL Input */}
      <form onSubmit={handleAnalyze} className="space-y-3">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com"
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isAnalyzing}
          />
        </div>
        <button
          type="submit"
          disabled={!url || isAnalyzing}
          className="w-full flex items-center justify-center text-sm bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Last Analysis Summary */}
      {lastAnalysis && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-800">Analysis Complete</span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <p>Found {lastAnalysis.schemes[0]?.colors?.length || 0} unique colors from:</p>
            <p className="font-mono bg-green-100 px-2 py-1 rounded">{new URL(lastAnalysis.url).hostname}</p>
            <p className="text-green-600">{lastAnalysis.totalColors} total color instances analyzed</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start">
          <Layers className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 list-disc list-inside ml-2">
              <li>Fetches website HTML and stylesheets</li>
              <li>Extracts colors from CSS and inline styles</li>
              <li>Analyzes hex, RGB, HSL, and named colors</li>
              <li>Ranks colors by usage frequency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteAnalyzer;
