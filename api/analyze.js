// Vercel Serverless Function for Website Color Analysis
// This function fetches a website and extracts its color palette

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Validate URL
    const targetUrl = new URL(url);

    // Fetch the website HTML
    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();

    // Extract colors from HTML and inline styles
    const colors = extractColorsFromHTML(html);

    // Fetch and parse external stylesheets
    const stylesheetUrls = extractStylesheetUrls(html, targetUrl);
    const externalColors = await fetchStylesheetColors(stylesheetUrls);

    // Merge all colors
    const allColors = mergeColorCounts(colors, externalColors);

    // Sort by frequency and get top colors
    const sortedColors = Object.entries(allColors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([hex, count]) => ({
        hex: hex.toUpperCase(),
        count,
        frequency: Math.round((count / Object.values(allColors).reduce((a, b) => a + b, 0)) * 100)
      }));

    // Filter out near-white and near-black duplicates, keep most common
    const filteredColors = filterSimilarColors(sortedColors);

    return res.status(200).json({
      success: true,
      url: targetUrl.href,
      hostname: targetUrl.hostname,
      colors: filteredColors,
      totalColorsFound: Object.keys(allColors).length,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze website',
      message: error.message
    });
  }
}

// Extract stylesheet URLs from HTML
function extractStylesheetUrls(html, baseUrl) {
  const urls = [];
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    urls.push(resolveUrl(match[1], baseUrl));
  }
  while ((match = linkRegex2.exec(html)) !== null) {
    urls.push(resolveUrl(match[1], baseUrl));
  }

  return urls.filter(Boolean);
}

// Resolve relative URLs
function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

// Fetch colors from external stylesheets
async function fetchStylesheetColors(urls) {
  const colorCounts = {};

  // Limit to first 5 stylesheets to avoid timeout
  const limitedUrls = urls.slice(0, 5);

  await Promise.all(limitedUrls.map(async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (response.ok) {
        const css = await response.text();
        const colors = extractColorsFromCSS(css);
        Object.entries(colors).forEach(([color, count]) => {
          colorCounts[color] = (colorCounts[color] || 0) + count;
        });
      }
    } catch {
      // Ignore failed stylesheet fetches
    }
  }));

  return colorCounts;
}

// Extract colors from HTML (inline styles and style tags)
function extractColorsFromHTML(html) {
  const colors = {};

  // Extract from <style> tags
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleTagRegex.exec(html)) !== null) {
    const cssColors = extractColorsFromCSS(match[1]);
    Object.entries(cssColors).forEach(([color, count]) => {
      colors[color] = (colors[color] || 0) + count;
    });
  }

  // Extract from inline style attributes
  const inlineStyleRegex = /style=["']([^"']+)["']/gi;
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    const cssColors = extractColorsFromCSS(match[1]);
    Object.entries(cssColors).forEach(([color, count]) => {
      colors[color] = (colors[color] || 0) + count;
    });
  }

  return colors;
}

// Extract colors from CSS text
function extractColorsFromCSS(css) {
  const colors = {};

  // Hex colors (3, 4, 6, or 8 digits)
  const hexRegex = /#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g;
  let match;
  while ((match = hexRegex.exec(css)) !== null) {
    const hex = normalizeHex(match[0]);
    if (hex && !isTransparent(hex)) {
      colors[hex] = (colors[hex] || 0) + 1;
    }
  }

  // RGB/RGBA colors
  const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)/gi;
  while ((match = rgbRegex.exec(css)) !== null) {
    const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    if (hex && !isTransparent(hex)) {
      colors[hex] = (colors[hex] || 0) + 1;
    }
  }

  // HSL/HSLA colors
  const hslRegex = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*[\d.]+)?\s*\)/gi;
  while ((match = hslRegex.exec(css)) !== null) {
    const hex = hslToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    if (hex && !isTransparent(hex)) {
      colors[hex] = (colors[hex] || 0) + 1;
    }
  }

  // Named colors (common ones)
  const namedColors = {
    'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000',
    'green': '#008000', 'blue': '#0000FF', 'yellow': '#FFFF00',
    'orange': '#FFA500', 'purple': '#800080', 'pink': '#FFC0CB',
    'gray': '#808080', 'grey': '#808080', 'navy': '#000080',
    'teal': '#008080', 'aqua': '#00FFFF', 'cyan': '#00FFFF',
    'magenta': '#FF00FF', 'lime': '#00FF00', 'maroon': '#800000',
    'olive': '#808000', 'silver': '#C0C0C0', 'transparent': null
  };

  Object.entries(namedColors).forEach(([name, hex]) => {
    const regex = new RegExp(`:\\s*${name}\\s*[;\\}]`, 'gi');
    const matches = css.match(regex);
    if (matches && hex) {
      colors[hex] = (colors[hex] || 0) + matches.length;
    }
  });

  return colors;
}

// Normalize hex color to 6-digit uppercase
function normalizeHex(hex) {
  let h = hex.replace('#', '').toUpperCase();

  // Handle 3-digit hex
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  // Handle 4-digit hex (with alpha)
  if (h.length === 4) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  // Handle 8-digit hex (with alpha) - strip alpha
  if (h.length === 8) {
    h = h.substring(0, 6);
  }

  if (h.length !== 6) return null;
  if (!/^[0-9A-F]{6}$/.test(h)) return null;

  return '#' + h;
}

// Check if color is essentially transparent
function isTransparent(hex) {
  return !hex || hex === 'transparent';
}

// Convert RGB to Hex
function rgbToHex(r, g, b) {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Convert HSL to Hex
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Merge color counts from multiple sources
function mergeColorCounts(...colorObjects) {
  const merged = {};
  colorObjects.forEach(obj => {
    Object.entries(obj).forEach(([color, count]) => {
      merged[color] = (merged[color] || 0) + count;
    });
  });
  return merged;
}

// Filter out very similar colors (keep the most frequent)
function filterSimilarColors(colors) {
  const filtered = [];
  const threshold = 30; // Color distance threshold

  for (const color of colors) {
    const isDuplicate = filtered.some(existing =>
      colorDistance(existing.hex, color.hex) < threshold
    );

    if (!isDuplicate) {
      filtered.push(color);
    }
  }

  return filtered;
}

// Calculate color distance (simple Euclidean in RGB space)
function colorDistance(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return Infinity;

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

// Convert hex to RGB object
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
