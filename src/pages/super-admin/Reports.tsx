import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataList, Column } from '@/components/ui/data-list';
import { 
  FileText, 
  Download, 
  Calendar,
  FileBarChart,
  FilePieChart,
  FileTextIcon
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

const reports: Report[] = [
  { id: '1', name: 'Rapport Mensuel - Janvier 2025', type: 'Activité', date: '01/02/2025', size: '2.4 MB' },
  { id: '2', name: 'Statistiques Trimestrielle Q4', type: 'Statistiques', date: '15/01/2025', size: '5.1 MB' },
  { id: '3', name: 'Rapport Financier Annuel', type: 'Financier', date: '05/01/2025', size: '8.7 MB' },
  { id: '4', name: 'Analyse Utilisateurs', type: 'Utilisateurs', date: '28/12/2024', size: '3.2 MB' },
  { id: '5', name: 'Rapport Performance Écoles', type: 'Performance', date: '20/12/2024', size: '4.5 MB' },
  { id: '6', name: 'Rapport Mensuel - Décembre 2024', type: 'Activité', date: '15/12/2024', size: '2.3 MB' },
  { id: '7', name: 'Statistiques Trimestrielle Q3', type: 'Statistiques', date: '01/10/2024', size: '5.0 MB' },
];

export default function PlatformReports() {
  const columns: Column<Report>[] = [
    { 
      key: 'name', 
      label: 'Rapport', 
      sortable: true,
      render: (report) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileTextIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{report.name}</p>
            <p className="text-xs text-muted-foreground">{report.size}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true
    },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true
    },
  ];

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'Activité', label: 'Activité' },
        { value: 'Statistiques', label: 'Statistiques' },
        { value: 'Financier', label: 'Financier' },
        { value: 'Utilisateurs', label: 'Utilisateurs' },
        { value: 'Performance', label: 'Performance' },
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
          <p className="text-sm text-muted-foreground">{report.type}</p>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {report.date}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-3 w-3" />
          {report.size}
        </span>
      </div>
      <Button variant="outline" size="sm" className="w-full gap-2">
        <Download className="h-3 w-3" />
        Télécharger
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Générez et téléchargez des rapports détaillés
          </p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Nouveau Rapport
        </Button>
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
        itemsPerPage={5}
      />
    </div>
  );
}
