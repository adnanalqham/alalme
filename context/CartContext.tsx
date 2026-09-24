import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem } from '../types';
import { cartService } from '../api';

const CART_EVENT = 'ala:cart';

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, quantity?: number, branchId?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  itemOf: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => cartService.get());
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setItems(cartService.get());
    setTick(t => t + 1);
    try { window.dispatchEvent(new Event(CART_EVENT)); } catch { /* noop */ }
  }, []);

  // Re-sync when another tab/session changes the cart.
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    window.addEventListener(CART_EVENT, handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(CART_EVENT, handler);
    };
  }, [refresh]);

  const add = (productId: string, quantity = 1, branchId?: string) => {
    cartService.add(productId, quantity, branchId);
    refresh();
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    cartService.updateQuantity(itemId, quantity);
    refresh();
  };

  const remove = (itemId: string) => {
    cartService.remove(itemId);
    refresh();
  };

  const clear = () => {
    cartService.clear();
    refresh();
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);

  const value: CartContextType = {
    items,
    count,
    subtotal,
    add,
    updateQuantity,
    remove,
    clear,
    itemOf: (productId: string) => items.find(i => i.productId === productId),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};