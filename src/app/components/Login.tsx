import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading } = useAuth();

  // Estado para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Estado para Registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const getFirebaseErrorMessage = (error: unknown, fallback: string) => {
    const code = (error as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-email':
        return 'El email no es valido';
      case 'auth/user-disabled':
        return 'Este usuario fue deshabilitado';
      case 'auth/user-not-found':
        return 'No existe un usuario con este correo';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo o contrasena incorrectos';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta mas tarde';
      case 'auth/email-already-in-use':
        return 'Este correo ya esta registrado';
      case 'auth/weak-password':
        return 'La contrasena es demasiado debil';
      case 'auth/missing-email':
        return 'Ingresa un correo valido';
      case 'auth/network-request-failed':
        return 'Error de red. Intenta de nuevo';
      default:
        return fallback;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoginLoading(true);
      await login(loginEmail, loginPassword);
      toast.success('¡Bienvenido de vuelta!');
      // Clear form
      setLoginEmail('');
      setLoginPassword('');
      // Navigate after successful login
      const target = from.startsWith('/admin') ? '/' : from;
      navigate(target, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(getFirebaseErrorMessage(error, 'No se pudo iniciar sesion'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setRegisterLoading(true);
      await register(registerEmail, registerPassword, registerName);
      toast.success('¡Cuenta creada exitosamente!');
      // Clear form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      // Navigate after successful registration
      const target = from.startsWith('/admin') ? '/' : from;
      navigate(target, { replace: true });
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(getFirebaseErrorMessage(error, 'No se pudo crear la cuenta'));
    } finally {
      setRegisterLoading(false);
    }
  };

  const toggleReset = () => {
    setShowReset((prev) => {
      const next = !prev;
      if (next && !resetEmail && loginEmail) {
        setResetEmail(loginEmail);
      }
      return next;
    });
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Ingresa tu email para recuperar la contrasena');
      return;
    }

    try {
      setResetLoading(true);
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      toast.success('Te enviamos un enlace para restablecer tu contrasena');
      setShowReset(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(getFirebaseErrorMessage(error, 'No se pudo enviar el correo de recuperacion'));
    } finally {
      setResetLoading(false);
    }
  };

  const isLoading = loading || loginLoading || registerLoading;

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">OneMore!</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" disabled={isLoading}>
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" disabled={isLoading}>
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="******"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          disabled={isLoading}
                          aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm"
                      disabled={isLoading}
                      onClick={toggleReset}
                    >
                      {showReset ? 'Cancelar recuperacion' : 'Olvide mi contrasena'}
                    </Button>
                    {showReset && (
                      <div className="space-y-3 rounded-md border p-3">
                        <div>
                          <Label htmlFor="reset-email">Email registrado</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            disabled={isLoading || resetLoading}
                          />
                        </div>
                        <Button
                          type="button"
                          className="w-full"
                          onClick={handleResetPassword}
                          disabled={isLoading || resetLoading}
                        >
                          {resetLoading ? 'Enviando enlace...' : 'Enviar enlace'}
                        </Button>
                      </div>
                    )}
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">Nombre Completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          disabled={isLoading}
                          aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="register-confirm-password"
                          type={showRegisterConfirmPassword ? 'text' : 'password'}
                          placeholder="Repite tu contraseña"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                          disabled={isLoading}
                          aria-label={showRegisterConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showRegisterConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};