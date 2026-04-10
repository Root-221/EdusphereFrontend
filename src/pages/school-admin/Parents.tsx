import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Mail, Plus, Phone, School, Trash2, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { academicApi } from '@/services/academic';
import { usersApi, type CreateParentPayload, type UpdateParentPayload } from '@/services/users';
import type { SchoolClass } from '@/types/academic';
import type { Parent } from '@/types/users';
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
import { Textarea } from '@/components/ui/textarea';

type ParentFormState = {
  firstName: string;
  name: string;
  email: string;
  phone: string;
  children: string;
  childClassId: string;
  profession: string;
  status: Parent['status'];
};

const createDefaultForm = (): ParentFormState => ({
  firstName: '',
  name: '',
  email: '',
  phone: '',
  children: '1',
  childClassId: '',
  profession: '',
  status: 'active',
});

type ParentRow = Parent & { searchText: string };

export default function Parents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [formData, setFormData] = useState<ParentFormState>(createDefaultForm);

  const parentsQuery = useQuery({
    queryKey: ['school-admin', 'parents'],
    queryFn: usersApi.fetchParents,
    retry: false,
  });

  const classesQuery = useQuery({
    queryKey: ['school-admin', 'classes'],
    queryFn: () => academicApi.fetchClasses(),
    retry: false,
  });

  const parents = useMemo<ParentRow[]>(
    () =>
      (parentsQuery.data ?? []).map((parent) => ({
        ...parent,
        searchText: [
          parent.firstName,
          parent.name,
          parent.email,
          parent.phone,
          parent.childClass,
          String(parent.children),
          parent.profession,
          parent.status,
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [parentsQuery.data],
  );

  const classes = classesQuery.data ?? [];

  const isLoading = parentsQuery.isLoading || classesQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'parents'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'students'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateParentPayload) => usersApi.createParent(payload),
    onSuccess: () => {
      toast({
        title: 'Parent créé',
        description: 'Le nouveau parent a été ajouté.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedParent(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer le parent.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateParentPayload }) => usersApi.updateParent(id, payload),
    onSuccess: () => {
      toast({
        title: 'Parent mis à jour',
        description: 'Les informations ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedParent(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier le parent.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteParent(id),
    onSuccess: () => {
      toast({
        title: 'Parent supprimé',
        description: 'Le parent a bien été supprimé.',
      });
      invalidateAll();
      setParentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer le parent.'),
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedParent(null);
    setFormData(createDefaultForm());
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (parent: Parent) => {
    setSelectedParent(parent);
    setFormData({
      firstName: parent.firstName,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      children: String(parent.children ?? 1),
      childClassId: parent.childClassId,
      profession: parent.profession || '',
      status: parent.status,
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload: CreateParentPayload = {
      firstName: formData.firstName.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      children: Math.max(1, Number(formData.children) || 1),
      childClassId: formData.childClassId || undefined,
      profession: formData.profession.trim() || undefined,
      isActive: formData.status === 'active',
    };

    if (selectedParent) {
      updateMutation.mutate({ id: selectedParent.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<ParentRow>[] = [
    {
      key: 'name',
      label: 'Parent',
      sortable: true,
      render: (parent) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {parent.firstName[0]}
              {parent.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {parent.firstName} {parent.name}
            </p>
            <p className="text-xs text-muted-foreground">{parent.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'children',
      label: 'Enfants',
      sortable: true,
      render: (parent) => (
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {parent.children}
        </span>
      ),
    },
    {
      key: 'childClass',
      label: 'Classe liée',
      sortable: true,
      render: (parent) => <Badge variant="outline">{parent.childClass || 'Non assignée'}</Badge>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (parent) => (
        <Badge variant={parent.status === 'active' ? 'secondary' : 'outline'}>
          {parent.status === 'active' ? 'Actif' : 'Inactif'}
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
      key: 'childClassId',
      label: 'Classe',
      options: classes.map((schoolClass: SchoolClass) => ({ value: schoolClass.id, label: schoolClass.name })),
    },
  ];

  const gridItem = (parent: ParentRow) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {parent.firstName[0]}
            {parent.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {parent.firstName} {parent.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {parent.childClass || 'Non assignée'}
            </Badge>
            <Badge variant={parent.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
              {parent.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3 w-3" />
          {parent.email}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3 w-3" />
          {parent.phone || 'Non renseigné'}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <School className="h-3 w-3" />
          {parent.children} enfant(s)
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3" />
          {parent.profession || 'Profession non renseignée'}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(parent)}>
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setParentToDelete(parent)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground">Chargement des comptes parents...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des parents et classes...
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeParents = parents.filter((parent) => parent.status === 'active').length;
  const totalChildren = parents.reduce((sum, parent) => sum + parent.children, 0);
  const connectedParents = parents.filter((parent) => Boolean(parent.phone)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground">Gérez les comptes parents et leur rattachement aux classes.</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouveau parent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedParent ? 'Modifier le parent' : 'Ajouter un parent'}</DialogTitle>
              <DialogDescription>Complétez les informations du compte parent.</DialogDescription>
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
                    placeholder="email@email.sn"
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
                  <Label htmlFor="children">Nombre d’enfants</Label>
                  <Input
                    id="children"
                    type="number"
                    min="1"
                    value={formData.children}
                    onChange={(event) => setFormData((current) => ({ ...current, children: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childClassId">Classe liée</Label>
                  <Select
                    value={formData.childClassId}
                    onValueChange={(value) => setFormData((current) => ({ ...current, childClassId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((schoolClass: SchoolClass) => (
                        <SelectItem key={schoolClass.id} value={schoolClass.id}>
                          {schoolClass.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(event) => setFormData((current) => ({ ...current, profession: event.target.value }))}
                    placeholder="Profession"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Parent['status'] }))}
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
                {selectedParent ? 'Enregistrer' : 'Créer le parent'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Parents</p>
            <p className="text-2xl font-bold">{parents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeParents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Téléphones connus</p>
            <p className="text-2xl font-bold">{connectedParents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Enfants suivis</p>
            <p className="text-2xl font-bold">{totalChildren}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={parents}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un parent..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun parent trouvé"
        itemsPerPage={6}
      />

      <AlertDialog open={Boolean(parentToDelete)} onOpenChange={(open) => !open && setParentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le parent</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              {parentToDelete ? `${parentToDelete.firstName} ${parentToDelete.name}` : 'ce parent'} ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => parentToDelete && deleteMutation.mutate(parentToDelete.id)}
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
