import React from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import HomeScreen from '../screens/HomeScreen';
import BreedDetailScreen from '../screens/BreedDetailScreen';
import GalleryScreen from '../screens/GalleryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SideDrawer from '../components/SideDrawer';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <View style={focused ? tabStyles.activeIconWrap : tabStyles.iconWrap}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
    <Text style={{ fontSize: 10, color: focused ? COLORS.primary : COLORS.textMuted, fontWeight: focused ? '800' : '500' }}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrap: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  activeIconWrap: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.18)',
    borderRadius: 12,
  },
});

// Wrapper that gives SideDrawer access to navigation
const RootWithDrawer = ({ navigation }: any) => {
  const state = useNavigationState(s => s);
  const activeRoute = state?.routes?.[state.index]?.name ?? 'MainTabs';
  const hideTabBar = ['BreedDetail', 'ImageGallery', 'Search'].includes(activeRoute);

  const routeName = useNavigationState(s => {
    const tabState = s?.routes?.[0]?.state;
    const idx = tabState?.index ?? 0;
    return (tabState?.routes?.[idx]?.name as string) ?? 'Home';
  });

  return (
    <SideDrawer navigation={navigation} activeScreen={routeName}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : {
                backgroundColor: COLORS.card,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
                height: 72,
                paddingBottom: 10,
                paddingTop: 6,
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
    </SideDrawer>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={RootWithDrawer} />
      <Stack.Screen name="BreedDetail" component={BreedDetailScreen} />
      <Stack.Screen name="ImageGallery" component={GalleryScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
