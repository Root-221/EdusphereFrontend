import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Wallet,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Grid3X3,
  List,
  Filter,
  Receipt,
  Banknote,
  Calendar,
  Users
} from 'lucide-react';

// Mock children data
const children = [
  { id: '1', name: 'Oumar Fall' },
  { id: '2', name: 'Aïssatou Fall' },
];

// Mock payment data
const mockPayments = [
  { 
    id: '1', 
    childId: '1',
    title: 'Scolarité - Mars 2025', 
    amount: 25000, 
    status: 'pending', 
    dueDate: '15/03/2025',
    paymentDate: '',
    type: 'schooling'
  },
  { 
    id: '2', 
    childId: '1',
    title: 'Scolarité - Février 2025', 
    amount: 25000, 
    status: 'paid', 
    dueDate: '15/02/2025',
    paymentDate: '12/02/2025',
    type: 'schooling'
  },
  { 
    id: '3', 
    childId: '1',
    title: 'Scolarité - Janvier 2025', 
    amount: 25000, 
    status: 'paid', 
    dueDate: '15/01/2025',
    paymentDate: '10/01/2025',
    type: 'schooling'
  },
  { 
    id: '4', 
    childId: '1',
    title: 'Transport - Trimestre 2', 
    amount: 15000, 
    status: 'paid', 
    dueDate: '01/02/2025',
    paymentDate: '30/01/2025',
    type: 'transport'
  },
  { 
    id: '5', 
    childId: '1',
    title: 'Cantine - Février 2025', 
    amount: 12000, 
    status: 'pending', 
    dueDate: '28/02/2025',
    paymentDate: '',
    type: 'canteen'
  },
  { 
    id: '6', 
    childId: '1',
    title: 'Scolarité - Décembre 2024', 
    amount: 25000, 
    status: 'paid', 
    dueDate: '15/12/2024',
    paymentDate: '10/12/2024',
    type: 'schooling'
  },
  { 
    id: '7', 
    childId: '2',
    title: 'Scolarité - Mars 2025', 
    amount: 25000, 
    status: 'paid', 
    dueDate: '15/03/2025',
    paymentDate: '10/03/2025',
    type: 'schooling'
  },
  { 
    id: '8', 
    childId: '2',
    title: 'Scolarité - Février 2025', 
    amount: 25000, 
    status: 'paid', 
    dueDate: '15/02/2025',
    paymentDate: '08/02/2025',
    type: 'schooling'
  },
];

const academicYears = ['2024-2025', '2023-2024'];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'paid':
      return { 
        label: 'Payé', 
        icon: <CheckCircle className="h-5 w-5 text-success" />,
        badge: <Badge className="bg-success/20 text-success">Payé</Badge>
      };
    case 'pending':
      return { 
        label: 'En attente', 
        icon: <Clock className="h-5 w-5 text-warning" />,
        badge: <Badge className="bg-warning/20 text-warning">En attente</Badge>
      };
    case 'overdue':
      return { 
        label: 'En retard', 
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        badge: <Badge className="bg-destructive/20 text-destructive">En retard</Badge>
      };
    default:
      return { 
        label: status, 
        icon: <Clock className="h-5 w-5 text-muted-foreground" />,
        badge: <Badge variant="outline">{status}</Badge>
      };
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'schooling': return <Banknote className="h-5 w-5" />;
    case 'transport': return <CreditCard className="h-5 w-5" />;
    case 'canteen': return <Receipt className="h-5 w-5" />;
    default: return <Wallet className="h-5 w-5" />;
  }
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString() + ' CFA';
};

export default function Payments() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter payments
  const filteredPayments = mockPayments.filter(payment => {
    if (selectedChild !== 'all' && payment.childId !== selectedChild) return false;
    // Year filtering would need proper date parsing in real app
    return true;
  });

  // Calculate stats
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
  const paidPayments = filteredPayments.filter(p => p.status === 'paid');
  const totalPending = pendingPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleViewPayment = (payment: typeof mockPayments[0]) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDownloadReceipt = (payment: typeof mockPayments[0]) => {
    console.log('Download receipt:', payment.id);
    alert(`Téléchargement du reçu pour ${payment.title}...`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les paiements de scolarité
        </p>
      </div>

      {/* Child Filter */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Tous les enfants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les enfants</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Solde dû</p>
                <p className="text-2xl font-bold">{formatAmount(totalPending)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-white text-primary hover:bg-white/90"
              disabled={pendingPayments.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payer maintenant
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payé cette année</p>
                <p className="text-2xl font-bold text-success">{formatAmount(totalPaid)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">{pendingPayments.length}</p>
                <p className="text-xs text-muted-foreground">factures</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year Filter */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtre</span>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Année académique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPayments.length} paiement{filteredPayments.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Payments Grid/List - GRID by default */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            return (
              <Card key={payment.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {getTypeIcon(payment.type)}
                    </div>
                    {statusInfo.badge}
                  </div>
                  <h3 className="font-semibold mb-1">{payment.title}</h3>
                  <p className="text-lg font-bold mb-3">{formatAmount(payment.amount)}</p>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {payment.status === 'paid' ? (
                      <p className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Payé le {payment.paymentDate}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Échéance: {payment.dueDate}
                      </p>
                    )}
                  </div>
                  
                  {payment.status === 'pending' ? (
                    <Button 
                      className="w-full gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Payer
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => handleDownloadReceipt(payment)}
                    >
                      <Download className="h-4 w-4" />
                      Reçu
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            return (
              <Card 
                key={payment.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewPayment(payment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        {getTypeIcon(payment.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.status === 'paid' 
                            ? `Payé le ${payment.paymentDate}` 
                            : `Échéance: ${payment.dueDate}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-lg font-bold">{formatAmount(payment.amount)}</p>
                      {statusInfo.badge}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedPayment.type)}
                  {selectedPayment.title}
                </DialogTitle>
                <DialogDescription>
                  Détails du paiement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold">{formatAmount(selectedPayment.amount)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    {getStatusInfo(selectedPayment.status).badge}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Échéance</span>
                    <span className="font-medium">{selectedPayment.dueDate}</span>
                  </div>
                  {selectedPayment.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payé le</span>
                      <span className="font-medium">{selectedPayment.paymentDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedPayment.status === 'paid' ? (
                  <Button 
                    className="gap-2"
                    onClick={() => {
                      handleDownloadReceipt(selectedPayment);
                      setIsModalOpen(false);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger reçu
                  </Button>
                ) : (
                  <Button className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payer maintenant
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

