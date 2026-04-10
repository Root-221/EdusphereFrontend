import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataList, Column } from '@/components/ui/data-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  School,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Calendar,
  CalendarDays,
  Eye,
  GraduationCap,
  Calculator,
  BarChart3,
  FileText
} from 'lucide-react';

// Types
interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  subjectId: string;
  academicYear: string;
  academicYearId: string;
  semester: string;
  semesterId: string;
  students: number;
  average: number;
  maleStudents: number;
  femaleStudents: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  average: number;
  attendance: number;
}

// Données mock - Années académiques
const academicYears = [
  { id: '1', name: '2024-2025', status: 'active' },
  { id: '2', name: '2023-2024', status: 'completed' },
];

const ACTIVE_YEAR_ID = '1';

// Données mock - Semestres
const semesters = [
  { id: '1', name: 'Semestre 1', academicYearId: '1', academicYear: '2024-2025' },
  { id: '2', name: 'Semestre 2', academicYearId: '1', academicYear: '2024-2025' },
  { id: '3', name: 'Semestre 1', academicYearId: '2', academicYear: '2023-2024' },
  { id: '4', name: 'Semestre 2', academicYearId: '2', academicYear: '2023-2024' },
];

// Données mock - Matières du professeur
const teacherSubjects = [
  { id: '1', name: 'Mathématiques' },
];

// Données mock - Classes
const classes: TeacherClass[] = [
  { id: '1', name: 'Terminale S1', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 2', semesterId: '2', students: 35, average: 12.5, maleStudents: 18, femaleStudents: 17 },
  { id: '2', name: 'Terminale S2', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 2', semesterId: '2', students: 32, average: 13.2, maleStudents: 15, femaleStudents: 17 },
  { id: '3', name: '1ère S1', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 2', semesterId: '2', students: 38, average: 11.8, maleStudents: 20, femaleStudents: 18 },
  { id: '4', name: '2nde A', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 2', semesterId: '2', students: 40, average: 14.1, maleStudents: 22, femaleStudents: 18 },
  { id: '5', name: 'Terminale S1', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 1', semesterId: '1', students: 35, average: 13.1, maleStudents: 18, femaleStudents: 17 },
  { id: '6', name: 'Terminale S2', subject: 'Mathématiques', subjectId: '1', academicYear: '2024-2025', academicYearId: '1', semester: 'Semestre 1', semesterId: '1', students: 32, average: 12.8, maleStudents: 15, femaleStudents: 17 },
  { id: '7', name: '1ère S1', subject: 'Mathématiques', subjectId: '1', academicYear: '2023-2024', academicYearId: '2', semester: 'Semestre 2', semesterId: '4', students: 36, average: 12.0, maleStudents: 19, femaleStudents: 17 },
  { id: '8', name: '2nde A', subject: 'Mathématiques', subjectId: '1', academicYear: '2023-2024', academicYearId: '2', semester: 'Semestre 2', semesterId: '4', students: 39, average: 13.5, maleStudents: 21, femaleStudents: 18 },
];

// Générer des étudiants mock pour une classe
const generateStudents = (classId: string): Student[] => {
  const firstNames = ['Lucas', 'Emma', 'Hugo', 'Chloé', 'Arthur', 'Louise', 'Raphaël', 'Jade', 'Louis', 'Ambre', 'Gabriel', 'Alice', 'Maël', 'Rose', 'Simon', 'Inès', 'Thomas', 'Emma', 'Nathan', 'Léa'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Lefebvre', 'Michel', 'Durand', 'Leroy', 'Rousseau', 'Blanc', 'García', 'Martinez', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor'];
  
  return firstNames.slice(0, Math.min(20, parseInt(classId) * 5 + 10)).map((firstName, index) => ({
    id: `${classId}-${index + 1}`,
    firstName,
    lastName: lastNames[index % lastNames.length],
    email: `${firstName.toLowerCase()}.${lastNames[index % lastNames.length].toLowerCase()}@email.com`,
    average: Math.round((10 + Math.random() * 8) * 10) / 10,
    attendance: Math.round(85 + Math.random() * 15),
  }));
};

export default function MyClasses() {
  const [filters, setFilters] = useState({
    academicYearId: ACTIVE_YEAR_ID,
    semesterId: '',
    subjectId: '',
  });
  
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Filtrer les données
  const filteredClasses = classes.filter(cls => {
    if (filters.academicYearId && cls.academicYearId !== filters.academicYearId) return false;
    if (filters.semesterId && cls.semesterId !== filters.semesterId) return false;
    if (filters.subjectId && cls.subjectId !== filters.subjectId) return false;
    return true;
  });

  // Colonnes pour la liste
  const columns: Column<TeacherClass>[] = [
    {
      key: 'name',
      label: 'Classe',
      sortable: true,
      render: (cls) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{cls.name}</p>
            <Badge variant="outline" className="text-xs">{cls.subject}</Badge>
          </div>
        </div>
      )
    },
    {
      key: 'academicYear',
      label: 'Période',
      sortable: true,
      render: (cls) => (
        <div className="text-sm">
          <p className="font-medium">{cls.academicYear}</p>
          <p className="text-muted-foreground">{cls.semester}</p>
        </div>
      )
    },
    {
      key: 'students',
      label: 'Élèves',
      sortable: true,
      render: (cls) => (
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {cls.students}
        </span>
      )
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (cls) => (
        <span className={`flex items-center gap-1 font-medium ${
          cls.average >= 14 ? 'text-green-600' : cls.average >= 10 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          <TrendingUp className="h-3 w-3" />
          {cls.average}/20
        </span>
      )
    },
  ];

  // Options de filtres
  const filterOptions = [
    {
      key: 'academicYearId',
      label: 'Année académique',
      options: academicYears.map(y => ({ value: y.id, label: y.name }))
    },
    {
      key: 'semesterId',
      label: 'Semestre',
      options: semesters.map(s => ({ value: s.id, label: `${s.name} (${s.academicYear})` }))
    },
    {
      key: 'subjectId',
      label: 'Matière',
      options: teacherSubjects.map(s => ({ value: s.id, label: s.name }))
    },
  ];

  const openDetailsDrawer = (cls: TeacherClass) => {
    setSelectedClass(cls);
    setClassStudents(generateStudents(cls.id));
    setIsDetailsDrawerOpen(true);
  };

  // Item pour la grille
  const gridItem = (cls: TeacherClass) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{cls.name}</h3>
            <Badge variant="outline">{cls.subject}</Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {cls.academicYear} - {cls.semester}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3 w-3" />
          {cls.students} élèves ({cls.maleStudents} G / {cls.femaleStudents} F)
        </span>
        <span className={`flex items-center gap-2 ${cls.average >= 14 ? 'text-green-600' : cls.average >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
          <TrendingUp className="h-3 w-3" />
          Moyenne: {cls.average}/20
        </span>
      </div>
      <Button variant="outline" className="w-full gap-2" onClick={() => openDetailsDrawer(cls)}>
        <Eye className="h-3 w-3" />
        Voir les détails
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Classes</h1>
        <p className="text-muted-foreground">
          Gérez vos classes et suivez les performances de vos élèves
        </p>
      </div>

      {/* Filtres personnalisés */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.academicYearId}
          onValueChange={(value) => setFilters({ ...filters, academicYearId: value, semesterId: '' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année académique" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.semesterId}
          onValueChange={(value) => setFilters({ ...filters, semesterId: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les semestres</SelectItem>
            {semesters.filter(s => s.academicYearId === filters.academicYearId).map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.subjectId}
          onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {teacherSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(filters.academicYearId || filters.semesterId || filters.subjectId) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({ academicYearId: ACTIVE_YEAR_ID, semesterId: '', subjectId: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <DataList
        data={filteredClasses}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une classe..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune classe trouvée"
        itemsPerPage={6}
      />

      {/* Drawer de détails de la classe */}
      <Drawer open={isDetailsDrawerOpen} onOpenChange={setIsDetailsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{selectedClass?.name}</DrawerTitle>
            <DrawerDescription>
              {selectedClass?.subject} - {selectedClass?.academicYear} - {selectedClass?.semester}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-150px)]">
            {selectedClass && (
              <div className="space-y-6">
                {/* Stats Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Élèves</p>
                          <p className="text-xl font-bold">{selectedClass.students}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Moyenne</p>
                          <p className="text-xl font-bold">{selectedClass.average}/20</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Garçons</p>
                          <p className="text-xl font-bold">{selectedClass.maleStudents}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Filles</p>
                          <p className="text-xl font-bold">{selectedClass.femaleStudents}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste des étudiants */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Liste des élèves ({classStudents.length})
                  </h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Prénom</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Moyenne</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student, index) => (
                          <tr key={student.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="px-4 py-2">{student.lastName}</td>
                            <td className="px-4 py-2">{student.firstName}</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{student.email}</td>
                            <td className="px-4 py-2 text-right">
                              <span className={`font-medium ${
                                student.average >= 14 ? 'text-green-600' : student.average >= 10 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {student.average}/20
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
