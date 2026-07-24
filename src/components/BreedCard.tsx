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
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const imageUrl = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.gradient}
          />
          <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{breed.name}</Text>
            {breed.breed_group ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{breed.breed_group}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { width: CARD_WIDTH, marginBottom: 16 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: { width: '100%', height: 180 },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteIcon: { fontSize: 16 },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  name: { color: COLORS.text, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});

export default BreedCard;
