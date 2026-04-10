import { Briefcase, Computer, GraduationCap, Library, Wallet, UserCog } from 'lucide-react';

export type UserStatus = 'active' | 'inactive';

export const staffRoleOptions = [
  { key: 'secretary', label: 'Secrétaire', icon: UserCog },
  { key: 'accountant', label: 'Comptable', icon: Wallet },
  { key: 'librarian', label: 'Bibliothécaire', icon: Library },
  { key: 'it_support', label: 'Support IT', icon: Computer },
  { key: 'pedagogical_counselor', label: 'Conseiller pédagogique', icon: GraduationCap },
  { key: 'administrative_assistant', label: 'Assistant administratif', icon: Briefcase },
  { key: 'studies_director', label: 'Directeur des études', icon: UserCog },
  { key: 'bursar', label: 'Intendant', icon: Wallet },
] as const;

export type StaffRoleKey = (typeof staffRoleOptions)[number]['key'];

export const staffDepartments = [
  'Administration',
  'Finance',
  'Informatique',
  'Bibliothèque',
  'Direction',
  'Intendance',
  'Orientation',
] as const;

export interface Teacher {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  subjectId: string;
  status: UserStatus;
}

export interface Student {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  classId: string;
  class: string;
  status: UserStatus;
  average: number;
  enrollmentYear: string;
  matricule?: string;
  qrCode?: string;
  levelId?: string;
  level?: string;
  parentName: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone: string;
  parentEmail?: string;
  parentUserId?: string;
  academicYearId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  previousSchool?: string;
}

export interface Parent {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  children: number;
  childClassId: string;
  childClass: string;
  status: UserStatus;
  profession: string;
}

export interface Staff {
  id: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  roleId: StaffRoleKey;
  role: string;
  department: string;
  status: UserStatus;
  hireDate: string;
}
