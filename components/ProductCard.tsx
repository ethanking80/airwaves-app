import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { COLORS } from '../constants/api';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

type Props = {
  product: {
    id: number;
    name: string;
    brand: string;
    category: string;
    min_price: number;
    max_price?: number;
    image_url: string | null;
    strain_type?: string;
    effects?: string[];
  };
};

const CATEGORY_COLORS: Record<string, string> = {
  Flower: '#22c55e',
  Cartridges: '#06b6d4',
  'Pre-Rolls': '#f59e0b',
  Edibles: '#ec4899',
  Tinctures: '#8b5cf6',
  Concentrates: '#f97316',
  Topicals: '#14b8a6',
  Accessories: '#6b7280',
};

export default function ProductCard({ product }: Props) {
  const catColor = CATEGORY_COLORS[product.category] ?? COLORS.accentLight;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>🌿</Text>
          </View>
        )}
        <View style={[styles.catBadge, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
          <Text style={[styles.catText, { color: catColor }]}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.strain_type && (
          <Text style={styles.strain}>{product.strain_type}</Text>
        )}
        <Text style={styles.price}>
          ${product.min_price.toFixed(2)}
          {product.max_price && product.max_price !== product.min_price
            ? ` – $${product.max_price.toFixed(2)}`
            : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 3,
  },
  strain: {
    color: COLORS.accentLight,
    fontSize: 11,
    marginBottom: 4,
  },
  price: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '700',
  },
});
