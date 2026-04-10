import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataList, Column } from '@/components/ui/data-list';
import {
  Download,
  Shield,
  User,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Log {
  id: string;
  action: string;
  user: string;
  school: string;
  date: string;
  status: string;
}

const logs: Log[] = [
  { id: '1', action: 'Connexion Admin', user: 'Fatou Sow', school: 'Lycée National', date: '10/02/2025 14:32', status: 'success' },
  { id: '2', action: 'Création École', user: 'Mohamed Diallo', school: 'Plateforme', date: '10/02/2025 13:15', status: 'success' },
  { id: '3', action: 'Échec Connexion', user: 'inconnu', school: 'Collège Moderne', date: '10/02/2025 12:45', status: 'warning' },
  { id: '4', action: 'Modification Note', user: 'Aminata Ba', school: 'Lycée National', date: '10/02/2025 11:20', status: 'success' },
  { id: '5', action: 'Suppression Élève', user: 'Mamadou Diop', school: 'Collège Moderne', date: '10/02/2025 10:05', status: 'warning' },
  { id: '6', action: 'Export Bulletins', user: 'Ibrahima Ndiaye', school: 'Lycée Technique', date: '09/02/2025 16:30', status: 'success' },
  { id: '7', action: 'Modification Paramètres', user: 'Alioune Fall', school: 'Lycée National', date: '09/02/2025 15:00', status: 'success' },
  { id: '8', action: 'Tentative Accès Non Autorisé', user: 'inconnu', school: 'École Privée', date: '09/02/2025 14:00', status: 'error' },
];

export default function PlatformLogs() {
  const columns: Column<Log>[] = [
    {
      key: 'action',
      label: 'Action',
      sortable: true
    },
    {
      key: 'user',
      label: 'Utilisateur',
      sortable: true,
      render: (log) => (
        <span className="flex items-center gap-1 text-sm">
          <User className="h-3 w-3" />
          {log.user}
        </span>
      )
    },
    {
      key: 'school',
      label: 'École',
      sortable: true
    },
    {
      key: 'status',
      label: 'Statut',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            log.status === 'success' ? 'bg-success/10' : log.status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
          }`}>
            {log.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : log.status === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </div>
          <Badge variant={log.status === 'success' ? 'secondary' : log.status === 'warning' ? 'outline' : 'destructive'}>
            {log.status === 'success' ? 'Succès' : log.status === 'warning' ? 'Avertissement' : 'Erreur'}
          </Badge>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (log) => (
        <span className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          {log.date}
        </span>
      )
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'success', label: 'Succès' },
        { value: 'warning', label: 'Avertissement' },
        { value: 'error', label: 'Erreur' },
      ]
    },
    {
      key: 'school',
      label: 'École',
      options: [
        { value: 'Lycée National', label: 'Lycée National' },
        { value: 'Collège Moderne', label: 'Collège Moderne' },
        { value: 'Lycée Technique', label: 'Lycée Technique' },
        { value: 'École Privée', label: 'École Privée' },
      ]
    }
  ];

  const gridItem = (log: Log) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          log.status === 'success' ? 'bg-success/10' : log.status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
        }}`}>
          {log.status === 'success' ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : log.status === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{log.action}</h3>
          <Badge variant={log.status === 'success' ? 'secondary' : log.status === 'warning' ? 'outline' : 'destructive'}>
            {log.status === 'success' ? 'Succès' : log.status === 'warning' ? 'Avertissement' : 'Erreur'}
          </Badge>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3" />
          {log.user}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-3 w-3" />
          {log.school}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {log.date}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs & Audit</h1>
          <p className="text-muted-foreground">
            Historique des actions et connexions
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter Logs
        </Button>
      </div>

      <DataList
        data={logs}
        columns={columns}
        searchKey="action"
        searchPlaceholder="Rechercher une action..."
        filterOptions={filterOptions}
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun log trouvé"
        itemsPerPage={5}
      />
    </div>
  );
}
