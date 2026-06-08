'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartAction, CartItem, CartState, Produto } from '@/types';

// ─── Reducer ──────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find(i => i.id === action.item.id);
      if (exists) {
        return {
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id:         action.item.id,
            nome:       action.item.nome,
            preco:      action.item.preco,
            imagem_url: action.item.imagem_url,
            qty:        1,
          },
        ],
      };
    }
    case 'DEC': {
      return {
        items: state.items
          .map(i => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
          .filter(i => i.qty > 0),
      };
    }
    case 'REMOVE': {
      return { items: state.items.filter(i => i.id !== action.id) };
    }
    case 'CLEAR': {
      return { items: [] };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────

interface CartContextValue {
  items:      CartItem[];
  totalItens: number;
  subtotal:   number;
  dispatch:   (action: CartAction) => void;
  addItem:    (item: Produto) => void;
  decItem:    (id: string) => void;
  removeItem: (id: string) => void;
  clear:      () => void;
  getQty:     (id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'pinus-bar:cart';

// ─── Provider ─────────────────────────────────────────────

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initial => {
    // Hydrate from localStorage (only in browser)
    if (typeof window === 'undefined') return initial;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartState) : initial;
    } catch {
      return initial;
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalItens = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = state.items.reduce((s, i) => s + i.preco * i.qty, 0);

  const addItem    = useCallback((item: Produto) => dispatch({ type: 'ADD', item }), []);
  const decItem    = useCallback((id: string)    => dispatch({ type: 'DEC', id }),    []);
  const removeItem = useCallback((id: string)    => dispatch({ type: 'REMOVE', id }), []);
  const clear      = useCallback(()               => dispatch({ type: 'CLEAR' }),      []);
  const getQty     = useCallback((id: string)    => state.items.find(i => i.id === id)?.qty ?? 0, [state.items]);

  return (
    <CartContext.Provider value={{ items: state.items, totalItens, subtotal, dispatch, addItem, decItem, removeItem, clear, getQty }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useCarrinho() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de <CarrinhoProvider>');
  return ctx;
}
