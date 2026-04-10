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
  History,
  Calendar,
  Award,
  Trophy,
  BookOpen,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

// Mock data for academic history
const mockAcademicHistory = [
  {
    id: '1',
    academicYear: '2024-2025',
    semester: 'Semestre 1',
    average: 14.2,
    ranking: '8/35',
    totalStudents: 35,
    status: 'completed',
    subjects: [
      { name: 'Mathématiques', average: 14.5, rank: 5 },
      { name: 'Français', average: 13.5, rank: 10 },
      { name: 'Physique', average: 15.0, rank: 3 },
      { name: 'Anglais', average: 15.5, rank: 2 },
      { name: 'Histoire', average: 13.0, rank: 12 },
      { name: 'SVT', average: 14.0, rank: 7 },
    ]
  },
  {
    id: '2',
    academicYear: '2023-2024',
    semester: 'Semestre 2',
    average: 13.8,
    ranking: '12/32',
    totalStudents: 32,
    status: 'completed',
    subjects: [
      { name: 'Mathématiques', average: 14.0, rank: 8 },
      { name: 'Français', average: 13.0, rank: 14 },
      { name: 'Physique', average: 14.5, rank: 6 },
      { name: 'Anglais', average: 14.0, rank: 10 },
      { name: 'Histoire', average: 13.5, rank: 11 },
      { name: 'SVT', average: 13.5, rank: 13 },
    ]
  },
  {
    id: '3',
    academicYear: '2023-2024',
    semester: 'Semestre 1',
    average: 13.5,
    ranking: '15/32',
    totalStudents: 32,
    status: 'completed',
    subjects: [
      { name: 'Mathématiques', average: 13.5, rank: 12 },
      { name: 'Français', average: 12.5, rank: 18 },
      { name: 'Physique', average: 14.0, rank: 8 },
      { name: 'Anglais', average: 14.5, rank: 7 },
      { name: 'Histoire', average: 13.0, rank: 15 },
      { name: 'SVT', average: 13.0, rank: 14 },
    ]
  },
  {
    id: '4',
    academicYear: '2022-2023',
    semester: 'Semestre 2',
    average: 13.2,
    ranking: '18/30',
    totalStudents: 30,
    status: 'completed',
    subjects: [
      { name: 'Mathématiques', average: 13.0, rank: 15 },
      { name: 'Français', average: 12.5, rank: 20 },
      { name: 'Physique', average: 13.5, rank: 12 },
      { name: 'Anglais', average: 14.0, rank: 10 },
      { name: 'Histoire', average: 13.0, rank: 16 },
      { name: 'SVT', average: 13.0, rank: 14 },
    ]
  },
];

const academicYears = ['2024-2025', '2023-2024', '2022-2023'];

const getGradeColor = (grade: number) => {
  if (grade >= 14) return 'text-success';
  if (grade >= 10) return 'text-warning';
  return 'text-destructive';
};

export default function StudentAcademicHistory() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<typeof mockAcademicHistory[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter records
  const filteredHistory = mockAcademicHistory.filter(record => {
    if (selectedYear !== 'all' && record.academicYear !== selectedYear) return false;
    return true;
  });

  const handleViewRecord = (record: typeof mockAcademicHistory[0]) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Historique Académique</h1>
        <p className="text-sm text-muted-foreground">
          Consultez vos résultats des années précédentes
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrer par année</span>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredHistory.length} résultat{filteredHistory.length !== 1 ? 's' : ''} trouvé{filteredHistory.length !== 1 ? 's' : ''}
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

      {/* History Grid/List - GRID by default */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((record) => (
            <Card 
              key={record.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewRecord(record)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">
                    Terminé
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{record.semester}</h3>
                <p className="text-sm text-muted-foreground mb-3">{record.academicYear}</p>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Moyenne</p>
                    <p className={`text-xl font-bold ${getGradeColor(record.average)}`}>
                      {record.average}/20
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Classement</p>
                    <p className="text-lg font-bold">{record.ranking}</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full gap-2">
                  Voir détails
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((record) => (
            <Card 
              key={record.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewRecord(record)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <History className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{record.semester}</h3>
                      <p className="text-sm text-muted-foreground">{record.academicYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Moyenne</p>
                      <p className={`text-lg font-bold ${getGradeColor(record.average)}`}>
                        {record.average}/20
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rang</p>
                      <p className="text-lg font-bold">{record.ranking}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {selectedRecord.semester} - {selectedRecord.academicYear}
                </DialogTitle>
                <DialogDescription>
                  Détails de vos résultats
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                    <p className={`text-2xl font-bold ${getGradeColor(selectedRecord.average)}`}>
                      {selectedRecord.average}/20
                    </p>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <Award className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm text-muted-foreground">Classement</p>
                    <p className="text-2xl font-bold">{selectedRecord.ranking}</p>
                    <p className="text-xs text-muted-foreground">sur {selectedRecord.totalStudents} élèves</p>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Notes par matière
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.subjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{subject.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${getGradeColor(subject.average)}`}>
                            {subject.average}/20
                          </span>
                          <Badge variant="outline">
                            {subject.rank}er
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
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

