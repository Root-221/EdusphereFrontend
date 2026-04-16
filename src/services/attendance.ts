import api from '@/lib/api';

export interface AttendanceEntry {
  id: string;
  matricule: string;
  name: string;
  avatar: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'NOT_MARKED';
  arrivalTime: string | null;
  method: 'QR_CODE' | 'MANUAL' | 'AUTOMATIC' | null;
  notes: string | null;
}

export interface AttendanceMutationResponse {
  success: boolean;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  studentName: string;
  arrivalTime: string;
  notes?: string | null;
}

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

export const attendanceApi = {
  /**
   * Génère un token QR pour l'élève actuel
   */
  getQrToken: async (): Promise<{ token: string }> => {
    const response = await api.get('/attendance/qr-token');
    return extractData<{ token: string }>(response);
  },

  /**
   * Marque une présence via scan QR
   */
  markAttendance: async (payload: { courseInstanceId: string; studentIdOrToken: string; method: 'QR_CODE' | 'MANUAL' }) => {
    const response = await api.post('/attendance/mark', payload);
    return extractData<AttendanceMutationResponse>(response);
  },

  /**
   * Marque une présence manuellement via matricule
   */
  markManual: async (payload: { courseInstanceId: string; matricule: string; notes?: string }) => {
    const response = await api.post('/attendance/mark-manual', payload);
    return extractData<AttendanceMutationResponse>(response);
  },

  /**
   * Récupère la liste d'assiduité pour un cours
   */
  getCourseAttendance: async (instanceId: string): Promise<AttendanceEntry[]> => {
    const response = await api.get(`/attendance/course/${instanceId}`);
    return extractData<AttendanceEntry[]>(response);
  },

  /**
   * Justifie une absence avec un motif
   */
  justifyAbsence: async (payload: { courseInstanceId: string; studentId: string; reason: string }): Promise<AttendanceMutationResponse> => {
    const response = await api.post(
      `/attendance/course/${payload.courseInstanceId}/students/${payload.studentId}/justify`,
      { reason: payload.reason },
    );
    return extractData<AttendanceMutationResponse>(response);
  },

  /**
   * Nomme ou révoque un délégué de classe
   */
  toggleClassLeader: async (studentId: string): Promise<{ success: boolean; isClassLeader: boolean; message: string }> => {
    const response = await api.post(`/school-admin/students/${studentId}/toggle-leader`);
    return extractData(response);
  },
};
