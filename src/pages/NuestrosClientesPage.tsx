import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import nuestrosClientesBg from "@/assets/nuestros-clientes-bg.png";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-2.jpg";
import conversacionNaturalImg from "@/assets/conversacion-natural-original.jpg";
import amigosExperience from "@/assets/amigos-experience.jpg";
import mesaAbiertaNuevoImg from "@/assets/mesa-abierta-nuevo.jpg";
import parejaExperience from "@/assets/pareja-experience.jpg";
import festinSelectoNuevoImg from "@/assets/festin-selecto-nuevo.jpg";
import familiaExperience from "@/assets/familia-experience.jpg";
import granTertuliaNuevoImg from "@/assets/gran-tertulia-nuevo.jpg";
import grupoMedianoExperience from "@/assets/grupo-mediano-experience.jpg";
const NuestrosClientesPage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);
  const testimonials = [{
    id: 1,
    name: "Carmen Rodríguez",
    location: "Barcelona",
    rating: 5,
    text: "Mi marido y yo llevábamos años sin tener conversaciones profundas. esta experiencia cambió todo. redescubrimos aspectos de nosotros que habíamos olvidado. ahora organizamos estas cenas cada mes.",
    experience: "PAREJA GOURMET",
    image: parejaGourmetImg,
    profileImage: parejaGourmetImg
  }, {
    id: 2,
    name: "Miguel Ángel Santos",
    location: "Madrid",
    rating: 5,
    text: "Organicé una cena con compañeros de trabajo que apenas conocía. terminamos compartiendo historias increíbles y creando amistades reales. el ambiente que se genera es único.",
    experience: "CONVERSACIÓN NATURAL",
    image: conversacionNaturalImg,
    profileImage: amigosExperience
  }, {
    id: 3,
    name: "Ana López",
    location: "Sevilla",
    rating: 5,
    text: "Perfecta para romper el hielo en una primera cita. las preguntas están tan bien pensadas que fluye todo natural. mi novio y yo seguimos usando algunas dinámicas en nuestras cenas.",
    experience: "MESA ABIERTA",
    image: mesaAbiertaNuevoImg,
    profileImage: parejaExperience
  }, {
    id: 4,
    name: "Familia González",
    location: "Valencia",
    rating: 5,
    text: "Con tres adolescentes en casa, las cenas familiares se habían vuelto silenciosas. esta experiencia nos ayudó a reconectarnos como familia. ahora todos esperan nuestras 'cenas especiales'.",
    experience: "FESTÍN SELECTO",
    image: festinSelectoNuevoImg,
    profileImage: familiaExperience
  }, {
    id: 5,
    name: "Javier Martín",
    location: "Bilbao",
    rating: 5,
    text: "Era escéptico al principio, pero la calidad de los productos y las dinámicas me sorprendieron. he repetido ya tres veces con diferentes grupos de amigos. cada experiencia es única.",
    experience: "GRAN TERTULIA",
    image: granTertuliaNuevoImg,
    profileImage: grupoMedianoExperience
  }];
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  return <div className="min-h-screen relative">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0" style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${nuestrosClientesBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} />
      
      {/* Scrollable content */}
      <div className="relative z-10 min-h-screen">
        
        {/* Hero Section with Back Button */}
        <section className="relative pt-8 pb-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5
          }} className="mb-4">
              <Button onClick={() => navigate("/#categoria-cestas")} variant="ghost" className="text-white hover:text-gold transition-colors hover:bg-transparent bg-transparent">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-0 pb-20 -mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="relative">
                {/* Main testimonial */}
                <motion.div key={currentTestimonial} initial={{
                opacity: 0,
                x: 50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -50
              }} transition={{
                duration: 0.5
              }} className="flex flex-col gap-6 items-center">
                  
                  {/* 1. Experience image - FIRST */}
                  <motion.div initial={{
                  opacity: 0,
                  scale: 0.9
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} transition={{
                  delay: 0.3,
                  duration: 0.6
                }} className="relative cursor-pointer group w-full max-w-3xl" onClick={() => setIsImageOpen(true)}>
                    <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-shadow duration-300">
                      <img src={testimonials[currentTestimonial].image} alt={`experiencia ${testimonials[currentTestimonial].experience}`} className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300 rounded-3xl" />
                    </div>
                    
                    {/* Experience label below image */}
                    <motion.div initial={{
                    y: 20,
                    opacity: 0
                  }} animate={{
                    y: 0,
                    opacity: 1
                  }} transition={{
                    delay: 0.7,
                    duration: 0.5
                  }} className="mt-4 text-center">
                      <h3 className="font-work-sans font-bold text-white text-lg lowercase first-letter:uppercase">
                        experiencia: <span className="uppercase">{testimonials[currentTestimonial].experience}</span>
                      </h3>
                    </motion.div>
                  </motion.div>

                  {/* 2. Navigation arrows - SECOND (IN THE MIDDLE) */}
                  <div className="flex justify-center gap-4">
                    <motion.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={prevTestimonial} className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-white hover:text-gold rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0">
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    
                    <motion.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={nextTestimonial} className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-white hover:text-gold rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0">
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* 3. Testimonial content - THIRD (AT THE BOTTOM) */}
                  <div className="relative w-full max-w-3xl">
                    <motion.div initial={{
                    scale: 0.8,
                    opacity: 0
                  }} animate={{
                    scale: 1,
                    opacity: 1
                  }} transition={{
                    delay: 0.2,
                    duration: 0.5
                  }} className="p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl">
                      {/* Quote icon */}
                      <motion.div initial={{
                      rotate: -180,
                      opacity: 0
                    }} animate={{
                      rotate: 0,
                      opacity: 0.1
                    }} transition={{
                      delay: 0.4,
                      duration: 0.6
                    }} className="absolute top-4 right-4">
                        <Quote className="w-16 h-16 text-white" />
                      </motion.div>

                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => <motion.div key={i} initial={{
                        scale: 0,
                        rotate: -180
                      }} animate={{
                        scale: 1,
                        rotate: 0
                      }} transition={{
                        delay: 0.6 + i * 0.1,
                        duration: 0.3
                      }}>
                            <Star className="w-5 h-5 fill-gold text-gold" />
                          </motion.div>)}
                      </div>

                      {/* Testimonial text */}
                      <blockquote className="text-sm sm:text-base lg:text-lg font-lora text-white leading-relaxed mb-4 sm:mb-6 relative z-10 capitalize">
                        "{testimonials[currentTestimonial].text}"
                      </blockquote>

                      {/* Author info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <cite className="text-lg font-work-sans font-semibold text-white not-italic">
                            {testimonials[currentTestimonial].name}
                          </cite>
                          <p className="text-sm text-white/70">
                            {testimonials[currentTestimonial].location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-work-sans font-medium text-gold uppercase">
                            {testimonials[currentTestimonial].experience}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-5xl bg-white/95 p-2 border-0">
          <img 
            src={testimonials[currentTestimonial].image} 
            alt={`experiencia ${testimonials[currentTestimonial].experience}`}
            className="w-full h-[70vh] object-contain rounded-3xl"
            style={{ borderRadius: "1.5rem" }}
          />
        </DialogContent>
      </Dialog>
      
    </div>;
};
export default NuestrosClientesPage;
