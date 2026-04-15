import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Grid3X3,
  List,
  ChevronRight,
  Loader2,
  BookOpen,
  User,
  Fingerprint,
  MapPin,
  Cake
} from 'lucide-react';
import { parentApi } from '@/lib/api-parent';

export default function Children() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['parent', 'profile'],
    queryFn: parentApi.getProfile,
  });

  const children = profileData?.children || [];
  const [selectedChild, setSelectedChild] = useState<typeof children[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (child: typeof children[0]) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Mes Enfants</h1>
        <p className="text-sm text-muted-foreground">
          Gérez l'identité et les informations de vos enfants inscrits
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {children.length} enfant{children.length !== 1 ? 's' : ''} inscrit{children.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* GRID View */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {child.firstName[0]}{child.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{child.firstName} {child.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{child.class?.name || 'En attente d\'affectation'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Fingerprint className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-bold truncate px-1" title={child.matricule ?? 'Non attribué'}>
                      {child.matricule ?? 'Non attribué'}
                    </p>
                    <p className="text-xs text-muted-foreground">Matricule</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-bold truncate">
                      {child.class?.level || 'Non assigné'}
                    </p>
                    <p className="text-xs text-muted-foreground">Niveau</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleViewDetails(child)}
                  >
                    Voir l'identité complète
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST View */
        <div className="space-y-2">
          {children.map((child) => (
            <Card key={child.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(child)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {child.firstName[0]}{child.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{child.firstName} {child.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{child.class?.name || 'En attente d\'affectation'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-muted-foreground">Matricule</p>
                      <p className="text-sm font-bold">{child.matricule ?? 'Non attribué'}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Child Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedChild && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg">{selectedChild.firstName} {selectedChild.lastName}</p>
                    <p className="text-sm text-muted-foreground font-normal">{selectedChild.class?.name || 'Classe non assignée'}</p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Carte d'identification de l'élève
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Matricule</span>
                    </div>
                    <span className="font-bold">{selectedChild.matricule ?? 'Non attribué'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Genre</span>
                    </div>
                    <span className="font-bold">
                      {selectedChild.gender === 'M' || selectedChild.gender === 'male' 
                        ? 'Masculin' 
                        : (selectedChild.gender === 'F' || selectedChild.gender === 'female' 
                          ? 'Féminin' 
                          : 'Non spécifié')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Niveau d'étude</span>
                    </div>
                    <span className="font-bold">{selectedChild.class?.level ?? 'Non assigné'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cake className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Date de naissance</span>
                    </div>
                    <span className="font-bold">{selectedChild.dateOfBirth ? new Date(selectedChild.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Adresse</span>
                    </div>
                    <span className="font-bold text-right truncate max-w-[200px]" title={selectedChild.address || ''}>{selectedChild.address || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  className="w-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
