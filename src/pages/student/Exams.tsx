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
  FileText, 
  Calendar,
  Grid3X3,
  List,
  Filter,
  BookOpen,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// Mock data for exams
const mockExams = [
  { 
    id: '1', 
    title: 'Composition de Mathématiques', 
    subject: 'Mathématiques', 
    date: '10/02/2025', 
    status: 'upcoming',
    coefficient: 4,
    note: null,
    maxNote: 20,
    moyenneClasse: null,
    duration: '2h'
  },
  { 
    id: '2', 
    title: 'Composition de Français', 
    subject: 'Français', 
    date: '08/02/2025', 
    status: 'completed',
    coefficient: 4,
    note: 14,
    maxNote: 20,
    moyenneClasse: 12.5,
    duration: '2h'
  },
  { 
    id: '3', 
    title: 'Composition de Physique', 
    subject: 'Physique', 
    date: '05/02/2025', 
    status: 'completed',
    coefficient: 3,
    note: 16,
    maxNote: 20,
    moyenneClasse: 13.8,
    duration: '1h30'
  },
  { 
    id: '4', 
    title: 'Composition d\'Anglais', 
    subject: 'Anglais', 
    date: '01/02/2025', 
    status: 'completed',
    coefficient: 2,
    note: 17,
    maxNote: 20,
    moyenneClasse: 14.2,
    duration: '1h'
  },
  { 
    id: '5', 
    title: 'Composition d\'Histoire', 
    subject: 'Histoire', 
    date: '28/01/2025', 
    status: 'completed',
    coefficient: 2,
    note: 12,
    maxNote: 20,
    moyenneClasse: 11.5,
    duration: '2h'
  },
  { 
    id: '6', 
    title: 'Composition de SVT', 
    subject: 'SVT', 
    date: '25/01/2025', 
    status: 'completed',
    coefficient: 3,
    note: 15,
    maxNote: 20,
    moyenneClasse: 13.0,
    duration: '1h30'
  },
];

const subjects = ['Toutes les matières', 'Mathématiques', 'Français', 'Physique', 'Anglais', 'Histoire', 'SVT', 'Philosophie'];
const academicYears = ['2024-2025', '2023-2024', '2022-2023'];
const semesters = ['Semestre 1', 'Semestre 2'];

const getGradeColor = (grade: number) => {
  if (grade >= 14) return 'text-success';
  if (grade >= 10) return 'text-warning';
  return 'text-destructive';
};

const getTrendIcon = (studentGrade: number, classAverage: number) => {
  if (studentGrade > classAverage) return <TrendingUp className="h-4 w-4 text-success" />;
  if (studentGrade < classAverage) return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming': return <Badge className="bg-warning/20 text-warning">À venir</Badge>;
    case 'completed': return <Badge className="bg-success/20 text-success">Corrigé</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function StudentExams() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Semestre 2');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedExam, setSelectedExam] = useState<typeof mockExams[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter exams
  const filteredExams = mockExams.filter(exam => {
    if (selectedSubject !== 'all' && exam.subject !== selectedSubject) return false;
    return true;
  });

  // Calculate average
  const completedExams = mockExams.filter(e => e.status === 'completed');
  const generalAverage = completedExams.length > 0
    ? (completedExams.reduce((acc, e) => acc + (e.note || 0), 0) / completedExams.length).toFixed(1)
    : '-';

  const handleViewExam = (exam: typeof mockExams[0]) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const upcomingCount = mockExams.filter(e => e.status === 'upcoming').length;
  const completedCount = mockExams.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Mes Compositions</h1>
        <p className="text-sm text-muted-foreground">
          Vos examens et compositions ({upcomingCount} à venir)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                <p className="text-2xl font-bold">{generalAverage}/20</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compositions</p>
                <p className="text-2xl font-bold">{completedCount}/{mockExams.length}</p>
                <p className="text-xs text-muted-foreground">réalisées</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <FileText className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À venir</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Année académique" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
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
          {filteredExams.length} composition{filteredExams.length !== 1 ? 's' : ''} trouvée{filteredExams.length !== 1 ? 's' : ''}
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

      {/* Exams Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <Card 
              key={exam.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewExam(exam)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{exam.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{exam.subject}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <span>Coefficient: {exam.coefficient}</span>
                  <span>•</span>
                  <span>{exam.duration}</span>
                </div>
                {exam.note !== null && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-warning" />
                      <span className="font-medium">{exam.note}/{exam.maxNote}</span>
                    </div>
                    {getTrendIcon(exam.note, exam.moyenneClasse || 0)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExams.map((exam) => (
            <Card 
              key={exam.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewExam(exam)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground">{exam.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {exam.date}
                      </span>
                      <span className="text-xs text-muted-foreground">Coef: {exam.coefficient}</span>
                    </div>
                    {exam.note !== null && (
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${getGradeColor(exam.note)}`}>
                          {exam.note}/20
                        </span>
                        {getTrendIcon(exam.note, exam.moyenneClasse || 0)}
                      </div>
                    )}
                    {getStatusBadge(exam.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exam Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedExam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedExam.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedExam.subject} • Coefficient: {selectedExam.coefficient}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{selectedExam.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Durée</p>
                      <p className="font-medium">{selectedExam.duration}</p>
                    </div>
                  </div>
                </div>

                {selectedExam.note !== null ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-success" />
                        <span className="font-medium">Votre note</span>
                      </div>
                      <span className="text-2xl font-bold text-success">
                        {selectedExam.note}/{selectedExam.maxNote}
                      </span>
                    </div>
                    
                    {selectedExam.moyenneClasse && (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Moyenne de la classe</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">
                            {selectedExam.moyenneClasse}/20
                          </span>
                          {getTrendIcon(selectedExam.note, selectedExam.moyenneClasse)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="font-medium text-warning">Composition à venir</p>
                    <p className="text-sm text-muted-foreground">Cette composition n'a pas encore eu lieu</p>
                  </div>
                )}
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

