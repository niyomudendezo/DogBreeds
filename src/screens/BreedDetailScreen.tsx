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
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBreedImages } from '../api/dogApi';
import { DogImage } from '../types';
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const { width, height } = Dimensions.get('window');

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value || 'N/A'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BreedDetailScreen = ({ route, navigation }: any) => {
  const { breed } = route.params;
  const [images, setImages] = useState<DogImage[]>([]);
  const { toggleFavorite, isFavorite } = useFavorites();
  const scrollY = useRef(new Animated.Value(0)).current;
  const favorite = isFavorite(breed.id);

  const imageUrl = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;

  useEffect(() => {
    fetchBreedImages(breed.id, 12).then(setImages);
  }, [breed.id]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [300, 80],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const traits = breed.temperament?.split(', ').slice(0, 6) || [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[styles.heroImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', COLORS.background]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(breed)}>
            <Text style={styles.favIcon}>{favorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.breedName}>{breed.name}</Text>
            {breed.breed_group ? (
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{breed.breed_group}</Text>
              </View>
            ) : null}
          </View>

          {breed.origin ? <Text style={styles.origin}>📍 {breed.origin}</Text> : null}

          <View style={styles.statsRow}>
            <StatBox label="Life Span" value={breed.life_span || ''} />
            <StatBox label="Weight (kg)" value={breed.weight?.metric || ''} />
            <StatBox label="Height (cm)" value={breed.height?.metric || ''} />
          </View>

          {breed.bred_for ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Bred For</Text>
              <Text style={styles.sectionText}>{breed.bred_for}</Text>
            </View>
          ) : null}

          {traits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Temperament</Text>
              <View style={styles.traitsWrap}>
                {traits.map((t: string) => (
                  <View key={t} style={styles.traitChip}>
                    <Text style={styles.traitText}>{t.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {images.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📸 Photos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ImageGallery', { breedId: breed.id, breedName: breed.name })}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={images}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.url }} style={styles.thumbImage} resizeMode="cover" />
                )}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  heroContainer: { width, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  favBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favIcon: { fontSize: 18 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
  breedName: { color: COLORS.text, fontSize: 30, fontWeight: '800', flex: 1 },
  groupBadge: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  groupBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  origin: { color: COLORS.textMuted, fontSize: 14, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.primary, fontWeight: '800', fontSize: 14, textAlign: 'center' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  sectionText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22 },
  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  traitsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitChip: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  traitText: { color: COLORS.secondary, fontSize: 13, fontWeight: '500' },
  thumbImage: { width: 130, height: 130, borderRadius: 16 },
});

export default BreedDetailScreen;
