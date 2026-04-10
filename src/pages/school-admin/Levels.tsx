import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Layers3, Plus, School, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi, type CreateLevelPayload, type UpdateLevelPayload } from '@/services/academic';
import type { Level } from '@/types/academic';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const levelStatusLabels: Record<Level['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archivée',
};

type LevelFormState = {
  name: string;
  sortOrder: string;
  description: string;
  status: Level['status'];
};

const createDefaultForm = (): LevelFormState => ({
  name: '',
  sortOrder: '0',
  description: '',
  status: 'active',
});

type LevelRow = Level & { searchText: string };

export default function Levels() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const [formData, setFormData] = useState<LevelFormState>(createDefaultForm);

  const levelsQuery = useQuery({
    queryKey: ['school-admin', 'levels'],
    queryFn: () => academicApi.fetchLevels(),
    retry: false,
  });

  const levels = useMemo<LevelRow[]>(
    () =>
      (levelsQuery.data ?? []).map((level) => ({
        ...level,
        searchText: [
          level.name,
          level.description,
          level.status,
          String(level.sortOrder),
          String(level.classes),
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [levelsQuery.data],
  );

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'levels'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'students'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateLevelPayload) => academicApi.createLevel(payload),
    onSuccess: () => {
      toast({
        title: 'Niveau créé',
        description: 'Le nouveau niveau a été enregistré.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedLevel(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer le niveau.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLevelPayload }) => academicApi.updateLevel(id, payload),
    onSuccess: () => {
      toast({
        title: 'Niveau mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedLevel(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier le niveau.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteLevel(id),
    onSuccess: () => {
      toast({
        title: 'Niveau supprimé',
        description: 'Le niveau a bien été supprimé.',
      });
      invalidateAll();
      setLevelToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Suppression impossible',
        description: getApiErrorMessage(error, 'Impossible de supprimer ce niveau.'),
      });
    },
  });

  useEffect(() => {
    if (!isFormDialogOpen) {
      setSelectedLevel(null);
    }
  }, [isFormDialogOpen]);

  const openCreateDialog = () => {
    setSelectedLevel(null);
    setFormData(createDefaultForm());
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (level: Level) => {
    setSelectedLevel(level);
    setFormData({
      name: level.name,
      sortOrder: String(level.sortOrder),
      description: level.description || '',
      status: level.status,
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload: CreateLevelPayload = {
      name: formData.name.trim(),
      sortOrder: Math.max(0, Number(formData.sortOrder) || 0),
      description: formData.description.trim() || undefined,
      status: formData.status,
    };

    if (selectedLevel) {
      updateMutation.mutate({ id: selectedLevel.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<LevelRow>[] = [
    {
      key: 'name',
      label: 'Niveau',
      sortable: true,
      render: (level) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Layers3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{level.name}</p>
            <p className="text-xs text-muted-foreground">
              Ordre {level.sortOrder} · {level.description || 'Aucune description'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'classes',
      label: 'Classes',
      sortable: true,
      render: (level) => (
        <span className="flex items-center gap-1">
          <School className="h-3 w-3" />
          {level.classes.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (level) => (
        <Badge
          variant={
            level.status === 'active'
              ? 'default'
              : level.status === 'archived'
                ? 'secondary'
                : 'outline'
          }
        >
          {levelStatusLabels[level.status]}
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
        { value: 'inactive', label: 'Inactive' },
        { value: 'archived', label: 'Archivée' },
      ],
    },
  ];

  const gridItem = (level: LevelRow) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Layers3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{level.name}</h3>
            <Badge
              variant={
                level.status === 'active'
                  ? 'default'
                  : level.status === 'archived'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {levelStatusLabels[level.status]}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <School className="h-3 w-3" />
          {level.classes.toLocaleString()} classe(s)
        </span>
        <span className="text-muted-foreground">
          Ordre d'affichage: {level.sortOrder}
        </span>
        {level.description && (
          <p className="text-muted-foreground line-clamp-2">{level.description}</p>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(level)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setLevelToDelete(level)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le niveau</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le niveau {level.name} ? Les classes déjà liées empêcheront la suppression.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(levelToDelete?.id ?? level.id)}
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
          <h1 className="text-2xl font-bold tracking-tight">Niveaux</h1>
          <p className="text-muted-foreground">Gérez les niveaux scolaires utilisés pour organiser les classes.</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouveau niveau
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedLevel ? 'Modifier le niveau' : 'Créer un nouveau niveau'}</DialogTitle>
              <DialogDescription>
                {selectedLevel
                  ? 'Mettez à jour le nom, l’ordre d’affichage et le statut du niveau.'
                  : 'Définissez le niveau qui sera ensuite associé aux classes.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du niveau</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex: Terminale"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Ordre d'affichage</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(event) => setFormData((current) => ({ ...current, sortOrder: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((current) => ({ ...current, status: value as Level['status'] }))
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Ex: Niveau de fin de cycle."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || formDisabled}>
                {selectedLevel ? 'Enregistrer' : 'Créer le niveau'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Niveaux</p>
            <p className="text-2xl font-bold">{levels.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{levels.filter((level) => level.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Classes liées</p>
            <p className="text-2xl font-bold">
              {levels.reduce((sum, level) => sum + level.classes, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={levels}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un niveau..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun niveau trouvé"
        itemsPerPage={6}
      />
    </div>
  );
}
