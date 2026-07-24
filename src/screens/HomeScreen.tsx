import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBreeds, fetchRandomImages } from '../api/dogApi';
import { Breed, DogImage } from '../types';
import { COLORS } from '../constants';
import BreedCard from '../components/BreedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../hooks/useFavorites';
import HamburgerBtn from '../components/HamburgerBtn';

const { width, height } = Dimensions.get('window');
const SLIDE_HEIGHT = height * 0.48;
const GROUPS = ['All', 'Herding', 'Hound', 'Non-Sporting', 'Sporting', 'Terrier', 'Toy', 'Working'];

// ── Auto-playing Hero Slideshow ──────────────────────────────────────────────
const HeroSlideshow = ({ onExplore }: { onExplore: () => void }) => {
  const [slides, setSlides] = useState<DogImage[]>([]);
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchRandomImages(8).then(setSlides); }, []);

  const goTo = useCallback((next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setCurrent(next);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => { const next = (prev + 1) % slides.length; goTo(next); return prev; });
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides, goTo]);

  if (slides.length === 0) {
    return (
      <View style={[styles.slideContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const slide = slides[current];

  return (
    <View style={styles.slideContainer}>
      <Animated.Image
        source={{ uri: slide.url }}
        style={[styles.slideImage, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(7,7,15,0.15)', 'rgba(7,7,15,0.5)', COLORS.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.slideTopBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>🐾 DogBreeds</Text>
          <View style={styles.logoRight}>
            <HamburgerBtn />
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.slideBottom}>
        {slide.breeds && slide.breeds.length > 0 && (
          <View style={styles.slideBreedBadge}>
            <Text style={styles.slideBreedText}>{slide.breeds[0].name}</Text>
          </View>
        )}
        <Text style={styles.heroTitle}>Discover{'\n'}Amazing Dogs</Text>
        <Text style={styles.heroSub}>Explore 200+ breeds with photos, traits & more</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={onExplore} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.exploreBtnGradient}
          >
            <Text style={styles.exploreBtnText}>Explore Breeds →</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.dot, i === current && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// ── Featured Breed Row ───────────────────────────────────────────────────────
const FeaturedRow = ({ breeds, navigation }: { breeds: Breed[]; navigation: any }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  if (breeds.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⭐ Featured Breeds</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
          <Text style={styles.seeAll}>See Gallery →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
        {breeds.slice(0, 8).map(breed => {
          const uri = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;
          return (
            <TouchableOpacity
              key={breed.id}
              style={styles.featuredCard}
              onPress={() => navigation.navigate('BreedDetail', { breed })}
              activeOpacity={0.88}
            >
              <Image source={{ uri }} style={styles.featuredImage} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.featuredGradient} />
              <TouchableOpacity style={styles.featuredHeart} onPress={() => toggleFavorite(breed)}>
                <Text style={{ fontSize: 14 }}>{isFavorite(breed.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={1}>{breed.name}</Text>
                {breed.breed_group ? <Text style={styles.featuredGroup}>{breed.breed_group}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: any) => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [filtered, setFiltered] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loadingMore, setLoadingMore] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const listRef = useRef<any>(null);

  useEffect(() => { loadBreeds(); }, []);

  useEffect(() => {
    applyGroupFilter(breeds, selectedGroup);
  }, [selectedGroup, breeds]);

  const loadBreeds = async (nextPage = 0) => {
    try {
      const data = await fetchBreeds(nextPage, 20);
      if (nextPage === 0) { setBreeds(data); setFiltered(data); }
      else setBreeds(prev => [...prev, ...data]);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  const applyGroupFilter = (list: Breed[], group: string) =>
    group === 'All' ? setFiltered(list) : setFiltered(list.filter(b => b.breed_group === group));

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    loadBreeds(next);
  };

  const scrollToGrid = () =>
    setTimeout(() => listRef.current?.scrollToOffset({ offset: SLIDE_HEIGHT, animated: true }), 100);

  if (loading) return <LoadingSpinner />;

  const ListHeader = (
    <View>
      <HeroSlideshow onExplore={scrollToGrid} />
      <FeaturedRow breeds={breeds} navigation={navigation} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐕 All Breeds</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupList}>
          {GROUPS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.groupChip, selectedGroup === g && styles.groupChipActive]}
              onPress={() => setSelectedGroup(g)}
            >
              <Text style={[styles.groupText, selectedGroup === g && styles.groupTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.resultCount}>{filtered.length} breeds found</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <BreedCard
            breed={item}
            index={index}
            isFavorite={isFavorite(item.id)}
            onFavorite={() => toggleFavorite(item)}
            onPress={() => navigation.navigate('BreedDetail', { breed: item })}
          />
        )}
        ListFooterComponent={loadingMore ? (
          <View style={{ padding: 20, alignItems: 'center' }}><LoadingSpinner /></View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  slideContainer: { width, height: SLIDE_HEIGHT, overflow: 'hidden' },
  slideImage: { width: '100%', height: '100%', position: 'absolute' },
  slideTopBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  logoRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slideBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 28 },
  slideBreedBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,107,53,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,107,53,0.6)', marginBottom: 10 },
  slideBreedText: { color: COLORS.secondary, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '900', lineHeight: 42, marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  exploreBtn: { alignSelf: 'flex-start', borderRadius: 30, overflow: 'hidden', marginBottom: 20 },
  exploreBtnGradient: { paddingHorizontal: 28, paddingVertical: 14 },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 22, backgroundColor: COLORS.primary },
  section: { paddingHorizontal: 16, marginBottom: 8, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  featuredList: { paddingRight: 16, gap: 12 },
  featuredCard: { width: 150, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.card },
  featuredImage: { width: '100%', height: '100%', position: 'absolute' },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 },
  featuredHeart: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 5 },
  featuredInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  featuredName: { color: '#fff', fontWeight: '800', fontSize: 13 },
  featuredGroup: { color: COLORS.secondary, fontSize: 11, marginTop: 2 },
  groupList: { paddingBottom: 12, gap: 8 },
  groupChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  groupChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  groupText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  groupTextActive: { color: '#fff' },
  resultCount: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
});

export default HomeScreen;
