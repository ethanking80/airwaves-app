import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { API_BASE, COLORS } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
  item_count: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#06b6d4',
  processing: '#8b5cf6',
  'out for delivery': '#f97316',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export default function OrdersScreen() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders() {
    try {
      const sessionId = await AsyncStorage.getItem('session_id') ?? '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = token
        ? `${API_BASE}/orders?action=list`
        : `${API_BASE}/orders?action=list&session_id=${sessionId}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadOrders(); }, [user, token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyBody}>Your order history will appear here</Text>
        {!user && (
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInText}>Sign in to see all orders</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!user && (
        <TouchableOpacity style={styles.signInBanner} onPress={() => router.push('/auth/login')}>
          <Ionicons name="person-circle-outline" size={18} color={COLORS.accentLight} />
          <Text style={styles.bannerText}>Sign in to see your full order history</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.accentLight} />
        </TouchableOpacity>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status.toLowerCase()] ?? COLORS.textMuted;
          const date = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{item.item_count} item{item.item_count !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.payMethod}>
                    {item.payment_method === 'btc' ? '₿' : item.payment_method === 'xmr' ? 'ɱ' : '$'}
                  </Text>
                  <Text style={styles.metaText}>{item.payment_method.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyBody: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  signInBtn: { backgroundColor: COLORS.accent + '20', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.accent + '50' },
  signInText: { color: COLORS.accentLight, fontWeight: '600', fontSize: 14 },
  signInBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent + '15', borderBottomWidth: 1, borderBottomColor: COLORS.accent + '30', paddingHorizontal: 16, paddingVertical: 12 },
  bannerText: { flex: 1, color: COLORS.accentLight, fontSize: 13 },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardBody: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textSecondary, fontSize: 12 },
  payMethod: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, alignItems: 'flex-end' },
  total: { color: COLORS.green, fontSize: 18, fontWeight: '800' },
});
