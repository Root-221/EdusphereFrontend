import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: number | string;
  action: string;
  school?: string;
  user?: string;
  time: string;
}

interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ title = "Activité Récente", activities, className }: ActivityFeedProps) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={cn(
                "flex items-start gap-4 pb-4",
                index !== activities.length - 1 && "border-b"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.action}</p>
                {activity.school && (
                  <p className="text-xs text-muted-foreground">{activity.school}</p>
                )}
                {activity.user && (
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
