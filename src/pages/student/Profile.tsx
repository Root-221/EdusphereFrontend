import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  User,
  Mail,
  Phone,
  School,
  Calendar,
  Edit,
  LogOut,
  Camera,
  Upload,
  BookOpen,
  Clock,
  Scan,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { attendanceApi } from '@/services/attendance';
import { useQuery } from '@tanstack/react-query';

// Mock additional student data
const mockStudentInfo = {
  class: 'Terminale S1',
  academicYear: '2024-2025',
  activeSemester: 'Semestre 2',
  studentId: 'ELV-2024-001',
  dateOfBirth: '15/05/2006',
  address: '123 Rue de la Paix, Dakar',
  phone: '+221 77 123 45 67',
  parentName: 'Mamadou Fall',
  parentPhone: '+221 77 987 65 43',
};

export default function StudentProfile() {
  const { user, logout } = useAuth();
  

  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: mockStudentInfo.phone,
    address: mockStudentInfo.address,
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', editedInfo);
    setIsEditModalOpen(false);
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été enregistrées avec succès.',
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploadingPhoto(false);
        toast({
          title: 'Photo mise à jour',
          description: 'Votre photo de profil a été mise à jour avec succès.',
        });
      }, 1500);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
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

      {/* Profile Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={triggerPhotoUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">Élève</Badge>
              {user.isClassLeader && <Badge className="bg-amber-500 hover:bg-amber-600">Délégué de classe</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
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
                <p className="font-medium">{mockStudentInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date de naissance</p>
                <p className="font-medium">{mockStudentInfo.dateOfBirth}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <School className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{mockStudentInfo.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informations Scolaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <School className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Classe</p>
                <p className="font-medium">{mockStudentInfo.class}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Année académique</p>
                <p className="font-medium">{mockStudentInfo.academicYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Semestre actif</p>
                <p className="font-medium">{mockStudentInfo.activeSemester}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-medium">{mockStudentInfo.studentId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parent Info */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations du Parent/Tuteur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom du parent</p>
                <p className="font-medium">{mockStudentInfo.parentName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{mockStudentInfo.parentPhone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          {user.isClassLeader && (
            <Button 
              variant="secondary" 
              className="w-full gap-2"
              onClick={() => navigate('/teacher-attendance')}
            >
              <Scan className="h-4 w-4" />
              Ouvrir l'appel de classe
            </Button>
          )}
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={editedInfo.firstName}
                  onChange={(e) => setEditedInfo({...editedInfo, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={editedInfo.lastName}
                  onChange={(e) => setEditedInfo({...editedInfo, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedInfo.email}
                onChange={(e) => setEditedInfo({...editedInfo, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={editedInfo.phone}
                onChange={(e) => setEditedInfo({...editedInfo, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={editedInfo.address}
                onChange={(e) => setEditedInfo({...editedInfo, address: e.target.value})}
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
    </div>
  );
}
