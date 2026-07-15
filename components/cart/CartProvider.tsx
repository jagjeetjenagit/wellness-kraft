"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItemT } from "@/lib/types";

// Cart lives in the browser's localStorage so it survives refreshes
// and works before any account/login exists.

interface CartContextT {
  items: CartItemT[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItemT, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  ready: boolean;
}

const CartContext = createContext<CartContextT | null>(null);

const STORAGE_KEY = "veda-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemT[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupted storage — start fresh
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full/blocked — cart still works for this visit
    }
  }, [items, ready]);

  const addItem: CartContextT["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock || 99) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock || 99) }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock || 99) } : i
          )
    );
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => setItems([]);

  const { count, total } = useMemo(
    () => ({
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, updateQuantity, removeItem, clearCart, ready }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextT {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
