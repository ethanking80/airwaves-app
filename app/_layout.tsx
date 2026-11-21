import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// @ts-ignore — backgroundColor is valid on expo-status-bar but types lag SDK
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { COLORS } from '../constants/api';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.bg },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: COLORS.bg },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Sign In', presentation: 'modal' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Create Account', presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" options={{ title: '', headerTransparent: true }} />
          <Stack.Screen name="checkout/index" options={{ title: 'Checkout' }} />
          <Stack.Screen name="checkout/confirmation" options={{ title: 'Order Confirmed', headerBackVisible: false }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
