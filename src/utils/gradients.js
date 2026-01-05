import { colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';
import lchPlugin from 'colord/plugins/lch';

extend([labPlugin, lchPlugin]);

/**
 * Gradient types
 */
export const GRADIENT_TYPES = {
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Straight line gradient'
  },
  radial: {
    id: 'radial',
    name: 'Radial',
    description: 'Circular gradient from center'
  },
  conic: {
    id: 'conic',
    name: 'Conic',
    description: 'Angular sweep around center'
  }
};

/**
 * Color interpolation modes
 */
export const INTERPOLATION_MODES = {
  rgb: { id: 'rgb', name: 'RGB', description: 'Standard RGB interpolation' },
  hsl: { id: 'hsl', name: 'HSL', description: 'Hue-Saturation-Lightness' },
  lab: { id: 'lab', name: 'LAB', description: 'Perceptually uniform' },
  lch: { id: 'lch', name: 'LCH', description: 'Cylindrical LAB' }
};

/**
 * Preset gradients
 */
export const GRADIENT_PRESETS = [
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#FF6B6B', position: 0 },
      { color: '#FFA500', position: 50 },
      { color: '#FFD93D', position: 100 }
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'linear',
    angle: 180,
    stops: [
      { color: '#667EEA', position: 0 },
      { color: '#764BA2', position: 100 }
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'linear',
    angle: 45,
    stops: [
      { color: '#134E5E', position: 0 },
      { color: '#71B280', position: 100 }
    ]
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#00C9FF', position: 0 },
      { color: '#92FE9D', position: 100 }
    ]
  },
  {
    id: 'candy',
    name: 'Candy',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#FF9A9E', position: 0 },
      { color: '#FECFEF', position: 50 },
      { color: '#FECFEF', position: 100 }
    ]
  },
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'linear',
    angle: 180,
    stops: [
      { color: '#232526', position: 0 },
      { color: '#414345', position: 100 }
    ]
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    type: 'conic',
    angle: 0,
    stops: [
      { color: '#FF0000', position: 0 },
      { color: '#FF7F00', position: 17 },
      { color: '#FFFF00', position: 33 },
      { color: '#00FF00', position: 50 },
      { color: '#0000FF', position: 67 },
      { color: '#4B0082', position: 83 },
      { color: '#FF0000', position: 100 }
    ]
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    type: 'radial',
    shape: 'circle',
    stops: [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 100 }
    ]
  }
];

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new gradient stop
 */
export function createStop(color, position) {
  return {
    id: generateId(),
    color,
    position
  };
}

/**
 * Generate gradient from palette colors
 */
export function createGradientFromPalette(colors, type = 'linear', angle = 90) {
  const stops = colors.map((color, index) => ({
    id: generateId(),
    color,
    position: Math.round((index / (colors.length - 1)) * 100)
  }));

  return {
    id: generateId(),
    name: 'From Palette',
    type,
    angle,
    stops,
    interpolation: 'rgb',
    shape: 'ellipse',
    position: { x: 50, y: 50 }
  };
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1, color2, t, mode = 'rgb') {
  const c1 = colord(color1);
  const c2 = colord(color2);

  switch (mode) {
    case 'hsl': {
      const hsl1 = c1.toHsl();
      const hsl2 = c2.toHsl();
      return colord({
        h: hsl1.h + (hsl2.h - hsl1.h) * t,
        s: hsl1.s + (hsl2.s - hsl1.s) * t,
        l: hsl1.l + (hsl2.l - hsl1.l) * t
      }).toHex();
    }
    case 'lab': {
      const lab1 = c1.toLab();
      const lab2 = c2.toLab();
      return colord({
        l: lab1.l + (lab2.l - lab1.l) * t,
        a: lab1.a + (lab2.a - lab1.a) * t,
        b: lab1.b + (lab2.b - lab1.b) * t
      }).toHex();
    }
    case 'lch': {
      const lch1 = c1.toLch();
      const lch2 = c2.toLch();
      return colord({
        l: lch1.l + (lch2.l - lch1.l) * t,
        c: lch1.c + (lch2.c - lch1.c) * t,
        h: lch1.h + (lch2.h - lch1.h) * t
      }).toHex();
    }
    case 'rgb':
    default: {
      const rgb1 = c1.toRgb();
      const rgb2 = c2.toRgb();
      return colord({
        r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * t),
        g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * t),
        b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * t)
      }).toHex();
    }
  }
}

/**
 * Generate CSS gradient string
 */
export function generateGradientCSS(gradient) {
  const { type, angle, stops, shape, position } = gradient;

  // Sort stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  // Build color stops string
  const colorStops = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorStops})`;

    case 'radial': {
      const shapeStr = shape || 'ellipse';
      const posStr = position ? `at ${position.x}% ${position.y}%` : 'at center';
      return `radial-gradient(${shapeStr} ${posStr}, ${colorStops})`;
    }

    case 'conic': {
      const posStr = position ? `at ${position.x}% ${position.y}%` : 'at center';
      return `conic-gradient(from ${angle}deg ${posStr}, ${colorStops})`;
    }

    default:
      return `linear-gradient(${angle}deg, ${colorStops})`;
  }
}

/**
 * Generate full CSS with background property
 */
export function generateFullCSS(gradient, selector = '.gradient') {
  const gradientCSS = generateGradientCSS(gradient);

  return `${selector} {
  background: ${gradient.stops[0]?.color || '#000000'}; /* Fallback */
  background: ${gradientCSS};
}`;
}

/**
 * Generate Tailwind arbitrary value
 */
export function generateTailwindCSS(gradient) {
  const gradientCSS = generateGradientCSS(gradient);
  // Escape special characters for Tailwind arbitrary values
  const escaped = gradientCSS.replace(/\s+/g, '_').replace(/,/g, '_');
  return `bg-[${escaped}]`;
}

/**
 * Generate SVG gradient definition
 */
export function generateSVGGradient(gradient, id = 'gradient') {
  const { type, angle, stops } = gradient;
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  if (type === 'radial') {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
${sortedStops.map(s => `  <stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n')}
</radialGradient>`;
  }

  // Convert angle to x1, y1, x2, y2 coordinates
  const angleRad = ((angle - 90) * Math.PI) / 180;
  const x1 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50);
  const y1 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50);
  const x2 = Math.round(50 + Math.cos(angleRad) * 50);
  const y2 = Math.round(50 + Math.sin(angleRad) * 50);

  return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${sortedStops.map(s => `  <stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n')}
</linearGradient>`;
}

/**
 * Reverse gradient stops
 */
export function reverseGradient(gradient) {
  return {
    ...gradient,
    stops: gradient.stops.map(stop => ({
      ...stop,
      position: 100 - stop.position
    }))
  };
}

/**
 * Add more stops to make gradient smoother
 */
export function smoothGradient(gradient, numStops = 10, interpolation = 'rgb') {
  const { stops } = gradient;
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  if (sortedStops.length < 2) return gradient;

  const newStops = [];

  for (let i = 0; i <= numStops; i++) {
    const position = (i / numStops) * 100;

    // Find the two stops to interpolate between
    let stop1 = sortedStops[0];
    let stop2 = sortedStops[sortedStops.length - 1];

    for (let j = 0; j < sortedStops.length - 1; j++) {
      if (position >= sortedStops[j].position && position <= sortedStops[j + 1].position) {
        stop1 = sortedStops[j];
        stop2 = sortedStops[j + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const range = stop2.position - stop1.position;
    const t = range > 0 ? (position - stop1.position) / range : 0;

    const color = interpolateColor(stop1.color, stop2.color, t, interpolation);

    newStops.push({
      id: generateId(),
      color,
      position: Math.round(position)
    });
  }

  return {
    ...gradient,
    stops: newStops
  };
}
