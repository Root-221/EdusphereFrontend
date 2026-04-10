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
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Banknote,
  Smartphone,
  Calendar,
  User,
  School
} from 'lucide-react';

// Mock data for payments
interface Payment {
  id: string;
  studentName: string;
  parentName: string;
  class: string;
  amount: number;
  method: 'cash' | 'wave' | 'orange_money';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  transactionId?: string;
}

const mockPayments: Payment[] = [
  { id: '1', studentName: 'Moussa Sall', parentName: 'Cheikh Sall', class: 'Terminale S1', amount: 140000, method: 'wave', status: 'completed', date: '20/04/2025', transactionId: 'WV-20250415-001' },
  { id: '2', studentName: 'Aïda Diop', parentName: 'Moussa Diop', class: '1ère S1', amount: 135000, method: 'cash', status: 'completed', date: '22/04/2025' },
  { id: '3', studentName: 'Oumar Fall', parentName: 'Mamadou Fall', class: 'Terminale S1', amount: 140000, method: 'wave', status: 'pending', date: '25/04/2025' },
  { id: '4', studentName: 'Fatou Ndiaye', parentName: 'Ibrahima Ndiaye', class: '3ème A', amount: 110000, method: 'orange_money', status: 'completed', date: '18/04/2025', transactionId: 'OM-20240418-045' },
  { id: '5', studentName: 'Ibrahima Sy', parentName: 'Ousmane Sy', class: 'Terminale S2', amount: 140000, method: 'wave', status: 'completed', date: '15/04/2025', transactionId: 'WV-20250415-002' },
  { id: '6', studentName: 'Mariama Diallo', parentName: 'Boubacar Diallo', class: '1ère S1', amount: 135000, method: 'cash', status: 'pending', date: '26/04/2025' },
  { id: '7', studentName: 'Cheikh Diop', parentName: 'Moussa Diop', class: 'Terminale S1', amount: 140000, method: 'orange_money', status: 'failed', date: '24/04/2025' },
];

function PaymentMethodIcon({ method }: { method: string }) {
  switch (method) {
    case 'cash':
      return <Banknote className="w-5 h-5 text-green-600" />;
    case 'wave':
      return <Smartphone className="w-5 h-5 text-purple-600" />;
    case 'orange_money':
      return <DollarSign className="w-5 h-5 text-orange-500" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  
  const labels: Record<string, string> = {
    pending: 'En attente',
    completed: 'Payé',
    failed: 'Échoué',
  };
  
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3 mr-1" />,
    completed: <CheckCircle className="w-3 h-3 mr-1" />,
    failed: <XCircle className="w-3 h-3 mr-1" />,
  };
  
  return (
    <Badge className={styles[status]}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
}

export default function Payments() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Get unique classes
  const classes = [...new Set(payments.map(p => p.class))];

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = searchQuery === '' || 
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchesClass = classFilter === 'all' || p.class === classFilter;
      
      return matchesSearch && matchesStatus && matchesMethod && matchesClass;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, classFilter]);

  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { total, completed, pending, totalAmount };
  }, [payments]);

  const viewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">
            Gérez les paiements des frais de scolarité
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
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Payés</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">CFA collectés</p>
              </div>
            </div>
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
                  <SelectItem value="completed">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
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

      {/* Payments List */}
      <div className="grid gap-3">
        {filteredPayments.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun paiement trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {payment.studentName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{payment.studentName}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {payment.parentName} • {payment.class}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-semibold">{payment.amount.toLocaleString()} CFA</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <PaymentMethodIcon method={payment.method} />
                        {payment.method === 'cash' ? 'Espèces' : 
                         payment.method === 'wave' ? 'Wave' : 'Orange Money'}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                    
                    <Button variant="outline" size="icon" onClick={() => viewPayment(payment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Détails du paiement</DialogTitle>
                <DialogDescription>
                  Transaction du {selectedPayment.date}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <StatusBadge status={selectedPayment.status} />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informations</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Élève:</span>
                      <span className="font-medium">{selectedPayment.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Classe:</span>
                      <span className="font-medium">{selectedPayment.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parent:</span>
                      <span className="font-medium">{selectedPayment.parentName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Paiement</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-bold text-lg">{selectedPayment.amount.toLocaleString()} CFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <span className="font-medium flex items-center gap-1">
                        <PaymentMethodIcon method={selectedPayment.method} />
                        {selectedPayment.method === 'cash' ? 'Espèces' : 
                         selectedPayment.method === 'wave' ? 'Wave' : 'Orange Money'}
                      </span>
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction:</span>
                        <span className="font-medium">{selectedPayment.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
                {selectedPayment.status === 'pending' && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
