import { useAuth } from '@/contexts/AuthContext';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen,
  ClipboardList,
  Users,
  Award
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const myClasses = [
    { id: 1, name: 'Terminale S1', subject: 'Mathématiques', students: 35 },
    { id: 2, name: 'Terminale S2', subject: 'Mathématiques', students: 32 },
    { id: 3, name: '1ère S1', subject: 'Mathématiques', students: 38 },
  ];

  const pendingTasks = [
    { id: 1, task: 'Corriger devoir Terminale S1', due: 'Demain' },
    { id: 2, task: 'Saisir notes composition', due: 'Dans 3 jours' },
    { id: 3, task: 'Préparer cours Géométrie', due: 'Lundi' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Voici votre espace enseignant
        </p>
      </div>

      <StatsGrid columns={4}>
        <StatsCard
          title="Mes Classes"
          value={3}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Total Élèves"
          value={105}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Devoirs en cours"
          value={5}
          icon={ClipboardList}
          variant="default"
        />
        <StatsCard
          title="Moyenne Classes"
          value="12.8/20"
          icon={Award}
          variant="success"
        />
      </StatsGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Mes Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                      {cls.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">{cls.subject}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{cls.students} élèves</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Tâches en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="h-4 w-4 rounded border-input" />
                    <span className="text-sm">{task.task}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.due}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
