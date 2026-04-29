import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Address } from '../types';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, currency, convertPrice } = useCurrency();
  const { createOrder: createStoreOrder } = useProducts();

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

  const [paypalLoading, setPaypalLoading] = useState(false);

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

  const isAddressComplete =
    !!shippingAddress.street &&
    !!shippingAddress.city &&
    !!shippingAddress.state &&
    !!shippingAddress.zipCode &&
    !!shippingAddress.country;

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

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

  const normalizedAddress: Address = {
    ...shippingAddress,
    id: shippingAddress.id || `addr_${Date.now()}`,
  };

  const paypalItems = cart.map((item) => {
    const priceMXN = getDiscountedPrice(item.product.price, item.product.discount);
    return {
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitAmount: convertPrice(priceMXN),
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-8">Finalizar Compra</h1>

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
                            {formatPrice(getItemTotal(item))}
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
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Total</span>
                      <span className="text-2xl text-blue-600">
                        {formatPrice(getCartTotal())}
                      </span>
                    </div>
                  </div>

                  {!paypalClientId ? (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                      Falta configurar PayPal. Define <strong>VITE_PAYPAL_CLIENT_ID</strong>.
                    </div>
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        clientId: paypalClientId,
                        currency,
                        intent: 'capture',
                        components: 'buttons',
                      }}
                    >
                      <div className="space-y-3">
                        {!isAddressComplete && (
                          <div className="rounded-md border p-3 text-sm text-muted-foreground">
                            Completa tu dirección de envío para habilitar el pago.
                          </div>
                        )}
                        <PayPalButtons
                          disabled={!isAddressComplete || paypalLoading}
                          style={{ layout: 'vertical', label: 'pay' }}
                          fundingSource={undefined}
                          createOrder={async () => {
                            if (!isAddressComplete) {
                              toast.error('Por favor completa tu dirección de envío');
                              throw new Error('Missing shipping address');
                            }

                            const response = await fetch('/api/paypal-create-order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                items: paypalItems,
                                currency,
                              }),
                            });

                            const payload = await response.json().catch(() => null);
                            if (!response.ok || !payload?.id) {
                              if (response.status === 404) {
                                toast.error('Pago no disponible en modo local. Prueba en Vercel o con `vercel dev`.');
                              }
                              throw new Error('No se pudo iniciar el pago');
                            }

                            return payload.id as string;
                          }}
                          onApprove={async (data) => {
                            try {
                              setPaypalLoading(true);

                              const response = await fetch('/api/paypal-capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: data.orderID }),
                              });

                              const capture = await response.json().catch(() => null);
                              if (!response.ok || capture?.status !== 'COMPLETED') {
                                if (response.status === 404) {
                                  toast.error('Pago no disponible en modo local. Prueba en Vercel o con `vercel dev`.');
                                }
                                throw new Error('Pago no confirmado');
                              }

                              const orderDraft = {
                                id: `order_${Date.now()}`,
                                userId: user.id,
                                items: cart,
                                total: getCartTotal(),
                                status: 'pendiente' as const,
                                shippingAddress: normalizedAddress,
                                paymentMethod: 'PayPal / Tarjeta',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };

                              createStoreOrder(orderDraft);
                              clearCart();
                              localStorage.setItem('lastOrder', JSON.stringify(orderDraft));

                              toast.success('Pago confirmado');
                              navigate('/confirmacion', { state: { order: orderDraft } });
                            } catch (error) {
                              console.error('PayPal approve error:', error);
                              toast.error('No pudimos confirmar el pago. Intenta de nuevo.');
                            } finally {
                              setPaypalLoading(false);
                            }
                          }}
                          onCancel={() => {
                            toast.message('Pago cancelado');
                          }}
                          onError={(error) => {
                            console.error('PayPal error:', error);
                            toast.error('No se pudo procesar el pago. Intenta de nuevo.');
                          }}
                        />
                      </div>
                    </PayPalScriptProvider>
                  )}

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
      </div>
    </div>
  );
};
