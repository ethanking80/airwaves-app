import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE, COLORS } from '../../constants/api';
import { useCart } from '../../contexts/CartContext';

const { width } = Dimensions.get('window');

type Variant = { id: number; label: string; price: number; stock_quantity: number };
type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  image_url: string | null;
  strain_type?: string;
  thc_content?: string;
  cbd_content?: string;
  terpenes?: string[];
  effects?: string[];
  flavor_notes?: string[];
  lineage?: string;
  use_cases?: string[];
  lab_tested: boolean;
  variants: Variant[];
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/products?action=get&id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product);
        if (d.product?.variants?.length) setSelectedVariant(d.product.variants[0]);
        setLoading(false);
      });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      name: product.name,
      variant_label: selectedVariant?.label ?? null,
      price: selectedVariant?.price ?? 0,
      quantity: 1,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textSecondary }}>Product not found</Text>
      </View>
    );
  }

  const price = selectedVariant?.price ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 60 }}>🌿</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.meta}>
            {product.strain_type && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{product.strain_type}</Text>
              </View>
            )}
            {product.lab_tested && (
              <View style={[styles.tag, styles.tagGreen]}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
                <Text style={[styles.tagText, { color: COLORS.green, marginLeft: 4 }]}>Lab Tested</Text>
              </View>
            )}
          </View>

          {/* THC/CBD */}
          {(product.thc_content || product.cbd_content) && (
            <View style={styles.potencyRow}>
              {product.thc_content && (
                <View style={styles.potencyBox}>
                  <Text style={styles.potencyLabel}>THC</Text>
                  <Text style={styles.potencyValue}>{product.thc_content}</Text>
                </View>
              )}
              {product.cbd_content && (
                <View style={styles.potencyBox}>
                  <Text style={styles.potencyLabel}>CBD</Text>
                  <Text style={styles.potencyValue}>{product.cbd_content}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* Effects */}
          {product.effects?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Effects</Text>
              <View style={styles.pills}>
                {product.effects.map((e) => (
                  <View key={e} style={styles.pill}>
                    <Text style={styles.pillText}>{e}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Flavors */}
          {product.flavor_notes?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Flavor Notes</Text>
              <View style={styles.pills}>
                {product.flavor_notes.map((f) => (
                  <View key={f} style={[styles.pill, styles.pillFlavor]}>
                    <Text style={[styles.pillText, { color: COLORS.accentLight }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Terpenes */}
          {product.terpenes?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terpenes</Text>
              <View style={styles.pills}>
                {product.terpenes.map((t) => (
                  <View key={t} style={[styles.pill, styles.pillTerpene]}>
                    <Text style={[styles.pillText, { color: '#f59e0b' }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Lineage */}
          {product.lineage ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lineage</Text>
              <Text style={styles.lineage}>{product.lineage}</Text>
            </View>
          ) : null}

          {/* Variants */}
          {product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size / Weight</Text>
              <View style={styles.variants}>
                {product.variants.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantBtn,
                      selectedVariant?.id === v.id && styles.variantBtnActive,
                      v.stock_quantity === 0 && styles.variantBtnOOS,
                    ]}
                    onPress={() => v.stock_quantity > 0 && setSelectedVariant(v)}
                    disabled={v.stock_quantity === 0}
                  >
                    <Text
                      style={[
                        styles.variantLabel,
                        selectedVariant?.id === v.id && styles.variantLabelActive,
                      ]}
                    >
                      {v.label}
                    </Text>
                    <Text
                      style={[
                        styles.variantPrice,
                        selectedVariant?.id === v.id && styles.variantLabelActive,
                      ]}
                    >
                      ${v.price.toFixed(2)}
                    </Text>
                    {v.stock_quantity === 0 && (
                      <Text style={styles.oosLabel}>Out of Stock</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Total</Text>
          <Text style={styles.ctaPrice}>${price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnDone]}
          onPress={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
        >
          <Ionicons
            name={added ? 'checkmark-circle' : 'bag-add-outline'}
            size={20}
            color="#fff"
          />
          <Text style={styles.addBtnText}>{added ? 'Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  hero: { width, height: width * 0.75 },
  heroPlaceholder: { backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20 },
  brand: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.surfaceAlt, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  tagGreen: { borderColor: COLORS.green + '55' },
  tagText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  potencyRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  potencyBox: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: COLORS.border },
  potencyLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  potencyValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  description: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.green + '15', borderRadius: 20, borderWidth: 1, borderColor: COLORS.green + '40' },
  pillFlavor: { backgroundColor: COLORS.accent + '15', borderColor: COLORS.accent + '40' },
  pillTerpene: { backgroundColor: '#f59e0b15', borderColor: '#f59e0b40' },
  pillText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  lineage: { color: COLORS.textSecondary, fontSize: 14 },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  variantBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, minWidth: 90, alignItems: 'center' },
  variantBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  variantBtnOOS: { opacity: 0.4 },
  variantLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  variantLabelActive: { color: COLORS.accentLight },
  variantPrice: { color: COLORS.green, fontSize: 12, fontWeight: '700', marginTop: 2 },
  oosLabel: { color: COLORS.red, fontSize: 10, marginTop: 2 },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 28 },
  ctaLabel: { color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  ctaPrice: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  addBtnDone: { backgroundColor: COLORS.green },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
