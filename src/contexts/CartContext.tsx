import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
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
  };

  const removeFromCart = (id: number, isGift?: boolean) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.isGift === isGift)));
  };

  const updateQuantity = (id: number, quantity: number, isGift?: boolean) => {
    if (quantity <= 0) {
      removeFromCart(id, isGift);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.isGift === isGift ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
