import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Eye,
  BookMarked,
  Target,
  FileText,
  Save,
  X
} from 'lucide-react';
import { LessonLog } from '@/types/lessonLog';
import { mockLessonLogs } from '@/data/mockLessonLogs';

const teacherClasses = [
  { id: '1', name: 'Terminale S1', subject: 'Mathématiques' },
  { id: '2', name: 'Terminale S2', subject: 'Mathématiques' },
  { id: '3', name: '1ère S1', subject: 'Mathématiques' },
  { id: '4', name: '2nde A', subject: 'Mathématiques' },
];

export default function LessonLogs() {
  const [lessonLogs, setLessonLogs] = useState<LessonLog[]>(mockLessonLogs);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonLog | null>(null);
  
  const [newLesson, setNewLesson] = useState<Partial<LessonLog>>({
    classId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    title: '',
    objectives: [],
    content: '',
    homework: '',
    materials: [],
    notes: '',
    status: 'draft'
  });
  const [objectiveInput, setObjectiveInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  const filteredLogs = lessonLogs.filter(log => {
    const matchesClass = selectedClass === 'all' || log.classId === selectedClass;
    const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const logsByDate = filteredLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, LessonLog[]>);

  const handleCreateLesson = () => {
    if (!newLesson.classId || !newLesson.title || !newLesson.content) return;
    
    const classInfo = teacherClasses.find(c => c.id === newLesson.classId);
    const lesson: LessonLog = {
      id: String(lessonLogs.length + 1),
      classId: newLesson.classId!,
      className: classInfo?.name || '',
      subjectId: '1',
      subjectName: classInfo?.subject || '',
      teacherId: 't1',
      teacherName: 'M. Diallo',
      date: newLesson.date!,
      startTime: newLesson.startTime!,
      endTime: newLesson.endTime!,
      title: newLesson.title!,
      objectives: newLesson.objectives || [],
      content: newLesson.content!,
      homework: newLesson.homework || '',
      materials: newLesson.materials || [],
      notes: newLesson.notes || '',
      status: newLesson.status as 'draft' | 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setLessonLogs([lesson, ...lessonLogs]);
    setIsCreateDialogOpen(false);
    resetNewLesson();
  };

  const resetNewLesson = () => {
    setNewLesson({
      classId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '09:00',
      title: '',
      objectives: [],
      content: '',
      homework: '',
      materials: [],
      notes: '',
      status: 'draft'
    });
    setObjectiveInput('');
    setMaterialInput('');
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setNewLesson({
        ...newLesson,
        objectives: [...(newLesson.objectives || []), objectiveInput.trim()]
      });
      setObjectiveInput('');
    }
  };

  const removeObjective = (index: number) => {
    setNewLesson({
      ...newLesson,
      objectives: newLesson.objectives?.filter((_, i) => i !== index)
    });
  };

  const addMaterial = () => {
    if (materialInput.trim()) {
      setNewLesson({
        ...newLesson,
        materials: [...(newLesson.materials || []), materialInput.trim()]
      });
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setNewLesson({
      ...newLesson,
      materials: newLesson.materials?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cahier de Texte</h1>
          <p className="text-muted-foreground">Gérez vos séances de cours</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Séance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle Séance de Cours</DialogTitle>
              <DialogDescription>Créez une nouvelle séance dans votre cahier de texte</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Classe *</Label>
                  <Select value={newLesson.classId} onValueChange={(v) => setNewLesson({...newLesson, classId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={newLesson.date} onChange={(e) => setNewLesson({...newLesson, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input type="time" value={newLesson.startTime} onChange={(e) => setNewLesson({...newLesson, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input type="time" value={newLesson.endTime} onChange={(e) => setNewLesson({...newLesson, endTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Titre de la séance *</Label>
                <Input placeholder="Ex: Les équations du second degré" value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Objectifs pédagogiques</Label>
                <div className="flex gap-2">
                  <Input placeholder="Ajouter un objectif" value={objectiveInput} onChange={(e) => setObjectiveInput(e.target.value)} />
                  <Button type="button" variant="outline" onClick={addObjective}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newLesson.objectives && newLesson.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newLesson.objectives.map((obj, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Target className="h-3 w-3" />
                        {obj}
                        <button onClick={() => removeObjective(index)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Contenu de la séance *</Label>
                <Textarea placeholder="Décrivez le contenu de votre séance..." rows={4} value={newLesson.content} onChange={(e) => setNewLesson({...newLesson, content: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Devoirs/Travail à faire</Label>
                <Input placeholder="Ex: Exercices 1 à 5 page 45" value={newLesson.homework} onChange={(e) => setNewLesson({...newLesson, homework: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Matériel/Supports</Label>
                <div className="flex gap-2">
                  <Input placeholder="Ajouter un matériel" value={materialInput} onChange={(e) => setMaterialInput(e.target.value)} />
                  <Button type="button" variant="outline" onClick={addMaterial}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newLesson.materials && newLesson.materials.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newLesson.materials.map((mat, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {mat}
                        <button onClick={() => removeMaterial(index)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Notes supplémentaires..." rows={2} value={newLesson.notes} onChange={(e) => setNewLesson({...newLesson, notes: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={newLesson.status} onValueChange={(v) => setNewLesson({...newLesson, status: v as 'draft' | 'published'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetNewLesson(); }}>Annuler</Button>
              <Button onClick={handleCreateLesson} disabled={!newLesson.classId || !newLesson.title || !newLesson.content}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {teacherClasses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {Object.keys(logsByDate).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune séance trouvée</p>
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une séance
            </Button>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLesson && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLesson.title}</DialogTitle>
                <DialogDescription>
                  {selectedLesson.className} - {selectedLesson.subjectName} - {new Date(selectedLesson.date).toLocaleDateString('fr-FR')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

