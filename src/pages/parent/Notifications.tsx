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
  Bell,
  Calendar,
  FileText,
  AlertCircle,
  Users,
  Grid3X3,
  List,
  Filter,
  CheckCircle,
  BookOpen,
  Wallet,
  ClipboardCheck,
  X
} from 'lucide-react';

// Initial mock notifications
const initialNotifications = [
  { id: '1', title: 'Réunion parents-professeurs', message: 'Réunion le 15 janvier à 14h dans la salle polyvalente', type: 'event', date: '10/02/2025', unread: true },
  { id: '2', title: 'Bulletin disponible', message: 'Le bulletin du Semestre 2 est disponible pour téléchargement', type: 'academic', date: '08/02/2025', unread: true },
  { id: '3', title: 'Échéance paiement', message: 'Rappel: paiement de la scolarité dû le 15 février', type: 'payment', date: '05/02/2025', unread: false },
  { id: '4', title: 'Nouveau devoir', message: 'Un nouveau devoir de Mathématiques a été publié pour Terminale S1', type: 'assignment', date: '04/02/2025', unread: true },
  { id: '5', title: 'Composition prévue', message: 'Composition de Physique prévue le 20 février', type: 'exam', date: '03/02/2025', unread: false },
  { id: '6', title: 'Absence signalée', message: 'Votre enfant Oumar était absent le 11 février', type: 'attendance', date: '11/02/2025', unread: false },
  { id: '7', title: 'Note publiée', message: 'Nouvelle note de Français publiée pour Aïssatou', type: 'academic', date: '02/02/2025', unread: true },
  { id: '8', title: 'Transport scolaire', message: 'Inscription au transport scolaire - trimestre 3', type: 'payment', date: '01/02/2025', unread: false },
];

const notificationTypes = [
  { value: 'all', label: 'Tous les types' },
  { value: 'event', label: 'Événement' },
  { value: 'academic', label: 'Académie' },
  { value: 'payment', label: 'Paiement' },
  { value: 'assignment', label: 'Devoir' },
  { value: 'exam', label: 'Composition' },
  { value: 'attendance', label: 'Présence' },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'event': return <Calendar className="h-5 w-5 text-primary" />;
    case 'academic': return <FileText className="h-5 w-5 text-primary" />;
    case 'payment': return <Wallet className="h-5 w-5 text-warning" />;
    case 'assignment': return <BookOpen className="h-5 w-5 text-primary" />;
    case 'exam': return <ClipboardCheck className="h-5 w-5 text-warning" />;
    case 'attendance': return <Users className="h-5 w-5 text-destructive" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'event': return <Badge className="bg-primary/10 text-primary">Événement</Badge>;
    case 'academic': return <Badge className="bg-primary/10 text-primary">Académie</Badge>;
    case 'payment': return <Badge className="bg-warning/10 text-warning">Paiement</Badge>;
    case 'assignment': return <Badge className="bg-success/10 text-success">Devoir</Badge>;
    case 'exam': return <Badge className="bg-warning/10 text-warning">Composition</Badge>;
    case 'attendance': return <Badge className="bg-destructive/10 text-destructive">Présence</Badge>;
    default: return <Badge variant="outline">{type}</Badge>;
  }
};

export default function ParentNotifications() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof initialNotifications[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (selectedType !== 'all' && notif.type !== selectedType) return false;
    return true;
  });

  // Stats
  const unreadCount = notifications.filter(n => n.unread).length;
  const totalCount = notifications.length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleViewNotification = (notification: typeof initialNotifications[0]) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read when viewed
    if (notification.unread) {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Restez informé des dernières actualités
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold text-warning">{unreadCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lues</p>
                <p className="text-2xl font-bold text-success">{totalCount - unreadCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Toggle */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3 flex-1">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Type de notification" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Tout marquer comme lu
                </Button>
              )}
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
          </div>
        </CardContent>
      </Card>

      {/* Notifications Grid/List - GRID by default */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`shadow-sm hover:shadow-md transition-all cursor-pointer ${
                notification.unread ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => handleViewNotification(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${
                    notification.unread ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold ${notification.unread ? '' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      {notification.unread && (
                        <Badge variant="default" className="shrink-0">Nouveau</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      {getTypeBadge(notification.type)}
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`shadow-sm hover:shadow-md transition-all cursor-pointer ${
                notification.unread ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => handleViewNotification(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                      notification.unread ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${notification.unread ? '' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        {notification.unread && (
                          <Badge variant="default" className="shrink-0">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {getTypeBadge(notification.type)}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{notification.date}</p>
                    {notification.unread && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
          <p className="text-muted-foreground">Vous n'avez aucune notification de ce type.</p>
        </div>
      )}

      {/* Notification Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {getIcon(selectedNotification.type)}
                  </div>
                  {selectedNotification.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedNotification.date}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{selectedNotification.message}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  {getTypeBadge(selectedNotification.type)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  {selectedNotification.unread ? (
                    <Badge className="bg-warning/10 text-warning">Non lue</Badge>
                  ) : (
                    <Badge className="bg-success/10 text-success">Lue</Badge>
                  )}
                </div>
              </div>

              <DialogFooter>
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

