import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Breed } from '../types';

const FAVORITES_KEY = '@dog_favorites';

interface FavoritesContextValue {
  favorites: Breed[];
  toggleFavorite: (breed: Breed) => void;
  isFavorite: (breedId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Breed[]>([]);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(FAVORITES_KEY)
      .then(stored => {
        if (mounted && stored) setFavorites(JSON.parse(stored));
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const toggleFavorite = useCallback((breed: Breed) => {
    setFavorites(previous => {
      const exists = previous.some(item => item.id === breed.id);
      const updated = exists
        ? previous.filter(item => item.id !== breed.id)
        : [...previous, breed];

      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
        .catch(() => undefined);

      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (breedId: number) => favorites.some(breed => breed.id === breedId),
    [favorites],
  );

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite }),
    [favorites, toggleFavorite, isFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return context;
};
