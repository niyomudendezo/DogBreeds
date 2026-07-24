import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchRandomImages, fetchBreedImages, searchBreeds } from '../api/dogApi';
import { DogImage, Breed } from '../types';
import { COLORS } from '../constants';
import HamburgerBtn from '../components/HamburgerBtn';

const { width, height } = Dimensions.get('window');
const COL = 3;
const IMG_SIZE = (width - (COL + 1) * 2) / COL;

const GalleryScreen = ({ route, navigation }: any) => {
  const breedId = route?.params?.breedId;
  const breedName = route?.params?.breedName;

  const [images, setImages] = useState<DogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DogImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [page, setPage] = useState(0);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Breed[]>([]);
  const [searching, setSearching] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Modal animation
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadImages(0); }, [breedId]);

  useEffect(() => {
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      searchBreeds(query).then(r => { setSearchResults(r); setSearching(false); });
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const toggleSearch = () => {
    if (searchOpen) {
      Animated.timing(searchAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => {
        setSearchOpen(false);
        setQuery('');
        setSearchResults([]);
      });
    } else {
      setSearchOpen(true);
      Animated.timing(searchAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start(() => {
        inputRef.current?.focus();
      });
    }
  };

  const searchBarWidth = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width - 110] });
  const searchBarOpacity = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const loadImages = async (p: number) => {
    try {
      const data = breedId ? await fetchBreedImages(breedId, 30) : await fetchRandomImages(30);
      setImages(prev => (p === 0 ? data : [...prev, ...data]));
    } finally { setLoading(false); }
  };

  const openModal = (item: DogImage, index: number) => {
    setSelected(item);
    setSelectedIndex(index);
    modalScale.setValue(0.85);
    modalOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setSelected(null));
  };

  const prevImage = () => {
    const prev = (selectedIndex - 1 + images.length) % images.length;
    setSelectedIndex(prev);
    setSelected(images[prev]);
  };

  const nextImage = () => {
    const next = (selectedIndex + 1) % images.length;
    setSelectedIndex(next);
    setSelected(images[next]);
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header with inline search ── */}
      <SafeAreaView>
        <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.header}>
          <View style={styles.headerRow}>
            {/* Back button */}
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>←</Text>
              </TouchableOpacity>
            )}

            {/* Hamburger — only on main gallery tab (no back) */}
            {!navigation.canGoBack() && <HamburgerBtn />}

            {/* Title — hides when search is open */}
            {!searchOpen && (
              <View style={styles.titleWrap}>
                <Text style={styles.title} numberOfLines={1}>
                  {breedName ? breedName : '🐶 Gallery'}
                </Text>
                <Text style={styles.subtitle}>{images.length} photos</Text>
              </View>
            )}

            {/* Expanding search input */}
            <Animated.View style={[styles.searchInputWrap, { width: searchBarWidth, opacity: searchBarOpacity }]}>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search breeds..."
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Search icon button */}
            <TouchableOpacity
              onPress={toggleSearch}
              style={[styles.iconBtn, searchOpen && styles.iconBtnActive]}
            >
              <Text style={styles.iconBtnText}>{searchOpen ? '✕' : '🔍'}</Text>
            </TouchableOpacity>
          </View>

          {/* Search results dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <View style={styles.dropdown}>
              {searching && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginBottom: 8 }} />
              )}
              {searchResults.slice(0, 6).map(breed => (
                <TouchableOpacity
                  key={breed.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    toggleSearch();
                    navigation.navigate('ImageGallery', { breedId: breed.id, breedName: breed.name });
                  }}
                >
                  {breed.image?.url || breed.reference_image_id ? (
                    <Image
                      source={{ uri: breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg` }}
                      style={styles.dropdownThumb}
                    />
                  ) : null}
                  <View style={styles.dropdownInfo}>
                    <Text style={styles.dropdownName}>{breed.name}</Text>
                    {breed.breed_group ? (
                      <Text style={styles.dropdownGroup}>{breed.breed_group}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.dropdownArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* ── Photo Grid ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={COL}
          onEndReached={() => { const next = page + 1; setPage(next); loadImages(next); }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => openModal(item, index)} activeOpacity={0.85}>
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── Fullscreen Modal ── */}
      <Modal visible={!!selected} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <Animated.View style={[styles.modalContent, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            {selected && (
              <>
                <Image source={{ uri: selected.url }} style={styles.modalImage} resizeMode="contain" />

                <TouchableOpacity style={[styles.navBtn, styles.navLeft]} onPress={prevImage}>
                  <Text style={styles.navText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, styles.navRight]} onPress={nextImage}>
                  <Text style={styles.navText}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {selected.breeds && selected.breeds.length > 0 && (
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.modalInfo}>
                    <Text style={styles.modalBreedName}>{selected.breeds[0].name}</Text>
                    {selected.breeds[0].breed_group ? (
                      <Text style={styles.modalBreedGroup}>{selected.breeds[0].breed_group}</Text>
                    ) : null}
                  </LinearGradient>
                )}

                <View style={styles.counter}>
                  <Text style={styles.counterText}>{selectedIndex + 1} / {images.length}</Text>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: { paddingBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 10,
  },
  iconBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  iconBtnText: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  titleWrap: { flex: 1 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  subtitle: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },

  // Search
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  clearBtn: { paddingLeft: 6 },
  clearText: { color: COLORS.textMuted, fontSize: 14 },

  // Dropdown
  dropdown: {
    marginHorizontal: 14,
    marginTop: 6,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  dropdownThumb: { width: 40, height: 40, borderRadius: 10 },
  dropdownInfo: { flex: 1 },
  dropdownName: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  dropdownGroup: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  dropdownArrow: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },

  // Grid
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },
  grid: { padding: 2, paddingBottom: 30 },
  image: { width: IMG_SIZE, height: IMG_SIZE, margin: 1 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width - 20, height: height * 0.75, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  modalImage: { width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  closeText: { color: '#fff', fontSize: 16 },
  navBtn: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  navText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  modalBreedName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  modalBreedGroup: { color: COLORS.secondary, fontSize: 13, marginTop: 4 },
  counter: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default GalleryScreen;
