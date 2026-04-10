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
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Grid3X3,
  List,
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  Trophy,
  Users,
  Filter
} from 'lucide-react';

// Mock children data
const children = [
  { id: '1', name: 'Oumar Fall', class: 'Terminale S1' },
  { id: '2', name: 'Aïssatou Fall', class: '3ème A' },
];

// Mock grades for Oumar
const oumarGrades = [
  // Mathématiques
  { id: '1', subject: 'Mathématiques', type: 'Devoir', title: 'Devoir Maison 1', grade: 15, maxGrade: 20, coefficient: 4, date: '10/02/2025' },
  { id: '2', subject: 'Mathématiques', type: 'Devoir', title: 'Devoir Sur Table 1', grade: 14, maxGrade: 20, coefficient: 4, date: '05/02/2025' },
  { id: '3', subject: 'Mathématiques', type: 'Composition', title: 'Composition 1', grade: 16, maxGrade: 20, coefficient: 4, date: '01/02/2025' },
  // Français
  { id: '4', subject: 'Français', type: 'Devoir', title: 'Dissertation', grade: 14, maxGrade: 20, coefficient: 3, date: '08/02/2025' },
  { id: '5', subject: 'Français', type: 'Composition', title: 'Composition 1', grade: 13, maxGrade: 20, coefficient: 4, date: '25/01/2025' },
  // Physique
  { id: '6', subject: 'Physique', type: 'Devoir', title: 'TP Lumière', grade: 16, maxGrade: 20, coefficient: 3, date: '05/02/2025' },
  { id: '7', subject: 'Physique', type: 'Composition', title: 'Composition 1', grade: 16, maxGrade: 20, coefficient: 3, date: '28/01/2025' },
  // Anglais
  { id: '8', subject: 'Anglais', type: 'Oral', title: 'Expression Orale', grade: 17, maxGrade: 20, coefficient: 2, date: '03/02/2025' },
  { id: '9', subject: 'Anglais', type: 'Devoir', title: 'Compréhension', grade: 15, maxGrade: 20, coefficient: 2, date: '30/01/2025' },
  // Histoire
  { id: '10', subject: 'Histoire', type: 'Devoir', title: 'Analyse de document', grade: 12, maxGrade: 20, coefficient: 2, date: '25/01/2025' },
  // SVT
  { id: '11', subject: 'SVT', type: 'Devoir', title: 'TP Biologie', grade: 15, maxGrade: 20, coefficient: 3, date: '02/02/2025' },
  { id: '12', subject: 'SVT', type: 'Composition', title: 'Composition 1', grade: 14, maxGrade: 20, coefficient: 3, date: '20/01/2025' },
];

// Mock grades for Aïssatou
const aissatouGrades = [
  { id: '1', subject: 'Mathématiques', type: 'Devoir', title: 'Devoir Maison 1', grade: 17, maxGrade: 20, coefficient: 4, date: '10/02/2025' },
  { id: '2', subject: 'Mathématiques', type: 'Composition', title: 'Composition 1', grade: 16, maxGrade: 20, coefficient: 4, date: '01/02/2025' },
  { id: '3', subject: 'Français', type: 'Devoir', title: 'Dissertation', grade: 16, maxGrade: 20, coefficient: 3, date: '08/02/2025' },
  { id: '4', subject: 'Français', type: 'Composition', title: 'Composition 1', grade: 15, maxGrade: 20, coefficient: 4, date: '25/01/2025' },
  { id: '5', subject: 'Anglais', type: 'Oral', title: 'Expression Orale', grade: 18, maxGrade: 20, coefficient: 2, date: '03/02/2025' },
  { id: '6', subject: 'Histoire', type: 'Devoir', title: 'Analyse de document', grade: 15, maxGrade: 20, coefficient: 2, date: '25/01/2025' },
  { id: '7', subject: 'Physique', type: 'Devoir', title: 'TP Lumière', grade: 16, maxGrade: 20, coefficient: 3, date: '05/02/2025' },
  { id: '8', subject: 'SVT', type: 'Devoir', title: 'TP Biologie', grade: 16, maxGrade: 20, coefficient: 3, date: '02/02/2025' },
];

const subjects = ['Mathématiques', 'Français', 'Physique', 'Anglais', 'Histoire', 'SVT'];
const semesters = ['Semestre 2', 'Semestre 1'];
const academicYears = ['2024-2025', '2023-2024'];

const getGradeColor = (grade: number) => {
  if (grade >= 14) return 'text-success';
  if (grade >= 10) return 'text-warning';
  return 'text-destructive';
};

const getTrendIcon = (grade: number, average: number) => {
  if (grade > average) return <TrendingUp className="h-4 w-4 text-success" />;
  if (grade < average) return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Composition': return <FileText className="h-4 w-4" />;
    case 'Devoir': return <ClipboardList className="h-4 w-4" />;
    case 'Oral': return <Award className="h-4 w-4" />;
    default: return <Award className="h-4 w-4" />;
  }
};

const getGradesData = (childId: string) => {
  return childId === '1' ? oumarGrades : aissatouGrades;
};

const getChildInfo = (childId: string) => {
  return children.find(c => c.id === childId);
};

export default function ChildrenGrades() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('Semestre 2');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState<typeof oumarGrades[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentChild = getChildInfo(selectedChild);
  const gradesData = getGradesData(selectedChild);

  // Calculate subject averages
  const subjectAverages = subjects.map(subject => {
    const subjectGrades = gradesData.filter(g => g.subject === subject);
    if (subjectGrades.length === 0) return { subject, average: 0, grades: [], totalCoeff: 0 };
    
    const totalWeighted = subjectGrades.reduce((acc, g) => acc + (g.grade * g.coefficient), 0);
    const totalCoeff = subjectGrades.reduce((acc, g) => acc + g.coefficient, 0);
    
    return {
      subject,
      average: totalCoeff > 0 ? (totalWeighted / totalCoeff).toFixed(1) : '0',
      grades: subjectGrades,
      totalCoeff
    };
  }).filter(s => s.grades.length > 0);

  // Calculate general average
  const generalAverage = (() => {
    const totalWeighted = gradesData.reduce((acc, g) => acc + (g.grade * g.coefficient), 0);
    const totalCoeff = gradesData.reduce((acc, g) => acc + g.coefficient, 0);
    return totalCoeff > 0 ? (totalWeighted / totalCoeff).toFixed(1) : '0';
  })();

  // Filter grades by subject
  const filteredGrades = selectedSubject === 'all' 
    ? gradesData 
    : gradesData.filter(g => g.subject === selectedSubject);

  const handleViewGrade = (grade: typeof oumarGrades[0]) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Suivez les résultats scolaires de vos enfants
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
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classement</p>
                <p className="text-2xl font-bold">
                  {selectedChild === '1' ? '5' : '2'}
                  <sup>ème</sup>/{selectedChild === '1' ? '35' : '40'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Trophy className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold">{gradesData.length}</p>
                <p className="text-xs text-muted-foreground">{subjects.length} matières</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <BookOpen className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3 flex-1">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[150px]">
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
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        </CardContent>
      </Card>

      {/* View by Subject (Grid) or All Grades (List) */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjectAverages.map((subject) => (
            <Card 
              key={subject.subject} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSubject(subject.subject)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">
                    {subject.grades.length} notes
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{subject.subject}</h3>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getGradeColor(Number(subject.average))}`}>
                    {subject.average}
                  </span>
                  <span className="text-muted-foreground">/20</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Coef total: {subject.totalCoeff}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredGrades.map((grade) => (
                <div 
                  key={grade.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewGrade(grade)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      grade.type === 'Composition' ? 'bg-primary/10' : 'bg-warning/10'
                    }`}>
                      {getTypeIcon(grade.type)}
                    </div>
                    <div>
                      <p className="font-medium">{grade.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{grade.subject}</span>
                        <span>•</span>
                        <span>{grade.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {grade.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-lg font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                      <span className="text-muted-foreground">/{grade.maxGrade}</span>
                    </div>
                    <Badge variant="outline">coef {grade.coefficient}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          {selectedGrade && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedGrade.type)}
                  {selectedGrade.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedGrade.subject} • {selectedGrade.type}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className={`text-3xl font-bold ${getGradeColor(selectedGrade.grade)}`}>
                      {selectedGrade.grade}/{selectedGrade.maxGrade}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Coefficient</p>
                    <p className="text-2xl font-bold">{selectedGrade.coefficient}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-medium">{selectedGrade.date}</p>
                  </div>
                </div>

                {/* Comparison with class average */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Moyenne classe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">13.5/20</span>
                    {getTrendIcon(selectedGrade.grade, 13.5)}
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

