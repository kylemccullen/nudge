import { Priority } from './types';

export const colors = {
  bg:      '#030712',  // gray-950
  surface: '#111827',  // gray-900
  card:    '#1f2937',  // gray-800
  border:  '#374151',  // gray-700

  textPrimary:   '#f9fafb',
  textSecondary: '#e5e7eb',
  textMuted:     '#9ca3af',
  textDisabled:  '#6b7280',

  primary:       '#4f46e5',  // indigo-600
  primaryHover:  '#4338ca',  // indigo-700

  danger:  '#f87171',
  success: '#4ade80',
  info:    '#818cf8',  // indigo-400

  priority: {
    [Priority.Critical]: { bg: '#450a0a', text: '#fca5a5', active: '#dc2626' },
    [Priority.High]:     { bg: '#431407', text: '#fdba74', active: '#ea580c' },
    [Priority.Medium]:   { bg: '#422006', text: '#fde047', active: '#ca8a04' },
    [Priority.Low]:      { bg: '#052e16', text: '#86efac', active: '#16a34a' },
  },

  dueBadge:     { bg: '#1e1b4b', text: '#a5b4fc' },
  overdueBadge: { bg: '#450a0a', text: '#fca5a5' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

export const font = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 21,
  xxl: 26,
};
