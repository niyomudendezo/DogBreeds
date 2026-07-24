import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';
import BreedCard from '../components/BreedCard';

const FavoritesScreen = ({ navigation }: any) => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>❤️ Favorites</Text>
              <Text style={styles.subtitle}>{favorites.length} saved breeds</Text>
            </View>
            {favorites.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{favorites.length}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>No favorites yet!</Text>
          <Text style={styles.emptySubtext}>Tap the 🤍 on any breed card to save it here.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.browseBtnGradient}
            >
              <Text style={styles.browseBtnText}>Browse Breeds →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <BreedCard
              breed={item}
              index={index}
              isFavorite={isFavorite(item.id)}
              onFavorite={() => toggleFavorite(item)}
              onPress={() => navigation.navigate('BreedDetail', { breed: item })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  countText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 72 },
  emptyTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  browseBtn: { borderRadius: 30, overflow: 'hidden', marginTop: 8 },
  browseBtnGradient: { paddingHorizontal: 30, paddingVertical: 14 },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default FavoritesScreen;
