export type AcademicYearStatus = 'draft' | 'active' | 'completed';
export type SemesterStatus = 'active' | 'completed' | 'locked';
export type ClassStatus = 'active' | 'inactive' | 'archived';
export type LevelStatus = 'active' | 'inactive' | 'archived';
export type SubjectStatus = 'active' | 'inactive';
export type TimetableStatus = 'active' | 'inactive' | 'draft';
export type CourseStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  SCHEDULED: 'Planifié',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export interface AcademicYear {
  id: string;
  name: string;
  status: AcademicYearStatus;
  startDate: string;
  endDate: string;
  students: number;
}

export interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
  average: number | null;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  status: LevelStatus;
  classes: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  capacity: number;
  levelId: string;
  level: Level | null;
  teacherId: string;
  teacher: string;
  teacherIds: string[];
  students: number;
  subjects: string[];
  subjectIds: string[];
  status: ClassStatus;
  academicYearId: string;
  academicYear: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teachers: number;
  hours: number;
  coefficient: number;
  teacherIds: string[];
  teacherNames: string[];
  status: SubjectStatus;
  description: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  subjectId: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  classId: string;
  class: string;
  academicYearId: string;
  status: 'active' | 'inactive';
  average: number;
  enrollmentYear: string;
  parentName: string;
  parentPhone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

export interface Parent {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  children: number;
  childClassId: string;
  childClass: string;
  status: 'active' | 'inactive';
  profession: string;
}

export interface Staff {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  hireDate: string;
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  day: (typeof DAYS_OF_WEEK)[number];
  timeSlotId: string;
  timeSlot: TimeSlot;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    coefficient: number;
  };
  teacherId: string;
  teacher: Teacher;
  classId: string;
  class: {
    id: string;
    name: string;
    capacity: number;
    levelId: string;
    level: Level | null;
  };
  room: string;
}

export interface Timetable {
  id: string;
  academicYearId: string;
  academicYear: {
    id: string;
    name: string;
    status: AcademicYearStatus | string;
    startDate: string;
    endDate: string;
  };
  semesterId: string;
  semester: {
    id: string;
    name: string;
    academicYearId: string;
    academicYearName: string;
    startDate: string;
    endDate: string;
    status: SemesterStatus | string;
    average: number | null;
  };
  classId: string;
  class: SchoolClass;
  status: TimetableStatus;
  entries: TimetableEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TimetableOptions {
  currentAcademicYearId: string | null;
  currentSemesterId: string | null;
  academicYears: Array<Pick<AcademicYear, 'id' | 'name' | 'status'>>;
  semesters: Array<Pick<Semester, 'id' | 'name' | 'academicYearId' | 'academicYear'> & { status: SemesterStatus | string }>;
  classes: Array<Pick<SchoolClass, 'id' | 'name' | 'capacity' | 'levelId' | 'level' | 'teacherId' | 'teacher' | 'teacherIds' | 'students' | 'subjects' | 'subjectIds' | 'status' | 'academicYearId' | 'academicYear'>>;
  subjects: Array<Pick<Subject, 'id' | 'name' | 'code' | 'teachers' | 'hours' | 'coefficient' | 'teacherIds' | 'teacherNames' | 'status' | 'description'>>;
  teachers: Teacher[];
  timeSlots: TimeSlot[];
}

export interface AnnualTimetableEntry {
  id: string;
  annualTimetableId: string;
  annualTimetableEntryId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  dateStart: string;
  dateEnd: string;
  status: CourseStatus;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    coefficient: number;
  };
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    name: string;
    email: string;
    subject: string;
    subjectId: string;
  } | null;
  classId: string;
  class: SchoolClass;
  roomId: string | null;
  room: {
    id: string;
    name: string;
    buildingId: string;
    buildingName: string;
    status: string;
    capacity: number;
    roomType: string;
  } | null;
  semesterId: string | null;
  semester: {
    id: string;
    name: string;
    academicYearId: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export interface AnnualTimetable {
  id: string;
  academicYearId: string;
  academicYear: {
    id: string;
    name: string;
    status: AcademicYearStatus | string;
    startDate: string;
    endDate: string;
  };
  classId: string;
  class: SchoolClass;
  status: TimetableStatus;
  entries: AnnualTimetableEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AnnualTimetableOptions {
  currentAcademicYearId: string | null;
  currentSemesterId: string | null;
  academicYears: Array<Pick<AcademicYear, 'id' | 'name' | 'status' | 'startDate' | 'endDate'>>;
  semesters: Array<Pick<Semester, 'id' | 'name' | 'academicYearId' | 'academicYear' | 'startDate' | 'endDate'> & { status: SemesterStatus | string }>;
  classes: Array<Pick<SchoolClass, 'id' | 'name' | 'capacity' | 'levelId' | 'level' | 'teacherId' | 'teacher' | 'teacherIds' | 'students' | 'subjects' | 'subjectIds' | 'status' | 'academicYearId' | 'academicYear'>>;
  subjects: Array<Pick<Subject, 'id' | 'name' | 'code' | 'teachers' | 'hours' | 'coefficient' | 'teacherIds' | 'teacherNames' | 'status' | 'description'>>;
  teachers: Teacher[];
  rooms: {
    id: string;
    name: string;
    buildingId: string;
    buildingName: string;
    status: string;
    capacity: number;
    roomType: string;
  }[];
}
