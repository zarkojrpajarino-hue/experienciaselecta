import { useState, useEffect } from "react";
import { User, Mail, MapPin, Phone, Edit2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface UserProfileDropdownProps {
  user: any;
  profile: any;
  onProfileUpdate: () => void;
}

const profileSchema = z.object({
  name: z.string().trim().max(100, "El nombre debe tener menos de 100 caracteres"),
  phone: z.string().trim().max(20, "El teléfono debe tener menos de 20 caracteres").regex(/^[+\d\s()-]*$/, "Formato de teléfono inválido").optional().or(z.literal('')),
  address_line1: z.string().trim().max(255, "La dirección debe tener menos de 255 caracteres"),
  address_line2: z.string().trim().max(255, "La dirección debe tener menos de 255 caracteres").optional().or(z.literal('')),
  city: z.string().trim().max(100, "El nombre de la ciudad debe tener menos de 100 caracteres"),
  postal_code: z.string().trim().max(20, "El código postal debe tener menos de 20 caracteres"),
  country: z.string().trim().max(100, "El nombre del país debe tener menos de 100 caracteres")
});

export const UserProfileDropdown = ({ user, profile, onProfileUpdate }: UserProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    address_line1: profile?.address_line1 || "",
    address_line2: profile?.address_line2 || "",
    city: profile?.city || "",
    postal_code: profile?.postal_code || "",
    country: profile?.country || "España",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name || "",
        phone: profile.phone || "",
        address_line1: profile.address_line1 || "",
        address_line2: profile.address_line2 || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "España",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      // Validate input before sending to database
      const validationResult = profileSchema.safeParse(editedProfile);
      
      if (!validationResult.success) {
        toast({
          title: "Error de validación",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update(validationResult.data)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente.",
      });
      setIsEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (editedProfile.name) {
      const names = editedProfile.name.trim().split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-transparent transition-all duration-300"
      >
        <Avatar className="w-10 h-10 border-2 border-white">
          <AvatarFallback className="bg-transparent text-white font-bold">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold text-white">
            {editedProfile.name || user?.email?.split("@")[0]}
          </p>
          <p className="text-xs text-white/70">{user?.email}</p>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(271,100%,20%)]">
              <User className="w-5 h-5" />
              Mi Perfil
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-20 h-20 border-4 border-[hsl(45,100%,65%)]">
                <AvatarFallback className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] font-bold text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-[hsl(271,100%,20%)]">
                  {editedProfile.name || "Usuario"}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="flex justify-end gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2 bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(271,100%,20%)]"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar datos
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile({
                        name: profile?.name || "",
                        phone: profile?.phone || "",
                        address_line1: profile?.address_line1 || "",
                        address_line2: profile?.address_line2 || "",
                        city: profile?.city || "",
                        postal_code: profile?.postal_code || "",
                        country: profile?.country || "España",
                      });
                    }}
                    variant="ghost"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4" />
                    Guardar cambios
                  </Button>
                </>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[hsl(271,100%,20%)]">
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-[hsl(271,100%,20%)]">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={editedProfile.phone}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-[hsl(271,100%,20%)] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección de envío
                </h4>

                <div>
                  <Label htmlFor="address_line1" className="text-[hsl(271,100%,20%)]">
                    Dirección (línea 1)
                  </Label>
                  <Input
                    id="address_line1"
                    value={editedProfile.address_line1}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address_line1: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address_line2" className="text-[hsl(271,100%,20%)]">
                    Dirección (línea 2) - Opcional
                  </Label>
                  <Input
                    id="address_line2"
                    value={editedProfile.address_line2}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address_line2: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-[hsl(271,100%,20%)]">
                      Ciudad
                    </Label>
                    <Input
                      id="city"
                      value={editedProfile.city}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, city: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal_code" className="text-[hsl(271,100%,20%)]">
                      Código postal
                    </Label>
                    <Input
                      id="postal_code"
                      value={editedProfile.postal_code}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          postal_code: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-[hsl(271,100%,20%)]">
                    País
                  </Label>
                  <Input
                    id="country"
                    value={editedProfile.country}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, country: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
