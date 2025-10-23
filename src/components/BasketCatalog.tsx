import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wine, Coffee, Heart, Crown, Gem, Users, ChevronDown, ChevronUp, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import CheckoutModal from "./CheckoutModal";
import AddToCartButton from "./AddToCartButton";

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
}

const BasketCatalog: React.FC<BasketCatalogProps> = ({ categoria, onGroupSizeChange }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [openProducts, setOpenProducts] = useState<{ [key: number]: boolean }>({});
  const [openIdeal, setOpenIdeal] = useState<{ [key: number]: boolean }>({});
  const [openMaridaje, setOpenMaridaje] = useState<{ [key: number]: boolean }>({});
  const [openOcasion, setOpenOcasion] = useState<{ [key: number]: boolean }>({});
  const [showGroupSize, setShowGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const { cart: globalCart, addToCart: addToGlobalCart, getTotalAmount, getTotalItems } = useCart();

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

  // Handle card toggle and reset collapsibles when closed
  const handleCardToggle = (cardId: number) => {
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
  };

  // Local cart for checkout modal compatibility
  const [cart, setCart] = useState<Basket[]>([]);

  const handleAddToCart = (basket: Basket) => {
    // Add to global cart
    addToGlobalCart({
      id: basket.id,
      nombre: basket.nombre,
      precio: basket.precio,
      categoria: basket.categoria,
      imagen: basket.imagen
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

    // Show toast notification
    toast.success("¡Cesta añadida!", {
      description: `${basket.nombre} se ha añadido a tu carrito`,
      duration: 3000,
    });

    // Scroll to top of the sheet/container to show cart summary
    const sheetContent = document.querySelector('[role="dialog"]');
    if (sheetContent) {
      sheetContent.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const getLocalTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.precio * (item.quantity || 1)), 0);
  };

  const basketItems = cart.map(item => ({
    id: item.id,
    name: item.nombre,
    price: item.precio,
    category: item.categoria,
    quantity: item.quantity || 1
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
              Parejas que buscan una <span className="text-gold font-bold">primera experiencia gourmet</span> con productos de <span className="text-gold font-bold">calidad excepcional</span>
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
              <span className="text-gold font-bold">Conversaciones profundas</span> con sabores <span className="text-gold font-bold">naturales</span> sin alcohol
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
              <span className="text-gold font-bold">Ocasiones especiales</span> que merecen <span className="text-gold font-bold">lo mejor</span>, con jamón <span className="text-gold font-bold">ibérico</span>
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
              <span className="text-gold font-bold">Reuniones familiares</span> y encuentros de <span className="text-gold font-bold">amigos cercanos</span>
            </>
          ),
          maridaje: "Rueda verdejo complementa ibéricos.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Reuniones</span> casuales • <span className="text-gold font-bold">Aperitivos</span> • Encuentros de <span className="text-gold font-bold">amigos</span>
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
              <span className="text-gold font-bold">Reuniones familiares</span> que prefieren <span className="text-gold font-bold">opciones sin alcohol</span>
            </>
          ),
          maridaje: "Sabores puros sin alcohol.",
          ocasion: (
            <>
              Comidas familiares • <span className="text-gold font-bold">Reuniones</span> saludables • Encuentros naturales
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
              Grupos que valoran la <span className="text-gold font-bold">calidad premium</span> y los <span className="text-gold font-bold">sabores selectos</span>
            </>
          ),
          maridaje: "Verdejo realza sabores ibéricos.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Cenas especiales</span> • <span className="text-gold font-bold">Celebraciones</span> • <span className="text-gold font-bold">Eventos premium</span>
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
              <span className="text-gold font-bold">Reuniones familiares</span> que buscan <span className="text-gold font-bold">sabores tradicionales</span>
            </>
          ),
          maridaje: "Vino roble para ibéricos.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Comidas familiares</span> • <span className="text-gold font-bold">Reuniones tradicionales</span> • <span className="text-gold font-bold">Celebraciones clásicas</span>
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
              Grupos que buscan una <span className="text-gold font-bold">experiencia gastronómica</span> sin alcohol
            </>
          ),
          maridaje: "Pureza de sabores premium.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Experiencias únicas</span> • <span className="text-gold font-bold">Reuniones especiales</span> • <span className="text-gold font-bold">Eventos saludables</span>
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
              <span className="text-gold font-bold">Tertulias memorables</span> con productos de <span className="text-gold font-bold">categoría superior</span>
            </>
          ),
          maridaje: "Rioja Crianza y Ribera del Duero.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Tertulias especiales</span> • <span className="text-gold font-bold">Celebraciones importantes</span> • <span className="text-gold font-bold">Eventos premium</span>
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
              <span className="text-gold font-bold">Celebraciones especiales</span> para grupos de <span className="text-gold font-bold">7-8 personas</span>
            </>
          ),
          maridaje: "Chardonnay y roble completan experiencia.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Celebraciones familiares</span> • <span className="text-gold font-bold">Eventos especiales</span> • <span className="text-gold font-bold">Reuniones grandes</span>
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
              La <span className="text-gold font-bold">máxima calidad</span> sin alcohol, con <span className="text-gold font-bold">productos premium</span>
            </>
          ),
          maridaje: "Sin alcohol, sabores puros.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Eventos especiales</span> • <span className="text-gold font-bold">Celebraciones grandes</span> • <span className="text-gold font-bold">Reuniones premium</span>
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
              Para quienes buscan <span className="text-gold font-bold">lo mejor de lo mejor</span>, con jamón <span className="text-gold font-bold">100% ibérico</span>
            </>
          ),
          maridaje: "Ribera del Duero y Rioja Reserva.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Ocasiones especiales</span> • Celebraciones únicas • <span className="text-gold font-bold">Experiencias memorables</span>
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
              Familias medianas que buscan <span className="text-gold font-bold">conexión natural</span> sin alcohol
            </>
          ),
          maridaje: "Sin alcohol, doble aceite premium.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Encuentros familiares</span> • <span className="text-gold font-bold">Sin alcohol</span> • <span className="text-gold font-bold">Conexión natural</span>
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
              <span className="text-gold font-bold">Vínculos especiales</span> de parejas con productos <span className="text-gold font-bold">premium</span>
            </>
          ),
          maridaje: "Doble jamón con ribera del duero.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Vínculos especiales</span> • <span className="text-gold font-bold">Premium</span> • <span className="text-gold font-bold">Doble jamón</span>
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
              <span className="text-gold font-bold">Primera experiencia gourmet</span> accesible para parejas
            </>
          ),
          maridaje: "Entrada perfecta al mundo gourmet.",
          ocasion: (
            <>
              <span className="text-gold font-bold">Primeros encuentros</span> • <span className="text-gold font-bold">Experiencia accesible</span>
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
              <span className="text-gold font-bold">Largas conversaciones</span> sin necesidad de alcohol
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
              <span className="text-gold font-bold">Vínculos especiales</span> de 5-6 personas con productos <span className="text-gold font-bold">premium</span>
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
          Cestas para <span className="text-gold">3-4 personas</span>
        </>
      );
    } else if (showGroupSize === '5-6') {
      return (
        <>
          Cestas para <span className="text-gold">5-6 personas</span>
        </>
      );
    } else {
      return (
        <>
          Cestas para <span className="text-gold">7-8 personas</span>
        </>
      );
    }
  };

  // Determinar combo de colores según categoría y tamaño de grupo
  const getColorCombo = () => {
    if (categoria === "Pareja") {
      // Pareja: texto negro, importantes rosa
      return { 
        bg: 'bg-white', 
        text: 'text-black', 
        important: 'text-[#ff1493]',
        button: 'bg-gray-500 hover:bg-gray-600 text-white border-0',
        navText: 'text-black',
        navImportant: 'text-[#ff1493]',
        border: 'border-black'
      };
    } else if (categoria === "Amigos") {
      // Amigos: texto negro, importantes azul
      return { 
        bg: 'bg-white', 
        text: 'text-black', 
        important: 'text-[#00BFFF]',
        button: 'bg-blue-500 hover:bg-blue-600 text-white border-0',
        navText: 'text-black',
        navImportant: 'text-[#00BFFF]',
        border: 'border-black'
      };
    } else if (categoria === "Familia") {
      // Familia: texto negro, importantes dorado
      return { 
        bg: 'bg-white', 
        text: 'text-black', 
        important: 'text-[#FFD700]',
        button: 'bg-yellow-500 hover:bg-yellow-600 text-white border-0',
        navText: 'text-black',
        navImportant: 'text-[#FFD700]',
        border: 'border-black'
      };
    }
    // Default
    return { 
      bg: 'bg-white', 
      text: 'text-black', 
      important: 'text-[#FFD700]',
      button: 'bg-gray-500 hover:bg-gray-600 text-white border-0',
      navText: 'text-black',
      navImportant: 'text-[#FFD700]',
      border: 'border-black'
    };
  };

  const colorCombo = getColorCombo();

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${colorCombo.bg}`}>
      
      {/* Group Size Buttons - Horizontal navigation */}
      {shouldShowGroupButtons && (
        <div className="mb-8 mt-12 flex justify-center items-center gap-2 flex-wrap">
          <motion.button
            onClick={() => {
              setShowGroupSize('3-4');
              onGroupSizeChange?.('3-4');
            }}
            className={`font-bold transition-all duration-300 px-6 py-2 ${
              showGroupSize === '3-4' 
                ? 'text-2xl scale-110' 
                : 'text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '3-4' ? 1.1 : 1.05 }}
          >
            <span className={showGroupSize === '3-4' ? 'text-gold' : 'text-black'}>3-4</span>
          </motion.button>
          
          <span className="text-black text-xl mx-2">|</span>
          
          <motion.button
            onClick={() => {
              setShowGroupSize('5-6');
              onGroupSizeChange?.('5-6');
            }}
            className={`font-bold transition-all duration-300 px-6 py-2 ${
              showGroupSize === '5-6' 
                ? 'text-2xl scale-110' 
                : 'text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '5-6' ? 1.1 : 1.05 }}
          >
            <span className={showGroupSize === '5-6' ? 'text-gold' : 'text-black'}>5-6</span>
          </motion.button>
          
          <span className="text-black text-xl mx-2">|</span>
          
          <motion.button
            onClick={() => {
              setShowGroupSize('7-8');
              onGroupSizeChange?.('7-8');
            }}
            className={`font-bold transition-all duration-300 px-6 py-2 ${
              showGroupSize === '7-8' 
                ? 'text-2xl scale-110' 
                : 'text-lg hover:opacity-70'
            }`}
            whileHover={{ scale: showGroupSize === '7-8' ? 1.1 : 1.05 }}
          >
            <span className={showGroupSize === '7-8' ? 'text-gold' : 'text-black'}>7-8</span>
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
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            PROCEDER AL PAGO
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group w-full scroll-mt-32"
            >
              {/* Nuevo layout aplicado a todas las cestas cuando están expandidas */}
              {isCardOpen ? (
                // NUEVO LAYOUT expandido: imagen centrada, coste centrado, info alrededor
                <div className="relative w-full px-8 mt-8">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Top Left: Título, Descripción y Maridaje */}
                  <div className="col-span-1">
                    <div className="flex items-start gap-1 mb-2 relative">
                      <h3 className={`font-poppins font-bold text-xl sm:text-2xl transition-colors basket-title ${colorCombo.text} whitespace-nowrap`}>
                        {basket.nombre}
                      </h3>
                      <button 
                        onClick={() => handleCardToggle(basket.id)}
                        className={`${colorCombo.important} hover:opacity-70 transition-opacity`}
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </div>
                      
                      {basket.sinAlcohol && (
                        <Badge className="bg-green-600/80 text-white hover:bg-green-600/90 mb-2">
                          Sin alcohol
                        </Badge>
                      )}
                      
                      <p className={`text-xs leading-relaxed font-bold ${colorCombo.text} basket-descripcion mb-4`}>
                        {basket.descripcion}
                      </p>
                    </div>

                    {/* Productos incluidos - Dos columnas verticales */}
                    <div className="col-span-2 flex justify-end">
                      <div className="w-full md:w-2/3">
                        <button 
                          onClick={() => setOpenProducts(prev => ({ ...prev, [basket.id]: !prev[basket.id] }))}
                          className="flex items-center gap-2 mb-2 hover:opacity-70 transition-opacity ml-auto"
                        >
                          <span className={`font-bold text-sm ${colorCombo.important}`}>Productos incluidos</span>
                          <span className={`${colorCombo.text}`}>
                            {isProductsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                                     <p key={idx} className={`text-xs font-bold ${colorCombo.text} basket-producto-text`}>
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
                                     <p key={idx} className={`text-xs font-bold ${colorCombo.text} basket-producto-text`}>
                                       • {producto}
                                     </p>
                                  ))
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Center: Imagen centrada */}
                    <div className="col-span-2 flex flex-col items-center my-4 gap-3">
                      <div 
                        className="relative w-56 h-44 overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedImage(basket.imagen)}
                      >
                  <img
                    src={basket.imagen}
                    alt={basket.nombre}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                      </div>
                      
                      {/* Añadir al carrito - Justo debajo de la imagen */}
                      <AddToCartButton 
                        onClick={() => handleAddToCart(basket)}
                        price={basket.precio}
                        className="text-black"
                      />
                    </div>

                    {/* Center: Coste por persona - Desplegable */}
                    <div className="col-span-2 flex justify-center">
                      <div className="w-full max-w-md">
                        <Collapsible
                          open={openIdeal[basket.id]}
                          onOpenChange={() => setOpenIdeal(prev => ({ ...prev, [basket.id]: !prev[basket.id] }))}
                        >
                          <CollapsibleTrigger asChild>
                            <button className={`w-full flex items-center justify-between gap-2 text-black hover:opacity-80 transition-opacity py-2 px-4 rounded-lg hover:bg-black/5`}>
                              <span className="text-sm font-bold lowercase first-letter:capitalize">
                                coste por persona.
                              </span>
                              {openIdeal[basket.id] ? 
                                <ChevronUp className="w-4 h-4 flex-shrink-0" /> : 
                                <ChevronDown className="w-4 h-4 flex-shrink-0" />
                              }
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            {basket.costePersona && (
                              <p className={`text-base sm:text-lg font-bold text-center`}>
                                {basket.costePersona.split(/(\([^)]+\))/).map((part, index) => {
                                  if (part.match(/\([^)]+\)/)) {
                                    return <span key={index} className="text-black">{part}</span>;
                                  } else if (part.trim()) {
                                    return <span key={index} style={{ color: '#FFD700' }} className="font-bold text-lg sm:text-xl">{part}</span>;
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
                      className={`relative w-full overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${
                        isCardOpen ? 'h-24 md:h-48' : 'h-24 md:h-64'
                      }`}
                      onClick={() => setSelectedImage(basket.imagen)}
                    >
                      <img 
                        src={basket.imagen}
                        alt={basket.nombre}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </div>
                  </div>

                  {/* DIV Contenido - Ajustado para móvil */}
                  <div className={`flex-1 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <div className="rounded-lg shadow-none p-3 md:p-6 bg-white">
                      <div className={`flex-1 space-y-2 md:space-y-3 ${!isCardOpen ? 'md:flex md:items-center md:min-h-[16rem]' : ''}`}>
                        {/* Title - clickeable con hover que expande flecha */}
                        {/* Título clickeable */}
                        <div 
                          className="flex items-center justify-between w-full mb-1 md:mb-2 cursor-pointer group"
                          onClick={() => handleCardToggle(basket.id)}
                        >
                          <h3 className={`font-poppins font-bold text-base md:text-2xl transition-colors basket-title ${colorCombo.text} hover:${colorCombo.important}`}>
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
                            transition={{ duration: 0.4, ease: "easeInOut" }}
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

                            <Separator className={colorCombo.bg === 'bg-white' ? 'bg-black/20' : 'bg-white/20'} />

                            {/* Coste por persona */}
                            {basket.costePersona && (
                              <p className={`${showGroupSize === "7-8" ? "text-base md:text-lg" : "text-lg md:text-xl"} mt-1 font-bold ${colorCombo.text} basket-coste text-center whitespace-nowrap`}>
                                coste por persona: <span className={`${colorCombo.important} font-bold ${showGroupSize === "7-8" ? "text-lg md:text-xl" : "text-xl md:text-2xl"}`}>{basket.costePersona}</span>
                              </p>
                            )}

                            <div className="flex flex-col gap-2">
                              <div className="flex justify-center">
                                <AddToCartButton 
                                  onClick={() => handleAddToCart(basket)}
                                  price={basket.precio}
                                  className={colorCombo.text}
                                />
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


      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de cesta</DialogTitle>
          <DialogDescription className="sr-only">
            Imagen ampliada de la cesta seleccionada
          </DialogDescription>
          <Button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          {selectedImage && (
            <div className="rounded-3xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Cesta completa"
                className="w-full h-auto max-h-[80vh] object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          setCart([]); // Clear cart after successful purchase
        }}
        basketItems={basketItems}
        totalAmount={getLocalTotalAmount()}
      />
    </div>
  );
};

export default BasketCatalog;