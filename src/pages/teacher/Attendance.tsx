import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format, isSameDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  QrCode, 
  Scan, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  Search, 
  Camera, 
  StopCircle, 
  PlayCircle, 
  Loader2, 
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi, type AttendanceEntry } from '@/services/attendance';
import { teacherApi } from '@/services/teacher';
import { getApiErrorMessage } from '@/lib/api-errors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [matriculeSearch, setMatriculeSearch] = useState('');
  const [justificationTarget, setJustificationTarget] = useState<AttendanceEntry | null>(null);
  const [justificationReason, setJustificationReason] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStudentDelegate = Boolean(user?.role === 'student' && user.isClassLeader);
  const canJustifyAbsences = user?.role === 'teacher';
  const canAccessAttendanceBoard = user?.role === 'teacher' || isStudentDelegate;
  const showAttendanceActions = isStudentDelegate || canJustifyAbsences;

  // 1. Charger les cours pour la semaine sélectionnée
  const weekStart = useMemo(() => {
    return format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }, [selectedDate]);

  const instancesQuery = useQuery({
    queryKey: ['attendance', 'instances', weekStart],
    queryFn: async () => teacherApi.fetchTimetable({ weekStartDate: weekStart }),
    enabled: canAccessAttendanceBoard,
  });

  const allInstances = instancesQuery.data || [];

  // Filtrer les instances par la date sélectionnée
  const filteredInstances = useMemo(() => {
    const targetDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return allInstances.filter(inst => {
      // On compare directement la date de l'instance avec la date sélectionnée
      const instDateStr = inst.date.split('T')[0];
      return instDateStr === targetDateStr;
    });
  }, [allInstances, selectedDate]);

  // Logic pour la sélection automatique du cours "En Cours" (uniquement pour aujourd'hui)
  useEffect(() => {
    if (!canAccessAttendanceBoard) {
      return;
    }

    if (allInstances.length > 0 && !selectedInstanceId && isSameDay(selectedDate, new Date())) {
      const inProgress = allInstances.find(inst => inst.status === 'IN_PROGRESS');
      if (inProgress) {
        setSelectedInstanceId(inProgress.id);
        setIsScanning(true);
        toast({
          title: "Cours détecté",
          description: `Sélection automatique de : ${inProgress.subject.name} (${inProgress.class.name})`,
        });
      }
    }
  }, [allInstances, selectedInstanceId, selectedDate, canAccessAttendanceBoard, toast]);

  // 2. Charger la liste des présences
  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'list', selectedInstanceId],
    queryFn: () => attendanceApi.getCourseAttendance(selectedInstanceId),
    enabled: !!selectedInstanceId && canAccessAttendanceBoard,
    refetchInterval: 5000,
  });

  const students = attendanceQuery.data || [];

  const selectedInstance = useMemo(() => 
    allInstances.find(i => i.id === selectedInstanceId), 
    [allInstances, selectedInstanceId]
  );

  // 3. Mutations
  const markMutation = useMutation({
    mutationFn: (payload: { studentIdOrToken: string; method: 'QR_CODE' | 'MANUAL' }) =>
      attendanceApi.markAttendance({
        courseInstanceId: selectedInstanceId,
        studentIdOrToken: payload.studentIdOrToken,
        method: payload.method
      }),
    onSuccess: (data) => {
      const meta = getStatusMeta(data.status);
      toast({
        title: `Pointage : ${data.studentName}`,
        description: `${meta.label} enregistré à ${new Date(data.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        className: meta.toastClassName,
      });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'list', selectedInstanceId] });
    },
    onError: (error: any) => {
      toast({
        title: "Échec du pointage",
        description: getApiErrorMessage(error, "QR Code invalide ou déjà utilisé"),
        variant: "destructive"
      });
    }
  });

  const markManualMutation = useMutation({
    mutationFn: (matricule: string) => 
      attendanceApi.markManual({
        courseInstanceId: selectedInstanceId,
        matricule
      }),
    onSuccess: (data) => {
      const meta = getStatusMeta(data.status);
      toast({
        title: `Pointage manuel : ${data.studentName}`,
        description: `${meta.label} enregistré à ${new Date(data.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        className: meta.toastClassName,
      });
      setMatriculeSearch('');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'list', selectedInstanceId] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Échec du pointage manuel",
        description: getApiErrorMessage(error, "Impossible de marquer cette présence"),
        variant: "destructive",
      });
    }
  });

  const justifyMutation = useMutation({
    mutationFn: (payload: { studentId: string; reason: string }) =>
      attendanceApi.justifyAbsence({
        courseInstanceId: selectedInstanceId,
        studentId: payload.studentId,
        reason: payload.reason,
      }),
    onSuccess: (data) => {
      toast({
        title: `Absence justifiée : ${data.studentName}`,
        description: data.notes ?? 'Le motif a été enregistré.',
        className: 'bg-sky-600 text-white',
      });
      setJustificationTarget(null);
      setJustificationReason('');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'list', selectedInstanceId] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Échec de la justification',
        description: getApiErrorMessage(error, "Impossible de justifier cette absence"),
        variant: 'destructive',
      });
    },
  });

  // 4. Scanner Lifecycle
  useEffect(() => {
    if (isScanning && selectedInstanceId) {
      const timer = setTimeout(async () => {
        // Nettoyer si déjà existant
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) await scannerRef.current.stop();
          } catch (e) { console.warn(e); }
        }

        try {
          const scanner = new Html5Qrcode("qr-reader");
          scannerRef.current = scanner;
          
          await scanner.start(
            { facingMode: "environment" },
            { 
              fps: 15, 
              qrbox: { width: 250, height: 250 },
            },
            (decoded) => {
              if (!markMutation.isPending) {
                markMutation.mutate({ studentIdOrToken: decoded, method: 'QR_CODE' });
              }
            },
            () => {} // success but no scan
          );
        } catch (err) {
          console.error("Erreur caméra :", err);
          setIsScanning(false);
          toast({
            title: "Accès caméra impossible",
            description: "Veuillez vérifier les permissions de votre navigateur.",
            variant: "destructive"
          });
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop()
              .then(() => { scannerRef.current = null; })
              .catch(e => console.warn("Erreur arrêt scanner", e));
          } else {
            scannerRef.current = null;
          }
        }
      };
    }
  }, [isScanning, selectedInstanceId]);

  const stats = useMemo(() => ({
    total: students.length,
    present: students.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length,
    late: students.filter(s => s.status === 'LATE').length,
    absent: students.filter(s => s.status === 'ABSENT').length,
    excused: students.filter(s => s.status === 'EXCUSED').length,
    pending: students.filter(s => s.status === 'NOT_MARKED').length,
  }), [students]);

  const attendanceTableColSpan = showAttendanceActions ? 4 : 3;

  const getStatusMeta = (status: AttendanceEntry['status']) => {
    switch (status) {
      case 'PRESENT':
        return {
          label: 'Présent',
          badgeClassName: 'bg-green-500 hover:bg-green-600 border-0 text-white',
          toastClassName: 'bg-green-600 text-white',
        };
      case 'LATE':
        return {
          label: 'Retard',
          badgeClassName: 'bg-amber-500 hover:bg-amber-600 border-0 text-white',
          toastClassName: 'bg-amber-500 text-white',
        };
      case 'ABSENT':
        return {
          label: 'Absent',
          badgeClassName: 'bg-destructive text-destructive-foreground',
          toastClassName: 'bg-destructive text-white',
        };
      case 'EXCUSED':
        return {
          label: 'Excusé',
          badgeClassName: 'bg-sky-500 hover:bg-sky-600 border-0 text-white',
          toastClassName: 'bg-sky-600 text-white',
        };
      default:
        return {
          label: 'Non pointé',
          badgeClassName: 'border text-muted-foreground italic',
          toastClassName: 'bg-muted text-foreground',
        };
    }
  };

  const getStatusBadge = (status: AttendanceEntry['status']) => {
    const meta = getStatusMeta(status);
    return <Badge className={meta.badgeClassName}>{meta.label}</Badge>;
  };

  if (user?.role === 'student' && !isStudentDelegate) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cahier de Présence</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Pointage par le délégué
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-amber-900">
                  Accès réservé au délégué
                </h2>
              </div>
              <p className="text-sm text-amber-900/80">
                Votre compte élève n’est pas nommé délégué de classe. L’appel de classe
                est réservé au délégué de votre classe.
              </p>
            </div>

            <Button
              variant="outline"
              className="border-amber-300 text-amber-900 hover:bg-amber-100"
              onClick={() => navigate('/attendance')}
            >
              Voir ma présence
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cahier de Présence</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            {user?.role === 'student' ? 'Pointage par le délégué' : 'Pointage par l\'enseignant'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['attendance'] })}
            className="hidden md:flex"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", instancesQuery.isFetching && "animate-spin")} />
            Actualiser
          </Button>
          {!selectedInstanceId && (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1">
              En attente de détection de cours...
            </Badge>
          )}
        </div>
      </div>

      {isStudentDelegate && (
        <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-emerald-900">Mode délégué activé</p>
              <p className="text-sm text-emerald-900/80">
                Vous pouvez marquer la présence de vos camarades directement depuis
                la liste rapide du cours sélectionné.
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              Délégué de classe
            </Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Course Info & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Session de cours</CardTitle>
              <CardDescription>Choisir la date puis la session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Jour du cours</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setSelectedInstanceId(''); // Reset selection on date change
                        }
                      }}
                      initialFocus
                      locale={fr}
                      className="rounded-md border shadow"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Heure & Matière</Label>
                <Select value={selectedInstanceId} onValueChange={setSelectedInstanceId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={filteredInstances.length > 0 ? "Choisir un cours..." : "Aucun cours ce jour"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInstances.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>
                        <div className="flex flex-col items-start transition-colors">
                          <span className="font-medium text-sm">{inst.subject.name}</span>
                          <span className="text-[11px] text-muted-foreground">{inst.class.name} • {inst.startTime} - {inst.endTime}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {filteredInstances.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        Aucun cours programmé pour ce jour.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedInstance && (
                <div className="pt-4 space-y-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statut cours</span>
                    <Badge variant="outline" className={cn(
                      selectedInstance.status === 'IN_PROGRESS' ? "bg-green-50 text-green-700 border-green-200" : ""
                    )}>
                      {selectedInstance.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Classe</span>
                    <span className="font-semibold">{selectedInstance.class.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Bar */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
                   <UserCheck className="h-4 w-4" /> Présents
                </div>
                <span className="text-xl font-bold">{stats.present}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.pending} en attente</span>
                <span>Total: {stats.total}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span>{stats.late} retard(s)</span>
                <span>•</span>
                <span>{stats.absent} absent(s)</span>
                <span>•</span>
                <span>{stats.excused} excusé(s)</span>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          {selectedInstanceId && (
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-semibold">Saisie manuelle</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Matricule..." 
                    className="flex-1 text-sm h-9"
                    value={matriculeSearch}
                    onChange={(e) => setMatriculeSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && markManualMutation.mutate(matriculeSearch)}
                  />
                  <Button 
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => markManualMutation.mutate(matriculeSearch)}
                    disabled={!matriculeSearch || markManualMutation.isPending}
                  >
                    Valider
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Center (Scanner or List) */}
        <div className="lg:col-span-3">
          {!selectedInstanceId ? (
            <Card className="h-[400px] flex flex-col items-center justify-center border-dashed text-center p-8 bg-muted/20">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <CardTitle className="mb-2">Aucune session active</CardTitle>
              <CardDescription>
                Identifiez un cours en progression dans la liste latérale <br/>
                ou attendez que le système en détecte un automatiquement.
              </CardDescription>
            </Card>
          ) : (
            <Tabs defaultValue="scanner" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-muted px-1 h-10">
                  <TabsTrigger value="scanner" className="gap-2">
                    <Scan className="h-4 w-4" /> Scanner
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <Users className="h-4 w-4" /> Liste Rapide
                  </TabsTrigger>
                </TabsList>
                
                <Badge variant="outline" className="font-mono text-xs hidden sm:block">
                  Instance: {selectedInstanceId.split('-').shift()}...
                </Badge>
              </div>

              <TabsContent value="scanner" className="m-0 space-y-4">
                <Card className="overflow-hidden border-2 border-primary/10">
                  <CardHeader className="bg-muted/50 border-b py-3 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Scanner de Pointage</span>
                      </div>
                      {isScanning && (
                         <Badge className="bg-green-500 border-none animate-pulse">Camera On</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-black min-h-[400px] flex flex-col items-center justify-center relative">
                    {isScanning ? (
                      <div id="qr-reader" className="w-full" />
                    ) : (
                      <div className="text-center p-8 space-y-4 text-white/50">
                        <QrCode className="h-16 w-16 mx-auto opacity-20" />
                        <p>Le scanner est en veille</p>
                        <Button 
                          onClick={() => setIsScanning(true)} 
                          className="bg-primary hover:bg-primary/90"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" /> Activer la Caméra
                        </Button>
                      </div>
                    )}
                    
                    {isScanning && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute bottom-4 right-4 z-10"
                        onClick={() => setIsScanning(false)}
                      >
                        <StopCircle className="h-4 w-4 mr-2" /> Arrêter Scan
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                {markMutation.isPending && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="font-semibold text-primary">Validation du QR Code...</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="m-0">
                <Card>
              <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted text-left border-b">
                          <tr>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Élève</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Arrivée</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">Statut</th>
                            {showAttendanceActions && (
                              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                                Action
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {attendanceQuery.isLoading && (
                            <tr><td colSpan={attendanceTableColSpan} className="py-20 text-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Chargement...</td></tr>
                          )}
                          {attendanceQuery.isError && !attendanceQuery.isLoading && (
                            <tr>
                              <td colSpan={attendanceTableColSpan} className="py-12 text-center text-destructive">
                                Impossible de charger la liste de présence pour ce cours.
                              </td>
                            </tr>
                          )}
                          {students.map((s) => (
                            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {s.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{s.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{s.matricule || 'Sans matricule'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {s.arrivalTime ? (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(s.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                ) : '---'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  {getStatusBadge(s.status)}
                                  {s.notes && (
                                    <span className="max-w-[220px] text-[11px] leading-snug text-muted-foreground">
                                      {s.notes}
                                    </span>
                                  )}
                                </div>
                              </td>
                              {showAttendanceActions && (
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end">
                                    {isStudentDelegate ? (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 gap-2"
                                        onClick={() => markMutation.mutate({ studentIdOrToken: s.id, method: 'MANUAL' })}
                                        disabled={markMutation.isPending || s.status !== 'NOT_MARKED'}
                                      >
                                        <UserCheck className="h-3.5 w-3.5" />
                                        Marquer présent
                                      </Button>
                                    ) : (s.status === 'ABSENT' || s.status === 'EXCUSED') ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => {
                                          setJustificationTarget(s);
                                          setJustificationReason(s.notes ?? '');
                                        }}
                                        disabled={justifyMutation.isPending}
                                      >
                                        {s.status === 'EXCUSED' ? 'Modifier le motif' : "Justifier l'absence"}
                                      </Button>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                          {students.length === 0 && !attendanceQuery.isLoading && (
                             <tr><td colSpan={attendanceTableColSpan} className="py-12 text-center text-muted-foreground">Aucun élève dans cette classe.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(justificationTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setJustificationTarget(null);
            setJustificationReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {justificationTarget?.status === 'EXCUSED' ? 'Modifier le motif' : "Justifier l'absence"}
            </DialogTitle>
            <DialogDescription>
              {justificationTarget?.name
                ? `Élève sélectionné : ${justificationTarget.name}`
                : 'Renseignez un motif clair pour tracer cette correction.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="absence-reason">Motif de justification</Label>
            <Textarea
              id="absence-reason"
              placeholder="Ex. absence justifiée par certificat médical"
              value={justificationReason}
              onChange={(event) => setJustificationReason(event.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setJustificationTarget(null);
                setJustificationReason('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!justificationTarget) return;
                justifyMutation.mutate({
                  studentId: justificationTarget.id,
                  reason: justificationReason,
                });
              }}
              disabled={!justificationTarget || !justificationReason.trim() || justifyMutation.isPending}
            >
              {justifyMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
