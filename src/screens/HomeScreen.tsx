import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBreeds, searchBreeds } from '../api/dogApi';
import { Breed } from '../types';
import { COLORS } from '../constants';
import BreedCard from '../components/BreedCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../hooks/useFavorites';

const GROUPS = ['All', 'Herding', 'Hound', 'Non-Sporting', 'Sporting', 'Terrier', 'Toy', 'Working'];

const HomeScreen = ({ navigation }: any) => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [filtered, setFiltered] = useState<Breed[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loadingMore, setLoadingMore] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBreeds();
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      searchBreeds(query).then(results => setFiltered(results));
    } else {
      applyGroupFilter(breeds, selectedGroup);
    }
  }, [query, selectedGroup, breeds]);

  const loadBreeds = async (nextPage = 0) => {
    try {
      const data = await fetchBreeds(nextPage, 20);
      if (nextPage === 0) {
        setBreeds(data);
        setFiltered(data);
      } else {
        setBreeds(prev => [...prev, ...data]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyGroupFilter = (list: Breed[], group: string) => {
    if (group === 'All') return setFiltered(list);
    setFiltered(list.filter(b => b.breed_group === group));
  };

  const loadMore = () => {
    if (loadingMore || query.trim()) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    loadBreeds(next);
  };

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.95], extrapolate: 'clamp' });

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.headerGradient}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>🐾 DogBreeds</Text>
              <Text style={styles.subtitle}>{filtered.length} breeds found</Text>
            </View>
            <TouchableOpacity
              style={styles.randomBtn}
              onPress={() => navigation.navigate('Gallery')}
            >
              <Text style={styles.randomBtnText}>🎲 Random</Text>
            </TouchableOpacity>
          </View>
          <SearchBar value={query} onChangeText={setQuery} />
          <FlatList
            horizontal
            data={GROUPS}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.groupChip, selectedGroup === item && styles.groupChipActive]}
                onPress={() => setSelectedGroup(item)}
              >
                <Text style={[styles.groupText, selectedGroup === item && styles.groupTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </LinearGradient>
      </Animated.View>

      <Animated.FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
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
        ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { zIndex: 10 },
  headerGradient: { paddingTop: 16, paddingBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greeting: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  randomBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  randomBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  groupList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  groupChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  groupText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  groupTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
});

export default HomeScreen;
