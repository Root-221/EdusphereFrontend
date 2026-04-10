import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, className, children }: ChartCardProps) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// EduSphere brand colors for charts
const CHART_COLORS = [
  'hsl(220, 68%, 33%)',  // Primary Blue
  'hsl(40, 92%, 55%)',   // Accent Yellow
  'hsl(198, 100%, 45%)', // Info Blue
  'hsl(142, 72%, 42%)',  // Success Green
  'hsl(220, 68%, 50%)',  // Lighter Blue
  'hsl(40, 92%, 70%)',   // Lighter Yellow
  'hsl(0, 84%, 60%)',    // Destructive Red
];

interface SchoolTypeChartProps {
  data: Record<string, number>;
}

const schoolTypeLabels: Record<string, string> = {
  public: 'Publique',
  private: 'Privée',
  college: 'Collège',
  lycee: 'Lycée',
  university: 'Université',
  institute: 'Institut',
  coranic: 'Coranique',
};

export function SchoolTypeChart({ data }: SchoolTypeChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: schoolTypeLabels[key] || key,
      value,
    }));

  return (
    <ChartCard title="Écoles par Type">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface PlanDistributionChartProps {
  data: Record<string, number>;
}

const planLabels: Record<string, string> = {
  free: 'Gratuit',
  basic: 'Basique',
  premium: 'Premium',
  enterprise: 'Entreprise',
};

export function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: planLabels[key] || key,
    schools: value,
  }));

  return (
    <ChartCard title="Distribution par Plan">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid hsl(var(--border))',
              }} 
            />
            <Bar 
              dataKey="schools" 
              fill="hsl(220, 68%, 33%)" 
              radius={[0, 4, 4, 0]}
              name="Écoles"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
