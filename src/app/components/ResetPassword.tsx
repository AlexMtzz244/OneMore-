import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const getFirebaseErrorMessage = (error: unknown, fallback: string) => {
    const code = (error as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/expired-action-code':
        return 'El enlace expiro. Solicita uno nuevo';
      case 'auth/invalid-action-code':
        return 'El enlace no es valido';
      case 'auth/user-disabled':
        return 'Este usuario fue deshabilitado';
      case 'auth/user-not-found':
        return 'No existe un usuario con este correo';
      case 'auth/weak-password':
        return 'La contrasena es demasiado debil';
      case 'auth/network-request-failed':
        return 'Error de red. Intenta de nuevo';
      default:
        return fallback;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode') ?? '';

    if (!code) {
      toast.error('Enlace de recuperacion invalido');
      setVerifying(false);
      return;
    }

    setOobCode(code);

    verifyPasswordResetCode(auth, code)
      .then((resolvedEmail) => {
        setEmail(resolvedEmail);
      })
      .catch((error: unknown) => {
        toast.error(getFirebaseErrorMessage(error, 'El enlace ya expiro o no es valido'));
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [location.search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!oobCode) {
      toast.error('Enlace de recuperacion invalido');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }

    if (password.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Contrasena actualizada. Inicia sesion.');
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Confirm password reset error:', error);
      toast.error(getFirebaseErrorMessage(error, 'No se pudo actualizar la contrasena'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Restablecer Contrasena</CardTitle>
            </CardHeader>
            <CardContent>
              {verifying ? (
                <p className="text-sm text-muted-foreground">Verificando enlace...</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Nueva Contrasena</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Minimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirmar Contrasena</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite tu contrasena"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Guardando...' : 'Actualizar Contrasena'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
