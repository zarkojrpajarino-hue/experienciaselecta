import * as React from 'react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  quantity: number;
  imagen: string;
  isGift?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number, isGift?: boolean) => void;
  updateQuantity: (id: number, quantity: number, isGift?: boolean) => void;
  clearCart: () => void;
  removeMultipleItems: (itemsToRemove: Array<{ id: number; isGift?: boolean; quantityToRemove?: number }>) => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopping-cart';

// Get cart storage key for current user
const getCartStorageKey = (userId: string | null) => {
  return userId ? `${CART_STORAGE_KEY}-${userId}` : CART_STORAGE_KEY;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  // Load cart when user changes
  useEffect(() => {
    const userId = user?.id || null;
    
    // User logged in (from anonymous to authenticated)
    if (userId && !prevUserId) {
      try {
        const userStorageKey = getCartStorageKey(userId);
        const anonKey = getCartStorageKey(null);
        
        // PRIMERO: Intentar cargar desde el carrito temporal (guardado antes de OAuth)
        const tempCartString = localStorage.getItem('temp-cart-before-oauth');
        // SEGUNDO: Carrito anónimo actual
        const anonCartString = localStorage.getItem(anonKey);
        
        // Usar el temporal si existe, sino el anónimo
        const cartToUse = tempCartString || anonCartString;
        const anonCart: CartItem[] = cartToUse ? JSON.parse(cartToUse) : [];

        console.log('User logged in. Temp cart:', tempCartString ? 'EXISTS' : 'NONE');
        console.log('User logged in. Anonymous cart:', anonCartString ? 'EXISTS' : 'NONE');
        console.log('Cart to use:', anonCart);
        
        // SIEMPRE preserve el carrito de la sesión pre-login
        if (anonCart.length > 0) {
          console.log('✅ Preserving cart from current session:', anonCart);
          setCart(anonCart);
          localStorage.setItem(userStorageKey, JSON.stringify(anonCart));
        } else {
          // Si NO hay carrito de la sesión actual, cargar el carrito guardado del usuario
          const savedUserCart = localStorage.getItem(userStorageKey);
          const userCart: CartItem[] = savedUserCart ? JSON.parse(savedUserCart) : [];
          console.log('No cart from current session, loading saved user cart:', userCart);
          setCart(userCart);
        }
        
        // Limpiar TODOS los carritos temporales y anónimos
        localStorage.removeItem(anonKey);
        localStorage.removeItem('temp-cart-before-oauth');
        localStorage.removeItem('pendingCheckout');
        console.log('🧹 Cleaned up anonymous and temp carts');
      } catch (error) {
        console.error('Error handling cart on login:', error);
      }
      setPrevUserId(userId);
    }
    // User changed (switching accounts)
    else if (userId && prevUserId && userId !== prevUserId) {
      try {
        const storageKey = getCartStorageKey(userId);
        const savedCart = localStorage.getItem(storageKey);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error('Error loading cart for new user:', error);
        setCart([]);
      }
      setPrevUserId(userId);
    }
    // User logged out
    else if (!userId && prevUserId) {
      setCart([]);
      setPrevUserId(null);
    }
    // Initial load for authenticated or anonymous user
    else if (prevUserId === null) {
      try {
        const storageKey = getCartStorageKey(userId);
        const savedCart = localStorage.getItem(storageKey);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
      setPrevUserId(userId);
    }
  }, [user?.id]);

  // Save cart to localStorage with debounce to improve performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getCartStorageKey(user?.id || null);
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [cart, user?.id]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      // Buscar item con mismo id y mismo tipo (regalo o personal)
      const existingItem = prevCart.find(
        cartItem => cartItem.id === item.id && cartItem.isGift === item.isGift
      );
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.isGift === item.isGift
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number, isGift?: boolean) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.isGift === isGift)));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number, isGift?: boolean) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => !(item.id === id && item.isGift === isGift)));
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.isGift === isGift ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const removeMultipleItems = useCallback((itemsToRemove: Array<{ id: number; isGift?: boolean; quantityToRemove?: number }>) => {
    setCart(prevCart => {
      let newCart = [...prevCart];
      
      itemsToRemove.forEach(removeItem => {
        const itemIndex = newCart.findIndex(item => 
          item.id === removeItem.id && item.isGift === removeItem.isGift
        );
        
        if (itemIndex !== -1) {
          const item = newCart[itemIndex];
          const quantityToRemove = removeItem.quantityToRemove || item.quantity;
          
          if (item.quantity <= quantityToRemove) {
            // Remove the item completamente
            newCart = newCart.filter((_, index) => index !== itemIndex);
          } else {
            // Solo reducir la cantidad
            newCart[itemIndex] = { ...item, quantity: item.quantity - quantityToRemove };
          }
        }
      });
      
      return newCart;
    });
  }, []);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalAmount = useCallback(() => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        removeMultipleItems,
        getTotalItems,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
