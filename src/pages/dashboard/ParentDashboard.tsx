import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap,
  Award,
  FileText,
  Bell,
  Calendar,
  Wallet,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

// Mock data
const children = [
  { 
    id: '1',
    name: 'Oumar Fall', 
    class: 'Terminale S1', 
    average: 14.5,
    rank: 5,
    totalStudents: 35,
    attendance: 92
  },
  { 
    id: '2',
    name: 'Aïssatou Fall', 
    class: '3ème A', 
    average: 16.2,
    rank: 2,
    totalStudents: 40,
    attendance: 96
  },
];

const notifications = [
  { id: 1, message: 'Réunion parents-professeurs le 15 janvier', time: 'Il y a 2h', type: 'event', unread: true },
  { id: 2, message: 'Bulletin du 1er semestre disponible', time: 'Hier', type: 'academic', unread: true },
  { id: 3, message: 'Échéance paiement scolarité - 25,000 CFA', time: 'Il y a 3 jours', type: 'payment', unread: false },
];

const recentPayments = [
  { id: '1', title: 'Scolarité - Janvier 2025', status: 'paid', amount: '25,000' },
  { id: '2', title: 'Scolarité - Février 2025', status: 'pending', amount: '25,000' },
];

const academicYear = '2024-2025';

const getGradeColor = (average: number) => {
  if (average >= 14) return 'text-success';
  if (average >= 10) return 'text-warning';
  return 'text-destructive';
};

const getPaymentStatusInfo = (status: string) => {
  switch (status) {
    case 'paid':
      return { icon: <CheckCircle className="h-4 w-4 text-success" />, label: 'Payé' };
    case 'pending':
      return { icon: <Clock className="h-4 w-4 text-warning" />, label: 'En attente' };
    case 'overdue':
      return { icon: <AlertCircle className="h-4 w-4 text-destructive" />, label: 'En retard' };
    default:
      return { icon: <Clock className="h-4 w-4 text-muted-foreground" />, label: status };
  }
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Calculate family average
  const familyAverage = (children.reduce((acc, c) => acc + c.average, 0) / children.length).toFixed(1);
  
  // Calculate average attendance
  const avgAttendance = Math.round(children.reduce((acc, c) => acc + c.attendance, 0) / children.length);
  
  // Pending payments
  const pendingPayments = recentPayments.filter(p => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((acc, p) => acc + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenue, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Année académique {academicYear}
        </p>
      </div>

      <StatsGrid columns={3}>
        <StatsCard
          title="Enfants Inscrits"
          value={children.length}
          icon={GraduationCap}
          variant="primary"
        />
        <StatsCard
          title="Moyenne Famille"
          value={`${familyAverage}/20`}
          icon={Award}
          variant="success"
        />
        <StatsCard
          title="Taux de Présence"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          variant="accent"
        />
      </StatsGrid>

      {/* Payment Status Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Statut des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Solde dû</p>
              <p className="text-2xl font-bold text-warning">{pendingAmount.toLocaleString()} CFA</p>
            </div>
            <Button onClick={() => navigate('/payments')}>
              Voir les paiements
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Mes Enfants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 rounded-lg border hover:shadow-card-hover transition-all cursor-pointer"
                  onClick={() => navigate('/children')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {child.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.class}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Moyenne</p>
                      <p className={`text-lg font-bold ${getGradeColor(child.average)}`}>{child.average}/20</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Présence</p>
                      <p className="text-lg font-bold">{child.attendance}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/children-grades');
                      }}
                    >
                      <Award className="h-4 w-4" />
                      Notes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/children-bulletins');
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Bulletin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    notif.unread ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => navigate('/notifications')}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    notif.type === 'event' ? 'bg-primary/10' :
                    notif.type === 'academic' ? 'bg-success/10' :
                    'bg-warning/10'
                  }`}>
                    {notif.type === 'event' ? <Calendar className="h-4 w-4 text-primary" /> :
                     notif.type === 'academic' ? <FileText className="h-4 w-4 text-success" /> :
                     <Wallet className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {notif.unread && <Badge variant="default" className="text-xs">Nouveau</Badge>}
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/notifications')}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

