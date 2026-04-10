import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, Edit, Lock, Plus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi, type CreateAcademicYearPayload, type UpdateAcademicYearPayload } from '@/services/academic';
import type { AcademicYear } from '@/types/academic';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AcademicYearFormState = {
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYear['status'];
};

const createDefaultForm = (): AcademicYearFormState => ({
  name: '',
  startDate: '',
  endDate: '',
  status: 'draft',
});

const statusLabel: Record<AcademicYear['status'], string> = {
  draft: 'Brouillon',
  active: 'Active',
  completed: 'Terminée',
};

export default function AcademicYears() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState<AcademicYearFormState>(createDefaultForm);

  const academicYearsQuery = useQuery({
    queryKey: ['school-admin', 'academic-years'],
    queryFn: academicApi.fetchAcademicYears,
    retry: false,
  });

  const academicYears = academicYearsQuery.data ?? [];

  const invalidateAcademicYears = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'academic-years'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'students'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'semesters'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAcademicYearPayload) => academicApi.createAcademicYear(payload),
    onSuccess: () => {
      toast({
        title: 'Année scolaire créée',
        description: 'Les données académiques ont été enregistrées.',
      });
      invalidateAcademicYears();
      setIsAddDialogOpen(false);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer l’année scolaire.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAcademicYearPayload }) =>
      academicApi.updateAcademicYear(id, payload),
    onSuccess: () => {
      toast({
        title: 'Année scolaire mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAcademicYears();
      setIsEditDialogOpen(false);
      setSelectedYear(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier l’année scolaire.'),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AcademicYear['status'] }) =>
      academicApi.updateAcademicYearStatus(id, status),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l’année scolaire a été synchronisé.',
      });
      invalidateAcademicYears();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de statut',
        description: getApiErrorMessage(error, 'Impossible de changer le statut.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteAcademicYear(id),
    onSuccess: () => {
      toast({
        title: 'Année scolaire supprimée',
        description: 'La suppression a bien été prise en compte.',
      });
      invalidateAcademicYears();
      setYearToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer l’année scolaire.'),
      });
    },
  });

  useEffect(() => {
    if (!isEditDialogOpen) {
      setSelectedYear(null);
    }
  }, [isEditDialogOpen]);

  const openCreateDialog = () => {
    setFormData(createDefaultForm());
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (year: AcademicYear) => {
    setSelectedYear(year);
    setFormData({
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      status: year.status,
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

    if (selectedYear) {
      updateMutation.mutate({ id: selectedYear.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<AcademicYear>[] = [
    {
      key: 'name',
      label: 'Année',
      sortable: true,
      render: (year) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{year.name}</p>
            <p className="text-xs text-muted-foreground">
              {year.startDate} - {year.endDate}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Élèves',
      sortable: true,
      render: (year) => (
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {year.students.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (year) => (
        <Badge
          variant={
            year.status === 'active'
              ? 'default'
              : year.status === 'completed'
                ? 'secondary'
                : 'outline'
          }
        >
          {statusLabel[year.status]}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Terminée' },
        { value: 'draft', label: 'Brouillon' },
      ],
    },
  ];

  const gridItem = (year: AcademicYear) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{year.name}</h3>
            <Badge
              variant={
                year.status === 'active'
                  ? 'default'
                  : year.status === 'completed'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {statusLabel[year.status]}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {year.startDate} - {year.endDate}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3 w-3" />
          {year.students.toLocaleString()} élèves
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        {year.status === 'draft' ? (
          <Button
            variant="default"
            size="sm"
            className="gap-1 flex-1"
            onClick={() => statusMutation.mutate({ id: year.id, status: 'active' })}
            disabled={statusMutation.isPending}
          >
            <Check className="h-3 w-3" />
            Activer
          </Button>
        ) : year.status === 'active' ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 flex-1"
            onClick={() => statusMutation.mutate({ id: year.id, status: 'draft' })}
            disabled={statusMutation.isPending}
          >
            <Lock className="h-3 w-3" />
            Désactiver
          </Button>
        ) : null}
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(year)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setYearToDelete(year)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l'année académique</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l'année {year.name} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(yearToDelete?.id ?? year.id)}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Années Scolaires</h1>
          <p className="text-muted-foreground">Gérez les années académiques de l'école</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouvelle Année
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle année académique</DialogTitle>
              <DialogDescription>Définissez les dates de l'année scolaire</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'année</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex: 2025-2026"
                />
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
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as AcademicYear['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.startDate || !formData.endDate || formDisabled}>
                Créer l'année
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'année académique</DialogTitle>
              <DialogDescription>Modifiez les paramètres de l'année scolaire</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nom de l'année</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                />
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
                <Label htmlFor="editStatus">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as AcademicYear['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.startDate || !formData.endDate || formDisabled}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataList
        data={academicYears}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une année..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune année trouvée"
        itemsPerPage={6}
      />
    </div>
  );
}
