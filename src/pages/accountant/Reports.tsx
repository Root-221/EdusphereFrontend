import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  PieChart
} from 'lucide-react';

// Mock data for financial reports
const monthlyData = [
  { month: 'Jan', income: 4500000, expenses: 2800000 },
  { month: 'Fév', income: 5200000, expenses: 3100000 },
  { month: 'Mar', income: 4800000, expenses: 2900000 },
  { month: 'Avr', income: 6100000, expenses: 3500000 },
  { month: 'Mai', income: 5500000, expenses: 3200000 },
  { month: 'Juin', income: 4900000, expenses: 3000000 },
];

const paymentMethodsData = [
  { method: 'Espèces', amount: 4500000, percentage: 35 },
  { method: 'Wave', amount: 5200000, percentage: 40 },
  { method: 'Orange Money', amount: 3300000, percentage: 25 },
];

const categoriesData = [
  { category: 'Scolarités', amount: 8500000, percentage: 65 },
  { category: 'Inscriptions', amount: 2500000, percentage: 19 },
  { category: 'Transport', amount: 1200000, percentage: 9 },
  { category: 'Cantine', amount: 800000, percentage: 6 },
];

export default function Reports() {
  const [period, setPeriod] = useState('2025');

  const stats = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const balance = totalIncome - totalExpenses;
    const avgMonthlyIncome = totalIncome / monthlyData.length;
    const avgMonthlyExpenses = totalExpenses / monthlyData.length;
    
    return { totalIncome, totalExpenses, balance, avgMonthlyIncome, avgMonthlyExpenses };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports Financiers</h1>
          <p className="text-muted-foreground">
            Analyse des finances de l'école
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalIncome.toLocaleString()} CFA</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dépenses totales</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalExpenses.toLocaleString()} CFA</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde</p>
                <p className="text-2xl font-bold text-blue-600">{stats.balance.toLocaleString()} CFA</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moy. mensuelle</p>
                <p className="text-2xl font-bold">{stats.avgMonthlyIncome.toLocaleString()} CFA</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenus vs Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-muted-foreground">
                      {((data.income - data.expenses) / 1000000).toFixed(1)}M CFA
                    </span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div 
                      className="bg-green-500 rounded-l"
                      style={{ width: `${(data.income / (data.income + data.expenses)) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500 rounded-r"
                      style={{ width: `${(data.expenses / (data.income + data.expenses)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Revenus: {data.income.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Dépenses: {data.expenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Par mode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodsData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{data.method}</span>
                    <span className="text-muted-foreground">{data.amount.toLocaleString()} CFA</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{data.percentage}% du total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoriesData.map((data, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{data.category}</span>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{data.amount.toLocaleString()} CFA</p>
                <p className="text-sm text-muted-foreground">{data.percentage}% du total</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Élèves payants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">45</p>
                <p className="text-xs text-muted-foreground">Transactions ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Jours restants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
