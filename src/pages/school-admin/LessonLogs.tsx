import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock,
  Eye,
  BookMarked,
  Target,
  FileText,
  User,
  Filter
} from 'lucide-react';
import { LessonLog } from '@/types/lessonLog';
import { mockLessonLogs } from '@/data/mockLessonLogs';

const academicYears = [
  { id: '2024-2025', name: '2024-2025', isActive: true },
  { id: '2023-2024', name: '2023-2024', isActive: false },
  { id: '2022-2023', name: '2022-2023', isActive: false },
];

const allTeachers = [
  { id: 't1', name: 'M. Diallo', subject: 'Mathématiques' },
  { id: 't2', name: 'Mme. Sy', subject: 'Physique-Chimie' },
  { id: 't3', name: 'M. Barry', subject: 'Français' },
  { id: 't4', name: 'Mme. Fall', subject: 'Anglais' },
];

const allClasses = [
  { id: '1', name: 'Terminale S1' },
  { id: '2', name: 'Terminale S2' },
  { id: '3', name: '1ère S1' },
  { id: '4', name: '2nde A' },
  { id: '5', name: '3ème A' },
];

export default function LessonLogs() {
  const [lessonLogs] = useState<LessonLog[]>(mockLessonLogs);
  const [selectedYear, setSelectedYear] = useState<string>(academicYears.find(y => y.isActive)?.id || '2024-2025');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonLog | null>(null);

  const filteredLogs = lessonLogs.filter(log => {
    const matchesTeacher = selectedTeacher === 'all' || log.teacherId === selectedTeacher;
    const matchesClass = selectedClass === 'all' || log.classId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeacher && matchesClass && matchesStatus && matchesSearch;
  });

  const logsByDate = filteredLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, LessonLog[]>);

  const getTeacherName = (teacherId: string) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    return teacher?.name || 'Inconnu';
  };

  const getTeacherSubject = (teacherId: string) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    return teacher?.subject || '';
  };

  const stats = {
    total: filteredLogs.length,
    published: filteredLogs.filter(l => l.status === 'published').length,
    draft: filteredLogs.filter(l => l.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cahier de Texte</h1>
          <p className="text-muted-foreground">Suivez les séances de cours des enseignants</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Séances</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année scolaire" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map(year => (
              <SelectItem key={year.id} value={year.id}>
                <span className="flex items-center gap-2">
                  {year.name}
                  {year.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les enseignants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les enseignants</SelectItem>
            {allTeachers.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name} - {t.subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {allClasses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-10" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {Object.keys(logsByDate).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune séance trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(logsByDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, logs]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <Badge variant="outline" className="ml-2">
                  {logs.length} séance{logs.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-4">
                {logs.map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{log.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.teacherName} - {log.subjectName}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {log.className}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.startTime} - {log.endTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={log.status === 'published' ? 'default' : 'secondary'}>
                            {log.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedLesson(log); setIsViewDialogOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{log.content}</p>
                      {log.objectives.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {log.objectives.slice(0, 3).map((obj, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Target className="h-2 w-2 mr-1" />
                              {obj}
                            </Badge>
                          ))}
                          {log.objectives.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{log.objectives.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      {log.homework && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          <span className="font-medium">Devoirs:</span> {log.homework}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Dialog */}
      {isViewDialogOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedLesson.className} - {selectedLesson.subjectName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedLesson.teacherName} - {new Date(selectedLesson.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedLesson.startTime} - {selectedLesson.endTime}
                </span>
                <Badge variant={selectedLesson.status === 'published' ? 'default' : 'secondary'}>
                  {selectedLesson.status === 'published' ? 'Publié' : 'Brouillon'}
                </Badge>
              </div>

              {selectedLesson.objectives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objectifs pédagogiques
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedLesson.objectives.map((obj, i) => (
                      <li key={i} className="text-sm">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contenu de la séance
                </h4>
                <p className="text-sm whitespace-pre-wrap">{selectedLesson.content}</p>
              </div>

              {selectedLesson.homework && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Devoirs/Travail à faire</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedLesson.homework}</p>
                </div>
              )}

              {selectedLesson.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Matériel/Supports</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.materials.map((mat, i) => (
                      <Badge key={i} variant="outline">{mat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLesson.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedLesson.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

