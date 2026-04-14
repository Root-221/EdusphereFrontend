import api from './api';

export interface ParentProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
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
  }[];
}

export interface ChildTimetableEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
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
  };
  semester: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
    level: string;
  };
  entries: ChildTimetableEntry[];
}

export const parentApi = {
  getProfile: async (): Promise<ParentProfile> => {
    const response = await api.get('/parent/profile');
    return response.data.data;
  },

  getChildTimetable: async (childId: string): Promise<ChildTimetable> => {
    const response = await api.get(`/parent/children/${childId}/timetable`);
    return response.data.data;
  },
};