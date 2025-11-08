import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Home } from 'lucide-react';

const EmptyCartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground/30" />
          <h1 className="text-3xl font-bold text-foreground">
            Vaya, parece que has eliminado todas tus cestas...
          </h1>
          <p className="text-muted-foreground text-lg">
            Tu carrito está vacío. Explora nuestro catálogo para encontrar las mejores cestas gourmet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="gap-2 bg-black hover:bg-black/90 text-white"
          >
            <Home className="w-5 h-5" />
            Ir a la página principal
          </Button>
          <Button
            onClick={() => navigate('/#catalogo')}
            variant="outline"
            size="lg"
            className="gap-2 border-2 border-black hover:bg-black/5"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver catálogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCartPage;
