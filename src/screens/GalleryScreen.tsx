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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchRandomImages, fetchBreedImages } from '../api/dogApi';
import { DogImage } from '../types';
import { COLORS } from '../constants';

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
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadImages(0); }, [breedId]);

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

      {/* Header */}
      <SafeAreaView>
        <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.header}>
          <View style={styles.headerRow}>
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{breedName ? `${breedName}` : '🐶 Dog Gallery'}</Text>
              <Text style={styles.subtitle}>{images.length} photos</Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

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

      {/* Fullscreen Modal */}
      <Modal visible={!!selected} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />

          <Animated.View style={[styles.modalContent, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            {selected && (
              <>
                <Image source={{ uri: selected.url }} style={styles.modalImage} resizeMode="contain" />

                {/* Prev / Next */}
                <TouchableOpacity style={[styles.navBtn, styles.navLeft]} onPress={prevImage}>
                  <Text style={styles.navText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, styles.navRight]} onPress={nextImage}>
                  <Text style={styles.navText}>›</Text>
                </TouchableOpacity>

                {/* Close */}
                <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {/* Breed info */}
                {selected.breeds && selected.breeds.length > 0 && (
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.modalInfo}>
                    <Text style={styles.modalBreedName}>{selected.breeds[0].name}</Text>
                    {selected.breeds[0].breed_group ? (
                      <Text style={styles.modalBreedGroup}>{selected.breeds[0].breed_group}</Text>
                    ) : null}
                  </LinearGradient>
                )}

                {/* Counter */}
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
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  backBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
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
