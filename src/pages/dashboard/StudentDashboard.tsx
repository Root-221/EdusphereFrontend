import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { 
  BookOpen,
  Award,
  ClipboardList,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  QrCode
} from 'lucide-react';

// Mock data for the student
const mockStudentData = {
  class: 'Terminale S1',
  academicYear: '2024-2025',
  activeSemester: 'Semestre 2',
  average: 14.5,
  ranking: '5ème/35',
  totalAssignments: 12,
  completedAssignments: 9,
  totalExams: 6,
  passedExams: 5,
  successRate: 83,
};

const recentGrades = [
  { id: '1', subject: 'Mathématiques', grade: 15, max: 20, type: 'Devoir', date: '10/02/2025' },
  { id: '2', subject: 'Français', grade: 14, max: 20, type: 'Composition', date: '08/02/2025' },
  { id: '3', subject: 'Physique', grade: 16, max: 20, type: 'Devoir', date: '05/02/2025' },
  { id: '4', subject: 'Anglais', grade: 17, max: 20, type: 'Oral', date: '03/02/2025' },
];

const upcomingAssignments = [
  { id: '1', subject: 'Mathématiques', title: 'Exercices Chapitre 5', dueDate: '15/02/2025', priority: 'high' },
  { id: '2', subject: 'Français', title: 'Dissertation', dueDate: '18/02/2025', priority: 'medium' },
  { id: '3', subject: 'Histoire', title: 'Exposé', dueDate: '20/02/2025', priority: 'low' },
];

const getGradeColor = (grade: number) => {
  if (grade >= 14) return 'text-success';
  if (grade >= 10) return 'text-warning';
  return 'text-destructive';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700';
    case 'medium': return 'bg-yellow-100 text-yellow-700';
    case 'low': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData] = useState(mockStudentData);

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
            Salut, {user?.firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            Bienvenue dans ton espace élève
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {studentData.class}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {studentData.academicYear}
            </Badge>
            <Badge className="bg-primary/20 text-primary gap-1">
              <Clock className="h-3 w-3" />
              {studentData.activeSemester}
            </Badge>
          </div>
        </div>
        
        {/* QR Code Card */}
        <Card className="shadow-lg bg-white">
          <CardContent className="p-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <QrCode className="h-3 w-3" />
                <span>Mon Code</span>
              </div>
              <div className="bg-white p-2 rounded-lg border-2 border-primary/20">
                <QRCode 
                  value={`EDUSPHERE-${user?.id || 'STUDENT'}-${studentData.class}`}
                  size={100}
                  style={{ height: "100px", maxWidth: "100px", width: "100px" }}
                  viewBox={`0 0 100 100`}
                />
              </div>
              <p className="text-xs font-medium text-primary">
                {user?.firstName} {user?.lastName?.[0]}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid - GRID by default */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Moyenne Générale"
          value={`${studentData.average}/20`}
          icon={Award}
          variant="primary"
        />
        <StatsCard
          title="Classement"
          value={studentData.ranking}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Devoirs"
          value={`${studentData.completedAssignments}/${studentData.totalAssignments}`}
          subtitle="terminés"
          icon={ClipboardList}
          variant="default"
        />
        <StatsCard
          title="Taux de Réussite"
          value={`${studentData.successRate}%`}
          icon={BarChart3}
          variant={studentData.successRate >= 80 ? 'success' : 'warning'}
        />
      </StatsGrid>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compositions</p>
                <p className="text-2xl font-bold">{studentData.passedExams}/{studentData.totalExams}</p>
                <p className="text-xs text-muted-foreground">Réussies</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matières</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Inscrites</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absences</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Ce semestre</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades and Upcoming Assignments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Notes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{grade.subject}</p>
                    <p className="text-xs text-muted-foreground">{grade.type} • {grade.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                    <span className="text-muted-foreground">/{grade.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Devoirs à Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

