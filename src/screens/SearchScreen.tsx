import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { searchBreeds, fetchBreedImages } from '../api/dogApi';
import { Breed, DogImage } from '../types';
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';
import HamburgerBtn from '../components/HamburgerBtn';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Breed[]>([]);
  const [searching, setSearching] = useState(false);
  const [breedImages, setBreedImages] = useState<Record<number, string>>({});
  const inputRef = useRef<TextInput>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Auto-focus input when screen opens
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Live search with debounce
  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const data = await searchBreeds(query);
      setResults(data);
      setSearching(false);
      // Fetch one image per breed result
      data.slice(0, 10).forEach(async (breed) => {
        if (breed.image?.url) {
          setBreedImages(prev => ({ ...prev, [breed.id]: breed.image!.url! }));
        } else if (breed.reference_image_id) {
          setBreedImages(prev => ({
            ...prev,
            [breed.id]: `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`,
          }));
        }
      });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const renderBreed = ({ item }: { item: Breed }) => {
    const imgUrl = breedImages[item.id];
    const fav = isFavorite(item.id);
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => navigation.navigate('BreedDetail', { breed: item })}
        activeOpacity={0.85}
      >
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.resultImage} resizeMode="cover" />
        ) : (
          <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
            <Text style={{ fontSize: 28 }}>🐶</Text>
          </View>
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          {item.breed_group ? (
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>{item.breed_group}</Text>
            </View>
          ) : null}
          {item.temperament ? (
            <Text style={styles.resultTemp} numberOfLines={1}>{item.temperament}</Text>
          ) : null}
          {item.life_span ? (
            <Text style={styles.resultLife}>⏳ {item.life_span}</Text>
          ) : null}
        </View>
        <View style={styles.resultActions}>
          <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.favBtn}>
            <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ImageGallery', { breedId: item.id, breedName: item.name })}
            style={styles.photosBtn}
          >
            <Text style={styles.photosBtnText}>📸</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.header}>
          {/* Top row: hamburger + title */}
          <View style={styles.topRow}>
            <HamburgerBtn />
            <Text style={styles.screenTitle}>🔍 Search</Text>
          </View>

          {/* Search input — always visible, auto-focused */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Type a breed name..."
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searching && (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 4 }} />
            )}
            {query.length > 0 && !searching && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Result count */}
          {query.length > 0 && !searching && (
            <Text style={styles.resultCount}>
              {results.length > 0 ? `${results.length} breeds found` : 'No breeds found'}
            </Text>
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* Empty state */}
      {query.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>Search Dog Breeds</Text>
          <Text style={styles.emptySubtext}>
            Type a breed name above to find{'\n'}photos, traits, and more
          </Text>
          <View style={styles.suggestionsRow}>
            {['Labrador', 'Poodle', 'Husky', 'Bulldog'].map(s => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => setQuery(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results list */}
      {query.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={renderBreed}
          ListEmptyComponent={
            !searching ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>😕</Text>
                <Text style={styles.noResultsText}>No breeds match "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: 10 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    marginBottom: 14,
  },
  screenTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },

  // Search box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 16 },
  clearBtn: { padding: 4 },
  clearText: { color: COLORS.textMuted, fontSize: 16 },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: { fontSize: 64, marginBottom: 4 },
  emptyTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, justifyContent: 'center' },
  suggestionChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  // Result cards
  list: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultImage: { width: 100, height: 110 },
  resultImagePlaceholder: { backgroundColor: COLORS.cardAlt, justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  resultName: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  groupBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  groupBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  resultTemp: { color: COLORS.textMuted, fontSize: 11, lineHeight: 16 },
  resultLife: { color: COLORS.textMuted, fontSize: 11 },
  resultActions: { justifyContent: 'center', paddingRight: 12, gap: 8 },
  favBtn: { padding: 6 },
  favIcon: { fontSize: 18 },
  photosBtn: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
  },
  photosBtnText: { fontSize: 16 },

  // No results
  noResults: { alignItems: 'center', paddingTop: 60, gap: 10 },
  noResultsIcon: { fontSize: 48 },
  noResultsText: { color: COLORS.textMuted, fontSize: 15 },
});

export default SearchScreen;
