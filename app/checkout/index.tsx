import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE, COLORS } from '../../constants/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

type DeliveryMethod = 'nyc' | 'ship';
type PaymentMethod = 'btc' | 'xmr' | 'cash';
type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';

const BOROUGHS: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function CheckoutScreen() {
  const { items, total, clearCart } = useCart();
  const { user, token } = useAuth();

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [delivery, setDelivery] = useState<DeliveryMethod>('nyc');
  const [borough, setBorough] = useState<Borough | null>(null);
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('btc');
  const [loading, setLoading] = useState(false);

  const shipping = delivery === 'ship' ? 5.99 : 0;
  const orderTotal = total + shipping;

  async function placeOrder() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please enter your name and email.');
      return;
    }
    if (delivery === 'nyc' && !borough) {
      Alert.alert('Select borough', 'Please select your NYC borough.');
      return;
    }
    if (delivery === 'ship' && !address.trim()) {
      Alert.alert('Missing address', 'Please enter a shipping address.');
      return;
    }

    setLoading(true);
    try {
      const sessionId = await AsyncStorage.getItem('session_id') ??
        (() => {
          const id = `session_${Date.now()}`;
          AsyncStorage.setItem('session_id', id);
          return id;
        })();

      const payload = {
        customer_name: fullName,
        customer_email: email,
        delivery_method: delivery,
        borough: borough ?? undefined,
        shipping_address: delivery === 'ship' ? address : undefined,
        payment_method: payment,
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          price: i.price,
        })),
        session_id: sessionId,
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/orders?action=create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Order failed');

      clearCart();
      router.replace({
        pathname: '/checkout/confirmation',
        params: {
          orderId: data.order.id,
          payment,
          total: orderTotal.toFixed(2),
          walletAddress: data.wallet_address ?? '',
        },
      });
    } catch (err: any) {
      Alert.alert('Order failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Contact */}
      <Text style={styles.section}>Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={COLORS.textMuted}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Delivery */}
      <Text style={styles.section}>Delivery Method</Text>
      <TouchableOpacity
        style={[styles.option, delivery === 'nyc' && styles.optionActive]}
        onPress={() => setDelivery('nyc')}
      >
        <View style={styles.optionInner}>
          <Ionicons name="bicycle-outline" size={20} color={delivery === 'nyc' ? COLORS.accentLight : COLORS.textSecondary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.optionTitle, delivery === 'nyc' && styles.optionTitleActive]}>NYC Delivery</Text>
            <Text style={styles.optionSub}>Free to all 5 boroughs</Text>
          </View>
          <Text style={styles.optionPrice}>FREE</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, delivery === 'ship' && styles.optionActive]}
        onPress={() => setDelivery('ship')}
      >
        <View style={styles.optionInner}>
          <Ionicons name="cube-outline" size={20} color={delivery === 'ship' ? COLORS.accentLight : COLORS.textSecondary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.optionTitle, delivery === 'ship' && styles.optionTitleActive]}>Ship Anywhere</Text>
            <Text style={styles.optionSub}>Standard shipping</Text>
          </View>
          <Text style={styles.optionPrice}>$5.99</Text>
        </View>
      </TouchableOpacity>

      {delivery === 'nyc' && (
        <>
          <Text style={styles.label}>Select Borough</Text>
          <View style={styles.boroughGrid}>
            {BOROUGHS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.boroughBtn, borough === b && styles.boroughBtnActive]}
                onPress={() => setBorough(b)}
              >
                <Text style={[styles.boroughText, borough === b && styles.boroughTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Delivery Address"
            placeholderTextColor={COLORS.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </>
      )}

      {delivery === 'ship' && (
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Shipping Address"
          placeholderTextColor={COLORS.textMuted}
          value={address}
          onChangeText={setAddress}
          multiline
        />
      )}

      {/* Payment */}
      <Text style={styles.section}>Payment Method</Text>
      {([
        { key: 'btc', label: 'Bitcoin', sub: 'BTC payment', color: COLORS.btc, icon: '₿' },
        { key: 'xmr', label: 'Monero', sub: 'XMR payment', color: COLORS.xmr, icon: 'ɱ' },
        { key: 'cash', label: 'Cash', sub: 'Pay on delivery', color: COLORS.cash, icon: '$' },
      ] as const).map((m) => (
        <TouchableOpacity
          key={m.key}
          style={[styles.option, payment === m.key && styles.optionActive]}
          onPress={() => setPayment(m.key)}
        >
          <View style={styles.optionInner}>
            <View style={[styles.payIcon, { backgroundColor: m.color + '20' }]}>
              <Text style={{ color: m.color, fontSize: 16, fontWeight: '700' }}>{m.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.optionTitle, payment === m.key && styles.optionTitleActive]}>{m.label}</Text>
              <Text style={styles.optionSub}>{m.sub}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${orderTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeBtnText}>Place Order</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  section: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.textPrimary, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  option: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 10, padding: 14 },
  optionActive: { borderColor: COLORS.accent },
  optionInner: { flexDirection: 'row', alignItems: 'center' },
  optionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  optionTitleActive: { color: COLORS.accentLight },
  optionSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  optionPrice: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  payIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  boroughGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  boroughBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  boroughBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  boroughText: { color: COLORS.textSecondary, fontSize: 13 },
  boroughTextActive: { color: COLORS.accentLight, fontWeight: '600' },
  summary: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 14 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 14 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  totalValue: { color: COLORS.green, fontSize: 20, fontWeight: '800' },
  placeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  placeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
