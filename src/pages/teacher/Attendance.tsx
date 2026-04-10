import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, UserCheck, UserX, History, Camera, StopCircle, PlayCircle } from 'lucide-react';
import { AttendanceRecord, StudentAttendanceRecord } from '@/types/attendance';
import { mockAttendanceRecords, mockStudentsWithQR } from '@/data/mockAttendance';

const teacherClasses = [
  { id: '1', name: 'Terminale S1', subject: 'Mathematiques' },
  { id: '2', name: 'Terminale S2', subject: 'Mathematiques' },
  { id: '3', name: '1ere S1', subject: 'Mathematiques' },
  { id: '4', name: '2nde A', subject: 'Mathematiques' },
];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [currentRecords, setCurrentRecords] = useState<StudentAttendanceRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [lastScanned, setLastScanned] = useState<{student: StudentAttendanceRecord; time: Date} | null>(null);

  const stats = {
    present: currentRecords.filter(r => r.status === 'present').length,
    absent: currentRecords.filter(r => r.status === 'absent').length,
    late: currentRecords.filter(r => r.status === 'late').length,
    excused: currentRecords.filter(r => r.status === 'excused').length,
  };

  useEffect(() => {
    const existingRecord = attendanceRecords.find(r => r.classId === selectedClass && r.date === selectedDate);
    if (existingRecord) {
      setCurrentRecords(existingRecord.records);
    } else {
      const students = mockStudentsWithQR.filter(s => s.classId === selectedClass);
      const newRecords: StudentAttendanceRecord[] = students.map(student => ({
        id: selectedDate + '-' + student.id,
        studentId: student.id,
        studentName: student.name,
        studentFirstName: student.firstName,
        qrCode: student.qrCode,
        time: '',
        status: 'absent' as const,
      }));
      setCurrentRecords(newRecords);
    }
  }, [selectedClass, selectedDate, attendanceRecords]);

  const handleManualAttendance = (record: StudentAttendanceRecord, status: 'present' | 'absent' | 'late' | 'excused') => {
    setCurrentRecords(prev => prev.map(r => r.id === record.id ? { ...r, status, time: status === 'present' || status === 'late' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '' } : r));
  };

  const handleQRCodeScan = (code: string) => {
    const student = currentRecords.find(r => r.qrCode === code);
    if (student) {
      const currentTime = new Date();
      setLastScanned({ student, time: currentTime });
      setCurrentRecords(prev => prev.map(r => r.qrCode === code ? { ...r, status: 'present' as const, time: currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } : r));
      setScannedCode('');
    }
  };

  const simulateQRScan = () => {
    const unchecked = currentRecords.filter(r => r.status === 'absent');
    if (unchecked.length > 0) {
      const randomStudent = unchecked[Math.floor(Math.random() * unchecked.length)];
      handleQRCodeScan(randomStudent.qrCode);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Present</Badge>;
      case 'absent': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Absent</Badge>;
      case 'late': return <Badge className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" /> Retard</Badge>;
      case 'excused': return <Badge className="bg-blue-500"><UserCheck className="h-3 w-3 mr-1" /> Excurse</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Presences</h1>
          <p className="text-muted-foreground">Gerez les presences avec scan de code QR</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Selectionner une classe" /></SelectTrigger>
          <SelectContent>
            {teacherClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.subject}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[180px]" />
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scanner" className="gap-2"><Scan className="h-4 w-4" /> Scanner QR</TabsTrigger>
          <TabsTrigger value="list" className="gap-2"><Users className="h-4 w-4" /> Liste</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" /> Scanner de Code QR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center">
                  {isScanning ? (
                    <>
                      <Camera className="h-24 w-24 text-primary mb-4" />
                      <p className="text-muted-foreground">En attente de scan...</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Cliquez pour activer le scanner</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsScanning(!isScanning)} 
                    className="flex-1 gap-2" 
                    variant={isScanning ? 'destructive' : 'default'}
                  >
                    {isScanning ? (
                      <>
                        <StopCircle className="h-4 w-4" /> Arreter
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" /> Activer
                      </>
                    )}
                  </Button>
                  <Button onClick={simulateQRScan} variant="outline" disabled={!isScanning}>
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
                {lastScanned && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Dernier scan: {lastScanned.student.studentFirstName} {lastScanned.student.studentName}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Simulation (entrez le code QR)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ex: QR-2025-001" 
                      value={scannedCode} 
                      onChange={(e) => setScannedCode(e.target.value)} 
                    />
                    <Button onClick={() => handleQRCodeScan(scannedCode)}>Scanner</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">{stats.present}</p>
                      <p className="text-sm text-green-600">Presents</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
                      <p className="text-sm text-red-600">Absents</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
                      <p className="text-sm text-yellow-600">Retards</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <UserCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
                      <p className="text-sm text-blue-600">Excusres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">A absents ({stats.absent})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {currentRecords.filter(r => r.status === 'absent').map(record => (
                      <div key={record.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{record.studentFirstName} {record.studentName}</p>
                          <p className="text-xs text-muted-foreground">{record.qrCode}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleManualAttendance(record, 'present')}>
                            <UserCheck className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleManualAttendance(record, 'excused')}>
                            <UserX className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Liste des eleves - {teacherClasses.find(c => c.id === selectedClass)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentRecords.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium">{record.studentFirstName[0]}{record.studentName[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{record.studentFirstName} {record.studentName}</p>
                        <p className="text-xs text-muted-foreground">{record.qrCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {record.time && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.time}
                        </span>
                      )}
                      {getStatusBadge(record.status)}
                      <Select value={record.status} onValueChange={(v) => handleManualAttendance(record, v as 'present' | 'absent' | 'late' | 'excused')}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Retard</SelectItem>
                          <SelectItem value="excused">Excurse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des presences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.map(record => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{record.className}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          {record.records.filter(r => r.status === 'present').length} presents
                        </span>
                        <span className="text-red-600">
                          {record.records.filter(r => r.status === 'absent').length} absents
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

