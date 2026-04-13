import api from '@/lib/api';
import type {
  TeacherClassOptions,
  TeacherClassStudent,
  TeacherClassSummary,
  TeacherTimetableEntry,
  TeacherTimetableOptions,
} from '@/types/teacher';

type ApiEnvelope<T> = { data: T };

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

const buildQueryString = (params?: Record<string, string | number | boolean | undefined | null>) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

export const teacherApi = {
  async fetchClassOptions(): Promise<TeacherClassOptions> {
    const response = await api.get('/teacher/classes/options');
    return extractData<TeacherClassOptions>(response);
  },

  async fetchClasses(params?: { academicYearId?: string; semesterId?: string; subjectId?: string }): Promise<TeacherClassSummary[]> {
    const response = await api.get(`/teacher/classes${buildQueryString(params)}`);
    return extractData<TeacherClassSummary[]>(response);
  },

  async fetchClassStudents(classId: string): Promise<TeacherClassStudent[]> {
    const response = await api.get(`/teacher/classes/${encodeURIComponent(classId)}/students`);
    return extractData<TeacherClassStudent[]>(response);
  },

  async fetchTimetableOptions(): Promise<TeacherTimetableOptions> {
    const response = await api.get('/teacher/timetable/options');
    return extractData<TeacherTimetableOptions>(response);
  },

  async fetchTimetable(params?: { academicYearId?: string; semesterId?: string; classId?: string }): Promise<TeacherTimetableEntry[]> {
    const response = await api.get(`/teacher/timetable${buildQueryString(params)}`);
    return extractData<TeacherTimetableEntry[]>(response);
  },
};
