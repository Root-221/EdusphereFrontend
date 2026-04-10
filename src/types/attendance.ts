// Types for Attendance Management with QR Code

export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentFirstName: string;
  qrCode: string;
  classId: string;
  className: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName?: string;
  records: StudentAttendanceRecord[];
}

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentFirstName: string;
  qrCode: string;
  time: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}
