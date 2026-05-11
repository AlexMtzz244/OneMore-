import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Package, Calendar, MapPin, CreditCard } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { getOrdersByUser } = useProducts();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const orders = getOrdersByUser(user.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pendiente: 'Pendiente',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">
            Historial completo de tus compras
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl mb-2">No tienes pedidos aún</h2>
              <p className="text-gray-600 mb-6">
                Explora nuestro catálogo y realiza tu primera compra
              </p>
              <Button onClick={() => navigate('/productos')} size="lg">
                Explorar Productos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg mb-2">
                        Pedido #{order.id}
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Productos */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3 bg-muted/40 rounded-lg"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded cursor-pointer"
                          onClick={() => navigate(`/producto/${item.product.id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="cursor-pointer hover:text-blue-600 mb-1"
                            onClick={() => navigate(`/producto/${item.product.id}`)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.product.brand}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg text-blue-600">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dirección de envío */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-600" />
                    <div>
                      <p className="font-medium mb-1">Dirección de envío:</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.street}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg">Total:</span>
                    <span className="text-2xl text-blue-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/pedido/${order.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    {order.status === 'entregado' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Agregar todos los productos del pedido al carrito nuevamente
                          navigate('/productos');
                        }}
                      >
                        Volver a Comprar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
