import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Copy,
  Edit,
  Layers3,
  Plus,
  School,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  academicApi,
  type CreateTimetablePayload,
  type DuplicateTimetablePayload,
  type TimetableStatus,
  type UpdateTimetablePayload,
} from '@/services/academic';
import { infrastructureApi } from '@/services/infrastructure';
import {
  CURRENT_ACADEMIC_SELECTION,
  resolveAcademicYearSelection,
  resolveSemesterSelection,
} from '@/lib/academic-scope';
import { getApiErrorMessage } from '@/lib/api-errors';
import type { AcademicYear, SchoolClass, Timetable, TimetableEntry, TimeSlot, TimetableOptions } from '@/types/academic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataList, type Column } from '@/components/ui/data-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { TimeSlotModal, type TimeSlotFormData } from '@/components/timetable/TimeSlotModal';
import { cn } from '@/lib/utils';

const timetableStatusLabels: Record<TimetableStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  draft: 'Brouillon',
};

const getTimetableStatusBadgeClasses = (status: TimetableStatus) => {
  switch (status) {
    case 'active':
      return 'border-white/20 bg-white/15 text-white';
    case 'draft':
      return 'border-warning/30 bg-warning/10 text-warning';
    case 'inactive':
      return 'border-white/20 bg-white/10 text-white/90';
  }

  return 'border-white/20 bg-white/10 text-white/90';
};

type TimetableRow = Timetable & { searchText: string };

type TimetableFormState = {
  academicYearId: string;
  semesterId: string;
  classId: string;
  status: TimetableStatus;
};

const createDefaultTimetableForm = (
  options?: TimetableOptions,
  academicYearSelection: string = CURRENT_ACADEMIC_SELECTION,
  semesterSelection: string = CURRENT_ACADEMIC_SELECTION,
): TimetableFormState => {
  const academicYearId =
    academicYearSelection === CURRENT_ACADEMIC_SELECTION
      ? options?.currentAcademicYearId ??
        resolveAcademicYearSelection(CURRENT_ACADEMIC_SELECTION, options?.academicYears ?? [])
      : academicYearSelection;

  const semesterId =
    semesterSelection === CURRENT_ACADEMIC_SELECTION
      ? resolveSemesterSelection(CURRENT_ACADEMIC_SELECTION, academicYearId, options?.semesters ?? [])
      : semesterSelection;

  const schoolClass = options?.classes.find((item) => item.academicYearId === academicYearId);

  return {
    academicYearId: academicYearId ?? '',
    semesterId: semesterId ?? '',
    classId: schoolClass?.id ?? '',
    status: 'active',
  };
};

export default function Timetables() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [selectedTimetableForForm, setSelectedTimetableForForm] = useState<Timetable | null>(null);
  const [isTimetableFormOpen, setIsTimetableFormOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Timetable | null>(null);
  const [duplicateTargetSemesterId, setDuplicateTargetSemesterId] = useState('');
  const [timetableToDelete, setTimetableToDelete] = useState<Timetable | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [entryMode, setEntryMode] = useState<'create' | 'edit' | 'view'>('create');
  const [entryDay, setEntryDay] = useState('');
  const [entryTimeSlot, setEntryTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [isTimetablePlannerOpen, setIsTimetablePlannerOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState<TimetableFormState>({
    academicYearId: '',
    semesterId: '',
    classId: '',
    status: 'active',
  });
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(CURRENT_ACADEMIC_SELECTION);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(CURRENT_ACADEMIC_SELECTION);

  const timetablesQuery = useQuery({
    queryKey: ['school-admin', 'timetables', selectedAcademicYearId, selectedSemesterId],
    queryFn: () =>
      academicApi.fetchTimetables({
        ...(selectedAcademicYearId === CURRENT_ACADEMIC_SELECTION ? {} : { academicYearId: selectedAcademicYearId }),
        ...(selectedSemesterId === CURRENT_ACADEMIC_SELECTION ? {} : { semesterId: selectedSemesterId }),
      }),
    retry: false,
  });

  const optionsQuery = useQuery({
    queryKey: ['school-admin', 'timetable-options'],
    queryFn: academicApi.fetchTimetableOptions,
    retry: false,
  });

  const roomsQuery = useQuery({
    queryKey: ['school-admin', 'infrastructure', 'rooms'],
    queryFn: () => infrastructureApi.fetchRooms(),
    retry: false,
  });

  const timetables = useMemo<TimetableRow[]>(
    () =>
      (timetablesQuery.data ?? []).map((timetable) => ({
        ...timetable,
        searchText: [
          timetable.class.name,
          timetable.class.level?.name,
          timetable.semester.name,
          timetable.semester.academicYearName,
          timetable.academicYear.name,
          timetable.status,
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [timetablesQuery.data],
  );

  const allTimetableEntries = useMemo(
    () => timetables.flatMap((timetable) => timetable.entries),
    [timetables],
  );

  const timetableOptions: TimetableOptions = optionsQuery.data ?? {
    currentAcademicYearId: null,
    currentSemesterId: null,
    academicYears: [],
    semesters: [],
    classes: [],
    subjects: [],
    teachers: [],
    timeSlots: [],
  };

  const currentAcademicYear = useMemo(
    () =>
      timetableOptions.academicYears.find(
        (year) => year.id === timetableOptions.currentAcademicYearId,
      ) ?? null,
    [timetableOptions.academicYears, timetableOptions.currentAcademicYearId],
  );

  const currentSemester = useMemo(
    () =>
      timetableOptions.semesters.find(
        (semester) => semester.id === timetableOptions.currentSemesterId,
      ) ?? null,
    [timetableOptions.currentSemesterId, timetableOptions.semesters],
  );

  const isLoading = timetablesQuery.isLoading || optionsQuery.isLoading;

  const selectedTimetable = useMemo(
    () => timetables.find((timetable) => timetable.id === selectedTimetableId) ?? null,
    [selectedTimetableId, timetables],
  );

  const resolvedAcademicYearId = resolveAcademicYearSelection(
    selectedAcademicYearId,
    timetableOptions.academicYears,
  );

  const availableSemesters = useMemo(
    () => timetableOptions.semesters.filter((semester) => semester.academicYearId === formData.academicYearId),
    [formData.academicYearId, timetableOptions.semesters],
  );

  const availableClasses = useMemo(
    () => timetableOptions.classes.filter((schoolClass) => schoolClass.academicYearId === resolvedAcademicYearId),
    [resolvedAcademicYearId, timetableOptions.classes],
  );

  const availableFormClasses = useMemo(
    () => timetableOptions.classes.filter((schoolClass) => schoolClass.academicYearId === formData.academicYearId),
    [formData.academicYearId, timetableOptions.classes],
  );

  const availableDuplicateSemesters = useMemo(
    () =>
      timetableOptions.semesters.filter(
        (semester) =>
          semester.academicYearId === resolvedAcademicYearId &&
          (duplicateSource ? semester.id !== duplicateSource.semesterId : true),
      ),
    [duplicateSource, resolvedAcademicYearId, timetableOptions.semesters],
  );

  useEffect(() => {
    if (timetables.length === 0) {
      setSelectedTimetableId('');
      return;
    }

    const exists = timetables.some((timetable) => timetable.id === selectedTimetableId);
    if (!exists) {
      setSelectedTimetableId(timetables[0].id);
    }
  }, [selectedTimetableId, timetables]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'timetable-options'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTimetablePayload) => academicApi.createTimetable(payload),
    onSuccess: (timetable) => {
      toast({
        title: 'Emploi du temps créé',
        description: 'Le tableau a été ajouté avec succès.',
      });
      invalidateAll();
      setIsTimetableFormOpen(false);
      setSelectedTimetableForForm(null);
      setFormData(createDefaultTimetableForm(timetableOptions));
      setSelectedTimetableId(timetable.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer l’emploi du temps.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimetablePayload }) =>
      academicApi.updateTimetable(id, payload),
    onSuccess: (timetable) => {
      toast({
        title: 'Emploi du temps mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAll();
      setIsTimetableFormOpen(false);
      setSelectedTimetableForForm(null);
      setFormData(createDefaultTimetableForm(timetableOptions));
      setSelectedTimetableId(timetable.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier l’emploi du temps.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteTimetable(id),
    onSuccess: () => {
      toast({
        title: 'Emploi du temps supprimé',
        description: 'Le tableau a bien été supprimé.',
      });
      invalidateAll();
      setTimetableToDelete(null);
      setIsTimetablePlannerOpen(false);
      setSelectedTimetableId('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer l’emploi du temps.'),
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DuplicateTimetablePayload }) =>
      academicApi.duplicateTimetable(id, payload),
    onSuccess: (timetable) => {
      toast({
        title: 'Emploi du temps dupliqué',
        description: 'Une copie a été créée pour le semestre choisi.',
      });
      invalidateAll();
      setIsDuplicateDialogOpen(false);
      setDuplicateSource(null);
      setDuplicateTargetSemesterId('');
      setSelectedTimetableId(timetable.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de duplication',
        description: getApiErrorMessage(error, 'Impossible de dupliquer l’emploi du temps.'),
      });
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TimeSlotFormData }) =>
      academicApi.createTimetableEntry(id, {
        day: payload.day,
        timeSlotId: payload.timeSlotId,
        subjectId: payload.subjectId,
        teacherId: payload.teacherId,
        classId: payload.classId,
        room: payload.room,
      }),
    onSuccess: () => {
      toast({
        title: 'Créneau ajouté',
        description: 'Le cours a été ajouté à l’emploi du temps.',
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Erreur d’ajout',
        description: getApiErrorMessage(error, 'Impossible d’ajouter le créneau.'),
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, entryId, payload }: { id: string; entryId: string; payload: TimeSlotFormData }) =>
      academicApi.updateTimetableEntry(id, entryId, {
        day: payload.day,
        timeSlotId: payload.timeSlotId,
        subjectId: payload.subjectId,
        teacherId: payload.teacherId,
        classId: payload.classId,
        room: payload.room,
      }),
    onSuccess: () => {
      toast({
        title: 'Créneau mis à jour',
        description: 'Le cours a été enregistré.',
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier le créneau.'),
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: ({ id, entryId }: { id: string; entryId: string }) => academicApi.deleteTimetableEntry(id, entryId),
    onSuccess: () => {
      toast({
        title: 'Créneau supprimé',
        description: 'Le cours a été retiré de l’emploi du temps.',
      });
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer le créneau.'),
      });
    },
  });

  const handleCreateDialogOpen = () => {
    setSelectedTimetableForForm(null);
    setFormData(createDefaultTimetableForm(timetableOptions));
    setIsTimetableFormOpen(true);
  };

  const handleEditDialogOpen = (timetable: Timetable) => {
    setSelectedTimetableForForm(timetable);
    setFormData({
      academicYearId: timetable.academicYearId,
      semesterId: timetable.semesterId,
      classId: timetable.classId,
      status: timetable.status,
    });
    setIsTimetableFormOpen(true);
  };

  const handleTimetableSubmit = () => {
    if (selectedTimetableForForm) {
      updateMutation.mutate({
        id: selectedTimetableForForm.id,
        payload: {
          academicYearId: formData.academicYearId,
          semesterId: formData.semesterId,
          classId: formData.classId,
          status: formData.status,
        },
      });
      return;
    }

    createMutation.mutate({
      classId: formData.classId,
      status: formData.status,
    });
  };

  const handleToggleStatus = (timetable: Timetable) => {
    const nextStatus: TimetableStatus = timetable.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate({
      id: timetable.id,
      payload: { status: nextStatus },
    });
  };

  const handleViewTimetable = (timetableId: string) => {
    setSelectedTimetableId(timetableId);
    setIsTimetablePlannerOpen(true);
  };

  const handlePlannerDialogChange = (open: boolean) => {
    setIsTimetablePlannerOpen(open);
    if (!open) {
      setIsEntryModalOpen(false);
      setSelectedEntry(null);
      setEntryDay('');
      setEntryTimeSlot(undefined);
      setEntryMode('create');
    }
  };

  const handleOpenDuplicateDialog = (timetable: Timetable) => {
    setDuplicateSource(timetable);
    const firstTarget = availableDuplicateSemesters.find((semester) => semester.id !== timetable.semesterId);
    setDuplicateTargetSemesterId(firstTarget?.id ?? '');
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateSubmit = () => {
    if (!duplicateSource || !duplicateTargetSemesterId) {
      return;
    }

    duplicateMutation.mutate({
      id: duplicateSource.id,
      payload: { targetSemesterId: duplicateTargetSemesterId },
    });
  };

  const handleEntryModalChange = (open: boolean) => {
    setIsEntryModalOpen(open);
    if (!open) {
      setSelectedEntry(null);
      setEntryDay('');
      setEntryTimeSlot(undefined);
      setEntryMode('create');
    }
  };

  const handleSaveEntry = (data: TimeSlotFormData) => {
    if (!selectedTimetable) {
      return;
    }

    const payload = {
      ...data,
      classId: data.classId || selectedTimetable.classId,
      room: data.room?.trim() || null,
    };

    if (entryMode === 'edit' && selectedEntry) {
      updateEntryMutation.mutate({
        id: selectedTimetable.id,
        entryId: selectedEntry.id,
        payload,
      });
      return;
    }

    createEntryMutation.mutate({
      id: selectedTimetable.id,
      payload,
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedTimetable) {
      return;
    }

    deleteEntryMutation.mutate({
      id: selectedTimetable.id,
      entryId,
    });
  };

  const handleAddEntry = (day: string, timeSlot: TimeSlot) => {
    setSelectedEntry(null);
    setEntryMode('create');
    setEntryDay(day);
    setEntryTimeSlot(timeSlot);
    setIsEntryModalOpen(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setEntryMode('edit');
    setIsEntryModalOpen(true);
  };

  const handleViewEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setEntryMode('view');
    setIsEntryModalOpen(true);
  };

  const columns: Column<TimetableRow>[] = [
    {
      key: 'classId',
      label: 'Classe',
      sortable: true,
      render: (timetable) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{timetable.class.name}</p>
            <p className="text-xs text-muted-foreground">{timetable.class.level?.name || 'Sans niveau'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'semesterId',
      label: 'Semestre',
      sortable: true,
      render: (timetable) => (
        <div>
          <p className="font-medium">{timetable.semester.name}</p>
          <p className="text-xs text-muted-foreground">{timetable.semester.academicYearName}</p>
        </div>
      ),
    },
    {
      key: 'entries',
      label: 'Créneaux',
      sortable: true,
      render: (timetable) => (
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {timetable.entries.length}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (timetable) => (
        <Badge
          variant={
            timetable.status === 'active'
              ? 'secondary'
              : timetable.status === 'draft'
                ? 'outline'
                : 'secondary'
          }
        >
          {timetableStatusLabels[timetable.status]}
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
        { value: 'draft', label: 'Brouillon' },
      ],
    },
    {
      key: 'classId',
      label: 'Classe',
      options: availableClasses.map((schoolClass: SchoolClass) => ({ value: schoolClass.id, label: schoolClass.name })),
    },
  ];

  const gridItem = (timetable: TimetableRow) => {
    const isSelected = timetable.id === selectedTimetableId;
    const summaryTiles = [
      {
        label: 'Année',
        value: timetable.academicYear.name,
        detail: timetable.semester.academicYearName,
        icon: Calendar,
      },
      {
        label: 'Semestre',
        value: timetable.semester.name,
        detail: timetable.class.level?.name || 'Sans niveau',
        icon: Layers3,
      },
      {
        label: 'Créneaux',
        value: `${timetable.entries.length}`,
        detail: 'cours planifiés',
        icon: BookOpen,
        emphasize: true,
      },
    ];

    return (
      <div
        className={cn(
          'group relative h-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-background via-card to-primary/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
          isSelected && 'ring-2 ring-primary/60 ring-offset-2',
        )}
        onClick={() => setSelectedTimetableId(timetable.id)}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:bg-primary/15" />

        <div className="relative flex h-full flex-col gap-4">
          <div className="rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-lg shadow-primary/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <School className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Emploi du temps
                  </p>
                  <h3 className="truncate text-lg font-semibold">{timetable.class.name}</h3>
                  <p className="text-sm text-white/75">{timetable.class.level?.name || 'Sans niveau'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium shadow-sm',
                    getTimetableStatusBadgeClasses(timetable.status),
                  )}
                >
                  {timetableStatusLabels[timetable.status]}
                </Badge>
                {isSelected && (
                  <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
                    Sélectionné
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {summaryTiles.map(({ label, value, detail, icon: Icon, emphasize }) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 shadow-sm backdrop-blur',
                  emphasize && 'border-primary/20 bg-primary/5',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
                    emphasize && 'bg-primary text-primary-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </div>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold text-foreground',
                      emphasize && 'text-lg text-primary',
                    )}
                  >
                    {value}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Users className="h-3 w-3" />
              {timetable.class.level?.name || 'Sans niveau'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {timetable.academicYear.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-wrap">
            <Button
              variant="default"
              size="sm"
              className="w-full gap-1.5 shadow-sm sm:w-auto"
              onClick={(event) => {
                event.stopPropagation();
                handleViewTimetable(timetable.id);
              }}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Voir
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 sm:w-auto"
              onClick={(event) => {
                event.stopPropagation();
                handleEditDialogOpen(timetable);
              }}
            >
              <Edit className="h-3 w-3" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 sm:w-auto"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDuplicateDialog(timetable);
              }}
            >
              <Copy className="h-3 w-3" />
              Dupliquer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive sm:w-auto"
              onClick={(event) => {
                event.stopPropagation();
                setTimetableToDelete(timetable);
              }}
            >
              <Trash2 className="h-3 w-3" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emplois du temps</h1>
          <p className="text-muted-foreground">Chargement des emplois du temps...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des tableaux, classes et créneaux...
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalEntries = timetables.reduce((sum, timetable) => sum + timetable.entries.length, 0);
  const activeTimetables = timetables.filter((timetable) => timetable.status === 'active').length;
  const coveredClasses = new Set(timetables.map((timetable) => timetable.classId).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emplois du temps</h1>
          <p className="text-muted-foreground">
            Gérez les tableaux en partant de l’année active et du semestre en cours, avec filtrage possible.
          </p>
        </div>
        <Dialog open={isTimetableFormOpen} onOpenChange={setIsTimetableFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleCreateDialogOpen}>
              <Plus className="h-4 w-4" />
              Nouvel emploi du temps
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{selectedTimetableForForm ? 'Modifier l’emploi du temps' : 'Créer un emploi du temps'}</DialogTitle>
              <DialogDescription>
                {selectedTimetableForForm
                  ? 'Choisissez l’année, le semestre et la classe à planifier.'
                  : 'Le semestre en cours et la classe de l’année active seront appliqués automatiquement.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedTimetableForForm ? (
                <div className="space-y-2">
                  <Label htmlFor="academicYearId">Année scolaire</Label>
                  <Select
                    value={formData.academicYearId}
                    onValueChange={(value) => {
                      const matchingSemesterId = resolveSemesterSelection(
                        CURRENT_ACADEMIC_SELECTION,
                        value,
                        timetableOptions.semesters,
                      );
                      const matchingClass = timetableOptions.classes.find(
                        (schoolClass) => schoolClass.academicYearId === value,
                      );
                      setFormData((current) => ({
                        ...current,
                        academicYearId: value,
                        semesterId: matchingSemesterId,
                        classId: matchingClass?.id ?? '',
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {timetableOptions.academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Création automatique</p>
                  <p>L’année active est appliquée automatiquement à la création.</p>
                  <p>
                    Semestre appliqué :{' '}
                    <span className="font-medium text-foreground">
                      {currentSemester ? `${currentSemester.name} - ${currentSemester.academicYear}` : 'Semestre en cours'}
                    </span>
                  </p>
                  <p>
                    Année utilisée :{' '}
                    <span className="font-medium text-foreground">
                      {currentAcademicYear?.name ?? 'Année active'}
                    </span>
                  </p>
                </div>
              )}
              {selectedTimetableForForm && (
                <div className="space-y-2">
                  <Label htmlFor="semesterId">Semestre</Label>
                  <Select
                    value={formData.semesterId}
                    onValueChange={(value) => {
                      const selectedSemester = timetableOptions.semesters.find((semester) => semester.id === value);
                      const matchingClass = selectedSemester
                        ? timetableOptions.classes.find(
                            (schoolClass) => schoolClass.academicYearId === selectedSemester.academicYearId,
                          )
                        : undefined;
                      setFormData((current) => ({
                        ...current,
                        semesterId: value,
                        academicYearId: selectedSemester?.academicYearId ?? current.academicYearId,
                        classId: matchingClass?.id ?? '',
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name} - {semester.academicYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                    {availableFormClasses.map((schoolClass) => (
                      <SelectItem key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name} - {schoolClass.level?.name || 'Sans niveau'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value as TimetableStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTimetableFormOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleTimetableSubmit}
                disabled={
                  selectedTimetableForForm
                    ? !formData.academicYearId || !formData.semesterId || !formData.classId
                    : !formData.classId
                }
              >
                {selectedTimetableForForm ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Année scolaire</p>
            <p className="text-xs text-muted-foreground">Les emplois du temps suivent l’année active par défaut.</p>
          </div>
          <Select
            value={selectedAcademicYearId}
            onValueChange={(value) => {
              setSelectedAcademicYearId(value);
              setSelectedSemesterId(CURRENT_ACADEMIC_SELECTION);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Année active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENT_ACADEMIC_SELECTION}>Année active</SelectItem>
              {timetableOptions.academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Semestre</p>
            <p className="text-xs text-muted-foreground">Par défaut, on suit le semestre en cours de l’année choisie.</p>
          </div>
          <Select
            value={selectedSemesterId}
            onValueChange={(value) => {
              const selectedSemester = timetableOptions.semesters.find((semester) => semester.id === value);
              if (selectedSemester) {
                setSelectedAcademicYearId(selectedSemester.academicYearId);
              }
              setSelectedSemesterId(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semestre en cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENT_ACADEMIC_SELECTION}>Semestre en cours</SelectItem>
              {timetableOptions.semesters
                .filter((semester) => semester.academicYearId === resolvedAcademicYearId)
                .map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name} - {semester.academicYear}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tableaux</p>
            <p className="text-2xl font-bold">{timetables.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeTimetables}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Créneaux</p>
            <p className="text-2xl font-bold">{totalEntries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Classes couvertes</p>
            <p className="text-2xl font-bold">{coveredClasses}</p>
          </CardContent>
        </Card>
      </div>

      <DataList
        data={timetables}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un emploi du temps..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun emploi du temps trouvé"
        itemsPerPage={4}
      />

      <Dialog open={isTimetablePlannerOpen} onOpenChange={handlePlannerDialogChange}>
        <DialogContent className="w-[95vw] sm:max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between flex-shrink-0">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedTimetable ? selectedTimetable.class.name : 'Planification de l’emploi du temps'}
              </DialogTitle>
              <DialogDescription>
                {selectedTimetable
                  ? `${selectedTimetable.semester.name} - ${selectedTimetable.semester.academicYearName}. Ajoutez, modifiez ou consultez les cours directement depuis cette fenêtre.`
                  : 'Sélectionnez un emploi du temps pour commencer la planification.'}
              </DialogDescription>
            </div>
            {selectedTimetable && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditDialogOpen(selectedTimetable)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDuplicateDialog(selectedTimetable)}>
                  <Copy className="mr-1 h-3 w-3" />
                  Dupliquer
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedTimetable)}>
                  {selectedTimetable.status === 'active' ? (
                    <>
                      <ToggleLeft className="mr-1 h-3 w-3" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <ToggleRight className="mr-1 h-3 w-3" />
                      Activer
                    </>
                  )}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setTimetableToDelete(selectedTimetable)}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Supprimer
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="overflow-y-auto scrollbar-hide flex-1 pr-2" style={{ scrollbarWidth: 'none' }}>
            {selectedTimetable ? (
              <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Créneaux</p>
                    <p className="text-2xl font-bold">{selectedTimetable.entries.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Jours actifs</p>
                    <p className="text-2xl font-bold">{new Set(selectedTimetable.entries.map((entry) => entry.day)).size}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Classe</p>
                    <p className="text-2xl font-bold">{selectedTimetable.class.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTimetable.class.level?.name || 'Sans niveau'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="text-2xl font-bold">{timetableStatusLabels[selectedTimetable.status]}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-2xl border bg-card p-3">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">Planifier les cours</p>
                    <p className="text-xs text-muted-foreground">
                      Cliquez sur une case vide pour créer un cours, ou sur un cours existant pour le consulter ou le modifier.
                    </p>
                  </div>
                </div>
                <TimetableGrid
                  entries={selectedTimetable.entries}
                  timeSlots={timetableOptions.timeSlots}
                  showClass={false}
                  showTeacher={true}
                  editable
                  onEntryClick={handleViewEntry}
                  onEditEntry={handleEditEntry}
                  onAddEntry={handleAddEntry}
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                Sélectionnez un emploi du temps pour commencer.
              </CardContent>
            </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Dupliquer l’emploi du temps</DialogTitle>
            <DialogDescription>
              Choisissez le semestre cible pour {duplicateSource?.class.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicateTargetSemesterId">Semestre cible</Label>
              <Select
                value={duplicateTargetSemesterId}
                onValueChange={(value) => setDuplicateTargetSemesterId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {availableDuplicateSemesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name} - {semester.academicYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleDuplicateSubmit} disabled={!duplicateTargetSemesterId || !duplicateSource}>
              Dupliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TimeSlotModal
        open={isEntryModalOpen}
        onOpenChange={handleEntryModalChange}
        entry={selectedEntry}
        day={entryDay}
        timeSlot={entryTimeSlot}
        classId={selectedTimetable?.classId}
        mode={entryMode}
        classes={timetableOptions.classes}
        subjects={timetableOptions.subjects}
        teachers={timetableOptions.teachers}
        timeSlots={timetableOptions.timeSlots}
        existingEntries={allTimetableEntries}
        rooms={roomsQuery.data ?? []}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />

      <AlertDialog open={Boolean(timetableToDelete)} onOpenChange={(open) => !open && setTimetableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’emploi du temps</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le tableau de {timetableToDelete?.class.name} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => timetableToDelete && deleteMutation.mutate(timetableToDelete.id)}
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
