import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Edit, Mail, Plus, Phone, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersApi, type CreateStaffPayload, type UpdateStaffPayload } from '@/services/users';
import type { Staff } from '@/types/users';
import { staffDepartments, staffRoleOptions } from '@/types/users';
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

type StaffFormState = {
  firstName: string;
  name: string;
  email: string;
  phone: string;
  roleId: Staff['roleId'];
  department: string;
  hireDate: string;
  status: Staff['status'];
};

const createDefaultForm = (): StaffFormState => ({
  firstName: '',
  name: '',
  email: '',
  phone: '',
  roleId: 'secretary',
  department: 'Administration',
  hireDate: '',
  status: 'active',
});

type StaffRow = Staff & { searchText: string };

const getRoleIcon = (roleId: Staff['roleId']) => {
  return staffRoleOptions.find((role) => role.key === roleId)?.icon ?? Briefcase;
};

export default function StaffPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormState>(createDefaultForm);

  const staffQuery = useQuery({
    queryKey: ['school-admin', 'staff'],
    queryFn: usersApi.fetchStaff,
    retry: false,
  });

  const staff = useMemo<StaffRow[]>(
    () =>
      (staffQuery.data ?? []).map((member) => ({
        ...member,
        searchText: [member.firstName, member.name, member.email, member.phone, member.role, member.department, member.status]
          .join(' ')
          .toLowerCase(),
      })),
    [staffQuery.data],
  );

  const isLoading = staffQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'staff'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateStaffPayload) => usersApi.createStaff(payload),
    onSuccess: () => {
      toast({
        title: 'Membre créé',
        description: 'Le membre du personnel a été ajouté.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedStaff(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer le membre du personnel.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) => usersApi.updateStaff(id, payload),
    onSuccess: () => {
      toast({
        title: 'Membre mis à jour',
        description: 'Les informations ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedStaff(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier le membre du personnel.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteStaff(id),
    onSuccess: () => {
      toast({
        title: 'Membre supprimé',
        description: 'Le membre du personnel a bien été supprimé.',
      });
      invalidateAll();
      setStaffToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer le membre du personnel.'),
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Staff['status'] }) =>
      usersApi.updateStaff(id, { isActive: status !== 'active' }),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du membre du personnel a été synchronisé.',
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
    setSelectedStaff(null);
    setFormData(createDefaultForm());
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (member: Staff) => {
    setSelectedStaff(member);
    setFormData({
      firstName: member.firstName,
      name: member.name,
      email: member.email,
      phone: member.phone,
      roleId: member.roleId,
      department: member.department,
      hireDate: member.hireDate,
      status: member.status,
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload: CreateStaffPayload = {
      firstName: formData.firstName.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      roleId: formData.roleId,
      department: formData.department || undefined,
      hireDate: formData.hireDate || undefined,
      isActive: formData.status === 'active',
    };

    if (selectedStaff) {
      updateMutation.mutate({ id: selectedStaff.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<StaffRow>[] = [
    {
      key: 'name',
      label: 'Personnel',
      sortable: true,
      render: (member) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {member.firstName[0]}
              {member.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {member.firstName} {member.name}
            </p>
            <p className="text-xs text-muted-foreground">{member.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Département',
      sortable: true,
      render: (member) => <Badge variant="outline">{member.department}</Badge>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (member) => (
        <span className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" />
          {member.email}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (member) => (
        <Badge variant={member.status === 'active' ? 'secondary' : 'outline'}>
          {member.status === 'active' ? 'Actif' : 'Inactif'}
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
      key: 'roleId',
      label: 'Fonction',
      options: staffRoleOptions.map((role) => ({ value: role.key, label: role.label })),
    },
    {
      key: 'department',
      label: 'Département',
      options: [...staffDepartments].map((department) => ({ value: department, label: department })),
    },
  ];

  const gridItem = (member: StaffRow) => {
    const RoleIcon = getRoleIcon(member.roleId);

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {member.firstName[0]}
              {member.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {member.firstName} {member.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <RoleIcon className="mr-1 h-3 w-3" />
                {member.role}
              </Badge>
              <Badge variant={member.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                {member.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            {member.department}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            {member.email}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            {member.phone || 'Non renseigné'}
          </span>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 flex-1"
            onClick={() =>
              toggleStatusMutation.mutate({
                id: member.id,
                status: member.status,
              })
            }
          >
            {member.status === 'active' ? 'Désactiver' : 'Activer'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(member)}>
            <Edit className="h-3 w-3" />
            Modifier
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setStaffToDelete(member)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personnel Administratif</h1>
          <p className="text-muted-foreground">Chargement du personnel...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des membres du personnel...
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeStaff = staff.filter((member) => member.status === 'active').length;
  const inactiveStaff = staff.filter((member) => member.status === 'inactive').length;
  const departmentsCount = new Set(staff.map((member) => member.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personnel Administratif</h1>
          <p className="text-muted-foreground">Gérez les membres du personnel administratif de l’école.</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouveau membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedStaff ? 'Modifier le membre' : 'Ajouter un membre'}</DialogTitle>
              <DialogDescription>Complétez les informations administratives du personnel.</DialogDescription>
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
                  <Label htmlFor="roleId">Fonction</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData((current) => ({ ...current, roleId: value as Staff['roleId'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffRoleOptions.map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData((current) => ({ ...current, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffDepartments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Date d’embauche</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(event) => setFormData((current) => ({ ...current, hireDate: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Staff['status'] }))}
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
                {selectedStaff ? 'Enregistrer' : 'Créer le membre'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Membres</p>
            <p className="text-2xl font-bold">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeStaff}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inactifs</p>
            <p className="text-2xl font-bold">{inactiveStaff}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Départements</p>
            <p className="text-2xl font-bold">{departmentsCount}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={staff}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un membre..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun membre du personnel trouvé"
        itemsPerPage={6}
      />

      <AlertDialog open={Boolean(staffToDelete)} onOpenChange={(open) => !open && setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le membre du personnel</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              {staffToDelete ? `${staffToDelete.firstName} ${staffToDelete.name}` : 'ce membre'} ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => staffToDelete && deleteMutation.mutate(staffToDelete.id)}
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
