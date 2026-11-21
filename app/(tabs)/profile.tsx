import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/api';

type MenuItemProps = {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  badge?: string;
};

function MenuItem({ icon, label, onPress, color, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color={color ?? COLORS.accentLight} />
      <Text style={[styles.menuLabel, color ? { color } : {}]}>{label}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  }

  if (!user) {
    return (
      <View style={styles.guest}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.textMuted} />
        <Text style={styles.guestTitle}>Not signed in</Text>
        <Text style={styles.guestBody}>Sign in to track orders, save preferences, and get exclusive deals</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role !== 'customer' && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="receipt-outline" label="My Orders" onPress={() => router.push('/(tabs)/orders')} />
          <MenuItem icon="heart-outline" label="Saved Products" onPress={() => {}} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="chatbubble-outline" label="Live Chat Support" onPress={() => {}} />
          <MenuItem icon="mail-outline" label="Contact Us" onPress={() => {}} badge="orders@airwaves.shop" />
          <MenuItem icon="information-circle-outline" label="About Airwaves" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
            color={COLORS.red}
          />
        </View>
      </View>

      <Text style={styles.version}>AIRWAVES v1.0.0 · NYC Metro Area</Text>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  guest: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  guestBody: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  signInBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 12 },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  registerBtn: { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  registerBtnText: { color: COLORS.textSecondary, fontSize: 15 },
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  name: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  roleBadge: { backgroundColor: COLORS.accent + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent + '50' },
  roleText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuLabel: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },
  badge: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: COLORS.textMuted, fontSize: 11 },
  version: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', letterSpacing: 1 },
});
