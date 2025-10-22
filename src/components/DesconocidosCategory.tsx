import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UsersRound } from "lucide-react";
import BasketCatalog from "./BasketCatalog";
import desconocidosBackground from "@/assets/people-sharing-experience.jpg";
import parejaImg from "@/assets/pareja-experience.jpg";
import conversationImg from "@/assets/conversation-experience.jpg";
import grupoMedianoImg from "@/assets/grupo-mediano-experience.jpg";
import grupoGrandeImg from "@/assets/grupo-grande-experience.jpg";
import amigosImg from "@/assets/amigos-experience.jpg";
const DesconocidosCategory = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const subCategories = [{
    id: 1,
    title: "2 personas",
    description: "Primeros encuentros íntimos",
    icon: UserPlus,
    categoria: "Desconocidos-2",
    image: parejaImg
  }, {
    id: 2,
    title: "3 personas",
    description: "Tríos de conversación",
    icon: Users,
    categoria: "Desconocidos-3",
    image: conversationImg
  }, {
    id: 3,
    title: "4 personas",
    description: "Cuartetos sociales",
    icon: UsersRound,
    categoria: "Desconocidos-4",
    image: amigosImg
  }, {
    id: 4,
    title: "5-6 personas",
    description: "Grupos medianos",
    icon: Users,
    categoria: "Desconocidos-5-6",
    image: grupoMedianoImg
  }, {
    id: 5,
    title: "6-8 personas",
    description: "Grupos grandes",
    icon: Users,
    categoria: "Desconocidos-6-8",
    image: grupoGrandeImg
  }];
  if (selectedSubCategory) {
    return <div>
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedSubCategory(null)} className="text-sm border-white/20 text-white hover:bg-white/10">
            ← Volver a categorías
          </Button>
          <h3 className="text-xl font-poppins font-bold text-white">
            Desconocidos, {subCategories.find(cat => cat.categoria === selectedSubCategory)?.title}
          </h3>
        </div>
        <BasketCatalog categoria={selectedSubCategory} />
      </div>;
  }
  return <div className="relative min-h-screen space-y-6 bg-cover bg-center bg-no-repeat bg-fixed" style={{
    backgroundImage: `url(${desconocidosBackground})`
  }}>
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10 space-y-6 p-6">
        <div className="text-center mb-8 p-6">
          <h2 className="text-2xl font-poppins font-bold text-white mb-4">
            Experiencias para <span className="text-gold">Desconocidos</span>
          </h2>
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {subCategories.map((subCat, index) => {
          const IconComponent = subCat.icon;
          return <motion.div key={subCat.id} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }}>
                <Button onClick={() => setSelectedSubCategory(subCat.categoria)} variant="outline" className="group w-full h-auto p-6 flex flex-col items-center text-center space-y-3 border-2 hover:border-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 relative overflow-hidden" style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.9)), url(${subCat.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
                  <IconComponent className="w-8 h-8 text-primary relative z-10" />
                  <div className="relative z-10">
                    <h3 className="font-semibold text-primary group-hover:text-[hsl(45,100%,65%)] transition-colors mb-1">{subCat.title}</h3>
                    <p className="text-xs text-muted-foreground">{subCat.description}</p>
                  </div>
                </Button>
              </motion.div>;
        })}
        </div>

        <div className="p-6 text-center">
          <p className="text-sm text-white/90 font-bold">
            <span className="font-bold text-gold">Consejo:</span> Comenzar con <span className="text-gold font-bold">grupos pequeños</span> facilita las <span className="text-gold font-bold">primeras conversaciones,</span> 
            puedes aumentar el tamaño del grupo según tu <span className="text-gold font-bold">comodidad.</span>
          </p>
        </div>
      </div>
    </div>;
};
export default DesconocidosCategory;