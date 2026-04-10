import api from '@/lib/api';
import { School, SchoolType, SchoolStatus } from '@/types/school';

export interface CreateSchoolPayload {
  name: string;
  slug: string;
  email?: string;
  contactEmail?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone?: string;
  city?: string;
  country?: string;
  address?: string;
  description?: string;
  logo?: string;
  brandingColor?: string;
  brandingSecondaryColor?: string;
  brandingSlogan?: string;
  type?: SchoolType;
  plan?: string;
}

export interface SchoolLogoUploadResponse {
  url: string;
}

export interface SchoolAdminRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  schoolName: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  slug: string;
  schoolId: string;
  createdAt: string;
  isActive: boolean;
}

interface SchoolAdminApiRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  schoolId: string;
  schoolName: string;
  slug: string;
  createdAt: string | Date;
  isActive: boolean;
}

export interface PlatformRecentSchool {
  id: string;
  name: string;
  status: SchoolStatus;
  plan: string;
  email: string;
  slug: string;
  createdAt: string;
}

export interface PlatformActivity {
  id: string;
  action: string;
  school?: string;
  user?: string;
  time: string;
}

export interface PlatformStatsResponse {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  pendingSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalUsers: number;
  monthlyRevenue: number;
  schoolsByType: Record<string, number>;
  schoolsByPlan: Record<string, number>;
  recentSchools: PlatformRecentSchool[];
  recentActivity: PlatformActivity[];
}

const normalizeType = (value?: string): SchoolType => {
  if (!value) return 'private';
  const normalized = value.toLowerCase() as SchoolType;
  const allowed: SchoolType[] = ['public','private','college','lycee','university','institute','coranic'];
  return allowed.includes(normalized) ? normalized : 'private';
};

const normalizeStatus = (value?: string): SchoolStatus => {
  if (!value) return 'pending';
  const normalized = value.toLowerCase() as SchoolStatus;
  const allowed: SchoolStatus[] = ['active','suspended','pending'];
  return allowed.includes(normalized) ? normalized : 'pending';
};

const normalizeSchool = (school: any): School => ({
  id: school.id,
  slug: school.slug ?? '',
  name: school.name,
  type: normalizeType(school.type),
  status: normalizeStatus(school.status),
  plan: school.plan ? String(school.plan).toLowerCase() : 'free',
  country: school.country ?? '',
  city: school.city ?? '',
  address: school.address ?? '',
  description: school.description ?? undefined,
  brandingColor: school.brandingColor ?? undefined,
  brandingSecondaryColor: school.brandingSecondaryColor ?? undefined,
  brandingSlogan: school.brandingSlogan ?? undefined,
  email: school.email ?? '',
  phone: school.phone ?? undefined,
  studentCount: 0,
  teacherCount: 0,
  adminEmail: school.email ?? '',
  createdAt: school.createdAt ?? new Date().toISOString(),
  logo: school.logo ?? undefined,
});

const normalizeSchoolAdmin = (admin: SchoolAdminApiRecord): SchoolAdminRecord => ({
  id: admin.id,
  name: [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() || admin.email,
  email: admin.email,
  phone: admin.phone ?? null,
  schoolName: admin.schoolName,
  status: admin.isActive ? 'active' : 'inactive',
  role: admin.role === 'SCHOOL_ADMIN' ? 'Administrateur' : admin.role,
  slug: admin.slug,
  schoolId: admin.schoolId,
  createdAt:
    typeof admin.createdAt === 'string' ? admin.createdAt : admin.createdAt.toISOString(),
  isActive: admin.isActive,
});

export const superAdminApi = {
  async fetchSchools(): Promise<School[]> {
    const response = await api.get('/super-admin/schools');
    const schools = Array.isArray(response.data.data) ? response.data.data : [];
    return schools.map(normalizeSchool);
  },

  async createSchool(payload: CreateSchoolPayload) {
    const {
      adminEmail,
      contactEmail,
      email,
      type,
      ...rest
    } = payload;

    const resolvedAdminEmail = adminEmail?.trim() || email?.trim();
    const resolvedContactEmail = contactEmail?.trim() || undefined;
    const requestPayload = {
      ...rest,
      email: resolvedAdminEmail,
      contactEmail: resolvedContactEmail,
      type: type?.toUpperCase?.() || 'PRIVATE',
    };
    try {
      const response = await api.post('/super-admin/schools', requestPayload);
      return response.data;
    } catch (error) {
      console.error('createSchool error payload', requestPayload, 'response', (error as any).response?.data);
      throw error;
    }
  },

  async uploadSchoolLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/super-admin/uploads/school-logo', formData);
    const responseData = (response.data?.data ?? response.data) as
      | SchoolLogoUploadResponse
      | undefined;
    const logoUrl = responseData?.url;

    if (!logoUrl) {
      throw new Error('Impossible de récupérer l\'URL du logo depuis le backend.');
    }

    return logoUrl;
  },

  async updateSchoolStatus(id: string, status: string) {
    const response = await api.patch(`/super-admin/schools/${id}/status`, { status });
    return response.data;
  },

  async fetchSchoolAdmins(): Promise<SchoolAdminRecord[]> {
    const response = await api.get('/super-admin/school-admins');
    const admins = Array.isArray(response.data.data) ? response.data.data : [];
    return admins.map(normalizeSchoolAdmin);
  },

  async updateSchoolAdminStatus(id: string, isActive: boolean): Promise<SchoolAdminRecord> {
    const response = await api.patch(`/super-admin/school-admins/${id}/status`, { isActive });
    return normalizeSchoolAdmin(response.data.data as SchoolAdminApiRecord);
  },

  async fetchStats(): Promise<PlatformStatsResponse> {
    const response = await api.get('/super-admin/stats');
    return response.data.data as PlatformStatsResponse;
  },
};
