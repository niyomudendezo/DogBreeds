import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { Breed } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  breed: Breed;
  onPress: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  index: number;
}

const BreedCard: React.FC<Props> = ({ breed, onPress, onFavorite, isFavorite, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay: (index % 10) * 70, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay: (index % 10) * 70, useNativeDriver: true }),
    ]).start();
  }, []);

  const imageUrl = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.92)']}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite} activeOpacity={0.8}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Bottom info */}
        <View style={styles.info}>
          {breed.breed_group ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{breed.breed_group}</Text>
            </View>
          ) : null}
          <Text style={styles.name} numberOfLines={1}>{breed.name}</Text>
          {breed.life_span ? (
            <Text style={styles.lifespan}>⏳ {breed.life_span}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { width: CARD_WIDTH, marginBottom: 16 },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    height: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 18,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: { fontSize: 15 },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  badge: {
    backgroundColor: 'rgba(255,107,53,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  name: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 3 },
  lifespan: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
});

export default BreedCard;
