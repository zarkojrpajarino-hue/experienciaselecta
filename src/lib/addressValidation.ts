import { supabase } from "@/integrations/supabase/client";

// Validación básica de formato
export const validateSpanishPostalCode = (postalCode: string): boolean => {
  // Código postal español: 5 dígitos, primera cifra 01-52
  const regex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  return regex.test(postalCode);
};

export const validateAddress = (address: {
  address: string;
  city: string;
  postalCode: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar dirección no vacía y con longitud mínima
  if (!address.address || address.address.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  // Validar que la dirección contenga número
  if (!/\d/.test(address.address)) {
    errors.push('La dirección debe incluir un número de portal');
  }

  // Validar ciudad
  if (!address.city || address.city.trim().length < 2) {
    errors.push('La ciudad debe tener al menos 2 caracteres');
  }

  // Validar código postal español
  if (!validateSpanishPostalCode(address.postalCode)) {
    errors.push('Código postal inválido (debe ser 5 dígitos entre 01000-52999)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validación avanzada con Google Maps (Nivel 2)
export const validateAddressWithGoogle = async (address: {
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}): Promise<{
  valid: boolean;
  normalized?: any;
  confidence?: 'high' | 'medium' | 'low';
  error?: string;
}> => {
  try {
    const fullAddress = `${address.address}, ${address.postalCode} ${address.city}, ${address.country || 'España'}`;

    // Llamar a la Edge Function que verificará con Google
    const { data, error } = await supabase.functions.invoke('validate-address', {
      body: { address: fullAddress }
    });

    if (error) {
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error validating address:', error);
    return {
      valid: false,
      error: 'No se pudo verificar la dirección'
    };
  }
};
