# 🐾 DogBreeds App

A visually stunning React Native (Expo) app for exploring dog breeds using [The Dog API](https://thedogapi.com).

## ✨ Features

- 🏠 **Breeds Home** — Grid view of all breeds with animated cards
- 🔍 **Search** — Real-time breed search
- 🏷️ **Filter by Group** — Herding, Hound, Terrier, Toy, Working, etc.
- 📋 **Breed Detail** — Parallax hero image, stats (weight, height, lifespan), temperament traits, origin
- 📸 **Photo Gallery** — Infinite scroll grid of dog photos with fullscreen modal viewer
- ❤️ **Favorites** — Save and manage your favorite breeds (persisted locally)
- 🎲 **Random Gallery** — Discover random dog images from all breeds
- 🌙 **Dark Theme** — Sleek dark UI throughout

## 🚀 Getting Started

### 1. Get your API Key
Visit [https://www.thedogapi.com/en/students](https://www.thedogapi.com/en/students) and sign up for a free API key.

### 2. Add your API Key
Open `src/constants/index.ts` and replace:
```ts
export const API_KEY = 'live_YOUR_API_KEY_HERE';
```
with your actual key.

### 3. Install & Run
```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator.

### 4. Build APK
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## 🛠 Tech Stack

- React Native + Expo (TypeScript)
- React Navigation (Stack + Bottom Tabs)
- Expo Linear Gradient
- AsyncStorage (favorites persistence)
- Axios (API calls)
- React Native Reanimated (animations)

## 📁 Project Structure

```
src/
├── api/          # Dog API calls
├── components/   # BreedCard, SearchBar, LoadingSpinner
├── constants/    # Colors, API config
├── hooks/        # useFavorites
├── navigation/   # AppNavigator
├── screens/      # Home, BreedDetail, Gallery, Favorites
└── types/        # TypeScript interfaces
```
