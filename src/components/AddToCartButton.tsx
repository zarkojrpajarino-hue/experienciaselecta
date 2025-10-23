import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  onClick: () => void;
  price: number;
  className?: string;
}

const AddToCartButton = ({ onClick, price, className = "" }: AddToCartButtonProps) => {
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ perspective: '800px' }}
    >
      <button
        onClick={onClick}
        className="relative bg-transparent text-white font-bold text-base transition-all duration-300 border-0 rounded-xl px-4 py-2 flex items-center gap-2 hover:scale-105 whitespace-nowrap"
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
        <ShoppingCart className="w-4 h-4" />
        <span>
          añadir - <span style={{ color: '#FFD700' }} className="text-xl font-bold">{price}€</span>
        </span>
      </button>
    </div>
  );
};

export default AddToCartButton;
