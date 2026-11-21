import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { COLORS } from '../../constants/api';

export default function CartScreen() {
  const { items, total, removeItem, updateQty, clearCart } = useCart();

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyBody}>Add some products to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.shopBtnText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.product_id}-${item.variant_id}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <Text style={styles.clearText}>Clear Cart</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text>🌿</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              {item.variant_label && (
                <Text style={styles.variant}>{item.variant_label}</Text>
              )}
              <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.product_id, item.variant_id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.product_id, item.variant_id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeItem(item.product_id, item.variant_id)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Checkout bar */}
      <View style={styles.bar}>
        <View>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.total}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  empty: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyBody: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, paddingBottom: 16 },
  item: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  variant: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  price: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  qty: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.red + '20', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  clearBtn: { alignItems: 'center', paddingVertical: 12 },
  clearText: { color: COLORS.red, fontSize: 14 },
  bar: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 28 },
  totalLabel: { color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  total: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
