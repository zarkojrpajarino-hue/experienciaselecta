import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const CheckoutAuthListener = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      console.log('✅ Usuario detectado en Checkout:', user.email);
      // No hacer nada más - React ya actualizó todo
    }
  }, [user, isLoading]);

  return null;
};

export default CheckoutAuthListener;
