import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Settings, 
  Building2, 
  Bell,
  Save,
  Upload,
  DollarSign,
  Plus,
  Check,
  X,
  CreditCard,
  TrendingUp
} from 'lucide-react';

interface Fee {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  status: 'active' | 'inactive';
}

interface Payment {
  id: string;
  studentName: string;
  class: string;
  feeName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

const initialFees: Fee[] = [
  { id: '1', name: 'Scolarisation Annuelle', amount: 150000, category: 'Scolarité', dueDate: '30/09/2024', status: 'active' },
  { id: '2', name: 'Sémi Annuel', amount: 80000, category: 'Scolarité', dueDate: '31/01/2025', status: 'active' },
  { id: '3', name: 'Transport', amount: 50000, category: 'Transport', dueDate: '30/09/2024', status: 'active' },
  { id: '4', name: 'Cantine', amount: 25000, category: 'Cantine', dueDate: '30/09/2024', status: 'active' },
  { id: '5', name: 'Uniforme', amount: 35000, category: 'Autre', dueDate: '30/09/2024', status: 'inactive' },
];

const initialPayments: Payment[] = [
  { id: '1', studentName: 'Moussa Diop', class: 'Terminale S1', feeName: 'Scolarisation Annuelle', amount: 150000, date: '15/09/2024', status: 'paid' },
  { id: '2', studentName: 'Aïssatou Sall', class: '1ère S1', feeName: 'Scolarisation Annuelle', amount: 150000, date: '10/09/2024', status: 'paid' },
  { id: '3', studentName: 'Ousmane Touré', class: '2nde A', feeName: 'Scolarisation Annuelle', amount: 150000, date: '', status: 'pending' },
  { id: '4', studentName: 'Fatou Ndiaye', class: '3ème A', feeName: 'Transport', amount: 50000, date: '20/09/2024', status: 'paid' },
  { id: '5', studentName: 'Mamadou Diop', class: 'Terminale S2', feeName: 'Sémi Annuel', amount: 80000, date: '', status: 'overdue' },
];

export default function SchoolSettings() {
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>(initialFees);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newFee, setNewFee] = useState({
    name: '',
    amount: '',
    category: '',
    dueDate: '',
  });

  const handleAddFee = () => {
    const fee: Fee = {
      id: Date.now().toString(),
      name: newFee.name,
      amount: parseInt(newFee.amount),
      category: newFee.category,
      dueDate: newFee.dueDate,
      status: 'active',
    };
    setFees([...fees, fee]);
    setIsAddFeeDialogOpen(false);
    setNewFee({ name: '', amount: '', category: '', dueDate: '' });
  };

  const handleReceivePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedPayment) return;
    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { ...p, status: 'paid' as const, date: new Date().toLocaleDateString('fr-FR') }
        : p
    ));
    setIsPaymentDialogOpen(false);
    setSelectedPayment(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /> Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><TrendingUp className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'overdue':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" /> En retard</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalCollected = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres École</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres de votre école
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="academic">Académique</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'École
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo de l'école</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">LN</span>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Changer
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de l'école</Label>
                  <Input id="schoolName" defaultValue="Lycée National" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input id="schoolEmail" type="email" defaultValue="contact@lycee-national.sn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Téléphone</Label>
                  <Input id="schoolPhone" defaultValue="+221 33 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolAddress">Adresse</Label>
                  <Input id="schoolAddress" defaultValue="Dakar, Sénégal" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifications Parents</h4>
                  <p className="text-sm text-muted-foreground">Envoyer des notifications aux parents</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alertes Absences</h4>
                  <p className="text-sm text-muted-foreground">Notifier les absences d'élèves</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rappels Bulletins</h4>
                  <p className="text-sm text-muted-foreground">Rappeler la disponibilité des bulletins</p>
                </div>
                <Switch />
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres Académiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passingGrade">Note de Passage</Label>
                  <Input id="passingGrade" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGrade">Note Maximale</Label>
                  <Input id="maxGrade" type="number" defaultValue="20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Génération Automatique Bulletins</h4>
                  <p className="text-sm text-muted-foreground">Générer les bulletins automatiquement</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          {/* Financial Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Collecté</p>
                    <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString()} CFA</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En Attente</p>
                    <p className="text-2xl font-bold text-orange-600">{totalPending.toLocaleString()} CFA</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de Paiement</p>
                    <p className="text-2xl font-bold">{Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fees Management */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gestion des Frais
                </CardTitle>
                <CardDescription>
                  Gérez les frais de scolarité et autres paiements
                </CardDescription>
              </div>
              <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau Frais
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau frais</DialogTitle>
                    <DialogDescription>
                      Définissez les détails du frais
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Nom du frais</Label>
                      <Input 
                        value={newFee.name}
                        onChange={(e) => setNewFee({...newFee, name: e.target.value})}
                        placeholder="Ex: Scolarisation Annuelle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Montant (FCFA)</Label>
                      <Input 
                        type="number"
                        value={newFee.amount}
                        onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                        placeholder="150000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select value={newFee.category} onValueChange={(value) => setNewFee({...newFee, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scolarité">Scolarité</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Cantine">Cantine</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'échéance</Label>
                      <Input 
                        value={newFee.dueDate}
                        onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                        placeholder="30/09/2024"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddFeeDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleAddFee} disabled={!newFee.name || !newFee.amount}>Ajouter</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{fee.name}</p>
                      <p className="text-sm text-muted-foreground">{fee.category} - Échéance: {fee.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{fee.amount.toLocaleString()} CFA</span>
                      <Badge variant={fee.status === 'active' ? 'default' : 'outline'}>
                        {fee.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Tracking */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Suivi des Paiements
              </CardTitle>
              <CardDescription>
                Gérez les paiements des élèves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-muted-foreground">{payment.class} - {payment.feeName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{payment.amount.toLocaleString()} CFA</span>
                      {getStatusBadge(payment.status)}
                      {payment.status !== 'paid' && (
                        <Button size="sm" onClick={() => handleReceivePayment(payment)}>
                          Encaisser
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer le paiement</DialogTitle>
                <DialogDescription>
                  Enregistrer le paiement de {selectedPayment?.studentName}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedPayment && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Élève:</span>
                      <span className="font-medium">{selectedPayment.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Classe:</span>
                      <span className="font-medium">{selectedPayment.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais:</span>
                      <span className="font-medium">{selectedPayment.feeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-bold text-green-600">{selectedPayment.amount.toLocaleString()} CFA</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Annuler</Button>
                <Button onClick={confirmPayment} className="gap-2">
                  <Check className="h-4 w-4" />
                  Confirmer le paiement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

