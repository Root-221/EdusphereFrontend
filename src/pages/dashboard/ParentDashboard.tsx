import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { parentApi, type ParentProfile } from '@/lib/api-parent';
import { 
  GraduationCap,
  Award,
  Bell,
  Calendar,
  Wallet,
  CheckCircle,
  ChevronRight,
  Loader2,
  Users,
} from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}

const getGradeColor = (average: number) => {
  if (average >= 14) return 'text-success';
  if (average >= 10) return 'text-warning';
  return 'text-destructive';
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await parentApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch parent profile:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <EmptyState message={error || 'Aucune donnée disponible'} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const familyAverage = profile.children.length > 0
    ? (profile.children.reduce((acc, c) => acc + c.average, 0) / profile.children.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Bienvenue dans votre espace parent
        </p>
      </div>

      {/* Stats */}
      <StatsGrid columns={3}>
        <StatsCard
          title="Enfants Inscrits"
          value={profile.children.length}
          icon={GraduationCap}
          variant="primary"
        />
        <StatsCard
          title="Moyenne Famille"
          value={`${familyAverage}/20`}
          icon={Award}
          variant={Number(familyAverage) >= 14 ? 'success' : 'default'}
        />
        <StatsCard
          title="Enfants"
          value={`${profile.profile.childrenCount}`}
          icon={Users}
          variant="default"
        />
      </StatsGrid>

      {/* Children Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Mes Enfants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.children.length === 0 ? (
            <EmptyState message="Aucun enfant enregistré" />
          ) : (
            <div className="space-y-4">
              {profile.children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 rounded-lg border hover:shadow-card-hover transition-all cursor-pointer"
                  onClick={() => navigate('/children')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {child.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{child.firstName} {child.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {child.class?.name || 'Classe non assignée'}
                          {child.class?.level && ` - ${child.class.level}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Moyenne</p>
                      <p className={`text-lg font-bold ${getGradeColor(child.average)}`}>
                        {child.average > 0 ? `${child.average.toFixed(1)}/20` : '-/20'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Matricule</p>
                      <p className="text-lg font-medium">{child.matricule || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/children-grades?childId=${child.id}`);
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
                        navigate(`/children-timetable?childId=${child.id}`);
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      EDT
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <Button 
              className="w-full gap-2" 
              onClick={() => navigate('/payments')}
            >
              <Wallet className="h-4 w-4" />
              Voir les paiements
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <Button 
              variant="outline"
              className="w-full gap-2" 
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}