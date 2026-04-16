import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import QRCode from 'react-qr-code';
import { BookOpen, Edit, Mail, Plus, Printer, School as SchoolIcon, Trash2, TrendingUp, User, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi } from '@/services/attendance';
import { useToast } from '@/hooks/use-toast';
import { academicApi } from '@/services/academic';

import { schoolApi } from '@/services/school';
import { usersApi, type CreateStudentPayload, type UpdateStudentPayload } from '@/services/users';
import { escapeHtml, openPrintableWindow, writePrintableDocument } from '@/lib/print';
import { CURRENT_ACADEMIC_SELECTION, resolveAcademicYearSelection } from '@/lib/academic-scope';
import type { AcademicYear, SchoolClass } from '@/types/academic';
import type { School } from '@/types/school';
import type { Student } from '@/types/users';
import { getApiErrorMessage } from '@/lib/api-errors';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type StudentFormState = {
  firstName: string;
  name: string;
  email: string;
  phone: string;
  classId: string;
  academicYearId: string;
  average: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: Student['status'];
};

const createDefaultForm = (): StudentFormState => ({
  firstName: '',
  name: '',
  email: '',
  phone: '',
  classId: '',
  academicYearId: '',
  average: '0',
  dateOfBirth: '',
  gender: '',
  address: '',
  parentName: '',
  parentPhone: '',
  status: 'active',
});

type StudentRow = Student & { searchText: string };

const formatStudentLabel = (student: Student) => `${student.firstName} ${student.name}`;

const getInitials = (firstName?: string, lastName?: string) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((value) => value?.trim().charAt(0).toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'E';

const formatPrintableDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};


const renderQrSvg = (value: string, size: number) =>
  renderToStaticMarkup(
    <QRCode
      value={value}
      size={size}
      style={{ height: `${size}px`, width: `${size}px` }}
    />,
  );

const normalizeSchoolProfile = (school: School | null | undefined, fallbackName: string): School => ({
  id: school?.id ?? 'current-school',
  slug: school?.slug ?? '',
  name: school?.name ?? fallbackName,
  type: school?.type ?? 'private',
  status: school?.status ?? 'active',
  plan: school?.plan ?? 'free',
  logo: school?.logo ?? undefined,
  description: school?.description ?? undefined,
  brandingColor: school?.brandingColor ?? undefined,
  brandingSecondaryColor: school?.brandingSecondaryColor ?? undefined,
  brandingSlogan: school?.brandingSlogan ?? undefined,
  country: school?.country ?? '',
  city: school?.city ?? '',
  address: school?.address ?? '',
  phone: school?.phone ?? undefined,
  email: school?.email ?? '',
  studentCount: school?.studentCount ?? 0,
  teacherCount: school?.teacherCount ?? 0,
  adminEmail: school?.adminEmail ?? school?.email ?? '',
  createdAt: school?.createdAt ?? new Date().toISOString(),
  buildings: school?.buildings ?? [],
});

const buildSchoolMetaLine = (school: School) =>
  [school.address, school.city, school.country].filter(Boolean).join(' • ');

const buildSchoolContactLine = (school: School) =>
  [school.phone, school.email].filter(Boolean).join(' • ');

const buildPrintTheme = (accent: string, secondary: string) => `
  :root {
    --print-accent: #1d4ed8;
    --print-secondary: #1d4ed8;
  }
  .print-page {
    width: 100%;
    min-height: calc(100vh - 24mm);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
  .badge-container {
    display: flex;
    gap: 0;
    perspective: 1000px;
  }
  .badge-side {
    width: 280px;
    height: 420px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .badge-recto {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .badge-verso {
    border-left: 2px dashed #e2e8f0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background: #f8fafc;
  }
  .badge-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    width: 100%;
  }
  .badge-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    color: white;
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
  }
  .badge-school {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1d4ed8;
    text-align: left;
    flex: 1;
  }
  .badge-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 32px;
    color: white;
    box-shadow: 0 8px 24px rgba(29, 78, 216, 0.35);
    margin-bottom: 16px;
  }
  .badge-name {
    font-size: 20px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
    line-height: 1.2;
  }
  .badge-class {
    font-size: 14px;
    font-weight: 600;
    color: #1d4ed8;
    background: #eff6ff;
    padding: 4px 16px;
    border-radius: 20px;
    margin-bottom: 8px;
  }
  .badge-matricule {
    font-size: 12px;
    font-weight: 700;
    font-family: monospace;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 6px;
    margin-bottom: auto;
  }
  .badge-footer-recto {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 12px;
  }
  .badge-title {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #1d4ed8;
    margin-bottom: 16px;
  }
  .badge-qr {
    background: white;
    padding: 12px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    margin-bottom: 16px;
  }
  .badge-info-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 11px;
    padding: 4px 0;
    border-bottom: 1px dashed #e2e8f0;
  }
  .badge-info-row span {
    color: #64748b;
  }
  .badge-info-row strong {
    color: #0f172a;
    font-weight: 600;
  }
  .badge-school-name {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1d4ed8;
    margin-top: auto;
    padding-top: 12px;
  }
  @media print {
    body { background: white; }
    .badge-container { gap: 0; }
    @page { margin: 10mm; }
  }
`;

const buildStudentCardHtml = (
  student: Student,
  school: School | null,
  fallbackSchoolName: string,
) => {
  const resolvedSchool = normalizeSchoolProfile(school, fallbackSchoolName);
  const accent = resolvedSchool.brandingColor ?? '#1d4ed8';
  const secondary = resolvedSchool.brandingSecondaryColor ?? '#0ea5e9';
  const fullName = `${student.firstName} ${student.name}`.trim();
  const qrValue = student.qrCode || `EDUSPHERE-STUDENT-${student.id}`;
  const qrSvg = renderQrSvg(qrValue, 220);
  const logoInitials = getInitials(resolvedSchool.name);

  return {
    title: `Carte élève - ${fullName}`,
    styles: buildPrintTheme(accent, secondary),
    bodyHtml: `
      <div class="print-page">
        <div class="badge-container">
          <!-- RECTO -->
          <div class="badge-side badge-recto">
            <div class="badge-header">
              <div class="badge-logo">${escapeHtml(logoInitials)}</div>
              <div class="badge-school">${escapeHtml(resolvedSchool.name)}</div>
            </div>
            <div class="badge-avatar">${escapeHtml(getInitials(student.firstName, student.name))}</div>
            <div class="badge-name">${escapeHtml(fullName)}</div>
            <div class="badge-class">${escapeHtml(student.class || 'Classe non assignée')}</div>
            <div class="badge-matricule">${escapeHtml(student.matricule || 'Matricule en attente')}</div>
            <div class="badge-footer-recto">
              <span>Année: ${escapeHtml(student.enrollmentYear || new Date().getFullYear().toString())}</span>
            </div>
          </div>

          <!-- VERSO -->
          <div class="badge-side badge-verso">
            <div class="badge-title">QR Code</div>
            <div class="badge-qr">${qrSvg}</div>
            <div class="badge-info-row">
              <span>Statut:</span>
              <strong>${escapeHtml(student.status === 'active' ? 'Actif' : 'Inactif')}</strong>
            </div>
            <div class="badge-info-row">
              <span>Parent:</span>
              <strong>${escapeHtml(student.parentName || '—')}</strong>
            </div>
            <div class="badge-info-row">
              <span>Tél:</span>
              <strong>${escapeHtml(student.parentPhone || '—')}</strong>
            </div>
            <div class="badge-school-name">${escapeHtml(resolvedSchool.name)}</div>
          </div>
        </div>
      </div>
    `,
  };
};


export default function Students() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormState>(createDefaultForm);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(CURRENT_ACADEMIC_SELECTION);

  const studentsQuery = useQuery({
    queryKey: ['school-admin', 'students', selectedAcademicYearId],
    queryFn: () =>
      usersApi.fetchStudents(
        selectedAcademicYearId === CURRENT_ACADEMIC_SELECTION
          ? undefined
          : { academicYearId: selectedAcademicYearId },
      ),
    retry: false,
  });

  const classesQuery = useQuery({
    queryKey: ['school-admin', 'classes', selectedAcademicYearId],
    queryFn: () =>
      academicApi.fetchClasses(
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

  const schoolProfileQuery = useQuery({
    queryKey: ['school-admin', 'school-profile'],
    queryFn: schoolApi.fetchCurrentSchool,
    retry: false,
  });

  const students = useMemo<StudentRow[]>(
    () =>
      (studentsQuery.data ?? []).map((student) => ({
        ...student,
        searchText: [
          student.firstName,
          student.name,
          student.email,
          student.phone,
          student.class,
          student.matricule,
          student.parentName,
          student.parentPhone,
          student.gender,
          student.address,
          student.status,
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [studentsQuery.data],
  );

  const classes = classesQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];
  const schoolProfile = schoolProfileQuery.data ?? null;
  const activeAcademicYearId = resolveAcademicYearSelection(CURRENT_ACADEMIC_SELECTION, academicYears);
  const formAcademicYearId = formData.academicYearId || activeAcademicYearId;

  const formClassesQuery = useQuery({
    queryKey: ['school-admin', 'classes', 'form', formAcademicYearId],
    queryFn: () =>
      academicApi.fetchClasses(formAcademicYearId ? { academicYearId: formAcademicYearId } : undefined),
    retry: false,
    enabled: isFormDialogOpen,
  });

  const formClasses = formClassesQuery.data ?? [];

  const isLoading = studentsQuery.isLoading || classesQuery.isLoading || academicYearsQuery.isLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'students'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'classes'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'academic-years'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateStudentPayload) => usersApi.createStudent(payload),
    onSuccess: () => {
      toast({
        title: 'Élève créé',
        description: 'Le nouvel élève a été ajouté.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedStudent(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer l’élève.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentPayload }) => usersApi.updateStudent(id, payload),
    onSuccess: () => {
      toast({
        title: 'Élève mis à jour',
        description: 'Les informations ont été enregistrées.',
      });
      invalidateAll();
      setIsFormDialogOpen(false);
      setSelectedStudent(null);
      setFormData(createDefaultForm());
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier l’élève.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteStudent(id),
    onSuccess: () => {
      toast({
        title: 'Élève supprimé',
        description: 'L’élève a bien été supprimé.',
      });
      invalidateAll();
      setStudentToDelete(null);
      if (cardStudent?.id) {
        setIsCardDialogOpen(false);
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer l’élève.'),
      });
    },
  });

  const promoteLeaderMutation = useMutation({
    mutationFn: (studentId: string) => attendanceApi.toggleClassLeader(studentId),
    onSuccess: (data) => {
      toast({
        title: data.isClassLeader ? 'Délégué nommé' : 'Status révoqué',
        description: data.message,
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: getApiErrorMessage(error, 'Impossible de changer le statut de délégué.'),
        variant: 'destructive',
      });
    },
  });

  const openCreateDialog = () => {
    setSelectedStudent(null);
    setFormData({
      ...createDefaultForm(),
      academicYearId: activeAcademicYearId,
    });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      name: student.name,
      email: student.email,
      phone: student.phone,
      classId: student.classId,
      academicYearId: student.academicYearId || activeAcademicYearId,
      average: String(student.average ?? 0),
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || '',
      address: student.address || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      status: student.status,
    });
    setIsFormDialogOpen(true);
  };

  const openCardDialog = (student: Student) => {
    setCardStudent(student);
    setIsCardDialogOpen(true);
  };

  const printStudentCard = (student: Student) => {
    const schoolNameFallback = user?.schoolName ?? 'EduSphere';
    const printWindow = openPrintableWindow(`Carte élève - ${student.firstName} ${student.name}`);

    if (!printWindow) {
      toast({
        title: 'Fenêtre bloquée',
        description: 'Autorisez les fenêtres contextuelles pour imprimer la carte.',
      });
      return;
    }

    const printDocument = buildStudentCardHtml(student, schoolProfile, schoolNameFallback);
    writePrintableDocument(printWindow, printDocument.title, printDocument.bodyHtml, printDocument.styles);
  };


  const handleSubmit = () => {
    const payload: CreateStudentPayload = {
      firstName: formData.firstName.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      classId: formData.classId,
      average: Number(formData.average) >= 0 ? Number(formData.average) : 0,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      address: formData.address.trim() || undefined,
      parentName: formData.parentName.trim() || undefined,
      parentPhone: formData.parentPhone.trim() || undefined,
      isActive: formData.status === 'active',
    };

    if (selectedStudent) {
      payload.academicYearId = formData.academicYearId || undefined;
    }

    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const columns: Column<StudentRow>[] = [
    {
      key: 'name',
      label: 'Élève',
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {student.firstName[0]}
              {student.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {student.firstName} {student.name}
            </p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
            {student.isClassLeader && (
              <Badge className="mt-1 bg-amber-500 hover:bg-amber-600 border-0 h-4 text-[10px] px-1">
                Délégué
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Classe',
      sortable: true,
      render: (student) => <Badge variant="outline">{student.class || 'Non assignée'}</Badge>,
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (student) => <span className="font-medium">{student.average}/20</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (student) => (
        <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
          {student.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (student) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => openCardDialog(student)}>
            <BookOpen className="h-3 w-3" />
            Dossier
          </Button>
          <Button 
            variant={student.isClassLeader ? "default" : "outline"} 
            size="sm" 
            className={`gap-1 ${student.isClassLeader ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
            onClick={() => promoteLeaderMutation.mutate(student.id)}
            disabled={promoteLeaderMutation.isPending}
          >
            {student.isClassLeader ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
            {student.isClassLeader ? 'Révoquer' : 'Délégué'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditDialog(student)}>
            <Edit className="h-3 w-3" />
            Modifier
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setStudentToDelete(student)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
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
      key: 'classId',
      label: 'Classe',
      options: classes.map((schoolClass: SchoolClass) => ({ value: schoolClass.id, label: schoolClass.name })),
      disableAll: true,
      defaultValue: classes.length > 0 ? classes[0].id : undefined,
    },
  ];

  const gridItem = (student: StudentRow) => (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {student.firstName[0]}
            {student.name[0]}
          </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {student.firstName} {student.name}
            </h3>
            <p className="text-xs text-muted-foreground">{student.matricule || 'Matricule en attente'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {student.class || 'Non assignée'}
              </Badge>
              <Badge variant={student.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
              {student.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3 w-3" />
          {student.email}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <SchoolIcon className="h-3 w-3" />
          {student.class || 'Classe non définie'}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Moyenne: {student.average}/20
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3" />
          Parent: {student.parentName || 'Non renseigné'}
        </span>
      </div>
      <div className="grid gap-2 pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="w-full gap-1 flex-1" onClick={() => openCardDialog(student)}>
            <BookOpen className="h-3 w-3" />
            Dossier
          </Button>
          <Button 
            variant={student.isClassLeader ? "default" : "outline"} 
            size="sm" 
            className={`gap-1 flex-1 ${student.isClassLeader ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
            onClick={() => promoteLeaderMutation.mutate(student.id)}
            disabled={promoteLeaderMutation.isPending}
          >
            {student.isClassLeader ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
            {student.isClassLeader ? 'Révoquer' : 'Délégué'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(student)}>
            <Edit className="h-3 w-3" />
            Modifier
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setStudentToDelete(student)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Élèves</h1>
          <p className="text-muted-foreground">Chargement des élèves et des classes...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des données des élèves...
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeStudents = students.filter((student) => student.status === 'active').length;
  const averageAll =
    students.length > 0
      ? (students.reduce((sum, student) => sum + student.average, 0) / students.length).toFixed(1)
      : '0.0';
  const classCount = new Set(students.map((student) => student.classId).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Élèves</h1>
          <p className="text-muted-foreground">Gérez les inscriptions, les parents et les informations académiques.</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nouvel élève
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>{selectedStudent ? 'Modifier l’élève' : 'Ajouter un nouvel élève'}</DialogTitle>
              <DialogDescription>
                {selectedStudent
                  ? 'Modifiez les informations de l’élève et de son responsable.'
                  : 'Complétez les informations de l’élève et de son responsable. La création utilisera l’année active automatiquement.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Les classes proposées appartiennent à l’année active.
                </p>
              )}
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
                    placeholder="email@eleve.sn"
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
                  <Label htmlFor="classId">Classe</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData((current) => ({ ...current, classId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {formClasses.map((schoolClass: SchoolClass) => (
                        <SelectItem key={schoolClass.id} value={schoolClass.id}>
                          {schoolClass.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="academicYearId">Année scolaire</Label>
                    <Select
                      value={formData.academicYearId}
                      onValueChange={(value) =>
                        setFormData((current) => ({ ...current, academicYearId: value, classId: '' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="average">Moyenne</Label>
                  <Input
                    id="average"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={formData.average}
                    onChange={(event) => setFormData((current) => ({ ...current, average: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((current) => ({ ...current, status: value as Student['status'] }))}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(event) => setFormData((current) => ({ ...current, dateOfBirth: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData((current) => ({ ...current, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Adresse de résidence"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Nom du parent</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(event) => setFormData((current) => ({ ...current, parentName: event.target.value }))}
                    placeholder="Nom du parent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Téléphone parent</Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(event) => setFormData((current) => ({ ...current, parentPhone: event.target.value }))}
                    placeholder="+221 77 xxx xx xx"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.firstName || !formData.name || !formData.email || !formData.classId}>
                {selectedStudent ? 'Enregistrer' : 'Créer l’élève'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">Année scolaire</p>
          <p className="text-xs text-muted-foreground">Les élèves et les classes suivent l’année active par défaut.</p>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Élèves</p>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Moyenne globale</p>
            <p className="text-2xl font-bold">{averageAll}/20</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Classes couvertes</p>
            <p className="text-2xl font-bold">{classCount}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={students}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un élève..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun élève trouvé"
        itemsPerPage={6}
      />

      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Dossier de l'élève</DialogTitle>
            <DialogDescription>Informations complètes de l'élève et de son tuteur / parent.</DialogDescription>
          </DialogHeader>
          {cardStudent && (
            <div className="overflow-y-auto scrollbar-hide flex-1 pr-2 space-y-5 py-1" style={{ scrollbarWidth: 'none' }}>
              {/* En-tête identité */}
              <div className="flex items-center gap-4 rounded-xl border bg-primary/5 p-4">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {cardStudent.firstName[0]}{cardStudent.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">{cardStudent.firstName} {cardStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{cardStudent.class || 'Classe non assignée'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant={cardStudent.status === 'active' ? 'secondary' : 'outline'}>
                      {cardStudent.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    {cardStudent.matricule && (
                      <Badge variant="outline" className="font-mono text-xs">{cardStudent.matricule}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations académiques */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informations académiques</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Matricule</p>
                    <p className="font-medium">{cardStudent.matricule || 'Non attribué'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Classe</p>
                    <p className="font-medium">{cardStudent.class || 'Non assignée'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Niveau</p>
                    <p className="font-medium">{cardStudent.level || 'Non défini'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Année scolaire</p>
                    <p className="font-medium">{cardStudent.enrollmentYear || 'Non précisée'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Moyenne</p>
                    <p className="font-medium">{cardStudent.average}/20</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Statut</p>
                    <p className="font-medium">{cardStudent.status === 'active' ? 'Actif' : 'Inactif'}</p>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informations personnelles</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="font-medium truncate">{cardStudent.email || '—'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                    <p className="font-medium">{cardStudent.phone || '—'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Date de naissance</p>
                    <p className="font-medium">
                      {cardStudent.dateOfBirth ? formatPrintableDate(cardStudent.dateOfBirth) : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Genre</p>
                    <p className="font-medium">
                      {cardStudent.gender === 'M' ? 'Masculin' : cardStudent.gender === 'F' ? 'Féminin' : cardStudent.gender || '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
                    <p className="font-medium">{cardStudent.address || '—'}</p>
                  </div>
                  {cardStudent.previousSchool && (
                    <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">École précédente</p>
                      <p className="font-medium">{cardStudent.previousSchool}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent / Tuteur */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parent / Tuteur</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Nom complet</p>
                    <p className="font-medium">{cardStudent.parentName || '—'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                    <p className="font-medium">{cardStudent.parentPhone || '—'}</p>
                  </div>
                  {cardStudent.parentEmail && (
                    <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="font-medium">{cardStudent.parentEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="gap-2" onClick={() => cardStudent && printStudentCard(cardStudent)}>
              <Printer className="h-4 w-4" />
              Imprimer la carte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(studentToDelete)} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’élève</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              {studentToDelete ? formatStudentLabel(studentToDelete) : 'cet élève'} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => studentToDelete && deleteMutation.mutate(studentToDelete.id)}
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
