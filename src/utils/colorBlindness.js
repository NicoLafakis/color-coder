/**
 * Color Blindness Simulation Utilities
 * Uses Brettel, Vienot, and Machado algorithms for accurate CVD simulation
 */

/**
 * Color vision deficiency types
 */
export const CVD_TYPES = {
  normal: {
    id: 'normal',
    name: 'Normal Vision',
    description: 'Standard color perception',
    prevalence: '~92%'
  },
  protanopia: {
    id: 'protanopia',
    name: 'Protanopia',
    description: 'Red-blind (no red cones)',
    prevalence: '~1% of males'
  },
  deuteranopia: {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description: 'Green-blind (no green cones)',
    prevalence: '~1% of males'
  },
  tritanopia: {
    id: 'tritanopia',
    name: 'Tritanopia',
    description: 'Blue-blind (no blue cones)',
    prevalence: '~0.003%'
  },
  protanomaly: {
    id: 'protanomaly',
    name: 'Protanomaly',
    description: 'Red-weak (reduced red sensitivity)',
    prevalence: '~1% of males'
  },
  deuteranomaly: {
    id: 'deuteranomaly',
    name: 'Deuteranomaly',
    description: 'Green-weak (reduced green sensitivity)',
    prevalence: '~5% of males'
  },
  tritanomaly: {
    id: 'tritanomaly',
    name: 'Tritanomaly',
    description: 'Blue-weak (reduced blue sensitivity)',
    prevalence: '~0.01%'
  },
  achromatopsia: {
    id: 'achromatopsia',
    name: 'Achromatopsia',
    description: 'Complete color blindness (monochromacy)',
    prevalence: '~0.003%'
  }
};

/**
 * Transformation matrices for color blindness simulation
 * Based on the Brettel, Vienot, and Machado research
 */
const SIMULATION_MATRICES = {
  // Normal vision (identity matrix)
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ],

  // Protanopia (red-blind) - Vienot 1999
  protanopia: [
    [0.567, 0.433, 0.000],
    [0.558, 0.442, 0.000],
    [0.000, 0.242, 0.758]
  ],

  // Deuteranopia (green-blind) - Vienot 1999
  deuteranopia: [
    [0.625, 0.375, 0.000],
    [0.700, 0.300, 0.000],
    [0.000, 0.300, 0.700]
  ],

  // Tritanopia (blue-blind) - Brettel 1997
  tritanopia: [
    [0.950, 0.050, 0.000],
    [0.000, 0.433, 0.567],
    [0.000, 0.475, 0.525]
  ],

  // Protanomaly (red-weak) - Machado 2009
  protanomaly: [
    [0.817, 0.183, 0.000],
    [0.333, 0.667, 0.000],
    [0.000, 0.125, 0.875]
  ],

  // Deuteranomaly (green-weak) - Machado 2009
  deuteranomaly: [
    [0.800, 0.200, 0.000],
    [0.258, 0.742, 0.000],
    [0.000, 0.142, 0.858]
  ],

  // Tritanomaly (blue-weak)
  tritanomaly: [
    [0.967, 0.033, 0.000],
    [0.000, 0.733, 0.267],
    [0.000, 0.183, 0.817]
  ],

  // Achromatopsia (complete color blindness) - uses luminance
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [r, g, b].map(x => {
    const hex = clamp(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Apply color transformation matrix to RGB values
 */
function applyMatrix(rgb, matrix) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
  const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
  const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;

  return {
    r: newR * 255,
    g: newG * 255,
    b: newB * 255
  };
}

/**
 * Simulate color blindness for a single hex color
 */
export function simulateColorBlindness(hexColor, cvdType = 'normal') {
  if (cvdType === 'normal') {
    return hexColor;
  }

  const matrix = SIMULATION_MATRICES[cvdType];
  if (!matrix) {
    console.warn(`Unknown CVD type: ${cvdType}`);
    return hexColor;
  }

  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return hexColor;
  }

  const simulated = applyMatrix(rgb, matrix);
  return rgbToHex(simulated.r, simulated.g, simulated.b);
}

/**
 * Simulate color blindness for an array of colors
 */
export function simulatePalette(colors, cvdType = 'normal') {
  return colors.map(color => simulateColorBlindness(color, cvdType));
}

/**
 * Calculate color distance (Euclidean in RGB space)
 */
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

/**
 * Detect color pairs that become too similar under CVD simulation
 * Returns array of conflict objects
 */
export function detectConflicts(colors, cvdType, threshold = 30) {
  const conflicts = [];
  const simulatedColors = simulatePalette(colors, cvdType);

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      // Check if these colors are distinct in normal vision
      const normalDistance = colorDistance(colors[i], colors[j]);

      // Check distance in simulated vision
      const simulatedDistance = colorDistance(simulatedColors[i], simulatedColors[j]);

      // If they were distinct but become similar, that's a conflict
      if (normalDistance > threshold && simulatedDistance < threshold) {
        conflicts.push({
          index1: i,
          index2: j,
          color1: colors[i],
          color2: colors[j],
          simulated1: simulatedColors[i],
          simulated2: simulatedColors[j],
          normalDistance: Math.round(normalDistance),
          simulatedDistance: Math.round(simulatedDistance),
          severity: simulatedDistance < 15 ? 'high' : 'medium'
        });
      }
    }
  }

  return conflicts;
}

/**
 * Calculate accessibility score for a palette under different CVD types
 * Returns score from 0-100
 */
export function calculateAccessibilityScore(colors) {
  const cvdTypes = ['protanopia', 'deuteranopia', 'tritanopia'];
  let totalConflicts = 0;
  const maxPossibleConflicts = (colors.length * (colors.length - 1)) / 2;

  for (const cvdType of cvdTypes) {
    const conflicts = detectConflicts(colors, cvdType);
    totalConflicts += conflicts.length;
  }

  // Calculate score (100 = no conflicts, 0 = all pairs conflict)
  const averageConflicts = totalConflicts / cvdTypes.length;
  const score = Math.max(0, 100 - (averageConflicts / maxPossibleConflicts) * 100);

  return Math.round(score);
}

/**
 * Get all conflicts across all CVD types
 */
export function getAllConflicts(colors) {
  const allConflicts = {};

  for (const cvdType of Object.keys(CVD_TYPES)) {
    if (cvdType === 'normal') continue;

    const conflicts = detectConflicts(colors, cvdType);
    if (conflicts.length > 0) {
      allConflicts[cvdType] = conflicts;
    }
  }

  return allConflicts;
}
