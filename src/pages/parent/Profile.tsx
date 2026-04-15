import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { parentApi } from '@/lib/api-parent';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User,
  Mail,
  Phone,
  Users,
  Edit,
  LogOut,
  Camera,
  Upload,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ParentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['parent', 'profile'],
    queryFn: parentApi.getProfile,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  // Sync state with dynamic profile data
  useEffect(() => {
    if (profile?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        email: profile.user.email,
        phone: profile.user.phone || '',
      }));
    }
  }, [profile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    // Simulate API call
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès.",
      variant: "default",
    });
    setIsEditModalOpen(false);
  };

  const handleUploadPhoto = () => {
    // Simulate photo upload
    toast({
      title: "Photo mise à jour",
      description: "Votre photo de profil a été mise à jour avec succès.",
      variant: "default",
    });
    setIsPhotoModalOpen(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => setIsPhotoModalOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-bold">{profile?.user?.firstName || user.firstName} {profile?.user?.lastName || user.lastName}</h2>
            <p className="text-muted-foreground">{profile?.user?.email || user.email}</p>
            <div className="flex flex-col items-center gap-1 mt-2">
              <Badge variant="secondary">Parent</Badge>
              {profile?.profile?.profession && (
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{profile.profile.profession}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{profile?.user?.phone || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Enfants inscrits</p>
              <p className="font-medium">{profile?.children?.length || 0} enfant(s)</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Modifier le profil
          </Button>
          <Button 
            variant="destructive" 
            className="w-full gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier le profil
            </DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProfile}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Changer la photo de profil
            </DialogTitle>
            <DialogDescription>
              Téléchargez une nouvelle photo de profil
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez pour télécharger une photo
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou GIF. Taille max: 2MB
              </p>
              <Button variant="outline" className="mt-4">
                Parcourir
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm">Simulation: Le téléchargement fonctionne!</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUploadPhoto}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

