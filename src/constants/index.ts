import Constants from 'expo-constants';
export const API_KEY: string = Constants.expoConfig?.extra?.dogApiKey ?? '';
export const BASE_URL = 'https://api.thedogapi.com/v1';

export const COLORS = {
  primary: '#FF6B35',
  secondary: '#F7C59F',
  background: '#0F0F1A',
  card: '#1A1A2E',
  cardAlt: '#16213E',
  text: '#FFFFFF',
  textMuted: '#A0A0B0',
  accent: '#E94560',
  gold: '#FFD700',
  success: '#4CAF50',
  border: '#2A2A3E',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};
