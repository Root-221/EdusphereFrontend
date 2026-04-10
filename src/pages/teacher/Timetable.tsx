import { useState, useMemo } from 'react';
import { TimetableEntry, DAYS_OF_WEEK, Class } from '@/types/timetable';
import { mockSemesters, mockTimeSlots, mockClasses, getTeacherTimetable } from '@/data/mockTimetable';
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
  Users,
  GraduationCap
} from 'lucide-react';

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('2'); // Default to active semester
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  // Get teacher's timetable entries
  const teacherId = user?.id || '4'; // Use logged in teacher or default to id 4
  
  const allEntries = useMemo(() => {
    return getTeacherTimetable(teacherId, selectedSemesterId);
  }, [teacherId, selectedSemesterId]);

  // Get unique classes the teacher teaches
  const teacherClasses = useMemo(() => {
    const classMap = new Map<string, Class>();
    allEntries.forEach(entry => {
      if (!classMap.has(entry.classId)) {
        classMap.set(entry.classId, entry.class);
      }
    });
    return Array.from(classMap.values());
  }, [allEntries]);

  // Filter entries by selected class
  const entries = useMemo(() => {
    if (selectedClassId === 'all') {
      return allEntries;
    }
    return allEntries.filter(e => e.classId === selectedClassId);
  }, [allEntries, selectedClassId]);

  // Get semester info
  const selectedSemester = mockSemesters.find(s => s.id === selectedSemesterId);

  // Get current teacher info from mock data
  const currentTeacher = useMemo(() => {
    // For demo, use teacher 1 if user is teacher
    return { id: '1', firstName: 'Mamadou', name: 'Diop', subject: 'Mathématiques' };
  }, []);

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
          <h1 className="text-2xl font-bold tracking-tight">Mon Emploi du Temps</h1>
          <p className="text-muted-foreground">
            {currentTeacher.firstName} {currentTeacher.name} - {currentTeacher.subject}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Class Filter */}
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {teacherClasses.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">cours cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jours de cours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysWithClasses}</div>
            <p className="text-xs text-muted-foreground">jours actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherClasses.length}</div>
            <p className="text-xs text-muted-foreground">classes enseignées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semestre</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedSemester?.name}</div>
            <p className="text-xs text-muted-foreground">{selectedSemester?.academicYearName}</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes the teacher teaches */}
      {teacherClasses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground py-2">Mes classes:</span>
          {teacherClasses.map(cls => (
            <Badge key={cls.id} variant="outline" className="text-sm py-1">
              <GraduationCap className="h-3 w-3 mr-1" />
              {cls.name} · {cls.level}
            </Badge>
          ))}
        </div>
      )}

      {/* Timetable */}
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
          showClass={true}
          showTeacher={false}
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

      {/* Weekly Schedule Summary - Mobile */}
      <div className="md:hidden space-y-4">
        <h2 className="text-lg font-semibold">Résumé hebdomadaire</h2>
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
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{entry.subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{entry.class.name}</p>
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
