import { colord } from 'colord';

/**
 * Token export formats
 */
export const TOKEN_FORMATS = {
  styleDictionary: {
    id: 'styleDictionary',
    name: 'Style Dictionary',
    extension: 'json',
    description: 'Amazon Style Dictionary format for design systems'
  },
  tokensStudio: {
    id: 'tokensStudio',
    name: 'Tokens Studio',
    extension: 'json',
    description: 'Figma Tokens plugin format'
  },
  w3c: {
    id: 'w3c',
    name: 'W3C Design Tokens',
    extension: 'json',
    description: 'W3C Design Tokens Community Group format'
  },
  tailwind: {
    id: 'tailwind',
    name: 'Tailwind CSS',
    extension: 'js',
    description: 'Tailwind CSS configuration colors'
  },
  cssVariables: {
    id: 'cssVariables',
    name: 'CSS Variables',
    extension: 'css',
    description: 'CSS custom properties'
  },
  scss: {
    id: 'scss',
    name: 'SCSS Variables',
    extension: 'scss',
    description: 'SCSS/Sass variables and maps'
  }
};

/**
 * Token structure options
 */
export const TOKEN_STRUCTURES = {
  flat: {
    id: 'flat',
    name: 'Flat',
    description: 'All tokens at root level'
  },
  nested: {
    id: 'nested',
    name: 'Nested',
    description: 'Organized by category (colors.primary.500)'
  },
  semantic: {
    id: 'semantic',
    name: 'Semantic',
    description: 'By role (interactive.default, surface.background)'
  }
};

/**
 * Color roles for semantic naming
 */
const COLOR_ROLES = [
  { id: 'primary', name: 'Primary', description: 'Main brand color' },
  { id: 'secondary', name: 'Secondary', description: 'Supporting color' },
  { id: 'accent', name: 'Accent', description: 'Highlight/emphasis color' },
  { id: 'surface', name: 'Surface', description: 'Card/component backgrounds' },
  { id: 'background', name: 'Background', description: 'Page background' }
];

/**
 * Generate color shades from a base color
 */
function generateShades(hex) {
  const color = colord(hex);
  const hsl = color.toHsl();

  return {
    50: colord({ ...hsl, l: 95 }).toHex(),
    100: colord({ ...hsl, l: 90 }).toHex(),
    200: colord({ ...hsl, l: 80 }).toHex(),
    300: colord({ ...hsl, l: 70 }).toHex(),
    400: colord({ ...hsl, l: 60 }).toHex(),
    500: hex,
    600: colord({ ...hsl, l: 40 }).toHex(),
    700: colord({ ...hsl, l: 30 }).toHex(),
    800: colord({ ...hsl, l: 20 }).toHex(),
    900: colord({ ...hsl, l: 10 }).toHex(),
    950: colord({ ...hsl, l: 5 }).toHex()
  };
}

/**
 * Generate Style Dictionary format
 */
export function generateStyleDictionary(colors, options = {}) {
  const { includeShades = false, prefix = 'color' } = options;

  const tokens = { color: {} };

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `color-${index + 1}`;

    if (includeShades) {
      const shades = generateShades(hex);
      tokens.color[role] = {};
      Object.entries(shades).forEach(([shade, value]) => {
        tokens.color[role][shade] = {
          value,
          type: 'color',
          description: `${role} ${shade}`
        };
      });
    } else {
      tokens.color[role] = {
        value: hex,
        type: 'color',
        description: COLOR_ROLES[index]?.description || `Color ${index + 1}`
      };
    }
  });

  return JSON.stringify(tokens, null, 2);
}

/**
 * Generate Tokens Studio (Figma Tokens) format
 */
export function generateTokensStudio(colors, options = {}) {
  const { includeShades = false, setName = 'core' } = options;

  const tokens = {
    [setName]: {
      color: {}
    }
  };

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `color-${index + 1}`;

    if (includeShades) {
      const shades = generateShades(hex);
      tokens[setName].color[role] = {};
      Object.entries(shades).forEach(([shade, value]) => {
        tokens[setName].color[role][shade] = {
          value,
          type: 'color'
        };
      });
    } else {
      tokens[setName].color[role] = {
        value: hex,
        type: 'color'
      };
    }
  });

  return JSON.stringify(tokens, null, 2);
}

/**
 * Generate W3C Design Tokens format
 */
export function generateW3CTokens(colors, options = {}) {
  const { includeShades = false } = options;

  const tokens = {};

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `color-${index + 1}`;

    if (includeShades) {
      tokens[role] = {};
      const shades = generateShades(hex);
      Object.entries(shades).forEach(([shade, value]) => {
        tokens[role][shade] = {
          $type: 'color',
          $value: value,
          $description: `${role} ${shade}`
        };
      });
    } else {
      tokens[role] = {
        $type: 'color',
        $value: hex,
        $description: COLOR_ROLES[index]?.description || `Color ${index + 1}`
      };
    }
  });

  return JSON.stringify(tokens, null, 2);
}

/**
 * Generate Tailwind CSS config
 */
export function generateTailwindConfig(colors, options = {}) {
  const { includeShades = false, exportType = 'extend' } = options;

  const colorConfig = {};

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `color${index + 1}`;

    if (includeShades) {
      colorConfig[role] = generateShades(hex);
    } else {
      colorConfig[role] = hex;
    }
  });

  if (exportType === 'full') {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: ${JSON.stringify(colorConfig, null, 6).replace(/"/g, "'").split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')}
  }
}`;
  }

  return `// Add to your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorConfig, null, 8).replace(/"/g, "'").split('\n').map((line, i) => i === 0 ? line : '      ' + line).join('\n')}
    }
  }
}`;
}

/**
 * Generate CSS Variables
 */
export function generateCSSVariables(colors, options = {}) {
  const { includeShades = false, prefix = 'color' } = options;

  let css = ':root {\n';

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `${index + 1}`;

    if (includeShades) {
      const shades = generateShades(hex);
      css += `  /* ${COLOR_ROLES[index]?.name || `Color ${index + 1}`} */\n`;
      Object.entries(shades).forEach(([shade, value]) => {
        css += `  --${prefix}-${role}-${shade}: ${value};\n`;
      });
      css += '\n';
    } else {
      css += `  --${prefix}-${role}: ${hex}; /* ${COLOR_ROLES[index]?.description || ''} */\n`;
    }
  });

  css += '}\n';

  // Add RGB variants for opacity support
  css += '\n/* RGB values for opacity support */\n:root {\n';
  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `${index + 1}`;
    const rgb = colord(hex).toRgb();
    css += `  --${prefix}-${role}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
  });
  css += '}\n';

  // Add usage example
  css += `
/* Usage example:
   background-color: var(--${prefix}-primary);
   background-color: rgba(var(--${prefix}-primary-rgb), 0.5);
*/`;

  return css;
}

/**
 * Generate SCSS Variables
 */
export function generateSCSSVariables(colors, options = {}) {
  const { includeShades = false, prefix = 'color' } = options;

  let scss = '// Color Variables\n';

  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `${index + 1}`;

    if (includeShades) {
      const shades = generateShades(hex);
      scss += `\n// ${COLOR_ROLES[index]?.name || `Color ${index + 1}`}\n`;
      Object.entries(shades).forEach(([shade, value]) => {
        scss += `$${prefix}-${role}-${shade}: ${value};\n`;
      });
    } else {
      scss += `$${prefix}-${role}: ${hex}; // ${COLOR_ROLES[index]?.description || ''}\n`;
    }
  });

  // Add color map
  scss += '\n// Color Map\n$colors: (\n';
  colors.forEach((hex, index) => {
    const role = COLOR_ROLES[index]?.id || `${index + 1}`;
    if (includeShades) {
      const shades = generateShades(hex);
      scss += `  '${role}': (\n`;
      Object.entries(shades).forEach(([shade, value], i, arr) => {
        scss += `    '${shade}': ${value}${i < arr.length - 1 ? ',' : ''}\n`;
      });
      scss += `  ),\n`;
    } else {
      scss += `  '${role}': ${hex},\n`;
    }
  });
  scss += ');\n';

  // Add utility mixin
  scss += `
// Utility function to get color
@function color($name, $shade: null) {
  @if $shade {
    @return map-get(map-get($colors, $name), $shade);
  }
  @return map-get($colors, $name);
}

// Usage: color: color('primary', '500');
`;

  return scss;
}

/**
 * Generate tokens based on format
 */
export function generateTokens(colors, format, options = {}) {
  switch (format) {
    case 'styleDictionary':
      return generateStyleDictionary(colors, options);
    case 'tokensStudio':
      return generateTokensStudio(colors, options);
    case 'w3c':
      return generateW3CTokens(colors, options);
    case 'tailwind':
      return generateTailwindConfig(colors, options);
    case 'cssVariables':
      return generateCSSVariables(colors, options);
    case 'scss':
      return generateSCSSVariables(colors, options);
    default:
      return generateStyleDictionary(colors, options);
  }
}

/**
 * Get file extension for format
 */
export function getFileExtension(format) {
  return TOKEN_FORMATS[format]?.extension || 'json';
}

/**
 * Get mime type for format
 */
export function getMimeType(format) {
  const ext = getFileExtension(format);
  switch (ext) {
    case 'css':
    case 'scss':
      return 'text/css';
    case 'js':
      return 'text/javascript';
    default:
      return 'application/json';
  }
}
