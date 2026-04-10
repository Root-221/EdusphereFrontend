import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Edit, Mail, Plus, Phone, School, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi } from '@/services/academic';
import { usersApi, type CreateTeacherPayload, type UpdateTeacherPayload } from '@/services/users';
import type { Subject } from '@/types/academic';
import type { Teacher } from '@/types/users';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TeacherFormState = {
  firstName: string;
  name: string;
  email: string;
  phone: string;
  subjectId: string;
  status: Teacher['status'];
};

const createDefaultForm = (): TeacherFormState => ({
  firstName: '',
  name: '',
  email: '',
  phone: '',
  subjectId: '',
  status: 'active',
});

type TeacherRow = Teacher & { searchText: string };

const formatTeacherLabel = (teacher: Teacher) => `${teacher.firstName} ${teacher.name}`;

export default function Teachers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormState>(createDefaultForm);

  const teachersQuery = useQuery({
    queryKey: ['school-admin', 'teachers'],
    queryFn: usersApi.fetchTeachers,
    retry: false,
  });

  const subjectsQuery = useQuery({
    queryKey: ['school-admin', 'subjects'],
    queryFn: academicApi.fetchSubjects,
    retry: false,
  });

  const teachers = useMemo<TeacherRow[]>(
    () =>
      (teachersQuery.data ?? []).map((teacher) => ({
        ...teacher,
        searchText: [teacher.firstName, teacher.name, teacher.email, teacher.phone, teacher.subject, teacher.status]
          .join(' ')
          .toLowerCase(),
      })),
    [teachersQuery.data],
  );

  const subjects = subjectsQuery.data ?? [];

  const isLoading = teachersQuery.isLoading || subjectsQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'teachers'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'subjects'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeacherPayload) => usersApi.createTeacher(payload),
    onSuccess: () => {
      toast({
        title: 'Enseignant créé',
        description: 'Le nouvel enseignant a été ajouté.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedTeacher(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer l’enseignant.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeacherPayload }) => usersApi.updateTeacher(id, payload),
    onSuccess: () => {
      toast({
        title: 'Enseignant mis à jour',
        description: 'Les informations ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedTeacher(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier l’enseignant.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteTeacher(id),
    onSuccess: () => {
      toast({
        title: 'Enseignant supprimé',
        description: 'L’enseignant a bien été supprimé.',
      });
      invalidateAll();
      setTeacherToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer l’enseignant.'),
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Teacher['status'] }) =>
      usersApi.updateTeacher(id, { isActive: status !== 'active' }),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l’enseignant a été synchronisé.',
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de statut',
        description: getApiErrorMessage(error, 'Impossible de changer le statut.'),
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedTeacher(null);
    setFormData(createDefaultForm());
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjectId: teacher.subjectId,
      status: teacher.status,
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload: CreateTeacherPayload = {
      firstName: formData.firstName.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      subjectId: formData.subjectId || undefined,
      isActive: formData.status === 'active',
    };

    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<TeacherRow>[] = [
    {
      key: 'name',
      label: 'Enseignant',
      sortable: true,
      render: (teacher) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {teacher.firstName[0]}
              {teacher.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {teacher.firstName} {teacher.name}
            </p>
            <p className="text-xs text-muted-foreground">{teacher.subject || 'Aucune matière principale'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (teacher) => (
        <span className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" />
          {teacher.email}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (teacher) => (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3" />
          {teacher.phone || 'Non renseigné'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (teacher) => (
        <Badge variant={teacher.status === 'active' ? 'secondary' : 'outline'}>
          {teacher.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
      ],
    },
    {
      key: 'subjectId',
      label: 'Matière',
      options: subjects.map((subject: Subject) => ({ value: subject.id, label: subject.name })),
    },
  ];

  const gridItem = (teacher: TeacherRow) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {teacher.firstName[0]}
            {teacher.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {teacher.firstName} {teacher.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {teacher.subject || 'Aucune matière'}
            </Badge>
            <Badge variant={teacher.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
              {teacher.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3 w-3" />
          {teacher.email}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3 w-3" />
          {teacher.phone || 'Non renseigné'}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          {teacher.subject || 'Aucune matière principale'}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 flex-1"
          onClick={() =>
            toggleStatusMutation.mutate({
              id: teacher.id,
              status: teacher.status,
            })
          }
        >
          {teacher.status === 'active' ? 'Désactiver' : 'Activer'}
        </Button>
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(teacher)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setTeacherToDelete(teacher)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">Chargement des enseignants et matières...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des données du personnel enseignant...
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeTeachers = teachers.filter((teacher) => teacher.status === 'active').length;
  const inactiveTeachers = teachers.filter((teacher) => teacher.status === 'inactive').length;
  const coveredSubjects = new Set(teachers.map((teacher) => teacher.subjectId).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">Gérez le corps enseignant et leur matière principale.</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouvel enseignant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedTeacher ? 'Modifier l’enseignant' : 'Ajouter un nouvel enseignant'}</DialogTitle>
              <DialogDescription>Renseignez l’identité et la matière principale de l’enseignant.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                    placeholder="email@ecole.sn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+221 77 xxx xx xx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matière principale</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData((current) => ({ ...current, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: Subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Teacher['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.firstName || !formData.name || !formData.email}>
                {selectedTeacher ? 'Enregistrer' : 'Créer l’enseignant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Enseignants</p>
            <p className="text-2xl font-bold">{teachers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeTeachers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inactifs</p>
            <p className="text-2xl font-bold">{inactiveTeachers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Matières couvertes</p>
            <p className="text-2xl font-bold">{coveredSubjects}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={teachers}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un enseignant..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun enseignant trouvé"
        itemsPerPage={6}
      />

      <AlertDialog open={Boolean(teacherToDelete)} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’enseignant</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {teacherToDelete ? formatTeacherLabel(teacherToDelete) : 'cet enseignant'} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => teacherToDelete && deleteMutation.mutate(teacherToDelete.id)}
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
