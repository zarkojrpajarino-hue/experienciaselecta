import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Mail, User, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  message: z.string().trim().min(1, "El mensaje es requerido").max(1000),
});

interface ContactModalProps {
  children: React.ReactNode;
}

const ContactModal = ({ children }: ContactModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load user data when modal opens
  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.name || '',
          email: user.email || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    }
  };

  // Load user data when modal opens
  useEffect(() => {
    if (open) {
      loadUserData();
    }
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Sending contact email with data:', { ...formData, message: formData.message.substring(0, 50) + '...' });
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw new Error(error.message);
      }

      console.log('Contact email sent successfully:', data);

      toast({
        title: "¡Mensaje enviado!",
        description: "Hemos recibido tu consulta. Te responderemos pronto.",
      });

      // Reset form
      setFormData({ name: "", email: "", message: "" });
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending contact:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu consulta. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl">
        <div className="relative p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-primary mb-2">
              Contáctanos
            </h2>
            <p className="text-muted-foreground font-work-sans">
              ¿Tienes alguna pregunta? Nos encantaría ayudarte
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-work-sans font-medium text-primary">
                <User className="w-4 h-4" />
                Nombre
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Tu nombre completo"
                className={`bg-background/50 border-border/50 focus:border-primary ${
                  errors.name ? "border-destructive" : ""
                }`}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-work-sans font-medium text-primary">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="tu@email.com"
                className={`bg-background/50 border-border/50 focus:border-primary ${
                  errors.email ? "border-destructive" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-work-sans font-medium text-primary">
                <MessageCircle className="w-4 h-4" />
                Mensaje
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Cuéntanos tu pregunta o feedback..."
                rows={4}
                className={`bg-background/50 border-border/50 focus:border-primary resize-none ${
                  errors.message ? "border-destructive" : ""
                }`}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </motion.div>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;