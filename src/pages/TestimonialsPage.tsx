import { motion } from "framer-motion";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import testimonialsBackground from "@/assets/testimonials-background.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";
import conversacionNaturalImg from "@/assets/pareja-natural-nueva-clean.jpg";
import amigosExperience from "@/assets/amigos-experience.jpg";
import mesaAbiertaNuevoImg from "@/assets/mesa-abierta-nuevo-clean.jpg";
import parejaExperience from "@/assets/pareja-experience.jpg";
import festinSelectoNuevoImg from "@/assets/festin-selecto-nuevo-clean.jpg";
import familiaExperience from "@/assets/familia-experience.jpg";
import granTertuliaNuevoImg from "@/assets/gran-tertulia-nuevo-clean.jpg";
import grupoMedianoExperience from "@/assets/grupo-mediano-experience.jpg";
const TestimonialsPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const testimonials = [{
    id: 1,
    name: "Carmen Rodríguez",
    location: "Barcelona",
    rating: 5,
    text: <>
          Mi marido y yo llevábamos años sin tener <span className="text-gold font-bold">conversaciones profundas</span>. Esta experiencia <span className="text-gold font-bold">cambió todo</span>. Redescubrimos aspectos de nosotros que habíamos olvidado. Ahora organizamos estas cenas <span className="text-gold font-bold">cada mes</span>.
        </>,
    experience: "Pareja Gourmet",
    image: parejaGourmetImg,
    profileImage: parejaGourmetImg
  }, {
    id: 2,
    name: "Miguel Ángel Santos",
    location: "Madrid",
    rating: 5,
    text: <>
          Organicé una cena con compañeros de trabajo que apenas conocía. Terminamos compartiendo <span className="text-gold font-bold">historias increíbles</span> y creando <span className="text-gold font-bold">amistades reales</span>. El ambiente que se genera es <span className="text-gold font-bold">único</span>.
        </>,
    experience: "Conversación Natural",
    image: conversacionNaturalImg,
    profileImage: amigosExperience
  }, {
    id: 3,
    name: "Ana López",
    location: "Sevilla",
    rating: 5,
    text: <>
          Perfecta para <span className="text-gold font-bold">romper el hielo</span> en una primera cita. Las preguntas están tan bien pensadas que fluye todo <span className="text-gold font-bold">natural</span>. Mi novio y yo seguimos usando algunas <span className="text-gold font-bold">dinámicas</span> en nuestras cenas.
        </>,
    experience: "Mesa Abierta",
    image: mesaAbiertaNuevoImg,
    profileImage: parejaExperience
  }, {
    id: 4,
    name: "Familia González",
    location: "Valencia",
    rating: 5,
    text: <>
          Con tres adolescentes en casa, las cenas familiares se habían vuelto silenciosas. Esta experiencia nos ayudó a <span className="text-gold font-bold">reconectarnos como familia</span>. Ahora todos esperan nuestras <span className="text-gold font-bold">'cenas especiales'</span>.
        </>,
    experience: "Festín Selecto",
    image: festinSelectoNuevoImg,
    profileImage: familiaExperience
  }, {
    id: 5,
    name: "Javier Martín",
    location: "Bilbao",
    rating: 5,
    text: <>
          Era escéptico al principio, pero la <span className="text-gold font-bold">calidad de los productos</span> y las dinámicas me sorprendieron. He repetido ya <span className="text-gold font-bold">tres veces</span> con diferentes grupos de amigos. Cada experiencia es <span className="text-gold font-bold">única</span>.
        </>,
    experience: "Gran Tertulia",
    image: granTertuliaNuevoImg,
    profileImage: grupoMedianoExperience
  }];
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  return <div className="min-h-screen font-work-sans" style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${testimonialsBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
      <Navbar />
      <PageNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center mb-4">
            
            <p className="text-lg sm:text-xl md:text-2xl font-lora font-bold text-white/90 max-w-4xl mx-auto">
              <span className="text-gold">Historias reales</span> de personas que han <span className="text-gold">transformado sus relaciones</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8">
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
            }} className="flex flex-col gap-8 items-center">
                {/* Testimonial content */}
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
                }} className="bg-transparent backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 hover:border-gold hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300 relative overflow-hidden">
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
                    <blockquote className="text-sm sm:text-base lg:text-lg font-lora font-bold text-white/90 leading-relaxed mb-4 sm:mb-6 relative z-10">
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
                        <p className="text-sm font-work-sans font-medium text-gold">
                          {testimonials[currentTestimonial].experience}
                        </p>
                      </div>
                    </div>

                    {/* Decorative gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-gold to-secondary" />
                  </motion.div>
                </div>

                {/* Experience image */}
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
                    <img src={testimonials[currentTestimonial].image} alt={`Experiencia ${testimonials[currentTestimonial].experience}`} className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300 rounded-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
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
                    <h3 className="font-work-sans font-bold text-white text-lg uppercase">
                      Experiencia: {testimonials[currentTestimonial].experience}
                    </h3>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Navigation arrows */}
              <div className="flex justify-center gap-4 mt-12">
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

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => <motion.button key={index} whileHover={{
                scale: 1.2
              }} onClick={() => setCurrentTestimonial(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-gold scale-125' : 'bg-white/30 hover:bg-white/50'}`} />)}
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="mt-20 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gold/20 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-3xl font-cinzel font-bold text-gold mb-2">4.9★</h3>
                  <p className="font-lora font-bold text-white/80">Valoración media</p>
                </div>
                <div>
                  <h3 className="text-3xl font-cinzel font-bold text-gold mb-2">1,200+</h3>
                  <p className="font-lora font-bold text-white/80">Reseñas verificadas</p>
                </div>
                <div>
                  <h3 className="text-3xl font-cinzel font-bold text-gold mb-2">95%</h3>
                  <p className="font-lora font-bold text-white/80">Recomendarían</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-7xl bg-transparent border-0 p-0 shadow-none">
          <Button onClick={() => setIsImageOpen(false)} className="absolute top-4 right-4 z-50 h-14 w-14 rounded-full bg-black/90 hover:bg-gold hover:text-black shadow-2xl transition-all duration-300 border-2 border-white/20" size="icon">
            <motion.div whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.3 }}>
              <X className="w-7 h-7 stroke-[2.5]" />
            </motion.div>
          </Button>
          <img src={testimonials[currentTestimonial].image} alt={`Experiencia ${testimonials[currentTestimonial].experience}`} className="w-full h-auto max-h-[90vh] object-contain rounded-3xl" />
        </DialogContent>
      </Dialog>
    </div>;
};
export default TestimonialsPage;