import 'dotenv/config';

export default {
  expo: {
    name: 'DogBreeds',
    slug: 'DogBreeds',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0F1A',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.dogbreeds.app',
      adaptiveIcon: {
        backgroundColor: '#0F0F1A',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      dogApiKey: process.env.DOG_API_KEY,
      eas: {
        projectId: '8a19e6ac-8001-47a3-b59e-e06dacc7e2d9',
      },
    },
    plugins: ['expo-build-properties'],
  },
};
