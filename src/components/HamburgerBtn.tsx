import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useDrawer } from './SideDrawer';
import { COLORS } from '../constants';

const HamburgerBtn = () => {
  const { openDrawer } = useDrawer();
  return (
    <TouchableOpacity onPress={openDrawer} style={styles.btn} activeOpacity={0.75}>
      <View style={styles.line} />
      <View style={[styles.line, styles.lineShort]} />
      <View style={styles.line} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  line: { width: 20, height: 2, backgroundColor: '#fff', borderRadius: 2 },
  lineShort: { width: 14, alignSelf: 'flex-start', marginLeft: 3 },
});

export default HamburgerBtn;
