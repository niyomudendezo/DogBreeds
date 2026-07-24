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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBreedImages } from '../api/dogApi';
import { DogImage } from '../types';
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 340;

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
    <View style={styles.slideshowContainer}>
      <Animated.Image
        source={{ uri: allUrls[current] }}
        style={[styles.heroImage, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,7,15,0.6)', COLORS.background]}
        locations={[0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.slideshowTopBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onFavorite}>
          <Text style={styles.iconBtnText}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {allUrls.length > 1 && (
        <View style={styles.slideDots}>
          {allUrls.slice(0, 8).map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.slideDot, i === current && styles.slideDotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ── Stat Box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value || 'N/A'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const BreedDetailScreen = ({ route, navigation }: any) => {
  const { breed } = route.params;
  const [images, setImages] = useState<DogImage[]>([]);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(breed.id);
  const mainUrl = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;
  const traits = breed.temperament?.split(', ').slice(0, 8) || [];

  useEffect(() => { fetchBreedImages(breed.id, 10).then(setImages); }, [breed.id]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />
      {/* Outer vertical scroll */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <DetailSlideshow
          images={images}
          mainUrl={mainUrl}
          onBack={() => navigation.goBack()}
          onFavorite={() => toggleFavorite(breed)}
          isFav={favorite}
        />

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.breedName}>{breed.name}</Text>
              {breed.origin ? <Text style={styles.origin}>📍 {breed.origin}</Text> : null}
            </View>
            {breed.breed_group ? (
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={styles.groupBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.groupBadgeText}>{breed.breed_group}</Text>
              </LinearGradient>
            ) : null}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox icon="⏳" label="Life Span" value={breed.life_span || ''} />
            <StatBox icon="⚖️" label="Weight (kg)" value={breed.weight?.metric || ''} />
            <StatBox icon="📏" label="Height (cm)" value={breed.height?.metric || ''} />
          </View>

          {/* Bred For */}
          {breed.bred_for ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>🎯 Bred For</Text>
              <Text style={styles.infoCardText}>{breed.bred_for}</Text>
            </View>
          ) : null}

          {/* Temperament */}
          {traits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Temperament</Text>
              <View style={styles.traitsWrap}>
                {traits.map((t: string, i: number) => (
                  <LinearGradient
                    key={t}
                    colors={i % 2 === 0 ? ['#1E1E32', '#1E1E32'] : ['rgba(255,107,53,0.15)', 'rgba(233,69,96,0.15)']}
                    style={styles.traitChip}
                  >
                    <Text style={styles.traitText}>{t.trim()}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
          )}

          {/* Photo grid — 2 per row, vertical */}
          {images.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📸 Photos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ImageGallery', { breedId: breed.id, breedName: breed.name })}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.photoGrid}>
                {images.map(item => (
                  <Image
                    key={item.id}
                    source={{ uri: item.url }}
                    style={styles.thumbImage}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 50 },

  // Slideshow
  slideshowContainer: { width, height: HERO_HEIGHT, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  slideshowTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  slideDots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  slideDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  slideDotActive: { width: 20, backgroundColor: COLORS.primary },

  // Content
  content: { padding: 20, paddingTop: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  breedName: { color: COLORS.text, fontSize: 32, fontWeight: '900', lineHeight: 36 },
  origin: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  groupBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6 },
  groupBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { color: COLORS.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 3, textAlign: 'center' },

  // Info card
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  infoCardText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22 },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  seeAll: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  // Traits
  traitsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  traitText: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },

  // Photo grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbImage: {
    width: (width - 56) / 2,
    height: (width - 56) / 2,
    borderRadius: 16,
  },
});

export default BreedDetailScreen;
