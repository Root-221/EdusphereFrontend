
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  Search,
  Download,
  FileSpreadsheet,
  BarChart3,
  BookOpen,
  User
} from 'lucide-react';
import { mockAttendanceRecords, mockStudentsWithQR } from '@/data/mockAttendance';

// Mock classes data
const mockClasses = [
  { id: 'c10', name: '5ème A' },
  { id: 'c11', name: '4ème B' },
  { id: 'c12', name: '3ème C' },
];

// Mock subjects data
const mockSubjects = [
  { id: 's1', name: 'Français' },
  { id: 's2', name: 'Mathématiques' },
  { id: 's3', name: 'Sciences' },
  { id: 's4', name: 'Histoire-Géo' },
  { id: 's5', name: 'Anglais' },
  { id: 's6', name: 'Physique' },
];

export default function SchoolAttendance() {
  const [selectedDate, setSelectedDate] = useState<string>('2025-04-20');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return mockAttendanceRecords.filter(record => {
      const matchDate = record.date === selectedDate;
      const matchClass = selectedClass === 'all' || record.classId === selectedClass;
      const matchSubject = selectedSubject === 'all' || record.subjectId === selectedSubject;
      return matchDate && matchClass && matchSubject;
    });
  }, [selectedDate, selectedClass, selectedSubject]);

  // Get all unique dates from mock data
  const availableDates = useMemo(() => {
    const dates = [...new Set(mockAttendanceRecords.map(r => r.date))];
    return dates.sort().reverse();
  }, []);

  // Calculate overall stats
  const stats = useMemo(() => {
    const allRecords = filteredRecords.flatMap(r => r.records);
    return {
      total: allRecords.length,
      present: allRecords.filter(r => r.status === 'present').length,
      absent: allRecords.filter(r => r.status === 'absent').length,
      late: allRecords.filter(r => r.status === 'late').length,
      excused: allRecords.filter(r => r.status === 'excused').length,
    };
  }, [filteredRecords]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': 
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Présent</Badge>;
      case 'absent': 
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Absent</Badge>;
      case 'late': 
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="h-3 w-3 mr-1" /> Retard</Badge>;
      case 'excused': 
        return <Badge className="bg-blue-500 hover:bg-blue-600"><UserCheck className="h-3 w-3 mr-1" /> Excusé</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Présences</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des présences - {formatDate(selectedDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner une date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>
                      {formatDate(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {mockClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {mockSubjects.map(subj => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un élève..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Présents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.present}</div>
            <p className="text-xs text-green-600">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Absents</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
            <p className="text-xs text-red-600">
              {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Retards</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.late}</div>
            <p className="text-xs text-yellow-600">
              {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Excusés</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.excused}</div>
            <p className="text-xs text-blue-600">
              {stats.total > 0 ? Math.round((stats.excused / stats.total) * 100) : 0}%
            </p>
          .total) * </CardContent>
        </Card>
      </div>

      {/* Attendance by Class */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map(record => {
          const classStats = {
            present: record.records.filter(r => r.status === 'present').length,
            absent: record.records.filter(r => r.status === 'absent').length,
            late: record.records.filter(r => r.status === 'late').length,
            excused: record.records.filter(r => r.status === 'excused').length,
          };
          
          return (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{record.className}</CardTitle>
                  <Badge variant="outline">{record.subjectName}</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {record.teacherName || 'Enseignant'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Présents</span>
                    <span className="font-medium text-green-600">{classStats.present}/{record.records.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(classStats.present / record.records.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-green-50 rounded">
                      <p className="font-bold text-green-700">{classStats.present}</p>
                      <p className="text-green-600">Présents</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="font-bold text-red-700">{classStats.absent}</p>
                      <p className="text-red-600">Absents</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <p className="font-bold text-yellow-700">{classStats.late}</p>
                      <p className="text-yellow-600">Retards</p>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="space-y-1 max-h-[200px] overflow-y-auto border-t pt-3">
                    {record.records
                      .filter(s => !searchQuery || 
                        `${s.studentFirstName} ${s.studentName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(student => (
                      <div key={student.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {student.studentFirstName[0]}{student.studentName[0]}
                          </div>
                          <span>{student.studentFirstName} {student.studentName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.time && (
                            <span className="text-xs text-muted-foreground">{student.time}</span>
                          )}
                          {getStatusBadge(student.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune présence trouvée</p>
            <p className="text-sm text-muted-foreground">
              Aucun enregistrement de présence pour les critères sélectionnés
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats by Class */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Résumé par classe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockClasses.map(cls => {
              const clsRecords = filteredRecords.filter(r => r.classId === cls.id);
              const totalStudents = clsRecords.length > 0 ? clsRecords[0].records.length : 0;
              const presentCount = clsRecords.reduce((acc, r) => 
                acc + r.records.filter(rec => rec.status === 'present').length, 0);
              const absentCount = clsRecords.reduce((acc, r) => 
                acc + r.records.filter(rec => rec.status === 'absent').length, 0);
              
              return (
                <div key={cls.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cls.name}</span>
                    <Badge variant="outline">{clsRecords.length} cours</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">Présence</span>
                      <span className="font-medium">
                        {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{presentCount} présents</span>
                      <span>{absentCount} absents</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

