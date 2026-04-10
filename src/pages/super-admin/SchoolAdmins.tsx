import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataList, Column } from '@/components/ui/data-list';
import { 
  UserCog, 
  Plus, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  Shield,
  MoreHorizontal,
  Key,
  Ban,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { superAdminApi, SchoolAdminRecord } from '@/services/superAdmin';

export default function SchoolAdmins() {
  // Modal states
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: admins = [],
    isLoading,
    error: adminsError,
  } = useQuery<SchoolAdminRecord[], Error>({
    queryKey: ['super-admin', 'school-admins'],
    queryFn: superAdminApi.fetchSchoolAdmins,
    retry: false,
  });

  useEffect(() => {
    if (adminsError) {
      toast({
        title: 'Impossible de charger la liste',
        description: adminsError.message || 'Réessayez plus tard',
      });
    }
  }, [adminsError, toast]);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<SchoolAdminRecord | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    role: 'Administrateur',
  });

  const schoolOptions = useMemo(() => {
    const names = Array.from(new Set(admins.map((admin) => admin.schoolName))).sort((a, b) =>
      a.localeCompare(b),
    );
    return names.map((name) => ({ value: name, label: name }));
  }, [admins]);

  const handleResetPassword = (admin: SchoolAdminRecord) => {
    setSelectedAdmin(admin);
    setIsResetPasswordOpen(true);
  };

  const handleSuspend = (admin: SchoolAdminRecord) => {
    setSelectedAdmin(admin);
    setIsSuspendOpen(true);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      superAdminApi.updateSchoolAdminStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast({
        title: 'Statut mis à jour',
        description: 'L’administrateur a maintenant un statut synchronisé.',
      });
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'school-admins'] });
      setIsSuspendOpen(false);
      setSelectedAdmin(null);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de mettre à jour le statut',
        description: (error as Error)?.message || 'Réessayez plus tard',
      });
    },
  });

  const handleCreateAdmin = () => {
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La création manuelle d’administrateurs sera ajoutée ultérieurement.',
    });
  };

  const confirmSuspend = () => {
    if (selectedAdmin) {
      updateStatusMutation.mutate({
        id: selectedAdmin.id,
        isActive: !selectedAdmin.isActive,
      });
    }
  };

  const confirmResetPassword = () => {
    // Mock: In real app, would call API to send reset email
    setIsResetPasswordOpen(false);
    setSelectedAdmin(null);
  };
  const filterOptions = useMemo(
    () => [
      {
        key: 'status',
        label: 'Statut',
        options: [
          { value: 'active', label: 'Actif' },
          { value: 'pending', label: 'En attente' },
          { value: 'inactive', label: 'Inactif' },
        ],
      },
      {
        key: 'schoolName',
        label: 'École',
        options: schoolOptions,
      },
    ],
    [schoolOptions],
  );

  const columns: Column<SchoolAdminRecord>[] = [
    { 
      key: 'name', 
      label: 'Administrateur', 
      sortable: true,
      render: (admin) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {admin.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.role}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'email', 
      label: 'Email', 
      sortable: true,
      render: (admin) => (
        <span className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" />
          {admin.email}
        </span>
      )
    },
    { 
      key: 'phone', 
      label: 'Téléphone', 
      render: (admin) => (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3" />
          {admin.phone}
        </span>
      )
    },
    { 
      key: 'schoolName', 
      label: 'École', 
      sortable: true,
      render: (admin) => (
        <span className="flex items-center gap-1 text-sm">
          <Shield className="h-3 w-3" />
          {admin.schoolName}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Statut', 
      render: (admin) => (
        <Badge variant={admin.status === 'active' ? 'default' : admin.status === 'pending' ? 'secondary' : 'outline'}>
          {admin.status === 'active' ? 'Actif' : admin.status === 'pending' ? 'En attente' : 'Inactif'}
        </Badge>
      )
    },
  ];

  const getInitials = (value?: string, fallback?: string) => {
    const source = value || fallback || 'Admin';
    return source
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2);
  };

  const gridItem = (admin: SchoolAdminRecord) => {
    const initials = getInitials(admin.name, admin.email);

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials || 'A'}
            </AvatarFallback>
          </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{admin.name || admin.email}</h3>
              <p className="text-xs text-muted-foreground">{admin.schoolName}</p>
            </div>
          <Badge variant={admin.status === 'active' ? 'default' : admin.status === 'pending' ? 'secondary' : 'outline'}>
            {admin.status === 'active' ? 'Actif' : admin.status === 'pending' ? 'En attente' : 'Inactif'}
          </Badge>
        </div>
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            {admin.email}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            {admin.phone}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-3 w-3" />
            {admin.schoolName}
          </span>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleResetPassword(admin)}
          >
            <Key className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={admin.status === 'active' ? 'flex-1 text-destructive' : 'flex-1 text-success'}
            onClick={() => handleSuspend(admin)}
          >
            <Ban className="h-3 w-3 mr-1" />
            {admin.status === 'active' ? 'Suspendre' : 'Activer'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admins École</h1>
          <p className="text-muted-foreground">
            Gérez les administrateurs de chaque école
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvel Admin
        </Button>
      </div>

      <DataList
        data={admins}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher un administrateur..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun administrateur trouvé"
        itemsPerPage={5}
      />

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Un email de réinitialisation sera envoyé à l'administrateur.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(selectedAdmin?.name, selectedAdmin?.email)}
              </AvatarFallback>
            </Avatar>
              <div>
                <p className="font-medium">{selectedAdmin?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedAdmin?.email}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Annuler</Button>
            <Button onClick={confirmResetPassword} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Envoyer le lien
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Account Modal */}
      <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAdmin?.status === 'active' ? 'Suspendre ce compte ?' : 'Réactiver ce compte ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAdmin?.status === 'active' 
                ? `Le compte de "${selectedAdmin?.name}" sera suspendu et ne pourra plus se connecter.` 
                : `Le compte de "${selectedAdmin?.name}" sera réactivé.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSuspend}>
              {selectedAdmin?.status === 'active' ? 'Suspendre' : 'Réactiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Admin Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel administrateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel administrateur pour une école.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-name">Nom complet</Label>
              <Input
                id="admin-name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Nom et prénom"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="email@ecole.sn"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-phone">Téléphone</Label>
              <Input
                id="admin-phone"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-school">École *</Label>
              <Select
                value={newAdmin.school}
                onValueChange={(value) => setNewAdmin({ ...newAdmin, school: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une école" />
                </SelectTrigger>
                <SelectContent>
                  {schoolOptions.map((school) => (
                    <SelectItem key={school.value} value={school.value}>
                      {school.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateAdmin} disabled={!newAdmin.name || !newAdmin.email || !newAdmin.school}>
              Créer l'administrateur
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
