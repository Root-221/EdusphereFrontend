import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  CalendarDays,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Mock attendance data
const mockAttendance = [
  { id: '1', date: '14/02/2025', day: 'Vendredi', status: 'present', subject: 'Mathématiques', hours: 2 },
  { id: '2', date: '13/02/2025', day: 'Jeudi', status: 'present', subject: 'Français', hours: 2 },
  { id: '3', date: '12/02/2025', day: 'Mercredi', status: 'present', subject: 'Histoire', hours: 2 },
  { id: '4', date: '11/02/2025', day: 'Mardi', status: 'absent', subject: 'Physique', hours: 2, justification: 'Maladie' },
  { id: '5', date: '10/02/2025', day: 'Lundi', status: 'present', subject: 'Anglais', hours: 1 },
  { id: '6', date: '07/02/2025', day: 'Vendredi', status: 'present', subject: 'SVT', hours: 2 },
  { id: '7', date: '06/02/2025', day: 'Jeudi', status: 'present', subject: 'Philosophie', hours: 2 },
  { id: '8', date: '05/02/2025', day: 'Mercredi', status: 'late', subject: 'Mathématiques', hours: 2, delayMinutes: 15 },
  { id: '9', date: '04/02/2025', day: 'Mardi', status: 'present', subject: 'Français', hours: 2 },
  { id: '10', date: '03/02/2025', day: 'Lundi', status: 'present', subject: 'Physique', hours: 2 },
  { id: '11', date: '31/01/2025', day: 'Vendredi', status: 'present', subject: 'Histoire', hours: 2 },
  { id: '12', date: '30/01/2025', day: 'Jeudi', status: 'absent', subject: 'Anglais', hours: 1, justification: 'Rendez-vous médical' },
  { id: '13', date: '29/01/2025', day: 'Mercredi', status: 'present', subject: 'Mathématiques', hours: 2 },
  { id: '14', date: '28/01/2025', day: 'Mardi', status: 'present', subject: 'SVT', hours: 2 },
  { id: '15', date: '27/01/2025', day: 'Lundi', status: 'present', subject: 'Français', hours: 2 },
];

const months = ['Tous les mois', 'Février 2025', 'Janvier 2025', 'Décembre 2024', 'Novembre 2024'];
const semesters = ['Semestre 2', 'Semestre 1'];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'present':
      return { 
        label: 'Présent', 
        icon: <CheckCircle className="h-4 w-4 text-success" />,
        badge: <Badge className="bg-success/20 text-success">Présent</Badge>
      };
    case 'absent':
      return { 
        label: 'Absent', 
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        badge: <Badge className="bg-destructive/20 text-destructive">Absent</Badge>
      };
    case 'late':
      return { 
        label: 'Retard', 
        icon: <AlertCircle className="h-4 w-4 text-warning" />,
        badge: <Badge className="bg-warning/20 text-warning">Retard</Badge>
      };
    default:
      return { 
        label: status, 
        icon: <Clock className="h-4 w-4 text-muted-foreground" />,
        badge: <Badge variant="outline">{status}</Badge>
      };
  }
};

export default function StudentAttendance() {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Semestre 2');

  // Calculate stats
  const totalRecords = mockAttendance.length;
  const presentCount = mockAttendance.filter(a => a.status === 'present').length;
  const absentCount = mockAttendance.filter(a => a.status === 'absent').length;
  const lateCount = mockAttendance.filter(a => a.status === 'late').length;
  const attendanceRate = Math.round((presentCount / totalRecords) * 100);

  // Filter attendance
  const filteredAttendance = mockAttendance;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Ma Présence</h1>
        <p className="text-sm text-muted-foreground">
          Historique de votre présence en cours
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de présence</p>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Présences</p>
                <p className="text-2xl font-bold text-success">{presentCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absences</p>
                <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retards</p>
                <p className="text-2xl font-bold text-warning">{lateCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres</span>
            </div>
            <div className="flex gap-3 flex-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month === 'Tous les mois' ? 'all' : month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <div className="space-y-2">
        {filteredAttendance.map((record) => {
          const statusInfo = getStatusInfo(record.status);
          return (
            <Card key={record.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      record.status === 'present' ? 'bg-success/10' : 
                      record.status === 'absent' ? 'bg-destructive/10' : 'bg-warning/10'
                    }`}>
                      {statusInfo.icon}
                    </div>
                    <div>
                      <p className="font-medium">{record.subject}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <span>{record.day} {record.date}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{record.hours}h</span>
                      </div>
                      {record.justification && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Justification: {record.justification}
                        </p>
                      )}
                      {record.delayMinutes && (
                        <p className="text-xs text-warning mt-1">
                          Retard de {record.delayMinutes} minutes
                        </p>
                      )}
                    </div>
                  </div>
                  {statusInfo.badge}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

