export interface TeacherClassSummary {
  id: string;
  name: string;
  level: string;
  levelId: string;
  academicYearId: string;
  academicYear: string;
  semesterId: string;
  semester: string;
  students: number;
  maleStudents: number;
  femaleStudents: number;
  average: number;
  subjectIds: string[];
  subjects: { id: string; name: string }[];
}

export interface TeacherClassStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  average: number;
  gender: string;
}

export interface TeacherClassOptions {
  currentAcademicYearId: string | null;
  currentSemesterId: string | null;
  academicYears: { id: string; name: string; status: string }[];
  semesters: { id: string; name: string; academicYearId: string; academicYearName: string; status: string }[];
  subjects: { id: string; name: string }[];
  classes: { id: string; name: string; levelId: string; level: string; academicYearId: string; academicYear: string }[];
}

export interface TeacherTimetableOptions {
  currentAcademicYearId: string | null;
  currentSemesterId: string | null;
  academicYears: { id: string; name: string; status: string }[];
  semesters: { id: string; name: string; academicYearId: string; academicYearName: string; status: string; startDate: string; endDate: string }[];
  subjects: { id: string; name: string }[];
  classes: { id: string; name: string; levelId: string; level: string; academicYearId: string; academicYear: string }[];
}

export interface TeacherTimetableEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  dateStart: string;
  dateEnd: string;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cancelledAt: string | null;
  cancellationReason: string | null;
  subject: { id: string; name: string };
  class: { id: string; name: string; level: string };
  room: { id: string; name: string; buildingName: string } | null;
  semesterId: string;
  semesterName: string;
  academicYearId: string;
  academicYearName: string;
}
