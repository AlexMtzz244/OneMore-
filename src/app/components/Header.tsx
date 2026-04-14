import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const cartItemsCount = getCartItemsCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background text-foreground shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <span className="font-bold text-xl text-white">OM</span>
            </div>
            <span className="hidden sm:inline font-bold text-xl">OneMore!</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
              Inicio
            </Link>
            <Link to="/productos" className="hover:text-blue-600 transition-colors font-medium">
              Productos
            </Link>
            <Link to="/categorias/proteina" className="hover:text-blue-600 transition-colors font-medium">
              Proteínas
            </Link>
            <Link to="/categorias/creatina" className="hover:text-blue-600 transition-colors font-medium">
              Creatina
            </Link>
            <Link to="/categorias/pre-workout" className="hover:text-blue-600 transition-colors font-medium">
              Pre-Workout
            </Link>
            <Link to="/categorias/accesorios" className="hover:text-blue-600 transition-colors font-medium">
              Accesorios
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/buscar')}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/carrito')}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle for non-authenticated users */}
            {!user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    {/* Indicador de usuario activo */}
                    <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-background"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border text-popover-foreground shadow-lg">
                  <div className="px-2 py-1.5 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem 
                      onClick={() => navigate('/perfil')}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/mis-pedidos')}
                      className="cursor-pointer"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Mis Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={toggleTheme}
                      className="cursor-pointer"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Modo Oscuro
                        </>
                      ) : (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Modo Claro
                        </>
                      )}
                    </DropdownMenuItem>
                  </div>
                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="py-1">
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Panel Admin
                        </DropdownMenuItem>
                      </div>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <div className="py-1">
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')} size="sm">
                Ingresar
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4 space-y-2">
            <Link
              to="/"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </Link>
            <Link
              to="/categorias/proteina"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Proteínas
            </Link>
            <Link
              to="/categorias/creatina"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Creatina
            </Link>
            <Link
              to="/categorias/pre-workout"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pre-Workout
            </Link>
            <Link
              to="/categorias/accesorios"
              className="block py-2 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accesorios
            </Link>
            <Link
              to="/buscar"
              className="block py-2 hover:text-blue-600 transition-colors sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buscar
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  Modo Oscuro
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Modo Claro
                </>
              )}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};