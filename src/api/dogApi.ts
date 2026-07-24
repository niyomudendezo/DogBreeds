import axios from 'axios';
import { API_KEY, BASE_URL } from '../constants';
import { Breed, DogImage } from '../types';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-api-key': API_KEY },
});

export const fetchBreeds = async (page = 0, limit = 20): Promise<Breed[]> => {
  const { data } = await api.get('/breeds', { params: { page, limit } });
  return data;
};

export const searchBreeds = async (query: string): Promise<Breed[]> => {
  const { data } = await api.get('/breeds/search', { params: { q: query } });
  return data;
};

export const fetchBreedImages = async (breedId: number, limit = 20): Promise<DogImage[]> => {
  const { data } = await api.get('/images/search', {
    params: { breed_ids: breedId, limit, has_breeds: 1 },
  });
  return data;
};

export const fetchRandomImages = async (limit = 20): Promise<DogImage[]> => {
  const { data } = await api.get('/images/search', { params: { limit, has_breeds: 1 } });
  return data;
};

export const fetchBreedById = async (breedId: number): Promise<Breed> => {
  const { data } = await api.get(`/breeds/${breedId}`);
  return data;
};
