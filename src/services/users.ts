import api from '@/lib/api';
import { buildQueryString } from '@/services/academic';
import type { Parent, Staff, StaffRoleKey, Student, Teacher } from '@/types/users';

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

export interface CreateTeacherPayload {
  firstName: string;
  name: string;
  email: string;
  phone?: string;
  subjectId?: string;
  classIds?: string[];
  isActive?: boolean;
}

export interface UpdateTeacherPayload extends Partial<CreateTeacherPayload> {}

export interface CreateStudentPayload {
  firstName: string;
  name: string;
  email: string;
  phone?: string;
  classId: string;
  enrollmentYear?: string;
  academicYearId?: string;
  average?: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  isActive?: boolean;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {}

export interface FetchStudentsParams {
  academicYearId?: string;
}

export interface CreateParentPayload {
  firstName: string;
  name: string;
  email: string;
  phone?: string;
  children?: number;
  childClassId?: string;
  profession?: string;
  isActive?: boolean;
}

export interface UpdateParentPayload extends Partial<CreateParentPayload> {}

export interface CreateStaffPayload {
  firstName: string;
  name: string;
  email: string;
  phone?: string;
  roleId: StaffRoleKey;
  department?: string;
  hireDate?: string;
  isActive?: boolean;
}

export interface UpdateStaffPayload extends Partial<CreateStaffPayload> {}

export const usersApi = {
  async fetchTeachers(): Promise<Teacher[]> {
    const response = await api.get('/school-admin/teachers');
    return extractData<Teacher[]>(response);
  },

  async createTeacher(payload: CreateTeacherPayload): Promise<Teacher> {
    const response = await api.post('/school-admin/teachers', payload);
    return extractData<Teacher>(response);
  },

  async updateTeacher(id: string, payload: UpdateTeacherPayload): Promise<Teacher> {
    const response = await api.patch(`/school-admin/teachers/${id}`, payload);
    return extractData<Teacher>(response);
  },

  async deleteTeacher(id: string): Promise<Teacher> {
    const response = await api.delete(`/school-admin/teachers/${id}`);
    return extractData<Teacher>(response);
  },

  async fetchStudents(params?: FetchStudentsParams): Promise<Student[]> {
    const response = await api.get(`/school-admin/students${buildQueryString(params)}`);
    return extractData<Student[]>(response);
  },

  async fetchStudentByMatricule(matricule: string): Promise<Student> {
    const response = await api.get(`/school-admin/students/${encodeURIComponent(matricule)}`);
    return extractData<Student>(response);
  },

  async createStudent(payload: CreateStudentPayload): Promise<Student> {
    const response = await api.post('/school-admin/students', payload);
    return extractData<Student>(response);
  },

  async updateStudent(id: string, payload: UpdateStudentPayload): Promise<Student> {
    const response = await api.patch(`/school-admin/students/${id}`, payload);
    return extractData<Student>(response);
  },

  async deleteStudent(id: string): Promise<Student> {
    const response = await api.delete(`/school-admin/students/${id}`);
    return extractData<Student>(response);
  },

  async fetchParents(): Promise<Parent[]> {
    const response = await api.get('/school-admin/parents');
    return extractData<Parent[]>(response);
  },

  async createParent(payload: CreateParentPayload): Promise<Parent> {
    const response = await api.post('/school-admin/parents', payload);
    return extractData<Parent>(response);
  },

  async updateParent(id: string, payload: UpdateParentPayload): Promise<Parent> {
    const response = await api.patch(`/school-admin/parents/${id}`, payload);
    return extractData<Parent>(response);
  },

  async deleteParent(id: string): Promise<Parent> {
    const response = await api.delete(`/school-admin/parents/${id}`);
    return extractData<Parent>(response);
  },

  async fetchStaff(): Promise<Staff[]> {
    const response = await api.get('/school-admin/staff');
    return extractData<Staff[]>(response);
  },

  async createStaff(payload: CreateStaffPayload): Promise<Staff> {
    const response = await api.post('/school-admin/staff', payload);
    return extractData<Staff>(response);
  },

  async updateStaff(id: string, payload: UpdateStaffPayload): Promise<Staff> {
    const response = await api.patch(`/school-admin/staff/${id}`, payload);
    return extractData<Staff>(response);
  },

  async deleteStaff(id: string): Promise<Staff> {
    const response = await api.delete(`/school-admin/staff/${id}`);
    return extractData<Staff>(response);
  },
};
