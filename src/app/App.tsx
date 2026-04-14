import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PageTransition } from './components/PageTransition';
import { Home } from './components/Home';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Login } from './components/Login';
import { UserProfile } from './components/UserProfile';
import { OrderHistory } from './components/OrderHistory';
import { OrderConfirmation } from './components/OrderConfirmation';
import { AdminPanel } from './components/AdminPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchPage } from './components/SearchPage';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente para proteger rutas de administrador
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Rutas públicas */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/productos" element={<PageTransition><ProductCatalog /></PageTransition>} />
            <Route path="/categorias/:category" element={<PageTransition><ProductCatalog /></PageTransition>} />
            <Route path="/producto/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/carrito" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/buscar" element={<PageTransition><SearchPage /></PageTransition>} />

            {/* Rutas protegidas (requieren autenticación) */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <PageTransition><Checkout /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <PageTransition><UserProfile /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-pedidos"
              element={
                <ProtectedRoute>
                  <PageTransition><OrderHistory /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmacion"
              element={
                <ProtectedRoute>
                  <PageTransition><OrderConfirmation /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rutas de administrador */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <PageTransition><AdminDashboard /></PageTransition>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/old"
              element={
                <AdminRoute>
                  <PageTransition><AdminPanel /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <ProductProvider>
                <AppContent />
              </ProductProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;