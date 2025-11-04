import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wine, Coffee, Heart, Crown, Gem, Users, ChevronDown, ChevronUp, ShoppingCart, Sparkles, X, Info } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import CheckoutModal from "./CheckoutModal";
import AddToCartButton from "./AddToCartButton";
import StickyToast from "./StickyToast";

// Import images - Pareja
import parejaInicialImg from "@/assets/pareja-inicial-nueva-clean.jpg";
import conversacionNaturalImg from "@/assets/pareja-natural-nueva-clean.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";

// Import images - Familia/Amigos
import trioIbericoNuevoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
import mesaAbiertaNuevoImg from "@/assets/mesa-abierta-nuevo-clean.jpg";
import ibericosSelectosNuevoImg from "@/assets/ibericos-selectos-nuevo-clean.jpg";
import familiarClasicaNuevoImg from "@/assets/familiar-clasica-nuevo-clean.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica-clean.jpg";
import granTertuliaNuevoImg from "@/assets/gran-tertulia-nuevo-clean.jpg";
import celebracionIbericaNuevoImg from "@/assets/celebracion-iberica-nuevo-clean.jpg";
import festinSelectoNuevoImg from "@/assets/festin-selecto-nuevo-clean.jpg";
import experienciaSelectaImg from "@/assets/experiencia-selecta-nuevo-clean.jpg";

// Import images - Grupos 6-8
import celebracionIbericaImg from "@/assets/celebracion-iberica.png";
import festinSelectoImg from "@/assets/festin-selecto.png";
import granBanqueteImg from "@/assets/gran-banquete.png";
import nochePremiumImg from "@/assets/noche-premium.png";
import edicionAnfitrionImg from "@/assets/edicion-anfitrion.png";
import banqueteIbericoImg from "@/assets/banquete-iberico.png";
import anfitrionSelectoImg from "@/assets/anfitrion-selecto.png";

// Import images - Grupos 5-6
import mesaMediterraneaImg from "@/assets/mesa-mediterranea.jpg";
import familiarClasicaImg from "@/assets/familiar-clasica.jpg";
import seleccionCazaImg from "@/assets/seleccion-caza.jpg";
import granTertuliaImg from "@/assets/gran-tertulia.jpg";
import reservaUrbanaImg from "@/assets/reserva-urbana.jpg";
import dehesaFamiliarImg from "@/assets/dehesa-familiar.jpg";
import montanaMarImg from "@/assets/montana-mar.jpg";
import dehesaFamiliarPlusImg from "@/assets/dehesa-familiar-plus.jpg";
import montanaMar110Img from "@/assets/montana-mar-110.jpg";
import celebracionNaturalImg from "@/assets/celebracion-natural.png";
import nochePremiumSinAlcoholImg from "@/assets/noche-premium-sin-alcohol.png";

// Import images - Desconocidos
import conexionNaturalSinAlcoholImg from "@/assets/conexion-natural-sin-alcohol.png";
import vinculoGourmet2PersonasImg from "@/assets/vinculo-gourmet-2-personas.png";
import conversacionPura3PersonasImg from "@/assets/conversacion-pura-3-personas.png";
import trianguloDorado3PersonasImg from "@/assets/triangulo-dorado-3-personas.png";
import trioArmonico3PersonasImg from "@/assets/trio-armonico-3-personas.png";
import primerEncuentroNuevoImg from "@/assets/primer-encuentro-nuevo.png";
import conexionNaturalNuevoImg from "@/assets/conexion-natural-nuevo.png";
import trioArmonicoNuevoImg from "@/assets/trio-armonico-nuevo.png";
import vinculoGourmetNuevoImg from "@/assets/vinculo-gourmet-nuevo.png";
import conversacionPuraNuevoImg from "@/assets/conversacion-pura-nuevo.png";
import cuartetoSocialNuevoImg from "@/assets/cuarteto-social-nuevo.png";
import trianguloDoradoNuevoImg from "@/assets/triangulo-dorado-nuevo.png";
import circuloDoradoNuevoImg from "@/assets/circulo-dorado-nuevo.png";
import primerEncuentro56Img from "@/assets/primer-encuentro-5-6.png";
import conexionNatural56Img from "@/assets/conexion-natural-5-6.png";
import vinculoGourmet56Img from "@/assets/vinculo-gourmet-5-6.png";
import primerEncuentro68Img from "@/assets/primer-encuentro-6-8-final.png";
import conexionNatural68Img from "@/assets/conexion-natural-6-8-final.png";
import vinculoGourmet68Img from "@/assets/vinculo-gourmet-6-8-final.png";

interface Basket {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | React.ReactNode;
  categoria: string;
  sinAlcohol: boolean;
  productos: string[];
  ideal: string | React.ReactNode;
  maridaje: string | React.ReactNode;
  ocasion?: string | React.ReactNode;
  personas?: string;
  costePersona?: string;
  imagen: string;
  quantity?: number;
}

interface BasketCatalogProps {
  categoria: string;
  onGroupSizeChange?: (size: '3-4' | '5-6' | '7-8') => void;
  initialBasketId?: number;
  isGiftMode?: boolean;
}

const BasketCatalog: React.FC<BasketCatalogProps> = ({ categoria, onGroupSizeChange, initialBasketId, isGiftMode = false }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [openProducts, setOpenProducts] = useState<{ [key: number]: boolean }>({});
  const [openIdeal, setOpenIdeal] = useState<{ [key: number]: boolean }>({});
  const [openMaridaje, setOpenMaridaje] = useState<{ [key: number]: boolean }>({});
  const [openOcasion, setOpenOcasion] = useState<{ [key: number]: boolean }>({});
  const [openInfoDinamica, setOpenInfoDinamica] = useState<{ [key: number]: boolean }>({});
  const [showGroupSize, setShowGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const { cart: globalCart, addToCart: addToGlobalCart, getTotalAmount, getTotalItems, clearCart, removeMultipleItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para el mensaje de cesta añadida (por ID de cesta)
  const [addedBasketId, setAddedBasketId] = useState<number | null>(null);
  
  // Callback optimizado para abrir imagen
  const handleOpenImage = useCallback((imageSrc: string) => {
    setSelectedImage(imageSrc);
    setImageModalOpen(true);
  }, []);
  
  // Callback optimizado para cerrar imagen
  const handleCloseImage = useCallback(() => {
    setSelectedImage(null);
    setImageModalOpen(false);
  }, []);
  
  // Usar el modo regalo pasado como prop
  const isGiftCatalog = isGiftMode;

  // Reset all collapsibles when changing group size
  React.useEffect(() => {
    setOpenCard(null);
    setOpenProducts({});
    setOpenIdeal({});
    setOpenMaridaje({});
    setOpenOcasion({});
  }, [showGroupSize]);

  // Notify parent of initial group size
  React.useEffect(() => {
    onGroupSizeChange?.(showGroupSize);
  }, []);

  // Si llega un id de cesta, ajusta tamaño de grupo y desplaza con reintentos
  React.useEffect(() => {
    if (initialBasketId == null) return;

    // Encuentra la cesta objetivo en el catálogo actual para deducir personas
    const all = getBaskets();
    const target = all.find(b => b.id === initialBasketId);

    if (target && (target.personas === '3-4' || target.personas === '5-6' || target.personas === '7-8')) {
      if (showGroupSize !== target.personas) {
        setShowGroupSize(target.personas as '3-4' | '5-6' | '7-8');
        onGroupSizeChange?.(target.personas as '3-4' | '5-6' | '7-8');
      }
    }

    const tryScroll = (attempt = 0) => {
      const element = document.getElementById(`cesta-${initialBasketId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-accent', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-accent', 'ring-offset-2');
        }, 2000);
      } else if (attempt < 12) {
        setTimeout(() => tryScroll(attempt + 1), 200);
      }
    };

    // Dar tiempo a re-render si cambiamos showGroupSize
    setTimeout(() => tryScroll(0), 350);
  }, [initialBasketId, categoria, showGroupSize]);

  // Handle card toggle and reset collapsibles when closed
  const handleCardToggle = useCallback((cardId: number) => {
    const newOpenCard = openCard === cardId ? null : cardId;
    setOpenCard(newOpenCard);
    
    // Always reset all collapsibles to closed state
    setOpenProducts(prev => ({ ...prev, [cardId]: false }));
    setOpenIdeal(prev => ({ ...prev, [cardId]: false }));
    setOpenMaridaje(prev => ({ ...prev, [cardId]: false }));
    setOpenOcasion(prev => ({ ...prev, [cardId]: false }));

    // Auto-scroll to center the card when opening
    if (newOpenCard !== null) {
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-basket-id="${cardId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }, 100);
    }
  }, [openCard]);

  // Local cart for checkout modal compatibility
  const [cart, setCart] = useState<Basket[]>([]);

  const handleAddToCart = useCallback((basket: Basket, event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🛒 Añadiendo cesta:', basket.nombre, 'ID:', basket.id);
    
    // Add to global cart with isGift flag if from gift catalog
    addToGlobalCart({
      id: basket.id,
      nombre: basket.nombre,
      precio: basket.precio,
      categoria: basket.categoria,
      imagen: basket.imagen,
      isGift: isGiftCatalog
    });
    
    // Also add to local cart for checkout
    const existingItem = cart.find(item => item.id === basket.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === basket.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...basket, quantity: 1 }]);
    }

    // Mostrar mensaje inline
    console.log('✅ Mostrando mensaje para cesta ID:', basket.id);
    setAddedBasketId(basket.id);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      console.log('❌ Ocultando mensaje para cesta ID:', basket.id);
      setAddedBasketId(null);
    }, 3000);

    // Scroll to top of the sheet/container to show cart summary
    const sheetContent = document.querySelector('[role="dialog"]');
    if (sheetContent) {
      sheetContent.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [cart, isGiftCatalog, addToGlobalCart]);

  const getLocalTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.precio * (item.quantity || 1)), 0);
  };

  const basketItems = cart.map(item => ({
    id: item.id,
    name: item.nombre,
    price: item.precio,
    category: item.categoria,
    quantity: item.quantity || 1,
    imagen: item.imagen
  }));

  const getBaskets = (): Basket[] => {
    if (categoria === "Pareja") {
      return [
        {
          id: 1,
          nombre: "Pareja Inicial",
          precio: 30,
          descripcion: "Primera experiencia con sabores ibéricos.",
          categoria: "Accesible",
          sinAlcohol: false,
          productos: [
            "Salchichón de pato 250 gr",
            "Jamón Reserva 100 gr",
            "Paté de morcilla 100 gr",
            "Ricardo del Duero Ricardo Dumas 75 cl",
            "Piquitos 250 gr"
          ],
          ideal: (
            <>
              Parejas que buscan una <span style={{ color: '#D4AF37' }} className="font-bold">primera experiencia gourmet</span> con productos de <span style={{ color: '#D4AF37' }} className="font-bold">calidad excepcional</span>
            </>
          ),
          maridaje: "El Ricardo del Duero realza los sabores del jamón y embutidos.",
          personas: "2",
          costePersona: "15€",
          imagen: parejaInicialImg
        },
        {
          id: 2,
          nombre: "Pareja Natural (sin alcohol)",
          precio: 40,
          descripcion: "Selección refinada para momentos especiales.",
          categoria: "Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Salchichón de pato 250 gr",
            "Jamón Reserva 100 gr",
            "Paté de ciervo 100 gr",
            "Chorizo de gamo 250 gr",
            "Queso de Oveja Diablo 200 gr",
            "Piquitos 250 gr"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Conversaciones profundas</span> con sabores <span style={{ color: '#D4AF37' }} className="font-bold">naturales</span> sin alcohol
            </>
          ),
          maridaje: "Disfruta de sabores puros sin necesidad de maridaje.",
          personas: "2",
          costePersona: "20€",
          imagen: conversacionNaturalImg
        },
        {
          id: 3,
          nombre: "Pareja Gourmet",
          precio: 50,
          descripcion: "Máxima calidad seleccionada.",
          categoria: "Luxury",
          sinAlcohol: false,
          productos: [
            "Vino Tinto Entrechuelos Roble 75 cl",
            "Jamón 100% Ibérico 100 gr",
            "Chorizo de pato 250 gr",
            "Paté de pato 100 gr",
            "Queso de oveja de trufa 200 gr",
            "Piquitos 250 gr"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Ocasiones especiales</span> que merecen <span style={{ color: '#D4AF37' }} className="font-bold">lo mejor</span>, con jamón <span style={{ color: '#D4AF37' }} className="font-bold">ibérico</span>
            </>
          ),
          maridaje: "El Entrechuelos Roble realza el jamón ibérico y queso trufado.",
          personas: "2",
          costePersona: "25€",
          imagen: parejaGourmetImg
        }
      ];
    } else if (categoria === "Familia" || categoria === "Amigos") {
      return [
        {
          id: 9,
          nombre: "Trio ibérico",
          precio: 45,
          descripcion: "Entrada perfecta al mundo ibérico.",
          categoria: "Accesible",
          sinAlcohol: false,
          productos: [
            "Chorizo de pato 250 gr",
            "Jamón Reserva 100 gr",
            "Paté de morcilla 100 gr",
            "Salchichón de jabalí loncheado 80 gr",
            "Piquitos",
            "El Paje Rueda Verdejo 75 cl"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones familiares</span> y encuentros de <span style={{ color: '#D4AF37' }} className="font-bold">amigos cercanos</span>
            </>
          ),
          maridaje: "Rueda verdejo complementa ibéricos.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones</span> casuales • <span style={{ color: '#D4AF37' }} className="font-bold">Aperitivos</span> • Encuentros de <span style={{ color: '#D4AF37' }} className="font-bold">amigos</span>
            </>
          ),
          personas: "3-4",
          costePersona: "15€ (3p) / 11.25€ (4p)",
          imagen: trioIbericoNuevoImg
        },
        {
          id: 10,
          nombre: "Mesa Abierta (sin alcohol)",
          precio: 55,
          descripcion: "Selección variada sin alcohol.",
          categoria: "Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Queso oveja curado trufa negra 200 gr",
            "Jamón Ibérico 50% 100 gr",
            "Piquitos",
            "Paté de pato tarro 100 gr",
            "Salchichón de ciervo 250 gr",
            "Mermelada Arbequina",
            "Chorizo de gamo loncheado 80 gr"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones familiares</span> que prefieren <span style={{ color: '#D4AF37' }} className="font-bold">opciones sin alcohol</span>
            </>
          ),
          maridaje: "Sabores puros sin alcohol.",
          ocasion: (
            <>
              Comidas familiares • <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones</span> saludables • Encuentros naturales
            </>
          ),
          personas: "3-4",
          costePersona: "18.33€ (3p) / 13.75€ (4p)",
          imagen: mesaAbiertaNuevoImg
        },
        {
          id: 11,
          nombre: "Ibéricos Selectos",
          precio: 65,
          descripcion: "Selección premium con queso y vino.",
          categoria: "Premium",
          sinAlcohol: false,
          productos: [
            "Cecina de ciervo al tomillo loncheada 80 gr",
            "Queso oveja curado boletus 200 gr",
            "Jamón ibérico 50% 100 gr",
            "Mermelada arbequina",
            "Paté de jabalí tarro 100 gr",
            "Reina de Castilla Verdejo 75 cl",
            "Salchichón de pato 250 gr"
          ],
          ideal: (
            <>
              Grupos que valoran la <span style={{ color: '#D4AF37' }} className="font-bold">calidad premium</span> y los <span style={{ color: '#D4AF37' }} className="font-bold">sabores selectos</span>
            </>
          ),
          maridaje: "Verdejo realza sabores ibéricos.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Cenas especiales</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Celebraciones</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Eventos premium</span>
            </>
          ),
          personas: "3-4",
          costePersona: "21.67€ (3p) / 16.25€ (4p)",
          imagen: ibericosSelectosNuevoImg
        },
        {
          id: 12,
          nombre: "Familiar Clásica",
          precio: 65,
          descripcion: "Cesta familiar tradicional.",
          categoria: "Tradicional",
          sinAlcohol: false,
          productos: [
            "Jamón 50% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de morcilla 100 gr",
            "Queso de Oveja Boletus 200 gr",
            "Chorizo de gamo 250 gr",
            "Salchichón de pato 250 gr",
            "Vino Entrechuelos Roble 75 cl",
            "Cecina de ciervo loncheada 80 gr"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones familiares</span> que buscan <span style={{ color: '#D4AF37' }} className="font-bold">sabores tradicionales</span>
            </>
          ),
          maridaje: "Vino roble para ibéricos.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Comidas familiares</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Reuniones tradicionales</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Celebraciones clásicas</span>
            </>
          ),
          personas: "5-6",
          costePersona: "13€ (5p) / 10.83€ (6p)",
          imagen: familiarClasicaNuevoImg
        },
        {
          id: 13,
          nombre: "Experiencia Gastronómica (sin alcohol)",
          precio: 70,
          descripcion: "Experiencia premium sin alcohol.",
          categoria: "Premium Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Jamón 50% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de perdiz 100 gr",
            "Queso de Oveja Diablo 200 gr",
            "Chorizo de jabalí 250 gr",
            "Salchichón de ciervo 250 gr",
            "Chorizo de pato 250 gr",
            "Salchichón de gamo 250 gr",
            "Mermelada Arbequina 100 gr"
          ],
          ideal: (
            <>
              Grupos que buscan una <span style={{ color: '#ff1493' }} className="font-bold">experiencia gastronómica</span> sin alcohol
            </>
          ),
          maridaje: "Pureza de sabores premium.",
          ocasion: (
            <>
              <span style={{ color: '#ff1493' }} className="font-bold">Experiencias únicas</span> • <span style={{ color: '#ff1493' }} className="font-bold">Reuniones especiales</span> • <span style={{ color: '#ff1493' }} className="font-bold">Eventos saludables</span>
            </>
          ),
          personas: "5-6",
          costePersona: "14€ (5p) / 11.67€ (6p)",
          imagen: experienciaGastronomicaImg
        },
        {
          id: 14,
          nombre: "Gran Tertulia",
          precio: 80,
          descripcion: "Máxima calidad para tertulias.",
          categoria: "Premium",
          sinAlcohol: false,
          productos: [
            "Jamón 100% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de ciervo 100 gr",
            "Queso de Oveja Ajo Negro 200 gr",
            "Cecina de ciervo loncheada 80 gr",
            "Chorizo de ciervo 250 gr",
            "Salchichón de gamo 250 gr",
            "Salchichón de pato 250 gr",
            "Vino Rioja Tradición Crianza 75 cl",
            "Ribera del Duero Ricardo Dumas 75 cl"
          ],
          ideal: (
            <>
              <span style={{ color: '#ff1493' }} className="font-bold">Tertulias memorables</span> con productos de <span style={{ color: '#ff1493' }} className="font-bold">categoría superior</span>
            </>
          ),
          maridaje: "Rioja Crianza y Ribera del Duero.",
          ocasion: (
            <>
              <span style={{ color: '#ff1493' }} className="font-bold">Tertulias especiales</span> • <span style={{ color: '#ff1493' }} className="font-bold">Celebraciones importantes</span> • <span style={{ color: '#ff1493' }} className="font-bold">Eventos premium</span>
            </>
          ),
          personas: "5-6",
          costePersona: "16€ (5p) / 13.33€ (6p)",
          imagen: granTertuliaNuevoImg
        },
        {
          id: 15,
          nombre: "Celebración Ibérica",
          precio: 85,
          descripcion: "Celebración completa con ibéricos.",
          categoria: "Premium",
          sinAlcohol: false,
          productos: [
            "Jamón 50% Ibérico 100 gr",
            "Jamón 50% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de morcilla 100 gr",
            "Queso de Oveja Ajo Negro 200 gr",
            "Vino Entrechuelos Blanco Chardonnay 75 cl",
            "Vino Entrechuelos Roble 75 cl",
            "Salchichón de ciervo 250 gr",
            "Chorizo de gamo 250 gr",
            "Salchichón de pato loncheado 80 gr",
            "Queso de Oveja Trufa 200 gr"
          ],
          ideal: (
            <>
              <span style={{ color: '#00BFFF' }} className="font-bold">Celebraciones especiales</span> para grupos de <span style={{ color: '#00BFFF' }} className="font-bold">7-8 personas</span>
            </>
          ),
          maridaje: "Chardonnay y roble completan experiencia.",
          ocasion: (
            <>
              <span style={{ color: '#00BFFF' }} className="font-bold">Celebraciones familiares</span> • <span style={{ color: '#00BFFF' }} className="font-bold">Eventos especiales</span> • <span style={{ color: '#00BFFF' }} className="font-bold">Reuniones grandes</span>
            </>
          ),
          personas: "7-8",
          costePersona: "12.14€ (7p) / 10.63€ (8p)",
          imagen: celebracionIbericaNuevoImg
        },
        {
          id: 16,
          nombre: "Festín Selecto (sin alcohol)",
          precio: 90,
          descripcion: "Festín premium sin alcohol.",
          categoria: "Luxury Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Jamón 50% Ibérico 100 gr",
            "Jamón 50% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de jabalí 100 gr",
            "Queso de Oveja Boletus 200 gr",
            "Queso de Oveja Ajo Negro 200 gr",
            "Mermelada Arbequina 100 gr",
            "Cecina de ciervo Loncheada 80 gr",
            "Salchichón de jabalí 250 gr",
            "Salchichón de gamo 250 gr",
            "Chorizo de ciervo 250 gr"
          ],
          ideal: (
            <>
              La <span style={{ color: '#00BFFF' }} className="font-bold">máxima calidad</span> sin alcohol, con <span style={{ color: '#00BFFF' }} className="font-bold">productos premium</span>
            </>
          ),
          maridaje: "Sin alcohol, sabores puros.",
          ocasion: (
            <>
              <span style={{ color: '#00BFFF' }} className="font-bold">Eventos especiales</span> • <span style={{ color: '#00BFFF' }} className="font-bold">Celebraciones grandes</span> • <span style={{ color: '#00BFFF' }} className="font-bold">Reuniones premium</span>
            </>
          ),
          personas: "7-8",
          costePersona: "12.86€ (7p) / 11.25€ (8p)",
          imagen: festinSelectoNuevoImg
        },
        {
          id: 17,
          nombre: "Experiencia Selecta",
          precio: 100,
          descripcion: "La experiencia definitiva con máxima categoría.",
          categoria: "Luxury",
          sinAlcohol: false,
          productos: [
            "Jamón 100% Ibérico 100 gr",
            "Jamón 100% Ibérico 100 gr",
            "Piquitos 250 gr",
            "Paté de perdiz 100 gr",
            "Queso de Oveja de Trufa 200 gr",
            "Queso de Oveja Boletus 200 gr",
            "Ribera del Duero Ricardo Dumas 75 cl",
            "Vino Tinto Rioja Tradición Reserva 75 cl",
            "Chorizo de pato 250 gr",
            "Salchichón de gamo 250 gr",
            "Chorizo de ciervo 250 gr"
          ],
          ideal: (
            <>
              Para quienes buscan <span style={{ color: '#00BFFF' }} className="font-bold">lo mejor de lo mejor</span>, con jamón <span style={{ color: '#00BFFF' }} className="font-bold">100% ibérico</span>
            </>
          ),
          maridaje: "Ribera del Duero y Rioja Reserva.",
          ocasion: (
            <>
              <span style={{ color: '#00BFFF' }} className="font-bold">Ocasiones especiales</span> • Celebraciones únicas • <span style={{ color: '#00BFFF' }} className="font-bold">Experiencias memorables</span>
            </>
          ),
          personas: "7-8",
          costePersona: "14.29€ (7p) / 12.50€ (8p)",
          imagen: experienciaSelectaImg
        }
      ];
    } else if (categoria === "Desconocidos-2") {
      return [
        {
          id: 35,
          nombre: "Conexión Natural (Sin alcohol)",
          precio: 45,
          descripcion: "Conexión natural sin alcohol.",
          categoria: "Natural Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Queso oveja trufa 100g"
          ],
          ideal: (
            <>
              Familias medianas que buscan <span style={{ color: '#D4AF37' }} className="font-bold">conexión natural</span> sin alcohol
            </>
          ),
          maridaje: "Sin alcohol, doble aceite premium.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Encuentros familiares</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Sin alcohol</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Conexión natural</span>
            </>
          ),
          personas: "2",
          costePersona: "22.50€",
          imagen: conexionNaturalSinAlcoholImg
        },
        {
          id: 36,
          nombre: "Vínculo Gourmet",
          precio: 55,
          descripcion: "Vínculos especiales con productos premium.",
          categoria: "Premium",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Queso oveja trufa 100g",
            "Ribera del Duero Ricardo Dumas"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Vínculos especiales</span> de parejas con productos <span style={{ color: '#D4AF37' }} className="font-bold">premium</span>
            </>
          ),
          maridaje: "Doble jamón con ribera del duero.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Vínculos especiales</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Premium</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Doble jamón</span>
            </>
          ),
          personas: "2",
          costePersona: "27.50€",
          imagen: vinculoGourmet2PersonasImg
        },
        {
          id: 43,
          nombre: "Primer Encuentro",
          precio: 40,
          descripcion: "Primera experiencia gourmet accesible.",
          categoria: "Accesible",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Queso oveja trufa 100g"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Primera experiencia gourmet</span> accesible para parejas
            </>
          ),
          maridaje: "Entrada perfecta al mundo gourmet.",
          ocasion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Primeros encuentros</span> • <span style={{ color: '#D4AF37' }} className="font-bold">Experiencia accesible</span>
            </>
          ),
          personas: "2",
          costePersona: "20€",
          imagen: primerEncuentro56Img
        }
      ];
    } else if (categoria === "Desconocidos-3") {
      return [
        {
          id: 37,
          nombre: "Conversación Pura (Sin alcohol)",
          precio: 65,
          descripcion: "Largas conversaciones sin necesidad de alcohol.",
          categoria: "Conversación Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Queso oveja trufa 100g",
            "Mermelada de higo"
          ],
          ideal: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Largas conversaciones</span> sin necesidad de alcohol
            </>
          ),
          maridaje: "Sin alcohol, pureza de conversación.",
          ocasion: "Conversaciones profundas • Sin alcohol • Encuentros naturales",
          personas: "3",
          costePersona: "21.67€",
          imagen: conversacionPura3PersonasImg
        },
        {
          id: 38,
          nombre: "Triángulo Dorado",
          precio: 75,
          descripcion: "Tríadas gourmet con doble mermelada.",
          categoria: "Gourmet",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Queso oveja trufa 100g",
            "Ribera del Duero Ricardo Dumas",
            "Mermelada de higo",
            "Mermelada premium"
          ],
          ideal: "Tríadas gourmet que buscan doble mermelada y variedad.",
          maridaje: "Ribera del duero con doble mermelada.",
          ocasion: "Experiencias gourmet • Doble mermelada • Variedad",
          personas: "3",
          costePersona: "25€",
          imagen: trianguloDorado3PersonasImg
        },
        {
          id: 39,
          nombre: "Trío Armónico",
          precio: 55,
          descripcion: "Reuniones armoniosas con productos esenciales.",
          categoria: "Armonía",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Queso oveja trufa 100g",
            "Ribera del Duero Ricardo Dumas"
          ],
          ideal: "Reuniones armoniosas con productos esenciales de calidad.",
          maridaje: "Equilibrio perfecto de sabores con vino.",
          ocasion: "Reuniones armoniosas • Conversaciones equilibradas",
          personas: "3",
          costePersona: "18.33€",
          imagen: trioArmonico3PersonasImg
        }
      ];
    } else if (categoria === "Desconocidos-4") {
      return [
        {
          id: 40,
          nombre: "Cuarteto Social",
          precio: 55,
          descripcion: "Encuentros sociales con vino de calidad.",
          categoria: "Social",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Queso oveja trufa 100g",
            "Ribera del Duero Ricardo Dumas"
          ],
          ideal: "Encuentros sociales de 4 personas con vino de calidad.",
          maridaje: "Ribera del duero para grupos.",
          ocasion: "Encuentros sociales • 4 personas • Vino de calidad",
          personas: "4",
          costePersona: "13.75€",
          imagen: cuartetoSocialNuevoImg
        },
        {
          id: 41,
          nombre: "Círculo Dorado",
          precio: 75,
          descripcion: "Círculos íntimos con doble vino y lomo ibérico.",
          categoria: "Gourmet",
          sinAlcohol: false,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Lomo Ibérico bellota 100g",
            "Ribera del Duero Ricardo Dumas",
            "Mermelada de higo",
            "Mermelada premium"
          ],
          ideal: "Círculos íntimos que aprecian doble vino y lomo ibérico.",
          maridaje: "Ribera del duero con lomo ibérico.",
          ocasion: "Círculos íntimos • Lomo ibérico • Premium",
          personas: "4",
          costePersona: "18.75€",
          imagen: circuloDoradoNuevoImg
        },
        {
          id: 42,
          nombre: "Mesa Abierta (Sin alcohol)",
          precio: 65,
          descripcion: "Mesa generosa sin alcohol con mermeladas.",
          categoria: "Generosa Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Aceite Picualia Premium 100ml",
            "Jamón Ibérico 75% 100g",
            "Chorizo de jabalí 100g",
            "Jamón Ibérico Bellota 75% 100g",
            "Queso oveja trufa 100g",
            "Mermelada de higo",
            "Mermelada premium"
          ],
          ideal: "Mesa generosa sin alcohol con abundancia de mermeladas.",
          maridaje: "Sin alcohol, abundantes mermeladas.",
          ocasion: "Mesa abierta • Sin alcohol • Abundantes mermeladas",
          personas: "4",
          costePersona: "16.25€",
          imagen: mesaAbiertaNuevoImg
        }
      ];
    } else if (categoria === "Desconocidos-5-6") {
      return [
        {
          id: 44,
          nombre: "Primer Encuentro 5-6",
          precio: 55,
          descripcion: "Primer encuentro con productos esenciales.",
          categoria: "Iniciación",
          sinAlcohol: false,
          productos: [
            "Jamón 75% 100g",
            "Queso trufa 100g",
            "Paté perdiz",
            "Piquitos",
            "Ribera Ricardo Dumas",
            "Aceite Picualia Premium 100ml"
          ],
          ideal: "Primer encuentro de grupos medianos con productos esenciales.",
          maridaje: "Ribera del duero para grupos.",
          ocasion: "Primeros encuentros • Grupos 5-6 personas",
          personas: "5-6",
          costePersona: "11€ (5p) / 9.17€ (6p)",
          imagen: primerEncuentro56Img
        },
        {
          id: 45,
          nombre: "Conexión Natural 5-6 (Sin alcohol)",
          precio: 80,
          descripcion: "Conexión natural sin alcohol.",
          categoria: "Natural Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Jamón 75% 100g",
            "Lomo Bellota 100g",
            "Queso boletus 100g",
            "Paté ciervo",
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Cecina ciervo loncheada",
            "Mermelada"
          ],
          ideal: "Familias medianas que buscan conexión natural sin alcohol",
          maridaje: "Sin alcohol, sabores naturales premium.",
          ocasion: "Familias • Sin alcohol • Conexión natural",
          personas: "5-6",
          costePersona: "16€ (5p) / 13.33€ (6p)",
          imagen: conexionNatural56Img
        },
        {
          id: 46,
          nombre: "Vínculo Gourmet 5-6",
          precio: 90,
          descripcion: (
            <>
              <span style={{ color: '#D4AF37' }} className="font-bold">Vínculos especiales</span> de 5-6 personas con productos <span style={{ color: '#D4AF37' }} className="font-bold">premium</span>
            </>
          ),
          categoria: "Gourmet",
          sinAlcohol: false,
          productos: [
            "Jamón Bellota 75% 100g",
            "Lomo Bellota 100g",
            "Queso ajo negro 100g",
            "Paté Perdiz Real",
            "Piquitos",
            "Condado de Laxas Albariño",
            "Aceite Picualia Premium 100ml",
            "Cecina ciervo loncheada"
          ],
          ideal: "Vínculos especiales de 5-6 personas con productos premium.",
          maridaje: "Albariño realza sabores premium.",
          ocasion: "Vínculos especiales • Premium • Albariño",
          personas: "5-6",
          costePersona: "18€ (5p) / 15€ (6p)",
          imagen: vinculoGourmet56Img
        }
      ];
    } else if (categoria === "Desconocidos-6-8") {
      return [
        {
          id: 44,
          nombre: "Primer Encuentro",
          precio: 70,
          descripcion: "Primer encuentro con productos esenciales.",
          categoria: "Iniciación",
          sinAlcohol: false,
          productos: [
            "Jamón 75% 100g",
            "Queso trufa 100g",
            "Paté perdiz",
            "Piquitos",
            "Ribera Ricardo Dumas",
            "Aceite Picualia Premium 100ml"
          ],
          ideal: "Primer encuentro para grupos de 6-8 personas.",
          maridaje: "Ribera del duero.",
          ocasion: "Primeros encuentros • Grupos 6-8 personas",
          personas: "6-8",
          costePersona: "11.67€ (6p) / 8.75€ (8p)",
          imagen: primerEncuentro68Img
        },
        {
          id: 45,
          nombre: "Conexión Natural (Sin alcohol)",
          precio: 90,
          descripcion: "Conexión natural sin alcohol.",
          categoria: "Natural Sin Alcohol",
          sinAlcohol: true,
          productos: [
            "Jamón Bellota 75% 100g",
            "Lomo Bellota 100g", 
            "Queso boletus 100g",
            "Paté ciervo",
            "Piquitos",
            "Aceite Picualia Premium 100ml",
            "Cecina ciervo loncheada",
            "Mermelada"
          ],
          ideal: "Conexión natural sin alcohol para grupos grandes.",
          maridaje: "Sin alcohol, productos naturales premium.",
          ocasion: "Grupos grandes • Sin alcohol • Natural",
          personas: "6-8",
          costePersona: "15.00€ (6p) / 11.25€ (8p)",
          imagen: conexionNatural68Img
        },
        {
          id: 46,
          nombre: "Vínculo Gourmet",
          precio: 110,
          descripcion: "Experiencia gourmet premium con jamón 100% bellota.",
          categoria: "Premium",
          sinAlcohol: false,
          productos: [
            "Jamón Bellota 100% 100g",
            "Lomo Bellota 100g",
            "Queso ajo negro 100g", 
            "Paté Perdiz Real",
            "Piquitos",
            "Pago Capellanes Joven",
            "Aceite Picualia Premium 100ml",
            "Cecina ciervo loncheada"
          ],
          ideal: "Experiencia gourmet premium para grupos grandes.",
          maridaje: "Pago capellanes joven.",
          ocasion: "Experiencias premium • Jamón 100% • Grupos grandes",
          personas: "6-8", 
          costePersona: "18.33€ (6p) / 13.75€ (8p)",
          imagen: vinculoGourmet68Img
        }
      ];
    }
    
    return [];
  };

  const getCategoryIcon = (categoria: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      "Accesible": Heart,
      "Sin Alcohol": Coffee,
      "Romántica": Heart,
      "Premium": Crown,
      "Ibérico": Users,
      "Premium Sin Alcohol": Coffee,
      "Luxury": Gem,
      "Tradicional": Heart,
      "Fusión": Users,
      "Maridaje": Wine,
      "Familiar": Heart,
      "Grupo": Users,
      "Celebración": Sparkles,
      "Iniciación": Users,
      "Conexión": Heart,
      "Gourmet": Crown,
      "Armonía": Wine,
      "Social": Users
    };
    return iconMap[categoria] || Heart;
  };

  const getCategoryColor = (categoria: string) => {
    const colorMap: { [key: string]: string } = {
      "Accesible": "text-black",
      "Sin Alcohol": "text-blue-600",
      "Romántica": "text-pink-600",
      "Premium": "text-gold",
      "Ibérico": "text-white",
      "Premium Sin Alcohol": "text-blue-700",
      "Luxury": "text-purple-600",
      "Tradicional": "text-white",
      "Fusión": "text-white",
      "Maridaje": "text-violet-600",
      "Familiar": "text-black",
      "Grupo": "text-indigo-600",
      "Celebración": "text-white",
      "Iniciación": "text-black",
      "Conexión": "text-rose-600",
      "Gourmet": "text-white",
      "Armonía": "text-purple-700",
      "Social": "text-blue-700"
    };
    return colorMap[categoria] || "text-primary";
  };

  const baskets = getBaskets();
  
  // Filter baskets based on group size for Familia and Amigos
  const shouldShowGroupButtons = categoria === "Familia" || categoria === "Amigos";
  
  const getFilteredBaskets = () => {
    if (!shouldShowGroupButtons) return baskets;
    
    if (showGroupSize === '3-4') {
      // Show first 3 baskets (3-4 personas)
      return baskets.filter(b => b.personas === '3-4').slice(0, 3);
    } else if (showGroupSize === '5-6') {
      // Show 3 baskets for 5-6 personas
      return baskets.filter(b => b.personas === '5-6').slice(0, 3);
    } else {
      // Show 3 baskets for 7-8 personas
      return baskets.filter(b => b.personas === '6-8' || b.personas === '7-8').slice(0, 3);
    }
  };
  
  const filteredBaskets = getFilteredBaskets();
  
  // Get section title based on current group size
  const getSectionTitle = () => {
    if (!shouldShowGroupButtons) return null;
    
    if (showGroupSize === '3-4') {
      return (
        <>
          Cestas para <span style={{ color: '#D4AF37' }}>3-4 personas</span>
        </>
      );
    } else if (showGroupSize === '5-6') {
      return (
        <>
          Cestas para <span style={{ color: '#D4AF37' }}>5-6 personas</span>
        </>
      );
    } else {
      return (
        <>
          Cestas para <span style={{ color: '#D4AF37' }}>7-8 personas</span>
        </>
      );
    }
  };

  // Determinar combo de colores según categoría y tamaño de grupo
  const getColorCombo = () => {
    let combo = { 
      bg: 'bg-background', 
      text: 'text-black', 
      important: 'text-[#D4AF37]',
      button: 'bg-gray-500 hover:bg-gray-600 text-white border-0',
      navText: 'text-black',
      navImportant: 'text-[#D4AF37]',
      border: 'border-black'
    };

    if (categoria === "Pareja") {
      combo = { ...combo, important: 'text-[#ff1493]', navImportant: 'text-[#ff1493]' };
    } else if (categoria === "Amigos") {
      combo = { ...combo, important: 'text-[#00BFFF]', navImportant: 'text-[#00BFFF]' };
    } else if (categoria === "Familia") {
      combo = { ...combo, important: 'text-[#D4AF37]', navImportant: 'text-[#D4AF37]' };
    }

    // Override por tamaño de grupo en catálogo normal (no regalos)
    if (typeof showGroupSize !== 'undefined' && shouldShowGroupButtons) {
      if (showGroupSize === '5-6') {
        combo = { ...combo, important: 'text-[#ff1493]', navImportant: 'text-[#ff1493]' };
      } else if (showGroupSize === '7-8') {
        combo = { ...combo, important: 'text-[#00BFFF]', navImportant: 'text-[#00BFFF]' };
      }
    }

    return combo;
  };

  const colorCombo = getColorCombo();

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-white">
      
      {/* Group Size Buttons - Horizontal navigation */}
      {shouldShowGroupButtons && (
        <div className="mb-4 mt-4 flex justify-center items-center gap-1 sm:gap-2">
          <motion.button
            onClick={() => {
              setShowGroupSize('3-4');
              onGroupSizeChange?.('3-4');
            }}
            className={`font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-2 gpu-accelerated ${
              showGroupSize === '3-4' 
                ? 'text-xl sm:text-2xl scale-110' 
                : 'text-base sm:text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '3-4' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={showGroupSize === '3-4' ? '' : 'text-black'} style={showGroupSize === '3-4' ? { color: '#D4AF37' } : {}}>3-4</span>
          </motion.button>
          
          <span className="text-black text-base sm:text-xl mx-1 sm:mx-2">|</span>
          
          <motion.button
            onClick={() => {
              setShowGroupSize('5-6');
              onGroupSizeChange?.('5-6');
            }}
            className={`font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-2 gpu-accelerated ${
              showGroupSize === '5-6' 
                ? 'text-xl sm:text-2xl scale-110' 
                : 'text-base sm:text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '5-6' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={showGroupSize === '5-6' ? '' : 'text-black'} style={showGroupSize === '5-6' ? { color: '#D4AF37' } : {}}>5-6</span>
          </motion.button>
          
          <span className="text-black text-base sm:text-xl mx-1 sm:mx-2">|</span>
          
          <motion.button
            onClick={() => {
              setShowGroupSize('7-8');
              onGroupSizeChange?.('7-8');
            }}
            className={`font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-2 gpu-accelerated ${
              showGroupSize === '7-8' 
                ? 'text-xl sm:text-2xl scale-110' 
                : 'text-base sm:text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '7-8' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={showGroupSize === '7-8' ? '' : 'text-black'} style={showGroupSize === '7-8' ? { color: '#D4AF37' } : {}}>7-8</span>
          </motion.button>
        </div>
      )}
      
      
      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary">
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
            </h3>
            <p className="font-bold text-primary">{getLocalTotalAmount().toFixed(2)}€</p>
          </div>
          <Button 
            onClick={() => {
              navigate('/carrito', { state: { fromGiftCatalog: isGiftCatalog } });
            }}
            className="w-full bg-primary hover:bg-primary/90"
          >
            IR AL CARRITO
            </Button>
        </div>
      )}

      <div className="flex flex-col items-center gap-16 max-w-6xl mx-auto">
        {filteredBaskets.map((basket, index) => {
          const IconComponent = getCategoryIcon(basket.categoria);
          const isCardOpen = openCard === basket.id;
          const isProductsOpen = openProducts[basket.id] || false;
          const isIdealOpen = openIdeal[basket.id] || false;
          const isMaridajeOpen = openMaridaje[basket.id] || false;
          const isOcasionOpen = openOcasion[basket.id] || false;

          return (
            <motion.div
              key={basket.id}
              id={`cesta-${basket.id}`}
              data-basket-id={basket.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3 }}
              className="group w-full scroll-mt-32 gpu-accelerated"
            >
              {/* Nuevo layout aplicado a todas las cestas cuando están expandidas */}
              {isCardOpen ? (
                // NUEVO LAYOUT expandido: imagen centrada, coste centrado, info alrededor
                <div className="relative w-full px-4 mt-2 bg-white border-2 border-gold/30 rounded-lg py-6 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Top Left: Título, Descripción y Maridaje */}
                  <div className="col-span-1">
                    <div className="flex items-start gap-1 mb-1 relative">
                      <h3 data-basket-title className="font-poppins font-bold text-base sm:text-xl transition-colors basket-title text-black whitespace-nowrap">
                        {basket.nombre}
                      </h3>
                      <button 
                        onClick={() => handleCardToggle(basket.id)}
                        className="text-gold hover:opacity-70 transition-opacity hover:scale-110"
                        aria-label="Cerrar tarjeta"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                      
                      {basket.sinAlcohol && (
                        <Badge className="bg-green-600/80 text-white hover:bg-green-600/90 mb-1 text-xs">
                          Sin alcohol
                        </Badge>
                      )}
                      
                      <p className="text-[10px] sm:text-xs leading-tight font-bold text-black/80 basket-descripcion mb-2 whitespace-nowrap">
                        {basket.descripcion}
                      </p>
                    </div>

                    {/* Productos incluidos - Dos columnas verticales */}
                    <div className="col-span-2 flex justify-end">
                      <div className="w-full md:w-2/3">
                        <button 
                          onClick={() => setOpenProducts(prev => ({ ...prev, [basket.id]: !prev[basket.id] }))}
                          className="flex items-center gap-2 mb-1 hover:opacity-70 transition-opacity ml-auto border-2 border-black px-3 py-1.5 rounded-lg"
                        >
                          <span className="font-bold text-xs sm:text-sm text-gold">Productos incluidos</span>
                          <span className="text-gold">
                            {isProductsOpen ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </span>
                        </button>
                        {isProductsOpen && (
                          <div className="rounded-lg p-2">
                            <div className="grid grid-cols-2 gap-4 text-right">
                              {/* Columna 1: Embutidos y Quesos */}
                              <div className="space-y-1">
                                {basket.productos
                                  .filter(p => {
                                    const lower = p.toLowerCase();
                                    return (
                                      lower.includes('jamón') || lower.includes('jamon') ||
                                      lower.includes('chorizo') || lower.includes('salchichón') || 
                                      lower.includes('salchichon') || lower.includes('lomo') ||
                                      lower.includes('cecina') || lower.includes('queso')
                                    );
                                  })
                                   .map((producto, idx) => (
                                     <p key={idx} className="text-[10px] sm:text-xs font-bold text-black/80 basket-producto-text">
                                       • {producto}
                                     </p>
                                  ))
                                }
                              </div>
                              {/* Columna 2: Vino, Patés, Mermeladas y Piquitos */}
                              <div className="space-y-1">
                                {basket.productos
                                  .filter(p => {
                                    const lower = p.toLowerCase();
                                    return (
                                      lower.includes('vino') || lower.includes('paté') || 
                                      lower.includes('pate') || lower.includes('mermelada') ||
                                      lower.includes('piquitos') || lower.includes('manzanilla') ||
                                      lower.includes('verdejo') || lower.includes('duero') ||
                                      lower.includes('ribera') || lower.includes('rueda') ||
                                      lower.includes('albariño') || lower.includes('albarino')
                                    );
                                  })
                                  .map((producto, idx) => (
                                     <p key={idx} className="text-[10px] sm:text-xs font-bold text-black/80 basket-producto-text">
                                       • {producto}
                                     </p>
                                  ))
                                }
                              </div>
                            </div>
                            
                            {/* ACCESO A EXPERIENCIA ÚNICA */}
                            <div className="col-span-2 flex flex-col items-center justify-center mt-4 mb-2">
                              <Collapsible
                                open={openInfoDinamica[basket.id] || false}
                                onOpenChange={(open) => setOpenInfoDinamica(prev => ({ ...prev, [basket.id]: open }))}
                                className="w-full"
                              >
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <p className="text-center text-gold font-bungee text-xs sm:text-sm tracking-[0.15em]">
                                    ACCESO A EXPERIENCIA ÚNICA
                                  </p>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs bg-transparent text-foreground hover:bg-foreground/5 flex items-center gap-1">
                                      <Info className="w-3 h-3" />
                                      Info
                                      <ChevronDown className={`w-3 h-3 transition-transform ${openInfoDinamica[basket.id] ? 'rotate-180' : ''}`} />
                                    </Button>
                                  </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="mt-2 px-2 sm:px-4">
                                  <div className="bg-white border border-gold/30 rounded-lg p-3 sm:p-4">
                                    <div className="space-y-2 text-xs sm:text-sm text-black">
                                      <p className="font-semibold text-gold mb-2">🌟 Experiencia Única Incluida</p>
                                      <p>
                                        Acceso a una <span className="font-bold text-gold">web privada exclusiva para clientes</span> con dinámicas personalizadas diseñadas por psicólogos y expertos en conexión humana.
                                      </p>
                                      <p>
                                        <span className="font-bold">Preguntas dinámicas</span> creadas específicamente para cada momento: para conocerse, profundizar, reír y crear recuerdos mientras disfrutan de productos gourmet premium.
                                      </p>
                                      
                                      {isGiftCatalog && (
                                        <div className="mt-3 pt-2 border-t border-gold/30">
                                          <p className="font-semibold text-xs mb-1.5">Proceso de regalo:</p>
                                          <ul className="space-y-1 text-xs">
                                            <li>• Eliges canal (email/SMS)</li>
                                            <li>• Destinatario confirma dirección y fecha</li>
                                            <li>• Recibe su experiencia en 30 días</li>
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Center: Imagen centrada */}
                    <div className="col-span-2 flex flex-col items-center my-2 gap-2">
                      <div 
                        className="relative w-32 h-24 sm:w-40 sm:h-32 overflow-hidden rounded-lg shadow-lg cursor-pointer fast-transition hover-lift gpu-accelerated"
                        onClick={() => handleOpenImage(basket.imagen)}
                      >
                  <img
                    src={basket.imagen}
                    alt={basket.nombre}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                      </div>
                      
                      {/* Añadir al carrito - Justo debajo de la imagen */}
                      <div className="flex items-center gap-2">
                        <AddToCartButton 
                          onClick={(e) => handleAddToCart(basket, e)}
                          price={basket.precio}
                          className="text-black text-xs sm:text-sm"
                        />
                        <AnimatePresence mode="wait">
                          {addedBasketId === basket.id && (
                            <motion.div
                              key={`added-top-${basket.id}`}
                              initial={{ opacity: 0, scale: 0.5, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.5, x: -20 }}
                              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                              className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold text-xs whitespace-nowrap border border-green-400"
                            >
                              <span>✓</span>
                              <span>{basket.nombre} añadida</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Center: Coste por persona - Desplegable */}
                    <div className="col-span-2 flex justify-center">
                      <div className="w-full max-w-md">
                        <Collapsible
                          open={openIdeal[basket.id]}
                          onOpenChange={() => setOpenIdeal(prev => ({ ...prev, [basket.id]: !prev[basket.id] }))}
                        >
                          <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between gap-2 text-black hover:opacity-80 transition-opacity py-1 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-gold/10 border border-gold/30">
                              <span className="text-xs sm:text-sm font-bold lowercase first-letter:capitalize">
                                coste por persona.
                              </span>
                              {openIdeal[basket.id] ? 
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : 
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              }
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            {basket.costePersona && (
                              <p className="text-sm sm:text-base font-bold text-center">
                                {basket.costePersona.split(/(\([^)]+\))/).map((part, index) => {
                                  if (part.match(/\([^)]+\)/)) {
                                    return <span key={index} className="text-black/70">{part}</span>;
                                  } else if (part.trim()) {
                                    return <span key={index} className="text-gold font-bold text-base sm:text-lg">{part}</span>;
                                  }
                                  return null;
                                })}
                              </p>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                // LAYOUT COMPACTO cuando no está expandido
                <div className={`flex gap-3 md:grid md:grid-cols-2 md:gap-6 ${
                  isCardOpen ? 'items-start' : 'items-center'
                } ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  
                  {/* DIV Imagen - Más pequeña en móvil */}
                  <div 
                    className={`flex-shrink-0 w-24 h-24 md:w-auto md:h-auto ${index % 2 === 1 ? 'md:col-start-2' : ''}`}
                  >
                    <div 
                      className={`relative w-full overflow-hidden rounded-lg shadow-lg cursor-pointer fast-transition hover-lift gpu-accelerated ${
                        isCardOpen ? 'h-24 md:h-48' : 'h-24 md:h-64'
                      }`}
                      onClick={() => handleOpenImage(basket.imagen)}
                    >
                      <img 
                        src={basket.imagen}
                        alt={basket.nombre}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </div>
                  </div>

                  {/* DIV Contenido - Ajustado para móvil */}
                  <div className={`flex-1 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <div className="rounded-lg shadow-none p-3 md:p-6 bg-card border-2 border-black">
                      <div className={`flex-1 space-y-2 md:space-y-3 ${!isCardOpen ? 'md:flex md:items-center md:min-h-[16rem]' : ''}`}>
                        {/* Title - clickeable con hover que expande flecha */}
                        {/* Título clickeable */}
                        <div 
                          className="flex items-center justify-between w-full mb-1 md:mb-2 cursor-pointer group"
                          onClick={() => handleCardToggle(basket.id)}
                        >
                          <h3 data-basket-title className={`font-poppins font-bold text-base md:text-2xl transition-colors basket-title ${colorCombo.text} hover:${colorCombo.important}`}>
                            {basket.nombre}
                          </h3>
                          <div className="group-hover:translate-x-1 transition-transform duration-200">
                            {isCardOpen ? <ChevronUp className={`h-4 w-4 md:h-5 md:w-5 ${colorCombo.important}`} /> : <ChevronDown className={`h-4 w-4 md:h-5 md:w-5 ${colorCombo.important}`} />}
                          </div>
                        </div>
                        
                        {isCardOpen && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="space-y-5 overflow-hidden"
                          >
                            {/* Without Alcohol Badge */}
                            {basket.sinAlcohol && (
                              <Badge className="bg-green-600/80 text-white hover:bg-green-600/90">
                                Sin alcohol
                              </Badge>
                            )}

                            {/* Descripción reducida */}
                            <div className="flex justify-end">
                              <p className={`text-xs leading-relaxed font-bold text-right ${colorCombo.text} max-w-md basket-descripcion`}>
                                {basket.descripcion}
                              </p>
                            </div>

                             {/* Productos Collapsible - Izquierda */}
                            <div className="flex justify-start mb-4">
                              <Collapsible open={isProductsOpen} onOpenChange={(open) => setOpenProducts(prev => ({ ...prev, [basket.id]: open }))}>
                                <CollapsibleTrigger asChild>
                                   <Button 
                                      variant="ghost" 
                                      className={`w-full justify-between p-0 h-auto font-bold text-sm hover:bg-transparent transition-colors border-0 bg-transparent basket-productos-trigger`}
                                    >
                                      <span className={`flex items-center basket-productos-label ${colorCombo.text}`}>
                                        <Wine className="w-3 h-3 mr-1" />
                                        <span className={colorCombo.important}>Productos</span> <span className="ml-1">incluidos</span>
                                      </span>
                                      {isProductsOpen ? <ChevronUp className={`h-4 w-4 ${colorCombo.text}`} /> : <ChevronDown className={`h-4 w-4 ${colorCombo.text}`} />}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 animate-accordion-down">
                                  <div className="rounded-lg p-3 space-y-2">
                                     {basket.productos.map((producto, idx) => (
                                      <motion.p 
                                        key={idx} 
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ 
                                          duration: 0.3,
                                          delay: idx * 0.15,
                                          ease: "easeOut"
                                        }}
                                        className={`text-xs font-bold ${colorCombo.text} basket-producto-item`}
                                      >
                                        • {producto}
                                      </motion.p>
                                    ))}
                                    
                                    {/* ACCESO A EXPERIENCIA ÚNICA */}
                                    <div className="flex flex-col items-center mt-4 gap-2">
                                      <Collapsible
                                        open={openInfoDinamica[basket.id] || false}
                                        onOpenChange={(open) => setOpenInfoDinamica(prev => ({ ...prev, [basket.id]: open }))}
                                        className="w-full"
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <p
                                            className={`${colorCombo.important} font-bold text-sm tracking-[0.15em] uppercase`}
                                            style={{ fontFamily: 'Boulder, sans-serif' }}
                                          >
                                            ACCESO A EXPERIENCIA ÚNICA
                                          </p>
                                          <CollapsibleTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              className="h-8 gap-1 px-2 rounded-md hover:bg-black/10"
                                            >
                                              <Info className={`h-4 w-4 ${colorCombo.important}`} />
                                              <ChevronDown className={`h-4 w-4 ${colorCombo.important} transition-transform ${openInfoDinamica[basket.id] ? 'rotate-180' : ''}`} />
                                            </Button>
                                          </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-2">
                                          <div className="bg-white border border-[#FFD700]/30 rounded-lg p-3 sm:p-4">
                                            <div className="space-y-2 text-xs sm:text-sm text-black">
                                              <p className="font-semibold text-[#FFD700]">🌟 Experiencia Única Incluida</p>
                                              <p>
                                                Acceso a una <span className="font-bold text-[#FFD700]">web privada exclusiva para clientes</span> con dinámicas personalizadas diseñadas por psicólogos y expertos en conexión humana.
                                              </p>
                                              <p>
                                                <span className="font-bold">Preguntas dinámicas</span> creadas específicamente para cada momento: para conocerse, profundizar, reír y crear recuerdos mientras disfrutan de productos gourmet premium.
                                              </p>
                                            </div>
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>

                            {/* Solo Maridaje - abajo, a la derecha - ocultar si sin alcohol */}
                            {!basket.sinAlcohol && (
                              <div className="flex justify-end">
                                <div className="flex flex-col gap-2 w-full md:w-1/2">
                                  {/* Maridaje Collapsible */}
                                  <Collapsible open={isMaridajeOpen} onOpenChange={(open) => setOpenMaridaje(prev => ({ ...prev, [basket.id]: open }))}>
                                    <CollapsibleTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        className={`w-full justify-between p-2 h-auto font-bold text-xs transition-colors border-0 bg-transparent hover:bg-transparent basket-maridaje-trigger`}
                                      >
                                        <span className={`font-bold basket-maridaje-label ${colorCombo.important}`}>Maridaje</span>
                                        {isMaridajeOpen ? <ChevronUp className={`h-3 w-3 ${colorCombo.text}`} /> : <ChevronDown className={`h-3 w-3 ${colorCombo.text}`} />}
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 animate-accordion-down">
                                      <div className="rounded-lg p-2">
                                        <p className={`text-xs font-bold ${colorCombo.text} basket-maridaje`}>{basket.maridaje}</p>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              </div>
                            )}

                            <Separator className="bg-border" />

                            {/* Coste por persona */}
                            {basket.costePersona && (
                              <p className={`${showGroupSize === "7-8" ? "text-base md:text-lg" : "text-lg md:text-xl"} mt-1 font-bold ${colorCombo.text} basket-coste text-center whitespace-nowrap`}>
                                coste por persona: <span className={`${colorCombo.important} font-bold ${showGroupSize === "7-8" ? "text-lg md:text-xl" : "text-xl md:text-2xl"}`}>{basket.costePersona}</span>
                              </p>
                            )}

                            <div className="flex flex-col gap-2">
                              <div className="flex justify-center items-center gap-3 flex-wrap">
                                <AddToCartButton 
                                  onClick={(e) => handleAddToCart(basket, e)}
                                  price={basket.precio}
                                  className={colorCombo.text}
                                />
                                <AnimatePresence mode="wait">
                                  {addedBasketId === basket.id && (
                                    <motion.div
                                      key={`added-${basket.id}`}
                                      initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      exit={{ opacity: 0, scale: 0.5, x: -20 }}
                                      transition={{ 
                                        duration: 0.3,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                      }}
                                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-xl font-bold text-xs sm:text-sm whitespace-nowrap border-2 border-green-400"
                                    >
                                      <span className="text-lg">✓</span>
                                      <span>¡{basket.nombre} añadida!</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>


      {/* Image Modal - Full screen overlay */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleCloseImage}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative max-w-6xl max-h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              onClick={handleCloseImage} 
              className="absolute -top-4 -right-4 z-50 h-12 w-12 rounded-full bg-white hover:bg-white/90 text-black shadow-2xl transition-all duration-300" 
              size="icon"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="rounded-2xl overflow-hidden bg-white shadow-2xl p-2">
              <img
                src={selectedImage}
                alt="Cesta completa - Vista ampliada"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          setCart([]); // Clear local cart
          localStorage.removeItem('pendingCheckout'); // Clear any pending checkout flag
          // Al cerrar desde catálogo, quedarse en el catálogo (no navegar)
        }}
        basketItems={basketItems}
        totalAmount={getLocalTotalAmount()}
        onClearCart={() => {
          clearCart(); // Clear global cart
          setCart([]); // Clear local cart
        }}
        onRemoveItems={removeMultipleItems}
      />

    </div>
  );
};

export default BasketCatalog;