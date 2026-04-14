import api from './api';

export interface TimetableEntry {
  id: string;
  annualTimetableEntryId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  dateStart: string | null;
  dateEnd: string | null;
  date?: string;
  status: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  roomId: string | null;
  subjectId: string;
  subject: {
    id: string;
    name: string;
  };
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  classId: string;
  semesterId: string | null;
  semester?: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    name: string;
    building: {
      name: string;
    };
  } | null;
}

export interface StudentTimetable {
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  semester: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  class: {
    id: string;
    name: string;
    level: string;
  };
  entries: TimetableEntry[];
}

export interface StudentProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  profile: {
    id: string;
    matricule: string | null;
    qrCode: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    parentName: string | null;
    parentPhone: string | null;
    average: number;
  };
  class: {
    id: string;
    name: string;
    level: string | null;
  } | null;
  academicYear: {
    id: string;
    name: string;
  } | null;
  semester: {
    id: string;
    name: string;
  } | null;
  enrollment: {
    id: string;
    status: string;
    paymentStatus: string;
  } | null;
}

export const studentApi = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await api.get('/student/profile');
    return response.data.data;
  },

  getTimetable: async (weekStartDate?: string): Promise<StudentTimetable> => {
    const params = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
    const response = await api.get(`/student/timetable${params}`);
    return response.data.data;
  },
};