import type { ColorRamp } from '../types/habit';

/**
 * Convert HEX color to HSL
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate color ramp from base habit color
 */
export function generateColorRamp(baseColor: string): ColorRamp {
  const { h, s, l } = hexToHSL(baseColor);
  
  // Generate variants by adjusting lightness and saturation
  const weak = hslToHex(h, Math.min(s + 10, 100), Math.min(l + 30, 90));
  const mid = hslToHex(h, Math.min(s + 5, 100), Math.min(l + 15, 80));
  const strong = baseColor; // Use the original color as strong
  const outline = hslToHex(h, Math.min(s + 20, 100), Math.max(l - 20, 20));
  
  return {
    accent: baseColor,
    weak,
    mid,
    strong,
    outline
  };
}

/**
 * Get CSS variables object for setting on component root
 */
export function getCSSVariables(habitColor: string): Record<string, string> {
  const ramp = generateColorRamp(habitColor);
  
  return {
    '--habit-accent': ramp.accent,
    '--cell-weak': ramp.weak,
    '--cell-mid': ramp.mid,
    '--cell-strong': ramp.strong,
    '--cell-outline': ramp.outline
  };
}

/**
 * Generate CSS variables string for inline styles
 */
export function getCSSVariablesString(habitColor: string): string {
  const variables = getCSSVariables(habitColor);
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Get cell color based on value and intensity
 */
export function getCellColor(value: 0 | 1 | null): string {
  switch (value) {
    case 1:
      return 'var(--cell-strong)';
    case 0:
      return 'var(--cell-weak)';
    case null:
    default:
      return '#f1f5f9'; // Light gray for no entry
  }
}

/**
 * Predefined color palette for habit selection
 */
export const HABIT_COLOR_PALETTE = [
  '#F6A500', // Orange (default from screenshot)
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange Alt
  '#06B6D4', // Cyan
] as const;