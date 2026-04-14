import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Order, Address } from '../types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const { createOrder } = useProducts();

  const [shippingAddress, setShippingAddress] = useState<Address>(
    user?.addresses.find((a) => a.isDefault) || {
      id: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'España',
      isDefault: true,
    }
  );

  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  // Validar que el usuario esté logueado
  React.useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
    if (cart.length === 0) {
      navigate('/carrito');
    }
  }, [user, cart, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar dirección
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Por favor completa todos los campos de dirección');
      return;
    }

    // Crear orden
    const order: Order = {
      id: `order_${Date.now()}`,
      userId: user!.id,
      items: cart,
      total: getCartTotal(),
      status: 'pendiente',
      shippingAddress,
      paymentMethod: getPaymentMethodName(paymentMethod),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOrder(order);
    clearCart();
    
    toast.success('¡Pedido realizado exitosamente!');
    navigate('/confirmacion', { state: { order } });
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      'credit-card': 'Tarjeta de Crédito',
      'debit-card': 'Tarjeta de Débito',
      'paypal': 'PayPal',
      'transfer': 'Transferencia Bancaria',
    };
    return names[method] || 'Tarjeta de Crédito';
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (discount) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const getItemTotal = (item: typeof cart[0]) => {
    const price = getDiscountedPrice(item.product.price, item.product.discount);
    return price * item.quantity;
  };

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dirección de Envío */}
              <Card>
                <CardHeader>
                  <CardTitle>Dirección de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Dirección</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, street: e.target.value })
                      }
                      placeholder="Calle y número"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        placeholder="Ciudad"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Provincia</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                        placeholder="Provincia"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Código Postal</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                        placeholder="28001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, country: e.target.value })
                        }
                        placeholder="España"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pago */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                        Tarjeta de Crédito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="debit-card" id="debit-card" />
                      <Label htmlFor="debit-card" className="flex-1 cursor-pointer">
                        Tarjeta de Débito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                        Transferencia Bancaria
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Este es un sistema de pago simulado. 
                      No se procesarán pagos reales.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del Pedido */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Productos */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                          <p className="text-sm text-blue-600">
                            €{getItemTotal(item).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totales */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>€{getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Total</span>
                      <span className="text-2xl text-blue-600">
                        €{getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Confirmar Pedido
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/carrito')}
                  >
                    Volver al Carrito
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
