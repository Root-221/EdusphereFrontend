import { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type EventContentArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import { studentApi, type StudentTimetable, type TimetableEntry } from '@/lib/api-student';
import { useAuth } from '@/contexts/AuthContext';
import { useTimetableSync } from '@/hooks/useTimetableSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  BookOpen,
  Loader2,
} from 'lucide-react';
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

const CANCELLED_BG = '#fecaca';
const CANCELLED_BORDER = '#fca5a5';
const CANCELLED_TEXT = '#7f1d1d';

const WEEKDAY_TO_FC: Record<string, number> = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 0,
};

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

const getSubjectColor = (subjectId: string) => {
  let hash = 0;
  for (let index = 0; index < subjectId.length; index += 1) {
    hash = subjectId.charCodeAt(index) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState<StudentTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [syncCounter, setSyncCounter] = useState(0);
  const { user } = useAuth();
  
  useTimetableSync(user?.schoolId, () => {
    setSyncCounter(c => c + 1);
  });

  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    setCurrentWeekStart(startDateStr);
  }, []);

  useEffect(() => {
    if (!currentWeekStart) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await studentApi.getTimetable(currentWeekStart);
        setTimetable(data);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
        setError('Impossible de charger l\'emploi du temps');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentWeekStart, syncCounter]);

  const handleDatesSet = ({ view, start }: { view: any; start: Date }) => {
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
  };

  const validRange = useMemo(() => {
    if (!timetable?.semester?.startDate) return undefined;
    const start = timetable.semester.startDate.split('T')[0];
    let end: string | undefined = undefined;
    
    if (timetable.semester.endDate) {
      const endDateObj = new Date(timetable.semester.endDate);
      endDateObj.setDate(endDateObj.getDate() + 1); // Exclusive end bound
      end = endDateObj.toISOString().split('T')[0];
    }
    
    return { start, end };
  }, [timetable?.semester]);

  const events = useMemo(() => {
    if (!timetable?.entries) return [];
    
    return timetable.entries.map((entry) => {
      const isCancelled = entry.status === 'CANCELLED';
      const baseColor = getSubjectColor(entry.subject.id);
      
      // entry.date can be ISO string like "2026-04-14T00:00:00.000Z" or null
      if (entry.date) {
        // Extract YYYY-MM-DD from ISO date string
        let dateStr = entry.date;
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
        }
        
        const startDateTime = `${dateStr}T${entry.startTime}:00`;
        const endDateTime = `${dateStr}T${entry.endTime}:00`;
        
        return {
          id: entry.id,
          title: entry.subject.name,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: isCancelled ? CANCELLED_BG : entry.status === 'COMPLETED' ? '#dcfce7' : entry.status === 'IN_PROGRESS' ? '#fef08a' : baseColor,
          borderColor: isCancelled ? CANCELLED_BORDER : entry.status === 'COMPLETED' ? '#bbf7d0' : entry.status === 'IN_PROGRESS' ? '#fde047' : baseColor,
          textColor: isCancelled ? CANCELLED_TEXT : entry.status === 'COMPLETED' ? '#166534' : entry.status === 'IN_PROGRESS' ? '#854d0e' : '#ffffff',
          extendedProps: { entry },
        };
      }
      
      // Fallback to weekly recurrence
      const dayOfWeek = WEEKDAY_TO_FC[entry.dayOfWeek] ?? 1;
      return {
        id: entry.id,
        title: entry.subject.name,
        daysOfWeek: [dayOfWeek],
        startTime: entry.startTime,
        endTime: entry.endTime,
        backgroundColor: isCancelled ? CANCELLED_BG : entry.status === 'COMPLETED' ? '#dcfce7' : entry.status === 'IN_PROGRESS' ? '#fef08a' : baseColor,
        borderColor: isCancelled ? CANCELLED_BORDER : entry.status === 'COMPLETED' ? '#bbf7d0' : entry.status === 'IN_PROGRESS' ? '#fde047' : baseColor,
        textColor: isCancelled ? CANCELLED_TEXT : entry.status === 'COMPLETED' ? '#166534' : entry.status === 'IN_PROGRESS' ? '#854d0e' : '#ffffff',
        extendedProps: { entry },
      };
    });
  }, [timetable?.entries]);

  const renderEventContent = (content: EventContentArg) => {
    const entry = content.event.extendedProps.entry as TimetableEntry | undefined;
    if (!entry) {
      return <div className="text-[11px]">Cours</div>;
    }
    const status = entry.status || 'SCHEDULED';
    const isCancelled = entry.status === 'CANCELLED';
    const isCompleted = entry.status === 'COMPLETED';
    const isInProgress = entry.status === 'IN_PROGRESS';
    // Use room from weekly instance (entry.room) or fallback to annualTimetableEntry room
    const room = entry.room;
    const buildingName = room?.building?.name;
    
    const textClass = isCancelled 
      ? 'text-red-800' 
      : isCompleted 
      ? 'text-[#14532D]' 
      : isInProgress 
      ? 'text-[#713F12]' 
      : 'text-white/90';

    return (
      <div className={cn("flex flex-col gap-0.5 text-[11px] leading-tight", isCancelled ? "text-red-900" : "")}>
        <div className="flex items-center gap-1">
          <span className="font-semibold truncate break-words" style={{ color: isCompleted ? '#166534' : isInProgress ? '#854d0e' : undefined }}>
            {entry.subject.name}
          </span>
          <span className={cn("text-[9px] px-1 rounded-full", COURSE_STATUS_COLORS[status])}>
            {COURSE_STATUS_LABELS_RECORD[status]}
          </span>
        </div>
        <span className={cn("text-[10px]", textClass)}>
          {entry.teacher.firstName} {entry.teacher.lastName}
          {buildingName ? ` · ${buildingName}` : ''}
          {room?.name ? ` · ${room.name}` : ''}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <EmptyState message={error || 'Aucune donnée disponible'} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Mon Emploi du Temps</h1>
          <p className="text-sm text-muted-foreground">
            {timetable.class.name} - {timetable.class.level} • {timetable.semester.name} - {timetable.academicYear.name}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1F2937' }}></span>
          <span className="text-xs text-muted-foreground">Cours</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dceafe' }}></span>
          <span className="text-xs text-muted-foreground">Planifié</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fef08a' }}></span>
          <span className="text-xs text-muted-foreground">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dcfce7' }}></span>
          <span className="text-xs text-muted-foreground">Terminé</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CANCELLED_BG }}></span>
          <span className="text-xs text-muted-foreground">Annulé</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total des cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{timetable.entries.length}</div>
            <p className="text-xs text-muted-foreground hidden md:block">cours cette semaine</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Jours de cours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {new Set(timetable.entries.map(e => e.dayOfWeek)).size}
            </div>
            <p className="text-xs text-muted-foreground hidden md:block">jours actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Semestre</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-xl font-bold">{timetable.semester.name}</div>
            <p className="text-xs text-muted-foreground hidden md:block">{timetable.academicYear.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* FullCalendar */}
      {timetable.entries.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun cours prévu</p>
              <p className="text-sm">Aucun cours n'est programmé pour le moment</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locales={[frLocale]}
              locale="fr"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              initialView="timeGridWeek"
              initialDate={currentWeekStart ? new Date(currentWeekStart) : undefined}
              nowIndicator
              editable={false}
              selectable={false}
              selectMirror
              dayMaxEvents
              events={events}
              eventContent={renderEventContent}
              datesSet={handleDatesSet}
              validRange={validRange}
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
                )
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}