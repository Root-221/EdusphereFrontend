import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const stats = {
  totalSchools: 45,
  activeSchools: 42,
  totalStudents: 12500,
  totalTeachers: 850,
  totalParents: 10200,
  avgSatisfaction: 4.2,
};

const monthlyData = [
  { month: 'Jan', schools: 38, students: 11000 },
  { month: 'Fév', schools: 40, students: 11500 },
  { month: 'Mar', schools: 42, students: 12000 },
  { month: 'Avr', schools: 43, students: 12200 },
  { month: 'Mai', schools: 44, students: 12400 },
  { month: 'Juin', schools: 45, students: 12500 },
];

export default function PlatformStats() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistiques Plateforme</h1>
        <p className="text-muted-foreground">
          Aperçu global des performances d'EduSphere
        </p>
      </div>

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Écoles"
          value={stats.totalSchools}
          icon={Building2}
          variant="primary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Élèves Total"
          value={stats.totalStudents.toLocaleString()}
          icon={GraduationCap}
          variant="default"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Enseignants"
          value={stats.totalTeachers}
          icon={Users}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Parents Connectés"
          value={stats.totalParents.toLocaleString()}
          icon={TrendingUp}
          variant="accent"
          trend={{ value: 15, isPositive: true }}
        />
      </StatsGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{data.month}</span>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-muted-foreground">{data.schools} écoles</span>
                    <span className="font-semibold">{data.students.toLocaleString()} élèves</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Taux de Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{stats.avgSatisfaction}</span>
                </div>
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-primary"
                    strokeDasharray="352"
                    strokeDashoffset="140"
                  />
                </svg>
              </div>
              <p className="mt-4 text-muted-foreground">Note moyenne sur 5</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
