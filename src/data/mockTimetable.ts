import { AcademicYear, Semester, Timetable, TimetableEntry, TimeSlot, Class, Teacher, Subject } from '@/types/timetable';

export const mockAcademicYears: AcademicYear[] = [
  { id: 'ay1', name: '2024-2025', status: 'completed', startDate: '2024-09-01', endDate: '2025-07-15' },
  { id: 'ay2', name: '2025-2026', status: 'active', startDate: '2025-09-01', endDate: '2026-07-15' },
];

export const mockSemesters: Semester[] = [
  { id: 's1', name: 'Semestre 1', academicYearId: 'ay2', academicYearName: '2025-2026', startDate: '2025-09-01', endDate: '2025-12-20', status: 'completed' },
  { id: 's2', name: 'Semestre 2', academicYearId: 'ay2', academicYearName: '2025-2026', startDate: '2026-01-05', endDate: '2026-07-15', status: 'active' },
];

export const mockClasses: Class[] = [
  { id: 'c10', name: '5ème A', capacity: 35, level: '5ème' },
  { id: 'c11', name: '4ème B', capacity: 35, level: '4ème' },
  { id: 'c13', name: 'Seconde S', capacity: 30, level: 'Seconde' },
  { id: 'c14', name: 'Première S', capacity: 30, level: 'Première' },
  { id: 'c15', name: 'Terminale S', capacity: 30, level: 'Terminale' },
];

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Français', coefficient: 4 },
  { id: 's2', name: 'Mathématiques', coefficient: 5 },
  { id: 's3', name: 'Anglais', coefficient: 3 },
  { id: 's4', name: 'Histoire-Géographie', coefficient: 3 },
  { id: 's5', name: 'Sciences Physiques', coefficient: 4 },
  { id: 's6', name: 'SVT', coefficient: 4 },
];

export const mockTeachers: Teacher[] = [
  { id: 't1', firstName: 'Aminata', name: 'Ba', email: 'aminata.ba@ecole.sn', subject: 'Mathématiques', subjectId: 's2' },
  { id: 't2', firstName: 'Moussa', name: 'Diop', email: 'moussa.diop@ecole.sn', subject: 'Français', subjectId: 's1' },
  { id: 't3', firstName: 'Fatou', name: 'Sow', email: 'fatou.sow@ecole.sn', subject: 'Anglais', subjectId: 's3' },
  { id: 't4', firstName: 'Ibrahima', name: 'Ndiaye', email: 'ibrahima.ndiaye@ecole.sn', subject: 'Histoire-Géographie', subjectId: 's4' },
  { id: 't5', firstName: 'Cheikh', name: 'Sy', email: 'cheikh.sy@ecole.sn', subject: 'Sciences Physiques', subjectId: 's5' },
];

export const mockTimeSlots: TimeSlot[] = [
  { id: 'ts1', name: '1er créneau', startTime: '08:00', endTime: '09:00' },
  { id: 'ts2', name: '2ème créneau', startTime: '09:00', endTime: '10:00' },
  { id: 'ts3', name: '3ème créneau', startTime: '10:00', endTime: '10:30' },
  { id: 'ts4', name: '4ème créneau', startTime: '10:30', endTime: '11:30' },
  { id: 'ts5', name: '5ème créneau', startTime: '11:30', endTime: '12:30' },
  { id: 'ts6', name: '6ème créneau', startTime: '13:30', endTime: '14:30' },
  { id: 'ts7', name: '7ème créneau', startTime: '14:30', endTime: '15:30' },
  { id: 'ts8', name: '8ème créneau', startTime: '15:30', endTime: '16:30' },
];

export const mockTimetableEntries: TimetableEntry[] = [
  // Lundi - 5ème A
  { id: 'te1', timetableId: 'tt1', day: 'Lundi', timeSlotId: 'ts1', timeSlot: mockTimeSlots[0], subjectId: 's2', subject: mockSubjects[1], teacherId: 't1', teacher: mockTeachers[0], classId: 'c10', class: mockClasses[0], room: 'Salle 1' },
  { id: 'te2', timetableId: 'tt1', day: 'Lundi', timeSlotId: 'ts2', timeSlot: mockTimeSlots[1], subjectId: 's1', subject: mockSubjects[0], teacherId: 't2', teacher: mockTeachers[1], classId: 'c10', class: mockClasses[0], room: 'Salle 2' },
  { id: 'te3', timetableId: 'tt1', day: 'Lundi', timeSlotId: 'ts4', timeSlot: mockTimeSlots[3], subjectId: 's3', subject: mockSubjects[2], teacherId: 't3', teacher: mockTeachers[2], classId: 'c10', class: mockClasses[0], room: 'Salle 3' },
  // Mardi - 5ème A
  { id: 'te4', timetableId: 'tt1', day: 'Mardi', timeSlotId: 'ts1', timeSlot: mockTimeSlots[0], subjectId: 's4', subject: mockSubjects[3], teacherId: 't4', teacher: mockTeachers[3], classId: 'c10', class: mockClasses[0], room: 'Salle 4' },
  { id: 'te5', timetableId: 'tt1', day: 'Mardi', timeSlotId: 'ts2', timeSlot: mockTimeSlots[1], subjectId: 's5', subject: mockSubjects[4], teacherId: 't5', teacher: mockTeachers[4], classId: 'c10', class: mockClasses[0], room: 'Laboratoire' },
  // Mercredi - 5ème A
  { id: 'te6', timetableId: 'tt1', day: 'Mercredi', timeSlotId: 'ts1', timeSlot: mockTimeSlots[0], subjectId: 's2', subject: mockSubjects[1], teacherId: 't1', teacher: mockTeachers[0], classId: 'c10', class: mockClasses[0], room: 'Salle 1' },
  { id: 'te7', timetableId: 'tt1', day: 'Mercredi', timeSlotId: 'ts2', timeSlot: mockTimeSlots[1], subjectId: 's6', subject: mockSubjects[5], teacherId: 't5', teacher: mockTeachers[4], classId: 'c10', class: mockClasses[0], room: 'Laboratoire SVT' },
];

export const mockTimetables: Timetable[] = [
  {
    id: 'tt1',
    academicYearId: 'ay2',
    academicYear: mockAcademicYears[1],
    semesterId: 's2',
    semester: mockSemesters[1],
    classId: 'c10',
    class: mockClasses[0],
    status: 'active',
    entries: mockTimetableEntries,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-15',
  },
];

// Helper function to check for time slot conflicts (matches TimeSlotModal usage)
export function checkTimeSlotConflict(
  day: string,
  timeSlotId: string,
  classId: string,
  teacherId: string,
  excludeEntryId?: string
): { hasConflict: boolean; message: string } {
  const timeSlot = mockTimeSlots.find(t => t.id === timeSlotId);
  if (!timeSlot) {
    return { hasConflict: false, message: '' };
  }

  const newStartTime = timeSlot.startTime;
  const newEndTime = timeSlot.endTime;
  const newStart = parseInt(newStartTime.replace(':', ''));
  const newEnd = parseInt(newEndTime.replace(':', ''));

  // Check against all timetable entries
  for (const timetable of mockTimetables) {
    for (const entry of timetable.entries) {
      // Skip if same entry we're editing
      if (excludeEntryId && entry.id === excludeEntryId) continue;
      
      // Check same day
      if (entry.day !== day) continue;
      
      const entryStart = parseInt(entry.timeSlot.startTime.replace(':', ''));
      const entryEnd = parseInt(entry.timeSlot.endTime.replace(':', ''));
      
      // Check teacher conflict
      if (entry.teacherId === teacherId) {
        if (newStart < entryEnd && newEnd > entryStart) {
          return { 
            hasConflict: true, 
            message: `Le professeur ${entry.teacher.firstName} ${entry.teacher.name} a déjà un cours à ${entry.timeSlot.startTime}-${entry.timeSlot.endTime}` 
          };
        }
      }
      
      // Check class conflict
      if (entry.classId === classId) {
        if (newStart < entryEnd && newEnd > entryStart) {
          return { 
            hasConflict: true, 
            message: `La classe ${entry.class.name} a déjà un cours à ${entry.timeSlot.startTime}-${entry.timeSlot.endTime}` 
          };
        }
      }
    }
  }
  
  return { hasConflict: false, message: '' };
}

// Get teacher's timetable
export function getTeacherTimetable(teacherId: string, semesterId?: string): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  for (const timetable of mockTimetables) {
    if (semesterId && timetable.semesterId !== semesterId) {
      continue;
    }
    for (const entry of timetable.entries) {
      if (entry.teacherId === teacherId) {
        entries.push(entry);
      }
    }
  }
  return entries;
}

// Get student's timetable
export function getStudentTimetable(classId: string): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  for (const timetable of mockTimetables) {
    if (timetable.classId === classId) {
      entries.push(...timetable.entries);
    }
  }
  return entries;
}

// Get class timetable
export function getClassTimetable(classId: string, semesterId?: string): TimetableEntry[] {
  if (semesterId) {
    // Filter by semester if provided
    const entries: TimetableEntry[] = [];
    for (const timetable of mockTimetables) {
      if (timetable.classId === classId && timetable.semesterId === semesterId) {
        entries.push(...timetable.entries);
      }
    }
    return entries;
  }
  return getStudentTimetable(classId);
}

// Get child's timetable (for parent view)
export function getChildTimetable(childId: string, classId: string): TimetableEntry[] {
  return getStudentTimetable(classId);
}
