import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { SchoolTypeChart, PlanDistributionChart } from '@/components/dashboard/Charts';
import { superAdminApi, PlatformStatsResponse } from '@/services/superAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { schoolStatusLabels, planLabels, planColors } from '@/types/school';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: stats, error: statsError } = useQuery<PlatformStatsResponse, Error>({
    queryKey: ['super-admin', 'platform-stats'],
    queryFn: superAdminApi.fetchStats,
    retry: false,
  });

  useEffect(() => {
    if (statsError) {
      toast({
        title: 'Impossible de charger les statistiques',
        description: statsError.message || 'Veuillez réessayer',
      });
    }
  }, [statsError, toast]);

  const recentSchools = stats?.recentSchools ?? [];
  const recentActivity = stats?.recentActivity ?? [];
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const totalSchools = stats?.totalSchools ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const activeSchools = stats?.activeSchools ?? 0;
  const suspendedSchools = stats?.suspendedSchools ?? 0;
  const pendingSchools = stats?.pendingSchools ?? 0;
  const planDistribution = stats?.schoolsByPlan ?? {};
  const typeDistribution = stats?.schoolsByType ?? {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenue, {user?.firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de la plateforme EduSphere
          </p>
        </div>
        <Button onClick={() => navigate('/schools')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle École
        </Button>
      </div>

      {/* Stats Grid */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Écoles"
          value={totalSchools}
          icon={Building2}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Élèves Inscrits"
          value={totalStudents}
          icon={GraduationCap}
          variant="default"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Enseignants"
          value={totalTeachers}
          icon={Users}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Revenus Mensuel"
          value={`${(monthlyRevenue / 1000).toFixed(0)}K FCFA`}
          icon={TrendingUp}
          variant="accent"
          trend={{ value: 15, isPositive: true }}
        />
      </StatsGrid>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          <div>
            <p className="text-2xl font-bold">{activeSchools}</p>
            <p className="text-sm text-muted-foreground">Écoles Actives</p>
          </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          <div>
            <p className="text-2xl font-bold">{suspendedSchools}</p>
            <p className="text-sm text-muted-foreground">Écoles Suspendues</p>
          </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          <div>
            <p className="text-2xl font-bold">{pendingSchools}</p>
            <p className="text-sm text-muted-foreground">En Attente</p>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SchoolTypeChart data={typeDistribution} />
        <PlanDistributionChart data={planDistribution} />
      </div>

      {/* Schools Table & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Schools */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Écoles Récentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/schools')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune école récente pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                        {school.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(planColors[school.plan])}>
                        {planLabels[school.plan] ?? school.plan}
                      </Badge>
                      <Badge 
                        variant={school.status === 'active' ? 'default' : 'secondary'}
                        className={cn(
                          school.status === 'active' && 'bg-success text-success-foreground',
                          school.status === 'suspended' && 'bg-destructive text-destructive-foreground',
                          school.status === 'pending' && 'bg-warning text-warning-foreground'
                        )}
                      >
                        {schoolStatusLabels[school.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
