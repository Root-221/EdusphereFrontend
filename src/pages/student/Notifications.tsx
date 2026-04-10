import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

const notifications = [
  { id: '1', title: 'Réunion parents-professeurs', message: 'Réunion le 15 janvier à 14h', type: 'event', date: '10/02/2025', unread: true },
  { id: '2', title: 'Bulletin disponible', message: 'Votre bulletin du 1er semestre est disponible', type: 'academic', date: '08/02/2025', unread: true },
  { id: '3', title: 'Devoir à rendre', message: 'N\'oubliez pas de rendre votre devoir de mathématiques', type: 'reminder', date: '05/02/2025', unread: false },
  { id: '4', title: 'Sortie scolaire', message: 'Sortie au musée prévue le 20 février', type: 'event', date: '01/02/2025', unread: false },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'event': return <Calendar className="h-5 w-5 text-primary" />;
    case 'academic': return <FileText className="h-5 w-5 text-primary" />;
    case 'reminder': return <AlertCircle className="h-5 w-5 text-warning" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function StudentNotifications() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          restez informé des dernières actualités
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`shadow-sm cursor-pointer ${notification.unread ? 'border-l-4 border-l-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${notification.unread ? 'bg-primary/10' : 'bg-muted'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-semibold truncate ${notification.unread ? '' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    {notification.unread && (
                      <Badge variant="default">Nouveau</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
