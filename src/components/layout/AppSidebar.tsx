import React from 'react';
import { 
  LayoutDashboard, 
  Building2,
  Settings, 
  Users, 
  Users2,
  GraduationCap,
  BookOpen,
  Calendar,
  CalendarDays,
  Layers3,
  FileText,
  MessageSquare,
  Bell,
  CreditCard,
  BarChart3,
  Shield,
  School,
  UserCog,
  ClipboardList,
  ClipboardCheck,
  Award,
  Home,
  LogOut,
  ChevronLeft,
  ChevronDown,
  User,
  History,
  UserPlus,
  BookMarked,
  Warehouse
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels } from '@/types/auth';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label?: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isMain?: boolean;
  items?: NavItem[];
}

// Navigation configurations for each role with collapsible sections
const navigationConfig: Record<UserRole, NavSection[]> = {
  super_admin: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Gestion',
      icon: Building2,
      items: [
        { title: 'Écoles', url: '/schools', icon: Building2 },
        { title: 'Admins École', url: '/school-admins', icon: UserCog },
      ],
    },
    {
      label: 'Analyse',
      icon: BarChart3,
      items: [
        { title: 'Statistiques', url: '/stats', icon: BarChart3 },
        { title: 'Rapports', url: '/reports', icon: FileText },
      ],
    },
    {
      label: 'Système',
      icon: Shield,
      items: [
        { title: 'Sécurité', url: '/logs', icon: History },
        { title: 'Paramètres', url: '/platform-settings', icon: Settings },
      ],
    },
  ],
  school_admin: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Académie',
      icon: Calendar,
      items: [
        { title: 'Années scolaires', url: '/academic-years', icon: Calendar },
        { title: 'Niveaux', url: '/levels', icon: Layers3 },
        { title: 'Semestres', url: '/semesters', icon: CalendarDays },
        { title: 'Classes', url: '/classes', icon: School },
        { title: 'Matières', url: '/subjects', icon: BookOpen },
        { title: 'Emplois du Temps', url: '/timetables', icon: CalendarDays },
      ],
    },
    {
      label: 'Pédagogie',
      icon: ClipboardList,
      items: [
        { title: 'Cahier de Texte', url: '/school-lesson-logs', icon: BookMarked },
        { title: 'Évaluations', url: '/school-evaluations', icon: ClipboardList },
        { title: 'Bulletins', url: '/bulletins', icon: Award },
      ],
    },
    {
      label: 'Infrastructure',
      icon: Warehouse,
      items: [
        { title: 'Infrastructure', url: '/infrastructure', icon: Warehouse },
      ],
    },
    {
      label: 'Utilisateurs',
      icon: Users,
      items: [
        { title: 'Enseignants', url: '/teachers', icon: Users },
        { title: 'Élèves', url: '/students', icon: GraduationCap },
        { title: 'Parents', url: '/parents', icon: Home },
        { title: 'Personnel', url: '/staff', icon: UserCog },
      ],
    },
    {
      label: 'Administration',
      icon: Settings,
      items: [
        { title: 'Inscriptions', url: '/enrollments', icon: UserPlus },
        { title: 'Rapports', url: '/reports', icon: FileText },
        { title: 'Paramètres', url: '/settings', icon: Settings },
      ],
    },
  ],
  teacher: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Enseignement',
      icon: School,
      items: [
        { title: 'Mes classes', url: '/my-classes', icon: School },
        { title: 'Emploi du Temps', url: '/my-timetable', icon: CalendarDays },
        { title: 'Cahier de Texte', url: '/lesson-logs', icon: BookMarked },
        { title: 'Présences', url: '/teacher-attendance', icon: ClipboardCheck },
        { title: 'Évaluations', url: '/evaluations', icon: ClipboardList },
        { title: 'Notes', url: '/grades', icon: Award },
      ],
    },
    {
      label: 'Communication',
      icon: MessageSquare,
      items: [
        { title: 'Messagerie', url: '/messages', icon: MessageSquare },
      ],
    },
  ],
  student: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Scolarité',
      icon: GraduationCap,
      items: [
        { title: 'Devoirs', url: '/my-assignments', icon: ClipboardList },
        { title: 'Mes Notes', url: '/my-grades', icon: Award },
        { title: 'Bulletins', url: '/my-bulletins', icon: FileText },
        { title: 'Emploi du Temps', url: '/timetable', icon: CalendarDays },
      ],
    },
    {
      label: 'Communication',
      icon: Bell,
      items: [
        { title: 'Notifications', url: '/notifications', icon: Bell },
        { title: 'Profil', url: '/profile', icon: User },
      ],
    },
  ],
  parent: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Mes Enfants',
      icon: Users2,
      items: [
        { title: 'Mes Enfants', url: '/children', icon: Users2 },
        { title: 'Notes', url: '/children-grades', icon: Award },
        { title: 'Bulletins', url: '/children-bulletins', icon: FileText },
        { title: 'Emploi du Temps', url: '/children-timetable', icon: CalendarDays },
      ],
    },
    {
      label: 'Services',
      icon: CreditCard,
      items: [
        { title: 'Paiements', url: '/payments', icon: CreditCard },
        { title: 'Notifications', url: '/parent-notifications', icon: Bell },
        { title: 'Profil', url: '/parent-profile', icon: User },
      ],
    },
  ],
  accountant: [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, isMain: true },
    {
      label: 'Finances',
      icon: CreditCard,
      items: [
        { title: 'Paiements', url: '/accountant-payments', icon: CreditCard },
        { title: 'Scolarité', url: '/tuition', icon: FileText },
        { title: 'Rapports', url: '/financial-reports', icon: BarChart3 },
      ],
    },
  ],
};

// Get default open sections for each role
const getDefaultOpenSections = (role: UserRole): string[] => {
  const config = navigationConfig[role];
  return config
    .filter(section => section.items && section.items.length > 0)
    .map(section => section.label!)
    .filter(Boolean);
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [openSections, setOpenSections] = React.useState<string[]>(
    user ? getDefaultOpenSections(user.role) : []
  );

  if (!user) return null;

  const navigation = navigationConfig[user.role] || [];
  const firstInitial = user.firstName?.trim()?.[0] ?? '';
  const lastInitial = user.lastName?.trim()?.[0] ?? '';
  const initials = firstInitial || lastInitial ? `${firstInitial}${lastInitial}` : 'ES';

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (label: string) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const renderNavigation = (navConfig: NavSection[]) => {
    return navConfig.map((section, index) => {
      // Main dashboard link
      if (section.isMain) {
        return (
          <SidebarGroup key={index}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={section.url}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(section.url!)}
                    className={cn(
                      "w-full transition-all duration-200",
                      location.pathname === section.url
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    tooltip={isCollapsed ? section.label : undefined}
                  >
                    <section.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{section.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      }

      // Collapsible section
      const isOpen = openSections.includes(section.label!);
      
      return (
        <Collapsible 
          key={section.label} 
          open={isOpen} 
          onOpenChange={() => toggleSection(section.label!)}
          className="group"
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={section.label}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full transition-all duration-200",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      tooltip={isCollapsed ? section.label : undefined}
                    >
                      <section.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span>{section.label}</span>
                          <ChevronDown className={cn("ml-auto h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                <CollapsibleContent>
                  {section.items?.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          onClick={() => handleNavigation(item.url)}
                          className={cn(
                            "w-full transition-all duration-200 ml-2 pl-6",
                            isActive 
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          tooltip={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </CollapsibleContent>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
      );
    });
  };

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-lg font-bold text-sidebar-primary-foreground">E</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground">EduSphere</span>
              <span className="text-xs text-sidebar-muted">{roleLabels[user.role]}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-4 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {renderNavigation(navigation)}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4 bg-sidebar-border" />
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "flex-col"
        )}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                <AlertDialogDescription>
                  Voulez-vous vraiment vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Déconnexion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
