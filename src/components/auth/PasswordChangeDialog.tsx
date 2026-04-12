import { useEffect, useState } from 'react';
import { Loader2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-errors';
import { roleLabels } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function PasswordChangeDialog() {
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mustChangePassword = Boolean(user?.mustChangePassword);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Utilisateur';

  useEffect(() => {
    if (mustChangePassword) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
    }
  }, [mustChangePassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(newPassword);
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre session est désormais sécurisée.',
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Impossible de changer le mot de passe.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={mustChangePassword}>
      <DialogContent className="sm:max-w-[560px] overflow-hidden border-primary/20 bg-background p-0 shadow-2xl [&>button]:hidden">
        <div className="bg-gradient-to-r from-primary via-blue-600 to-cyan-600 px-6 py-6 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="h-3.5 w-3.5" />
            Première connexion
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-tight">
            Bonjour {displayName}, créez votre nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/85">
            Votre compte utilise un mot de passe temporaire. Cette étape est obligatoire pour sécuriser votre accès.
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl">Sécurisez votre compte</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choisissez un mot de passe personnel pour continuer à utiliser EduSphere.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleLabels[user?.role ?? 'student']}
            </Badge>
            {user?.schoolName && (
              <Badge variant="outline" className="border-primary/20 text-primary">
                {user.schoolName}
              </Badge>
            )}
            {user?.email && (
              <Badge variant="outline" className="text-muted-foreground">
                {user.email}
              </Badge>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirmez le mot de passe"
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Utilisez au moins 8 caractères et évitez de réutiliser votre ancien mot de passe temporaire.
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-primary to-cyan-600 text-white hover:opacity-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
