import { motion } from "framer-motion";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import testimonialsBg from "@/assets/testimonials-background.jpg";

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Carmen Rodríguez",
      location: "Barcelona",
      rating: 5,
      text: "Mi marido y yo llevábamos años sin tener conversaciones profundas, esta experiencia cambió todo, redescubrimos aspectos de nosotros que habíamos olvidado, ahora organizamos estas cenas cada mes.",
      experience: "Pareja Premium",
      image: "/src/assets/pareja-premium.jpg"
    },
    {
      id: 2,
      name: "Miguel Ángel Santos",
      location: "Madrid",
      rating: 5,
      text: "Organicé una cena con compañeros de trabajo que apenas conocía, terminamos compartiendo historias increíbles y creando amistades reales, el ambiente que se genera es único.",
      experience: "Cuarteto Social",
      image: "/src/assets/cuarteto-social.png"
    },
    {
      id: 3,
      name: "Ana López",
      location: "Sevilla",
      rating: 5,
      text: "Perfecta para romper el hielo en una primera cita, las preguntas están tan bien pensadas que fluye todo natural, mi novio y yo seguimos usando algunas dinámicas en nuestras cenas.",
      experience: "Primer Encuentro",
      image: "/src/assets/primer-encuentro.png"
    },
    {
      id: 4,
      name: "Familia González",
      location: "Valencia",
      rating: 5,
      text: "Con tres adolescentes en casa, las cenas familiares se habían vuelto silenciosas, esta experiencia nos ayudó a reconectarnos como familia, ahora todos esperan nuestras cenas especiales.",
      experience: "Dehesa Familiar",
      image: "/src/assets/dehesa-familiar.jpg"
    },
    {
      id: 5,
      name: "Javier Martín",
      location: "Bilbao",
      rating: 5,
      text: "Era escéptico al principio, pero la calidad de los productos y las dinámicas me sorprendieron, he repetido ya tres veces con diferentes grupos de amigos, cada experiencia es única.",
      experience: "Gran Tertulia",
      image: "/src/assets/gran-tertulia.jpg"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section 
      id="testimonios" 
      className="py-10 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${testimonialsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, type: "spring", stiffness: 55, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-cormorant font-light italic text-white tracking-wide"
            >
              Lo que dicen nuestros
            </motion.h2>
            
            <motion.span 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.7,
                type: "spring",
                stiffness: 100
              }}
              className="text-5xl md:text-7xl font-cinzel font-black text-gold tracking-wider relative inline-block"
              style={{
                textShadow: "0 0 30px rgba(218, 165, 32, 0.5), 0 0 60px rgba(218, 165, 32, 0.3)"
              }}
            >
              clientes
            </motion.span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-work-sans font-bold text-white max-w-3xl mx-auto mt-6">
            <span className="text-gold">Historias reales</span> de personas que han <span className="text-gold">transformado sus relaciones</span>
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Main testimonial */}
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8 items-center"
            >
              {/* Testimonial content */}
              <div className="relative w-full max-w-3xl">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-card/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border/50 hover:border-gold hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Quote icon */}
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 0.1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="absolute top-4 right-4"
                  >
                    <Quote className="w-16 h-16 text-primary" />
                  </motion.div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-5 h-5 fill-gold text-gold" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <blockquote className="text-lg font-work-sans text-primary/90 leading-relaxed mb-6 relative z-10 normal-case first-letter:uppercase">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>

                  {/* Author info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <cite className="text-lg font-poppins font-semibold text-primary not-italic">
                        {testimonials[currentTestimonial].name}
                      </cite>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[currentTestimonial].location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-poppins font-medium text-secondary">
                        {testimonials[currentTestimonial].experience}
                      </p>
                    </div>
                  </div>

                  {/* Decorative gradient */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-gold to-secondary" />
                </motion.div>
              </div>

              {/* Experience image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative w-full max-w-3xl"
              >
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={testimonials[currentTestimonial].image}
                    alt={`Experiencia ${testimonials[currentTestimonial].experience}.`}
                    className="w-full h-80 object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                  
                  {/* Experience label */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute bottom-6 left-6 right-6"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                      <h3 className="font-poppins font-bold text-primary text-lg">
                        Experiencia: {testimonials[currentTestimonial].experience}
                      </h3>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Navigation arrows */}
            <div className="flex justify-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-gold hover:text-gold/80 rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-gold hover:text-gold/80 rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-gold/20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-3xl font-poppins font-bold text-primary mb-2">4.9★</h3>
                <p className="font-work-sans text-muted-foreground">Valoración media</p>
              </div>
              <div>
                <h3 className="text-3xl font-poppins font-bold text-primary mb-2">1,200+</h3>
                <p className="font-work-sans text-muted-foreground">Reseñas verificadas</p>
              </div>
              <div>
                <h3 className="text-3xl font-poppins font-bold text-primary mb-2">95%</h3>
                <p className="font-work-sans text-muted-foreground">Recomendarían</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;