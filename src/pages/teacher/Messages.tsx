import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataList, Column } from '@/components/ui/data-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Send,
  Mail,
  Calendar,
  Plus,
  User,
  Users,
  Search
} from 'lucide-react';

// Types
interface Message {
  id: string;
  from: string;
  fromId: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  type: 'received' | 'sent';
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'student';
  child?: string;
}

// Données mock - Contacts
const contacts: Contact[] = [
  { id: '1', name: 'Mariama Diop', email: 'mariama.diop@email.com', role: 'parent', child: 'Amadou Diop - Terminale S1' },
  { id: '2', name: 'Ibrahima Ndiaye', email: 'ibrahima.ndiaye@email.com', role: 'parent', child: 'Fatou Ndiaye - 1ère S1' },
  { id: '3', name: 'Fatou Barry', email: 'fatou.barry@email.com', role: 'student', child: '她自己 - Terminale S1' },
  { id: '4', name: 'Mamadou Sy', email: 'mamadou.sy@email.com', role: 'parent', child: 'Moussa Sy - Terminale S2' },
  { id: '5', name: 'Aïssatou Ndiaye', email: 'aissatou.ndiaye@email.com', role: 'student', child: '她自己 - Terminale S1' },
  { id: '6', name: 'Ousmane Fall', email: 'ousmane.fall@email.com', role: 'parent', child: 'Mariama Fall - 2nde A' },
  { id: '7', name: 'Khady Sow', email: 'khady.sow@email.com', role: 'parent', child: 'Moussa Sow - Terminale S1' },
  { id: '8', name: 'Moussa Ba', email: 'moussa.ba@email.com', role: 'student', child: '他自己 - 1ère S1' },
];

// Données mock - Messages
const initialMessages: Message[] = [
  { id: '1', from: 'Mariama Diop', fromId: '1', subject: 'Question sur le devoir', preview: 'Madame, j\'ai une question sur l\'exercice 5 du chapitre sur les limites...', date: '10/02/2025', unread: true, type: 'received' },
  { id: '2', from: 'Ibrahima Ndiaye', fromId: '2', subject: 'Rendez-vous', preview: 'Est-il possible de vous rencontrer pour discuter des résultats de ma fille...', date: '09/02/2025', unread: true, type: 'received' },
  { id: '3', from: 'Fatou Barry', fromId: '3', subject: 'Merci beaucoup', preview: 'Merci pour votre aide avec le chapitre sur les intégrales. J\'ai bien compris...', date: '08/02/2025', unread: false, type: 'received' },
  { id: '4', from: 'Mamadou Sy', fromId: '4', subject: 'Absence', preview: 'Mon fils sera absent demain pour un rendez-vous médical...', date: '07/02/2025', unread: false, type: 'received' },
  { id: '5', from: 'Aïssatou Ndiaye', fromId: '5', subject: 'Résultat examen', preview: 'Je voulais savoir mon résultat à la composition de la semaine dernière...', date: '06/02/2025', unread: false, type: 'received' },
  { id: '6', from: 'Vous', fromId: 'teacher', subject: 'Re: Question sur le devoir', preview: 'Bonjour, n\'hésitez pas à venir pendant les heures de permanence...', date: '10/02/2025', unread: false, type: 'sent' },
  { id: '7', from: 'Vous', fromId: 'teacher', subject: 'Information importante', preview: 'Chers parents, la composition de mathématiques aura lieu lundi prochain...', date: '05/02/2025', unread: false, type: 'sent' },
];

export default function TeacherMessages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const handleSendMessage = () => {
    const contact = contacts.find(c => c.id === newMessage.to);
    if (!contact || !newMessage.subject || !newMessage.body) return;

    const sentMessage: Message = {
      id: Date.now().toString(),
      from: 'Vous',
      fromId: 'teacher',
      subject: newMessage.subject,
      preview: newMessage.body.substring(0, 50) + '...',
      date: new Date().toLocaleDateString('fr-FR'),
      unread: false,
      type: 'sent'
    };

    setMessages([sentMessage, ...messages]);
    setIsNewMessageOpen(false);
    setNewMessage({ to: '', subject: '', body: '' });
  };

  const filteredMessages = messages.filter(m => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return m.unread;
    if (selectedFilter === 'received') return m.type === 'received';
    if (selectedFilter === 'sent') return m.type === 'sent';
    return true;
  });

  const columns: Column<Message>[] = [
    {
      key: 'from',
      label: 'De',
      sortable: true,
      render: (message) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${message.type === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'} font-semibold`}>
              {message.from.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className={`font-medium ${message.unread ? '' : 'text-muted-foreground'}`}>
              {message.from}
              {message.type === 'sent' && <Badge variant="secondary" className="ml-2 text-xs">Envoyé</Badge>}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{message.subject}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Sujet',
      render: (message) => (
        <span className={`text-sm ${message.unread ? 'font-medium' : 'text-muted-foreground'}`}>
          {message.subject}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (message) => (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {message.date}
        </span>
      )
    },
    {
      key: 'unread',
      label: '',
      render: (message) => (
        message.unread ? <Badge variant="default">Nouveau</Badge> : null
      )
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'unread', label: 'Non lu' },
        { value: 'received', label: 'Reçus' },
        { value: 'sent', label: 'Envoyés' },
      ]
    }
  ];

  const gridItem = (message: Message) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={`${message.type === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'} font-semibold`}>
            {message.from.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold truncate ${message.unread ? '' : 'text-muted-foreground'}`}>
              {message.from}
            </h3>
            {message.unread && <Badge variant="default">Nouveau</Badge>}
          </div>
          <p className={`text-sm truncate ${message.unread ? '' : 'text-muted-foreground'}`}>
            {message.subject}
          </p>
          {message.type === 'sent' && <Badge variant="secondary" className="mt-1 text-xs">Envoyé</Badge>}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
      <div className="flex items-center justify-between pt-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {message.date}
        </span>
        <Button variant="outline" size="sm" className="gap-1">
          <Mail className="h-3 w-3" />
          {message.type === 'sent' ? 'Voir' : 'Répondre'}
        </Button>
      </div>
    </div>
  );

  // Custom filter rendering
  const renderCustomFilter = () => (
    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrer" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les messages</SelectItem>
        <SelectItem value="unread">Non lus</SelectItem>
        <SelectItem value="received">Reçus</SelectItem>
        <SelectItem value="sent">Envoyés</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messagerie</h1>
          <p className="text-muted-foreground">
            Communiquez avec les parents et élèves
          </p>
        </div>
        
        {/* Dialog pour nouveau message */}
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau message</DialogTitle>
              <DialogDescription>
                Envoyez un message à un parent ou un élève
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="to">Destinataire *</Label>
                <Select 
                  value={newMessage.to} 
                  onValueChange={(value) => setNewMessage({...newMessage, to: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Parents</div>
                    {contacts.filter(c => c.role === 'parent').map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span>{contact.name}</span>
                          <span className="text-xs text-muted-foreground">{contact.child}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs text-muted-foreground font-semibold mt-2">Élèves</div>
                    {contacts.filter(c => c.role === 'student').map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span>{contact.name}</span>
                          <span className="text-xs text-muted-foreground">{contact.child}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet *</Label>
                <Input 
                  id="subject" 
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder="Objet du message"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea 
                  id="body" 
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
                  placeholder="Écrivez votre message..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.to || !newMessage.subject || !newMessage.body}
              >
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages reçus</p>
              <p className="text-2xl font-bold">{messages.filter(m => m.type === 'received').length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages envoyés</p>
              <p className="text-2xl font-bold">{messages.filter(m => m.type === 'sent').length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Non lus</p>
              <p className="text-2xl font-bold">{messages.filter(m => m.unread).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom filter */}
      <div className="flex items-center gap-2">
        {renderCustomFilter()}
      </div>

      <DataList
        data={filteredMessages}
        columns={columns}
        searchKey="from"
        searchPlaceholder="Rechercher un message..."
        defaultView="grid"
        gridItem={gridItem}
        emptyMessage="Aucun message trouvé"
        itemsPerPage={6}
      />
    </div>
  );
}

