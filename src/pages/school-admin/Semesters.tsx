import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Edit, Lock, Plus, Trash2, TrendingUp, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi, type CreateSemesterPayload, type UpdateSemesterPayload } from '@/services/academic';
import { CURRENT_ACADEMIC_SELECTION, resolveAcademicYearSelection } from '@/lib/academic-scope';
import type { AcademicYear, Semester } from '@/types/academic';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SemesterFormState = {
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  status: Semester['status'];
};

const createDefaultForm = (): SemesterFormState => ({
  name: '',
  academicYearId: '',
  startDate: '',
  endDate: '',
  status: 'active',
});

const statusLabel: Record<Semester['status'], string> = {
  active: 'En cours',
  completed: 'Terminé',
  locked: 'Verrouillé',
};

const formatSemesterAverage = (semester: Semester): string => {
  if (semester.average !== null) {
    return `${semester.average}/20`;
  }

  return semester.status === 'completed' ? 'Calcul en attente' : 'En cours';
};

export default function Semesters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<SemesterFormState>(createDefaultForm);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(CURRENT_ACADEMIC_SELECTION);

  const semestersQuery = useQuery({
    queryKey: ['school-admin', 'semesters', selectedAcademicYearId],
    queryFn: () =>
      academicApi.fetchSemesters(
        selectedAcademicYearId === CURRENT_ACADEMIC_SELECTION
          ? undefined
          : { academicYearId: selectedAcademicYearId },
      ),
    retry: false,
  });

  const academicYearsQuery = useQuery({
    queryKey: ['school-admin', 'academic-years'],
    queryFn: academicApi.fetchAcademicYears,
    retry: false,
  });

  const semesters = semestersQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];
  const activeAcademicYearId = resolveAcademicYearSelection(CURRENT_ACADEMIC_SELECTION, academicYears);

  const invalidateSemesters = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'semesters'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'academic-years'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateSemesterPayload) => academicApi.createSemester(payload),
    onSuccess: () => {
      toast({
        title: 'Semestre créé',
        description: 'Le semestre a été ajouté à l’année scolaire.',
      });
      invalidateSemesters();
      setIsAddDialogOpen(false);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer le semestre.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSemesterPayload }) =>
      academicApi.updateSemester(id, payload),
    onSuccess: () => {
      toast({
        title: 'Semestre mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateSemesters();
      setIsEditDialogOpen(false);
      setSelectedSemester(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier le semestre.'),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Semester['status'] }) =>
      academicApi.updateSemesterStatus(id, status),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le semestre a été synchronisé.',
      });
      invalidateSemesters();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de statut',
        description: getApiErrorMessage(error, 'Impossible de changer le statut.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteSemester(id),
    onSuccess: () => {
      toast({
        title: 'Semestre supprimé',
        description: 'La suppression a bien été prise en compte.',
      });
      invalidateSemesters();
      setSemesterToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer le semestre.'),
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedSemester(null);
    setFormData(createDefaultForm());
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (semester: Semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      academicYearId: semester.academicYearId,
      startDate: semester.startDate,
      endDate: semester.endDate,
      status: semester.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    };

    if (selectedSemester) {
      updateMutation.mutate({
        id: selectedSemester.id,
        payload: {
          ...payload,
          academicYearId: formData.academicYearId || activeAcademicYearId,
        },
      });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<Semester>[] = [
    {
      key: 'name',
      label: 'Semestre',
      sortable: true,
      render: (semester) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{semester.name}</p>
            <p className="text-xs text-muted-foreground">{semester.academicYear}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (semester) => (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {semester.startDate} - {semester.endDate}
        </span>
      ),
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (semester) => (
        <span className="flex items-center gap-1 font-medium">
          <TrendingUp className="h-3 w-3" />
          {formatSemesterAverage(semester)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (semester) => (
        <Badge
          variant={
            semester.status === 'active'
              ? 'default'
              : semester.status === 'completed'
                ? 'secondary'
                : 'outline'
          }
        >
          {statusLabel[semester.status]}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'active', label: 'En cours' },
        { value: 'completed', label: 'Terminé' },
        { value: 'locked', label: 'Verrouillé' },
      ],
    },
  ];

  const gridItem = (semester: Semester) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{semester.name}</h3>
            <p className="text-sm text-muted-foreground">{semester.academicYear}</p>
          </div>
        </div>
        <Badge
          variant={
            semester.status === 'active'
              ? 'default'
              : semester.status === 'completed'
                ? 'secondary'
                : 'outline'
          }
        >
          {statusLabel[semester.status]}
        </Badge>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {semester.startDate} - {semester.endDate}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Moyenne: {formatSemesterAverage(semester)}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        {semester.status === 'active' ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 flex-1"
            onClick={() => statusMutation.mutate({ id: semester.id, status: 'locked' })}
            disabled={statusMutation.isPending}
          >
            <Lock className="h-3 w-3" />
            Verrouiller
          </Button>
        ) : semester.status === 'locked' ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 flex-1"
            onClick={() => statusMutation.mutate({ id: semester.id, status: 'active' })}
            disabled={statusMutation.isPending}
          >
            <Unlock className="h-3 w-3" />
            Déverrouiller
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 flex-1"
            onClick={() => statusMutation.mutate({ id: semester.id, status: 'locked' })}
            disabled={statusMutation.isPending}
          >
            <Lock className="h-3 w-3" />
            Verrouiller
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(semester)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSemesterToDelete(semester)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le semestre</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le semestre {semester.name} de {semester.academicYear} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(semesterToDelete?.id ?? semester.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  const formDisabled = createMutation.isPending || updateMutation.isPending;

  const availableAcademicYears = useMemo(
    () => academicYears.map((year: AcademicYear) => ({ id: year.id, name: year.name })),
    [academicYears],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Semestres</h1>
          <p className="text-muted-foreground">Gérez les semestres de l’année active, avec la possibilité de filtrer par année.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouveau Semestre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau semestre</DialogTitle>
              <DialogDescription>
                Définissez les dates du semestre. L’année active est appliquée automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du semestre</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData((current) => ({ ...current, name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                    <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                Le semestre sera créé dans l’année active, sans sélection manuelle.
                La moyenne sera calculée automatiquement plus tard.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Semester['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="locked">Verrouillé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.startDate || !formData.endDate || formDisabled}>
                Créer le semestre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le semestre</DialogTitle>
              <DialogDescription>Modifiez les paramètres du semestre</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nom du semestre</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData((current) => ({ ...current, name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                    <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAcademicYear">Année académique</Label>
                <Select
                  value={formData.academicYearId}
                  onValueChange={(value) => setFormData((current) => ({ ...current, academicYearId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAcademicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartDate">Date de début</Label>
                  <Input
                    id="editStartDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEndDate">Date de fin</Label>
                  <Input
                    id="editEndDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Moyenne</Label>
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">{selectedSemester ? formatSemesterAverage(selectedSemester) : 'En attente'}</p>
                  <p className="text-xs text-muted-foreground">
                    Cette valeur est calculée automatiquement à partir des données des élèves.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Semester['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="locked">Verrouillé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.academicYearId || !formData.startDate || !formData.endDate || formDisabled}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">Année scolaire</p>
          <p className="text-xs text-muted-foreground">Les semestres affichés suivent l’année active par défaut.</p>
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

      <DataList
        data={semesters}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher un semestre..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun semestre trouvé"
        itemsPerPage={6}
      />
    </div>
  );
}
