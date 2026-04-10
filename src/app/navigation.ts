import { UserRole } from '@/types/auth';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  Users, 
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  CreditCard,
  BarChart3,
  Shield,
  School,
  UserCog,
  ClipboardList,
  Award,
  Home,
  LogOut,
  Clock,
  FileBarChart,
  Users2,
  Wallet,
  CalendarDays,
  Layers3,
  ClipboardCheck,
  BookMarked,
  TrendingUp,
  History,
  User,
  UserPlus,
  Warehouse
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationByRole: Record<UserRole, NavGroup[]> = {
  super_admin: [
    {
      label: 'Tableau de bord',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Gestion',
      items: [
        { title: 'Écoles', url: '/schools', icon: Building2 },
        { title: 'Admins École', url: '/school-admins', icon: UserCog },
      ],
    },
    {
      label: 'Analyse',
      items: [
        { title: 'Statistiques', url: '/stats', icon: BarChart3 },
        { title: 'Rapports', url: '/reports', icon: FileBarChart },
      ],
    },
    {
      label: 'Système',
      items: [
        { title: 'Logs & Audit', url: '/logs', icon: History },
        { title: 'Paramètres', url: '/platform-settings', icon: Settings },
      ],
    },
  ],
  school_admin: [
    {
      label: 'Tableau de bord',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Académique',
      items: [
        { title: 'Années Scolaires', url: '/academic-years', icon: Calendar },
        { title: 'Niveaux', url: '/levels', icon: Layers3 },
        { title: 'Semestres', url: '/semesters', icon: Clock },
        { title: 'Classes', url: '/classes', icon: School },
        { title: 'Matières', url: '/subjects', icon: BookOpen },
        { title: 'Emplois du Temps', url: '/timetables', icon: CalendarDays },
      ],
    },
    {
      label: 'Pédagogie',
      items: [
        { title: 'Cahier de Texte', url: '/school-lesson-logs', icon: BookMarked },
        { title: 'Présences', url: '/school-attendance', icon: ClipboardCheck },
        { title: 'Évaluations', url: '/school-evaluations', icon: ClipboardList },
        { title: 'Bulletins', url: '/school-bulletins', icon: Award },
      ],
    },
    {
      label: 'Infrastructure',
      items: [
        { title: 'Infrastructure', url: '/infrastructure', icon: Warehouse },
      ],
    },
    {
      label: 'Personnel',
      items: [
        { title: 'Enseignants', url: '/teachers', icon: Users },
        { title: 'Élèves', url: '/students', icon: GraduationCap },
        { title: 'Parents', url: '/parents', icon: Home },
      ],
    },
    {
      label: 'Administration',
      items: [
        { title: 'Inscriptions', url: '/enrollments', icon: UserPlus },
        { title: 'Rapports', url: '/reports', icon: FileBarChart },
        { title: 'Paramètres', url: '/settings', icon: Settings },
      ],
    },
  ],
  teacher: [
    {
      label: 'Tableau de bord',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Enseignement',
      items: [
        { title: 'Mes Classes', url: '/my-classes', icon: School },
        { title: 'Emploi du Temps', url: '/my-timetable', icon: CalendarDays },
        { title: 'Cahier de Texte', url: '/lesson-logs', icon: BookMarked },
        { title: 'Présences', url: '/teacher-attendance', icon: ClipboardCheck },
        { title: 'Évaluations', url: '/evaluations', icon: ClipboardList },
      ],
    },
    {
      label: 'Analyse',
      items: [
        { title: 'Historique', url: '/history', icon: BarChart3 },
      ],
    },
    {
      label: 'Communication',
      items: [
        { title: 'Messagerie', url: '/messages', icon: MessageSquare },
      ],
    },
  ],
  student: [
    {
      label: 'Accueil',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Scolarité',
      items: [
        { title: 'Devoirs', url: '/my-assignments', icon: ClipboardList },
        { title: 'Compositions', url: '/my-exams', icon: FileText },
        { title: 'Mes Notes', url: '/my-grades', icon: Award },
        { title: 'Bulletins', url: '/my-bulletins', icon: BookMarked },
        { title: 'Emploi du Temps', url: '/timetable', icon: CalendarDays },
      ],
    },
    {
      label: 'Historique',
      items: [
        { title: 'Historique', url: '/academic-history', icon: History },
        { title: 'Présence', url: '/attendance', icon: ClipboardCheck },
        { title: 'Paiements', url: '/my-payments', icon: Wallet },
      ],
    },
    {
      label: 'Informations',
      items: [
        { title: 'Notifications', url: '/notifications', icon: Bell },
      ],
    },
  ],
  parent: [
    {
      label: 'Accueil',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Mes Enfants',
      items: [
        { title: 'Mes Enfants', url: '/children', icon: Users2 },
        { title: 'Notes', url: '/children-grades', icon: Award },
        { title: 'Bulletins', url: '/children-bulletins', icon: BookMarked },
        { title: 'Emploi du Temps', url: '/children-timetable', icon: CalendarDays },
        { title: 'Présence', url: '/children-attendance', icon: ClipboardCheck },
      ],
    },
    {
      label: 'Services',
      items: [
        { title: 'Paiements', url: '/payments', icon: Wallet },
        { title: 'Notifications', url: '/notifications', icon: Bell },
      ],
    },
  ],
  accountant: [
    {
      label: 'Tableau de bord',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Finances',
      items: [
        { title: 'Paiements', url: '/accountant-payments', icon: CreditCard },
        { title: 'Scolarité', url: '/tuition', icon: FileText },
        { title: 'Rapports', url: '/financial-reports', icon: BarChart3 },
      ],
    },
  ],
};

// Mobile navigation items (simplified bottom nav)
export const mobileNavItems: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; href: string }[]> = {
  student: [
    { label: 'Accueil', icon: Home, href: '/dashboard' },
    { label: 'EDT', icon: CalendarDays, href: '/timetable' },
    { label: 'Devoirs', icon: ClipboardList, href: '/my-assignments' },
    { label: 'Notes', icon: Award, href: '/my-grades' },
    { label: 'Profil', icon: User, href: '/profile' },
  ],
  parent: [
    { label: 'Accueil', icon: Home, href: '/dashboard' },
    { label: 'Enfants', icon: Users2, href: '/children' },
    { label: 'EDT', icon: CalendarDays, href: '/children-timetable' },
    { label: 'Paiements', icon: CreditCard, href: '/payments' },
    { label: 'Profil', icon: User, href: '/parent-profile' },
  ],
  super_admin: [],
  school_admin: [],
  teacher: [],
  accountant: [],
};
