import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { COLORS } from '../constants';
import HomeScreen from '../screens/HomeScreen';
import BreedDetailScreen from '../screens/BreedDetailScreen';
import GalleryScreen from '../screens/GalleryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 10, color: focused ? COLORS.primary : COLORS.textMuted, fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  </View>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 10,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Breeds" focused={focused} /> }}
    />
    <Tab.Screen
      name="Gallery"
      component={GalleryScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📸" label="Gallery" focused={focused} /> }}
    />
    <Tab.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" label="Favorites" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="BreedDetail" component={BreedDetailScreen} />
      <Stack.Screen name="ImageGallery" component={GalleryScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
