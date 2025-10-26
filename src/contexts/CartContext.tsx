import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage with debounce to improve performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [cart]);

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
            // Remove the item completely
            newCart = newCart.filter((_, index) => index !== itemIndex);
          } else {
            // Just reduce the quantity
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
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
