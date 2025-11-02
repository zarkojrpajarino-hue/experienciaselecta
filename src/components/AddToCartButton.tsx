import { ShoppingCart, ArrowRight } from "lucide-react";

interface AddToCartButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  price: number;
  className?: string;
}

const AddToCartButton = ({ onClick, price, className = "" }: AddToCartButtonProps) => {
  return (
    <div 
      className={`relative inline-block`}
      style={{ perspective: '800px' }}
    >
      <button
        onClick={(e) => onClick(e)}
        className="relative bg-primary text-primary-foreground font-rubik font-bold text-xs sm:text-sm md:text-base transition-all duration-300 border-0 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 hover:bg-primary/90 whitespace-nowrap shadow-md"
        style={{ 
          transformStyle: 'preserve-3d',
          cursor: 'pointer'
        }}
        onMouseMove={(e) => {
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const width = rect.width;
          const height = rect.height;
          
          const rotateY = ((x / width) - 0.5) * 30;
          const rotateX = ((y / height) - 0.5) * -30;
          
          btn.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          btn.style.textShadow = `${rotateY / 10}px ${-rotateX / 10}px 10px rgba(255, 215, 0, 0.5)`;
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
          btn.style.textShadow = 'none';
        }}
      >
        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="hidden sm:inline">Añadir al carrito</span>
          <span className="sm:hidden">Añadir</span>
          <span style={{ color: '#FFD700' }} className="text-sm sm:text-lg md:text-xl font-bold">{price}€</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </span>
      </button>
    </div>
  );
};

export default AddToCartButton;
