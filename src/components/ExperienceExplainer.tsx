import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
const ExperienceExplainer = () => {
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [glowIndex, setGlowIndex] = useState<number | null>(null);
  const cards = [{
    title: <>Productores locales, con <span className="text-gold">máxima excelencia.</span></>,
    content: <></>,
    align: "left"
  }, {
    title: <>Tradición española, con <span className="text-gold">dinámicas modernas.</span></>,
    content: <></>,
    align: "right"
  }, {
    title: <>Los mejores <span className="text-gold">recuerdos se viven,</span> no se graban, lo <span className="text-gold">auténtico nunca sale en cámara.</span></>,
    content: <></>,
    align: "left"
  }, {
    title: <>Hablamos más, pero <span className="text-gold">escuchamos menos,</span> creamos espacios, donde <span className="text-gold">la conversación y el silencio importan.</span></>,
    content: <></>,
    align: "right"
  }, {
    title: <>El tiempo libre no es para <span className="text-gold">desconectar,</span> es para <span className="text-gold">reconectar,</span> conocer es <span className="text-gold">escuchar,</span> compartir es <span className="text-gold">estar.</span></>,
    content: <></>,
    align: "left"
  }];

  // Auto-rotate cards every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCardIndex(prev => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, cards.length]);

  // Auto-open the current card when it changes
  useEffect(() => {
    setOpenCard(currentCardIndex);
  }, [currentCardIndex]);
  const toggleCard = (index: number) => {
    setOpenCard(prev => prev === index ? null : index);
  };
  const handleCardClick = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };
  return <section className="py-24 px-4 bg-[url('/src/assets/experiencia-conecta-bg.jpg')] bg-cover bg-center bg-no-repeat relative before:absolute before:inset-0 before:bg-black/5 before:z-0 min-h-[78vh] flex items-center justify-center" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      <div className="relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          {/* 3D Card Stack with rotation effect */}
          <div className="relative max-w-4xl mx-auto min-h-[300px] perspective-1000 flex items-center justify-center">
            {/* Cards Container */}
            <div className="w-full h-full relative flex items-center justify-center">
            <>
              {cards.map((card, index) => {
              const offset = (index - currentCardIndex + cards.length) % cards.length;
               const isActive = offset === 0;
               const isNext = offset === 1;
               const isPrev = offset === cards.length - 1;
               return <motion.div
                 key={index}
                 initial={false}
                 layout
                 animate={{
                   x: 0,
                   y: isActive ? 0 : isNext ? 100 : isPrev ? -100 : 180,
                   scale: isActive ? 1 : isNext ? 0.96 : isPrev ? 0.94 : 0.9,
                   opacity: isActive ? 1 : isNext ? 0.6 : isPrev ? 0.35 : 0
                 }}
                 transition={{
                   type: "spring",
                   stiffness: 110,
                   damping: 24,
                   mass: 0.9
                 }}
                 className="absolute inset-0 flex items-center justify-center"
                 style={{
                 transformStyle: "preserve-3d",
                   transformOrigin: "50% 50%",
                   zIndex: isActive ? 3 : (isNext || isPrev) ? 2 : 1,
                   pointerEvents: isActive ? "auto" : "none"
                 }}
                 onClick={handleCardClick}
               >
                    <Collapsible open={openCard === index} onOpenChange={() => toggleCard(index)}>
                      <CollapsibleTrigger asChild>
                        <div onMouseEnter={() => {
                      if (glowIndex === null) {
                        setGlowIndex(index);
                        setTimeout(() => setGlowIndex(null), 1000);
                      }
                    }} className={`p-6 transition-all duration-300 group cursor-pointer ${glowIndex === index ? 'shadow-2xl shadow-gold/30' : ''} w-full`}>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-4">
                <h4 className={`text-xl md:text-3xl font-bold text-white ${glowIndex === index ? 'text-gold' : ''} transition-all duration-300 normal-case leading-relaxed`} style={{
                            letterSpacing: "0.02em"
                          }}>
                                  {card.title}
                                </h4>
                              
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="hidden" />
                    </Collapsible>
                  </motion.div>;
            })}
            </>
            </div>
          </div>

          {/* Indicators */}
          
        </div>
      </div>
    </section>;
};
export default ExperienceExplainer;
