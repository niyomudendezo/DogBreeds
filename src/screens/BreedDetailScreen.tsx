import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBreedImages } from '../api/dogApi';
import { DogImage } from '../types';
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 320;
const PHOTO_SIZE = (width - 52) / 2;

// ── Image Slideshow ──────────────────────────────────────────────────────────
const DetailSlideshow = ({ images, mainUrl, onBack, onFavorite, isFav }: {
  images: DogImage[];
  mainUrl: string;
  onBack: () => void;
  onFavorite: () => void;
  isFav: boolean;
}) => {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allUrls = images.length > 0 ? images.map(i => i.url) : [mainUrl];

  const goTo = (next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setCurrent(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (allUrls.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => { const next = (prev + 1) % allUrls.length; goTo(next); return prev; });
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [allUrls.length]);

  return (
    <View style={ss.hero}>
      <Animated.Image
        source={{ uri: allUrls[current] }}
        style={[ss.heroImg, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,7,15,0.6)', COLORS.background]}
        locations={[0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={ss.topBar}>
        <TouchableOpacity style={ss.iconBtn} onPress={onBack}>
          <Text style={ss.iconBtnTxt}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ss.iconBtn} onPress={onFavorite}>
          <Text style={ss.iconBtnTxt}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {allUrls.length > 1 && (
        <View style={ss.dots}>
          {allUrls.slice(0, 8).map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[ss.dot, i === current && ss.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const StatBox = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <View style={ss.statBox}>
    <Text style={ss.statIcon}>{icon}</Text>
    <Text style={ss.statVal}>{value || 'N/A'}</Text>
    <Text style={ss.statLbl}>{label}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const BreedDetailScreen = ({ route, navigation }: any) => {
  const { breed } = route.params;
  const [images, setImages] = useState<DogImage[]>([]);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(breed.id);
  const mainUrl = breed.image?.url ||
    `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;
  const traits = breed.temperament?.split(', ').slice(0, 8) || [];

  useEffect(() => { fetchBreedImages(breed.id, 10).then(setImages); }, [breed.id]);

  return (
    <View style={ss.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={[ss.scrollView, Platform.OS === 'web' && ss.webScrollView]}
        contentContainerStyle={ss.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        removeClippedSubviews={false}
        scrollEventThrottle={16}
      >
        {/* Hero slideshow */}
        <DetailSlideshow
          images={images}
          mainUrl={mainUrl}
          onBack={() => navigation.goBack()}
          onFavorite={() => toggleFavorite(breed)}
          isFav={favorite}
        />

        {/* Body */}
        <View style={ss.body}>

          {/* Title row */}
          <View style={ss.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={ss.name}>{breed.name}</Text>
              {breed.origin ? <Text style={ss.origin}>📍 {breed.origin}</Text> : null}
            </View>
            {breed.breed_group ? (
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={ss.groupBadge}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={ss.groupBadgeTxt}>{breed.breed_group}</Text>
              </LinearGradient>
            ) : null}
          </View>

          {/* Stats */}
          <View style={ss.statsRow}>
            <StatBox icon="⏳" label="Life Span"   value={breed.life_span || ''} />
            <StatBox icon="⚖️" label="Weight (kg)" value={breed.weight?.metric || ''} />
            <StatBox icon="📏" label="Height (cm)" value={breed.height?.metric || ''} />
          </View>

          {/* Bred for */}
          {breed.bred_for ? (
            <View style={ss.card}>
              <Text style={ss.cardTitle}>🎯 Bred For</Text>
              <Text style={ss.cardText}>{breed.bred_for}</Text>
            </View>
          ) : null}

          {/* Temperament */}
          {traits.length > 0 && (
            <View style={ss.section}>
              <Text style={ss.sectionTitle}>✨ Temperament</Text>
              <View style={ss.chips}>
                {traits.map((t: string, i: number) => (
                  <LinearGradient
                    key={t}
                    colors={i % 2 === 0
                      ? ['#1E1E32', '#1E1E32']
                      : ['rgba(255,107,53,0.15)', 'rgba(233,69,96,0.15)']}
                    style={ss.chip}
                  >
                    <Text style={ss.chipTxt}>{t.trim()}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
          )}

          {/* Photos — 2 per row vertical grid */}
          {images.length > 0 && (
            <View style={ss.section}>
              <View style={ss.sectionRow}>
                <Text style={ss.sectionTitle}>📸 Photos</Text>
                <TouchableOpacity onPress={() =>
                  navigation.navigate('ImageGallery', { breedId: breed.id, breedName: breed.name })
                }>
                  <Text style={ss.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <View style={ss.photoGrid}>
                {images.map(item => (
                  <Image
                    key={item.id}
                    source={{ uri: item.url }}
                    style={ss.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  // Keep the viewport bounded to the screen so overflowing content can scroll.
  scrollView: { flex: 1 },
  webScrollView: {
    height: '100vh',
    maxHeight: '100vh',
    overflowY: 'auto',
  } as any,
  container: {
    flexGrow: 1,
    paddingBottom: 60,
  },

  // Hero
  hero: { width, height: HERO_HEIGHT, overflow: 'hidden' },
  heroImg: { position: 'absolute', width: '100%', height: '100%' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    width: 42, height: 42,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  dots: {
    position: 'absolute', bottom: 16,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 20, backgroundColor: COLORS.primary },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  name: { color: COLORS.text, fontSize: 30, fontWeight: '900', lineHeight: 34 },
  origin: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  groupBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6 },
  groupBadgeTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: 18, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statVal: { color: COLORS.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' },
  statLbl: { color: COLORS.textMuted, fontSize: 10, marginTop: 3, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: COLORS.card, borderRadius: 18,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  cardText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22 },

  // Sections
  section: { marginBottom: 24 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  seeAll: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipTxt: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },

  // Photo grid — 2 columns
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 16 },
});

export default BreedDetailScreen;
