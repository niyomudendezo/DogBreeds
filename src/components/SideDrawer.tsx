import React, { useRef, useEffect, createContext, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { fetchRandomImages } from '../api/dogApi';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

// ── Context so any screen can open/close the drawer ─────────────────────────
interface DrawerCtx { openDrawer: () => void; closeDrawer: () => void; }
export const DrawerContext = createContext<DrawerCtx>({ openDrawer: () => {}, closeDrawer: () => {} });
export const useDrawer = () => useContext(DrawerContext);

// ── Menu items ───────────────────────────────────────────────────────────────
const MENU = [
  { label: 'Home',      emoji: '🏠', screen: 'Home' },
  { label: 'Gallery',   emoji: '📸', screen: 'Gallery' },
  { label: 'Favorites', emoji: '❤️', screen: 'Favorites' },
  { label: 'Search',    emoji: '🔍', screen: 'Gallery' },
];

interface Props {
  children: React.ReactNode;
  navigation: any;
  activeScreen: string;
}

const SideDrawer: React.FC<Props> = ({ children, navigation, activeScreen }) => {
  const [open, setOpen] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRandomImages(1).then(imgs => { if (imgs[0]) setBgImage(imgs[0].url); });
  }, []);

  const openDrawer = () => {
    setOpen(true);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  };

  const navigate = (screen: string) => {
    closeDrawer();
    setTimeout(() => {
      if (screen === 'Home') navigation.navigate('MainTabs', { screen: 'Home' });
      else if (screen === 'Gallery') navigation.navigate('MainTabs', { screen: 'Gallery' });
      else if (screen === 'Favorites') navigation.navigate('MainTabs', { screen: 'Favorites' });
    }, 260);
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={styles.root}>
        {/* Main content */}
        {children}

        {/* Overlay */}
        {open && (
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>
        )}

        {/* Drawer panel */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          {/* Background image */}
          {bgImage ? (
            <Image source={{ uri: bgImage }} style={styles.drawerBg} resizeMode="cover" />
          ) : null}
          <LinearGradient
            colors={['rgba(7,7,15,0.6)', 'rgba(7,7,15,0.92)', COLORS.background]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.drawerInner}>
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerLogo}>🐾 DogBreeds</Text>
                <Text style={styles.drawerTagline}>Explore the world of dogs</Text>
              </View>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Menu items */}
            <View style={styles.menuList}>
              {MENU.map((item, i) => {
                const isActive = activeScreen === item.screen && item.label !== 'Search';
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => navigate(item.screen)}
                    activeOpacity={0.75}
                  >
                    {isActive && (
                      <LinearGradient
                        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={styles.menuEmoji}>{item.emoji}</Text>
                    <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                      {item.label}
                    </Text>
                    {isActive && <Text style={styles.menuArrow}>→</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <View style={styles.divider} />
              <Text style={styles.footerText}>Powered by TheDogAPI 🐶</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 20,
    overflow: 'hidden',
  },
  drawerBg: { ...StyleSheet.absoluteFill },
  drawerInner: { flex: 1, paddingHorizontal: 24 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    marginBottom: 20,
  },
  drawerLogo: { color: '#fff', fontSize: 22, fontWeight: '900' },
  drawerTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  menuList: { gap: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  menuItemActive: { backgroundColor: 'transparent' },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: '600' },
  menuLabelActive: { color: '#fff', fontWeight: '800' },
  menuArrow: { color: '#fff', fontSize: 16, fontWeight: '700' },
  drawerFooter: { marginTop: 'auto', paddingBottom: 16 },
  footerText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' },
});

export default SideDrawer;
