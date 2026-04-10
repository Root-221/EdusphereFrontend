import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users,
  Award,
  FileText,
  ChevronRight,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Wallet,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock children data
const children = [
  { 
    id: '1', 
    name: 'Oumar Fall', 
    class: 'Terminale S1', 
    average: 14.5, 
    rank: 5, 
    totalStudents: 35,
    attendance: 92,
    paymentStatus: 'paid'
  },
  { 
    id: '2', 
    name: 'Aïssatou Fall', 
    class: '3ème A', 
    average: 16.2, 
    rank: 2, 
    totalStudents: 40,
    attendance: 96,
    paymentStatus: 'pending'
  },
];

const getGradeColor = (average: number) => {
  if (average >= 14) return 'text-success';
  if (average >= 10) return 'text-warning';
  return 'text-destructive';
};

const getPaymentBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-success/20 text-success">À jour</Badge>;
    case 'pending':
      return <Badge className="bg-warning/20 text-warning">En attente</Badge>;
    case 'overdue':
      return <Badge className="bg-destructive/20 text-destructive">En retard</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Children() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState<typeof children[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = (child: typeof children[0]) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Mes Enfants</h1>
        <p className="text-sm text-muted-foreground">
          Suivez la scolarité de vos enfants
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

      {/* GRID View (Default) */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {child.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">{child.class}</p>
                    </div>
                  </div>
                  {getPaymentBadge(child.paymentStatus)}
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Award className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className={`text-lg font-bold ${getGradeColor(child.average)}`}>{child.average}</p>
                    <p className="text-xs text-muted-foreground">/20</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{child.rank}°</p>
                    <p className="text-xs text-muted-foreground">/{child.totalStudents}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{child.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Présence</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => navigate('/children-grades')}
                  >
                    <Award className="h-4 w-4" />
                    Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => navigate('/children-bulletins')}
                  >
                    <FileText className="h-4 w-4" />
                    Bulletin
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleViewDetails(child)}
                  >
                    Détails
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
            <Card key={child.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {child.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">{child.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Moyenne</p>
                      <p className={`text-lg font-bold ${getGradeColor(child.average)}`}>{child.average}/20</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Rang</p>
                      <p className="text-lg font-bold">{child.rank}°/{child.totalStudents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Paiement</p>
                      {getPaymentBadge(child.paymentStatus)}
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
        <DialogContent className="sm:max-w-[500px]">
          {selectedChild && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {selectedChild.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg">{selectedChild.name}</p>
                    <p className="text-sm text-muted-foreground font-normal">{selectedChild.class}</p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Informations détaillées de l'enfant
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-success">{selectedChild.average}/20</p>
                    <p className="text-sm text-muted-foreground">Moyenne générale</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{selectedChild.rank}°/{selectedChild.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Classement</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Présence</span>
                    </div>
                    <span className="font-bold">{selectedChild.attendance}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Paiement</span>
                    </div>
                    {getPaymentBadge(selectedChild.paymentStatus)}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate('/children-grades');
                  }}
                >
                  <Award className="h-4 w-4" />
                  Voir les notes
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate('/children-bulletins');
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Voir le bulletin
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

