import Constants from 'expo-constants';
export const API_KEY: string = Constants.expoConfig?.extra?.dogApiKey ?? '';
export const BASE_URL = 'https://api.thedogapi.com/v1';

export const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A25',
  secondary: '#F7C59F',
  background: '#07070F',
  card: '#12121F',
  cardAlt: '#1A1A2E',
  text: '#FFFFFF',
  textMuted: '#8888AA',
  accent: '#E94560',
  gold: '#FFD700',
  success: '#4CAF50',
  border: '#1E1E32',
  gradientStart: '#FF6B35',
  gradientEnd: '#E94560',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};
