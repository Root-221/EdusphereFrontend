import api from './api';

export interface ParentProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone?: string | null;
  };
  profile: {
    id: string;
    profession: string | null;
    childrenCount: number;
  };
  children: {
    id: string;
    firstName: string;
    lastName: string;
    average: number;
    gender: string | null;
    class: {
      id: string;
      name: string;
      level: string | null;
    } | null;
    matricule: string | null;
    dateOfBirth: string | null;
    address: string | null;
  }[];
}

export interface ChildTimetableEntry {
  id: string;
  annualTimetableEntryId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  dateStart: string | null;
  dateEnd: string | null;
  date?: string;
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    name: string;
    building: {
      name: string;
    };
  } | null;
  semesterId: string | null;
  status: string;
}

export interface ChildTimetable {
  child: {
    id: string;
    firstName: string;
    lastName: string;
  };
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
  entries: ChildTimetableEntry[];
}

export interface ParentPayment {
  id: string;
  childId: string | null;
  childName: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
  paymentDate: string;
  type: string;
  receiptNumber: string;
  method: string;
}

export const parentApi = {
  getProfile: async (): Promise<ParentProfile> => {
    const response = await api.get('/parent/profile');
    return response.data.data;
  },

  getChildTimetable: async (childId: string, weekStartDate?: string): Promise<ChildTimetable> => {
    const params = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
    const response = await api.get(`/parent/children/${childId}/timetable${params}`);
    return response.data.data;
  },

  getPayments: async (): Promise<ParentPayment[]> => {
    const response = await api.get('/parent/payments');
    return response.data.data;
  },
};