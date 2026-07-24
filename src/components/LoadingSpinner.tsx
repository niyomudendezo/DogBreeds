import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

const APP_NAME = 'Dog Breeds';

const LoadingSpinner = () => {
  const [label, setLabel] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let character = 0;

    const typewriter = setInterval(() => {
      character += 1;
      setLabel(APP_NAME.slice(0, character));

      if (character === APP_NAME.length) {
        clearInterval(typewriter);
      }
    }, 110);

    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    cursorAnimation.start();

    return () => {
      clearInterval(typewriter);
      cursorAnimation.stop();
    };
  }, [cursorOpacity]);

  return (
    <View style={styles.container}>
      <Text style={styles.paw}>🐾</Text>
      <View style={styles.wordRow}>
        <Text style={styles.word}>{label}</Text>
        <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  paw: {
    fontSize: 36,
    marginBottom: 10,
  },
  wordRow: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cursor: {
    width: 3,
    height: 29,
    marginLeft: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default LoadingSpinner;
