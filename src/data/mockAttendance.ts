import { AttendanceRecord, StudentAttendanceRecord } from '@/types/attendance';

// Extended mock attendance records for school admin
export const mockAttendanceRecords: AttendanceRecord[] = [
  // 5ème A - Mathématiques - 20 Avril 2025
  {
    id: 'a1',
    date: '2025-04-20',
    classId: 'c10',
    className: '5ème A',
    subjectId: 's2',
    subjectName: 'Mathématiques',
    teacherId: 't1',
    teacherName: 'Mamadou Diop',
    records: [
      { id: 'ar1', studentId: 'st1', studentName: 'Sall', studentFirstName: 'Moussa', qrCode: 'QR001', time: '08:00', status: 'present' },
      { id: 'ar2', studentId: 'st2', studentName: 'Diop', studentFirstName: 'Aïda', qrCode: 'QR002', time: '08:00', status: 'present' },
      { id: 'ar3', studentId: 'st3', studentName: 'Fall', studentFirstName: 'Oumar', qrCode: 'QR003', time: '08:05', status: 'late' },
      { id: 'ar4', studentId: 'st4', studentName: 'Ndiaye', studentFirstName: 'Fatou', qrCode: 'QR004', time: '-', status: 'absent', notes: 'Maladie' },
      { id: 'ar5', studentId: 'st7', studentName: 'Sy', studentFirstName: 'Moussa', qrCode: 'QR007', time: '08:00', status: 'present' },
      { id: 'ar6', studentId: 'st8', studentName: 'Touré', studentFirstName: 'Mamadou', qrCode: 'QR008', time: '08:02', status: 'present' },
    ],
  },
  // 4ème B - Français - 20 Avril 2025
  {
    id: 'a2',
    date: '2025-04-20',
    classId: 'c11',
    className: '4ème B',
    subjectId: 's1',
    subjectName: 'Français',
    teacherId: 't2',
    teacherName: 'Aminata Mbaye',
    records: [
      { id: 'ar7', studentId: 'st5', studentName: 'Sy', studentFirstName: 'Ibrahima', qrCode: 'QR005', time: '09:00', status: 'present' },
      { id: 'ar8', studentId: 'st6', studentName: 'Diallo', studentFirstName: 'Mariama', qrCode: 'QR006', time: '09:00', status: 'present' },
      { id: 'ar9', studentId: 'st9', studentName: 'Kané', studentFirstName: 'Youssouf', qrCode: 'QR009', time: '-', status: 'absent', notes: 'Absent père' },
      { id: 'ar10', studentId: 'st10', studentName: 'Sarr', studentFirstName: 'Khadidiatou', qrCode: 'QR010', time: '09:05', status: 'late' },
    ],
  },
  // 5ème A - Français - 20 Avril 2025
  {
    id: 'a3',
    date: '2025-04-20',
    classId: 'c10',
    className: '5ème A',
    subjectId: 's1',
    subjectName: 'Français',
    teacherId: 't2',
    teacherName: 'Aminata Mbaye',
    records: [
      { id: 'ar11', studentId: 'st1', studentName: 'Sall', studentFirstName: 'Moussa', qrCode: 'QR001', time: '10:00', status: 'present' },
      { id: 'ar12', studentId: 'st2', studentName: 'Diop', studentFirstName: 'Aïda', qrCode: 'QR002', time: '10:00', status: 'present' },
      { id: 'ar13', studentId: 'st3', studentName: 'Fall', studentFirstName: 'Oumar', qrCode: 'QR003', time: '10:00', status: 'present' },
      { id: 'ar14', studentId: 'st4', studentName: 'Ndiaye', studentFirstName: 'Fatou', qrCode: 'QR004', time: '-', status: 'absent', notes: 'Maladie' },
      { id: 'ar15', studentId: 'st7', studentName: 'Sy', studentFirstName: 'Moussa', qrCode: 'QR007', time: '10:02', status: 'present' },
      { id: 'ar16', studentId: 'st8', studentName: 'Touré', studentFirstName: 'Mamadou', qrCode: 'QR008', time: '10:00', status: 'present' },
    ],
  },
  // 3ème C - Sciences - 20 Avril 2025
  {
    id: 'a4',
    date: '2025-04-20',
    classId: 'c12',
    className: '3ème C',
    subjectId: 's3',
    subjectName: 'Sciences',
    teacherId: 't3',
    teacherName: 'Cheikh Anta Diop',
    records: [
      { id: 'ar17', studentId: 'st11', studentName: 'Mbaye', studentFirstName: 'Saliou', qrCode: 'QR011', time: '11:00', status: 'present' },
      { id: 'ar18', studentId: 'st12', studentName: 'Fall', studentFirstName: 'Aminata', qrCode: 'QR012', time: '11:00', status: 'present' },
      { id: 'ar19', studentId: 'st13', studentName: 'Ndiaye', studentFirstName: 'Moussa', qrCode: 'QR013', time: '11:00', status: 'present' },
      { id: 'ar20', studentId: 'st14', studentName: 'Diop', studentFirstName: 'Fatou', qrCode: 'QR014', time: '11:10', status: 'late' },
    ],
  },
  // 5ème A - Mathématiques - 19 Avril 2025
  {
    id: 'a5',
    date: '2025-04-19',
    classId: 'c10',
    className: '5ème A',
    subjectId: 's2',
    subjectName: 'Mathématiques',
    teacherId: 't1',
    teacherName: 'Mamadou Diop',
    records: [
      { id: 'ar21', studentId: 'st1', studentName: 'Sall', studentFirstName: 'Moussa', qrCode: 'QR001', time: '08:00', status: 'present' },
      { id: 'ar22', studentId: 'st2', studentName: 'Diop', studentFirstName: 'Aïda', qrCode: 'QR002', time: '-', status: 'absent', notes: 'Rendez-vous médical' },
      { id: 'ar23', studentId: 'st3', studentName: 'Fall', studentFirstName: 'Oumar', qrCode: 'QR003', time: '08:00', status: 'present' },
      { id: 'ar24', studentId: 'st4', studentName: 'Ndiaye', studentFirstName: 'Fatou', qrCode: 'QR004', time: '08:00', status: 'present' },
      { id: 'ar25', studentId: 'st7', studentName: 'Sy', studentFirstName: 'Moussa', qrCode: 'QR007', time: '08:05', status: 'late' },
      { id: 'ar26', studentId: 'st8', studentName: 'Touré', studentFirstName: 'Mamadou', qrCode: 'QR008', time: '08:00', status: 'present' },
    ],
  },
  // 4ème B - Histoire-Géo - 19 Avril 2025
  {
    id: 'a6',
    date: '2025-04-19',
    classId: 'c11',
    className: '4ème B',
    subjectId: 's4',
    subjectName: 'Histoire-Géo',
    teacherId: 't4',
    teacherName: 'Ibrahima Ndiaye',
    records: [
      { id: 'ar27', studentId: 'st5', studentName: 'Sy', studentFirstName: 'Ibrahima', qrCode: 'QR005', time: '09:00', status: 'present' },
      { id: 'ar28', studentId: 'st6', studentName: 'Diallo', studentFirstName: 'Mariama', qrCode: 'QR006', time: '09:00', status: 'present' },
      { id: 'ar29', studentId: 'st9', studentName: 'Kané', studentFirstName: 'Youssouf', qrCode: 'QR009', time: '09:00', status: 'present' },
      { id: 'ar30', studentId: 'st10', studentName: 'Sarr', studentFirstName: 'Khadidiatou', qrCode: 'QR010', time: '09:00', status: 'present' },
    ],
  },
  // 5ème A - Anglais - 19 Avril 2025
  {
    id: 'a7',
    date: '2025-04-19',
    classId: 'c10',
    className: '5ème A',
    subjectId: 's5',
    subjectName: 'Anglais',
    teacherId: 't5',
    teacherName: 'Fatou Diop',
    records: [
      { id: 'ar31', studentId: 'st1', studentName: 'Sall', studentFirstName: 'Moussa', qrCode: 'QR001', time: '10:30', status: 'present' },
      { id: 'ar32', studentId: 'st2', studentName: 'Diop', studentFirstName: 'Aïda', qrCode: 'QR002', time: '10:30', status: 'present' },
      { id: 'ar33', studentId: 'st3', studentName: 'Fall', studentFirstName: 'Oumar', qrCode: 'QR003', time: '10:35', status: 'late' },
      { id: 'ar34', studentId: 'st4', studentName: 'Ndiaye', studentFirstName: 'Fatou', qrCode: 'QR004', time: '10:30', status: 'present' },
      { id: 'ar35', studentId: 'st7', studentName: 'Sy', studentFirstName: 'Moussa', qrCode: 'QR007', time: '10:30', status: 'present' },
      { id: 'ar36', studentId: 'st8', studentName: 'Touré', studentFirstName: 'Mamadou', qrCode: 'QR008', time: '-', status: 'excused', notes: 'Autorisation parentale' },
    ],
  },
  // 3ème C - Mathématiques - 18 Avril 2025
  {
    id: 'a8',
    date: '2025-04-18',
    classId: 'c12',
    className: '3ème C',
    subjectId: 's2',
    subjectName: 'Mathématiques',
    teacherId: 't1',
    teacherName: 'Mamadou Diop',
    records: [
      { id: 'ar37', studentId: 'st11', studentName: 'Mbaye', studentFirstName: 'Saliou', qrCode: 'QR011', time: '08:00', status: 'present' },
      { id: 'ar38', studentId: 'st12', studentName: 'Fall', studentFirstName: 'Aminata', qrCode: 'QR012', time: '08:00', status: 'present' },
      { id: 'ar39', studentId: 'st13', studentName: 'Ndiaye', studentFirstName: 'Moussa', qrCode: 'QR013', time: '-', status: 'absent', notes: 'Familial' },
      { id: 'ar40', studentId: 'st14', studentName: 'Diop', studentFirstName: 'Fatou', qrCode: 'QR014', time: '08:00', status: 'present' },
    ],
  },
  // 5ème A - Physique - 18 Avril 2025
  {
    id: 'a9',
    date: '2025-04-18',
    classId: 'c10',
    className: '5ème A',
    subjectId: 's6',
    subjectName: 'Physique',
    teacherId: 't3',
    teacherName: 'Cheikh Anta Diop',
    records: [
      { id: 'ar41', studentId: 'st1', studentName: 'Sall', studentFirstName: 'Moussa', qrCode: 'QR001', time: '14:00', status: 'present' },
      { id: 'ar42', studentId: 'st2', studentName: 'Diop', studentFirstName: 'Aïda', qrCode: 'QR002', time: '14:00', status: 'present' },
      { id: 'ar43', studentId: 'st3', studentName: 'Fall', studentFirstName: 'Oumar', qrCode: 'QR003', time: '14:00', status: 'present' },
      { id: 'ar44', studentId: 'st4', studentName: 'Ndiaye', studentFirstName: 'Fatou', qrCode: 'QR004', time: '14:05', status: 'late' },
      { id: 'ar45', studentId: 'st7', studentName: 'Sy', studentFirstName: 'Moussa', qrCode: 'QR007', time: '14:00', status: 'present' },
      { id: 'ar46', studentId: 'st8', studentName: 'Touré', studentFirstName: 'Mamadou', qrCode: 'QR008', time: '14:00', status: 'present' },
    ],
  },
  // 4ème B - Sciences - 17 Avril 2025
  {
    id: 'a10',
    date: '2025-04-17',
    classId: 'c11',
    className: '4ème B',
    subjectId: 's3',
    subjectName: 'Sciences',
    teacherId: 't3',
    teacherName: 'Cheikh Anta Diop',
    records: [
      { id: 'ar47', studentId: 'st5', studentName: 'Sy', studentFirstName: 'Ibrahima', qrCode: 'QR005', time: '09:00', status: 'present' },
      { id: 'ar48', studentId: 'st6', studentName: 'Diallo', studentFirstName: 'Mariama', qrCode: 'QR006', time: '09:00', status: 'present' },
      { id: 'ar49', studentId: 'st9', studentName: 'Kané', studentFirstName: 'Youssouf', qrCode: 'QR009', time: '09:00', status: 'present' },
      { id: 'ar50', studentId: 'st10', studentName: 'Sarr', studentFirstName: 'Khadidiatou', qrCode: 'QR010', time: '09:00', status: 'present' },
    ],
  },
];

export const mockStudentAttendance = [
  { id: 'sa1', studentId: 'st1', studentName: 'Moussa Sall', classId: 'c10', className: '5ème A', date: '2025-04-20', status: 'present' as const },
  { id: 'sa2', studentId: 'st1', studentName: 'Moussa Sall', classId: 'c10', className: '5ème A', date: '2025-04-19', status: 'present' as const },
  { id: 'sa3', studentId: 'st1', studentName: 'Moussa Sall', classId: 'c10', className: '5ème A', date: '2025-04-18', status: 'absent' as const, notes: 'Rendez-vous médical' },
  { id: 'sa4', studentId: 'st1', studentName: 'Moussa Sall', classId: 'c10', className: '5ème A', date: '2025-04-17', status: 'present' as const },
  { id: 'sa5', studentId: 'st1', studentName: 'Moussa Sall', classId: 'c10', className: '5ème A', date: '2025-04-16', status: 'late' as const, notes: 'Retard de 10 min' },
];

// Students with QR codes for attendance scanning
export const mockStudentsWithQR = [
  { id: 'st1', name: 'Sall', firstName: 'Moussa', qrCode: 'QR001', classId: 'c10', className: '5ème A' },
  { id: 'st2', name: 'Diop', firstName: 'Aïda', qrCode: 'QR002', classId: 'c10', className: '5ème A' },
  { id: 'st3', name: 'Fall', firstName: 'Oumar', qrCode: 'QR003', classId: 'c10', className: '5ème A' },
  { id: 'st4', name: 'Ndiaye', firstName: 'Fatou', qrCode: 'QR004', classId: 'c10', className: '5ème A' },
  { id: 'st5', name: 'Sy', firstName: 'Ibrahima', qrCode: 'QR005', classId: 'c11', className: '4ème B' },
  { id: 'st6', name: 'Diallo', firstName: 'Mariama', qrCode: 'QR006', classId: 'c11', className: '4ème B' },
  { id: 'st7', name: 'Sy', firstName: 'Moussa', qrCode: 'QR007', classId: 'c10', className: '5ème A' },
  { id: 'st8', name: 'Touré', firstName: 'Mamadou', qrCode: 'QR008', classId: 'c10', className: '5ème A' },
  { id: 'st9', name: 'Kané', firstName: 'Youssouf', qrCode: 'QR009', classId: 'c11', className: '4ème B' },
  { id: 'st10', name: 'Sarr', firstName: 'Khadidiatou', qrCode: 'QR010', classId: 'c11', className: '4ème B' },
  { id: 'st11', name: 'Mbaye', firstName: 'Saliou', qrCode: 'QR011', classId: 'c12', className: '3ème C' },
  { id: 'st12', name: 'Fall', firstName: 'Aminata', qrCode: 'QR012', classId: 'c12', className: '3ème C' },
  { id: 'st13', name: 'Ndiaye', firstName: 'Moussa', qrCode: 'QR013', classId: 'c12', className: '3ème C' },
  { id: 'st14', name: 'Diop', firstName: 'Fatou', qrCode: 'QR014', classId: 'c12', className: '3ème C' },
];
