import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'info' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-card border shadow-card hover:shadow-card-hover',
    icon: 'bg-secondary text-secondary-foreground',
    title: 'text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    card: 'bg-gradient-primary text-primary-foreground border-0 shadow-lg',
    icon: 'bg-white/20 text-white',
    title: 'text-white/80',
    value: 'text-white',
  },
  accent: {
    card: 'bg-gradient-accent text-accent-foreground border-0 shadow-lg',
    icon: 'bg-white/20 text-accent-foreground',
    title: 'text-accent-foreground/80',
    value: 'text-accent-foreground',
  },
  success: {
    card: 'bg-success/10 border-success/20',
    icon: 'bg-success/20 text-success',
    title: 'text-success/80',
    value: 'text-success',
  },
  info: {
    card: 'bg-info/10 border-info/20',
    icon: 'bg-info/20 text-info',
    title: 'text-info/80',
    value: 'text-info',
  },
  warning: {
    card: 'bg-warning/10 border-warning/20',
    icon: 'bg-warning/20 text-warning',
    title: 'text-warning/80',
    value: 'text-warning',
  },
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  subtitle,
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6 transition-all duration-300",
      styles.card,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium", styles.title)}>{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {subtitle && (
            <p className={cn("text-sm", styles.title)}>{subtitle}</p>
          )}
          {description && (
            <p className={cn("text-sm", styles.title)}>{description}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          styles.icon
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      {children}
    </div>
  );
}
