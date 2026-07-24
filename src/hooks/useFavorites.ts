import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Breed } from '../types';

const FAVORITES_KEY = '@dog_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Breed[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  };

  const toggleFavorite = useCallback(async (breed: Breed) => {
    setFavorites(prev => {
      const exists = prev.find(b => b.id === breed.id);
      const updated = exists ? prev.filter(b => b.id !== breed.id) : [...prev, breed];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (breedId: number) => favorites.some(b => b.id === breedId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
};
