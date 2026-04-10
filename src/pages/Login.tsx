import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Home,
  Calculator,
  Shield,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast({
        title: "Connexion réussie !",
        description: `Bienvenue, ${email}`,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError((err as Error).message || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <span className="text-2xl font-bold text-accent">E</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">EduSphere</h1>
              <p className="text-sm text-white/70">Plateforme EdTech Multi-Écoles</p>
            </div>
          </div>
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Gérez votre établissement avec simplicité
            </h2>
            <p className="text-lg text-white/80">
              Une solution complète pour la gestion administrative, pédagogique et financière
              de vos écoles, collèges, lycées et universités.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-6">
              {[
                { icon: Building2, label: '7+ Écoles', desc: 'Connectées' },
                { icon: Users, label: '8,280+', desc: 'Élèves' },
                { icon: BookOpen, label: '420+', desc: 'Enseignants' },
                { icon: GraduationCap, label: '98%', desc: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur">
                  <stat.icon className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-lg font-bold">{stat.label}</p>
                    <p className="text-sm text-white/70">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">E</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">EduSphere</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="mt-2 text-muted-foreground">
              Accédez à votre espace de gestion scolaire
            </p>
            {/* <p className="text-xs text-muted-foreground mt-1">
              superadmin@edusphere.sn / Password123!
            </p> */}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Connectez-vous
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border rounded-md border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="superadmin@edusphere.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
              {email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && (
                <p className="text-xs text-destructive mt-1">Email invalide</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password123!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-muted-foreground">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

