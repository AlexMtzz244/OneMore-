import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} eliminado del carrito`);
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl mb-8">Carrito de Compras</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">
                Agrega productos a tu carrito para comenzar tu compra
              </p>
              <Button onClick={() => navigate('/productos')} size="lg">
                Explorar Productos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-8">Carrito de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                      onClick={() => navigate(`/producto/${item.product.id}`)}
                    />
                    
                    <div className="flex-1">
                      <h3 
                        className="mb-1 cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/producto/${item.product.id}`)}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{item.product.brand}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {item.product.discount ? (
                          <>
                            <span className="text-lg text-blue-600">
                              {formatPrice(getDiscountedPrice(item.product.price, item.product.discount))}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg text-blue-600">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Control de cantidad */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Subtotal */}
                        <div className="flex-1 text-right">
                          <span className="text-lg">
                            {formatPrice(getItemTotal(item))}
                          </span>
                        </div>

                        {/* Eliminar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>

                      {item.quantity >= item.product.stock && (
                        <p className="text-sm text-orange-600 mt-2">
                          Stock máximo disponible: {item.product.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={() => {
                clearCart();
                toast.success('Carrito vaciado');
              }}
            >
              Vaciar Carrito
            </Button>
          </div>

          {/* Resumen */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl mb-4">Resumen del Pedido</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg">Total</span>
                    <span className="text-2xl text-blue-600">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Pagar (PayPal / Tarjeta)
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => navigate('/productos')}
                >
                  Seguir Comprando
                </Button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Envío gratis</strong> en todos los pedidos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
