import api from '@/lib/api';
import type {
  AcademicYear,
  AnnualTimetable,
  AnnualTimetableEntry,
  AnnualTimetableOptions,
  ClassStatus,
  CourseStatus,
  Level,
  LevelStatus,
  SchoolClass,
  Subject,
  Timetable,
  TimetableEntry,
  TimetableOptions,
  TimeSlot,
  Semester,
  SemesterStatus,
  SubjectStatus,
  TimetableStatus,
} from '@/types/academic';

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

const REACT_QUERY_CONTEXT_KEYS = new Set(['queryKey', 'signal', 'client', 'meta', 'pageParam']);

const isReactQueryContext = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.keys(value as Record<string, unknown>).some((key) => REACT_QUERY_CONTEXT_KEYS.has(key));
};

const buildQueryString = (params?: Record<string, string | number | boolean | undefined | null>) => {
  if (!params || isReactQueryContext(params)) {
    return '';
  }

  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  status?: AcademicYear['status'];
}

export interface UpdateAcademicYearPayload extends Partial<CreateAcademicYearPayload> {}

export interface FetchSemestersParams {
  academicYearId?: string;
  status?: SemesterStatus;
}

export interface FetchLevelsParams {
  status?: LevelStatus;
}

export interface CreateLevelPayload {
  name: string;
  sortOrder?: number;
  description?: string;
  status?: Level['status'];
}

export interface UpdateLevelPayload extends Partial<CreateLevelPayload> {}

export interface CreateSemesterPayload {
  academicYearId?: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: SemesterStatus;
}

export interface UpdateSemesterPayload extends Partial<CreateSemesterPayload> {}

export interface FetchClassesParams {
  academicYearId?: string;
  level?: string;
  levelId?: string;
  status?: ClassStatus;
}

export interface CreateClassPayload {
  name: string;
  levelId: string;
  capacity?: number;
  academicYearId?: string;
  teacherId?: string;
  status?: ClassStatus;
}

export interface UpdateClassPayload extends Partial<CreateClassPayload> {}

export interface AssignClassSubjectsPayload {
  subjectIds: string[];
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  coefficient?: number;
  hours?: number;
  status?: SubjectStatus;
  description?: string;
}

export interface UpdateSubjectPayload extends Partial<CreateSubjectPayload> {}

export interface AssignSubjectTeachersPayload {
  teacherIds: string[];
}

export interface FetchTimetablesParams {
  academicYearId?: string;
  semesterId?: string;
  classId?: string;
  status?: TimetableStatus;
}

export interface FetchAnnualTimetablesParams {
  academicYearId?: string;
  classId?: string;
  status?: TimetableStatus;
}

export interface CreateTimeSlotPayload {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTimeSlotPayload extends Partial<CreateTimeSlotPayload> {}

export interface CreateTimetablePayload {
  academicYearId?: string;
  semesterId?: string;
  classId: string;
  status?: TimetableStatus;
}

export interface UpdateTimetablePayload extends Partial<CreateTimetablePayload> {}

export interface DuplicateTimetablePayload {
  targetSemesterId: string;
}

export interface CreateTimetableEntryPayload {
  day: string;
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
  classId?: string;
  room?: string | null;
}

export interface UpdateTimetableEntryPayload extends Partial<CreateTimetableEntryPayload> {}

export interface CreateAnnualTimetablePayload {
  academicYearId?: string;
  classId: string;
  status?: TimetableStatus;
}

export interface UpdateAnnualTimetablePayload extends Partial<CreateAnnualTimetablePayload> {}

export interface CreateAnnualTimetableEntryPayload {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  dateStart: string;
  dateEnd: string;
  subjectId: string;
  teacherId: string;
  classId?: string;
  roomId?: string;
  semesterId?: string;
}

export interface UpdateAnnualTimetableEntryPayload extends Partial<CreateAnnualTimetableEntryPayload> {}

export const academicApi = {
  async fetchAcademicYears(): Promise<AcademicYear[]> {
    const response = await api.get('/school-admin/academic-years');
    return extractData<AcademicYear[]>(response);
  },

  async createAcademicYear(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
    const response = await api.post('/school-admin/academic-years', payload);
    return extractData<AcademicYear>(response);
  },

  async updateAcademicYear(id: string, payload: UpdateAcademicYearPayload): Promise<AcademicYear> {
    const response = await api.patch(`/school-admin/academic-years/${id}`, payload);
    return extractData<AcademicYear>(response);
  },

  async updateAcademicYearStatus(id: string, status: AcademicYear['status']): Promise<AcademicYear> {
    const response = await api.patch(`/school-admin/academic-years/${id}/status`, { status });
    return extractData<AcademicYear>(response);
  },

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    const response = await api.delete(`/school-admin/academic-years/${id}`);
    return extractData<AcademicYear>(response);
  },

  async fetchSemesters(params?: FetchSemestersParams): Promise<Semester[]> {
    const response = await api.get(`/school-admin/semesters${buildQueryString(params)}`);
    return extractData<Semester[]>(response);
  },

  async fetchLevels(params?: FetchLevelsParams): Promise<Level[]> {
    const response = await api.get(`/school-admin/levels${buildQueryString(params)}`);
    return extractData<Level[]>(response);
  },

  async createLevel(payload: CreateLevelPayload): Promise<Level> {
    const response = await api.post('/school-admin/levels', payload);
    return extractData<Level>(response);
  },

  async updateLevel(id: string, payload: UpdateLevelPayload): Promise<Level> {
    const response = await api.patch(`/school-admin/levels/${id}`, payload);
    return extractData<Level>(response);
  },

  async deleteLevel(id: string): Promise<Level> {
    const response = await api.delete(`/school-admin/levels/${id}`);
    return extractData<Level>(response);
  },

  async createSemester(payload: CreateSemesterPayload): Promise<Semester> {
    const response = await api.post('/school-admin/semesters', payload);
    return extractData<Semester>(response);
  },

  async updateSemester(id: string, payload: UpdateSemesterPayload): Promise<Semester> {
    const response = await api.patch(`/school-admin/semesters/${id}`, payload);
    return extractData<Semester>(response);
  },

  async updateSemesterStatus(id: string, status: SemesterStatus): Promise<Semester> {
    const response = await api.patch(`/school-admin/semesters/${id}/status`, { status });
    return extractData<Semester>(response);
  },

  async deleteSemester(id: string): Promise<Semester> {
    const response = await api.delete(`/school-admin/semesters/${id}`);
    return extractData<Semester>(response);
  },

  async fetchClasses(params?: FetchClassesParams): Promise<SchoolClass[]> {
    const response = await api.get(`/school-admin/classes${buildQueryString(params)}`);
    return extractData<SchoolClass[]>(response);
  },

  async fetchClassTeachers(classId: string): Promise<import('@/types/users').Teacher[]> {
    const response = await api.get(`/school-admin/classes/${encodeURIComponent(classId)}/teachers`);
    return extractData<import('@/types/users').Teacher[]>(response);
  },

  async createClass(payload: CreateClassPayload): Promise<SchoolClass> {
    const response = await api.post('/school-admin/classes', payload);
    return extractData<SchoolClass>(response);
  },

  async updateClass(id: string, payload: UpdateClassPayload): Promise<SchoolClass> {
    const response = await api.patch(`/school-admin/classes/${id}`, payload);
    return extractData<SchoolClass>(response);
  },

  async deleteClass(id: string): Promise<SchoolClass> {
    const response = await api.delete(`/school-admin/classes/${id}`);
    return extractData<SchoolClass>(response);
  },

  async assignClassSubjects(id: string, payload: AssignClassSubjectsPayload): Promise<SchoolClass> {
    const response = await api.post(`/school-admin/classes/${id}/subjects`, payload);
    return extractData<SchoolClass>(response);
  },

  async fetchSubjects(): Promise<Subject[]> {
    const response = await api.get('/school-admin/subjects');
    return extractData<Subject[]>(response);
  },

  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    const response = await api.post('/school-admin/subjects', payload);
    return extractData<Subject>(response);
  },

  async updateSubject(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    const response = await api.patch(`/school-admin/subjects/${id}`, payload);
    return extractData<Subject>(response);
  },

  async deleteSubject(id: string): Promise<Subject> {
    const response = await api.delete(`/school-admin/subjects/${id}`);
    return extractData<Subject>(response);
  },

  async assignSubjectTeachers(id: string, payload: AssignSubjectTeachersPayload): Promise<Subject> {
    const response = await api.post(`/school-admin/subjects/${id}/teachers`, payload);
    return extractData<Subject>(response);
  },

  async fetchTimeSlots(): Promise<TimeSlot[]> {
    const response = await api.get('/school-admin/time-slots');
    return extractData<TimeSlot[]>(response);
  },

  async createTimeSlot(payload: CreateTimeSlotPayload): Promise<TimeSlot> {
    const response = await api.post('/school-admin/time-slots', payload);
    return extractData<TimeSlot>(response);
  },

  async updateTimeSlot(id: string, payload: UpdateTimeSlotPayload): Promise<TimeSlot> {
    const response = await api.patch(`/school-admin/time-slots/${id}`, payload);
    return extractData<TimeSlot>(response);
  },

  async deleteTimeSlot(id: string): Promise<TimeSlot> {
    const response = await api.delete(`/school-admin/time-slots/${id}`);
    return extractData<TimeSlot>(response);
  },

  async fetchTimetables(params?: FetchTimetablesParams): Promise<Timetable[]> {
    const response = await api.get(`/school-admin/timetables${buildQueryString(params)}`);
    return extractData<Timetable[]>(response);
  },

  async fetchAnnualTimetables(params?: FetchAnnualTimetablesParams): Promise<AnnualTimetable[]> {
    const response = await api.get(`/school-admin/annual-timetables${buildQueryString(params)}`);
    return extractData<AnnualTimetable[]>(response);
  },

  async fetchTimetableOptions(): Promise<TimetableOptions> {
    const response = await api.get('/school-admin/timetables/options');
    return extractData<TimetableOptions>(response);
  },

  async fetchAnnualTimetableOptions(): Promise<AnnualTimetableOptions> {
    const response = await api.get('/school-admin/annual-timetables/options');
    return extractData<AnnualTimetableOptions>(response);
  },

  async fetchTimetable(id: string): Promise<Timetable> {
    const response = await api.get(`/school-admin/timetables/${id}`);
    return extractData<Timetable>(response);
  },

  async fetchAnnualTimetable(id: string): Promise<AnnualTimetable> {
    const response = await api.get(`/school-admin/annual-timetables/${id}`);
    return extractData<AnnualTimetable>(response);
  },

  async createTimetable(payload: CreateTimetablePayload): Promise<Timetable> {
    const response = await api.post('/school-admin/timetables', payload);
    return extractData<Timetable>(response);
  },

  async updateTimetable(id: string, payload: UpdateTimetablePayload): Promise<Timetable> {
    const response = await api.patch(`/school-admin/timetables/${id}`, payload);
    return extractData<Timetable>(response);
  },

  async createAnnualTimetable(payload: CreateAnnualTimetablePayload): Promise<AnnualTimetable> {
    const response = await api.post('/school-admin/annual-timetables', payload);
    return extractData<AnnualTimetable>(response);
  },

  async updateAnnualTimetable(id: string, payload: UpdateAnnualTimetablePayload): Promise<AnnualTimetable> {
    const response = await api.patch(`/school-admin/annual-timetables/${id}`, payload);
    return extractData<AnnualTimetable>(response);
  },

  async deleteAnnualTimetable(id: string): Promise<AnnualTimetable> {
    const response = await api.delete(`/school-admin/annual-timetables/${id}`);
    return extractData<AnnualTimetable>(response);
  },

  async deleteTimetable(id: string): Promise<Timetable> {
    const response = await api.delete(`/school-admin/timetables/${id}`);
    return extractData<Timetable>(response);
  },

  async duplicateTimetable(id: string, payload: DuplicateTimetablePayload): Promise<Timetable> {
    const response = await api.post(`/school-admin/timetables/${id}/duplicate`, payload);
    return extractData<Timetable>(response);
  },

  async createTimetableEntry(id: string, payload: CreateTimetableEntryPayload): Promise<TimetableEntry> {
    const response = await api.post(`/school-admin/timetables/${id}/entries`, payload);
    return extractData<TimetableEntry>(response);
  },

  async createAnnualTimetableEntry(
    id: string,
    payload: CreateAnnualTimetableEntryPayload,
  ): Promise<AnnualTimetableEntry> {
    const response = await api.post(`/school-admin/annual-timetables/${id}/entries`, payload);
    return extractData<AnnualTimetableEntry>(response);
  },

  async updateTimetableEntry(
    id: string,
    entryId: string,
    payload: UpdateTimetableEntryPayload,
  ): Promise<TimetableEntry> {
    const response = await api.patch(`/school-admin/timetables/${id}/entries/${entryId}`, payload);
    return extractData<TimetableEntry>(response);
  },

  async updateAnnualTimetableEntry(
    id: string,
    entryId: string,
    payload: UpdateAnnualTimetableEntryPayload,
  ): Promise<AnnualTimetableEntry> {
    const response = await api.patch(`/school-admin/annual-timetables/${id}/entries/${entryId}`, payload);
    return extractData<AnnualTimetableEntry>(response);
  },

  async deleteTimetableEntry(id: string, entryId: string): Promise<{ id: string; timetableId: string }> {
    const response = await api.delete(`/school-admin/timetables/${id}/entries/${entryId}`);
    return extractData<{ id: string; timetableId: string }>(response);
  },

  async deleteAnnualTimetableEntry(id: string, entryId: string): Promise<{ id: string; annualTimetableId: string }> {
    const response = await api.delete(`/school-admin/annual-timetables/${id}/entries/${entryId}`);
    return extractData<{ id: string; annualTimetableId: string }>(response);
  },

  async updateAnnualTimetableEntryStatus(
    id: string,
    entryId: string,
    status: CourseStatus,
  ): Promise<AnnualTimetableEntry> {
    const response = await api.patch(`/school-admin/annual-timetables/${id}/entries/${entryId}/status`, { status });
    return extractData<AnnualTimetableEntry>(response);
  },

  async cancelAnnualTimetableEntry(
    id: string,
    entryId: string,
    reason?: string,
  ): Promise<AnnualTimetableEntry> {
    const response = await api.post(`/school-admin/annual-timetables/${id}/entries/${entryId}/cancel`, { reason });
    return extractData<AnnualTimetableEntry>(response);
  },
};

export { buildQueryString };
