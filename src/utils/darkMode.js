import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';

extend([a11yPlugin]);

/**
 * Dark mode generation algorithms
 */
export const DARK_MODE_ALGORITHMS = {
  invertLightness: {
    id: 'invertLightness',
    name: 'Invert Lightness',
    description: 'Flips lightness values around 50% midpoint while preserving hue and saturation'
  },
  shiftDarker: {
    id: 'shiftDarker',
    name: 'Shift Darker',
    description: 'Shifts colors toward darker analogous variants'
  },
  desaturateDarken: {
    id: 'desaturateDarken',
    name: 'Desaturate & Darken',
    description: 'Reduces saturation and darkens for a muted dark theme'
  },
  preserveContrast: {
    id: 'preserveContrast',
    name: 'Preserve Contrast',
    description: 'Maintains WCAG contrast ratios while inverting the theme'
  }
};

/**
 * Color roles for semantic mapping
 */
export const COLOR_ROLES = [
  { id: 'primary', name: 'Primary', description: 'Main brand color' },
  { id: 'secondary', name: 'Secondary', description: 'Supporting color' },
  { id: 'accent', name: 'Accent', description: 'Highlight color' },
  { id: 'surface', name: 'Surface', description: 'Card/component backgrounds' },
  { id: 'background', name: 'Background', description: 'Page background' }
];

/**
 * Invert lightness algorithm
 * Flips lightness around 50% midpoint, slightly desaturates for dark mode comfort
 */
export function invertLightness(hex, role = 'default') {
  const color = colord(hex);
  const hsl = color.toHsl();

  // Invert lightness around 50%
  let newLightness = 100 - hsl.l;

  // Apply role-specific adjustments
  switch (role) {
    case 'background':
      // Very dark backgrounds
      newLightness = Math.min(newLightness, 12);
      break;
    case 'surface':
      // Slightly lighter than background
      newLightness = Math.min(newLightness, 18);
      break;
    case 'primary':
    case 'secondary':
    case 'accent':
      // Keep colors vibrant but not too bright
      newLightness = Math.max(40, Math.min(newLightness, 70));
      break;
    default:
      break;
  }

  // Slightly desaturate for dark mode (reduces eye strain)
  const newSaturation = Math.max(0, hsl.s * 0.9);

  return colord({ h: hsl.h, s: newSaturation, l: newLightness }).toHex();
}

/**
 * Shift darker algorithm
 * Moves colors toward darker analogous variants
 */
export function shiftDarker(hex, role = 'default') {
  const color = colord(hex);
  const hsl = color.toHsl();

  // Darken based on current lightness
  let darkenAmount;
  if (hsl.l > 70) {
    darkenAmount = 0.5; // Light colors darken significantly
  } else if (hsl.l > 50) {
    darkenAmount = 0.3;
  } else {
    darkenAmount = 0.15; // Already dark colors darken less
  }

  // Role-specific adjustments
  switch (role) {
    case 'background':
      return colord({ h: hsl.h, s: Math.max(5, hsl.s * 0.3), l: 8 }).toHex();
    case 'surface':
      return colord({ h: hsl.h, s: Math.max(5, hsl.s * 0.4), l: 14 }).toHex();
    default:
      break;
  }

  // Shift hue slightly for visual interest (toward cooler tones)
  const hueShift = hsl.l > 50 ? -5 : 0;
  const newHue = (hsl.h + hueShift + 360) % 360;

  return color
    .darken(darkenAmount)
    .saturate(0.05)
    .rotate(hueShift)
    .toHex();
}

/**
 * Desaturate and darken algorithm
 * Creates a muted, comfortable dark theme
 */
export function desaturateDarken(hex, role = 'default') {
  const color = colord(hex);
  const hsl = color.toHsl();

  let newLightness;
  let newSaturation;

  switch (role) {
    case 'background':
      newLightness = 10;
      newSaturation = Math.max(3, hsl.s * 0.2);
      break;
    case 'surface':
      newLightness = 16;
      newSaturation = Math.max(5, hsl.s * 0.25);
      break;
    case 'primary':
    case 'accent':
      // Keep some vibrancy for interactive elements
      newLightness = Math.max(45, Math.min(60, 100 - hsl.l));
      newSaturation = Math.max(40, hsl.s * 0.7);
      break;
    case 'secondary':
      newLightness = Math.max(40, Math.min(55, 100 - hsl.l));
      newSaturation = Math.max(30, hsl.s * 0.6);
      break;
    default:
      newLightness = Math.max(30, Math.min(65, 100 - hsl.l * 0.8));
      newSaturation = Math.max(20, hsl.s * 0.6);
      break;
  }

  return colord({ h: hsl.h, s: newSaturation, l: newLightness }).toHex();
}

/**
 * Preserve contrast algorithm
 * Ensures WCAG contrast ratios are maintained
 */
export function preserveContrast(hex, role = 'default', targetBackground = '#121212') {
  const color = colord(hex);
  const hsl = color.toHsl();
  const bgColor = colord(targetBackground);

  // Calculate target contrast based on role
  let targetContrast;
  switch (role) {
    case 'background':
      return targetBackground;
    case 'surface':
      // Surface should be slightly lighter than background
      return colord(targetBackground).lighten(0.03).toHex();
    case 'primary':
    case 'accent':
      targetContrast = 4.5; // WCAG AA for normal text
      break;
    case 'secondary':
      targetContrast = 3.5;
      break;
    default:
      targetContrast = 4.5;
      break;
  }

  // Start with inverted lightness
  let newLightness = 100 - hsl.l;
  let adjustedColor = colord({ h: hsl.h, s: hsl.s * 0.85, l: newLightness });

  // Adjust lightness until we meet contrast requirements
  let attempts = 0;
  const maxAttempts = 50;

  while (adjustedColor.contrast(bgColor) < targetContrast && attempts < maxAttempts) {
    newLightness = Math.min(95, newLightness + 2);
    adjustedColor = colord({ h: hsl.h, s: hsl.s * 0.85, l: newLightness });
    attempts++;
  }

  return adjustedColor.toHex();
}

/**
 * Generate dark mode palette from light mode colors
 */
export function generateDarkPalette(colors, algorithm = 'invertLightness') {
  const algorithmFn = {
    invertLightness,
    shiftDarker,
    desaturateDarken,
    preserveContrast
  }[algorithm] || invertLightness;

  // Assign roles based on position
  const roles = ['primary', 'secondary', 'accent', 'surface', 'background'];

  return colors.map((color, index) => {
    const role = roles[index] || 'default';
    return {
      light: color,
      dark: algorithmFn(color, role),
      role
    };
  });
}

/**
 * Generate CSS variables for both themes
 */
export function generateThemeCSS(lightColors, darkColors, prefix = 'color') {
  const roles = ['primary', 'secondary', 'accent', 'surface', 'background'];

  let lightVars = ':root {\n';
  let darkVars = '@media (prefers-color-scheme: dark) {\n  :root {\n';
  let darkClassVars = '.dark {\n';

  lightColors.forEach((color, index) => {
    const role = roles[index] || `color-${index + 1}`;
    lightVars += `  --${prefix}-${role}: ${color};\n`;
  });

  darkColors.forEach((color, index) => {
    const role = roles[index] || `color-${index + 1}`;
    darkVars += `    --${prefix}-${role}: ${color};\n`;
    darkClassVars += `  --${prefix}-${role}: ${color};\n`;
  });

  lightVars += '}\n\n';
  darkVars += '  }\n}\n\n';
  darkClassVars += '}\n';

  return lightVars + darkVars + darkClassVars;
}

/**
 * Calculate accessibility score for a dark palette
 */
export function calculateDarkModeScore(darkColors, backgroundColor = null) {
  const bgColor = backgroundColor || darkColors[darkColors.length - 1] || '#121212';
  const bg = colord(bgColor);

  let totalScore = 0;
  let colorCount = 0;

  darkColors.forEach((color, index) => {
    // Skip background color
    if (index === darkColors.length - 1) return;

    const contrast = colord(color).contrast(bg);

    // Score based on WCAG levels
    if (contrast >= 7) {
      totalScore += 100; // AAA
    } else if (contrast >= 4.5) {
      totalScore += 80; // AA
    } else if (contrast >= 3) {
      totalScore += 50; // Minimum
    } else {
      totalScore += 20; // Poor
    }

    colorCount++;
  });

  return colorCount > 0 ? Math.round(totalScore / colorCount) : 0;
}
