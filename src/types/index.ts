export interface Breed {
  id: number;
  name: string;
  bred_for?: string;
  breed_group?: string;
  life_span?: string;
  temperament?: string;
  origin?: string;
  weight?: { imperial: string; metric: string };
  height?: { imperial: string; metric: string };
  reference_image_id?: string;
  image?: { url: string };
  description?: string;
}

export interface DogImage {
  id: string;
  url: string;
  breeds?: Breed[];
  width?: number;
  height?: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  BreedDetail: { breed: Breed };
  ImageGallery: { breedId?: number; breedName?: string };
};

export type TabParamList = {
  Home: undefined;
  Gallery: undefined;
  Favorites: undefined;
};
