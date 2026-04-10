import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  PieChart,
  BarChart3,
  Wallet,
  Banknote,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountantDashboard() {
  const navigate = useNavigate();
  
  // Mock data for accountant dashboard
  const stats = {
    totalCollected: 12450000,
    pendingPayments: 3450000,
    monthlyTarget: 15000000,
    studentsCount: 156,
    paidStudents: 98,
    partialStudents: 42,
    unpaidStudents: 16,
  };

  const recentTransactions = [
    { id: 1, student: 'Moussa Sall', class: 'Terminale S1', amount: 140000, method: 'wave', status: 'completed', time: 'Il y a 2h' },
    { id: 2, student: 'Aïda Diop', class: '1ère S1', amount: 135000, method: 'cash', status: 'completed', time: 'Il y a 4h' },
    { id: 3, student: 'Oumar Fall', class: 'Terminale S1', amount: 140000, method: 'wave', status: 'pending', time: 'Il y a 5h' },
    { id: 4, student: 'Fatou Ndiaye', class: '3ème A', amount: 110000, method: 'orange_money', status: 'completed', time: 'Hier' },
    { id: 5, student: 'Ibrahima Sy', class: 'Terminale S2', amount: 140000, method: 'wave', status: 'failed', time: 'Hier' },
  ];

  const pendingPayments = [
    { id: 1, student: 'Oumar Fall', class: 'Terminale S1', amount: 140000, dueDate: '30/04/2025' },
    { id: 2, student: 'Mariama Diallo', class: '1ère S1', amount: 135000, dueDate: '30/04/2025' },
    { id: 3, student: 'Cheikh Diop', class: 'Terminale S1', amount: 140000, dueDate: '15/05/2025' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  const progressPercent = Math.round((stats.totalCollected / stats.monthlyTarget) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Comptable</h1>
          <p className="text-muted-foreground">
            Gestion des finances et des paiements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/tuition')}>
            <PieChart className="h-4 w-4 mr-2" />
            Scolarité
          </Button>
          <Button onClick={() => navigate('/accountant-payments')}>
            <CreditCard className="h-4 w-4 mr-2" />
            Paiements
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total collecté</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Objectif mensuel: {formatCurrency(stats.monthlyTarget)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingPayments)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.partialStudents} paiements partiels
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Élèves payants</p>
                <p className="text-2xl font-bold">{stats.studentsCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.paidStudents} payé(s) • {stats.unpaidStudents} impayé(s)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de collecte</p>
                <p className="text-2xl font-bold text-blue-600">{progressPercent}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Progression mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Collecté</span>
                <span className="font-medium">{formatCurrency(stats.totalCollected)} / {formatCurrency(stats.monthlyTarget)}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{progressPercent}% atteint</span>
                <span>{formatCurrency(stats.monthlyTarget)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/accountant-payments')}>
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Enregistrer paiement
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/tuition')}>
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Suivi scolarité
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/financial-reports')}>
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Rapports
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Pending Payments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Transactions récentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/accountant-payments')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100' : 
                      transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {transaction.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : transaction.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.student}</p>
                      <p className="text-xs text-muted-foreground">{transaction.class} • {transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.method === 'cash' ? 'Espèces' : 
                       transaction.method === 'wave' ? 'Wave' : 'Orange Money'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Paiements en attente</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tuition')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.student}</p>
                      <p className="text-xs text-muted-foreground">{payment.class} • Échéance: {payment.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-700">{formatCurrency(payment.amount)}</p>
                    <Button size="sm" variant="outline" className="text-xs mt-1">
                      Relancer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Répartition par mode de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Espèces</p>
                <p className="text-xl font-bold">4 500 000 CFA</p>
                <p className="text-xs text-green-600">36% du total</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wave</p>
                <p className="text-xl font-bold">5 200 000 CFA</p>
                <p className="text-xs text-purple-600">42% du total</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orange Money</p>
                <p className="text-xl font-bold">2 800 000 CFA</p>
                <p className="text-xs text-orange-600">22% du total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
