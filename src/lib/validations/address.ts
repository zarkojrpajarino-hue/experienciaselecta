import { z } from "zod";

// Validación de código postal español (5 dígitos)
const spanishPostalCodeRegex = /^\d{5}$/;

// Schema de validación para direcciones de envío
export const shippingAddressSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre debe tener menos de 100 caracteres"),
  email: z.string()
    .trim()
    .email("El email no es válido")
    .max(255, "El email debe tener menos de 255 caracteres"),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\+\-\(\)]{9,}$/, "El teléfono debe tener al menos 9 dígitos")
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(255, "La dirección debe tener menos de 255 caracteres"),
  city: z.string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad debe tener menos de 100 caracteres"),
  postalCode: z.string()
    .trim()
    .regex(spanishPostalCodeRegex, "El código postal debe tener 5 dígitos"),
  country: z.string()
    .trim()
    .max(100, "El país debe tener menos de 100 caracteres")
    .default("España")
});

// Schema para validación de regalo (sin teléfono obligatorio)
export const giftShippingAddressSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre debe tener menos de 100 caracteres"),
  email: z.string()
    .trim()
    .email("El email no es válido")
    .max(255, "El email debe tener menos de 255 caracteres"),
  address_line1: z.string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(255, "La dirección debe tener menos de 255 caracteres"),
  address_line2: z.string()
    .trim()
    .max(255, "La dirección debe tener menos de 255 caracteres")
    .optional()
    .or(z.literal('')),
  city: z.string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad debe tener menos de 100 caracteres"),
  postal_code: z.string()
    .trim()
    .regex(spanishPostalCodeRegex, "El código postal debe tener 5 dígitos"),
  country: z.string()
    .trim()
    .max(100, "El país debe tener menos de 100 caracteres")
    .default("España")
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type GiftShippingAddress = z.infer<typeof giftShippingAddressSchema>;
