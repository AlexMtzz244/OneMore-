import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
  Settings,
  Bell,
  Moon,
  Sun,
  Download,
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  Activity,
  DollarSign,
  Clock,
  Target,
  Menu,
  X,
} from 'lucide-react';
import { Product, ProductCategory, ProductGoal, Order, OrderStatus, User as UserType } from '../types';
import { mockActivityLogs, mockSalesData, mockUsers } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, getAllOrders, updateOrder } = useProducts();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'activity'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  // Form state for product CRUD
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: 'proteina',
    price: 0,
    description: '',
    presentation: '',
    stock: 0,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800'],
    goal: [],
    featured: false,
    bestSeller: false,
    discount: 0,
    nutritionalInfo: {
      servingSize: '',
      servingsPerContainer: 0,
      protein: '',
      carbs: '',
      fats: '',
      calories: '',
      otherIngredients: [],
    },
  });

  // Check admin permissions
  useEffect(() => {
    if (!user || !isAdmin()) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        { type: 'sale' as const, message: 'Nueva venta realizada: €45.99' },
        { type: 'order' as const, message: 'Nuevo pedido recibido' },
        { type: 'stock' as const, message: 'Alerta: Stock bajo en Whey Protein' },
        { type: 'user' as const, message: 'Nuevo usuario registrado' },
      ];
      
      if (Math.random() > 0.8) { // 20% chance every 30 seconds
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addNotification(event);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  if (!user || !isAdmin()) {
    return null;
  }

  const orders = getAllOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get all users from localStorage
  const allUsers: UserType[] = useMemo(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : mockUsers;
  }, []);

  // Calculate KPIs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthlyOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo && o.status !== 'cancelado'
  );

  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pendiente').length;

  const newUsersThisMonth = allUsers.filter(
    (u) => new Date(u.createdAt) >= thirtyDaysAgo
  ).length;

  const totalVisitors = 1234; // Mock data - in a real app this would come from analytics
  const conversionRate = totalVisitors > 0 ? (monthlyOrders.length / totalVisitors) * 100 : 0;

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock < 5);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    return filtered;
  }, [products, searchQuery, stockFilter]);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock < 5 && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: 'proteina',
        price: 0,
        description: '',
        presentation: '',
        stock: 0,
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800'],
        goal: [],
        featured: false,
        bestSeller: false,
        discount: 0,
        nutritionalInfo: {
          servingSize: '',
          servingsPerContainer: 0,
          protein: '',
          carbs: '',
          fats: '',
          calories: '',
          otherIngredients: [],
        },
      });
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.brand || !formData.price || formData.stock === undefined) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || `p${Date.now()}`,
      name: formData.name!,
      brand: formData.brand!,
      category: formData.category as ProductCategory,
      price: Number(formData.price),
      description: formData.description || '',
      presentation: formData.presentation || '',
      stock: Number(formData.stock),
      images: formData.images || ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800'],
      goal: formData.goal as ProductGoal[],
      featured: formData.featured || false,
      bestSeller: formData.bestSeller || false,
      discount: Number(formData.discount) || 0,
      rating: editingProduct?.rating || 0,
      reviewCount: editingProduct?.reviewCount || 0,
      nutritionalInfo: formData.nutritionalInfo!,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    if (editingProduct) {
      updateProduct(productData);
      toast.success('Producto actualizado exitosamente');
      addNotification({
        type: 'stock',
        message: `Producto actualizado: ${productData.name}`,
      });
    } else {
      addProduct(productData);
      toast.success('Producto agregado exitosamente');
      addNotification({
        type: 'stock',
        message: `Nuevo producto agregado: ${productData.name}`,
      });
    }

    setIsProductDialogOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Producto eliminado');
      addNotification({
        type: 'stock',
        message: `Producto eliminado: ${productName}`,
      });
    }
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: OrderStatus) => {
    updateOrder({
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    toast.success('Estado del pedido actualizado');
    addNotification({
      type: 'order',
      message: `Pedido #${order.id} actualizado a: ${newStatus}`,
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Agotado</Badge>;
    } else if (stock < 5) {
      return <Badge className="bg-orange-500 gap-1"><AlertCircle className="h-3 w-3" /> Stock Bajo</Badge>;
    }
    return <Badge className="bg-green-500">En Stock</Badge>;
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    const colors = {
      pendiente: 'bg-yellow-500',
      enviado: 'bg-blue-500',
      entregado: 'bg-green-500',
      cancelado: 'bg-red-500',
    };
    return colors[status];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  const downloadOrderSummary = (order: Order) => {
    const summary = `
RESUMEN DE PEDIDO
==================
Pedido #${order.id}
Fecha: ${new Date(order.createdAt).toLocaleString('es-ES')}
Estado: ${order.status}

PRODUCTOS:
${order.items.map((item) => `- ${item.product.name} x${item.quantity} - €${(item.product.price * item.quantity).toFixed(2)}`).join('\n')}

TOTAL: €${order.total.toFixed(2)}

Dirección de envío:
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

Método de pago: ${order.paymentMethod}
    `;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedido-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resumen descargado');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-card border-border border-r transition-all duration-300 fixed left-0 top-0 h-screen z-20`}
        >
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold">Dashboard</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <nav className="px-2 space-y-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="h-5 w-5" />
              {sidebarOpen && 'Resumen'}
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-5 w-5" />
              {sidebarOpen && 'Inventario'}
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart className="h-5 w-5" />
              {sidebarOpen && 'Pedidos'}
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-5 w-5" />
              {sidebarOpen && 'Usuarios'}
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('activity')}
            >
              <Activity className="h-5 w-5" />
              {sidebarOpen && 'Actividad'}
            </Button>
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-2">
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {sidebarOpen && (theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro')}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          {/* Top Bar */}
          <header className="bg-card border-border border-b p-4 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-2xl">Bienvenido, {user.name}</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard Administrativo - OneMore!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Panel */}
                {notificationsPanelOpen && (
                  <Card className="absolute right-0 top-12 w-80 bg-card border-border shadow-lg z-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm">Notificaciones</CardTitle>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                        >
                          Marcar todas
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-96">
                        {notifications.length === 0 ? (
                          <p className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            No hay notificaciones
                          </p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-border cursor-pointer hover:bg-muted ${
                                !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(notif.timestamp)}
                              </p>
                            </div>
                          ))
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>
                Volver a la tienda
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Ventas del Mes
                          </p>
                          <p className="text-3xl mt-2">€{monthlyRevenue.toFixed(2)}</p>
                          <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            +12.5% vs mes anterior
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Pedidos Pendientes
                          </p>
                          <p className="text-3xl mt-2">{pendingOrders}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            Requieren atención
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Usuarios Nuevos
                          </p>
                          <p className="text-3xl mt-2">{newUsersThisMonth}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            Últimos 30 días
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tasa de Conversión
                          </p>
                          <p className="text-3xl mt-2">{conversionRate.toFixed(1)}%</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            De {totalVisitors} visitantes
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales Chart */}
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Tendencia de Ventas (Últimos 30 días)</CardTitle>
                    <CardDescription>Análisis de ingresos diarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={mockSalesData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).getDate().toString()}
                          stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                        />
                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                          }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                          formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorSales)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Stock Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Alertas de Stock Bajo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {lowStockProducts.length === 0 ? (
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          No hay productos con stock bajo
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {lowStockProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {product.brand}
                                </p>
                              </div>
                              <Badge className="bg-orange-500">
                                {product.stock} unidades
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Productos Agotados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {outOfStockProducts.length === 0 ? (
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          No hay productos agotados
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {outOfStockProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {product.brand}
                                </p>
                              </div>
                              <Badge variant="destructive">Agotado</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle>Gestión de Inventario</CardTitle>
                        <CardDescription>
                          Administra productos y controla el stock
                        </CardDescription>
                      </div>
                      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleOpenProductDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Producto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Nombre *</Label>
                                <Input
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Marca *</Label>
                                <Input
                                  value={formData.brand}
                                  onChange={(e) =>
                                    setFormData({ ...formData, brand: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Categoría *</Label>
                                <Select
                                  value={formData.category}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      category: value as ProductCategory,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="proteina">Proteína</SelectItem>
                                    <SelectItem value="creatina">Creatina</SelectItem>
                                    <SelectItem value="pre-workout">Pre-Workout</SelectItem>
                                    <SelectItem value="accesorios">Accesorios</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Presentación</Label>
                                <Input
                                  value={formData.presentation}
                                  onChange={(e) =>
                                    setFormData({ ...formData, presentation: e.target.value })
                                  }
                                  placeholder="1kg, 300g, etc."
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Precio (€) *</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Stock *</Label>
                                <Input
                                  type="number"
                                  value={formData.stock}
                                  onChange={(e) =>
                                    setFormData({ ...formData, stock: parseInt(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Descuento (%)</Label>
                                <Input
                                  type="number"
                                  value={formData.discount}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      discount: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Descripción</Label>
                              <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="featured"
                                  checked={formData.featured}
                                  onChange={(e) =>
                                    setFormData({ ...formData, featured: e.target.checked })
                                  }
                                />
                                <Label htmlFor="featured">Destacado</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="bestSeller"
                                  checked={formData.bestSeller}
                                  onChange={(e) =>
                                    setFormData({ ...formData, bestSeller: e.target.checked })
                                  }
                                />
                                <Label htmlFor="bestSeller">Más Vendido</Label>
                              </div>
                            </div>

                            <Button onClick={handleSaveProduct} className="w-full">
                              {editingProduct ? 'Actualizar' : 'Crear'} Producto
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nombre o marca..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                        <SelectTrigger className="w-[200px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los productos</SelectItem>
                          <SelectItem value="low">Stock bajo (&lt; 5)</SelectItem>
                          <SelectItem value="out">Agotados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Products Table */}
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {product.brand}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{product.category}</TableCell>
                              <TableCell>€{product.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <span
                                  className={
                                    product.stock === 0
                                      ? 'text-red-600'
                                      : product.stock < 5
                                      ? 'text-orange-600'
                                      : ''
                                  }
                                >
                                  {product.stock}
                                </span>
                              </TableCell>
                              <TableCell>{getStockBadge(product.stock)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenProductDialog(product)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteProduct(product.id, product.name)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          No se encontraron productos
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Control de Pedidos</CardTitle>
                    <CardDescription>
                      Gestiona y actualiza el estado de los pedidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            No hay pedidos registrados
                          </p>
                        </div>
                      ) : (
                        orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-border rounded-lg bg-card p-4"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-medium">Pedido #{order.id}</p>
                                  <Badge className={getOrderStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                      Fecha:
                                    </p>
                                    <p>
                                      {new Date(order.createdAt).toLocaleDateString('es-ES')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                      Total:
                                    </p>
                                    <p className="font-medium">€{order.total.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                      Productos:
                                    </p>
                                    <p>{order.items.length} artículo(s)</p>
                                  </div>
                                </div>
                                <div className="mt-3 text-sm">
                                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Pago: {order.paymentMethod}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) =>
                                    handleUpdateOrderStatus(order, value as OrderStatus)
                                  }
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadOrderSummary(order)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                      Administra los usuarios de la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead>Direcciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allUsers.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    u.role === 'administrador' ? 'default' : 'secondary'
                                  }
                                >
                                  {u.role === 'administrador' ? 'Admin' : 'Cliente'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(u.createdAt).toLocaleDateString('es-ES')}
                              </TableCell>
                              <TableCell>{u.addresses.length}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Registro de Actividad</CardTitle>
                    <CardDescription>
                      Historial de acciones realizadas por administradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockActivityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 rounded-lg border border-border bg-muted p-4"
                        >
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                            <Activity className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {log.userName} - {log.action}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.target}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              {formatTimeAgo(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};