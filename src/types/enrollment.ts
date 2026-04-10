// Types for Enrollment Management

export type EnrollmentType = 'new' | 're_enrollment';

export type EnrollmentStatus = 'draft' | 'pending_payment' | 'paid' | 'confirmed' | 'cancelled';

export type PaymentMethod = 'cash' | 'wave' | 'orange_money' | 'transfer';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type AdministrativeStatus = 'pending' | 'completed' | 'verified';

export type PedagogicalStatus = 'pending' | 'completed' | 'assigned';

// Enrollment Period for planning inscriptions
export interface EnrollmentPeriod {
  id: string;
  name: string;
  type: EnrollmentType;
  academicYear: string;
  academicYearId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxEnrollments?: number;
  description?: string;
}

// Student Information for enrollment
export interface EnrollmentStudentInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  previousSchool?: string;
  previousClass?: string;
  matricule?: string;
  qrCode?: string;
  parentEmail?: string;
  parentUserId?: string;
}

// Parent Information for enrollment
export interface EnrollmentParentInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession?: string;
  address?: string;
  isGuardian: boolean;
  userId?: string;
}

// Class assignment
export interface EnrollmentClassAssignment {
  classId: string;
  className: string;
  capacity: number;
  currentStudents: number;
}

// Payment Information
export interface EnrollmentPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  collectedBy?: string;
  notes?: string;
  receiptNumber?: string;
}

// Main Enrollment
export interface Enrollment {
  id: string;
  enrollmentNumber: string;
  receiptNumber?: string;
  type: EnrollmentType;
  status: EnrollmentStatus;
  academicYear: string;
  academicYearId?: string;
  periodId: string;
  period?: {
    id: string;
    name: string;
    type: EnrollmentType;
    academicYear: string;
  };
  matricule?: string;
  qrCode?: string;
  semesterId?: string;
  classId?: string;
  levelId?: string;
  level?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  
  // Administrative
  administrativeStatus: AdministrativeStatus;
  studentInfo: EnrollmentStudentInfo;
  parentInfo: EnrollmentParentInfo;
  
  // Pedagogical
  pedagogicalStatus: PedagogicalStatus;
  classAssignment?: EnrollmentClassAssignment;
  selectedSubjects?: string[];
  
  // Payment
  payment: EnrollmentPayment;
  
  // Student ID (for re-enrollment)
  existingStudentId?: string;
}

// Fee Structure
export interface EnrollmentFee {
  id: string;
  name: string;
  description?: string;
  amount: number;
  isRequired: boolean;
  category: 'registration' | 'tuition' | 'material' | 'transport' | 'canteen' | 'other';
  academicYear: string;
}

// Fee Package for a class
export interface ClassFeePackage {
  id: string;
  classId: string;
  className: string;
  fees: EnrollmentFee[];
  totalAmount: number;
}

// Helper functions
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString() + ' CFA';
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    cash: 'Espèces',
    wave: 'Wave',
    orange_money: 'Orange Money',
    transfer: 'Virement',
  };
  return labels[method];
};

export const getEnrollmentStatusLabel = (status: EnrollmentStatus): string => {
  const labels: Record<EnrollmentStatus, string> = {
    draft: 'Brouillon',
    pending_payment: 'En attente de paiement',
    paid: 'Payé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé'
  };
  return labels[status];
};

export const getEnrollmentTypeLabel = (type: EnrollmentType): string => {
  return type === 'new' ? 'Nouvelle inscription' : 'Réinscription';
};
