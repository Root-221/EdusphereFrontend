import api from '@/lib/api';
import type { School } from '@/types/school';

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T;
  return ((payload as ApiEnvelope<T>).data ?? payload) as T;
};

export const schoolApi = {
  async fetchCurrentSchool(): Promise<School> {
    const response = await api.get('/school-admin/school');
    return extractData<School>(response);
  },
};
