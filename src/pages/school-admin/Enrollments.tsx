import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  FileText,
  ListFilter,
  Plus,
  Power,
  PowerOff,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  School,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-errors';
import { escapeHtml, openPrintableWindow, writePrintableDocument } from '@/lib/print';
import { academicApi } from '@/services/academic';
import { schoolApi } from '@/services/school';
import {
  enrollmentsApi,
  type CreateEnrollmentPayload,
  type CreateEnrollmentPeriodPayload,
  type CreateReEnrollmentPayload,
} from '@/services/enrollments';
import { usersApi } from '@/services/users';
import { DataList, type Column } from '@/components/ui/data-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  AcademicYear,
  ClassStatus,
  Level,
  SchoolClass,
} from '@/types/academic';
import {
  Enrollment,
  EnrollmentPeriod,
  EnrollmentType,
  PaymentMethod,
  formatAmount,
  getEnrollmentStatusLabel,
  getEnrollmentTypeLabel,
  getPaymentMethodLabel,
} from '@/types/enrollment';
import type { Student } from '@/types/users';

type PeriodStatus = 'active' | 'upcoming' | 'expired';

type PeriodFormState = {
  name: string;
  type: EnrollmentType;
  academicYearId: string;
  startDate: string;
  endDate: string;
  maxEnrollments: string;
  description: string;
  isActive: boolean;
};

type EnrollmentFormState = {
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  studentDateOfBirth: string;
  studentGender: 'male' | 'female';
  studentAddress: string;
  studentPreviousSchool: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentProfession: string;
  parentAddress: string;
  paymentMethod: PaymentMethod;
  paymentAmount: string;
  notes: string;
};

type EnrollmentRow = Enrollment & {
  searchText: string;
  studentLabel: string;
  parentLabel: string;
  classLabel: string;
  levelLabel: string;
  periodLabel: string;
  paymentLabel: string;
};

const buildEmptyEnrollmentForm = (): EnrollmentFormState => ({
  studentFirstName: '',
  studentLastName: '',
  studentEmail: '',
  studentPhone: '',
  studentDateOfBirth: '',
  studentGender: 'male',
  studentAddress: '',
  studentPreviousSchool: '',
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  parentProfession: '',
  parentAddress: '',
  paymentMethod: 'cash',
  paymentAmount: '0',
  notes: '',
});

const buildEmptyPeriodForm = (academicYearId = ''): PeriodFormState => ({
  name: '',
  type: 'new',
  academicYearId,
  startDate: '',
  endDate: '',
  maxEnrollments: '',
  description: '',
  isActive: true,
});

const getDefaultPeriodTypeForAcademicYear = (
  academicYearId: string,
  periods: EnrollmentPeriod[],
): EnrollmentType => {
  if (!academicYearId) {
    return 'new';
  }

  const usedTypes = new Set(
    periods
      .filter((period) => period.academicYearId === academicYearId)
      .map((period) => period.type),
  );

  if (usedTypes.has('new') && !usedTypes.has('re_enrollment')) {
    return 're_enrollment';
  }

  return 'new';
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getPeriodStatus = (period: EnrollmentPeriod): PeriodStatus => {
  const today = new Date();
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  if (!period.isActive || today > end) return 'expired';
  if (today < start) return 'upcoming';
  return 'active';
};

const getActiveAcademicYearId = (academicYears: AcademicYear[]) =>
  academicYears.find((year) => year.status === 'active')?.id ?? academicYears[0]?.id ?? '';

const getActivePeriodForType = (periods: EnrollmentPeriod[], type: EnrollmentType) =>
  periods.find((period) => period.type === type && period.isActive) ?? null;

function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = currentStep === stepNumber;
        const completed = currentStep > stepNumber;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
                completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {completed ? '✓' : stepNumber}
            </div>
            <span className={active ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>
              {step}
            </span>
            {stepNumber < steps.length && (
              <div className={completed ? 'h-0.5 w-10 bg-green-500' : 'h-0.5 w-10 bg-border'} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EnrollmentTypeBadge({ type }: { type: EnrollmentType }) {
  return type === 'new' ? (
    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
      <UserPlus className="mr-1 h-3 w-3" />
      Nouvelle inscription
    </Badge>
  ) : (
    <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
      <RefreshCw className="mr-1 h-3 w-3" />
      Réinscription
    </Badge>
  );
}

function EnrollmentStatusBadge({ status }: { status: Enrollment['status'] }) {
  const config: Record<Enrollment['status'], string> = {
    draft: 'bg-slate-100 text-slate-700',
    pending_payment: 'bg-amber-100 text-amber-700',
    paid: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return <Badge className={config[status] ?? 'bg-slate-100 text-slate-700'}>{getEnrollmentStatusLabel(status)}</Badge>;
}

function PeriodStatusBadge({ status }: { status: PeriodStatus }) {
  const config: Record<PeriodStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    upcoming: { label: 'À venir', className: 'bg-blue-100 text-blue-700' },
    expired: { label: 'Expirée', className: 'bg-slate-100 text-slate-600' },
  };

  const item = config[status];
  return <Badge className={item.className}>{item.label}</Badge>;
}

export default function Enrollments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'enrollments' | 'periods'>('enrollments');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentType>('new');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [lookupMatricule, setLookupMatricule] = useState('');
  const [lookupStudent, setLookupStudent] = useState<Student | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentFormState>(buildEmptyEnrollmentForm());

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<'create' | 'edit'>('create');
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [periodForm, setPeriodForm] = useState<PeriodFormState>(buildEmptyPeriodForm());
  const [periodToDelete, setPeriodToDelete] = useState<EnrollmentPeriod | null>(null);

  const academicYearsQuery = useQuery({
    queryKey: ['school-admin', 'academic-years'],
    queryFn: academicApi.fetchAcademicYears,
    retry: false,
  });

  const levelsQuery = useQuery({
    queryKey: ['school-admin', 'levels'],
    queryFn: () => academicApi.fetchLevels(),
    retry: false,
  });

  const classesQuery = useQuery({
    queryKey: ['school-admin', 'classes', 'all'],
    queryFn: () => academicApi.fetchClasses(),
    retry: false,
  });

  const periodsQuery = useQuery({
    queryKey: ['school-admin', 'periods'],
    queryFn: enrollmentsApi.fetchPeriods,
    retry: false,
  });

  const activePeriodsQuery = useQuery({
    queryKey: ['school-admin', 'periods', 'active'],
    queryFn: enrollmentsApi.fetchActivePeriods,
    retry: false,
  });

  const enrollmentsQuery = useQuery({
    queryKey: ['school-admin', 'enrollments'],
    queryFn: enrollmentsApi.fetchEnrollments,
    retry: false,
  });

  const schoolProfileQuery = useQuery({
    queryKey: ['school-admin', 'school-profile'],
    queryFn: schoolApi.fetchCurrentSchool,
    retry: false,
  });

  const wizardClassesQuery = useQuery({
    queryKey: ['school-admin', 'classes', 'wizard', selectedLevelId],
    queryFn: () => academicApi.fetchClasses({ level: selectedLevelId }),
    retry: false,
    enabled: isWizardOpen && Boolean(selectedLevelId),
  });

  const activeAcademicYear = (academicYearsQuery.data ?? []).find((year) => year.status === 'active') ?? null;
  const activeAcademicYearId = getActiveAcademicYearId(academicYearsQuery.data ?? []);
  const levels = levelsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const periods = periodsQuery.data ?? [];
  const activePeriods = activePeriodsQuery.data ?? periods.filter((period) => period.isActive);
  const enrollments = enrollmentsQuery.data ?? [];
  const wizardClasses = selectedLevelId ? wizardClassesQuery.data ?? [] : [];

  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const classById = useMemo(() => new Map(classes.map((schoolClass) => [schoolClass.id, schoolClass])), [classes]);
  const periodById = useMemo(() => new Map(periods.map((period) => [period.id, period])), [periods]);

  const enrollmentRows = useMemo<EnrollmentRow[]>(() => {
    return enrollments.map((enrollment) => {
      const studentLabel = `${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}`.trim();
      const parentLabel = `${enrollment.parentInfo.firstName} ${enrollment.parentInfo.lastName}`.trim();
      const classLabel = enrollment.classAssignment?.className ?? classById.get(enrollment.classId ?? '')?.name ?? '';
      const levelLabel =
        enrollment.level ??
        levelById.get(enrollment.levelId ?? '')?.name ??
        classById.get(enrollment.classId ?? '')?.level?.name ??
        '';
      const periodLabel = enrollment.period?.name ?? periodById.get(enrollment.periodId)?.name ?? '';
      const matriculeLabel = enrollment.matricule ?? enrollment.studentInfo.matricule ?? '';
      const paymentLabel = `${getPaymentMethodLabel(enrollment.payment.method)} · ${formatAmount(enrollment.payment.amount)}`;

      return {
        ...enrollment,
        studentLabel,
        parentLabel,
        classLabel,
        levelLabel,
        periodLabel,
        paymentLabel,
        searchText: [
          enrollment.enrollmentNumber,
          enrollment.receiptNumber ?? '',
          matriculeLabel,
          studentLabel,
          parentLabel,
          classLabel,
          levelLabel,
          periodLabel,
          enrollment.status,
          enrollment.type,
        ]
        .join(' ')
        .toLowerCase(),
      };
    });
  }, [classById, enrollments, levelById, periodById]);

  const enrollmentStats = useMemo(() => {
    const total = enrollments.length;
    const newCount = enrollments.filter((enrollment) => enrollment.type === 'new').length;
    const reCount = enrollments.filter((enrollment) => enrollment.type === 're_enrollment').length;
    const paidCount = enrollments.filter((enrollment) => enrollment.status === 'paid').length;
    const revenue = enrollments
      .filter((enrollment) => enrollment.payment.status === 'completed')
      .reduce((sum, enrollment) => sum + (enrollment.payment.amount || 0), 0);

    return { total, newCount, reCount, paidCount, revenue };
  }, [enrollments]);

  const periodStats = useMemo(() => {
    const total = periods.length;
    const activeNew = activePeriods.filter((period) => period.type === 'new').length;
    const activeRe = activePeriods.filter((period) => period.type === 're_enrollment').length;
    const upcoming = periods.filter((period) => getPeriodStatus(period) === 'upcoming').length;
    const expired = periods.filter((period) => getPeriodStatus(period) === 'expired').length;

    return { total, activeNew, activeRe, upcoming, expired };
  }, [activePeriods, periods]);

  const currentPeriod = periodById.get(selectedPeriodId) ?? null;
  const currentLevel = levelById.get(selectedLevelId) ?? null;
  const currentClass = wizardClasses.find((schoolClass) => schoolClass.id === selectedClassId) ?? null;
  const activeAcademicYearPeriodTypes = useMemo(() => {
    const usedTypes = new Set<EnrollmentType>();

    if (!activeAcademicYearId) {
      return usedTypes;
    }

    periods.forEach((period) => {
      if (period.academicYearId === activeAcademicYearId) {
        usedTypes.add(period.type);
      }
    });

    return usedTypes;
  }, [activeAcademicYearId, periods]);
  const canCreatePeriodForActiveYear = Boolean(activeAcademicYear) && activeAcademicYearPeriodTypes.size < 2;
  const periodTargetAcademicYearId =
    periodMode === 'create' ? activeAcademicYearId ?? '' : periodForm.academicYearId || activeAcademicYearId || '';
  const periodTypesUsedForTargetYear = useMemo(() => {
    const usedTypes = new Set<EnrollmentType>();

    if (!periodTargetAcademicYearId) {
      return usedTypes;
    }

    periods.forEach((period) => {
      if (period.id === editingPeriodId) {
        return;
      }

      if (period.academicYearId === periodTargetAcademicYearId) {
        usedTypes.add(period.type);
      }
    });

    return usedTypes;
  }, [editingPeriodId, periodTargetAcademicYearId, periods]);
  const activePeriodsForMode = activePeriods.filter((period) => period.type === enrollmentMode);

  useEffect(() => {
    if (!isWizardOpen) return;

    if (!selectedPeriodId) {
      const fallback = getActivePeriodForType(activePeriods, enrollmentMode);
      if (fallback) {
        setSelectedPeriodId(fallback.id);
      }
    }
  }, [activePeriods, enrollmentMode, isWizardOpen, selectedPeriodId]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'enrollments'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'students'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'academic-years'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'periods'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'periods', 'active'] });
  };

  const periodMutation = useMutation({
    mutationFn: async (payload: { mode: 'create' | 'edit'; id?: string; data: CreateEnrollmentPeriodPayload }) => {
      if (payload.mode === 'create') {
        return enrollmentsApi.createPeriod(payload.data);
      }
      if (!payload.id) {
        throw new Error('Identifiant de période manquant');
      }
      return enrollmentsApi.updatePeriod(payload.id, payload.data);
    },
    onSuccess: (_data, variables) => {
      toast({
        title: variables.mode === 'create' ? 'Période créée' : 'Période modifiée',
        description: 'Les paramètres de période ont été enregistrés.',
      });
      invalidateAll();
      setIsPeriodDialogOpen(false);
      setEditingPeriodId(null);
      setPeriodForm(buildEmptyPeriodForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de période',
        description: getApiErrorMessage(error, 'Impossible d’enregistrer la période.'),
      });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: (id: string) => enrollmentsApi.deletePeriod(id),
    onSuccess: () => {
      toast({
        title: 'Période supprimée',
        description: 'La période a été supprimée.',
      });
      invalidateAll();
      setPeriodToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Suppression impossible',
        description: getApiErrorMessage(error, 'Cette période ne peut pas être supprimée.'),
      });
    },
  });

  const setActivePeriodMutation = useMutation({
    mutationFn: (periodId: string) => enrollmentsApi.setActivePeriod(periodId),
    onSuccess: () => {
      toast({
        title: 'Période activée',
        description: 'La période active a été mise à jour.',
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Activation impossible',
        description: getApiErrorMessage(error, 'Impossible de définir cette période comme active.'),
      });
    },
  });

  const lookupMutation = useMutation({
    mutationFn: (matricule: string) => usersApi.fetchStudentByMatricule(matricule),
    onSuccess: (student) => {
      setLookupStudent(student);
      const fallbackLevelId =
        student.levelId ??
        classById.get(student.classId)?.levelId ??
        '';

      setSelectedLevelId(fallbackLevelId);
      setSelectedClassId(student.classId ?? '');
      setEnrollmentForm((current) => ({
        ...current,
        studentFirstName: student.firstName,
        studentLastName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone ?? '',
        studentDateOfBirth: student.dateOfBirth ?? '',
        studentGender: student.gender === 'female' ? 'female' : 'male',
        studentAddress: student.address ?? '',
        studentPreviousSchool: student.previousSchool ?? '',
        parentFirstName: student.parentFirstName ?? '',
        parentLastName: student.parentLastName ?? '',
        parentEmail: student.parentEmail ?? '',
        parentPhone: student.parentPhone ?? '',
        parentProfession: '',
        parentAddress: '',
      }));
      setCurrentStep(2);
      toast({
        title: 'Élève trouvé',
        description: `${student.firstName} ${student.name} a été chargé depuis le matricule ${student.matricule ?? matricule}.`,
      });
    },
    onError: (error) => {
      setLookupStudent(null);
      toast({
        title: 'Élève introuvable',
        description: getApiErrorMessage(error, 'Impossible de trouver cet élève.'),
      });
    },
  });

  const submitEnrollmentMutation = useMutation({
    mutationFn: async () => {
      const paymentAmount = Number.parseInt(enrollmentForm.paymentAmount, 10);
      const resolvedPaymentAmount = Number.isNaN(paymentAmount) || paymentAmount < 0 ? 0 : paymentAmount;

      if (!selectedPeriodId) {
        throw new Error('Aucune période active sélectionnée.');
      }
      if (!selectedLevelId) {
        throw new Error('Veuillez sélectionner un niveau.');
      }
      if (!selectedClassId) {
        throw new Error('Veuillez sélectionner une classe.');
      }

      if (enrollmentMode === 're_enrollment') {
        if (!lookupStudent) {
          throw new Error('Veuillez d’abord rechercher un élève par matricule.');
        }

        const payload: CreateReEnrollmentPayload = {
          periodId: selectedPeriodId,
          matricule: lookupStudent.matricule ?? lookupMatricule.trim(),
          classId: selectedClassId,
          paymentMethod: enrollmentForm.paymentMethod,
          paymentAmount: resolvedPaymentAmount,
          notes: enrollmentForm.notes.trim() || undefined,
        };

        return enrollmentsApi.createReEnrollment(payload);
      }

      if (!enrollmentForm.studentFirstName.trim() || !enrollmentForm.studentLastName.trim() || !enrollmentForm.studentEmail.trim()) {
        throw new Error('Les informations de l’élève sont incomplètes.');
      }
      if (!enrollmentForm.parentFirstName.trim() || !enrollmentForm.parentLastName.trim() || !enrollmentForm.parentEmail.trim()) {
        throw new Error('Les informations du parent sont incomplètes.');
      }

      const payload: CreateEnrollmentPayload = {
        periodId: selectedPeriodId,
        classId: selectedClassId,
        studentFirstName: enrollmentForm.studentFirstName.trim(),
        studentLastName: enrollmentForm.studentLastName.trim(),
        studentEmail: enrollmentForm.studentEmail.trim(),
        studentPhone: enrollmentForm.studentPhone.trim() || undefined,
        studentDateOfBirth: enrollmentForm.studentDateOfBirth || undefined,
        studentGender: enrollmentForm.studentGender,
        studentAddress: enrollmentForm.studentAddress.trim() || undefined,
        studentPreviousSchool: enrollmentForm.studentPreviousSchool.trim() || undefined,
        parentFirstName: enrollmentForm.parentFirstName.trim(),
        parentLastName: enrollmentForm.parentLastName.trim(),
        parentEmail: enrollmentForm.parentEmail.trim(),
        parentPhone: enrollmentForm.parentPhone.trim() || undefined,
        parentProfession: enrollmentForm.parentProfession.trim() || undefined,
        parentAddress: enrollmentForm.parentAddress.trim() || undefined,
        paymentMethod: enrollmentForm.paymentMethod,
        paymentAmount: resolvedPaymentAmount,
        notes: enrollmentForm.notes.trim() || undefined,
      };

      return enrollmentsApi.createEnrollment(payload);
    },
    onSuccess: (enrollment) => {
      toast({
        title: enrollmentMode === 'new' ? 'Inscription créée' : 'Réinscription créée',
        description: `Le reçu ${enrollment.receiptNumber ?? enrollment.enrollmentNumber} a été généré au statut PAYÉ.`,
      });
      invalidateAll();
      setSelectedEnrollment(enrollment);
      setIsViewDialogOpen(true);
      closeWizard();
    },
    onError: (error) => {
      toast({
        title: 'Enregistrement impossible',
        description: getApiErrorMessage(error, 'Impossible de créer cette inscription.'),
      });
    },
  });

  const closeWizard = (reset: boolean = true) => {
    setIsWizardOpen(false);
    setCurrentStep(1);
    if (reset) {
      setLookupStudent(null);
      setLookupMatricule('');
      setSelectedPeriodId('');
      setSelectedLevelId('');
      setSelectedClassId('');
      setEnrollmentForm(buildEmptyEnrollmentForm());
    }
  };

  const openWizard = (mode: EnrollmentType) => {
    const period = getActivePeriodForType(activePeriods, mode);

    if (!period) {
      toast({
        title: 'Période indisponible',
        description:
          mode === 'new'
            ? 'Aucune période active de nouvelle inscription n’est disponible.'
            : 'Aucune période active de réinscription n’est disponible.',
      });
      return;
    }

    setEnrollmentMode(mode);
    setIsWizardOpen(true);
    setCurrentStep(1);
    setSelectedPeriodId(period.id);
    setSelectedLevelId('');
    setSelectedClassId('');
    setLookupMatricule('');
    setLookupStudent(null);
    setEnrollmentForm(buildEmptyEnrollmentForm());
  };

  const openCreatePeriodDialog = () => {
    if (!activeAcademicYear) {
      toast({
        title: 'Année scolaire active manquante',
        description: 'Activez d’abord une année scolaire avant de créer une période.',
      });
      return;
    }

    if (activeAcademicYearPeriodTypes.size >= 2) {
      toast({
        title: 'Périodes complètes',
        description:
          'Cette année scolaire possède déjà ses deux périodes autorisées. Modifiez une période existante si besoin.',
      });
      return;
    }

    setPeriodMode('create');
    setEditingPeriodId(null);
    setPeriodForm({
      ...buildEmptyPeriodForm(activeAcademicYearId ?? ''),
      type: getDefaultPeriodTypeForAcademicYear(activeAcademicYearId ?? '', periods),
    });
    setIsPeriodDialogOpen(true);
  };

  const openEditPeriodDialog = (period: EnrollmentPeriod) => {
    setPeriodMode('edit');
    setEditingPeriodId(period.id);
    setPeriodForm({
      name: period.name,
      type: period.type,
      academicYearId: period.academicYearId ?? activeAcademicYearId,
      startDate: period.startDate,
      endDate: period.endDate,
      maxEnrollments: period.maxEnrollments?.toString() ?? '',
      description: period.description ?? '',
      isActive: period.isActive,
    });
    setIsPeriodDialogOpen(true);
  };

  const validatePeriodForm = () => {
    if (!periodForm.name.trim()) return false;
    if (periodMode === 'edit' && !periodForm.academicYearId) return false;
    if (periodMode === 'create' && !canCreatePeriodForActiveYear) return false;
    if (!periodForm.startDate || !periodForm.endDate) return false;
    if (periodTargetAcademicYearId && periodTypesUsedForTargetYear.has(periodForm.type)) return false;
    return new Date(periodForm.endDate).getTime() >= new Date(periodForm.startDate).getTime();
  };

  const savePeriod = () => {
    if (!validatePeriodForm()) {
      toast({
        title: 'Formulaire incomplet',
        description: 'Veuillez renseigner des dates valides et un nom pour la période.',
      });
      return;
    }

    const payload: CreateEnrollmentPeriodPayload = {
      name: periodForm.name.trim(),
      type: periodForm.type,
      startDate: periodForm.startDate,
      endDate: periodForm.endDate,
      maxEnrollments: periodForm.maxEnrollments ? Number.parseInt(periodForm.maxEnrollments, 10) : undefined,
      description: periodForm.description.trim() || undefined,
      isActive: periodForm.isActive,
    };

    if (periodMode === 'edit' && periodForm.academicYearId) {
      payload.academicYearId = periodForm.academicYearId;
    }

    periodMutation.mutate({
      mode: periodMode,
      id: editingPeriodId ?? undefined,
      data: payload,
    });
  };

  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    setSelectedClassId('');
  };

  const canAdvanceFromStepOne = useMemo(() => {
    if (enrollmentMode === 're_enrollment') {
      return Boolean(lookupStudent);
    }

    return Boolean(
      enrollmentForm.studentFirstName.trim() &&
        enrollmentForm.studentLastName.trim() &&
        enrollmentForm.studentEmail.trim() &&
        enrollmentForm.parentFirstName.trim() &&
        enrollmentForm.parentLastName.trim() &&
        enrollmentForm.parentEmail.trim(),
    );
  }, [enrollmentForm, enrollmentMode, lookupStudent]);

  const canAdvanceFromStepTwo = Boolean(selectedLevelId && selectedClassId);
  const canSubmit = Boolean(selectedPeriodId && selectedClassId && selectedLevelId);

  const enrollmentColumns: Column<EnrollmentRow>[] = [
    {
      key: 'studentLabel',
      label: 'Élève',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {row.studentInfo.firstName} {row.studentInfo.lastName}
            </p>
            <Badge variant="outline" className="text-xs">
              {row.matricule ?? row.studentInfo.matricule ?? 'Sans matricule'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{row.parentLabel}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <EnrollmentTypeBadge type={row.type} />,
    },
    {
      key: 'classLabel',
      label: 'Classe',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <Badge variant="outline">{row.classLabel || 'Non assignée'}</Badge>
          {row.levelLabel && <p className="text-xs text-muted-foreground">{row.levelLabel}</p>}
        </div>
      ),
    },
    {
      key: 'periodLabel',
      label: 'Période',
      render: (row) => <Badge className="bg-slate-100 text-slate-700">{row.periodLabel || 'N/A'}</Badge>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (row) => <EnrollmentStatusBadge status={row.status} />,
    },
    {
      key: 'paymentLabel',
      label: 'Paiement',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{formatAmount(row.payment.amount)}</p>
          <p className="text-xs text-muted-foreground">{getPaymentMethodLabel(row.payment.method)}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => openEnrollmentDetails(row)}>
            <Eye className="h-3.5 w-3.5" />
            Détails
          </Button>
        </div>
      ),
    },
  ];

  const enrollmentFilterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'new', label: 'Nouvelle inscription' },
        { value: 're_enrollment', label: 'Réinscription' },
      ],
    },
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'paid', label: 'Payé' },
        { value: 'confirmed', label: 'Confirmé' },
        { value: 'pending_payment', label: 'En attente' },
        { value: 'draft', label: 'Brouillon' },
        { value: 'cancelled', label: 'Annulé' },
      ],
    },
    {
      key: 'periodId',
      label: 'Période',
      options: periods.map((period) => ({
        value: period.id,
        label: period.name,
      })),
    },
    {
      key: 'classId',
      label: 'Classe',
      options: classes.map((schoolClass) => ({
        value: schoolClass.id,
        label: schoolClass.name,
      })),
    },
  ];

  const enrollmentGridItem = (row: EnrollmentRow) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-tight">
            {row.studentInfo.firstName} {row.studentInfo.lastName}
          </h3>
          <p className="text-xs text-muted-foreground">{row.matricule ?? row.studentInfo.matricule ?? 'Matricule indisponible'}</p>
        </div>
        <EnrollmentTypeBadge type={row.type} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{row.classLabel || 'Classe non assignée'}</Badge>
        <Badge variant="outline">{row.periodLabel || 'Période'}</Badge>
        <EnrollmentStatusBadge status={row.status} />
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {row.parentLabel}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <School className="h-3.5 w-3.5" />
          {row.levelLabel || 'Niveau non défini'}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {row.receiptNumber ?? row.enrollmentNumber}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
          {row.qrCode ? 'QR code prêt' : 'QR code généré'}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <div>
          <p className="font-medium">{formatAmount(row.payment.amount)}</p>
          <p className="text-xs text-muted-foreground">{getPaymentMethodLabel(row.payment.method)}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => openEnrollmentDetails(row)}>
          <Eye className="h-3.5 w-3.5" />
          Voir
        </Button>
      </div>
    </div>
  );

  const openEnrollmentDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewDialogOpen(true);
  };

  const printEnrollmentReceipt = (enrollment: Enrollment) => {
    const schoolProfile = schoolProfileQuery.data ?? null;
    const schoolName = schoolProfile?.name ?? 'EduSphere';
    const printWindow = openPrintableWindow(`Reçu d'inscription - ${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}`);

    if (!printWindow) {
      toast({
        title: 'Fenêtre bloquée',
        description: 'Autorisez les fenêtres contextuelles pour imprimir.',
      });
      return;
    }

    const fullName = `${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}`.trim();
    const parentFullName = `${enrollment.parentInfo.firstName} ${enrollment.parentInfo.lastName}`.trim();
    const className = enrollment.classAssignment?.className ?? enrollment.level ?? 'Non définie';
    const periodName = enrollment.period?.name ?? enrollment.periodId ?? 'N/A';

    const receiptHtml = `
      <div class="print-page">
        <div class="print-shell">
          <div class="print-header">
            <div class="brand-row">
              <div class="brand-logo">${escapeHtml(schoolName.slice(0, 2).toUpperCase())}</div>
              <div>
                <div class="section-title">${escapeHtml(schoolName)}</div>
                <div class="muted">Reçu d'inscription</div>
              </div>
            </div>
            <div class="print-badge">${getEnrollmentStatusLabel(enrollment.status)}</div>
          </div>

          <div class="print-receipt">
            <div class="receipt-grid">
              <div class="info-box">
                <div class="info-label">Reçu N°</div>
                <div class="info-value">${escapeHtml(enrollment.receiptNumber ?? enrollment.enrollmentNumber)}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Date</div>
                <div class="info-value">${formatDate(enrollment.createdAt)}</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-box">
              <div class="info-label">Élève</div>
              <div class="info-value" style="font-size: 18px;">${escapeHtml(fullName)}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Matricule</div>
              <div class="info-value">${escapeHtml(enrollment.matricule ?? enrollment.studentInfo.matricule ?? 'Non attribué')}</div>
            </div>

            <div class="divider"></div>

            <div class="info-box">
              <div class="info-label">Classe</div>
              <div class="info-value">${escapeHtml(className)}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Période</div>
              <div class="info-value">${escapeHtml(periodName)}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Année scolaire</div>
              <div class="info-value">${escapeHtml(enrollment.academicYear)}</div>
            </div>

            <div class="divider"></div>

            <div class="info-box">
              <div class="info-label">Parent / Tuteur</div>
              <div class="info-value">${escapeHtml(parentFullName)}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Téléphone</div>
              <div class="info-value">${escapeHtml(enrollment.parentInfo.phone ?? 'Non renseigné')}</div>
            </div>

            <div class="divider"></div>

            <div class="receipt-summary">
              <div class="info-label">Montant payé</div>
              <div class="receipt-total">${formatAmount(enrollment.payment.amount)}</div>
              <div class="info-label" style="margin-top: 8px;">Mode de paiement</div>
              <div class="info-value">${getPaymentMethodLabel(enrollment.payment.method)}</div>
            </div>

            <div class="receipt-footer">
              <div class="signature">
                <div class="line"></div>
                <div>Signature</div>
              </div>
              <div class="signature">
                <div class="line"></div>
                <div>Cachet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const styles = buildPrintTheme('#1d4ed8', '#0ea5e9');
    writePrintableDocument(printWindow, `Reçu d'inscription - ${fullName}`, receiptHtml, styles);
  };

  const buildPrintTheme = (accent: string, secondary: string) => `
    :root {
      --print-accent: ${accent};
      --print-secondary: ${secondary};
    }
    .print-page {
      width: 100%;
      min-height: calc(100vh - 24mm);
      display: flex;
      justify-content: center;
      padding: 0;
    }
    .print-shell {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    }
    .print-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .print-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--print-accent) 10%, white);
      color: var(--print-accent);
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .print-receipt {
      border: 1px solid #dbe3ee;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      padding: 28px;
    }
    .section-title {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--print-accent);
    }
    .muted {
      color: #64748b;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      overflow: hidden;
      background: color-mix(in srgb, var(--print-accent) 12%, white);
      border: 1px solid color-mix(in srgb, var(--print-accent) 20%, white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: var(--print-accent);
      font-size: 20px;
    }
    .receipt-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .info-box {
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.75);
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
      margin: 16px 0;
    }
    .receipt-summary {
      border: 1px solid #dbe3ee;
      border-radius: 20px;
      padding: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(248,250,252,.9));
      text-align: center;
    }
    .receipt-total {
      font-size: 32px;
      font-weight: 900;
      color: var(--print-accent);
      line-height: 1;
    }
    .receipt-footer {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: end;
    }
    .signature {
      min-width: 150px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .signature .line {
      height: 1px;
      background: #94a3b8;
      margin: 24px 0 8px;
    }
    @media print {
      body { background: white; }
      .print-header { margin-bottom: 16px; }
    }
  `;

  const stepLabels =
    enrollmentMode === 'new'
      ? ['Identité', 'Classe', 'Paiement']
      : ['Recherche', 'Classe', 'Paiement'];

  const handleLookupStudent = () => {
    const matricule = lookupMatricule.trim();
    if (!matricule) {
      toast({
        title: 'Matricule manquant',
        description: 'Saisissez le matricule de l’élève à réinscrire.',
      });
      return;
    }

    lookupMutation.mutate(matricule);
  };

  const handleNext = () => {
    if (currentStep === 1 && !canAdvanceFromStepOne) {
      toast({
        title: 'Informations incomplètes',
        description:
          enrollmentMode === 're_enrollment'
            ? 'Recherchez d’abord le matricule de l’élève.'
            : 'Complétez les informations de l’élève et du parent.',
      });
      return;
    }

    if (currentStep === 2 && !canAdvanceFromStepTwo) {
      toast({
        title: 'Sélection manquante',
        description: 'Veuillez sélectionner un niveau puis une classe.',
      });
      return;
    }

    setCurrentStep((value) => Math.min(3, value + 1));
  };

  const handleBack = () => setCurrentStep((value) => Math.max(1, value - 1));

  const openDetailsFromEnrollment = (enrollment: EnrollmentRow) => {
    setSelectedEnrollment(enrollment);
    setIsViewDialogOpen(true);
  };

  const handleSaveEnrollment = () => {
    if (!selectedPeriodId) {
      toast({
        title: 'Période manquante',
        description: 'Sélectionnez une période active.',
      });
      return;
    }

    if (!selectedLevelId || !selectedClassId) {
      toast({
        title: 'Classe manquante',
        description: 'Sélectionnez un niveau et une classe.',
      });
      return;
    }

    submitEnrollmentMutation.mutate();
  };

  const handleToggleActivePeriod = (periodId: string) => {
    setActivePeriodMutation.mutate(periodId);
  };

  const handlePeriodDelete = () => {
    if (!periodToDelete) return;
    deletePeriodMutation.mutate(periodToDelete.id);
  };

  const isMainLoading =
    academicYearsQuery.isLoading ||
    levelsQuery.isLoading ||
    classesQuery.isLoading ||
    periodsQuery.isLoading ||
    activePeriodsQuery.isLoading ||
    enrollmentsQuery.isLoading;

  if (isMainLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inscriptions & Réinscriptions</h1>
          <p className="text-muted-foreground">Chargement des données académiques...</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Préparation des périodes, classes et inscriptions...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inscriptions & Réinscriptions</h1>
          <p className="text-muted-foreground">
            Gérez les nouvelles inscriptions, les réinscriptions et les périodes associées.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => openWizard('re_enrollment')}>
            <RefreshCw className="h-4 w-4" />
            Réinscription
          </Button>
          <Button className="gap-2" onClick={() => openWizard('new')}>
            <UserPlus className="h-4 w-4" />
            Nouvelle inscription
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'enrollments' | 'periods')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="enrollments" className="gap-2">
            <ListFilter className="h-4 w-4" />
            Inscriptions ({enrollmentStats.total})
          </TabsTrigger>
          <TabsTrigger value="periods" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Périodes ({periods.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{enrollmentStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{enrollmentStats.paidCount}</p>
                    <p className="text-xs text-muted-foreground">Payés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{enrollmentStats.newCount}</p>
                    <p className="text-xs text-muted-foreground">Nouvelles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                    <RefreshCw className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{enrollmentStats.reCount}</p>
                    <p className="text-xs text-muted-foreground">Réinscriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">{formatAmount(enrollmentStats.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataList
            data={enrollmentRows}
            columns={enrollmentColumns}
            searchKey="searchText"
            searchPlaceholder="Rechercher par nom, matricule ou reçu..."
            filterOptions={enrollmentFilterOptions}
            defaultView="list"
            gridItem={enrollmentGridItem}
            emptyMessage="Aucune inscription trouvée"
            itemsPerPage={8}
          />
        </TabsContent>

        <TabsContent value="periods" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Périodes</p>
                <p className="text-2xl font-bold">{periodStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Actives nouvelle inscription</p>
                <p className="text-2xl font-bold text-green-600">{periodStats.activeNew}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Actives réinscription</p>
                <p className="text-2xl font-bold text-violet-600">{periodStats.activeRe}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">À venir</p>
                <p className="text-2xl font-bold text-blue-600">{periodStats.upcoming}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Expirées</p>
                <p className="text-2xl font-bold text-slate-600">{periodStats.expired}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Périodes d’inscription</p>
              <p className="text-sm text-muted-foreground">
                Les périodes actives doivent appartenir à l’année scolaire active.
              </p>
            </div>
            <Button className="gap-2" onClick={openCreatePeriodDialog} disabled={!canCreatePeriodForActiveYear}>
              <Plus className="h-4 w-4" />
              Nouvelle période
            </Button>
          </div>

          {periods.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aucune période n’a encore été configurée.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {periods
                .slice()
                .sort((left, right) => {
                  const order: Record<PeriodStatus, number> = { active: 0, upcoming: 1, expired: 2 };
                  return order[getPeriodStatus(left)] - order[getPeriodStatus(right)];
                })
                .map((period) => {
                  const status = getPeriodStatus(period);
                  const linkedCount = enrollments.filter((enrollment) => enrollment.periodId === period.id).length;

                  return (
                    <Card key={period.id} className="overflow-hidden">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">{period.name}</CardTitle>
                            <CardDescription>{period.academicYear}</CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <EnrollmentTypeBadge type={period.type} />
                            <PeriodStatusBadge status={status} />
                          </div>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(period.startDate)} → {formatDate(period.endDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {linkedCount} inscription(s)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Capacité</span>
                          <span className="font-medium">{period.maxEnrollments ?? 'Illimitée'}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">{getPeriodStatus(period) === 'active' ? 'En cours' : period.isActive ? 'Programmée' : 'Inactive'}</span>
                          </div>
                          <Progress value={status === 'active' ? 100 : status === 'upcoming' ? 50 : 0} />
                        </div>
                        {period.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{period.description}</p>
                        )}
                      </CardContent>
                      <CardContent className="border-t bg-muted/20 p-4">
                        <div className="flex flex-wrap gap-2">
                          {!period.isActive ? (
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleToggleActivePeriod(period.id)}
                              disabled={setActivePeriodMutation.isPending}
                            >
                              <Power className="h-3.5 w-3.5" />
                              Activer
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="gap-1" disabled>
                              <PowerOff className="h-3.5 w-3.5" />
                              Active
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditPeriodDialog(period)}>
                            <Edit2 className="h-3.5 w-3.5" />
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive"
                            onClick={() => setPeriodToDelete(period)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isWizardOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeWizard();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-hide sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {enrollmentMode === 'new' ? 'Nouvelle inscription' : 'Réinscription'}
            </DialogTitle>
            <DialogDescription>
              La création génère automatiquement le matricule, le QR code, les comptes utilisateur et le reçu payé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">Période utilisée</p>
                <p className="text-xs text-muted-foreground">
                  {currentPeriod ? `${currentPeriod.name} · ${currentPeriod.academicYear}` : 'Aucune période'}
                </p>
                <p className="text-xs text-muted-foreground">
                  La période est choisie automatiquement selon le type et l’année active.
                </p>
              </div>
              {currentPeriod ? (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  {currentPeriod.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Aucune période active
                </Badge>
              )}
            </div>

            <StepIndicator currentStep={currentStep} steps={stepLabels} />
            <Progress value={(currentStep / 3) * 100} />

            {currentStep === 1 && (
              <div className="space-y-6">
                {enrollmentMode === 're_enrollment' && (
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Rechercher l’élève</CardTitle>
                      <CardDescription>
                        Saisissez le matricule pour préremplir automatiquement les informations existantes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="lookupMatricule">Matricule</Label>
                        <Input
                          id="lookupMatricule"
                          value={lookupMatricule}
                          onChange={(event) => setLookupMatricule(event.target.value)}
                          placeholder="SCH-2026-0001"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          className="gap-2"
                          onClick={handleLookupStudent}
                          disabled={lookupMutation.isPending}
                        >
                          <Search className="h-4 w-4" />
                          Rechercher
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lookupStudent && enrollmentMode === 're_enrollment' && (
                  <Card className="border-green-200 bg-green-50/40">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">
                            {lookupStudent.firstName} {lookupStudent.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lookupStudent.matricule ?? lookupMatricule} · {lookupStudent.class || 'Classe inconnue'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{lookupStudent.level || 'Niveau non défini'}</Badge>
                          <Badge variant="outline">{lookupStudent.parentName || 'Parent non renseigné'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">Prénom de l’élève</Label>
                    <Input
                      id="studentFirstName"
                      value={enrollmentForm.studentFirstName}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentFirstName: event.target.value }))
                      }
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">Nom de l’élève</Label>
                    <Input
                      id="studentLastName"
                      value={enrollmentForm.studentLastName}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentLastName: event.target.value }))
                      }
                      placeholder="Nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email de l’élève</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      value={enrollmentForm.studentEmail}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentEmail: event.target.value }))
                      }
                      placeholder="eleve@email.sn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPhone">Téléphone de l’élève</Label>
                    <Input
                      id="studentPhone"
                      value={enrollmentForm.studentPhone}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentPhone: event.target.value }))
                      }
                      placeholder="+221 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentDateOfBirth">Date de naissance</Label>
                    <Input
                      id="studentDateOfBirth"
                      type="date"
                      value={enrollmentForm.studentDateOfBirth}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentDateOfBirth: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentGender">Genre</Label>
                    <Select
                      value={enrollmentForm.studentGender}
                      onValueChange={(value) =>
                        setEnrollmentForm((current) => ({
                          ...current,
                          studentGender: value as 'male' | 'female',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculin</SelectItem>
                        <SelectItem value="female">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="studentAddress">Adresse de l’élève</Label>
                    <Textarea
                      id="studentAddress"
                      value={enrollmentForm.studentAddress}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentAddress: event.target.value }))
                      }
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPreviousSchool">École précédente</Label>
                    <Input
                      id="studentPreviousSchool"
                      value={enrollmentForm.studentPreviousSchool}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, studentPreviousSchool: event.target.value }))
                      }
                      placeholder="Nom de l’établissement"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">Prénom du parent / tuteur</Label>
                    <Input
                      id="parentFirstName"
                      value={enrollmentForm.parentFirstName}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentFirstName: event.target.value }))
                      }
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentLastName">Nom du parent / tuteur</Label>
                    <Input
                      id="parentLastName"
                      value={enrollmentForm.parentLastName}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentLastName: event.target.value }))
                      }
                      placeholder="Nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email du parent</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={enrollmentForm.parentEmail}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentEmail: event.target.value }))
                      }
                      placeholder="parent@email.sn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Téléphone du parent</Label>
                    <Input
                      id="parentPhone"
                      value={enrollmentForm.parentPhone}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentPhone: event.target.value }))
                      }
                      placeholder="+221 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentProfession">Profession</Label>
                    <Input
                      id="parentProfession"
                      value={enrollmentForm.parentProfession}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentProfession: event.target.value }))
                      }
                      placeholder="Profession"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentAddress">Adresse du parent</Label>
                    <Input
                      id="parentAddress"
                      value={enrollmentForm.parentAddress}
                      onChange={(event) =>
                        setEnrollmentForm((current) => ({ ...current, parentAddress: event.target.value }))
                      }
                      placeholder="Adresse"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="levelId">Niveau</Label>
                    <Select value={selectedLevelId} onValueChange={handleLevelChange}>
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
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Classe retenue</p>
                    <p className="text-sm text-muted-foreground">
                      {currentClass ? currentClass.name : 'Aucune classe sélectionnée'}
                    </p>
                  </div>
                </div>

                {!selectedLevelId ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      Sélectionnez un niveau pour charger dynamiquement les classes correspondantes.
                    </CardContent>
                  </Card>
                ) : wizardClassesQuery.isLoading ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      Chargement des classes du niveau sélectionné...
                    </CardContent>
                  </Card>
                ) : wizardClasses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      Aucune classe n’est disponible pour ce niveau.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {wizardClasses.map((schoolClass) => (
                      <button
                        key={schoolClass.id}
                        type="button"
                        onClick={() => setSelectedClassId(schoolClass.id)}
                        className={[
                          'rounded-xl border p-4 text-left transition',
                          selectedClassId === schoolClass.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'hover:border-primary/40 hover:bg-muted/40',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{schoolClass.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {schoolClass.level?.name || currentLevel?.name || 'Niveau'}
                            </p>
                          </div>
                          {selectedClassId === schoolClass.id && (
                            <Badge className="bg-primary text-primary-foreground">Sélectionnée</Badge>
                          )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Capacité</span>
                            <span className="font-medium">{schoolClass.capacity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Élèves actuels</span>
                            <span className="font-medium">{schoolClass.students}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Paiement et validation</CardTitle>
                    <CardDescription>
                      Le paiement est généré automatiquement au statut PAYÉ avec un reçu unique.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                        <Select
                          value={enrollmentForm.paymentMethod}
                          onValueChange={(value) =>
                            setEnrollmentForm((current) => ({ ...current, paymentMethod: value as PaymentMethod }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Méthode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Espèces</SelectItem>
                            <SelectItem value="wave">Wave</SelectItem>
                            <SelectItem value="orange_money">Orange Money</SelectItem>
                            <SelectItem value="transfer">Virement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentAmount">Montant payé</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          min="0"
                          step="1"
                          value={enrollmentForm.paymentAmount}
                          onChange={(event) =>
                            setEnrollmentForm((current) => ({ ...current, paymentAmount: event.target.value }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={enrollmentForm.notes}
                        onChange={(event) =>
                          setEnrollmentForm((current) => ({ ...current, notes: event.target.value }))
                        }
                        placeholder="Remarques complémentaires"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Récapitulatif</CardTitle>
                    <CardDescription>
                      Vérifiez les informations avant de créer l’inscription.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Période</span>
                      <span className="font-medium">{currentPeriod?.name ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Niveau</span>
                      <span className="font-medium">{currentLevel?.name ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Classe</span>
                      <span className="font-medium">{currentClass?.name ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Élève</span>
                      <span className="font-medium">
                        {enrollmentForm.studentFirstName || lookupStudent?.firstName || '-'}{' '}
                        {enrollmentForm.studentLastName || lookupStudent?.name || ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Parent</span>
                      <span className="font-medium">
                        {enrollmentForm.parentFirstName || lookupStudent?.parentFirstName || '-'}{' '}
                        {enrollmentForm.parentLastName || lookupStudent?.parentLastName || ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-medium">
                        {formatAmount(Number.parseInt(enrollmentForm.paymentAmount || '0', 10) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Paiement</span>
                      <span className="font-medium">{getPaymentMethodLabel(enrollmentForm.paymentMethod)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => closeWizard()} disabled={submitEnrollmentMutation.isPending}>
                Annuler
              </Button>
              {currentStep > 1 && (
                <Button variant="outline" className="gap-2" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4" />
                  Retour
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button className="gap-2" onClick={handleNext} disabled={currentStep === 1 && !canAdvanceFromStepOne}>
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="gap-2" onClick={handleSaveEnrollment} disabled={submitEnrollmentMutation.isPending || !canSubmit}>
                  {submitEnrollmentMutation.isPending ? 'Enregistrement...' : 'Créer et générer le reçu'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPeriodDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPeriodDialogOpen(false);
            setEditingPeriodId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{periodMode === 'create' ? 'Nouvelle période' : 'Modifier la période'}</DialogTitle>
            <DialogDescription>
              Créez ou ajustez les périodes de nouvelle inscription et de réinscription.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="periodName">Nom</Label>
              <Input
                id="periodName"
                value={periodForm.name}
                onChange={(event) => setPeriodForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Inscription 2026-2027"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodType">Type</Label>
              <Select
                value={periodForm.type}
                onValueChange={(value) => setPeriodForm((current) => ({ ...current, type: value as EnrollmentType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new" disabled={periodTypesUsedForTargetYear.has('new')}>
                    Nouvelle inscription
                  </SelectItem>
                  <SelectItem value="re_enrollment" disabled={periodTypesUsedForTargetYear.has('re_enrollment')}>
                    Réinscription
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Une année scolaire ne peut contenir qu’une période d’inscription et qu’une période de réinscription.
              </p>
            </div>
            {periodMode === 'edit' ? (
              <div className="space-y-2">
                <Label htmlFor="periodAcademicYear">Année scolaire</Label>
                <Select
                  value={periodForm.academicYearId}
                  onValueChange={(value) => setPeriodForm((current) => ({ ...current, academicYearId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearsQuery.data?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.status === 'active' ? '(Active)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2 md:col-span-2">
                <Label>Année scolaire</Label>
                <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {activeAcademicYear
                    ? `La période sera automatiquement rattachée à l’année active : ${activeAcademicYear.name}.`
                    : 'Aucune année scolaire active n’est disponible pour créer une période.'}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="periodStart">Date de début</Label>
              <Input
                id="periodStart"
                type="date"
                value={periodForm.startDate}
                onChange={(event) => setPeriodForm((current) => ({ ...current, startDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Date de fin</Label>
              <Input
                id="periodEnd"
                type="date"
                value={periodForm.endDate}
                onChange={(event) => setPeriodForm((current) => ({ ...current, endDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodMax">Maximum d’inscriptions</Label>
              <Input
                id="periodMax"
                type="number"
                min="1"
                value={periodForm.maxEnrollments}
                onChange={(event) => setPeriodForm((current) => ({ ...current, maxEnrollments: event.target.value }))}
                placeholder="Illimité"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodActive">Active</Label>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm text-muted-foreground">Rendre la période disponible immédiatement</span>
                <Switch
                  checked={periodForm.isActive}
                  onCheckedChange={(checked) => setPeriodForm((current) => ({ ...current, isActive: checked }))}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="periodDescription">Description</Label>
              <Textarea
                id="periodDescription"
                value={periodForm.description}
                onChange={(event) => setPeriodForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Précisions sur la période"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPeriodDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={savePeriod} disabled={periodMutation.isPending || !validatePeriodForm()}>
              {periodMutation.isPending ? 'Enregistrement...' : periodMode === 'create' ? 'Créer la période' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Détails de l'inscription</DialogTitle>
            <DialogDescription>
              Aperçu complet de l'inscription et du reçu généré.
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="grid gap-6 lg:grid-cols-[1fr]">
              <Card>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedEnrollment.studentInfo.firstName} {selectedEnrollment.studentInfo.lastName}
                      </CardTitle>
                      <CardDescription>
                        {selectedEnrollment.classAssignment?.className ?? selectedEnrollment.level ?? 'Classe non définie'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <EnrollmentTypeBadge type={selectedEnrollment.type} />
                      <EnrollmentStatusBadge status={selectedEnrollment.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Matricule</p>
                      <p className="font-medium">{selectedEnrollment.matricule ?? selectedEnrollment.studentInfo.matricule ?? '-'}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Reçu</p>
                      <p className="font-medium">{selectedEnrollment.receiptNumber ?? selectedEnrollment.enrollmentNumber}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Période</p>
                      <p className="font-medium">{selectedEnrollment.period?.name ?? selectedEnrollment.periodId}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Année scolaire</p>
                      <p className="font-medium">{selectedEnrollment.academicYear}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Élève</p>
                      <p className="font-medium">
                        {selectedEnrollment.studentInfo.firstName} {selectedEnrollment.studentInfo.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedEnrollment.studentInfo.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Parent / tuteur</p>
                      <p className="font-medium">
                        {selectedEnrollment.parentInfo.firstName} {selectedEnrollment.parentInfo.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedEnrollment.parentInfo.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Classe</p>
                      <p className="font-medium">{selectedEnrollment.classAssignment?.className ?? '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Niveau</p>
                      <p className="font-medium">{selectedEnrollment.level ?? '-'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-medium">{formatAmount(selectedEnrollment.payment.amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Paiement</p>
                      <p className="font-medium">{getPaymentMethodLabel(selectedEnrollment.payment.method)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Statut paiement</p>
                      <p className="font-medium">{selectedEnrollment.payment.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" className="gap-2" onClick={() => selectedEnrollment && printEnrollmentReceipt(selectedEnrollment)}>
              <Printer className="h-4 w-4" />
              Imprimer le reçu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(periodToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPeriodToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la période</AlertDialogTitle>
            <AlertDialogDescription>
              {periodToDelete
                ? `Voulez-vous supprimer "${periodToDelete.name}" ? Cette action est irréversible.`
                : 'Voulez-vous supprimer cette période ?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePeriodDelete}
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
