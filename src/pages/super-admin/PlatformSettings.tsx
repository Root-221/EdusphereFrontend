import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  Shield, 
  Palette, 
  Bell,
  Save,
  Upload,
  Key,
  Database,
  Mail,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
  Plus
} from 'lucide-react';

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres Plateforme</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres globaux d'EduSphere
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[800px]">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Général Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informations de la Plateforme
              </CardTitle>
              <CardDescription>
                Paramètres de base de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nom de la plateforme</Label>
                  <Input id="platformName" defaultValue="EduSphere" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de support</Label>
                  <Input id="supportEmail" type="email" defaultValue="support@edusphere.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select defaultValue="Africa/Dakar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                      <SelectItem value="Africa/Abidjan">Africa/Abidjan</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input id="currency" defaultValue="FCFA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Téléphone de contact</Label>
                  <Input id="contactPhone" defaultValue="+221 33 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" defaultValue="https://edusphere.com" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Entreprise / Éditeur
              </CardTitle>
              <CardDescription>
                Informations légales de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input id="companyName" defaultValue="EduSphere Technologies" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input id="companyAddress" defaultValue="Dakar, Sénégal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Numéro fiscal / IFU</Label>
                  <Input id="taxId" defaultValue="123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalStatus">Statut juridique</Label>
                  <Input id="legalStatus" defaultValue="SARL" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apparence Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Identité Visuelle
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo de la plateforme</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-foreground">E</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Charger un nouveau logo
                    </Button>
                    <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">E</span>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Charger favicon
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <Label>Couleur principale</Label>
                <div className="flex gap-3">
                  {[
                    { color: 'bg-blue-600', name: 'Bleu', selected: true },
                    { color: 'bg-green-600', name: 'Vert', selected: false },
                    { color: 'bg-purple-600', name: 'Violet', selected: false },
                    { color: 'bg-orange-600', name: 'Orange', selected: false },
                    { color: 'bg-red-600', name: 'Rouge', selected: false },
                    { color: 'bg-teal-600', name: 'Teal', selected: false },
                  ].map((c) => (
                    <button
                      key={c.color}
                      className={`h-10 w-10 rounded-full ${c.color} ring-2 ring-offset-2 ${c.selected ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'}`}
                    />
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Mode par défaut</Label>
                <Select defaultValue="light">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer l'apparence
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de Sécurité
              </CardTitle>
              <CardDescription>
                Configurez les options de sécurité de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Mode Maintenance</h4>
                    <p className="text-sm text-muted-foreground">Mettre la plateforme en maintenance</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Double Authentification (2FA)</h4>
                    <p className="text-sm text-muted-foreground">Exiger 2FA pour tous les administrateurs</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Journalisation Avancée</h4>
                    <p className="text-sm text-muted-foreground">Enregistrer toutes les actions des utilisateurs</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Politique de Mot de Passe</h4>
                    <p className="text-sm text-muted-foreground">Exiger des mots de passe forts</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Durée de session (minutes)</Label>
                  <Input type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de tentatives avant verrouillage</Label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer la sécurité
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intégrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API et Clés d'Accès
              </CardTitle>
              <CardDescription>
                Gérez les clés API pour les intégrations externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Clé API Principale</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Créée le 01/10/2024</p>
                </div>
                <div className="p-4 rounded-lg border border-dashed">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Clé API de Test</h4>
                    <Badge variant="outline">Inactive</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="sk_test_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Webhooks</h4>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">URL de webhook</p>
                      <p className="text-sm text-muted-foreground">https://votre-api.com/webhook</p>
                    </div>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un webhook
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Bases de Données
              </CardTitle>
              <CardDescription>
                Informations de connexion aux bases de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Base de Données Primaire</h4>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connectée
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">PostgreSQL - edusphere_prod</p>
                <p className="text-xs text-muted-foreground mt-1">Serveur: db.edusphere.com:5432</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hostname</Label>
                  <Input defaultValue="db.edusphere.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input defaultValue="5432" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tester la connexion
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Serveur Email (SMTP)
              </CardTitle>
              <CardDescription>
                Configuration du serveur d'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input defaultValue="smtp.edusphere.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label>Email d'envoi</Label>
                  <Input defaultValue="noreply@edusphere.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" defaultValue="********" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Emails actifs</h4>
                  <p className="text-sm text-muted-foreground">La plateforme peut envoyer des emails</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tester l'envoi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Paramètres de Notifications
              </CardTitle>
              <CardDescription>
                Configurez les notifications globales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Notifications Email</h4>
                  <p className="text-sm text-muted-foreground">Envoyer des emails pour les événements importants</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Alertes Système</h4>
                  <p className="text-sm text-muted-foreground">Notifications en temps réel pour les admins</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Rapports Automatiques</h4>
                  <p className="text-sm text-muted-foreground">Envoyer des rapports périodiques par email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Notifications Mobile Push</h4>
                  <p className="text-sm text-muted-foreground">Envoyer des notifications push aux apps mobiles</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Types de notifications</h4>
                <div className="grid gap-3">
                  {[
                    { label: 'Nouvel inscription école', enabled: true },
                    { label: 'Paiements reçus', enabled: true },
                    { label: 'Alertes de sécurité', enabled: true },
                    { label: 'Rapports quotidiens', enabled: false },
                    { label: 'Mises à jour système', enabled: true },
                  ].map((notif) => (
                    <div key={notif.label} className="flex items-center justify-between p-3 rounded-lg border">
                      <span>{notif.label}</span>
                      <Switch defaultChecked={notif.enabled} />
                    </div>
                  ))}
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer les notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
