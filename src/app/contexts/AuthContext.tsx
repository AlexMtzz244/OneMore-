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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Listen for auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is logged in - convert Firebase User to our User type
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Usuario',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'cliente', // Default role - could be stored in Firebase or database
            addresses: [],
            createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString()
          };
          
          // Load user data from localStorage if exists (for addresses, etc.)
          const storedUserData = localStorage.getItem(`user_${firebaseUser.uid}`);
          if (storedUserData) {
            const parsed = JSON.parse(storedUserData);
            userData.addresses = parsed.addresses || [];
            userData.role = parsed.role || 'cliente';
          }
          
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
    return user?.role === 'administrador';
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Store additional user data in localStorage (Firebase only stores basic profile)
    localStorage.setItem(`user_${updatedUser.id}`, JSON.stringify(updatedUser));
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


