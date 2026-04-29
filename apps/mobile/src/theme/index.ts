export const colors = {
  brand: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#4C1D95',
    900: '#2E1065',
  },
  gray: {
    50: '#F8F7FF',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    800: '#1F2937',
    900: '#1E1B4B',
  },
  green: '#059669',
  greenLight: '#D1FAE5',
  yellow: '#D97706',
  yellowLight: '#FEF3C7',
  red: '#DC2626',
  redLight: '#FEE2E2',
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  orangeLight: '#FFF7ED',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
};

// Deterministic avatar colour from name initial
const AVATAR_PALETTE = ['#7C3AED','#DB2777','#0891B2','#059669','#D97706','#DC2626','#2563EB','#0F766E'];
export function getAvatarColor(name = ''): string {
  return AVATAR_PALETTE[(name.charCodeAt(0) || 65) % AVATAR_PALETTE.length];
}
