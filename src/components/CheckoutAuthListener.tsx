import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente que escucha cambios de autenticación en el checkout
 * y fuerza una actualización suave cuando se completa el login
 */
export const CheckoutAuthListener = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Solo ejecutar si no estamos cargando
    if (isLoading) return;

    // Verificar si acabamos de completar el auth
    const authCompleted = sessionStorage.getItem('auth_completed');
    
    if (authCompleted && user) {
      console.log('✅ Auth completado detectado en Checkout, actualizando UI...');
      
      // Limpiar el flag
      sessionStorage.removeItem('auth_completed');
      
      // Forzar re-render del componente padre
      // Esto hará que todos los componentes del checkout se actualicen
      // con el nuevo estado de autenticación
      window.dispatchEvent(new Event('auth-state-changed'));
      
      console.log('✅ Checkout actualizado con usuario:', user.email);
    }
  }, [user, isLoading]);

  return null; // Este componente no renderiza nada
};

export default CheckoutAuthListener;
