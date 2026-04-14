import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Product, ProductCategory, ProductGoal, Order, OrderStatus } from '../types';
import { Pencil, Trash2, Plus, Package, Users, ShoppingCart } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, getAllOrders, updateOrder } = useProducts();
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  React.useEffect(() => {
    if (!user || !isAdmin()) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  // Form state
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

  if (!user || !isAdmin()) {
    return null;
  }

  const orders = getAllOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pendiente').length,
    totalRevenue: orders
      .filter(o => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0),
  };

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
    if (!formData.name || !formData.brand || !formData.price || !formData.stock) {
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
    } else {
      addProduct(productData);
      toast.success('Producto agregado exitosamente');
    }

    setIsProductDialogOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Producto eliminado');
    }
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: OrderStatus) => {
    updateOrder({
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    toast.success('Estado del pedido actualizado');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-500';
      case 'enviado':
        return 'bg-blue-500';
      case 'entregado':
        return 'bg-green-500';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Panel de Administración</h1>
          <Button onClick={() => navigate('/admin')} variant="default">
            Ir al Nuevo Dashboard
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Productos</p>
                  <p className="text-2xl">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pedidos</p>
                  <p className="text-2xl">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pedidos Pendientes</p>
                  <p className="text-2xl">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl">€{stats.totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          {/* Productos */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestión de Productos</CardTitle>
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
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Marca *</Label>
                            <Input
                              value={formData.brand}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Categoría *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
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
                              onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Stock *</Label>
                            <Input
                              type="number"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Descuento (%)</Label>
                            <Input
                              type="number"
                              value={formData.discount}
                              onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Descripción</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={formData.featured}
                              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            />
                            <Label htmlFor="featured">Destacado</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="bestSeller"
                              checked={formData.bestSeller}
                              onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
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
                    {products.map((product) => (
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
                              <p className="text-sm text-gray-600">{product.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>€{product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : ''}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.featured && <Badge variant="secondary" className="text-xs">Destacado</Badge>}
                            {product.bestSeller && <Badge className="text-xs bg-orange-500">Top</Badge>}
                          </div>
                        </TableCell>
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
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} producto(s) - €{order.total.toFixed(2)}
                          </p>
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="enviado">Enviado</SelectItem>
                            <SelectItem value="entregado">Entregado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cliente:</p>
                          <p className="font-medium">Usuario #{order.userId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pago:</p>
                          <p>{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock */}
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Control de Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Stock Actual</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={product.stock}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              updateProduct({ ...product, stock: newStock });
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          {product.stock === 0 ? (
                            <Badge variant="destructive">Agotado</Badge>
                          ) : product.stock < 10 ? (
                            <Badge className="bg-orange-500">Stock Bajo</Badge>
                          ) : (
                            <Badge className="bg-green-500">Disponible</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newStock = prompt(`Stock actual: ${product.stock}\nNuevo stock:`, product.stock.toString());
                              if (newStock) {
                                updateProduct({ ...product, stock: parseInt(newStock) });
                                toast.success('Stock actualizado');
                              }
                            }}
                          >
                            Actualizar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};