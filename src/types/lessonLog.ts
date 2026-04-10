// Types for Lesson Logbook (Cahier de texte)

export interface LessonLog {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  objectives: string[];
  content: string;
  homework: string;
  materials: string[];
  notes: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface LessonLogEntry {
  id: string;
  lessonLogId: string;
  studentId?: string;
  studentName?: string;
  type: 'objective' | 'homework' | 'material' | 'note';
  content: string;
  createdAt: string;
}
