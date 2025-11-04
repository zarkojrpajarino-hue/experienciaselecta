import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopping-cart';

// Get cart storage key for current user
const getCartStorageKey = (userId: string | null) => {
  return userId ? `${CART_STORAGE_KEY}-${userId}` : CART_STORAGE_KEY;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  
  // Initialize cart from localStorage
  const [cart, setCart] = React.useState<CartItem[]>([]);

  // Load user session and cart on mount
  React.useEffect(() => {
    const loadUserCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      setCurrentUserId(userId);
      
      // Load cart for this user
      try {
        const storageKey = getCartStorageKey(userId);
        const savedCart = localStorage.getItem(storageKey);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
    };
    
    loadUserCart();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      
      // If user logged in (from anonymous to authenticated)
      if (newUserId && !currentUserId) {
        setCurrentUserId(newUserId);
        
        // Only merge anonymous cart when checkout was intentionally started
        // This prevents leaking carts between different accounts on the same device
        try {
          const userStorageKey = getCartStorageKey(newUserId);
          const savedUserCart = localStorage.getItem(userStorageKey);
          const userCart: CartItem[] = savedUserCart ? JSON.parse(savedUserCart) : [];

          const anonKey = getCartStorageKey(null);
          const anonCartString = localStorage.getItem(anonKey);
          const anonCart: CartItem[] = anonCartString ? JSON.parse(anonCartString) : [];

          const shouldMerge = localStorage.getItem('pendingCheckout') === 'true';

          if (shouldMerge && anonCart.length > 0) {
            // Merge carts: add anonymous items to user cart, combining quantities
            const mergedCart = [...userCart];
            anonCart.forEach(anonItem => {
              const existingIndex = mergedCart.findIndex(
                item => item.id === anonItem.id && item.isGift === anonItem.isGift
              );
              if (existingIndex >= 0) {
                mergedCart[existingIndex].quantity += anonItem.quantity;
              } else {
                mergedCart.push(anonItem);
              }
            });

            setCart(mergedCart);
            localStorage.setItem(userStorageKey, JSON.stringify(mergedCart));
          } else {
            // Do NOT merge anonymous cart; use only the user's saved cart
            setCart(userCart);
          }

          // Always clear anonymous cart on successful login to avoid cross-account leakage
          localStorage.removeItem(anonKey);
        } catch (error) {
          console.error('Error handling cart on login:', error);
        }
      }
      // If user changed (switching accounts)
      else if (newUserId && currentUserId && newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
        try {
          const storageKey = getCartStorageKey(newUserId);
          const savedCart = localStorage.getItem(storageKey);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        } catch (error) {
          console.error('Error loading cart for new user:', error);
          setCart([]);
        }
      }
      
      // Clear cart on logout
      if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        setCart([]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [currentUserId]);

  // Save cart to localStorage with debounce to improve performance
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getCartStorageKey(currentUserId);
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [cart, currentUserId]);

  const addToCart = React.useCallback((item: Omit<CartItem, 'quantity'>) => {
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

  const removeFromCart = React.useCallback((id: number, isGift?: boolean) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.isGift === isGift)));
  }, []);

  const updateQuantity = React.useCallback((id: number, quantity: number, isGift?: boolean) => {
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

  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  const removeMultipleItems = React.useCallback((itemsToRemove: Array<{ id: number; isGift?: boolean; quantityToRemove?: number }>) => {
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

  const getTotalItems = React.useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalAmount = React.useCallback(() => {
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
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
