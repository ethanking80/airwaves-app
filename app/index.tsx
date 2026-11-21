import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/api';

const { width, height } = Dimensions.get('window');

export default function AgeGate() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('age_verified').then((val) => {
      if (val === 'true') router.replace('/(tabs)');
      else setChecking(false);
    });
  }, []);

  function confirm() {
    AsyncStorage.setItem('age_verified', 'true');
    router.replace('/(tabs)');
  }

  function deny() {
    // Can't proceed — just show a message
  }

  if (checking) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <Image
        source={{ uri: 'https://airwaves-5.netlify.app/images/logo.jpg' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.brand}>(((  AIRWAVES  )))</Text>
      <Text style={styles.tagline}>Premium Hemp Products</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Age Verification Required</Text>
        <Text style={styles.body}>
          You must be 21 or older to enter this site. By entering, you confirm you meet
          the age requirement in your jurisdiction.
        </Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={confirm}>
          <Text style={styles.btnPrimaryText}>I'm 21 or Older — Enter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={deny}>
          <Text style={styles.btnSecondaryText}>Under 21 — Exit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        NYC Metro Area · Open Daily 10AM – 10PM
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    top: height * 0.1,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent,
    opacity: 0.08,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  brand: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 40,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  heading: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  btnPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
