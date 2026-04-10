import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  School,
  Users,
  Calendar
} from 'lucide-react';

// Mock data for tuition
interface Tuition {
  id: string;
  studentName: string;
  class: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  dueDate: string;
}

const mockTuition: Tuition[] = [
  { id: '1', studentName: 'Moussa Sall', class: 'Terminale S1', academicYear: '2025-2026', totalAmount: 300000, paidAmount: 140000, remainingAmount: 160000, status: 'partial', dueDate: '30/09/2025' },
  { id: '2', studentName: 'Aïda Diop', class: '1ère S1', academicYear: '2025-2026', totalAmount: 270000, paidAmount: 270000, remainingAmount: 0, status: 'paid', dueDate: '30/09/2025' },
  { id: '3', studentName: 'Oumar Fall', class: 'Terminale S1', academicYear: '2025-2026', totalAmount: 300000, paidAmount: 0, remainingAmount: 300000, status: 'unpaid', dueDate: '30/09/2025' },
  { id: '4', studentName: 'Fatou Ndiaye', class: '3ème A', academicYear: '2025-2026', totalAmount: 220000, paidAmount: 110000, remainingAmount: 110000, status: 'partial', dueDate: '30/09/2025' },
  { id: '5', studentName: 'Ibrahima Sy', class: 'Terminale S2', academicYear: '2025-2026', totalAmount: 300000, paidAmount: 300000, remainingAmount: 0, status: 'paid', dueDate: '30/09/2025' },
  { id: '6', studentName: 'Mariama Diallo', class: '1ère S1', academicYear: '2025-2026', totalAmount: 270000, paidAmount: 135000, remainingAmount: 135000, status: 'partial', dueDate: '30/09/2025' },
  { id: '7', studentName: 'Cheikh Diop', class: 'Terminale S1', academicYear: '2025-2026', totalAmount: 300000, paidAmount: 0, remainingAmount: 300000, status: 'unpaid', dueDate: '30/09/2025' },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    unpaid: 'bg-red-100 text-red-700',
  };
  
  const labels: Record<string, string> = {
    paid: 'Payé',
    partial: 'Partiel',
    unpaid: 'Impayé',
  };
  
  return (
    <Badge className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

export default function Tuition() {
  const [tuitions] = useState<Tuition[]>(mockTuition);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const filteredTuitions = useMemo(() => {
    return tuitions.filter(t => {
      const matchesSearch = searchQuery === '' || 
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesClass = classFilter === 'all' || t.class === classFilter;
      
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [tuitions, searchQuery, statusFilter, classFilter]);

  const stats = useMemo(() => {
    const total = tuitions.length;
    const paid = tuitions.filter(t => t.status === 'paid').length;
    const partial = tuitions.filter(t => t.status === 'partial').length;
    const unpaid = tuitions.filter(t => t.status === 'unpaid').length;
    const totalAmount = tuitions.reduce((sum, t) => sum + t.totalAmount, 0);
    const paidAmount = tuitions.reduce((sum, t) => sum + t.paidAmount, 0);
    const remainingAmount = tuitions.reduce((sum, t) => sum + t.remainingAmount, 0);
    
    return { total, paid, partial, unpaid, totalAmount, paidAmount, remainingAmount };
  }, [tuitions]);

  const classes = [...new Set(tuitions.map(t => t.class))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scolarité</h1>
          <p className="text-muted-foreground">
            Suivi des paiements de scolarité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Élèves</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">Payé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
                <p className="text-xs text-muted-foreground">Partiel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
                <p className="text-xs text-muted-foreground">Impayé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amount Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total dû</p>
            <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} CFA</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total payé</p>
            <p className="text-2xl font-bold text-green-600">{stats.paidAmount.toLocaleString()} CFA</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Reste à payer</p>
            <p className="text-2xl font-bold text-red-600">{stats.remainingAmount.toLocaleString()} CFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par nom..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
                  <SelectItem value="unpaid">Impayé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tuition List */}
      <div className="grid gap-3">
        {filteredTuitions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun élève trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredTuitions.map((tuition) => (
            <Card key={tuition.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {tuition.studentName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{tuition.studentName}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {tuition.class} • {tuition.academicYear}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-muted-foreground">Progression</p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(tuition.paidAmount / tuition.totalAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{tuition.paidAmount.toLocaleString()} / {tuition.totalAmount.toLocaleString()} CFA</p>
                      <p className="text-xs text-muted-foreground">Reste: {tuition.remainingAmount.toLocaleString()} CFA</p>
                    </div>
                    <StatusBadge status={tuition.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
