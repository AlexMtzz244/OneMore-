import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Star } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (discount) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-8">Buscar Productos</h1>

        {/* Barra de búsqueda */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, marca o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-6"
              autoFocus
            />
          </div>
        </div>

        {/* Resultados */}
        {searchQuery.trim() && (
          <div>
            <p className="text-gray-600 mb-6">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "{searchQuery}"
            </p>

            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                          onClick={() => navigate(`/producto/${product.id}`)}
                        />
                        {product.discount && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.bestSeller && (
                          <Badge className="absolute top-2 left-2 bg-orange-500">
                            Más Vendido
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                        <h3
                          className="mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/producto/${product.id}`)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {product.discount ? (
                            <>
                              <span className="text-xl text-blue-600">
                                {formatPrice(getDiscountedPrice(product.price, product.discount))}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl text-blue-600">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/producto/${product.id}`)}
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Agotado' : 'Ver Detalles'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                Escribe algo en el buscador para encontrar productos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
