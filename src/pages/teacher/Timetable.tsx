import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type EventClickArg, type EventContentArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, BookOpen, GraduationCap, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { teacherApi } from '@/services/teacher';
import type { TeacherTimetableEntry, TeacherTimetableOptions } from '@/types/teacher';
import { cn } from '@/lib/utils';

const COURSE_STATUS_LABELS_RECORD: Record<string, string> = {
  SCHEDULED: 'Planifié',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const COURSE_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const toCalendarDay = (dayOfWeek: string) => {
  const mapping: Record<string, number> = {
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
    dimanche: 0,
  };
  return mapping[dayOfWeek.toLowerCase()] ?? 1;
};

export default function TeacherTimetable() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [courseToCancel, setCourseToCancel] = useState<TeacherTimetableEntry | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const optionsQuery = useQuery({
    queryKey: ['teacher', 'timetable', 'options'],
    queryFn: teacherApi.fetchTimetableOptions,
    retry: false,
  });

  useEffect(() => {
    if (!optionsQuery.data) return;
    setSelectedAcademicYearId(optionsQuery.data.currentAcademicYearId ?? '');
    setSelectedSemesterId(optionsQuery.data.currentSemesterId ?? '');
  }, [optionsQuery.data]);

  useEffect(() => {
    if (!currentWeekStart) {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      const startDateStr = startOfWeek.toISOString().split('T')[0];
      setCurrentWeekStart(startDateStr);
    }
  }, [currentWeekStart]);

  const entriesQuery = useQuery({
    queryKey: ['teacher', 'timetable', selectedAcademicYearId, selectedClassId, currentWeekStart],
    queryFn: () =>
      teacherApi.fetchTimetable({
        academicYearId: selectedAcademicYearId || undefined,
        weekStartDate: currentWeekStart || undefined,
        ...(selectedClassId === 'all' ? {} : { classId: selectedClassId }),
      }),
    enabled: Boolean(currentWeekStart),
    retry: false,
  });

  const options: TeacherTimetableOptions | undefined = optionsQuery.data;
  const entries: TeacherTimetableEntry[] = entriesQuery.data ?? [];

  const cancelCourseMutation = useMutation({
    mutationFn: ({ courseId, reason }: { courseId: string; reason?: string }) =>
      teacherApi.cancelCourse(courseId, reason),
    onSuccess: () => {
      toast({ title: 'Cours annulé', description: 'Le cours a été annulé avec succès.' });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'timetable'] });
      setCourseToCancel(null);
      setCancelReason('');
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible d\'annuler ce cours.', variant: 'destructive' });
    },
  });

  const teacherClasses = useMemo(
    () => (options?.classes ?? []).filter((cls) => cls.academicYearId === selectedAcademicYearId),
    [options?.classes, selectedAcademicYearId],
  );

  const selectedSemester = useMemo(
    () => options?.semesters.find((semester) => semester.id === selectedSemesterId) ?? null,
    [options?.semesters, selectedSemesterId],
  );

const events = useMemo(
    () => {
      const dayOfWeekMap: Record<string, number> = {
        'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6, 'dimanche': 0
      };
      
      return entries.map((entry: any) => {
        const dayNum = dayOfWeekMap[entry.dayOfWeek?.toLowerCase()] ?? 1;
        
        return {
          id: entry.id,
          title: `${entry.subject?.name || 'Cours'} · ${entry.class?.name || 'Classe'}`,
          daysOfWeek: [dayNum],
          startTime: entry.startTime,
          endTime: entry.endTime,
          startRecur: entry.dateStart || new Date().toISOString().split('T')[0],
          endRecur: entry.dateEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          backgroundColor: entry.status === 'CANCELLED' ? '#fecaca' : undefined,
          borderColor: entry.status === 'CANCELLED' ? '#fca5a5' : undefined,
          textColor: entry.status === 'CANCELLED' ? '#7f1d1d' : undefined,
          extendedProps: entry,
        };
      });
    },
    [entries],
  );

  const renderEventContent = (content: EventContentArg) => {
    const entry = content.event.extendedProps as TeacherTimetableEntry;
    if (!entry || !entry.subject) {
      return <div className="text-[11px]">Cours</div>;
    }
    const status = entry.status || 'SCHEDULED';
    const isCancelled = entry.status === 'CANCELLED';
    return (
      <div className={cn("flex flex-col gap-0.5 text-[11px] leading-tight", isCancelled ? "text-red-900" : "")}>
        <div className="flex items-center gap-1">
          <span className="font-semibold truncate">{entry.subject.name}</span>
          <span className={cn("text-[9px] px-1 rounded-full", COURSE_STATUS_COLORS[status])}>
            {COURSE_STATUS_LABELS_RECORD[status]}
          </span>
        </div>
        <span className={cn("text-[10px]", isCancelled ? "text-red-800" : "text-white")}>
          {entry.class.name}
          {entry.room ? ` · ${entry.room.buildingName || ''} · ${entry.room.name}` : ''}
        </span>
      </div>
    );
  };

  const handleEventClick = (info: EventClickArg) => {
    const entry = info.event.extendedProps as TeacherTimetableEntry;
    if (entry.status !== 'CANCELLED' && entry.status !== 'COMPLETED') {
      setCourseToCancel(entry);
    }
  };

  const totalCourses = entries.length;
  const activeDays = new Set(entries.map((entry) => entry.dayOfWeek)).size;
  const classesCount = new Set(entries.map((entry) => entry.class.id)).size;

  if (optionsQuery.isLoading || entriesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mon Emploi du Temps</h1>
          <p className="text-muted-foreground">Chargement de votre planning...</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Chargement des cours...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mon Emploi du Temps</h1>
          <p className="text-muted-foreground">
            Consultez votre planning annuel et vos cours récurrents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {teacherClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} · {cls.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semestre en cours" />
            </SelectTrigger>
            <SelectContent>
              {options?.semesters
                .filter((semester) => semester.academicYearId === selectedAcademicYearId)
                .map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name} · {semester.academicYearName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">sessions planifiées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jours actifs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDays}</div>
            <p className="text-xs text-muted-foreground">jours de cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classesCount}</div>
            <p className="text-xs text-muted-foreground">classes suivies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semestre</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedSemester?.name ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{selectedSemester?.academicYearName ?? ''}</p>
          </CardContent>
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Aucun cours programmé pour ce semestre.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locales={[frLocale]}
              locale="fr"
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              nowIndicator
              events={events}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="19:00:00"
              allDaySlot={false}
              dayHeaderFormat={{ weekday: 'long' }}
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              datesSet={({ view, start }) => {
                if (view.type === 'timeGridWeek' || view.type === 'timeGridDay') {
                  const startDate = view.activeStart || start;
                  const startDateStr = new Date(startDate).toISOString().split('T')[0];
                  setCurrentWeekStart((prev) => {
                    if (prev !== startDateStr) {
                      return startDateStr;
                    }
                    return prev;
                  });
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {teacherClasses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground py-2">Mes classes :</span>
          {teacherClasses.map((cls) => (
            <Badge key={cls.id} variant="outline" className="text-sm py-1">
              <GraduationCap className="h-3 w-3 mr-1" />
              {cls.name} · {cls.level}
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={Boolean(courseToCancel)} onOpenChange={(open) => !open && setCourseToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le cours</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'annuler le cours suivant. Cette action peut être irréversible.
            </DialogDescription>
          </DialogHeader>
          {courseToCancel && (
            <div className="space-y-3 py-3">
              <div className="text-sm">
                <strong>{courseToCancel.subject.name}</strong> - {courseToCancel.class.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {courseToCancel.dayOfWeek} · {courseToCancel.startTime} - {courseToCancel.endTime}
              </div>
              <div className="space-y-2">
                <Label>Raison de l'annulation (optionnel)</Label>
                <Input
                  placeholder="Entrez la raison de l'annulation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseToCancel(null)}>
              Fermer
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (courseToCancel) {
                  cancelCourseMutation.mutate({
                    courseId: courseToCancel.id,
                    reason: cancelReason,
                  });
                }
              }}
              disabled={cancelCourseMutation.isPending}
            >
              {cancelCourseMutation.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
