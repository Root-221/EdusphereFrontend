import { DAYS_OF_WEEK } from '@/types/academic';
import type { TimetableEntry, TimeSlot } from '@/types/academic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  School,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from 'lucide-react';
import { useState } from 'react';

interface TimetableGridProps {
  entries: TimetableEntry[];
  timeSlots?: TimeSlot[];
  showClass?: boolean;
  showTeacher?: boolean;
  onEntryClick?: (entry: TimetableEntry) => void;
  editable?: boolean;
  onEditEntry?: (entry: TimetableEntry) => void;
  onAddEntry?: (day: string, timeSlot: TimeSlot) => void;
  className?: string;
}

export function TimetableGrid({
  entries,
  timeSlots,
  showClass = false,
  showTeacher = false,
  onEntryClick,
  editable = false,
  onEditEntry,
  onAddEntry,
  className = ''
}: TimetableGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<number>(0);

  // Default time slots if not provided
  const slots = timeSlots || [
    { id: '1', name: '1', startTime: '08:00', endTime: '09:00' },
    { id: '2', name: '2', startTime: '09:00', endTime: '10:00' },
    { id: '3', name: '3', startTime: '10:00', endTime: '11:00' },
    { id: '4', name: '4', startTime: '11:00', endTime: '12:00' },
    { id: '5', name: '5', startTime: '12:00', endTime: '13:00' },
    { id: '6', name: '6', startTime: '13:00', endTime: '14:00' },
    { id: '7', name: '7', startTime: '14:00', endTime: '15:00' },
    { id: '8', name: '8', startTime: '15:00', endTime: '16:00' },
    { id: '9', name: '9', startTime: '16:00', endTime: '17:00' },
    { id: '10', name: '10', startTime: '17:00', endTime: '18:00' },
  ];

  // Group entries by day and time slot
  const getEntryForSlot = (day: string, timeSlotId: string): TimetableEntry | undefined => {
    return entries.find(e => e.day === day && e.timeSlotId === timeSlotId);
  };

  // Get unique days that have entries
  const daysWithEntries = DAYS_OF_WEEK.filter(day => 
    entries.some(e => e.day === day)
  );

  // Mobile view - show one day at a time
  const currentDay = daysWithEntries[selectedDay] || DAYS_OF_WEEK[0];
  const nextDay = () => setSelectedDay(prev => Math.min(prev + 1, daysWithEntries.length - 1));
  const prevDay = () => setSelectedDay(prev => Math.max(prev - 1, 0));

  // Group entries by day for list view
  const entriesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day === day).sort((a, b) => 
      a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)
    );
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  if (entries.length === 0 && !editable) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun cours prévu</p>
            <p className="text-sm">Aucun emploi du temps n'est disponible pour cette sélection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* View Toggle - Desktop only */}
      <div className="hidden md:flex justify-end mb-4">
        <div className="flex items-center border rounded-lg p-1 bg-card">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header - Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              <div className="text-center text-sm font-medium text-muted-foreground py-2">
                Horaire
              </div>
              {DAYS_OF_WEEK.map(day => (
                <div 
                  key={day} 
                  className={`text-center text-sm font-medium py-2 rounded-lg ${
                    day === currentDay ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {slots.map(slot => {
              const hasAnyEntry = DAYS_OF_WEEK.some(day => getEntryForSlot(day, slot.id));
              if (!hasAnyEntry && !editable) return null;

              return (
                <div key={slot.id} className="grid grid-cols-7 gap-2 mb-2">
                  {/* Time Column */}
                  <div className="flex items-center justify-center">
                    <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                      {slot.startTime}-{slot.endTime}
                    </div>
                  </div>

                  {/* Day Columns */}
                  {DAYS_OF_WEEK.map(day => {
                    const entry = getEntryForSlot(day, slot.id);
                    
                    return (
                      <div key={`${day}-${slot.id}`} className="min-h-[80px]">
                        {entry ? (
                          <Card 
                            className="h-full cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
                            onClick={() => onEntryClick?.(entry)}
                          >
                            <CardContent className="p-2 space-y-1">
                              <p className="font-semibold text-sm truncate">
                                {entry.subject.name}
                              </p>
                              {showTeacher && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {entry.teacher.firstName} {entry.teacher.name}
                                </p>
                              )}
                              {showClass && (
                                <div className="space-y-0.5">
                                  <p className="text-xs text-muted-foreground">
                                    {entry.class.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {entry.class.level?.name || 'Sans niveau'}
                                  </p>
                                </div>
                              )}
                              {entry.room && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room}
                                </p>
                              )}
                              {editable && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full mt-1 h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEntry?.(entry);
                                  }}
                                >
                                  Modifier
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ) : editable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-full min-h-[80px] text-muted-foreground hover:text-primary"
                            onClick={() => onAddEntry?.(day, slot)}
                          >
                            +
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View - Mobile Friendly */
        <div className="space-y-4">
          {/* Mobile Day Navigation */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={prevDay} disabled={selectedDay === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{currentDay}</span>
            <Button variant="outline" size="icon" onClick={nextDay} disabled={selectedDay >= daysWithEntries.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: Show all days | Mobile: Show selected day */}
          {(window.innerWidth >= 768 ? DAYS_OF_WEEK : [currentDay]).map(day => (
            <Card key={day} className="overflow-hidden">
              <div className="bg-muted px-4 py-2">
                <h3 className="font-semibold">{day}</h3>
              </div>
              <CardContent className="p-0">
                {entriesByDay[day].length === 0 ? (
                  editable && onAddEntry && slots[0] ? (
                    <div className="p-4 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground text-sm">
                      <p>Aucun cours</p>
                      <Button variant="outline" size="sm" onClick={() => onAddEntry(day, slots[0])}>
                        Ajouter un cours
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Aucun cours
                    </div>
                  )
                ) : (
                  <div className="divide-y">
                    {entriesByDay[day].map(entry => (
                      <div 
                        key={entry.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onEntryClick?.(entry)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{entry.subject.name}</p>
                              <p className="text-xs text-muted-foreground">{entry.class.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <School className="h-3 w-3" />
                                  {entry.class.level?.name || 'Sans niveau'}
                                </span>
                                {entry.room && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {entry.room}
                                  </span>
                                )}
                              </div>
                              {showTeacher && (
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {entry.teacher.firstName} {entry.teacher.name}
                                </p>
                              )}
                            </div>
                          </div>
                          {editable && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEntry?.(entry);
                              }}
                            >
                              Modifier
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for small spaces
export function CompactTimetable({ 
  entries, 
  onEntryClick 
}: { 
  entries: TimetableEntry[]; 
  onEntryClick?: (entry: TimetableEntry) => void;
}) {
  // Group by day
  const entriesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day === day).sort((a, b) => 
      a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)
    );
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  return (
    <div className="space-y-2">
      {DAYS_OF_WEEK.map(day => {
        const dayEntries = entriesByDay[day];
        if (dayEntries.length === 0) return null;

        return (
          <Card key={day}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {day}
                <Badge variant="secondary" className="ml-auto">
                  {dayEntries.length} cours
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {dayEntries.map(entry => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onEntryClick?.(entry)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{entry.subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                          {entry.room && ` • ${entry.room}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{entry.class?.name}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {entry.class?.level?.name || 'Sans niveau'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
