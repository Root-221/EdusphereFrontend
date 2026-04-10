import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataList, Column } from '@/components/ui/data-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  ClipboardList,
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Eye,
  Calculator,
  School,
  CalendarDays,
  MapPin,
  Send,
  Archive,
  XCircle,
  PenLine,
  BookMarked,
  FlaskConical,
  FolderKanban,
  HelpCircle,
  ListChecks
} from 'lucide-react';

// Types
type EvaluationType = 'devoir' | 'composition' | 'essai' | 'devoir_maison' | 'tp' | 'projet' | 'interrogation';

type EvaluationStatus = 'draft' | 'active' | 'scheduled' | 'completed' | 'archived';

interface Evaluation {
  id: string;
  title: string;
  description?: string;
  type: EvaluationType;
  subject: string;
  subjectId: string;
  class: string;
  classId: string;
  academicYear: string;
  academicYearId: string;
  semester: string;
  semesterId: string;
  dueDate?: string; // For homework types
  date?: string; // For exam types
  duration?: string; // For exam types
  coefficient: number;
  status: EvaluationStatus;
  room?: string;
  notes?: string;
  submissions?: number; // For homework
  totalStudents: number;
  createdAt: string;
}

// Evaluation type labels
const evaluationTypes: { value: EvaluationType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'devoir', label: 'Devoir', icon: ListChecks },
  { value: 'composition', label: 'Composition', icon: FileText },
  { value: 'essai', label: 'Essai', icon: PenLine },
  { value: 'devoir_maison', label: 'Devoir Maison', icon: BookMarked },
  { value: 'tp', label: 'TP', icon: FlaskConical },
  { value: 'projet', label: 'Projet', icon: FolderKanban },
  { value: 'interrogation', label: 'Interrogation', icon: HelpCircle },
];

// Données mock - Années académiques
const academicYears = [
  { id: '1', name: '2024-2025', status: 'active' },
  { id: '2', name: '2023-2024', status: 'completed' },
  { id: '3', name: '2025-2026', status: 'draft' },
];

const ACTIVE_YEAR_ID = '1';

// Données mock - Semestres
const semesters = [
  { id: '1', name: 'Semestre 1', academicYearId: '1', academicYear: '2024-2025' },
  { id: '2', name: 'Semestre 2', academicYearId: '1', academicYear: '2024-2025' },
  { id: '3', name: 'Semestre 1', academicYearId: '2', academicYear: '2023-2024' },
  { id: '4', name: 'Semestre 2', academicYearId: '2', academicYear: '2023-2024' },
];

// Données mock - Classes
const classes = [
  { id: '1', name: 'Terminale S1' },
  { id: '2', name: 'Terminale S2' },
  { id: '3', name: '1ère S1' },
  { id: '4', name: '2nde A' },
  { id: '5', name: '3ème A' },
  { id: '6', name: '4ème B' },
];

// Données mock - Matières
const subjects = [
  { id: '1', name: 'Mathématiques' },
  { id: '2', name: 'Français' },
  { id: '3', name: 'Physique' },
  { id: '4', name: 'Anglais' },
  { id: '5', name: 'Histoire-Géo' },
  { id: '6', name: 'Philosophie' },
  { id: '7', name: 'SVT' },
  { id: '8', name: 'EPS' },
];

// Données mock initiales - Combined assignments and exams
const initialEvaluations: Evaluation[] = [
  {
    id: '1',
    title: 'Exercices Chapitre 5 - Algèbre',
    description: 'Série d\'exercices sur les équations différentielles et les suites numériques.',
    type: 'devoir',
    subject: 'Mathématiques',
    subjectId: '1',
    class: 'Terminale S1',
    classId: '1',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    dueDate: '10/02/2025',
    coefficient: 2,
    status: 'active',
    submissions: 20,
    totalStudents: 35,
    createdAt: '01/02/2025',
  },
  {
    id: '2',
    title: 'Devoir Maison - Géométrie',
    description: 'Problèmes de géométrie dans l\'espace à rendre pour la rentrée.',
    type: 'devoir_maison',
    subject: 'Mathématiques',
    subjectId: '1',
    class: 'Terminale S2',
    classId: '2',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    dueDate: '15/02/2025',
    coefficient: 3,
    status: 'active',
    submissions: 15,
    totalStudents: 32,
    createdAt: '03/02/2025',
  },
  {
    id: '3',
    title: 'Composition 1 - Algèbre',
    type: 'composition',
    subject: 'Mathématiques',
    subjectId: '1',
    class: 'Terminale S1',
    classId: '1',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    date: '20/02/2025',
    duration: '2h',
    coefficient: 3,
    status: 'scheduled',
    room: 'Salle A1',
    notes: 'Calculatrices autorisées',
    totalStudents: 35,
    createdAt: '01/02/2025',
  },
  {
    id: '4',
    title: 'Composition 1 - Physique',
    type: 'composition',
    subject: 'Physique',
    subjectId: '3',
    class: '1ère S1',
    classId: '3',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    date: '25/02/2025',
    duration: '1h30',
    coefficient: 2,
    status: 'draft',
    totalStudents: 38,
    createdAt: '05/02/2025',
  },
  {
    id: '5',
    title: 'TP Chimie Organique',
    type: 'tp',
    subject: 'Physique',
    subjectId: '3',
    class: '1ère S1',
    classId: '3',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    dueDate: '25/02/2025',
    coefficient: 1,
    status: 'active',
    submissions: 10,
    totalStudents: 38,
    createdAt: '08/02/2025',
  },
  {
    id: '6',
    title: 'Dissertation - Les Lumières',
    type: 'essai',
    subject: 'Français',
    subjectId: '2',
    class: 'Terminale S1',
    classId: '1',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 1',
    semesterId: '1',
    dueDate: '15/01/2025',
    coefficient: 2,
    status: 'completed',
    submissions: 30,
    totalStudents: 35,
    createdAt: '20/12/2024',
  },
  {
    id: '7',
    title: 'Interrogation - Limites',
    type: 'interrogation',
    subject: 'Mathématiques',
    subjectId: '1',
    class: 'Terminale S1',
    classId: '1',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    date: '05/02/2025',
    duration: '30min',
    coefficient: 1,
    status: 'completed',
    totalStudents: 35,
    createdAt: '01/02/2025',
  },
  {
    id: '8',
    title: 'Projet - Application Web',
    type: 'projet',
    subject: 'Mathématiques',
    subjectId: '1',
    class: 'Terminale S2',
    classId: '2',
    academicYear: '2024-2025',
    academicYearId: '1',
    semester: 'Semestre 2',
    semesterId: '2',
    dueDate: '30/04/2025',
    coefficient: 4,
    status: 'active',
    submissions: 5,
    totalStudents: 32,
    createdAt: '15/01/2025',
  },
];

export default function SchoolEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);
  
  // Filtres - Année active par défaut
  const [filters, setFilters] = useState({
    academicYearId: ACTIVE_YEAR_ID,
    semesterId: '',
    classId: '',
    subjectId: '',
    type: '' as EvaluationType | '',
    status: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'devoir' as EvaluationType,
    subjectId: '',
    classId: '',
    academicYearId: '',
    semesterId: '',
    dueDate: '',
    date: '',
    duration: '',
    coefficient: '2',
    room: '',
    notes: '',
  });

  // Obtenir les semestres filtrés par année académique
  const getFilteredSemesters = () => {
    if (!formData.academicYearId) return semesters;
    return semesters.filter(s => s.academicYearId === formData.academicYearId);
  };

  // Check if type is a homework type (has dueDate)
  const isHomeworkType = (type: EvaluationType): boolean => {
    return ['devoir', 'devoir_maison', 'tp', 'projet', 'essai'].includes(type);
  };

  // Check if type is an exam type (has date and duration)
  const isExamType = (type: EvaluationType): boolean => {
    return ['composition', 'interrogation'].includes(type);
  };

  const handleAddEvaluation = () => {
    const subject = subjects.find(s => s.id === formData.subjectId);
    const cls = classes.find(c => c.id === formData.classId);
    const year = academicYears.find(y => y.id === formData.academicYearId);
    const semester = semesters.find(s => s.id === formData.semesterId);
    
    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      subject: subject?.name || '',
      subjectId: formData.subjectId,
      class: cls?.name || '',
      classId: formData.classId,
      academicYear: year?.name || '',
      academicYearId: formData.academicYearId,
      semester: semester?.name || '',
      semesterId: formData.semesterId,
      dueDate: isHomeworkType(formData.type) ? formData.dueDate : undefined,
      date: isExamType(formData.type) ? formData.date : undefined,
      duration: isExamType(formData.type) ? formData.duration : undefined,
      coefficient: parseInt(formData.coefficient),
      status: isExamType(formData.type) ? 'scheduled' : 'draft',
      room: formData.room || undefined,
      notes: formData.notes || undefined,
      submissions: isHomeworkType(formData.type) ? 0 : undefined,
      totalStudents: cls ? 35 : 0,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    
    setEvaluations([newEvaluation, ...evaluations]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditEvaluation = () => {
    if (!selectedEvaluation) return;
    const subject = subjects.find(s => s.id === formData.subjectId);
    const cls = classes.find(c => c.id === formData.classId);
    const year = academicYears.find(y => y.id === formData.academicYearId);
    const semester = semesters.find(s => s.id === formData.semesterId);
    
    const updatedEvaluations = evaluations.map(e => 
      e.id === selectedEvaluation.id 
        ? {
            ...e,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            subject: subject?.name || e.subject,
            subjectId: formData.subjectId,
            class: cls?.name || e.class,
            classId: formData.classId,
            academicYear: year?.name || e.academicYear,
            academicYearId: formData.academicYearId,
            semester: semester?.name || e.semester,
            semesterId: formData.semesterId,
            dueDate: isHomeworkType(formData.type) ? formData.dueDate : undefined,
            date: isExamType(formData.type) ? formData.date : undefined,
            duration: isExamType(formData.type) ? formData.duration : undefined,
            coefficient: parseInt(formData.coefficient),
            room: formData.room || undefined,
            notes: formData.notes || undefined,
          }
        : e
    );
    setEvaluations(updatedEvaluations);
    setIsEditDialogOpen(false);
    setSelectedEvaluation(null);
    resetForm();
  };

  const handleDeleteEvaluation = () => {
    if (!evaluationToDelete) return;
    setEvaluations(evaluations.filter(e => e.id !== evaluationToDelete.id));
    setEvaluationToDelete(null);
  };

  const handleStatusChange = (evaluation: Evaluation, newStatus: EvaluationStatus) => {
    const updatedEvaluations = evaluations.map(e => 
      e.id === evaluation.id ? { ...e, status: newStatus } : e
    );
    setEvaluations(updatedEvaluations);
  };

  const openEditDialog = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setFormData({
      title: evaluation.title,
      description: evaluation.description,
      type: evaluation.type,
      subjectId: evaluation.subjectId,
      classId: evaluation.classId,
      academicYearId: evaluation.academicYearId,
      semesterId: evaluation.semesterId,
      dueDate: evaluation.dueDate || '',
      date: evaluation.date || '',
      duration: evaluation.duration || '',
      coefficient: evaluation.coefficient.toString(),
      room: evaluation.room || '',
      notes: evaluation.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDrawer = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsViewDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'devoir',
      subjectId: '',
      classId: '',
      academicYearId: '',
      semesterId: '',
      dueDate: '',
      date: '',
      duration: '',
      coefficient: '2',
      room: '',
      notes: '',
    });
  };

  const getTypeBadge = (type: EvaluationType) => {
    const typeInfo = evaluationTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || FileText;
    return (
      <span className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {typeInfo?.label || type}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Actif</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'scheduled':
        return <Badge variant="default">Programmée</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminée</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get icon for evaluation type
  const getTypeIcon = (type: EvaluationType) => {
    const typeInfo = evaluationTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || FileText;
    return Icon;
  };

  // Colonnes pour la liste
  const columns: Column<Evaluation>[] = [
    {
      key: 'title',
      label: 'Évaluation',
      sortable: true,
      render: (evaluation) => {
        const Icon = getTypeIcon(evaluation.type);
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              evaluation.status === 'active' || evaluation.status === 'scheduled' ? 'bg-primary/10' : 
              evaluation.status === 'completed' ? 'bg-green-50' : 
              evaluation.status === 'archived' ? 'bg-muted' : 'bg-blue-50'
            }`}>
              <Icon className={`h-5 w-5 ${
                evaluation.status === 'active' || evaluation.status === 'scheduled' ? 'text-primary' : 
                evaluation.status === 'completed' ? 'text-green-600' : 
                evaluation.status === 'archived' ? 'text-muted-foreground' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="font-medium">{evaluation.title}</p>
              <p className="text-xs text-muted-foreground">{evaluation.class} - {evaluation.subject}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (evaluation) => getTypeBadge(evaluation.type)
    },
    {
      key: 'academicYear',
      label: 'Période',
      sortable: true,
      render: (evaluation) => (
        <div className="text-sm">
          <p className="font-medium">{evaluation.academicYear}</p>
          <p className="text-muted-foreground">{evaluation.semester}</p>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (evaluation) => (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {evaluation.date || evaluation.dueDate || '-'}
        </span>
      )
    },
    {
      key: 'coefficient',
      label: 'Coeff',
      sortable: true,
      render: (evaluation) => (
        <span className="flex items-center gap-1 font-medium">
          <Calculator className="h-3 w-3" />
          {evaluation.coefficient}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (evaluation) => getStatusBadge(evaluation.status)
    },
  ];

  // Filtrer les données
  const filteredEvaluations = evaluations.filter(e => {
    if (filters.academicYearId && e.academicYearId !== filters.academicYearId) return false;
    if (filters.semesterId && e.semesterId !== filters.semesterId) return false;
    if (filters.classId && e.classId !== filters.classId) return false;
    if (filters.subjectId && e.subjectId !== filters.subjectId) return false;
    if (filters.type && e.type !== filters.type) return false;
    if (filters.status && e.status !== filters.status) return false;
    return true;
  });

  // Item pour la grille
  const gridItem = (evaluation: Evaluation) => {
    const Icon = getTypeIcon(evaluation.type);
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              evaluation.status === 'active' || evaluation.status === 'scheduled' ? 'bg-primary/10' : 
              evaluation.status === 'completed' ? 'bg-green-50' : 
              evaluation.status === 'archived' ? 'bg-muted' : 'bg-blue-50'
            }`}>
              <Icon className={`h-6 w-6 ${
                evaluation.status === 'active' || evaluation.status === 'scheduled' ? 'text-primary' : 
                evaluation.status === 'completed' ? 'text-green-600' : 
                evaluation.status === 'archived' ? 'text-muted-foreground' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold truncate">{evaluation.title}</h3>
              {getStatusBadge(evaluation.status)}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {evaluation.subject}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <School className="h-3 w-3" />
            {evaluation.class}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {evaluation.academicYear} - {evaluation.semester}
          </span>
          {evaluation.date && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Date: {evaluation.date}
            </span>
          )}
          {evaluation.dueDate && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Échéance: {evaluation.dueDate}
            </span>
          )}
          {evaluation.duration && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Durée: {evaluation.duration}
            </span>
          )}
          <span className="flex items-center gap-2 text-muted-foreground">
            <Calculator className="h-3 w-3" />
            Coefficient: {evaluation.coefficient}
          </span>
          {evaluation.submissions !== undefined && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              {evaluation.submissions}/{evaluation.totalStudents} rendus
            </span>
          )}
          {evaluation.room && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {evaluation.room}
            </span>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openViewDrawer(evaluation)}>
            <Eye className="h-3 w-3" />
            Détails
          </Button>
          <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEditDialog(evaluation)}>
            <Edit className="h-3 w-3" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setEvaluationToDelete(evaluation)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer l'évaluation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer l'évaluation "{evaluation.title}" ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvaluation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Évaluations</h1>
          <p className="text-muted-foreground">
            Gérez tous les types d'évaluations de l'école
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Nouvelle Évaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle évaluation</DialogTitle>
              <DialogDescription>
                Définissez les paramètres de l'évaluation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'évaluation *</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Exercices Chapitre 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type d'évaluation *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: EvaluationType) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de l'évaluation..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Année académique *</Label>
                  <Select 
                    value={formData.academicYearId} 
                    onValueChange={(value) => setFormData({...formData, academicYearId: value, semesterId: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semestre *</Label>
                  <Select 
                    value={formData.semesterId} 
                    onValueChange={(value) => setFormData({...formData, semesterId: value})}
                    disabled={!formData.academicYearId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredSemesters().map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matière *</Label>
                  <Select 
                    value={formData.subjectId} 
                    onValueChange={(value) => setFormData({...formData, subjectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Classe *</Label>
                  <Select 
                    value={formData.classId} 
                    onValueChange={(value) => setFormData({...formData, classId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date fields based on type */}
              {isHomeworkType(formData.type) && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date limite</Label>
                  <Input 
                    id="dueDate" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>
              )}
              
              {isExamType(formData.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      placeholder="JJ/MM/AAAA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée</Label>
                    <Select 
                      value={formData.duration} 
                      onValueChange={(value) => setFormData({...formData, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 min</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="1h30">1h30</SelectItem>
                        <SelectItem value="2h">2h</SelectItem>
                        <SelectItem value="2h30">2h30</SelectItem>
                        <SelectItem value="3h">3h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coefficient">Coefficient</Label>
                  <Input 
                    id="coefficient" 
                    type="number"
                    min="1"
                    max="10"
                    value={formData.coefficient}
                    onChange={(e) => setFormData({...formData, coefficient: e.target.value})}
                  />
                </div>
                {isExamType(formData.type) && (
                  <div className="space-y-2">
                    <Label htmlFor="room">Salle (optionnel)</Label>
                    <Input 
                      id="room" 
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="Ex: Salle A1"
                    />
                  </div>
                )}
              </div>
              {isExamType(formData.type) && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea 
                    id="notes" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Instructions spéciales, matériel autorisé..."
                    rows={2}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleAddEvaluation} 
                disabled={!formData.title || !formData.subjectId || !formData.classId || !formData.academicYearId || !formData.semesterId || (isExamType(formData.type) && !formData.date)}
              >
                Créer l'évaluation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'évaluation</DialogTitle>
              <DialogDescription>
                Modifiez les paramètres de l'évaluation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Titre de l'évaluation *</Label>
                <Input 
                  id="editTitle" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Type d'évaluation *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: EvaluationType) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  id="editDescription" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAcademicYear">Année académique *</Label>
                  <Select 
                    value={formData.academicYearId} 
                    onValueChange={(value) => setFormData({...formData, academicYearId: value, semesterId: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSemester">Semestre *</Label>
                  <Select 
                    value={formData.semesterId} 
                    onValueChange={(value) => setFormData({...formData, semesterId: value})}
                    disabled={!formData.academicYearId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredSemesters().map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSubject">Matière *</Label>
                  <Select 
                    value={formData.subjectId} 
                    onValueChange={(value) => setFormData({...formData, subjectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClass">Classe *</Label>
                  <Select 
                    value={formData.classId} 
                    onValueChange={(value) => setFormData({...formData, classId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isHomeworkType(formData.type) && (
                <div className="space-y-2">
                  <Label htmlFor="editDueDate">Date limite</Label>
                  <Input 
                    id="editDueDate" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              )}
              
              {isExamType(formData.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDate">Date *</Label>
                    <Input 
                      id="editDate" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDuration">Durée</Label>
                    <Select 
                      value={formData.duration} 
                      onValueChange={(value) => setFormData({...formData, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 min</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="1h30">1h30</SelectItem>
                        <SelectItem value="2h">2h</SelectItem>
                        <SelectItem value="2h30">2h30</SelectItem>
                        <SelectItem value="3h">3h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCoefficient">Coefficient</Label>
                  <Input 
                    id="editCoefficient" 
                    type="number"
                    min="1"
                    max="10"
                    value={formData.coefficient}
                    onChange={(e) => setFormData({...formData, coefficient: e.target.value})}
                  />
                </div>
                {isExamType(formData.type) && (
                  <div className="space-y-2">
                    <Label htmlFor="editRoom">Salle (optionnel)</Label>
                    <Input 
                      id="editRoom" 
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              {selectedEvaluation && (
                <div className="space-y-2 pt-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedEvaluation.status === 'draft' && (
                      <Button type="button" size="sm" onClick={() => {
                        if (selectedEvaluation) {
                          const newStatus = isExamType(selectedEvaluation.type) ? 'scheduled' : 'active';
                          handleStatusChange(selectedEvaluation, newStatus);
                          setIsEditDialogOpen(false);
                        }
                      }}>
                        <Send className="h-3 w-3 mr-1" />
                        {isExamType(selectedEvaluation.type) ? 'Programmer' : 'Activer'}
                      </Button>
                    )}
                    {(selectedEvaluation.status === 'active' || selectedEvaluation.status === 'scheduled') && (
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        if (selectedEvaluation) {
                          handleStatusChange(selectedEvaluation, 'archived');
                          setIsEditDialogOpen(false);
                        }
                      }}>
                        <Archive className="h-3 w-3 mr-1" />
                        Archiver
                      </Button>
                    )}
                    {selectedEvaluation.status === 'scheduled' && (
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        if (selectedEvaluation) {
                          handleStatusChange(selectedEvaluation, 'completed');
                          setIsEditDialogOpen(false);
                        }
                      }}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleEditEvaluation} 
                disabled={!formData.title || !formData.subjectId || !formData.classId || !formData.academicYearId || !formData.semesterId || (isExamType(formData.type) && !formData.date)}
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Drawer */}
        <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedEvaluation?.title}</DrawerTitle>
              <DrawerDescription>
                Détails de l'évaluation
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {selectedEvaluation && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(selectedEvaluation.type)}
                    {getStatusBadge(selectedEvaluation.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Matière</p>
                      <p className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {selectedEvaluation.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Classe</p>
                      <p className="font-medium flex items-center gap-2">
                        <School className="h-4 w-4" />
                        {selectedEvaluation.class}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Année académique</p>
                      <p className="font-medium">{selectedEvaluation.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Semestre</p>
                      <p className="font-medium">{selectedEvaluation.semester}</p>
                    </div>
                    {selectedEvaluation.date && (
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {selectedEvaluation.date}
                        </p>
                      </div>
                    )}
                    {selectedEvaluation.dueDate && (
                      <div>
                        <p className="text-muted-foreground">Date limite</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {selectedEvaluation.dueDate}
                        </p>
                      </div>
                    )}
                    {selectedEvaluation.duration && (
                      <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {selectedEvaluation.duration}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Coefficient</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        {selectedEvaluation.coefficient}
                      </p>
                    </div>
                    {selectedEvaluation.room && (
                      <div>
                        <p className="text-muted-foreground">Salle</p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {selectedEvaluation.room}
                        </p>
                      </div>
                    )}
                    {selectedEvaluation.submissions !== undefined && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Soumissions</p>
                        <p className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {selectedEvaluation.submissions} / {selectedEvaluation.totalStudents} élèves ont soumis
                        </p>
                      </div>
                    )}
                    {selectedEvaluation.description && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Description</p>
                        <p className="font-medium">{selectedEvaluation.description}</p>
                      </div>
                    )}
                    {selectedEvaluation.notes && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="font-medium">{selectedEvaluation.notes}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Créé le</p>
                      <p className="font-medium">{selectedEvaluation.createdAt}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fermer</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Filtres personnalisés */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.academicYearId}
          onValueChange={(value) => setFilters({ ...filters, academicYearId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année académique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les années</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.semesterId}
          onValueChange={(value) => setFilters({ ...filters, semesterId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les semestres</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.classId}
          onValueChange={(value) => setFilters({ ...filters, classId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.subjectId}
          onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value as EvaluationType | '' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {evaluationTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="scheduled">Programmée</SelectItem>
            <SelectItem value="completed">Terminée</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>
        
        {(filters.academicYearId || filters.semesterId || filters.classId || filters.subjectId || filters.type || filters.status) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({ academicYearId: '', semesterId: '', classId: '', subjectId: '', type: '', status: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <DataList
        data={filteredEvaluations}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Rechercher une évaluation..."
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucune évaluation trouvée"
        itemsPerPage={6}
      />
    </div>
  );
}
