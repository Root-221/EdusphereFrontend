import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Users,
  GraduationCap,
  Printer,
  Eye,
  CheckCircle
} from 'lucide-react';

// Mock data for classes
const classes = [
  { id: '1', name: '6ème A', studentsCount: 32 },
  { id: '2', name: '6ème B', studentsCount: 28 },
  { id: '3', name: '5ème A', studentsCount: 30 },
  { id: '4', name: '4ème A', studentsCount: 25 },
  { id: '5', name: '3ème A', studentsCount: 28 },
  { id: '6', name: '2nde A', studentsCount: 22 },
  { id: '7', name: '1ère A', studentsCount: 20 },
  { id: '8', name: 'Terminale A', studentsCount: 18 },
];

// Mock data for students
const students = [
  { id: '1', name: 'Diop', firstName: 'Moussa', class: '6ème A', average: 14.5, status: 'published' },
  { id: '2', name: 'Sall', firstName: 'Aissatou', class: '6ème A', average: 16.2, status: 'published' },
  { id: '3', name: 'Touré', firstName: 'Ousmane', class: '6ème A', average: 12.8, status: 'pending' },
  { id: '4', name: 'Ndiaye', firstName: 'Fatou', class: '6ème A', average: 15.0, status: 'published' },
  { id: '5', name: 'Diop', firstName: 'Mamadou', class: '6ème A', average: 11.5, status: 'draft' },
];

// Mock data for bulletins
const bulletins = [
  { id: '1', student: 'Moussa Diop', class: '6ème A', semester: 'Semestre 1', average: 14.5, generatedAt: '15/01/2025', status: 'published' },
  { id: '2', student: 'Aissatou Sall', class: '6ème A', semester: 'Semestre 1', average: 16.2, generatedAt: '15/01/2025', status: 'published' },
  { id: '3', student: 'Ousmane Touré', class: '6ème A', semester: 'Semestre 1', average: 12.8, generatedAt: '16/01/2025', status: 'pending' },
  { id: '4', student: 'Fatou Ndiaye', class: '6ème A', semester: 'Semestre 1', average: 15.0, generatedAt: '15/01/2025', status: 'published' },
];

export default function SchoolAdminBulletins() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('semestre1');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulletins de Notes</h1>
          <p className="text-muted-foreground">
            Gérez et générez les bulletins de notes par classe et par élève
          </p>
        </div>
        <Button className="gap-2">
          <Printer className="h-4 w-4" />
          Générer Tous les Bulletins
        </Button>
      </div>

      <Tabs defaultValue="by-class" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="by-class">Par Classe</TabsTrigger>
          <TabsTrigger value="by-student">Par Élève</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Par Classe Tab */}
        <TabsContent value="by-class" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sélectionner une Classe
              </CardTitle>
              <CardDescription>
                Choisissez une classe pour consulter ou générer les bulletins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Classe</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.studentsCount} élèves)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semestre</label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semestre1">Semestre 1</SelectItem>
                      <SelectItem value="semestre2">Semestre 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full gap-2" 
                disabled={!selectedClass}
                onClick={() => setSelectedClass(selectedClass)}
              >
                <FileText className="h-4 w-4" />
                Générer les Bulletins
              </Button>
            </CardContent>
          </Card>

          {selectedClass && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Bulletins - {classes.find(c => c.id === selectedClass)?.name}
                  </span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Tout Télécharger
                  </Button>
                </CardTitle>
                <CardDescription>
                  {students.length} élèves | Moyenne générale de la classe: 14.0
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {student.firstName[0]}{student.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{student.firstName} {student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Moyenne: {student.average}/20
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={student.status === 'published' ? 'default' : 'secondary'}>
                          {student.status === 'published' ? 'Publié' : student.status === 'pending' ? 'En attente' : 'Brouillon'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Par Élève Tab */}
        <TabsContent value="by-student" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher un Élève
              </CardTitle>
              <CardDescription>
                Entrez le nom ou le prénom de l'élève
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher un élève..." 
                    className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="semestre1">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semestre1">Semestre 1</SelectItem>
                    <SelectItem value="semestre2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="shadow-card">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {student.firstName[0]}{student.name[0]}
                    </div>
                    <div>
                      <h3 className="font-medium">{student.firstName} {student.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {student.class}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Moyenne: {student.average}/20
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={student.status === 'published' ? 'default' : 'secondary'}>
                      {student.status === 'published' ? 'Publié' : student.status === 'pending' ? 'En attente' : 'Brouillon'}
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Historique Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historique des Bulletins Générés
              </CardTitle>
              <CardDescription>
                Consultez l'historique des bulletins déjà générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bulletins.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{bulletin.student}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{bulletin.class}</span>
                          <span>{bulletin.semester}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {bulletin.generatedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={bulletin.status === 'published' ? 'default' : 'secondary'}
                        className={bulletin.status === 'published' ? 'bg-success' : ''}
                      >
                        {bulletin.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {bulletin.status === 'published' ? 'Publié' : 'En attente'}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
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
