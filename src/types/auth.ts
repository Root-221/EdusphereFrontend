export type UserRole = 
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  schoolName?: string;
  mustChangePassword?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  school_admin: 'Admin École',
  teacher: 'Enseignant',
  student: 'Élève',
  parent: 'Parent',
  accountant: 'Comptable',
};

export const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-primary text-primary-foreground',
  school_admin: 'bg-info text-info-foreground',
  teacher: 'bg-success text-success-foreground',
  student: 'bg-secondary text-secondary-foreground',
  parent: 'bg-muted text-muted-foreground',
  accountant: 'bg-warning text-warning-foreground',
};
