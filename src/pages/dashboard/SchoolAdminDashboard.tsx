import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BookOpen,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Mock data for charts
const studentDistributionData = [
  { name: 'Terminale', value: 180 },
  { name: 'Première', value: 220 },
  { name: 'Seconde', value: 250 },
  { name: 'Troisième', value: 240 },
  { name: 'Quatrième', value: 210 },
  { name: 'Cinquième', value: 150 },
];

const monthlyAttendanceData = [
  { month: 'Oct', attendance: 95 },
  { month: 'Nov', attendance: 92 },
  { month: 'Déc', attendance: 88 },
  { month: 'Jan', attendance: 94 },
  { month: 'Fév', attendance: 91 },
];

const gradesDistributionData = [
  { name: '0-10', value: 45, color: '#ef4444' },
  { name: '10-12', value: 180, color: '#f59e0b' },
  { name: '12-14', value: 350, color: '#22c55e' },
  { name: '14-16', value: 280, color: '#3b82f6' },
  { name: '16-20', value: 145, color: '#8b5cf6' },
];

const recentActivities = [
  { id: 1, type: 'student', action: 'Nouvel élève inscrit', name: 'Moussa Diallo', time: 'Il y a 5 min' },
  { id: 2, type: 'payment', action: 'Paiement reçu', name: 'Fatou Ndiaye - Scolarité', time: 'Il y a 15 min' },
  { id: 3, type: 'grade', action: 'Notes publiées', name: 'Mathématiques - Terminale S1', time: 'Il y a 1h' },
  { id: 4, type: 'teacher', action: 'Nouveau professeur', name: 'M. Ibrahima Sy', time: 'Il y a 2h' },
];

export default function SchoolAdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenue, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Tableau de bord - {user?.schoolName}
        </p>
      </div>

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Élèves"
          value={1250}
          icon={GraduationCap}
          variant="primary"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Enseignants"
          value={85}
          icon={Users}
          variant="default"
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Classes"
          value={42}
          icon={BookOpen}
          variant="default"
        />
        <StatsCard
          title="Moyenne Générale"
          value="13.5/20"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 0.8, isPositive: true }}
        />
      </StatsGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Distribution Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Élèves par Niveau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentDistributionData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(220, 68%, 33%)" radius={[0, 4, 4, 0]} name="Élèves" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grades Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribution des Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradesDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {gradesDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {gradesDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Taux de Présence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAttendanceData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="hsl(142, 72%, 42%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(142, 72%, 42%)', r: 5 }}
                    name="Présence %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Year Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Année Scolaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5">
                <div>
                  <p className="font-semibold">2024-2025</p>
                  <p className="text-sm text-muted-foreground">Année en cours</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Semestre 1</p>
                  <p className="font-medium">Oct - Fév</p>
                  <Badge variant="secondary" className="mt-1">Terminé</Badge>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Semestre 2</p>
                  <p className="font-medium">Mars - Juin</p>
                  <Badge variant="default" className="mt-1">En cours</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Aperçu Financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Total Collecté</p>
                  <p className="text-2xl font-bold text-green-600">45.2M</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">En Attente</p>
                  <p className="text-2xl font-bold text-orange-600">8.5M</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Taux de Paiement</p>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: '84%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">84% des élèves ont payé</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <DollarSign className="h-4 w-4" />
                Voir les Finances
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nouvel Élève', icon: GraduationCap, color: 'text-primary' },
                { label: 'Nouvelle Classe', icon: BookOpen, color: 'text-primary' },
                { label: 'Ajouter Enseignant', icon: Users, color: 'text-primary' },
                { label: 'Générer Bulletins', icon: FileText, color: 'text-primary' },
                { label: 'Paiements', icon: DollarSign, color: 'text-green-600' },
                { label: 'Rapports', icon: Activity, color: 'text-blue-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-primary/5 hover:border-primary transition-colors"
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'student' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'grade' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

