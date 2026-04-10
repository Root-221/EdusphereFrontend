import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, Edit, Plus, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi, type CreateSubjectPayload, type UpdateSubjectPayload } from '@/services/academic';
import { usersApi } from '@/services/users';
import type { Subject } from '@/types/academic';
import type { Teacher } from '@/types/users';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const subjectStatusLabels: Record<Subject['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
};

type SubjectFormState = {
  name: string;
  code: string;
  hours: string;
  coefficient: string;
  description: string;
  status: Subject['status'];
};

const createDefaultForm = (): SubjectFormState => ({
  name: '',
  code: '',
  hours: '3',
  coefficient: '2',
  description: '',
  status: 'active',
});

type SubjectRow = Subject & { searchText: string };

const formatTeacherLabel = (teacher: Teacher) => `${teacher.firstName} ${teacher.name}`;

export default function Subjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isTeachersDialogOpen, setIsTeachersDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormState>(createDefaultForm);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const subjectsQuery = useQuery({
    queryKey: ['school-admin', 'subjects'],
    queryFn: academicApi.fetchSubjects,
    retry: false,
  });

  const teachersQuery = useQuery({
    queryKey: ['school-admin', 'teachers'],
    queryFn: usersApi.fetchTeachers,
    retry: false,
  });

  const timetableOptionsQuery = useQuery({
    queryKey: ['school-admin', 'timetable-options'],
    queryFn: academicApi.fetchTimetableOptions,
    retry: false,
  });

  const subjects = useMemo<SubjectRow[]>(
    () =>
      (subjectsQuery.data ?? []).map((subject) => ({
        ...subject,
        searchText: [
          subject.name,
          subject.code,
          subject.description,
          ...(subject.teacherNames ?? []),
          subject.status,
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [subjectsQuery.data],
  );

  const teachers = teachersQuery.data ?? [];
  const timetableOptions = timetableOptionsQuery.data;
  const currentAcademicYearId = timetableOptions?.currentAcademicYearId;
  const currentSemesterId = timetableOptions?.currentSemesterId;
  const currentAcademicYearLabel =
    currentAcademicYearId
      ? timetableOptions?.academicYears.find((year) => year.id === currentAcademicYearId)?.name ?? 'Année active'
      : 'Année active';
  const currentSemesterLabel =
    currentSemesterId
      ? timetableOptions?.semesters.find((semester) => semester.id === currentSemesterId)?.name ?? 'Semestre en cours'
      : 'Semestre en cours';

  const isLoading = subjectsQuery.isLoading || teachersQuery.isLoading || timetableOptionsQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'subjects'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'teachers'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubjectPayload) => academicApi.createSubject(payload),
    onSuccess: () => {
      toast({
        title: 'Matière créée',
        description: 'La nouvelle matière a été enregistrée.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedSubject(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer la matière.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) => academicApi.updateSubject(id, payload),
    onSuccess: () => {
      toast({
        title: 'Matière mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedSubject(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier la matière.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteSubject(id),
    onSuccess: () => {
      toast({
        title: 'Matière supprimée',
        description: 'La matière a bien été supprimée.',
      });
      invalidateAll();
      setSubjectToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer la matière.'),
      });
    },
  });

  const assignTeachersMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { teacherIds: string[] } }) =>
      academicApi.assignSubjectTeachers(id, payload),
    onSuccess: () => {
      toast({
        title: 'Enseignants associés',
        description: 'Les enseignants liés à la matière ont été synchronisés.',
      });
      invalidateAll();
      setIsTeachersDialogOpen(false);
      setSelectedSubject(null);
      setSelectedTeacherIds([]);
    },
    onError: (error) => {
      toast({
        title: 'Erreur d’association',
        description: getApiErrorMessage(error, 'Impossible d’associer les enseignants.'),
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedSubject(null);
    setFormData(createDefaultForm());
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      hours: String(subject.hours),
      coefficient: String(subject.coefficient),
      description: subject.description || '',
      status: subject.status,
    });
    setIsFormDialogOpen(true);
  };

  const openTeachersDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTeacherIds(subject.teacherIds ?? []);
    setIsTeachersDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload: CreateSubjectPayload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      hours: Math.max(1, Number(formData.hours) || 1),
      coefficient: Math.max(1, Number(formData.coefficient) || 1),
      description: formData.description.trim() || undefined,
      status: formData.status,
    };

    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleSaveTeachers = () => {
    if (!selectedSubject || selectedTeacherIds.length === 0) {
      return;
    }

    assignTeachersMutation.mutate({
      id: selectedSubject.id,
      payload: { teacherIds: selectedTeacherIds },
    });
  };

  const columns: Column<SubjectRow>[] = [
    {
      key: 'name',
      label: 'Matière',
      sortable: true,
      render: (subject) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{subject.name}</p>
            <Badge variant="outline" className="text-xs">
              {subject.code}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'teachers',
      label: 'Enseignants',
      sortable: true,
      render: (subject) => (
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {subject.teachers}
        </span>
      ),
    },
    {
      key: 'hours',
      label: 'Heures',
      sortable: true,
      render: (subject) => (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {subject.hours}h
        </span>
      ),
    },
    {
      key: 'coefficient',
      label: 'Coefficient',
      sortable: true,
      render: (subject) => (
        <span className="font-medium">{subject.coefficient}</span>
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
      ],
    },
  ];

  const gridItem = (subject: SubjectRow) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{subject.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline">{subject.code}</Badge>
              <Badge variant={subject.status === 'active' ? 'default' : 'outline'}>
                {subjectStatusLabels[subject.status]}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {subject.description && (
        <p className="text-sm text-muted-foreground line-clamp-3">{subject.description}</p>
      )}
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3" />
          {subject.teachers} enseignant(s)
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {subject.hours}h / semaine
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Coefficient: {subject.coefficient}
        </span>
        <div className="flex flex-wrap gap-1 mt-2">
          {(subject.teacherNames ?? []).slice(0, 2).map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
          {(subject.teacherNames ?? []).length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{subject.teacherNames.length - 2}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openTeachersDialog(subject)}>
          <User className="h-3 w-3" />
          Profs
        </Button>
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(subject)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSubjectToDelete(subject)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matières</h1>
          <p className="text-muted-foreground">Chargement des matières et enseignants...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des données académiques...
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);
  const activeSubjects = subjects.filter((subject) => subject.status === 'active').length;
  const assignedSubjects = subjects.filter((subject) => (subject.teacherIds ?? []).length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matières</h1>
          <p className="text-muted-foreground">
            Gérez les matières, leur volume horaire et les enseignants associés dans le contexte courant.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{currentAcademicYearLabel}</Badge>
            <Badge variant="outline">{currentSemesterLabel}</Badge>
          </div>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouvelle matière
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedSubject ? 'Modifier la matière' : 'Ajouter une nouvelle matière'}</DialogTitle>
              <DialogDescription>
                Renseignez le nom, le code et les paramètres pédagogiques de la matière.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la matière</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Ex: Mathématiques"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                    }
                    placeholder="Ex: MAT"
                    maxLength={8}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Heures / semaine</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    value={formData.hours}
                    onChange={(event) => setFormData((current) => ({ ...current, hours: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coefficient">Coefficient</Label>
                  <Input
                    id="coefficient"
                    type="number"
                    min="1"
                    value={formData.coefficient}
                    onChange={(event) => setFormData((current) => ({ ...current, coefficient: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Subject['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Décrivez brièvement le contenu ou le niveau de la matière"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
                {selectedSubject ? 'Enregistrer' : 'Créer la matière'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Matières</p>
            <p className="text-2xl font-bold">{subjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold">{activeSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Enseignants liés</p>
            <p className="text-2xl font-bold">{assignedSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Heures / semaine</p>
            <p className="text-2xl font-bold">{totalHours}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={subjects}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher une matière..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune matière trouvée"
        itemsPerPage={6}
      />

      <Dialog open={isTeachersDialogOpen} onOpenChange={setIsTeachersDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Assigner des enseignants</DialogTitle>
            <DialogDescription>
              Sélectionnez les enseignants liés à {selectedSubject?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {teachers.map((teacher) => {
                const checked = selectedTeacherIds.includes(teacher.id);
                return (
                  <label
                    key={teacher.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        if (value) {
                          setSelectedTeacherIds((current) => [...current, teacher.id]);
                          return;
                        }

                        setSelectedTeacherIds((current) => current.filter((id) => id !== teacher.id));
                      }}
                    />
                    <div>
                      <p className="font-medium">{formatTeacherLabel(teacher)}</p>
                      <p className="text-xs text-muted-foreground">{teacher.subject || 'Aucune matière principale'}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Une matière doit rester liée à au moins un enseignant.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeachersDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTeachers} disabled={selectedTeacherIds.length === 0}>
              Enregistrer les enseignants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(subjectToDelete)} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la matière</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {subjectToDelete?.name} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subjectToDelete && deleteMutation.mutate(subjectToDelete.id)}
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
