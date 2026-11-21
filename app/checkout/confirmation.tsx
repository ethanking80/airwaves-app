import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/api';

export default function ConfirmationScreen() {
  const { orderId, payment, total, walletAddress } = useLocalSearchParams<{
    orderId: string;
    payment: string;
    total: string;
    walletAddress: string;
  }>();

  const isCrypto = payment === 'btc' || payment === 'xmr';
  const paymentLabel = payment === 'btc' ? 'Bitcoin' : payment === 'xmr' ? 'Monero' : 'Cash';
  const paymentColor = payment === 'btc' ? COLORS.btc : payment === 'xmr' ? COLORS.xmr : COLORS.cash;

  function copyAddress() {
    Clipboard.setString(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success header */}
      <View style={styles.successHeader}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.orderId}>Order #{orderId?.slice(0, 8).toUpperCase()}</Text>
      </View>

      {/* Cash instructions */}
      {!isCrypto && (
        <View style={styles.card}>
          <Ionicons name="cash-outline" size={28} color={COLORS.cash} />
          <Text style={styles.cardTitle}>Cash on Delivery</Text>
          <Text style={styles.cardBody}>
            Have ${total} ready at delivery. We'll send confirmation details to your email.
          </Text>
        </View>
      )}

      {/* Crypto payment */}
      {isCrypto && walletAddress && (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: paymentColor }]}>Send {paymentLabel} Payment</Text>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={[styles.amount, { color: paymentColor }]}>${total}</Text>

          <View style={styles.qrWrap}>
            <QRCode
              value={walletAddress}
              size={180}
              backgroundColor="transparent"
              color={COLORS.textPrimary}
            />
          </View>

          <Text style={styles.walletLabel}>Wallet Address</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAddr} numberOfLines={1} ellipsizeMode="middle">
              {walletAddress}
            </Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={16} color={COLORS.accentLight} />
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Payment will be verified and your order confirmed automatically. Keep this page or save the wallet address.
          </Text>
        </View>
      )}

      {/* What's next */}
      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>What's Next</Text>
        <View style={styles.nextItem}>
          <Ionicons name="mail-outline" size={18} color={COLORS.accentLight} />
          <Text style={styles.nextText}>Confirmation sent to your email</Text>
        </View>
        <View style={styles.nextItem}>
          <Ionicons name="time-outline" size={18} color={COLORS.accentLight} />
          <Text style={styles.nextText}>NYC delivery: same day if ordered before 8PM</Text>
        </View>
        <View style={styles.nextItem}>
          <Ionicons name="call-outline" size={18} color={COLORS.accentLight} />
          <Text style={styles.nextText}>We'll contact you to arrange delivery</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.continueBtnText}>Continue Shopping</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20 },
  successHeader: { alignItems: 'center', paddingVertical: 32 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  orderId: { color: COLORS.textMuted, fontSize: 13, letterSpacing: 1 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginVertical: 8 },
  cardBody: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  amountLabel: { color: COLORS.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  amount: { fontSize: 32, fontWeight: '800', marginBottom: 20 },
  qrWrap: { backgroundColor: COLORS.surfaceAlt, padding: 16, borderRadius: 12, marginBottom: 16 },
  walletLabel: { color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  walletRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, width: '100%', gap: 8 },
  walletAddr: { flex: 1, color: COLORS.textSecondary, fontSize: 12, fontFamily: 'monospace' },
  copyBtn: { padding: 4 },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 17 },
  nextCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  nextTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  nextItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  nextText: { color: COLORS.textSecondary, fontSize: 14 },
  continueBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
