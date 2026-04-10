import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppLayoutProps {
  children: ReactNode;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/schools': 'Gestion des Écoles',
  '/school-admins': 'Admins École',
  '/stats': 'Statistiques',
  '/reports': 'Rapports',
  '/security': 'Sécurité',
  '/settings': 'Paramètres',
  '/academic-years': 'Années Scolaires',
  '/semesters': 'Semestres',
  '/classes': 'Classes',
  '/subjects': 'Matières',
  '/teachers': 'Enseignants',
  '/students': 'Élèves',
  '/parents': 'Parents',
  '/school-evaluations': 'Évaluations',
  '/infrastructure': 'Infrastructure',
  '/staff': 'Personnel',
  '/school-lesson-logs': 'Cahier de Texte',
  '/school-attendance': 'Présences',
  '/school-reports': 'Rapports',
  '/enrollments': 'Inscriptions',
  '/timetables': 'Emplois du Temps',
  '/evaluations': 'Évaluations',
  '/grades': 'Notes',
  '/bulletins': 'Bulletins',
  '/my-classes': 'Mes Classes',
  '/my-assignments': 'Mes Devoirs',
  '/my-grades': 'Mes Notes',
  '/my-bulletins': 'Mes Bulletins',
  '/my-timetable': 'Mon Emploi du Temps',
  '/timetable': 'Emploi du Temps',
  '/messages': 'Messagerie',
  '/notifications': 'Notifications',
  '/payments': 'Paiements',
  '/children': 'Mes Enfants',
  '/children-grades': 'Notes Enfants',
  '/children-bulletins': 'Bulletins Enfants',
  '/children-timetable': 'Emploi du Temps Enfants',
  '/children-payments': 'Paiements Enfants',
  '/profile': 'Mon Profil',
  '/logs': 'Logs & Audit',
  '/platform-settings': 'Paramètres Plateforme',
};

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentTitle = routeTitles[location.pathname] || 'Page';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-6 shadow-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher..." 
                  className="w-64 pl-10 bg-secondary border-0 focus-visible:ring-primary"
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  3
                </span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
