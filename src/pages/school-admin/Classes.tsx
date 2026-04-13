import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Calendar, Edit, Link, Plus, School, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi, type AssignClassSubjectsPayload, type CreateClassPayload, type UpdateClassPayload } from '@/services/academic';
import { usersApi } from '@/services/users';
import { CURRENT_ACADEMIC_SELECTION, resolveAcademicYearSelection } from '@/lib/academic-scope';
import type { AcademicYear, Level, SchoolClass, Subject } from '@/types/academic';
import type { Teacher } from '@/types/users';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const classStatusLabels: Record<SchoolClass['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archivée',
};

type ClassFormState = {
  name: string;
  levelId: string;
  capacity: string;
  academicYearId: string;
  teacherId: string;
  status: SchoolClass['status'];
};

const createDefaultForm = (): ClassFormState => ({
  name: '',
  levelId: '',
  capacity: '40',
  academicYearId: '',
  teacherId: '',
  status: 'active',
});

type ClassRow = SchoolClass & { searchText: string; levelName: string };

const formatTeacherLabel = (teacher: Teacher) => `${teacher.firstName} ${teacher.name}${teacher.subject ? ` - ${teacher.subject}` : ''}`;

export default function Classes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [isTeachersDialogOpen, setIsTeachersDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [selectedClassForTeachers, setSelectedClassForTeachers] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [formData, setFormData] = useState<ClassFormState>(createDefaultForm);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(CURRENT_ACADEMIC_SELECTION);

  const classesQuery = useQuery({
    queryKey: ['school-admin', 'classes', selectedAcademicYearId],
    queryFn: () =>
      academicApi.fetchClasses(
        selectedAcademicYearId === CURRENT_ACADEMIC_SELECTION
          ? undefined
          : { academicYearId: selectedAcademicYearId },
      ),
    retry: false,
  });

  const levelsQuery = useQuery({
    queryKey: ['school-admin', 'levels'],
    queryFn: () => academicApi.fetchLevels(),
    retry: false,
  });

  const academicYearsQuery = useQuery({
    queryKey: ['school-admin', 'academic-years'],
    queryFn: academicApi.fetchAcademicYears,
    retry: false,
  });

  const teachersQuery = useQuery({
    queryKey: ['school-admin', 'teachers'],
    queryFn: usersApi.fetchTeachers,
    retry: false,
  });

  const classTeachersQuery = useQuery({
    queryKey: ['school-admin', 'class-teachers', selectedClassForTeachers?.id],
    queryFn: () => academicApi.fetchClassTeachers(selectedClassForTeachers!.id),
    enabled: Boolean(selectedClassForTeachers),
    retry: false,
  });

  const subjectsQuery = useQuery({
    queryKey: ['school-admin', 'subjects'],
    queryFn: academicApi.fetchSubjects,
    retry: false,
  });

  const classes = useMemo<ClassRow[]>(
    () =>
      (classesQuery.data ?? []).map((schoolClass) => ({
        ...schoolClass,
        levelName: schoolClass.level?.name ?? '',
        searchText: [
          schoolClass.name,
          schoolClass.level?.name,
          schoolClass.teacher,
          schoolClass.academicYear,
          schoolClass.status,
          ...(schoolClass.subjects ?? []),
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [classesQuery.data],
  );

  const academicYears = academicYearsQuery.data ?? [];
  const levels = levelsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const classTeachers = classTeachersQuery.data ?? [];
  const activeAcademicYearId = resolveAcademicYearSelection(CURRENT_ACADEMIC_SELECTION, academicYears);
  const activeLevelId = levels.find((level) => level.status === 'active')?.id ?? levels[0]?.id ?? '';

  const isLoading =
    classesQuery.isLoading ||
    levelsQuery.isLoading ||
    academicYearsQuery.isLoading ||
    teachersQuery.isLoading ||
    subjectsQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'levels'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'academic-years'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'subjects'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'teachers'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassPayload) => academicApi.createClass(payload),
    onSuccess: () => {
      toast({
        title: 'Classe créée',
        description: 'La nouvelle classe a été enregistrée.',
      });
      invalidateAll();
      setIsCreateDialogOpen(false);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer la classe.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) => academicApi.updateClass(id, payload),
    onSuccess: () => {
      toast({
        title: 'Classe mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAll();
      setIsCreateDialogOpen(false);
      setSelectedClass(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier la classe.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteClass(id),
    onSuccess: () => {
      toast({
        title: 'Classe supprimée',
        description: 'La classe a bien été supprimée.',
      });
      invalidateAll();
      setClassToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer la classe.'),
      });
    },
  });

  const assignSubjectsMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignClassSubjectsPayload }) =>
      academicApi.assignClassSubjects(id, payload),
    onSuccess: () => {
      toast({
        title: 'Matières associées',
        description: 'Les matières de la classe ont été synchronisées.',
      });
      invalidateAll();
      setIsSubjectsDialogOpen(false);
      setSelectedClass(null);
      setSelectedSubjectIds([]);
    },
    onError: (error) => {
      toast({
        title: 'Erreur d’association',
        description: getApiErrorMessage(error, 'Impossible d’associer les matières.'),
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedClass(null);
    setFormData({
      ...createDefaultForm(),
      academicYearId: activeAcademicYearId,
      levelId: activeLevelId,
    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass);
    setFormData({
      name: schoolClass.name,
      levelId: schoolClass.levelId || schoolClass.level?.id || activeLevelId,
      capacity: String(schoolClass.capacity),
      academicYearId: schoolClass.academicYearId,
      teacherId: schoolClass.teacherId,
      status: schoolClass.status,
    });
    setIsCreateDialogOpen(true);
  };

  const openSubjectsDialog = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass);
    setSelectedSubjectIds(schoolClass.subjectIds ?? []);
    setIsSubjectsDialogOpen(true);
  };

  useEffect(() => {
    if (isSubjectsDialogOpen && selectedClass) {
      setSelectedSubjectIds(selectedClass.subjectIds ?? []);
    }
  }, [isSubjectsDialogOpen, selectedClass]);

  const openTeachersDialog = (schoolClass: SchoolClass) => {
    setSelectedClassForTeachers(schoolClass);
    setIsTeachersDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.levelId) {
      return;
    }

    const basePayload: CreateClassPayload = {
      name: formData.name.trim(),
      capacity: Math.max(1, Number(formData.capacity) || 40),
      levelId: formData.levelId,
      teacherId: formData.teacherId || undefined,
      status: formData.status,
    };

    if (selectedClass) {
      updateMutation.mutate({
        id: selectedClass.id,
        payload: {
          ...basePayload,
          academicYearId: formData.academicYearId || undefined,
        },
      });
      return;
    }

    createMutation.mutate(basePayload);
  };

  const handleSaveSubjects = () => {
    if (!selectedClass || selectedSubjectIds.length === 0) {
      return;
    }

    assignSubjectsMutation.mutate({
      id: selectedClass.id,
      payload: { subjectIds: selectedSubjectIds },
    });
  };

  const columns: Column<ClassRow>[] = [
    {
      key: 'name',
      label: 'Classe',
      sortable: true,
      render: (schoolClass) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{schoolClass.name}</p>
            <p className="text-xs text-muted-foreground">Capacité: {schoolClass.capacity}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'levelName',
      label: 'Niveau',
      sortable: true,
      render: (schoolClass) => <Badge variant="outline">{schoolClass.level?.name || 'Sans niveau'}</Badge>,
    },
    {
      key: 'students',
      label: 'Élèves',
      sortable: true,
      render: (schoolClass) => (
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {schoolClass.students}/{schoolClass.capacity}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (schoolClass) => (
        <Badge
          variant={
            schoolClass.status === 'active'
              ? 'default'
              : schoolClass.status === 'archived'
                ? 'secondary'
                : 'outline'
          }
        >
          {classStatusLabels[schoolClass.status]}
        </Badge>
      ),
    },
    {
      key: 'teachers',
      label: 'Profs',
      render: (schoolClass) => (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => openTeachersDialog(schoolClass)}>
          <Users className="h-3 w-3" />
          Voir
        </Button>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'archived', label: 'Archivée' },
      ],
    },
    {
      key: 'levelId',
      label: 'Niveau',
      options: levels.map((level: Level) => ({ value: level.id, label: level.name })),
    },
  ];

  const gridItem = (schoolClass: ClassRow) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{schoolClass.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge
                variant={
                  schoolClass.status === 'active'
                    ? 'default'
                    : schoolClass.status === 'archived'
                      ? 'secondary'
                      : 'outline'
                }
                >
                {classStatusLabels[schoolClass.status]}
              </Badge>
              <Badge variant="outline">{schoolClass.level?.name || 'Sans niveau'}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3 w-3" />
          {schoolClass.students} élève(s) / {schoolClass.capacity}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <School className="h-3 w-3" />
          {schoolClass.level?.name || 'Niveau non défini'}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {schoolClass.academicYear || 'Année non définie'}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Prof. principal: {schoolClass.teacher || 'Non assigné'}
        </span>
        <div className="flex flex-wrap gap-1 mt-2">
          {(schoolClass.subjects ?? []).slice(0, 3).map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject}
            </Badge>
          ))}
          {(schoolClass.subjects ?? []).length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{schoolClass.subjects.length - 3}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openSubjectsDialog(schoolClass)}>
          <Link className="h-3 w-3" />
          Matières
        </Button>
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openTeachersDialog(schoolClass)}>
          <Users className="h-3 w-3" />
          Profs
        </Button>
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(schoolClass)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setClassToDelete(schoolClass)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Chargement des données académiques...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des classes, enseignants et matières...
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStudents = classes.reduce((sum, schoolClass) => sum + schoolClass.students, 0);
  const totalCapacity = classes.reduce((sum, schoolClass) => sum + schoolClass.capacity, 0);
  const activeClasses = classes.filter((schoolClass) => schoolClass.status === 'active').length;
  const assignedClasses = classes.filter((schoolClass) => (schoolClass.subjectIds ?? []).length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Gérez les classes, les professeurs principaux et les matières associées.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouvelle classe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedClass ? 'Modifier la classe' : 'Ajouter une nouvelle classe'}</DialogTitle>
              <DialogDescription>
                {selectedClass
                  ? 'Modifiez le nom, le niveau, la capacité, l’année scolaire et le professeur principal.'
                  : 'Définissez le nom, le niveau, la capacité et le professeur principal. L’année active sera appliquée automatiquement.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!selectedClass && (
                <p className="text-xs text-muted-foreground">
                  La création se fera dans l’année active, sans sélection manuelle.
                </p>
              )}
              {!levels.length && (
                <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                  Crée d’abord un niveau dans le module Niveaux avant d’ajouter une classe.
                </div>
              )}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la classe</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Ex: Terminale S1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="levelId">Niveau</Label>
                <Select
                  value={formData.levelId}
                  onValueChange={(value) => setFormData((current) => ({ ...current, levelId: value }))}
                  disabled={!levels.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(event) => setFormData((current) => ({ ...current, capacity: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((current) => ({ ...current, status: value as SchoolClass['status'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archivée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedClass && (
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Année scolaire</Label>
                  <Select
                    value={formData.academicYearId}
                    onValueChange={(value) => setFormData((current) => ({ ...current, academicYearId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="teacher">Professeur principal</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData((current) => ({ ...current, teacherId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {formatTeacherLabel(teacher)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.levelId || !levels.length}>
                {selectedClass ? 'Enregistrer' : 'Créer la classe'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">Année scolaire</p>
          <p className="text-xs text-muted-foreground">Les classes affichées suivent l’année active par défaut.</p>
        </div>
        <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
          <SelectTrigger className="w-full md:w-[260px]">
            <SelectValue placeholder="Année active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CURRENT_ACADEMIC_SELECTION}>Année active</SelectItem>
            {academicYears.map((year: AcademicYear) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Classes</p>
            <p className="text-2xl font-bold">{classes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold">{activeClasses}</p>
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
            <p className="text-sm text-muted-foreground">Matières liées</p>
            <p className="text-2xl font-bold">{assignedClasses}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={classes}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher une classe..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune classe trouvée"
        itemsPerPage={6}
      />

      <Dialog open={isSubjectsDialogOpen} onOpenChange={setIsSubjectsDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Associer les matières</DialogTitle>
            <DialogDescription>
              Sélectionnez les matières enseignées dans {selectedClass?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {subjects.map((subject: Subject) => {
                const checked = selectedSubjectIds.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        if (value) {
                          setSelectedSubjectIds((current) => [...current, subject.id]);
                          return;
                        }

                        setSelectedSubjectIds((current) => current.filter((id) => id !== subject.id));
                      }}
                    />
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.code} - {subject.coefficient} coefficient
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Au moins une matière doit être associée à la classe pour l’enregistrer.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubjectsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveSubjects} disabled={selectedSubjectIds.length === 0}>
              Enregistrer les matières
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTeachersDialogOpen}
        onOpenChange={(open) => {
          setIsTeachersDialogOpen(open);
          if (!open) {
            setSelectedClassForTeachers(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Enseignants de {selectedClassForTeachers?.name}</DialogTitle>
            <DialogDescription>Liste des professeurs associés à cette classe.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {classTeachersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des enseignants...</p>
            ) : classTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun enseignant assigné à cette classe.</p>
            ) : (
              classTeachers.map((teacher: Teacher) => (
                <div key={teacher.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">
                      {teacher.firstName} {teacher.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.subject || 'Aucune matière principale'}
                    </p>
                  </div>
                  <Badge variant={teacher.status === 'active' ? 'secondary' : 'outline'}>
                    {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeachersDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(classToDelete)} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la classe</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {classToDelete?.name} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => classToDelete && deleteMutation.mutate(classToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
