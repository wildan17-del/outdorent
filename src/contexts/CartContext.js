'use client';

import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const idx = state.items.findIndex((i) => i.id === action.item.id);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + (action.item.qty || 1) };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: action.item.qty || 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'SET_TANGGAL':
      return { ...state, tanggalSewa: action.tanggalSewa, tanggalKembali: action.tanggalKembali, lamaSewa: action.lamaSewa };
    default:
      return state;
  }
}

const initialState = { items: [], tanggalSewa: null, tanggalKembali: null, lamaSewa: 1 };

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const setTanggal = (tanggalSewa, tanggalKembali, lamaSewa) =>
    dispatch({ type: 'SET_TANGGAL', tanggalSewa, tanggalKembali, lamaSewa });

  const totalItems = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const totalHarga = cart.items.reduce((sum, i) => sum + i.harga_sewa_per_hari * i.qty * (cart.lamaSewa || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, setTanggal, totalItems, totalHarga }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus di dalam CartProvider');
  return ctx;
}
