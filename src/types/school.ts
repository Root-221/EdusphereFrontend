export type SchoolType = 
  | 'public'
  | 'private'
  | 'college'
  | 'lycee'
  | 'university'
  | 'institute'
  | 'coranic';

export type SchoolStatus = 'active' | 'suspended' | 'pending';

export interface SchoolModule {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

import { Building } from './infrastructure';

export interface School {
  id: string;
  slug: string;
  name: string;
  type: SchoolType;
  status: SchoolStatus;
  plan?: string;
  logo?: string;
  description?: string;
  brandingColor?: string;
  brandingSecondaryColor?: string;
  brandingSlogan?: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  adminEmail: string;
  createdAt: string;
  buildings?: Building[];
}

export const schoolTypeLabels: Record<SchoolType, string> = {
  public: 'École Publique',
  private: 'École Privée',
  college: 'Collège',
  lycee: 'Lycée',
  university: 'Université',
  institute: 'Institut',
  coranic: 'École Coranique',
};

export const schoolStatusLabels: Record<SchoolStatus, string> = {
  active: 'Active',
  suspended: 'Suspendue',
  pending: 'En attente',
};

export const planLabels: Record<string, string> = {
  free: 'Gratuit',
  basic: 'Basique',
  premium: 'Premium',
  enterprise: 'Entreprise',
};

export const planColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-info/10 text-info',
  premium: 'bg-accent/10 text-accent-foreground',
  enterprise: 'bg-primary/10 text-primary',
};
