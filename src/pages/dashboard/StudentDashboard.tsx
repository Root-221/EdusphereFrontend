import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi, type StudentProfile, type StudentTimetable } from '@/lib/api-student';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import QRCode from 'react-qr-code';
import { 
  BookOpen,
  Calendar,
  Clock,
  QrCode as QrCodeIcon,
  Loader2,
  School,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { DAYS_OF_WEEK } from '@/types/timetable';

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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [timetable, setTimetable] = useState<StudentTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const weekStartDate = startOfWeek.toISOString().split('T')[0];

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, timetableData] = await Promise.all([
          studentApi.getProfile(),
          studentApi.getTimetable(weekStartDate),
        ]);
        setProfile(profileData);
        setTimetable(timetableData);
      } catch (err) {
        console.error('Failed to fetch student data:', err);
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

  const qrCodeValue = profile.profile.qrCode || profile.profile.matricule || `${user?.id}`;

  return (
    <div className="space-y-6">
      {/* Header with student info and QR Code */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-lg">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            Bienvenue dans ton espace élève
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.class && (
              <Badge variant="secondary" className="gap-1">
                <School className="h-3 w-3" />
                {profile.class.name}
                {profile.class.level && <span className="text-muted-foreground"> - {profile.class.level}</span>}
              </Badge>
            )}
            {profile.academicYear && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {profile.academicYear.name}
              </Badge>
            )}
            {profile.semester && (
              <Badge className="bg-primary/20 text-primary gap-1">
                <Clock className="h-3 w-3" />
                {profile.semester.name}
              </Badge>
            )}
          </div>
        </div>
        
        {/* QR Code Card */}
        <Card className="shadow-lg bg-white">
          <CardContent className="p-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <QrCodeIcon className="h-3 w-3" />
                <span>Mon Code</span>
              </div>
              <div className="bg-white p-2 rounded-lg border-2 border-primary/20">
                <QRCode 
                  value={qrCodeValue}
                  size={100}
                  style={{ height: "100px", maxWidth: "100px", width: "100px" }}
                  viewBox={`0 0 100 100`}
                />
              </div>
              <p className="text-xs font-medium text-primary">
                {profile.profile.matricule || `${user?.firstName} ${user?.lastName?.[0]}.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <StatsGrid columns={3}>
        <StatsCard
          title="Matricule"
          value={profile.profile.matricule || '-'}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Année Scolaire"
          value={profile.academicYear?.name || '-'}
          icon={Calendar}
          variant="primary"
        />
        <StatsCard
          title="Semestre"
          value={profile.semester?.name || '-'}
          icon={Clock}
          variant="default"
        />
      </StatsGrid>

      {/* Timetable Preview */}
      {timetable && timetable.entries.length > 0 && (() => {
        const getDayName = (dateStr: string): string => {
          const date = new Date(dateStr);
          const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          return days[date.getDay()];
        };

        const entriesByDay = timetable.entries.reduce((acc, entry) => {
          const dayName = entry.date ? getDayName(entry.date) : entry.dayOfWeek;
          if (!acc[dayName]) {
            acc[dayName] = [];
          }
          acc[dayName].push(entry);
          return acc;
        }, {} as Record<string, typeof timetable.entries>);

        const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const sortedDays = Object.keys(entriesByDay).sort((a, b) => 
          dayOrder.indexOf(a) - dayOrder.indexOf(b)
        );

        return (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mon Emploi du Temps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedDays.map((day) => {
                  const dayEntries = entriesByDay[day];
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={day} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{day}</span>
                        <Badge variant="secondary">{dayEntries.length} cours</Badge>
                      </div>
                      <div className="space-y-2">
                        {dayEntries.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-primary">{entry.subject.name}</span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {entry.startTime} - {entry.endTime}
                            </span>
                          </div>
                        ))}
                        {dayEntries.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{dayEntries.length - 3} autres cours
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {timetable.entries.length === 0 && (
                <EmptyState message="Aucun cours prévu pour le moment" />
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Parent Info */}
      {(profile.profile.parentName || profile.profile.parentPhone) && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informations Parentales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.profile.parentName && (
                <div>
                  <p className="text-sm text-muted-foreground">Nom du parent/tuteur</p>
                  <p className="font-medium">{profile.profile.parentName}</p>
                </div>
              )}
              {profile.profile.parentPhone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile.profile.parentPhone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}