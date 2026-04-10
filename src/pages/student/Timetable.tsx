import { useState, useMemo } from 'react';
import { TimetableEntry, DAYS_OF_WEEK } from '@/types/timetable';
import { mockSemesters, mockTimeSlots, mockClasses, getClassTimetable } from '@/data/mockTimetable';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { TimeSlotModal } from '@/components/timetable/TimeSlotModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3
} from 'lucide-react';

export default function StudentTimetable() {
  const { user } = useAuth();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('2'); // Default to active semester
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  
  // For demo, we use class id "c10" (5ème A)
  // In a real app, this would come from the student's enrolled class
  const classId = 'c10';

  // Get class info
  const classInfo = mockClasses.find(c => c.id === classId);
  
  // Get timetable entries
  const entries = useMemo(() => {
    return getClassTimetable(classId, selectedSemesterId);
  }, [classId, selectedSemesterId]);

  // Get semester info
  const selectedSemester = mockSemesters.find(s => s.id === selectedSemesterId);

  // Handle entry click
  const handleEntryClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Group entries by day
  const entriesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day === day).sort((a, b) => 
      a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)
    );
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  // Stats
  const totalHours = entries.length;
  const daysWithClasses = Object.values(entriesByDay).filter(day => day.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Mon Emploi du Temps</h1>
          <p className="text-sm text-muted-foreground">
            Votre emploi du temps hebdomadaire - {classInfo?.name} {classInfo?.level ? `· ${classInfo.level}` : ''}
          </p>
        </div>

        {/* Semester Filter */}
        <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner un semestre" />
          </SelectTrigger>
          <SelectContent>
            {mockSemesters.filter(s => s.status === 'active' || s.status === 'completed').map(semester => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name} - {semester.academicYearName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total des cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground hidden md:block">cours cette semaine</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Jours de cours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{daysWithClasses}</div>
            <p className="text-xs text-muted-foreground hidden md:block">jours actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Classe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-xl font-bold">{classInfo?.name}</div>
            <p className="text-xs text-muted-foreground hidden md:block">{classInfo?.level}</p>
            <p className="text-xs text-muted-foreground hidden md:block">{selectedSemester?.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun cours prévu</p>
              <p className="text-sm">Aucun cours n'est programmé pour ce semestre</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TimetableGrid
          entries={entries}
          timeSlots={mockTimeSlots}
          showTeacher={true}
          showClass={false}
          onEntryClick={handleEntryClick}
        />
      )}

      {/* Entry Detail Modal */}
      <TimeSlotModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        entry={selectedEntry}
        mode="view"
        onSave={() => {}}
      />

      {/* Weekly Schedule Summary - Mobile Friendly */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Détail par jour</h2>
        {DAYS_OF_WEEK.map(day => {
          const dayEntries = entriesByDay[day];
          if (dayEntries.length === 0) return null;

          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {day}
                  <Badge variant="secondary">{dayEntries.length} cours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{entry.subject.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.class.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.teacher.firstName} {entry.teacher.name}
                        </p>
                        {entry.room && (
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.room}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
