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
import { COLORS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';
import BreedCard from '../components/BreedCard';

const FavoritesScreen = ({ navigation }: any) => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Favorites</Text>
        <Text style={styles.count}>{favorites.length} breeds</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyText}>No favorites yet!</Text>
          <Text style={styles.emptySubtext}>Tap the heart on any breed to save it here.</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  count: { color: COLORS.textMuted, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 64 },
  emptyText: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});

export default FavoritesScreen;
