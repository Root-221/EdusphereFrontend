import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Calendar,
  Clock,
  CheckCircle,
  Grid3X3,
  List,
  Filter,
  BookOpen,
  Trophy,
  X
} from 'lucide-react';

// Mock data for assignments
const mockAssignments = [
  { 
    id: '1', 
    title: 'Exercices Chapitre 5', 
    subject: 'Mathématiques', 
    dueDate: '15/02/2025', 
    status: 'pending',
    description: 'Exercices 1 à 15 du chapitre 5 sur les fonctions logarithmes. À rendre sur feuille.',
    coefficient: 4,
    note: null,
    maxNote: 20
  },
  { 
    id: '2', 
    title: 'Dissertation', 
    subject: 'Français', 
    dueDate: '18/02/2025', 
    status: 'pending',
    description: 'Dissertation sur le thème de la solitude dans les œuvres romantiques. 2 pages minimum.',
    coefficient: 3,
    note: null,
    maxNote: 20
  },
  { 
    id: '3', 
    title: 'Exposé', 
    subject: 'Histoire', 
    dueDate: '20/02/2025', 
    status: 'pending',
    description: 'Présentation orale sur la décolonisation en Afrique. Support PowerPoint requis.',
    coefficient: 2,
    note: null,
    maxNote: 20
  },
  { 
    id: '4', 
    title: 'Devoir Maison', 
    subject: 'Physique', 
    dueDate: '10/02/2025', 
    status: 'completed',
    description: 'Problèmes de mécanique quantique. Calculs et justifications détaillés.',
    coefficient: 4,
    note: 16,
    maxNote: 20
  },
  { 
    id: '5', 
    title: 'Lecture analytique', 
    subject: 'Français', 
    dueDate: '05/02/2025', 
    status: 'completed',
    description: 'Lecture et analyse de "Les Fleurs du Mal" de Baudelaire.',
    coefficient: 2,
    note: 14,
    maxNote: 20
  },
  { 
    id: '6', 
    title: 'Vocabulaire', 
    subject: 'Anglais', 
    dueDate: '08/02/2025', 
    status: 'completed',
    description: 'Liste de 50 mots à apprendre et utiliser dans des phrases.',
    coefficient: 1,
    note: 18,
    maxNote: 20
  },
];

const subjects = ['Toutes les matières', 'Mathématiques', 'Français', 'Physique', 'Anglais', 'Histoire', 'Géographie'];
const semesters = ['Semestre 1', 'Semestre 2'];
const statuses = ['all', 'pending', 'completed'];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending': return <Badge variant="secondary">À faire</Badge>;
    case 'completed': return <Badge className="bg-success/20 text-success">Terminé</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function StudentAssignments() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Semestre 2');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<typeof mockAssignments[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter assignments
  const filteredAssignments = mockAssignments.filter(assignment => {
    if (selectedSubject !== 'all' && assignment.subject !== selectedSubject) return false;
    if (selectedStatus !== 'all' && assignment.status !== selectedStatus) return false;
    return true;
  });

  const handleViewAssignment = (assignment: typeof mockAssignments[0]) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleMarkAsDone = (id: string) => {
    console.log('Mark as done:', id);
  };

  const pendingCount = mockAssignments.filter(a => a.status === 'pending').length;
  const completedCount = mockAssignments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Mes Devoirs</h1>
        <p className="text-sm text-muted-foreground">
          Vos devoirs à faire ({pendingCount} en attente)
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject === 'Toutes les matières' ? 'all' : subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">À faire</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAssignments.length} devoir{filteredAssignments.length !== 1 ? 's' : ''} trouvé{filteredAssignments.length !== 1 ? 's' : ''}
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

      {/* Assignments Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewAssignment(assignment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{assignment.subject}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>À rendre: {assignment.dueDate}</span>
                </div>
                {assignment.note !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="font-medium">{assignment.note}/{assignment.maxNote}</span>
                  </div>
                )}
                {assignment.status === 'pending' && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsDone(assignment.id);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme fait
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewAssignment(assignment)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{assignment.dueDate}</span>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {selectedAssignment.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedAssignment.subject} • Coefficient: {selectedAssignment.coefficient}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Date limite: <strong>{selectedAssignment.dueDate}</strong></span>
                  </div>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.description}</p>
                </div>

                {selectedAssignment.note !== null && (
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-success" />
                      <span className="font-medium">Note obtained</span>
                    </div>
                    <span className="text-2xl font-bold text-success">
                      {selectedAssignment.note}/{selectedAssignment.maxNote}
                    </span>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedAssignment.status === 'pending' && (
                  <Button 
                    onClick={() => handleMarkAsDone(selectedAssignment.id)}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
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

