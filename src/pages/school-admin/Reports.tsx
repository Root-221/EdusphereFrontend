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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Download,
  Calendar,
  FileBarChart,
  Plus,
  Eye
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'completed' | 'pending' | 'generating';
}

const initialReports: Report[] = [
  { id: '1', name: 'Rapport Trimestriel - T1', type: 'Académique', date: '15/01/2025', status: 'completed' },
  { id: '2', name: 'Statistiques Élèves', type: 'Statistiques', date: '10/01/2025', status: 'completed' },
  { id: '3', name: 'Bulletins S1', type: 'Bulletins', date: '05/01/2025', status: 'completed' },
  { id: '4', name: 'Rapport Présence', type: 'Présence', date: '01/01/2025', status: 'pending' },
  { id: '5', name: 'Rapport Financier', type: 'Financier', date: '20/12/2024', status: 'completed' },
  { id: '6', name: 'Analyse Résultats', type: 'Statistiques', date: '15/12/2024', status: 'completed' },
];

export default function SchoolReports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'generating',
    };
    setReports([newReport, ...reports]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', type: '' });

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id ? { ...r, status: 'completed' as const } : r
      ));
    }, 3000);
  };

  const openViewDialog = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En cours...</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: Column<Report>[] = [
    {
      key: 'name',
      label: 'Rapport',
      sortable: true,
      render: (report) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileBarChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{report.name}</p>
            <p className="text-xs text-muted-foreground">{report.type}</p>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (report) => (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {report.date}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (report) => getStatusBadge(report.status)
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'completed', label: 'Terminé' },
        { value: 'pending', label: 'En attente' },
        { value: 'generating', label: 'En cours' },
      ]
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'Académique', label: 'Académique' },
        { value: 'Statistiques', label: 'Statistiques' },
        { value: 'Bulletins', label: 'Bulletins' },
        { value: 'Présence', label: 'Présence' },
        { value: 'Financier', label: 'Financier' },
      ]
    }
  ];

  const gridItem = (report: Report) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileBarChart className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{report.name}</h3>
          {getStatusBadge(report.status)}
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {report.date}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-3 w-3" />
          {report.type}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        {report.status === 'completed' && (
          <>
            <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openViewDialog(report)}>
              <Eye className="h-3 w-3" />
              Voir
            </Button>
            <Button variant="outline" size="sm" className="gap-1 flex-1">
              <Download className="h-3 w-3" />
              Télécharger
            </Button>
          </>
        )}
        {report.status === 'generating' && (
          <Button variant="outline" size="sm" className="gap-1 flex-1" disabled>
            <span className="animate-spin">⏳</span>
            Génération...
          </Button>
        )}
        {report.status === 'pending' && (
          <Button variant="outline" size="sm" className="gap-1 flex-1">
            <FileText className="h-3 w-3" />
            Générer
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Générez et téléchargez des rapports
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Générer un nouveau rapport</DialogTitle>
              <DialogDescription>
                Sélectionnez le type de rapport à générer
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Nom du rapport</Label>
                <Input 
                  id="reportName" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Rapport Mensuel - Janvier 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportType">Type de rapport</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Académique">Académique</SelectItem>
                    <SelectItem value="Statistiques">Statistiques</SelectItem>
                    <SelectItem value="Bulletins">Bulletins</SelectItem>
                    <SelectItem value="Présence">Présence</SelectItem>
                    <SelectItem value="Financier">Financier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleGenerateReport} disabled={!formData.name || !formData.type}>
                Générer le rapport
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Report Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReport?.name}</DialogTitle>
              <DialogDescription>
                Rapport {selectedReport?.type} - Généré le {selectedReport?.date}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <FileBarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aperçu du rapport</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ce rapport contient les données de {selectedReport?.type}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataList
        data={reports}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher un rapport..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun rapport trouvé"
        itemsPerPage={6}
      />
    </div>
  );
}

