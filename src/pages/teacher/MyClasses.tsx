import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataList, type Column } from '@/components/ui/data-list';
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
import { teacherApi } from '@/services/teacher';
import type { TeacherClassStudent, TeacherClassSummary } from '@/types/teacher';
import {
  School,
  Users,
  TrendingUp,
  CalendarDays,
  Eye,
  GraduationCap,
  Calculator,
} from 'lucide-react';

export default function MyClasses() {
  const [filters, setFilters] = useState({
    academicYearId: '',
    semesterId: '',
    subjectId: '',
  });

  const [selectedClass, setSelectedClass] = useState<TeacherClassSummary | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const optionsQuery = useQuery({
    queryKey: ['teacher', 'classes', 'options'],
    queryFn: teacherApi.fetchClassOptions,
    retry: false,
  });

  useEffect(() => {
    if (!optionsQuery.data) return;
    setFilters((current) => ({
      ...current,
      academicYearId: current.academicYearId || optionsQuery.data.currentAcademicYearId || '',
      semesterId: current.semesterId || optionsQuery.data.currentSemesterId || '',
    }));
  }, [optionsQuery.data]);

  const classesQuery = useQuery({
    queryKey: ['teacher', 'classes', filters],
    queryFn: () =>
      teacherApi.fetchClasses({
        academicYearId: filters.academicYearId,
        semesterId: filters.semesterId && filters.semesterId !== 'all' ? filters.semesterId : undefined,
        subjectId: filters.subjectId && filters.subjectId !== 'all' ? filters.subjectId : undefined,
      }),
    enabled: Boolean(filters.academicYearId),
    retry: false,
  });

  const studentsQuery = useQuery({
    queryKey: ['teacher', 'classes', selectedClass?.id, 'students'],
    queryFn: () => teacherApi.fetchClassStudents(selectedClass!.id),
    enabled: Boolean(selectedClass),
    retry: false,
  });

  const options = optionsQuery.data;
  const teacherClasses = classesQuery.data ?? [];
  const academicYears = (options?.academicYears ?? []).filter((year) => year.id);
  const semesters = (options?.semesters ?? []).filter((semester) => semester.id);
  const subjects = (options?.subjects ?? []).filter((subject) => subject.id);

  const totalStudents = teacherClasses.reduce((sum, item) => sum + item.students, 0);
  const averageScore =
    teacherClasses.length > 0
      ? Math.round((teacherClasses.reduce((sum, item) => sum + item.average, 0) / teacherClasses.length) * 10) / 10
      : 0;

  const columns: Column<TeacherClassSummary>[] = [
    {
      key: 'name',
      label: 'Classe',
      sortable: true,
      render: (cls) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{cls.name}</p>
            <div className="flex flex-wrap gap-1">
              {cls.subjects.map((subject) => (
                <Badge key={subject.id} variant="outline" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ),
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
      ),
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
      ),
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (cls) => (
        <span
          className={`flex items-center gap-1 font-medium ${
            cls.average >= 14 ? 'text-green-600' : cls.average >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          {cls.average}/20
        </span>
      ),
    },
  ];

  const gridItem = (cls: TeacherClassSummary) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{cls.name}</h3>
            <div className="flex flex-wrap gap-1">
              {cls.subjects.map((subject) => (
                <Badge key={subject.id} variant="outline">
                  {subject.name}
                </Badge>
              ))}
            </div>
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
        <span
          className={`flex items-center gap-2 ${
            cls.average >= 14 ? 'text-green-600' : cls.average >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          Moyenne: {cls.average}/20
        </span>
      </div>
      <Button variant="outline" className="w-full gap-2" onClick={() => openDetailsDrawer(cls)}>
        <Eye className="h-3 w-3" />
        Voir les détails
      </Button>
    </div>
  );

  const openDetailsDrawer = (cls: TeacherClassSummary) => {
    setSelectedClass(cls);
    setIsDetailsDrawerOpen(true);
  };

  if (optionsQuery.isLoading || classesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes Classes</h1>
          <p className="text-muted-foreground">Chargement des classes...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des données...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Classes</h1>
        <p className="text-muted-foreground">Suivez vos classes et leurs statistiques en temps réel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Classes</p>
            <p className="text-2xl font-bold">{teacherClasses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Élèves</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Moyenne globale</p>
            <p className="text-2xl font-bold">{averageScore}/20</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Matières</p>
            <p className="text-2xl font-bold">{subjects.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.academicYearId}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              academicYearId: value,
              semesterId: options?.currentSemesterId ?? '',
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année académique" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semesterId}
          onValueChange={(value) => setFilters((current) => ({ ...current, semesterId: value }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les semestres</SelectItem>
            {semesters
              .filter((semester) => semester.academicYearId === filters.academicYearId)
              .map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.subjectId}
          onValueChange={(value) => setFilters((current) => ({ ...current, subjectId: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.academicYearId || filters.semesterId || filters.subjectId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilters({
                academicYearId: options?.currentAcademicYearId ?? '',
                semesterId: options?.currentSemesterId ?? '',
                subjectId: '',
              })
            }
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <DataList
        data={teacherClasses}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une classe..."
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune classe trouvée"
        itemsPerPage={6}
      />

      <Drawer open={isDetailsDrawerOpen} onOpenChange={setIsDetailsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{selectedClass?.name}</DrawerTitle>
            <DrawerDescription>
              {selectedClass?.subjects.map((subject) => subject.name).join(', ')} - {selectedClass?.academicYear} -{' '}
              {selectedClass?.semester}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-150px)]">
            {selectedClass && (
              <div className="space-y-6">
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

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Liste des élèves ({studentsQuery.data?.length ?? 0})
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
                        {(studentsQuery.data ?? []).map((student: TeacherClassStudent, index) => (
                          <tr key={student.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="px-4 py-2">{student.lastName}</td>
                            <td className="px-4 py-2">{student.firstName}</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{student.email}</td>
                            <td className="px-4 py-2 text-right">
                              <span
                                className={`font-medium ${
                                  student.average >= 14
                                    ? 'text-green-600'
                                    : student.average >= 10
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }`}
                              >
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
