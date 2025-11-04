-- Crear tabla de catálogo compartida entre ambas plataformas
CREATE TABLE IF NOT EXISTS public.basket_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  current_price INTEGER NOT NULL CHECK (current_price > 0),
  image_url TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_basket_catalog_name ON public.basket_catalog(name);
CREATE INDEX idx_basket_catalog_category ON public.basket_catalog(category);
CREATE INDEX idx_basket_catalog_active ON public.basket_catalog(is_active);

-- RLS: Esta tabla es de solo lectura para usuarios públicos
ALTER TABLE public.basket_catalog ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer el catálogo (público)
CREATE POLICY "Anyone can view active catalog items"
ON public.basket_catalog
FOR SELECT
USING (is_active = true);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_basket_catalog_updated_at
BEFORE UPDATE ON public.basket_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.basket_catalog IS 'Catálogo compartido de cestas entre experienciaselecta.com y paragenteselecta.com';
COMMENT ON COLUMN public.basket_catalog.name IS 'Nombre único de la cesta';
COMMENT ON COLUMN public.basket_catalog.current_price IS 'Precio actual en céntimos (ej: 4500 = 45€)';
COMMENT ON COLUMN public.basket_catalog.image_url IS 'URL de la imagen de la cesta';
COMMENT ON COLUMN public.basket_catalog.is_active IS 'Si la cesta está disponible actualmente';
COMMENT ON COLUMN public.basket_catalog.display_order IS 'Orden de visualización (menor = primero)';