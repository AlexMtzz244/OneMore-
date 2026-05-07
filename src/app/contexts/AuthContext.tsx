import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { apiClient } from '../../lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isAdmin: () => boolean;
  updateUser: (updatedUser: User) => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Escucha cambios de auth en Firebase (se dispara en cada recarga de página).
  // Si Firebase tiene un usuario activo, intenta restaurar la sesión desde
  // la session cookie httpOnly a través del backend Next.js.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Intentar obtener el perfil usando la cookie de sesión existente
        const profileRes = await apiClient.get<User>('/api/auth/profile');

        if (profileRes.ok && profileRes.data) {
          setUser(profileRes.data);
        } else {
          // La cookie expiró o no existe (ej. primer inicio tras cambiar dispositivo).
          // Refrescamos el idToken y re-establecemos la sesión en el backend.
          const idToken = await fbUser.getIdToken(true);
          const sessionRes = await apiClient.post<User>('/api/auth/session', { idToken });

          if (sessionRes.ok && sessionRes.data) {
            setUser(sessionRes.data);
          } else {
            // No se pudo re-establecer la sesión → forzar logout
            await signOut(auth);
            setUser(null);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthError(null);
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);

      // Obtener idToken y crear la session cookie httpOnly en el backend
      const idToken = await result.user.getIdToken();
      const res = await apiClient.post<User>('/api/auth/session', { idToken });

      if (!res.ok || !res.data) {
        await signOut(auth);
        throw new Error(res.message ?? 'Error al crear sesión en el servidor');
      }

      setUser(res.data);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      const errorMessage = code ? getAuthErrorMessage(code) : String(error instanceof Error ? error.message : 'Error al iniciar sesión');
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setAuthError(null);
      setLoading(true);

      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar nombre en Firebase Auth (para displayName)
      await updateProfile(result.user, { displayName: name });

      // Crear session cookie y perfil en Firestore
      const idToken = await result.user.getIdToken();
      const res = await apiClient.post<User>('/api/auth/session', { idToken });

      if (!res.ok || !res.data) {
        await signOut(auth);
        throw new Error(res.message ?? 'Error al crear sesión en el servidor');
      }

      setUser(res.data);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      const errorMessage = code ? getAuthErrorMessage(code) : String(error instanceof Error ? error.message : 'Error al registrarse');
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthError(null);
      setLoading(true);
      // Cerrar sesión en Firebase Auth y borrar la session cookie en el backend
      await Promise.all([
        signOut(auth),
        apiClient.delete('/api/auth/session'),
      ]);
      setUser(null);
    } catch {
      const errorMessage = 'Error al cerrar sesión';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'administrador';
  };

  const updateUser = (updatedUser: User) => {
    // Actualiza el estado local. Para persistir en Firestore, llama a PUT /api/auth/profile.
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        login, 
        logout, 
        register, 
        isAdmin, 
        updateUser,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert Firebase auth error codes to user-friendly messages
function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado';
    case 'auth/invalid-email':
      return 'El email no es válido';
    case 'auth/weak-password':
      return 'La contraseña es muy débil (mínimo 6 caracteres)';
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos';
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    default:
      return 'Error en la autenticación. Intenta más tarde';
  }
}


