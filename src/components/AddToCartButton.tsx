import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  onClick: () => void;
  price: number;
  className?: string;
}

const AddToCartButton = ({ onClick, price, className = "" }: AddToCartButtonProps) => {
  return (
    <div 
      className={`relative w-[220px] h-[50px] ${className}`}
      style={{ perspective: '800px' }}
    >
      {/* Hover areas grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 z-[200] pointer-events-auto">
        <div className="hover-bt-1 cursor-pointer" />
        <div className="hover-bt-2 cursor-pointer" />
        <div className="hover-bt-3 cursor-pointer" />
        <div className="hover-bt-4 cursor-pointer" />
        <div className="hover-bt-5 cursor-pointer" />
        <div className="hover-bt-6 cursor-pointer" />
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="absolute w-full h-full bg-transparent text-white font-bold text-base transition-all duration-300 border-0 rounded-xl overflow-visible hover-button pointer-events-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center gap-2 z-[2] pointer-events-none">
          <ShoppingCart className="w-4 h-4" />
          <span className="whitespace-nowrap">
            añadir - <span className="text-gold text-xl font-bold">{price}€</span>
          </span>
        </div>
      </button>

      <style>{`
        .hover-bt-1:hover ~ .hover-button {
          transform: rotateX(15deg) rotateY(-15deg) rotateZ(0deg);
          text-shadow: -2px -2px rgba(255, 215, 0, 0.5);
        }

        .hover-bt-3:hover ~ .hover-button {
          transform: rotateX(15deg) rotateY(15deg) rotateZ(0deg);
          text-shadow: 2px -2px rgba(255, 215, 0, 0.5);
        }

        .hover-bt-4:hover ~ .hover-button {
          transform: rotateX(-15deg) rotateY(-15deg) rotateZ(0deg);
          text-shadow: -2px 2px rgba(255, 215, 0, 0.5);
        }

        .hover-bt-6:hover ~ .hover-button {
          transform: rotateX(-15deg) rotateY(15deg) rotateZ(0deg);
          text-shadow: 2px 2px rgba(255, 215, 0, 0.5);
        }

        .hover-button:active {
          transform: scale(0.95) !important;
        }
      `}</style>
    </div>
  );
};

export default AddToCartButton;
