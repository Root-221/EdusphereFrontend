import api from '@/lib/api';
import { buildQueryString } from '@/services/academic';
import type {
  ClassFeePackage,
  Enrollment,
  EnrollmentPeriod,
  EnrollmentType,
  PaymentMethod,
} from '@/types/enrollment';

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

export interface FetchEnrollmentsParams {
  periodId?: string;
  type?: EnrollmentType;
  status?: Enrollment['status'];
  academicYearId?: string;
  classId?: string;
  levelId?: string;
  search?: string;
}

export interface CreateEnrollmentPeriodPayload {
  name: string;
  type: EnrollmentType;
  academicYearId?: string;
  startDate: string;
  endDate: string;
  maxEnrollments?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateEnrollmentPeriodPayload extends Partial<CreateEnrollmentPeriodPayload> {}

export interface CreateEnrollmentPayload {
  periodId?: string;
  classId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone?: string;
  studentDateOfBirth?: string;
  studentGender?: string;
  studentAddress?: string;
  studentPreviousSchool?: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone?: string;
  parentProfession?: string;
  parentAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentAmount?: number;
  selectedSubjects?: string[];
  notes?: string;
}

export interface CreateReEnrollmentPayload {
  periodId?: string;
  matricule: string;
  classId: string;
  paymentMethod?: PaymentMethod;
  paymentAmount?: number;
  notes?: string;
}

export const enrollmentsApi = {
  async fetchPeriods(): Promise<EnrollmentPeriod[]> {
    const response = await api.get('/school-admin/periods');
    return extractData<EnrollmentPeriod[]>(response);
  },

  async fetchActivePeriods(): Promise<EnrollmentPeriod[]> {
    const response = await api.get('/school-admin/periods/active');
    return extractData<EnrollmentPeriod[]>(response);
  },

  async createPeriod(payload: CreateEnrollmentPeriodPayload): Promise<EnrollmentPeriod> {
    const response = await api.post('/school-admin/periods', payload);
    return extractData<EnrollmentPeriod>(response);
  },

  async updatePeriod(id: string, payload: UpdateEnrollmentPeriodPayload): Promise<EnrollmentPeriod> {
    const response = await api.patch(`/school-admin/periods/${id}`, payload);
    return extractData<EnrollmentPeriod>(response);
  },

  async deletePeriod(id: string): Promise<EnrollmentPeriod> {
    const response = await api.delete(`/school-admin/periods/${id}`);
    return extractData<EnrollmentPeriod>(response);
  },

  async setActivePeriod(periodId: string): Promise<EnrollmentPeriod> {
    const response = await api.patch('/school-admin/periods/set-active', { periodId });
    return extractData<EnrollmentPeriod>(response);
  },

  async fetchEnrollments(params?: FetchEnrollmentsParams): Promise<Enrollment[]> {
    const response = await api.get(`/school-admin/enrollments${buildQueryString(params)}`);
    return extractData<Enrollment[]>(response);
  },

  async fetchLatestEnrollmentByMatricule(matricule: string): Promise<Enrollment> {
    const response = await api.get(`/school-admin/enrollments/latest/${encodeURIComponent(matricule)}`);
    return extractData<Enrollment>(response);
  },

  async createEnrollment(payload: CreateEnrollmentPayload): Promise<Enrollment> {
    const response = await api.post('/school-admin/enrollments', payload);
    return extractData<Enrollment>(response);
  },

  async createReEnrollment(payload: CreateReEnrollmentPayload): Promise<Enrollment> {
    const response = await api.post('/school-admin/reenrollments', payload);
    return extractData<Enrollment>(response);
  },
};

export type { ClassFeePackage };
