import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { teacherApi } from '@/services/teacher';
import type { TeacherTimetableEntry, TeacherTimetableOptions } from '@/types/teacher';

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

  const entriesQuery = useQuery({
    queryKey: ['teacher', 'timetable', selectedAcademicYearId, selectedSemesterId, selectedClassId],
    queryFn: () =>
      teacherApi.fetchTimetable({
        academicYearId: selectedAcademicYearId,
        semesterId: selectedSemesterId,
        ...(selectedClassId === 'all' ? {} : { classId: selectedClassId }),
      }),
    enabled: Boolean(selectedAcademicYearId),
    retry: false,
  });

  const options: TeacherTimetableOptions | undefined = optionsQuery.data;
  const entries: TeacherTimetableEntry[] = entriesQuery.data ?? [];

  const teacherClasses = useMemo(
    () => (options?.classes ?? []).filter((cls) => cls.academicYearId === selectedAcademicYearId),
    [options?.classes, selectedAcademicYearId],
  );

  const selectedSemester = useMemo(
    () => options?.semesters.find((semester) => semester.id === selectedSemesterId) ?? null,
    [options?.semesters, selectedSemesterId],
  );

  const events = useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.id,
        title: `${entry.subject.name} · ${entry.class.name}`,
        daysOfWeek: [toCalendarDay(entry.dayOfWeek)],
        startTime: entry.startTime,
        endTime: entry.endTime,
        startRecur: entry.dateStart,
        endRecur: entry.dateEnd,
        extendedProps: entry,
      })),
    [entries],
  );

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
              eventContent={(content) => {
                const entry = content.event.extendedProps as TeacherTimetableEntry;
                return (
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="font-semibold">{entry.subject.name}</span>
                    <span className="text-[10px] text-white/90">
                      {entry.class.name}
                      {entry.room?.buildingName ? ` · ${entry.room.buildingName}` : ''}
                      {entry.room?.name ? ` · ${entry.room.name}` : ''}
                    </span>
                  </div>
                );
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
    </div>
  );
}
