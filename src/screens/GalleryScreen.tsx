import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { fetchRandomImages, fetchBreedImages } from '../api/dogApi';
import { DogImage } from '../types';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');
const IMG_SIZE = (width - 6) / 3;

const GalleryScreen = ({ route, navigation }: any) => {
  const breedId = route?.params?.breedId;
  const breedName = route?.params?.breedName;
  const [images, setImages] = useState<DogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DogImage | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadImages(0);
  }, [breedId]);

  const loadImages = async (p: number) => {
    try {
      const data = breedId
        ? await fetchBreedImages(breedId, 30)
        : await fetchRandomImages(30);
      setImages(prev => (p === 0 ? data : [...prev, ...data]));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadImages(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{breedName ? `${breedName} Photos` : '🐶 Dog Gallery'}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={3}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelected(item)}>
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {selected && (
            <>
              <Image source={{ uri: selected.url }} style={styles.modalImage} resizeMode="contain" />
              {selected.breeds && selected.breeds.length > 0 && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalBreedName}>{selected.breeds[0].name}</Text>
                  {selected.breeds[0].temperament ? (
                    <Text style={styles.modalBreedTemp} numberOfLines={2}>
                      {selected.breeds[0].temperament}
                    </Text>
                  ) : null}
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: IMG_SIZE, height: IMG_SIZE, margin: 1 },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: { color: '#fff', fontSize: 18 },
  modalImage: { width: width - 32, height: width - 32, borderRadius: 20 },
  modalInfo: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBreedName: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalBreedTemp: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
});

export default GalleryScreen;
