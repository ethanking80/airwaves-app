import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  product_id: number;
  variant_id: number | null;
  name: string;
  variant_label: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (product_id: number, variant_id: number | null) => void;
  updateQty: (product_id: number, variant_id: number | null, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('cart').then((s) => {
      if (s) setItems(JSON.parse(s));
    });
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    AsyncStorage.setItem('cart', JSON.stringify(next));
  }

  function addItem(item: CartItem) {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
      );
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.map((i, j) =>
          j === idx ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        next = [...prev, item];
      }
      AsyncStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }

  function removeItem(product_id: number, variant_id: number | null) {
    persist(
      items.filter((i) => !(i.product_id === product_id && i.variant_id === variant_id))
    );
  }

  function updateQty(product_id: number, variant_id: number | null, qty: number) {
    if (qty <= 0) return removeItem(product_id, variant_id);
    persist(
      items.map((i) =>
        i.product_id === product_id && i.variant_id === variant_id
          ? { ...i, quantity: qty }
          : i
      )
    );
  }

  function clearCart() {
    persist([]);
  }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
