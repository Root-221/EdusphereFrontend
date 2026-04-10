import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataList, Column } from '@/components/ui/data-list';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  ClipboardList,
  FileText,
  BookOpen,
  School,
  Users,
  Calculator,
  ArrowUpDown,
  Download,
  Filter,
  BarChart,
  LineChart,
  PieChart
} from 'lucide-react';

// Types
interface HistoricalEntry {
  id: string;
  title: string;
  type: 'assignment' | 'exam';
  class: string;
  subject: string;
  academicYear: string;
  semester: string;
  date: string;
  coefficient: number;
  average: number;
  highest: number;
  lowest: number;
  totalStudents: number;
}

interface StudentStats {
  id: string;
  name: string;
  class: string;
  average: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface SubjectStats {
  subject: string;
  average: number;
  studentsCount: number;
  evaluationsCount: number;
}

// Données mock - Historique des évaluations
const historicalEntries: HistoricalEntry[] = [
  { id: '1', title: 'Composition 2 - Algèbre', type: 'exam', class: 'Terminale S1', subject: 'Mathématiques', academicYear: '2024-2025', semester: 'Semestre 1', date: '15/01/2025', coefficient: 3, average: 12.3, highest: 18.5, lowest: 5.0, totalStudents: 35 },
  { id: '2', title: 'Devoir Chapitre 4', type: 'assignment', class: 'Terminale S1', subject: 'Mathématiques', academicYear: '2024-2025', semester: 'Semestre 1', date: '10/01/2025', coefficient: 2, average: 13.1, highest: 19.0, lowest: 6.5, totalStudents: 35 },
  { id: '3', title: 'Composition 1 - Géométrie', type: 'exam', class: 'Terminale S2', subject: 'Mathématiques', academicYear: '2024-2025', semester: 'Semestre 1', date: '20/12/2024', coefficient: 3, average: 11.8, highest: 17.0, lowest: 4.5, totalStudents: 32 },
  { id: '4', title: 'Devoir Maison - Analyse', type: 'assignment', class: '1ère S1', subject: 'Mathématiques', academicYear: '2024-2025', semester: 'Semestre 1', date: '15/12/2024', coefficient: 2, average: 14.2, highest: 19.5, lowest: 8.0, totalStudents: 38 },
  { id: '5', title: 'Examen Rapide', type: 'exam', class: 'Terminale S1', subject: 'Mathématiques', academicYear: '2024-2025', semester: 'Semestre 1', date: '05/12/2024', coefficient: 1, average: 12.9, highest: 18.0, lowest: 7.0, totalStudents: 35 },
  { id: '6', title: 'Composition Annuelle', type: 'exam', class: 'Terminale S1', subject: 'Mathématiques', academicYear: '2023-2024', semester: 'Semestre 2', date: '15/06/2024', coefficient: 4, average: 11.5, highest: 17.5, lowest: 4.0, totalStudents: 34 },
  { id: '7', title: 'Devoir Final', type: 'assignment', class: 'Terminale S2', subject: 'Mathématiques', academicYear: '2023-2024', semester: 'Semestre 2', date: '10/06/2024', coefficient: 2, average: 13.4, highest: 19.0, lowest: 7.5, totalStudents: 30 },
  { id: '8', title: 'Composition Blanc', type: 'exam', class: '1ère S1', subject: 'Mathématiques', academicYear: '2023-2024', semester: 'Semestre 2', date: '01/06/2024', coefficient: 3, average: 12.1, highest: 17.5, lowest: 5.5, totalStudents: 36 },
];

// Données mock - Stats par élève
const studentStats: StudentStats[] = [
  { id: '1', name: 'Amadou Diop', class: 'Terminale S1', average: 15.2, rank: 1, trend: 'up' },
  { id: '2', name: 'Fatou Ndiaye', class: 'Terminale S1', average: 14.8, rank: 2, trend: 'stable' },
  { id: '3', name: 'Moussa Sy', class: 'Terminale S1', average: 14.5, rank: 3, trend: 'up' },
  { id: '4', name: 'Mariama Fall', class: 'Terminale S1', average: 13.9, rank: 4, trend: 'down' },
  { id: '5', name: 'Ibrahima Ba', class: 'Terminale S1', average: 13.2, rank: 5, trend: 'stable' },
  { id: '6', name: 'Khady Sow', class: 'Terminale S2', average: 14.1, rank: 1, trend: 'up' },
  { id: '7', name: 'Ousmane Faye', class: 'Terminale S2', average: 13.6, rank: 2, trend: 'stable' },
  { id: '8', name: 'Aïssatou Mbaye', class: '1ère S1', average: 15.5, rank: 1, trend: 'up' },
];

// Données mock - Stats par matière
const subjectStats: SubjectStats[] = [
  { subject: 'Mathématiques', average: 13.2, studentsCount: 105, evaluationsCount: 24 },
];

// Données mock - Comparatif semestres
const semesterComparison = {
  s1: { average: 12.8, evaluations: 15, students: 105 },
  s2: { average: 13.4, evaluations: 12, students: 103 },
};

export default function TeacherHistory() {
  const [filters, setFilters] = useState({
    academicYear: '2024-2025',
    semester: 'all',
    classId: 'all',
    type: 'all'
  });

  const filteredEntries = historicalEntries.filter(entry => {
    if (filters.academicYear && entry.academicYear !== filters.academicYear) return false;
    if (filters.semester !== 'all' && entry.semester !== filters.semester) return false;
    if (filters.classId !== 'all' && entry.class !== filters.classId) return false;
    if (filters.type !== 'all' && entry.type !== filters.type) return false;
    return true;
  });

  const columns: Column<HistoricalEntry>[] = [
    {
      key: 'title',
      label: 'Évaluation',
      sortable: true,
      render: (entry) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            entry.type === 'exam' ? 'bg-primary/10' : 'bg-blue-50'
          }`}>
            {entry.type === 'exam' ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <ClipboardList className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{entry.title}</p>
            <div className="flex gap-1 mt-1">
              <Badge variant={entry.type === 'exam' ? 'default' : 'outline'} className="text-xs">
                {entry.type === 'exam' ? 'Composition' : 'Devoir'}
              </Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Classe',
      sortable: true,
      render: (entry) => <span className="text-sm">{entry.class}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (entry) => (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {entry.date}
        </span>
      )
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (entry) => (
        <div className="flex items-center gap-1">
          <span className={`font-medium ${
            entry.average >= 14 ? 'text-green-600' : entry.average >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {entry.average}/20
          </span>
        </div>
      )
    },
    {
      key: 'coefficient',
      label: 'Coeff',
      sortable: true,
      render: (entry) => (
        <span className="flex items-center gap-1">
          <Calculator className="h-3 w-3" />
          {entry.coefficient}
        </span>
      )
    },
  ];

  const gridItem = (entry: HistoricalEntry) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          entry.type === 'exam' ? 'bg-primary/10' : 'bg-blue-50'
        }`}>
          {entry.type === 'exam' ? (
            <FileText className="h-6 w-6 text-primary" />
          ) : (
            <ClipboardList className="h-6 w-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold truncate">{entry.title}</h3>
          <div className="flex gap-1 mt-1">
            <Badge variant={entry.type === 'exam' ? 'default' : 'outline'} className="text-xs">
              {entry.type === 'exam' ? 'Composition' : 'Devoir'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <School className="h-3 w-3" />
          {entry.class}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {entry.date} - {entry.semester}
        </span>
        <div className="flex items-center gap-4 pt-1">
          <span className={`font-medium ${
            entry.average >= 14 ? 'text-green-600' : entry.average >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Moy: {entry.average}/20
          </span>
          <span className="text-muted-foreground text-xs">
            Max: {entry.highest}
          </span>
          <span className="text-muted-foreground text-xs">
            Min: {entry.lowest}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historique & Statistiques</h1>
        <p className="text-muted-foreground">
          Analysez les performances de vos élèves
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.academicYear}
          onValueChange={(value) => setFilters({ ...filters, academicYear: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année académique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-2025">2024-2025</SelectItem>
            <SelectItem value="2023-2024">2023-2024</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.semester}
          onValueChange={(value) => setFilters({ ...filters, semester: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les semestres</SelectItem>
            <SelectItem value="Semestre 1">Semestre 1</SelectItem>
            <SelectItem value="Semestre 2">Semestre 2</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.classId}
          onValueChange={(value) => setFilters({ ...filters, classId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            <SelectItem value="Terminale S1">Terminale S1</SelectItem>
            <SelectItem value="Terminale S2">Terminale S2</SelectItem>
            <SelectItem value="1ère S1">1ère S1</SelectItem>
            <SelectItem value="2nde A">2nde A</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="exam">Compositions</SelectItem>
            <SelectItem value="assignment">Devoirs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne Globale</p>
                <p className="text-2xl font-bold">13.1/20</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">+0.3 vs semestre dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Évaluations</p>
                <p className="text-2xl font-bold">{filteredEntries.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{filters.academicYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meilleure Moyenne</p>
                <p className="text-2xl font-bold text-green-600">15.5/20</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aïssatou Mbaye - 1ère S1</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Élèves</p>
                <p className="text-2xl font-bold">105</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">4 classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison S1 vs S2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Comparatif Semestre 1 vs Semestre 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Semestre 1</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{semesterComparison.s1.average}/20</p>
                  <p className="text-xs text-muted-foreground">{semesterComparison.s1.evaluations} évaluations</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Semestre 2</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{semesterComparison.s2.average}/20</p>
                  <p className="text-xs text-green-600">{semesterComparison.s2.evaluations} évaluations</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  +{semesterComparison.s2.average - semesterComparison.s1.average} points de moyenne
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution des notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Excellent (16-20)
                  </span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[15%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                    Bien (14-15.9)
                  </span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-lime-500 w-[25%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Moyen (10-13.9)
                  </span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[40%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Faible (0-9.9)
                  </span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[20%]"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Meilleurs Élèves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentStats.slice(0, 4).map((student, index) => (
              <div key={student.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {student.rank}
                    </span>
                    <span className="font-medium text-sm">{student.name}</span>
                  </div>
                  {student.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : student.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{student.class}</p>
                <p className="text-lg font-bold text-green-600">{student.average}/20</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique des évaluations */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historique des Évaluations
        </h2>
        <DataList
          data={filteredEntries}
          columns={columns}
          searchKey="title"
          searchPlaceholder="Rechercher une évaluation..."
          defaultView="grid"
          gridItem={gridItem}
          emptyMessage="Aucune évaluation trouvée"
          itemsPerPage={6}
        />
      </div>
    </div>
  );
}

