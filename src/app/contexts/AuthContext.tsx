import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isAdmin: () => boolean;
  updateUser: (updatedUser: User) => void;
  authError: string | null;
  adminEmails: string[];
  setAdminEmails: (emails: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminEmails, setAdminEmailsState] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('adminEmails');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  const normalizeEmail = (email: string) => email.trim().toLowerCase();

  const readAdminEmails = (): string[] => {
    const raw = localStorage.getItem('adminEmails');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((e) => (typeof e === 'string' ? normalizeEmail(e) : ''))
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const setAdminEmails = (emails: string[]) => {
    const normalized = Array.from(
      new Set(
        emails
          .map((e) => (typeof e === 'string' ? normalizeEmail(e) : ''))
          .filter(Boolean)
      )
    );
    localStorage.setItem('adminEmails', JSON.stringify(normalized));
    setAdminEmailsState(normalized);
  };

  useEffect(() => {
    if (adminEmails.length > 0) return;

    const env = (import.meta as any)?.env?.VITE_ADMIN_EMAILS as string | undefined;
    if (!env) return;

    const list = env
      .split(',')
      .map((e) => normalizeEmail(e))
      .filter(Boolean);
    if (list.length === 0) return;

    localStorage.setItem('adminEmails', JSON.stringify(list));
    setAdminEmailsState(list);
  }, []);

  const persistUserRecord = (record: User) => {
    const stored = localStorage.getItem('users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    const index = users.findIndex((u) => u.id === record.id);
    const nextUsers = [...users];

    if (index >= 0) {
      nextUsers[index] = { ...nextUsers[index], ...record };
    } else {
      nextUsers.push(record);
    }

    localStorage.setItem('users', JSON.stringify(nextUsers));
  };

  // Listen for auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is logged in - convert Firebase User to our User type
          const email = firebaseUser.email || '';
          const currentAdminEmails = readAdminEmails();
          const isEmailAdmin = email ? currentAdminEmails.includes(normalizeEmail(email)) : false;

          const userData: User = {
            id: firebaseUser.uid,
            email,
            name: firebaseUser.displayName || 'Usuario',
            photoURL: firebaseUser.photoURL || undefined,
            role: isEmailAdmin ? 'administrador' : 'cliente',
            addresses: [],
            createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString()
          };
          
          // Load user data from localStorage if exists (for addresses, etc.)
          const storedUserData = localStorage.getItem(`user_${firebaseUser.uid}`);
          if (storedUserData) {
            const parsed = JSON.parse(storedUserData);
            userData.addresses = parsed.addresses || [];
            // If the email is on the admin allowlist, force admin role.
            userData.role = isEmailAdmin ? 'administrador' : (parsed.role || 'cliente');
          }
          persistUserRecord(userData);
          setUser(userData);
        } else {
          // User is logged out
          setUser(null);
        }
      } catch (error) {
        console.error('Error setting user:', error);
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
      
      // User data will be set by onAuthStateChanged listener
      console.log('Login successful:', result.user.email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
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
      
      // Create user with email and password
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Initialize user data in localStorage
      const userData: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: name,
        role: 'cliente',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`user_${result.user.uid}`, JSON.stringify(userData));
      
      console.log('Registration successful:', result.user.email);
      // User data will be set by onAuthStateChanged listener
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
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
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
    } catch (error: any) {
      const errorMessage = 'Error al cerrar sesión';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (): boolean => {
    if (!user?.email) return false;
    return adminEmails.includes(normalizeEmail(user.email));
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Store additional user data in localStorage (Firebase only stores basic profile)
    localStorage.setItem(`user_${updatedUser.id}`, JSON.stringify(updatedUser));
    persistUserRecord(updatedUser);
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
        authError,
        adminEmails,
        setAdminEmails
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


