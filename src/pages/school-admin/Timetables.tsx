import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateSelectArg, type EventClickArg, type EventDropArg, type EventResizeDoneArg } from '@fullcalendar/interaction';
import { type EventContentArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  academicApi,
  type CreateAnnualTimetablePayload,
  type CreateAnnualTimetableEntryPayload,
  type TimetableStatus,
  type UpdateAnnualTimetableEntryPayload,
  type UpdateAnnualTimetablePayload,
} from '@/services/academic';
import {
  CURRENT_ACADEMIC_SELECTION,
  resolveAcademicYearSelection,
} from '@/lib/academic-scope';
import { getApiErrorMessage } from '@/lib/api-errors';
import type {
  AnnualTimetable,
  AnnualTimetableEntry,
  AnnualTimetableOptions,
  SchoolClass,
} from '@/types/academic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { DataList, type Column } from '@/components/ui/data-list';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const WEEKDAY_OPTIONS = [
  { value: 'Lundi', label: 'Lundi', fc: 1 },
  { value: 'Mardi', label: 'Mardi', fc: 2 },
  { value: 'Mercredi', label: 'Mercredi', fc: 3 },
  { value: 'Jeudi', label: 'Jeudi', fc: 4 },
  { value: 'Vendredi', label: 'Vendredi', fc: 5 },
  { value: 'Samedi', label: 'Samedi', fc: 6 },
  { value: 'Dimanche', label: 'Dimanche', fc: 0 },
] as const;

const SUBJECT_COLORS = [
  '#1F2937',
  '#0F766E',
  '#1D4ED8',
  '#B45309',
  '#7C3AED',
  '#BE123C',
  '#0F172A',
  '#15803D',
  '#EA580C',
  '#334155',
];

const timetableStatusLabels: Record<TimetableStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  draft: 'Brouillon',
};

const getSubjectColor = (subjectId: string) => {
  let hash = 0;
  for (let index = 0; index < subjectId.length; index += 1) {
    hash = subjectId.charCodeAt(index) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const formatTime = (value: Date) => format(value, 'HH:mm');

const toCalendarDay = (dayOfWeek: string) =>
  WEEKDAY_OPTIONS.find((option) => option.value.toLowerCase() === dayOfWeek.toLowerCase())?.fc ?? 1;

const toWeekDay = (date: Date) =>
  WEEKDAY_OPTIONS.find((option) => option.fc === date.getDay())?.value ?? 'Lundi';

type AnnualTimetableFormState = {
  academicYearId: string;
  classId: string;
  status: TimetableStatus;
};

type AnnualEntryFormState = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  buildingId: string;
  roomId: string | null;
  semesterId: string;
};

type TimetableRow = AnnualTimetable & { searchText: string };

const createDefaultTimetableForm = (
  options: AnnualTimetableOptions,
  academicYearSelection: string,
): AnnualTimetableFormState => {
  const academicYearId =
    academicYearSelection === CURRENT_ACADEMIC_SELECTION
      ? resolveAcademicYearSelection(CURRENT_ACADEMIC_SELECTION, options.academicYears)
      : academicYearSelection;

  const schoolClass = options.classes.find((item) => item.academicYearId === academicYearId);

  return {
    academicYearId: academicYearId ?? '',
    classId: schoolClass?.id ?? '',
    status: 'active',
  };
};

  const createDefaultEntryForm = (
    options: AnnualTimetableOptions,
    timetable: AnnualTimetable | null,
    seedDate?: Date,
  ): AnnualEntryFormState => {
    const dayOfWeek = seedDate ? toWeekDay(seedDate) : 'Lundi';
    const semesterPool = timetable
      ? options.semesters.filter((semester) => semester.academicYearId === timetable.academicYearId)
      : options.semesters;
    const fallbackSemesterId =
      (options.currentSemesterId && semesterPool.some((semester) => semester.id === options.currentSemesterId)
        ? options.currentSemesterId
        : semesterPool[0]?.id) ?? '';
    const firstRoom = options.rooms[0];

    return {
      dayOfWeek,
      startTime: seedDate ? formatTime(seedDate) : '08:00',
      endTime: seedDate ? formatTime(new Date(seedDate.getTime() + 60 * 60 * 1000)) : '10:00',
      subjectId: options.subjects[0]?.id ?? '',
      teacherId: options.teachers[0]?.id ?? '',
      buildingId: firstRoom?.buildingId ?? '',
      roomId: firstRoom?.id ?? null,
      semesterId: fallbackSemesterId,
    };
  };

export default function Timetables() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(CURRENT_ACADEMIC_SELECTION);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(CURRENT_ACADEMIC_SELECTION);
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'create' | 'edit'>('create');
  const [entryToDelete, setEntryToDelete] = useState<AnnualTimetableEntry | null>(null);
  const [entryDayLocked, setEntryDayLocked] = useState(false);
  const [timetableForm, setTimetableForm] = useState<AnnualTimetableFormState>({
    academicYearId: '',
    classId: '',
    status: 'active',
  });
  const [entryForm, setEntryForm] = useState<AnnualEntryFormState>({
    dayOfWeek: 'Lundi',
    startTime: '08:00',
    endTime: '10:00',
    subjectId: '',
    teacherId: '',
    buildingId: '',
    roomId: null,
    semesterId: '',
  });
  const [editingEntry, setEditingEntry] = useState<AnnualTimetableEntry | null>(null);

  const optionsQuery = useQuery({
    queryKey: ['school-admin', 'annual-timetable-options'],
    queryFn: academicApi.fetchAnnualTimetableOptions,
    retry: false,
  });

  const resolvedAcademicYearId = resolveAcademicYearSelection(
    selectedAcademicYearId,
    optionsQuery.data?.academicYears ?? [],
  );

  const timetablesQuery = useQuery({
    queryKey: ['school-admin', 'annual-timetables', resolvedAcademicYearId],
    queryFn: () =>
      academicApi.fetchAnnualTimetables(
        resolvedAcademicYearId && resolvedAcademicYearId !== CURRENT_ACADEMIC_SELECTION
          ? { academicYearId: resolvedAcademicYearId }
          : undefined,
      ),
    retry: false,
  });

  const options: AnnualTimetableOptions = optionsQuery.data ?? {
    currentAcademicYearId: null,
    currentSemesterId: null,
    academicYears: [],
    semesters: [],
    classes: [],
    subjects: [],
    teachers: [],
    rooms: [],
  };

  const timetables = timetablesQuery.data ?? [];

  const availableClasses = useMemo(
    () => options.classes.filter((schoolClass) => schoolClass.academicYearId === resolvedAcademicYearId),
    [options.classes, resolvedAcademicYearId],
  );

  const classesByLevel = useMemo(() => {
    return availableClasses.reduce<Record<string, SchoolClass[]>>((acc, schoolClass) => {
      const key = schoolClass.level?.name || 'Sans niveau';
      acc[key] = acc[key] ?? [];
      acc[key].push(schoolClass);
      return acc;
    }, {});
  }, [availableClasses]);

  const availableSemesters = useMemo(
    () => options.semesters.filter((semester) => semester.academicYearId === resolvedAcademicYearId),
    [options.semesters, resolvedAcademicYearId],
  );

  const buildingOptions = useMemo(() => {
    const map = new Map<string, string>();
    options.rooms.forEach((room) => {
      if (room.buildingId && room.buildingName) {
        map.set(room.buildingId, room.buildingName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [options.rooms]);

  useEffect(() => {
    if (!selectedClassId && availableClasses.length > 0) {
      setSelectedClassId(availableClasses[0].id);
    }
  }, [availableClasses, selectedClassId]);

  const filteredTimetables = useMemo<TimetableRow[]>(
    () =>
      timetables
        .filter((timetable) => (selectedClassId ? timetable.classId === selectedClassId : true))
        .map((timetable) => ({
          ...timetable,
          searchText: [
            timetable.class.name,
            timetable.class.level?.name,
            timetable.academicYear.name,
            timetable.status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        })),
    [timetables, selectedClassId],
  );

  const selectedTimetable = useMemo(
    () =>
      filteredTimetables.find((timetable) => timetable.id === selectedTimetableId) ??
      filteredTimetables[0] ??
      null,
    [filteredTimetables, selectedTimetableId],
  );

  useEffect(() => {
    if (selectedTimetable && selectedTimetable.id !== selectedTimetableId) {
      setSelectedTimetableId(selectedTimetable.id);
    }
    if (!selectedTimetable) {
      setSelectedTimetableId('');
    }
  }, [selectedTimetable, selectedTimetableId]);

  const timetableColumns: Column<TimetableRow>[] = [
    {
      key: 'classId',
      label: 'Classe',
      render: (timetable) => (
        <div>
          <p className="font-medium">{timetable.class.name}</p>
          <p className="text-xs text-muted-foreground">{timetable.class.level?.name || 'Sans niveau'}</p>
        </div>
      ),
    },
    {
      key: 'academicYearId',
      label: 'Année',
      render: (timetable) => timetable.academicYear.name,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (timetable) => <Badge variant="secondary">{timetableStatusLabels[timetable.status]}</Badge>,
    },
    {
      key: 'entries',
      label: 'Cours',
      render: (timetable) => `${timetable.entries.length}`,
    },
  ];

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'annual-timetables'] });
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'annual-timetable-options'] });
  };

  const updateTimetableEntriesCache = (timetableId: string, updater: (entries: AnnualTimetableEntry[]) => AnnualTimetableEntry[]) => {
    queryClient.setQueryData<AnnualTimetable[] | undefined>(
      ['school-admin', 'annual-timetables', resolvedAcademicYearId],
      (current) => {
        if (!current) return current;
        return current.map((timetable) =>
          timetable.id === timetableId ? { ...timetable, entries: updater(timetable.entries) } : timetable,
        );
      },
    );
  };

  const createTimetableMutation = useMutation({
    mutationFn: (payload: CreateAnnualTimetablePayload) => academicApi.createAnnualTimetable(payload),
    onSuccess: (timetable) => {
      toast({
        title: 'Emploi du temps annuel créé',
        description: 'Le planning annuel a été ajouté.',
      });
      invalidateAll();
      setIsTimetableDialogOpen(false);
      setSelectedClassId(timetable.classId);
      setSelectedTimetableId(timetable.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de création',
        description: getApiErrorMessage(error, 'Impossible de créer l’emploi du temps annuel.'),
      });
    },
  });

  const updateTimetableMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAnnualTimetablePayload }) =>
      academicApi.updateAnnualTimetable(id, payload),
    onSuccess: (timetable) => {
      toast({
        title: 'Emploi du temps annuel mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      invalidateAll();
      setIsTimetableDialogOpen(false);
      setSelectedClassId(timetable.classId);
      setSelectedTimetableId(timetable.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de mise à jour',
        description: getApiErrorMessage(error, 'Impossible de modifier l’emploi du temps annuel.'),
      });
    },
  });

  const deleteTimetableMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteAnnualTimetable(id),
    onSuccess: () => {
      toast({
        title: 'Emploi du temps annuel supprimé',
        description: 'Le planning a été supprimé.',
      });
      invalidateAll();
      setSelectedTimetableId('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer cet emploi du temps annuel.'),
      });
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAnnualTimetableEntryPayload }) =>
      academicApi.createAnnualTimetableEntry(id, payload),
    onSuccess: (entry, variables) => {
      toast({
        title: 'Cours ajouté',
        description: 'Le cours annuel a été planifié.',
      });
      updateTimetableEntriesCache(variables.id, (entries) => [entry, ...entries]);
      invalidateAll();
      setIsEntryDialogOpen(false);
      setEditingEntry(null);
      setIsCalendarOpen(true);
    },
    onError: (error) => {
      toast({
        title: 'Conflit détecté',
        description: getApiErrorMessage(error, 'Impossible d’ajouter ce cours.'),
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, entryId, payload }: { id: string; entryId: string; payload: UpdateAnnualTimetableEntryPayload }) =>
      academicApi.updateAnnualTimetableEntry(id, entryId, payload),
    onSuccess: (entry, variables) => {
      toast({
        title: 'Cours mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      updateTimetableEntriesCache(variables.id, (entries) =>
        entries.map((item) => (item.id === entry.id ? entry : item)),
      );
      invalidateAll();
      setIsEntryDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: 'Conflit détecté',
        description: getApiErrorMessage(error, 'Impossible de modifier ce cours.'),
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: ({ id, entryId }: { id: string; entryId: string }) =>
      academicApi.deleteAnnualTimetableEntry(id, entryId),
    onSuccess: (result, variables) => {
      toast({
        title: 'Cours supprimé',
        description: 'Le cours a été retiré du planning.',
      });
      updateTimetableEntriesCache(variables.id, (entries) =>
        entries.filter((item) => item.id !== variables.entryId),
      );
      invalidateAll();
      setEntryToDelete(null);
      setIsEntryDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur de suppression',
        description: getApiErrorMessage(error, 'Impossible de supprimer ce cours.'),
      });
    },
  });

  const handleOpenTimetableDialog = (timetable?: AnnualTimetable) => {
    const form = createDefaultTimetableForm(options, resolvedAcademicYearId);
    if (timetable) {
      setTimetableForm({
        academicYearId: timetable.academicYearId,
        classId: timetable.classId,
        status: timetable.status,
      });
    } else {
      setTimetableForm(form);
    }
    setIsTimetableDialogOpen(true);
  };

  const handleTimetableSubmit = () => {
    if (!timetableForm.classId) {
      return;
    }

    if (selectedTimetable && selectedTimetable.classId === timetableForm.classId) {
      updateTimetableMutation.mutate({
        id: selectedTimetable.id,
        payload: {
          status: timetableForm.status,
        },
      });
      return;
    }

    createTimetableMutation.mutate({
      academicYearId: resolvedAcademicYearId,
      classId: timetableForm.classId,
      status: timetableForm.status,
    });
  };

  const handleOpenEntryDialog = (seed?: Date) => {
    setEntryMode('create');
    setEditingEntry(null);
    setEntryForm(createDefaultEntryForm(options, selectedTimetable, seed));
    setEntryDayLocked(Boolean(seed));
    setIsEntryDialogOpen(true);
    setIsCalendarOpen(true);
  };

  const handleOpenCalendar = (timetableId: string) => {
    setSelectedTimetableId(timetableId);
    setIsCalendarOpen(true);
  };

  const handleEditEntry = (entry: AnnualTimetableEntry) => {
    setEntryMode('edit');
    setEditingEntry(entry);
    setEntryDayLocked(false);
    const roomBuildingId =
      entry.room?.buildingId ?? options.rooms.find((room) => room.id === entry.roomId)?.buildingId ?? '';
    const fallbackSemesterId = options.currentSemesterId ?? options.semesters[0]?.id ?? '';
    setEntryForm({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      buildingId: roomBuildingId,
      roomId: entry.roomId,
      semesterId: entry.semesterId ?? fallbackSemesterId,
    });
    setIsEntryDialogOpen(true);
    setIsCalendarOpen(true);
  };

  const handleEntrySubmit = () => {
    if (!selectedTimetable) {
      return;
    }

    const resolvedSemesterId =
      options.currentSemesterId ??
      availableSemesters.find((semester) => semester.academicYearId === selectedTimetable.academicYearId)?.id ??
      entryForm.semesterId;

    const payload = {
      classId: selectedTimetable.classId,
      dayOfWeek: entryForm.dayOfWeek,
      startTime: entryForm.startTime,
      endTime: entryForm.endTime,
      dateStart:
        availableSemesters.find((semester) => semester.id === resolvedSemesterId)?.startDate ??
        selectedAcademicYear?.startDate ??
        format(new Date(), 'yyyy-MM-dd'),
      dateEnd:
        availableSemesters.find((semester) => semester.id === resolvedSemesterId)?.endDate ??
        selectedAcademicYear?.endDate ??
        format(new Date(), 'yyyy-MM-dd'),
      subjectId: entryForm.subjectId,
      teacherId: entryForm.teacherId,
      roomId: entryForm.roomId || undefined,
      semesterId: resolvedSemesterId,
    } satisfies CreateAnnualTimetableEntryPayload;

    if (entryMode === 'edit' && editingEntry) {
      updateEntryMutation.mutate({
        id: selectedTimetable.id,
        entryId: editingEntry.id,
        payload,
      });
      return;
    }

    createEntryMutation.mutate({
      id: selectedTimetable.id,
      payload,
    });
  };

  const renderEventContent = (content: EventContentArg) => {
    const entry = content.event.extendedProps.entry as AnnualTimetableEntry;
    return (
      <div className="flex flex-col gap-0.5 text-[11px] leading-tight">
        <span className="font-semibold">{entry.subject.name}</span>
        <span className="text-[10px] text-white/90">
          {(entry.teacher?.firstName || entry.teacher?.name)
            ? `${entry.teacher?.firstName ?? ''} ${entry.teacher?.name ?? ''}`.trim()
            : 'Enseignant'}
          {entry.room?.buildingName ? ` · ${entry.room.buildingName}` : ''}
          {entry.room?.name ? ` · ${entry.room.name}` : ''}
        </span>
      </div>
    );
  };

  const handleEventDrop = (info: EventDropArg) => {
    const entry = info.event.extendedProps.entry as AnnualTimetableEntry;
    const start = info.event.start;
    const end = info.event.end;
    if (!start || !end || !selectedTimetable) {
      info.revert();
      return;
    }

    updateEntryMutation.mutate(
      {
        id: selectedTimetable.id,
        entryId: entry.id,
        payload: {
          classId: entry.classId,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          roomId: entry.roomId ?? undefined,
          semesterId: entry.semesterId ?? undefined,
          dayOfWeek: toWeekDay(start),
          startTime: formatTime(start),
          endTime: formatTime(end),
          dateStart:
            availableSemesters.find((semester) => semester.id === entry.semesterId)?.startDate ??
            selectedAcademicYear?.startDate ??
            format(new Date(), 'yyyy-MM-dd'),
          dateEnd:
            availableSemesters.find((semester) => semester.id === entry.semesterId)?.endDate ??
            selectedAcademicYear?.endDate ??
            format(new Date(), 'yyyy-MM-dd'),
        },
      },
      {
        onError: () => {
          info.revert();
        },
      },
    );
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    const entry = info.event.extendedProps.entry as AnnualTimetableEntry;
    const start = info.event.start;
    const end = info.event.end;
    if (!start || !end || !selectedTimetable) {
      info.revert();
      return;
    }

    updateEntryMutation.mutate(
      {
        id: selectedTimetable.id,
        entryId: entry.id,
        payload: {
          classId: entry.classId,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          roomId: entry.roomId ?? undefined,
          semesterId: entry.semesterId ?? undefined,
          dayOfWeek: toWeekDay(start),
          startTime: formatTime(start),
          endTime: formatTime(end),
          dateStart:
            availableSemesters.find((semester) => semester.id === entry.semesterId)?.startDate ??
            selectedAcademicYear?.startDate ??
            format(new Date(), 'yyyy-MM-dd'),
          dateEnd:
            availableSemesters.find((semester) => semester.id === entry.semesterId)?.endDate ??
            selectedAcademicYear?.endDate ??
            format(new Date(), 'yyyy-MM-dd'),
        },
      },
      {
        onError: () => {
          info.revert();
        },
      },
    );
  };

  const handleEventClick = (info: EventClickArg) => {
    const entry = info.event.extendedProps.entry as AnnualTimetableEntry;
    handleEditEntry(entry);
  };

  const handleSelect = (selection: DateSelectArg) => {
    if (!selectedTimetable) {
      return;
    }
    handleOpenEntryDialog(selection.start);
  };

  const filteredEntries = useMemo(() => {
    if (!selectedTimetable) {
      return [];
    }

    const resolvedSemesterFilterId =
      selectedSemesterId === CURRENT_ACADEMIC_SELECTION
        ? options.currentSemesterId ?? ''
        : selectedSemesterId;

    return selectedTimetable.entries.filter((entry) => {
      if (selectedRoomId !== 'all' && entry.roomId !== selectedRoomId) {
        return false;
      }
      if (resolvedSemesterFilterId && entry.semesterId !== resolvedSemesterFilterId) {
        return false;
      }
      return true;
    });
  }, [options.currentSemesterId, selectedRoomId, selectedSemesterId, selectedTimetable]);

  const events = useMemo(
    () =>
      filteredEntries.map((entry) => ({
        id: entry.id,
        title: entry.subject.name,
        daysOfWeek: [toCalendarDay(entry.dayOfWeek)],
        startTime: entry.startTime,
        endTime: entry.endTime,
        startRecur: entry.dateStart,
        endRecur: entry.dateEnd,
        backgroundColor: getSubjectColor(entry.subjectId),
        borderColor: getSubjectColor(entry.subjectId),
        textColor: '#ffffff',
        extendedProps: { entry },
      })),
    [filteredEntries],
  );

  const calendarKey = useMemo(
    () =>
      [
        selectedTimetable?.id ?? 'none',
        filteredEntries.length,
        selectedSemesterId,
        selectedRoomId,
      ].join('-'),
    [filteredEntries.length, selectedRoomId, selectedSemesterId, selectedTimetable?.id],
  );

  const selectedAcademicYear = useMemo(
    () =>
      options.academicYears.find((year) => year.id === selectedTimetable?.academicYearId) ??
      options.academicYears.find((year) => year.id === resolvedAcademicYearId) ??
      null,
    [options.academicYears, resolvedAcademicYearId, selectedTimetable?.academicYearId],
  );

  const isLoading = optionsQuery.isLoading || timetablesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emplois du temps annuels</h1>
          <p className="text-muted-foreground">Chargement des données de planification...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des emplois du temps annuels...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emplois du temps annuels</h1>
          <p className="text-muted-foreground">
            Chaque classe dispose d’un planning annuel basé sur des cours récurrents, sans duplication hebdomadaire.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={() => handleOpenTimetableDialog()}>
            <Plus className="h-4 w-4" />
            Créer planning
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Année scolaire</Label>
          <Select
            value={selectedAcademicYearId}
            onValueChange={(value) => {
              setSelectedAcademicYearId(value);
              setSelectedClassId('');
              setSelectedTimetableId('');
              setSelectedSemesterId(CURRENT_ACADEMIC_SELECTION);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Année active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENT_ACADEMIC_SELECTION}>Année active</SelectItem>
              {options.academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Semestre</Label>
          <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semestre en cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENT_ACADEMIC_SELECTION}>Semestre en cours</SelectItem>
              {availableSemesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name} · {semester.academicYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((schoolClass: SchoolClass) => (
                <SelectItem key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} - {schoolClass.level?.name || 'Sans niveau'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Salle</Label>
          <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {options.rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} · {room.buildingName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataList
        data={filteredTimetables}
        columns={timetableColumns}
        searchKey="searchText"
        searchPlaceholder="Rechercher un planning..."
        defaultView="grid"
        gridItem={(timetable) => (
          <button
            type="button"
            onClick={() => handleOpenCalendar(timetable.id)}
            className={cn(
              'group flex h-full w-full flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md',
              timetable.id === selectedTimetableId && 'border-primary/60 ring-1 ring-primary/30',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Classe</p>
                <p className="text-lg font-semibold text-foreground">{timetable.class.name}</p>
                <p className="text-xs text-muted-foreground">{timetable.class.level?.name || 'Sans niveau'}</p>
              </div>
              <Badge variant="secondary">{timetableStatusLabels[timetable.status]}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {timetable.academicYear.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {timetable.entries.length} cours planifiés
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary">
              Voir le calendrier
            </span>
          </button>
        )}
        emptyMessage="Aucun emploi du temps annuel"
        itemsPerPage={6}
      />

      <Dialog
        open={isCalendarOpen}
        onOpenChange={(open) => {
          if (!open && isEntryDialogOpen) {
            return;
          }
          setIsCalendarOpen(open);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[1200px] max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedTimetable ? selectedTimetable.class.name : 'Calendrier'}
              </DialogTitle>
              <DialogDescription>
                {selectedTimetable
                  ? `${selectedTimetable.academicYear.name} · Planning annuel`
                  : 'Sélectionnez un emploi du temps pour afficher le calendrier.'}
              </DialogDescription>
            </div>
            {selectedTimetable && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenTimetableDialog(selectedTimetable)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Paramètres
                </Button>
                <Button size="sm" onClick={() => handleOpenEntryDialog()}>
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter un cours
                </Button>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedTimetable ? (
              <FullCalendar
                key={calendarKey}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locales={[frLocale]}
                locale="fr"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                initialView="timeGridWeek"
                nowIndicator
                editable
                selectable
                selectMirror
                dayMaxEvents
                events={events}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                select={handleSelect}
                validRange={
                  selectedAcademicYear
                    ? {
                        start: selectedAcademicYear.startDate,
                        end: selectedAcademicYear.endDate,
                      }
                    : undefined
                }
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="19:00:00"
                allDaySlot={false}
                dayHeaderFormat={{ weekday: 'long' }}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                eventClassNames={(args) =>
                  cn(
                    'rounded-lg border-0 px-1 py-0.5 text-xs shadow-sm',
                    args.event.extendedProps?.entry ? 'cursor-pointer' : '',
                  )
                }
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Sélectionnez un emploi du temps pour afficher le calendrier.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTimetableDialogOpen} onOpenChange={setIsTimetableDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Configurer l’emploi du temps annuel</DialogTitle>
            <DialogDescription>
              Choisissez la classe et le statut pour le planning annuel. L’année active est appliquée automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Année appliquée automatiquement</p>
              <p>
                {selectedAcademicYear
                  ? `${selectedAcademicYear.name} (${selectedAcademicYear.startDate} → ${selectedAcademicYear.endDate})`
                  : 'Année active'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select
                value={timetableForm.classId}
                onValueChange={(value) => setTimetableForm((current) => ({ ...current, classId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(classesByLevel).map(([levelName, classes]) => (
                    <SelectGroup key={levelName}>
                      <SelectLabel>{levelName}</SelectLabel>
                      {classes.map((schoolClass) => (
                        <SelectItem key={schoolClass.id} value={schoolClass.id}>
                          {schoolClass.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={timetableForm.status}
                onValueChange={(value) =>
                  setTimetableForm((current) => ({ ...current, status: value as TimetableStatus }))
                }
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
            <Button variant="outline" onClick={() => setIsTimetableDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleTimetableSubmit} disabled={!timetableForm.classId}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>{entryMode === 'edit' ? 'Modifier le cours' : 'Ajouter un cours annuel'}</DialogTitle>
            <DialogDescription>
              Définissez la matière, l’enseignant, le semestre et la salle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select
                  value={entryForm.subjectId}
                  onValueChange={(value) => setEntryForm((current) => ({ ...current, subjectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enseignant</Label>
                <Select
                  value={entryForm.teacherId}
                  onValueChange={(value) => setEntryForm((current) => ({ ...current, teacherId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bâtiment</Label>
                <Select
                  value={entryForm.buildingId}
                  onValueChange={(value) =>
                    setEntryForm((current) => ({
                      ...current,
                      buildingId: value,
                      roomId: options.rooms.find((room) => room.buildingId === value)?.id ?? null,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bâtiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingOptions.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salle</Label>
                <Select
                  value={entryForm.roomId ?? ''}
                  onValueChange={(value) =>
                    setEntryForm((current) => ({
                      ...current,
                      roomId: value || null,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {(entryForm.buildingId
                      ? options.rooms.filter((room) => room.buildingId === entryForm.buildingId)
                      : options.rooms
                    ).map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Semestre appliqué automatiquement</p>
              <p>
                {availableSemesters.find((semester) => semester.id === options.currentSemesterId)?.name ??
                  'Semestre en cours'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {!entryDayLocked && (
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Select
                    value={entryForm.dayOfWeek}
                    onValueChange={(value) => setEntryForm((current) => ({ ...current, dayOfWeek: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_OPTIONS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Début</Label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={entryForm.startTime}
                    onChange={(event) => setEntryForm((current) => ({ ...current, startTime: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin</Label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={entryForm.endTime}
                    onChange={(event) => setEntryForm((current) => ({ ...current, endTime: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {entryMode === 'edit' && editingEntry && (
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => setEntryToDelete(editingEntry)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le cours
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleEntrySubmit}
                disabled={
                  !entryForm.subjectId ||
                  !entryForm.teacherId ||
                  !entryForm.startTime ||
                  !entryForm.endTime
                }
              >
                {entryMode === 'edit' ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(entryToDelete)} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le cours</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce cours annuel ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                entryToDelete &&
                selectedTimetable &&
                deleteEntryMutation.mutate({ id: selectedTimetable.id, entryId: entryToDelete.id })
              }
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
