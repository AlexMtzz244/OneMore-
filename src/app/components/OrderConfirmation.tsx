import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle } from 'lucide-react';
import { Order } from '../types';

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const order = (location.state as any)?.order as Order | undefined;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl mb-4">¡Pedido Confirmado!</h1>
              
              <p className="text-gray-600 mb-2">
                Tu pedido <strong>#{order.id}</strong> ha sido realizado exitosamente
              </p>
              
              <p className="text-gray-600 mb-8">
                Recibirás un email de confirmación en breve
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h2 className="font-medium mb-4">Resumen del Pedido</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de productos:</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl text-blue-600">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="text-yellow-600 font-medium">Pendiente</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/mis-pedidos')}
                >
                  Ver Mis Pedidos
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
