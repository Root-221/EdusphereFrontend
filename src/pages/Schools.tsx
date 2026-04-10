import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { School, SchoolType, SchoolStatus, schoolTypeLabels, schoolStatusLabels } from '@/types/school';
import { superAdminApi, CreateSchoolPayload } from '@/services/superAdmin';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { DataList, Column } from '@/components/ui/data-list';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Upload,
  Palette,
  ToggleLeft,
  ToggleRight,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const DEFAULT_ADMIN_PASSWORD =
  import.meta.env.VITE_TENANT_ADMIN_TEMP_PASSWORD ?? 'Password123!';

const createSchoolSteps = [
  {
    value: 'school',
    label: 'École',
    description: 'Informations générales',
  },
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Compte et contact',
  },
  {
    value: 'branding',
    label: 'Personnalisation',
    description: 'Couleurs, logo et aperçu',
  },
] as const;

type CreateSchoolStep = (typeof createSchoolSteps)[number]['value'];

const createSchoolStepMeta: Record<CreateSchoolStep, { label: string; description: string }> = {
  school: {
    label: 'École',
    description: 'Informations générales',
  },
  admin: {
    label: 'Administrateur',
    description: 'Compte et contact',
  },
  branding: {
    label: 'Personnalisation',
    description: 'Couleurs, logo et aperçu',
  },
};

function SchoolCreationStepper({ step }: { step: CreateSchoolStep }) {
  const currentIndex = createSchoolSteps.findIndex((item) => item.value === step);

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {createSchoolSteps.map((item, index) => {
          const active = currentIndex === index;
          const completed = currentIndex > index;

          return (
            <div key={item.value} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                  completed
                    ? 'border-green-500 bg-green-500 text-white'
                    : active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground',
                )}
              >
                {completed ? '✓' : index + 1}
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {createSchoolStepMeta[item.value].label}
                </p>
                <p className="text-xs text-muted-foreground">{createSchoolStepMeta[item.value].description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <Progress value={((Math.max(currentIndex, 0) + 1) / createSchoolSteps.length) * 100} />
    </div>
  );
}

type SchoolFormErrorField =
  | 'name'
  | 'slug'
  | 'adminFirstName'
  | 'adminLastName'
  | 'adminEmail';

interface SchoolFormState {
  name: string;
  slug: string;
  type: SchoolType;
  city: string;
  country: string;
  address: string;
  contactEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  description: string;
  brandingColor: string;
  brandingSecondaryColor: string;
  brandingSlogan: string;
  brandingLogo: string | null;
}

const createDefaultSchoolFormState = (): SchoolFormState => ({
  name: '',
  slug: '',
  type: 'private',
  city: '',
  country: 'Sénégal',
  address: '',
  contactEmail: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  description: '',
  brandingColor: '#3b82f6',
  brandingSecondaryColor: '#10b981',
  brandingSlogan: '',
  brandingLogo: null,
});

export default function Schools() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Create/Edit School Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSchool, setNewSchool] = useState<SchoolFormState>(createDefaultSchoolFormState);
  const [errors, setErrors] = useState<Partial<Record<SchoolFormErrorField, string>>>({});
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [brandingLogoFile, setBrandingLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [createSchoolStep, setCreateSchoolStep] = useState<CreateSchoolStep>('school');

  const clearFieldError = (field: SchoolFormErrorField) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): Partial<Record<SchoolFormErrorField, string>> => {
    const nextErrors: Partial<Record<SchoolFormErrorField, string>> = {};
    if (!newSchool.name.trim()) {
      nextErrors.name = 'Le nom de l\'école est obligatoire.';
    }

    const slugSource = (newSchool.slug ?? '').trim() || newSchool.name.trim();
    const normalizedSlug = slugify(slugSource);
    if (!slugSource) {
      nextErrors.slug = 'Le slug ne peut pas être vide.';
    } else if (!normalizedSlug) {
      nextErrors.slug = 'Le slug doit contenir au moins un caractère alphanumérique.';
    } else if (normalizedSlug.length < 3) {
      nextErrors.slug = 'Le slug doit contenir au moins 3 caractères.';
    }

    if (!newSchool.adminFirstName.trim()) {
      nextErrors.adminFirstName = 'Le prénom de l\'admin est requis.';
    }
    if (!newSchool.adminLastName.trim()) {
      nextErrors.adminLastName = 'Le nom de l\'admin est requis.';
    }
    if (!newSchool.adminEmail.trim()) {
      nextErrors.adminEmail = 'L\'email de l\'admin est requis.';
    }
    return nextErrors;
  };
  
  // Store editing school ID
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  
  // Delete Confirmation Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  
  // Toggle Status Modal
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [schoolToToggle, setSchoolToToggle] = useState<School | null>(null);
  
  // Branding Modal
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [brandingSchool, setBrandingSchool] = useState<School | null>(null);
  const [brandingColor, setBrandingColor] = useState('#3b82f6');
  const [brandingSecondaryColor, setBrandingSecondaryColor] = useState('#10b981');
  const [brandingLogo, setBrandingLogo] = useState<string | null>(null);
  const [brandingSlogan, setBrandingSlogan] = useState('');

  const {
    data: fetchedSchools,
    error: schoolsError,
    refetch: refetchSchools,
  } = useQuery<School[], Error>({
    queryKey: ['super-admin', 'schools'],
    queryFn: superAdminApi.fetchSchools,
    retry: false,
  });

  useEffect(() => {
    if (fetchedSchools) {
      setSchools(fetchedSchools);
    }
  }, [fetchedSchools]);

  useEffect(() => {
    if (schoolsError) {
      toast({
        title: 'Impossible de charger les écoles',
        description: schoolsError.message || 'Veuillez réessayer',
      });
    }
  }, [schoolsError, toast]);

  const resetNewSchoolForm = () => {
    setNewSchool(createDefaultSchoolFormState());
    setErrors({});
    setIsSlugTouched(false);
    setBrandingLogoFile(null);
    setIsUploadingLogo(false);
    setCreateSchoolStep('school');
    setEditingSchoolId(null);
  };

  const createSchoolMutation = useMutation({
    mutationFn: (payload: CreateSchoolPayload) => superAdminApi.createSchool(payload),
    onSuccess: () => {
      toast({
        title: 'École créée',
        description: 'La base de données du tenant a été provisionnée avec succès.',
      });
      resetNewSchoolForm();
      refetchSchools();
      setIsCreateOpen(false);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erreur lors de la création',
        description: getApiErrorMessage(error, 'Vérifiez les champs et réessayez.'),
      });
    },
  });

  const isCreateButtonDisabled =
    createSchoolMutation.isPending ||
    isUploadingLogo ||
    !newSchool.name.trim() ||
    !(newSchool.slug ?? '').trim();
  const currentCreateSchoolStepIndex = createSchoolSteps.findIndex((step) => step.value === createSchoolStep);
  const isFinalCreateSchoolStep = createSchoolStep === 'branding';

  const goToNextCreateSchoolStep = () => {
    const nextIndex = Math.min(currentCreateSchoolStepIndex + 1, createSchoolSteps.length - 1);
    setCreateSchoolStep(createSchoolSteps[nextIndex].value);
  };

  const goToPreviousCreateSchoolStep = () => {
    const previousIndex = Math.max(currentCreateSchoolStepIndex - 1, 0);
    setCreateSchoolStep(createSchoolSteps[previousIndex].value);
  };

  const handleCreateSchoolPrimaryAction = () => {
    if (editingSchoolId) {
      void handleCreateSchool();
      return;
    }

    if (!isFinalCreateSchoolStep) {
      goToNextCreateSchoolStep();
      return;
    }

    void handleCreateSchool();
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' }) =>
      superAdminApi.updateSchoolStatus(id, status),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l\'école a été synchronisé.',
      });
      refetchSchools();
      setIsToggleOpen(false);
      setSchoolToToggle(null);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de mettre à jour le statut',
        description: (error as Error)?.message || 'Réessayez plus tard.',
      });
    },
  });

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setIsDetailOpen(true);
  };

  const handleOpenCreateSchool = () => {
    resetNewSchoolForm();
    setIsCreateOpen(true);
  };

  const handleEditSchool = (school: School) => {
    // Pré-remplir les données de l'école à modifier
    setNewSchool({
      ...createDefaultSchoolFormState(),
      name: school.name,
      slug: school.slug,
      type: school.type,
      city: school.city,
      country: school.country,
      address: school.address || '',
      contactEmail: school.email,
      adminEmail: school.adminEmail,
      adminPhone: school.phone || '',
      description: school.description || '',
      brandingColor: school.brandingColor || '#3b82f6',
      brandingSecondaryColor: school.brandingSecondaryColor || '#10b981',
      brandingSlogan: school.brandingSlogan || '',
      brandingLogo: school.logo || null,
    });
    setEditingSchoolId(school.id);
    setCreateSchoolStep('school');
    setIsCreateOpen(true);
    setIsDetailOpen(false);
    setIsSlugTouched(true);
    setBrandingLogoFile(null);
    setErrors({});
  };

  const handleDeleteSchool = (school: School) => {
    setSchoolToDelete(school);
    setIsDeleteOpen(true);
    setIsDetailOpen(false);
  };

  const handleToggleStatus = (school: School) => {
    setSchoolToToggle(school);
    setIsToggleOpen(true);
    setIsDetailOpen(false);
  };

  const handleBranding = (school: School) => {
    setBrandingSchool(school);
    setBrandingColor(school.brandingColor || '#3b82f6');
    setBrandingSecondaryColor(school.brandingSecondaryColor || '#10b981');
    setBrandingLogo(school.logo || null);
    setBrandingSlogan(school.brandingSlogan || '');
    setIsBrandingOpen(true);
    setIsDetailOpen(false);
  };

  const handleCreateSchool = async () => {
    if (editingSchoolId) {
      toast({
        title: 'Modification non implémentée',
        description: 'La modification des écoles sera disponible prochainement.',
      });
      return;
    }

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (createSchoolMutation.isPending || isUploadingLogo) return;

    const slugSource = (newSchool.slug ?? '').trim() || newSchool.name.trim();
    const normalizedSlug = slugify(slugSource);
    if (!normalizedSlug) {
      toast({
        title: 'Slug invalide',
        description: 'Le slug doit contenir au moins un caractère alphabétique ou numérique.',
      });
      return;
    }

    setNewSchool((prev) => ({ ...prev, slug: normalizedSlug }));

    let uploadedLogoUrl: string | undefined;
    if (brandingLogoFile) {
      try {
        setIsUploadingLogo(true);
        uploadedLogoUrl = await superAdminApi.uploadSchoolLogo(brandingLogoFile);
      } catch (error) {
        toast({
          title: 'Impossible d\'uploader le logo',
          description: (error as Error)?.message || 'Réessayez avec une autre image.',
        });
        return;
      } finally {
        setIsUploadingLogo(false);
      }
    }

    createSchoolMutation.mutate({
      name: newSchool.name.trim(),
      slug: normalizedSlug,
      contactEmail: newSchool.contactEmail.trim() || undefined,
      adminEmail: newSchool.adminEmail.trim(),
      adminFirstName: newSchool.adminFirstName.trim(),
      adminLastName: newSchool.adminLastName.trim(),
      adminPhone: newSchool.adminPhone.trim() || undefined,
      type: newSchool.type,
      plan: 'free',
      city: newSchool.city.trim() || undefined,
      country: newSchool.country.trim() || undefined,
      address: newSchool.address.trim() || undefined,
      description: newSchool.description.trim() || undefined,
      brandingColor: newSchool.brandingColor.trim() || undefined,
      brandingSecondaryColor: newSchool.brandingSecondaryColor.trim() || undefined,
      brandingSlogan: newSchool.brandingSlogan.trim() || undefined,
      logo: uploadedLogoUrl,
    });
  };

  const handleSchoolNameInput = (value: string) => {
    setNewSchool((prev) => ({
      ...prev,
      name: value,
      slug: !isSlugTouched ? slugify(value) : prev.slug,
    }));
    clearFieldError('name');
    if (!value.trim()) {
      setIsSlugTouched(false);
      clearFieldError('slug');
    } else if (!isSlugTouched) {
      clearFieldError('slug');
    }
  };

  const handleSlugInput = (value: string) => {
    setIsSlugTouched(true);
    setNewSchool((prev) => ({ ...prev, slug: value }));
    clearFieldError('slug');
  };

  const handleAdminFieldChange = (
    field: Extract<SchoolFormErrorField, 'adminFirstName' | 'adminLastName' | 'adminEmail'>,
    value: string,
  ) => {
    setNewSchool((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const confirmDelete = () => {
    if (schoolToDelete) {
      setSchools(schools.filter(s => s.id !== schoolToDelete.id));
      setIsDeleteOpen(false);
      setSchoolToDelete(null);
    }
  };

  const confirmToggle = () => {
    if (schoolToToggle) {
      const nextStatus = schoolToToggle.status === 'active' ? 'SUSPENDED' : 'ACTIVE';
      updateStatusMutation.mutate({ id: schoolToToggle.id, status: nextStatus });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, isCreate: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isCreate) {
        setBrandingLogoFile(file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isCreate) {
          setNewSchool((prev) => ({ ...prev, brandingLogo: reader.result as string }));
        } else {
          setBrandingLogo(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else if (isCreate) {
      setBrandingLogoFile(null);
      setNewSchool((prev) => ({ ...prev, brandingLogo: null }));
    }
  };

  const columns: Column<School>[] = [
    { 
      key: 'name', 
      label: 'École', 
      sortable: true,
      render: (school) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
            {school.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{school.name}</p>
            <p className="text-xs text-muted-foreground">{school.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true,
      render: (school) => <span className="text-sm">{schoolTypeLabels[school.type]}</span>
    },
    { 
      key: 'city', 
      label: 'Ville', 
      sortable: true,
      render: (school) => <span className="text-sm">{school.city}</span>
    },
    { 
      key: 'studentCount', 
      label: 'Élèves', 
      sortable: true,
      render: (school) => {
        const count = school.studentCount ?? 0;
        return <span className="font-medium">{count.toLocaleString()}</span>;
      }
    },
    { 
      key: 'teacherCount', 
      label: 'Enseignants', 
      sortable: true,
      render: (school) => {
        const count = school.teacherCount ?? 0;
        return <span className="font-medium">{count.toLocaleString()}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Statut', 
      render: (school) => (
        <Badge
          className={cn(
            "text-xs",
            school.status === 'active' && 'bg-success/20 text-success hover:bg-success/30',
            school.status === 'suspended' && 'bg-destructive/20 text-destructive hover:bg-destructive/30',
            school.status === 'pending' && 'bg-warning/20 text-warning hover:bg-warning/30'
          )}
        >
          {schoolStatusLabels[school.status]}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (school) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewSchool(school)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditSchool(school)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBranding(school)}>
              <Palette className="mr-2 h-4 w-4" />
              Personnaliser
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(school)}>
              {school.status === 'active' ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Activer
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteSchool(school)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'suspended', label: 'Suspendu' },
        { value: 'pending', label: 'En attente' },
      ]
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Privé' },
        { value: 'college', label: 'Collège' },
        { value: 'lycee', label: 'Lycée' },
        { value: 'university', label: 'Université' },
        { value: 'institute', label: 'Institut' },
        { value: 'coranic', label: 'École coranique' },
      ]
    }
  ];

  const gridItem = (school: School) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
          {school.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{school.name}</h3>
          <p className="text-sm text-muted-foreground">{schoolTypeLabels[school.type]}</p>
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{school.city}, {school.country}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{(school.studentCount ?? 0).toLocaleString()} élèves</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Badge
          className={cn(
            "text-xs ml-auto",
            school.status === 'active' && 'bg-success/20 text-success',
            school.status === 'suspended' && 'bg-destructive/20 text-destructive',
            school.status === 'pending' && 'bg-warning/20 text-warning'
          )}
        >
          {schoolStatusLabels[school.status]}
        </Badge>
      </div>

      {/* Action Buttons - matching the list view dropdown actions */}
      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleViewSchool(school)}
        >
          <Eye className="h-3 w-3 mr-1" />
          Voir
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleEditSchool(school)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Modifier
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleBranding(school)}
        >
          <Palette className="h-3 w-3 mr-1" />
          Thème
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={school.status === 'active' ? "flex-1 text-destructive" : "flex-1 text-success"}
          onClick={() => handleToggleStatus(school)}
        >
          {school.status === 'active' ? (
            <>
              <ToggleLeft className="h-3 w-3 mr-1" />
              Désactiver
            </>
          ) : (
            <>
              <ToggleRight className="h-3 w-3 mr-1" />
              Activer
            </>
          )}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-destructive"
          onClick={() => handleDeleteSchool(school)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );

  const totalStudents = schools.reduce((count, school) => count + (school.studentCount ?? 0), 0);
  const totalTeachers = schools.reduce((count, school) => count + (school.teacherCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Écoles</h1>
          <p className="text-muted-foreground">
            Gérez toutes les écoles inscrites sur la plateforme
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateSchool}>
          <Plus className="h-4 w-4" />
          Nouvelle École
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{schools.length}</p>
              <p className="text-xs text-muted-foreground">Total Écoles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{schools.filter(s => s.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">Actives</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <GraduationCap className="h-5 w-5 text-info" />
            </div>
            <div>
            <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Élèves</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
            <p className="text-2xl font-bold">{totalTeachers}</p>
              <p className="text-xs text-muted-foreground">Enseignants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data List */}
      <DataList
        data={schools}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une école..."
        filterOptions={filterOptions}
        defaultView="list"
        gridItem={gridItem}
        emptyMessage="Aucune école trouvée"
        itemsPerPage={8}
      />

      {/* School Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className="overflow-hidden p-0 sm:max-h-[90vh]"
          style={{ width: 'min(96vw, 72rem)', maxWidth: '72rem' }}
        >
          {selectedSchool && (
            <div className="flex max-h-[90vh] min-h-0 flex-col">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedSchool.name}</DialogTitle>
                <DialogDescription>
                  {`État : ${schoolStatusLabels[selectedSchool.status]}`}
                </DialogDescription>
              </DialogHeader>

              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
                {/* Header avec logo et infos principales */}
                <div className="relative">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-r from-primary to-primary/70">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                      {selectedSchool.logo ? (
                        <img
                          src={selectedSchool.logo}
                          alt={selectedSchool.name}
                          className="h-full w-full rounded-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {selectedSchool.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-4">
                    <Badge
                      className={cn(
                        'px-3 py-1 text-xs',
                        selectedSchool.status === 'active' && 'bg-green-500',
                        selectedSchool.status === 'suspended' && 'bg-red-500',
                        selectedSchool.status === 'pending' && 'bg-yellow-500',
                      )}
                    >
                      {schoolStatusLabels[selectedSchool.status]}
                    </Badge>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-12 sm:px-6">
                  <div className="mb-5 text-center">
                    <h2 className="text-2xl font-bold sm:text-3xl">{selectedSchool.name}</h2>
                    <p className="text-sm text-muted-foreground sm:text-lg">
                      {schoolTypeLabels[selectedSchool.type]}
                    </p>
                    {selectedSchool.description && (
                      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                        {selectedSchool.description}
                      </p>
                    )}
                  </div>

                  {/* Statistiques */}
                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-center">
                      <p className="text-xl font-bold text-primary">
                        {(selectedSchool.studentCount ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Élèves</p>
                    </div>
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-center">
                      <p className="text-xl font-bold text-primary">
                        {(selectedSchool.teacherCount ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Enseignants</p>
                    </div>
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-center">
                      <p className="text-xl font-bold text-primary">
                        {(selectedSchool.studentCount ?? 0) > 0
                          ? Math.round((selectedSchool.studentCount ?? 0) / 30)
                          : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Adresse</p>
                        <p className="truncate text-sm font-medium">
                          {selectedSchool.address}, {selectedSchool.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="truncate text-sm font-medium">{selectedSchool.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <p className="truncate text-sm font-medium">
                          {selectedSchool.phone || 'Non spécifié'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Administrateur</p>
                        <p className="truncate text-sm font-medium">{selectedSchool.adminEmail}</p>
                      </div>
                    </div>

                    {selectedSchool.description && (
                      <div className="col-span-1 flex items-center gap-3 rounded-lg bg-muted/50 p-3 sm:col-span-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Description</p>
                          <p className="text-sm font-medium">{selectedSchool.description}</p>
                        </div>
                      </div>
                    )}

                    {(selectedSchool.brandingColor || selectedSchool.brandingSecondaryColor) && (
                      <div className="col-span-1 flex items-center gap-3 rounded-lg bg-muted/50 p-3 sm:col-span-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Couleurs de marque</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: selectedSchool.brandingColor || '#3b82f6' }}
                              />
                              <span className="text-sm font-medium">
                                {selectedSchool.brandingColor || '#3b82f6'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-4 w-4 rounded-full border"
                                style={{
                                  backgroundColor: selectedSchool.brandingSecondaryColor || '#10b981',
                                }}
                              />
                              <span className="text-sm font-medium">
                                {selectedSchool.brandingSecondaryColor || '#10b981'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSchool.brandingSlogan && (
                      <div className="col-span-1 flex items-center gap-3 rounded-lg bg-muted/50 p-3 sm:col-span-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Slogan</p>
                          <p className="text-sm font-medium">{selectedSchool.brandingSlogan}</p>
                        </div>
                      </div>
                    )}

                    <div className="col-span-1 flex items-center gap-3 rounded-lg bg-muted/50 p-3 sm:col-span-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Date de création</p>
                        <p className="text-sm font-medium">
                          {selectedSchool.createdAt
                            ? new Date(selectedSchool.createdAt).toLocaleDateString('fr-FR')
                            : 'Non spécifiée'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="mt-6 flex gap-3 border-t pt-4">
                    <Button
                      className="h-11 flex-1 text-sm sm:text-base"
                      onClick={() => {
                        setIsDetailOpen(false);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Accéder à l'école
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 flex-1 text-sm sm:text-base"
                      onClick={() => handleEditSchool(selectedSchool)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit School Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          // Reset form when closing
          setEditingSchoolId(null);
          resetNewSchoolForm();
        }
      }}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:h-[90vh] sm:max-h-[90vh]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle>{editingSchoolId ? 'Modifier l\'école' : 'Créer une nouvelle école'}</DialogTitle>
                <DialogDescription>
                  {editingSchoolId
                    ? 'Modifiez les informations de l\'école et son administrateur en 3 étapes.'
                    : 'Créez une nouvelle école et son administrateur en 3 étapes.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            {!editingSchoolId && (
              <div className="border-b px-6 py-4">
                <SchoolCreationStepper step={createSchoolStep} />
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <Tabs
                value={createSchoolStep}
                onValueChange={(value) => setCreateSchoolStep(value as CreateSchoolStep)}
                className="flex min-h-0 flex-col"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="school" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    École
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <User className="h-4 w-4" />
                    Administrateur
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Personnalisation
                  </TabsTrigger>
                </TabsList>

                {/* Level 1: School Info */}
                <TabsContent value="school" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom de l'école *</Label>
                      <Input
                        id="name"
                        value={newSchool.name}
                        onChange={(e) => handleSchoolNameInput(e.target.value)}
                        placeholder="Nom de l'école"
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={newSchool.slug}
                        onChange={(e) => handleSlugInput(e.target.value)}
                        placeholder="slug-unique"
                      />
                      <p className="text-xs text-muted-foreground">
                        Le slug est généré automatiquement à partir du nom de l'école sauf si vous le modifiez.
                      </p>
                      {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newSchool.type}
                        onValueChange={(value) => setNewSchool({ ...newSchool, type: value as SchoolType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Privé</SelectItem>
                          <SelectItem value="college">Collège</SelectItem>
                          <SelectItem value="lycee">Lycée</SelectItem>
                          <SelectItem value="university">Université</SelectItem>
                          <SelectItem value="institute">Institut</SelectItem>
                          <SelectItem value="coranic">École Coranique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          value={newSchool.city}
                          onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                          placeholder="Dakar"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input
                          id="country"
                          value={newSchool.country}
                          onChange={(e) => setNewSchool({ ...newSchool, country: e.target.value })}
                          placeholder="Sénégal"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                        placeholder="Adresse complète"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Level 2: Admin Info */}
                <TabsContent value="admin" className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        L'administrateur créé aura accès à la plateforme et pourra gérer l'école.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="adminFirstName">Prénom de l'administrateur *</Label>
                        <Input
                          id="adminFirstName"
                          value={newSchool.adminFirstName}
                          onChange={(e) => handleAdminFieldChange('adminFirstName', e.target.value)}
                          placeholder="Prénom"
                        />
                        {errors.adminFirstName && <p className="text-xs text-destructive">{errors.adminFirstName}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminLastName">Nom de l'administrateur *</Label>
                        <Input
                          id="adminLastName"
                          value={newSchool.adminLastName}
                          onChange={(e) => handleAdminFieldChange('adminLastName', e.target.value)}
                          placeholder="Nom"
                        />
                        {errors.adminLastName && <p className="text-xs text-destructive">{errors.adminLastName}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminEmailTab">Email *</Label>
                        <Input
                          id="adminEmailTab"
                          type="email"
                          value={newSchool.adminEmail}
                          onChange={(e) => handleAdminFieldChange('adminEmail', e.target.value)}
                          placeholder="admin@ecole.sn"
                        />
                        {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminPhone">Téléphone</Label>
                        <Input
                          id="adminPhone"
                          value={newSchool.adminPhone}
                          onChange={(e) => setNewSchool({ ...newSchool, adminPhone: e.target.value })}
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Mot de passe temporaire</Label>
                        <div className="rounded-md border border-border px-3 py-2 text-sm">
                          <p>
                            <span className="font-semibold">{DEFAULT_ADMIN_PASSWORD}</span>
                            <span className="ml-2 text-muted-foreground">
                              Un email contenant un lien d'activation sera envoyé automatiquement.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Level 3: Branding */}
                <TabsContent value="branding" className="space-y-4 py-4">
                  <div className="grid gap-6">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label>Logo de l'école</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted"
                          >
                            {newSchool.brandingLogo ? (
                              <img src={newSchool.brandingLogo} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={(e) => handleLogoUpload(e, true)}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Cliquez ou glissez une image</p>
                          <p>PNG, JPG, WebP, GIF ou SVG jusqu'à 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Primary Color */}
                      <div className="space-y-2">
                        <Label>Couleur principale</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap gap-2">
                              {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "h-8 w-8 rounded-full transition-transform hover:scale-110",
                                    newSchool.brandingColor === color && "ring-2 ring-offset-2 ring-primary"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setNewSchool({ ...newSchool, brandingColor: color })}
                                />
                              ))}
                            </div>
                            <Input
                              placeholder="#3b82f6"
                              value={newSchool.brandingColor}
                              onChange={(e) => setNewSchool({ ...newSchool, brandingColor: e.target.value })}
                              className="font-mono"
                            />
                          </div>
                          <div
                            className="h-10 w-10 rounded-lg border"
                            style={{ backgroundColor: newSchool.brandingColor }}
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="space-y-2">
                        <Label>Couleur secondaire</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap gap-2">
                              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "h-8 w-8 rounded-full transition-transform hover:scale-110",
                                    newSchool.brandingSecondaryColor === color && "ring-2 ring-offset-2 ring-primary"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setNewSchool({ ...newSchool, brandingSecondaryColor: color })}
                                />
                              ))}
                            </div>
                            <Input
                              placeholder="#10b981"
                              value={newSchool.brandingSecondaryColor}
                              onChange={(e) => setNewSchool({ ...newSchool, brandingSecondaryColor: e.target.value })}
                              className="font-mono"
                            />
                          </div>
                          <div
                            className="h-10 w-10 rounded-lg border"
                            style={{ backgroundColor: newSchool.brandingSecondaryColor }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description de l'école</Label>
                      <Textarea
                        id="description"
                        value={newSchool.description}
                        onChange={(e) => setNewSchool({ ...newSchool, description: e.target.value })}
                        placeholder="Décrivez brièvement l'école..."
                        rows={3}
                      />
                    </div>

                    {/* Slogan */}
                    <div className="grid gap-2">
                      <Label htmlFor="slogan">Slogan</Label>
                      <Textarea
                        id="slogan"
                        value={newSchool.brandingSlogan}
                        onChange={(e) => setNewSchool({ ...newSchool, brandingSlogan: e.target.value })}
                        placeholder="Excellence académique pour tous..."
                        rows={2}
                      />
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                      <Label>Aperçu</Label>
                      <div
                        className="space-y-3 rounded-lg border p-4"
                        style={{ backgroundColor: 'hsl(var(--card))' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted text-xl font-bold"
                          >
                            {newSchool.brandingLogo ? (
                              <img src={newSchool.brandingLogo} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                              <span style={{ color: newSchool.brandingColor }}>
                                {newSchool.name ? newSchool.name.charAt(0) : 'E'}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{newSchool.name || 'Nom de l\'école'}</h4>
                            {newSchool.description && <p className="text-sm text-muted-foreground">{newSchool.description}</p>}
                            {newSchool.brandingSlogan && <p className="text-sm text-muted-foreground">{newSchool.brandingSlogan}</p>}
                          </div>
                        </div>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ background: `linear-gradient(to right, ${newSchool.brandingColor}, ${newSchool.brandingSecondaryColor})` }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="border-t px-6 py-4">
              {editingSchoolId ? (
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateSchool} disabled={isCreateButtonDisabled}>
                    {isUploadingLogo
                      ? 'Upload du logo...'
                      : createSchoolMutation.isPending
                        ? 'Modification en cours...'
                        : 'Enregistrer'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={createSchoolMutation.isPending || isUploadingLogo}
                    >
                      Annuler
                    </Button>
                    {currentCreateSchoolStepIndex > 0 && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={goToPreviousCreateSchoolStep}
                        disabled={createSchoolMutation.isPending || isUploadingLogo}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Retour
                      </Button>
                    )}
                  </div>
                  <Button
                    className="gap-2"
                    onClick={handleCreateSchoolPrimaryAction}
                    disabled={isCreateButtonDisabled}
                  >
                    {isUploadingLogo
                      ? 'Upload du logo...'
                      : createSchoolMutation.isPending
                        ? 'Création en cours...'
                        : isFinalCreateSchoolStep
                          ? 'Créer l\'école'
                          : 'Suivant'}
                    {!isFinalCreateSchoolStep && !isUploadingLogo && !createSchoolMutation.isPending && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette école ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La school "{schoolToDelete?.name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Modal */}
      <AlertDialog open={isToggleOpen} onOpenChange={setIsToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {schoolToToggle?.status === 'active' ? 'Désactiver cette école ?' : 'Activer cette école ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {schoolToToggle?.status === 'active' 
                ? `L'école "${schoolToToggle?.name}" sera désactivée et ne sera plus accessible.` 
                : `L'école "${schoolToToggle?.name}" sera activée et pourra à nouveau accéder à la plateforme.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {schoolToToggle?.status === 'active' ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Branding Modal */}
      <Dialog open={isBrandingOpen} onOpenChange={setIsBrandingOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Personnaliser le thème de l'école</DialogTitle>
            <DialogDescription>
              Personnalisez l'apparence de l'école : logo, couleurs et slogan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo de l'école</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div 
                        className="h-20 w-20 rounded-lg flex items-center justify-center text-2xl font-bold border-2 border-dashed overflow-hidden"
                        style={{ backgroundColor: brandingLogo ? 'transparent' : brandingColor + '20', color: brandingColor }}
                      >
                        {brandingLogo ? (
                          <img src={brandingLogo} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                          brandingSchool?.name.charAt(0) || 'E'
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleLogoUpload(e, false)}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Cliquez ou glissez</p>
                      <p>PNG, JPG jusqu'à 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex gap-2 flex-wrap mb-2">
                        {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'].map((color) => (
                          <button
                            key={color}
                            className={cn(
                              "h-8 w-8 rounded-full transition-transform hover:scale-110",
                              brandingColor === color && "ring-2 ring-offset-2 ring-primary"
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => setBrandingColor(color)}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="#3b82f6"
                        value={brandingColor}
                        onChange={(e) => setBrandingColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div 
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: brandingColor }}
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label>Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex gap-2 flex-wrap mb-2">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'].map((color) => (
                          <button
                            key={color}
                            className={cn(
                              "h-8 w-8 rounded-full transition-transform hover:scale-110",
                              brandingSecondaryColor === color && "ring-2 ring-offset-2 ring-primary"
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => setBrandingSecondaryColor(color)}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="#10b981"
                        value={brandingSecondaryColor}
                        onChange={(e) => setBrandingSecondaryColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div 
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: brandingSecondaryColor }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Textarea
                    id="slogan"
                    value={brandingSlogan}
                    onChange={(e) => setBrandingSlogan(e.target.value)}
                    placeholder="Excellence académique pour tous..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Aperçu</Label>
                <div 
                  className="rounded-lg border p-6 space-y-4"
                  style={{ backgroundColor: 'hsl(var(--card))' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-16 w-16 rounded-lg flex items-center justify-center text-xl font-bold overflow-hidden"
                      style={{ backgroundColor: brandingColor + '20', color: brandingColor }}
                    >
                      {brandingLogo ? (
                        <img src={brandingLogo} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        brandingSchool?.name.charAt(0) || 'E'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{brandingSchool?.name}</h3>
                      {brandingSlogan && <p className="text-sm text-muted-foreground">{brandingSlogan}</p>}
                    </div>
                  </div>
                  <div 
                    className="h-2 rounded-full"
                    style={{ background: `linear-gradient(to right, ${brandingColor}, ${brandingSecondaryColor})` }}
                  />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-lg font-bold" style={{ color: brandingColor }}>1,250</p>
                      <p className="text-xs text-muted-foreground">Élèves</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-lg font-bold" style={{ color: brandingColor }}>85</p>
                      <p className="text-xs text-muted-foreground">Enseignants</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-lg font-bold" style={{ color: brandingColor }}>12</p>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsBrandingOpen(false)}>Annuler</Button>
            <Button onClick={() => {
              // Apply branding - in real app would call API
              setIsBrandingOpen(false);
            }}>
              Appliquer le thème
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
