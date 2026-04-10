import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download,
  Grid3X3,
  List,
  Filter,
  Calendar,
  Trophy,
  Award,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';

// Mock children data
const children = [
  { id: '1', name: 'Oumar Fall', class: 'Terminale S1' },
  { id: '2', name: 'Aïssatou Fall', class: '3ème A' },
];

// Mock bulletins for Oumar
const oumarBulletins = [
  { 
    id: '1', 
    semester: 'Semestre 2', 
    academicYear: '2024-2025', 
    average: 14.5, 
    status: 'available', 
    date: '05/02/2025',
    ranking: '5/35',
    appreciation: 'Excellente année. Continuez ainsi!',
    subjects: [
      { name: 'Mathématiques', average: 15.0, coefficient: 4 },
      { name: 'Français', average: 14.0, coefficient: 4 },
      { name: 'Physique', average: 15.5, coefficient: 3 },
      { name: 'Anglais', average: 16.0, coefficient: 2 },
      { name: 'Histoire', average: 12.5, coefficient: 2 },
      { name: 'SVT', average: 14.5, coefficient: 3 },
    ]
  },
  { 
    id: '2', 
    semester: 'Semestre 1', 
    academicYear: '2024-2025', 
    average: 14.2, 
    status: 'available', 
    date: '15/01/2025',
    ranking: '8/35',
    appreciation: 'Bon travail. Vous progressez bien.',
    subjects: [
      { name: 'Mathématiques', average: 14.5, coefficient: 4 },
      { name: 'Français', average: 13.5, coefficient: 4 },
      { name: 'Physique', average: 15.0, coefficient: 3 },
      { name: 'Anglais', average: 15.5, coefficient: 2 },
      { name: 'Histoire', average: 13.0, coefficient: 2 },
      { name: 'SVT', average: 14.0, coefficient: 3 },
    ]
  },
  { 
    id: '3', 
    semester: 'Semestre 2', 
    academicYear: '2023-2024', 
    average: 13.8, 
    status: 'archived', 
    date: '30/06/2024',
    ranking: '12/32',
    appreciation: 'Année satisfaisante. Continuez vos efforts.',
    subjects: [
      { name: 'Mathématiques', average: 14.0, coefficient: 4 },
      { name: 'Français', average: 13.0, coefficient: 4 },
      { name: 'Physique', average: 14.5, coefficient: 3 },
      { name: 'Anglais', average: 14.0, coefficient: 2 },
      { name: 'Histoire', average: 13.5, coefficient: 2 },
      { name: 'SVT', average: 13.5, coefficient: 3 },
    ]
  },
];

// Mock bulletins for Aïssatou
const aissatouBulletins = [
  { 
    id: '1', 
    semester: 'Semestre 2', 
    academicYear: '2024-2025', 
    average: 16.2, 
    status: 'available', 
    date: '05/02/2025',
    ranking: '2/40',
    appreciation: 'Excellents résultats! Continuez.',
    subjects: [
      { name: 'Mathématiques', average: 16.5, coefficient: 4 },
      { name: 'Français', average: 15.5, coefficient: 4 },
      { name: 'Anglais', average: 17.0, coefficient: 2 },
      { name: 'Histoire', average: 15.5, coefficient: 2 },
      { name: 'Physique', average: 16.0, coefficient: 3 },
      { name: 'SVT', average: 16.5, coefficient: 3 },
    ]
  },
  { 
    id: '2', 
    semester: 'Semestre 1', 
    academicYear: '2024-2025', 
    average: 15.8, 
    status: 'available', 
    date: '15/01/2025',
    ranking: '3/40',
    appreciation: 'Très bon travail.',
    subjects: [
      { name: 'Mathématiques', average: 16.0, coefficient: 4 },
      { name: 'Français', average: 15.0, coefficient: 4 },
      { name: 'Anglais', average: 16.5, coefficient: 2 },
      { name: 'Histoire', average: 15.0, coefficient: 2 },
      { name: 'Physique', average: 16.0, coefficient: 3 },
      { name: 'SVT', average: 15.5, coefficient: 3 },
    ]
  },
];

const academicYears = ['2024-2025', '2023-2024'];
const semesters = ['Tous les semestres', 'Semestre 1', 'Semestre 2'];

const getGradeColor = (grade: number) => {
  if (grade >= 14) return 'text-success';
  if (grade >= 10) return 'text-warning';
  return 'text-destructive';
};

const getBulletinsData = (childId: string) => {
  return childId === '1' ? oumarBulletins : aissatouBulletins;
};

const getChildInfo = (childId: string) => {
  return children.find(c => c.id === childId);
};

export default function ChildrenBulletins() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState('1');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedBulletin, setSelectedBulletin] = useState<typeof oumarBulletins[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentChild = getChildInfo(selectedChild);
  const bulletinsData = getBulletinsData(selectedChild);

  // Filter bulletins
  const filteredBulletins = bulletinsData.filter(bulletin => {
    if (selectedYear !== 'all' && bulletin.academicYear !== selectedYear) return false;
    if (selectedSemester !== 'all' && bulletin.semester !== selectedSemester) return false;
    return true;
  });

  const handleViewBulletin = (bulletin: typeof oumarBulletins[0]) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = (bulletin: typeof oumarBulletins[0]) => {
    console.log('Download PDF:', bulletin.id);
    alert(`Téléchargement du bulletin ${bulletin.semester} ${bulletin.academicYear}...`);
  };

  const availableCount = bulletinsData.filter(b => b.status === 'available').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Bulletins</h1>
        <p className="text-sm text-muted-foreground">
          Consultez les bulletins de vos enfants
        </p>
      </div>

      {/* Child Selector */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choisir un enfant" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {child.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{child.name} - {child.class}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres</span>
            </div>
            <div className="flex gap-3 flex-1">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Année académique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester === 'Tous les semestres' ? 'all' : semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredBulletins.length} bulletin{filteredBulletins.length !== 1 ? 's' : ''} trouvé{filteredBulletins.length !== 1 ? 's' : ''} ({availableCount} disponibles)
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

      {/* Bulletins Grid/List - GRID by default */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredBulletins.map((bulletin) => (
            <Card 
              key={bulletin.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewBulletin(bulletin)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={bulletin.status === 'available' ? 'default' : 'secondary'}>
                    {bulletin.status === 'available' ? 'Disponible' : 'Archivé'}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{bulletin.semester}</h3>
                <p className="text-sm text-muted-foreground mb-3">{bulletin.academicYear}</p>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Moyenne</p>
                    <p className={`text-xl font-bold ${getGradeColor(bulletin.average)}`}>
                      {bulletin.average}/20
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Classement</p>
                    <p className="text-lg font-bold">{bulletin.ranking}</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  variant={bulletin.status === 'available' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(bulletin);
                  }}
                >
                  <Download className="h-4 w-4" />
                  {bulletin.status === 'available' ? 'Télécharger PDF' : 'Archivé'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBulletins.map((bulletin) => (
            <Card 
              key={bulletin.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewBulletin(bulletin)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{bulletin.semester}</h3>
                      <p className="text-sm text-muted-foreground">{bulletin.academicYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Moyenne</p>
                      <p className={`text-lg font-bold ${getGradeColor(bulletin.average)}`}>
                        {bulletin.average}/20
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rang</p>
                      <p className="text-lg font-bold">{bulletin.ranking}</p>
                    </div>
                    <Badge variant={bulletin.status === 'available' ? 'default' : 'secondary'}>
                      {bulletin.status === 'available' ? 'Disponible' : 'Archivé'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bulletin Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedBulletin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bulletin de {selectedBulletin.semester}
                </DialogTitle>
                <DialogDescription>
                  {currentChild?.name} - Année académique {selectedBulletin.academicYear}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                    <p className={`text-2xl font-bold ${getGradeColor(selectedBulletin.average)}`}>
                      {selectedBulletin.average}/20
                    </p>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <Award className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm text-muted-foreground">Classement</p>
                    <p className="text-2xl font-bold">{selectedBulletin.ranking}</p>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-warning" />
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-bold">{selectedBulletin.date}</p>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Notes par matière
                  </h4>
                  <div className="space-y-2">
                    {selectedBulletin.subjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{subject.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${getGradeColor(subject.average)}`}>
                            {subject.average}/20
                          </span>
                          <Badge variant="outline">coef {subject.coefficient}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appreciation */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Appréciation</h4>
                  <p className="text-sm italic">"{selectedBulletin.appreciation}"</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedBulletin.status === 'available' && (
                  <Button 
                    className="gap-2"
                    onClick={() => handleDownloadPDF(selectedBulletin)}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger PDF
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

