import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
  Users,
  Banknote,
  Calendar,
  Loader2
} from 'lucide-react';
import { parentApi, ParentPayment } from '@/lib/api-parent';
import { openPrintableWindow, writePrintableDocument } from '@/lib/print';

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
    case 'cancelled':
      return { 
        label: 'Annulé', 
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        badge: <Badge className="bg-destructive/20 text-destructive">Annulé</Badge>
      };
    default:
      return { 
        label: status, 
        icon: <Clock className="h-5 w-5 text-muted-foreground" />,
        badge: <Badge variant="outline">{status}</Badge>
      };
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case 'cash': return 'Espèces';
    case 'wave': return 'Wave';
    case 'orange_money': return 'Orange Money';
    default: return method;
  }
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString() + ' CFA';
};

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function Payments() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<ParentPayment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['parent', 'profile'],
    queryFn: parentApi.getProfile,
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['parent', 'payments'],
    queryFn: parentApi.getPayments,
  });

  const childrenOptions = profile?.children || [];

  const filteredPayments = payments.filter(payment => {
    if (selectedChild !== 'all' && payment.childId !== selectedChild) return false;
    return true;
  });

  const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
  const paidPayments = filteredPayments.filter(p => p.status === 'paid');
  const totalPending = pendingPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleViewPayment = (payment: ParentPayment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDownloadReceipt = (payment: ParentPayment) => {
    const printWindow = openPrintableWindow(`Reçu - ${payment.receiptNumber}`);
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres contextuelles pour imprimer le reçu.');
      return;
    }

    const receiptHtml = `
      <div class="print-page">
        <div class="minimal-ticket">
          <div class="ticket-header">
            <h1>EDUSPHERE</h1>
            <p>Reçu de paiement</p>
          </div>
          
          <div class="ticket-body">
            <div class="t-row">
              <span class="t-label">Reçu N°</span>
              <span class="t-value">${escapeHtml(payment.receiptNumber)}</span>
            </div>
            <div class="t-row">
              <span class="t-label">Date de paiement</span>
              <span class="t-value">${escapeHtml(payment.paymentDate || payment.dueDate)}</span>
            </div>
            <div class="t-empty"></div>
            
            <div class="t-row">
              <span class="t-label">Élève</span>
              <strong class="t-value">${escapeHtml(payment.childName)}</strong>
            </div>
            <div class="t-row">
              <span class="t-label">Motif</span>
              <span class="t-value">${escapeHtml(payment.title)}</span>
            </div>
            
            <div class="t-divider"></div>
            
            <div class="t-row t-total">
              <span class="t-label">Total réglé</span>
              <span class="t-amount">${formatAmount(payment.amount)}</span>
            </div>
            <div class="t-row">
              <span class="t-label">Moyen de paiement</span>
              <span class="t-value">${escapeHtml(getMethodLabel(payment.method))}</span>
            </div>
          </div>
          
          <div class="ticket-footer">
            <p>Merci de votre confiance.</p>
          </div>
        </div>
      </div>
    `;

    const styles = `
      @page { margin: 0; }
      body { background: #fdfdfd; font-family: monospace; color: #111; }
      .print-page {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
      .minimal-ticket {
        width: 320px;
        border: 1px dashed #ccc;
        padding: 24px;
        background: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      }
      .ticket-header {
        text-align: center;
        margin-bottom: 24px;
      }
      .ticket-header h1 {
        margin: 0 0 5px;
        font-size: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .ticket-header p {
        margin: 0;
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
      }
      .ticket-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .t-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 14px;
      }
      .t-label { color: #666; }
      .t-value { text-align: right; }
      .t-empty { height: 10px; }
      .t-divider {
        border-bottom: 1px dashed #ccc;
        margin: 12px 0;
      }
      .t-total { align-items: center; margin-top: 8px; }
      .t-total .t-label { font-size: 16px; font-weight: bold; color: #111; }
      .t-amount { font-size: 22px; font-weight: bold; }
      .ticket-footer {
        margin-top: 32px;
        text-align: center;
        font-size: 12px;
        color: #888;
      }
      @media print {
        body { background: white; }
        .print-page { padding: 0; }
        .minimal-ticket { border: none; box-shadow: none; width: 100%; max-width: 400px; margin: 0 auto; }
      }
    `;

    writePrintableDocument(printWindow, `Reçu - ${payment.receiptNumber}`, receiptHtml, styles);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les transactions financières liées à vos enfants
        </p>
      </div>

      {childrenOptions.length > 0 && (
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
                  {childrenOptions.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

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
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total payé</p>
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''} trouvée{filteredPayments.length !== 1 ? 's' : ''}
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

      {filteredPayments.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Wallet className="h-10 w-10 mb-3 opacity-20" />
            <p>Aucun paiement n'est lié à ce filtrage.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            return (
              <Card key={payment.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Banknote className="h-5 w-5" />
                    </div>
                    {statusInfo.badge}
                  </div>
                  <h3 className="font-semibold mb-1 truncate" title={payment.title}>{payment.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 truncate">Élève: {payment.childName}</p>
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
                        Date d'émission: {payment.dueDate}
                      </p>
                    )}
                  </div>
                  
                  {payment.status === 'paid' && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => handleDownloadReceipt(payment)}
                    >
                      <Download className="h-4 w-4" />
                      Télécharger Reçu
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
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {payment.status === 'paid' 
                            ? `Élève: ${payment.childName} | Payé le ${payment.paymentDate}` 
                            : `Élève: ${payment.childName} | Date: ${payment.dueDate}`
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
                  <Banknote className="h-5 w-5" />
                  Informations de facture
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total exigé</p>
                  <p className="text-2xl font-bold">{formatAmount(selectedPayment.amount)}</p>
                </div>

                <div className="space-y-3 p-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concerne</span>
                    <span className="font-medium truncate max-w-[200px]" title={selectedPayment.childName}>{selectedPayment.childName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Motif</span>
                    <span className="font-medium">{selectedPayment.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Statut</span>
                    {getStatusInfo(selectedPayment.status).badge}
                  </div>
                  {selectedPayment.status === 'paid' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payé le</span>
                      <span className="font-medium">{selectedPayment.paymentDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                {selectedPayment.status === 'paid' && (
                  <Button 
                    className="w-full gap-2"
                    onClick={() => {
                      handleDownloadReceipt(selectedPayment);
                      setIsModalOpen(false);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le reçu
                  </Button>
                )}
                <Button variant="outline" className="w-full mt-2 sm:mt-0" onClick={() => setIsModalOpen(false)}>
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
