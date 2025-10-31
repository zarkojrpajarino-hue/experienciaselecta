import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExitConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToAuth: () => void;
}

const ExitConfirmDialog: React.FC<ExitConfirmDialogProps> = ({ isOpen, onClose, onContinueToAuth }) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md border-2 border-black">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-xl font-poppins font-bold text-black">
            ¡Espera un momento!
          </DialogTitle>
          <DialogDescription className="text-base text-black font-inter leading-relaxed">
            No podrás acceder a todas nuestras experiencias sin crear tu cuenta antes, da un paso adelante y guía a las personas que quieres.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onContinueToAuth}
            className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-poppins font-bold py-6 text-base"
          >
            Continuar al login
          </Button>
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="w-full border-2 border-black text-black hover:bg-black/5 font-poppins font-semibold py-6 text-base"
          >
            Volver a la página principal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitConfirmDialog;
