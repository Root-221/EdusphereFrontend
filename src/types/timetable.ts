// Types pour le système d'Emplois du Temps (EDT)

export interface AcademicYear {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
}

export interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'locked';
}

export interface Class {
  id: string;
  name: string;
  capacity: number;
  level: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  name: string;
  email: string;
  subject: string;
  subjectId: string;
}

export interface Subject {
  id: string;
  name: string;
  coefficient?: number;
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
}

import { Room } from './infrastructure';

export interface TimetableEntry {
  id: string;
  timetableId: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  timeSlotId: string;
  timeSlot: TimeSlot;
  subjectId: string;
  subject: Subject;
  teacherId: string;
  teacher: Teacher;
  classId: string;
  class: Class;
  room?: string;
  roomId?: string;
}

export interface Timetable {
  id: string;
  academicYearId: string;
  academicYear: AcademicYear;
  semesterId: string;
  semester: Semester;
  classId: string;
  class: Class;
  status: 'active' | 'inactive' | 'draft';
  entries: TimetableEntry[];
  createdAt: string;
  updatedAt: string;
}

// Pour la vue Professor
export interface TeacherTimetable {
  teacherId: string;
  teacher: Teacher;
  entries: TimetableEntry[];
}

// Pour la vue Élève
export interface StudentTimetable {
  studentId: string;
  classId: string;
  class: Class;
  entries: TimetableEntry[];
}

// Pour la vue Parent (enfant)
export interface ChildTimetable {
  childId: string;
  childName: string;
  classId: string;
  class: Class;
  entries: TimetableEntry[];
}

// Jours de la semaine
export const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

// Créneaux horaires par défaut
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', name: '1er créneau', startTime: '08:00', endTime: '09:00' },
  { id: '2', name: '2ème créneau', startTime: '09:00', endTime: '10:00' },
  { id: '3', name: '3ème créneau', startTime: '10:00', endTime: '11:00' },
  { id: '4', name: '4ème créneau', startTime: '11:00', endTime: '12:00' },
  { id: '5', name: '5ème créneau', startTime: '12:00', endTime: '13:00' },
  { id: '6', name: '6ème créneau', startTime: '13:00', endTime: '14:00' },
  { id: '7', name: '7ème créneau', startTime: '14:00', endTime: '15:00' },
  { id: '8', name: '8ème créneau', startTime: '15:00', endTime: '16:00' },
  { id: '9', name: '9ème créneau', startTime: '16:00', endTime: '17:00' },
  { id: '10', name: '10ème créneau', startTime: '17:00', endTime: '18:00' },
];
