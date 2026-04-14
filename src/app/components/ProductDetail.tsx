import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Star, ShoppingCart, Package, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { getProductById, products, getReviewsByProduct, addReview } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const product = getProductById(id || '');
  const reviews = getReviewsByProduct(id || '');
  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl mb-2">Producto no encontrado</h2>
            <p className="text-gray-600 mb-6">El producto que buscas no existe.</p>
            <Button onClick={() => navigate('/productos')}>
              Volver al Catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dejar una reseña');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    addReview({
      id: `review_${Date.now()}`,
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    });

    setReviewComment('');
    setReviewRating(5);
    toast.success('Reseña agregada exitosamente');
  };

  const getDiscountedPrice = () => {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Imágenes */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {product.discount && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-lg px-3 py-1">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <Badge variant="destructive" className="text-xl px-4 py-2">
                        Agotado
                      </Badge>
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className={`w-20 h-20 object-cover rounded cursor-pointer ${
                          selectedImage === idx ? 'ring-2 ring-blue-600' : ''
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información del producto */}
          <div>
            <div className="mb-2">
              <Badge variant="secondary">{product.brand}</Badge>
              {product.bestSeller && (
                <Badge className="ml-2 bg-orange-500">Más Vendido</Badge>
              )}
            </div>
            
            <h1 className="text-3xl mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-gray-500">({product.reviewCount} reseñas)</span>
            </div>

            <div className="mb-6">
              {product.discount ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl text-blue-600">
                    {formatPrice(getDiscountedPrice())}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge className="bg-red-500">Ahorra {product.discount}%</Badge>
                </div>
              ) : (
                <span className="text-4xl text-blue-600">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Presentación:</span>
                  <span>{product.presentation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Stock:</span>
                  <span className={product.stock > 10 ? 'text-green-600' : 'text-orange-600'}>
                    {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {product.stock > 0 && (
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al Carrito
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs con información adicional */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Información Nutricional</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Contenido por porción</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Tamaño de porción:</span>
                        <span className="ml-2">{product.nutritionalInfo.servingSize}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Porciones por envase:</span>
                        <span className="ml-2">{product.nutritionalInfo.servingsPerContainer}</span>
                      </div>
                      {product.nutritionalInfo.protein && (
                        <div>
                          <span className="text-gray-600">Proteína:</span>
                          <span className="ml-2">{product.nutritionalInfo.protein}</span>
                        </div>
                      )}
                      {product.nutritionalInfo.carbs && (
                        <div>
                          <span className="text-gray-600">Carbohidratos:</span>
                          <span className="ml-2">{product.nutritionalInfo.carbs}</span>
                        </div>
                      )}
                      {product.nutritionalInfo.fats && (
                        <div>
                          <span className="text-gray-600">Grasas:</span>
                          <span className="ml-2">{product.nutritionalInfo.fats}</span>
                        </div>
                      )}
                      {product.nutritionalInfo.calories && (
                        <div>
                          <span className="text-gray-600">Calorías:</span>
                          <span className="ml-2">{product.nutritionalInfo.calories}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {product.nutritionalInfo.otherIngredients.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Otros ingredientes</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {product.nutritionalInfo.otherIngredients.map((ingredient, idx) => (
                          <li key={idx} className="text-gray-700">{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota importante:</strong> Esta información es solo técnica. 
                      Consulta con un profesional de la salud antes de usar cualquier suplemento.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Formulario de reseña */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg mb-4">Escribe una reseña</h3>
                    {user ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2">Calificación</label>
                          <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setReviewRating(i + 1)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    i < reviewRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Comentario</label>
                          <Textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Comparte tu experiencia con este producto..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleSubmitReview}>
                          Enviar Reseña
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Debes{' '}
                        <button
                          onClick={() => navigate('/login')}
                          className="text-blue-600 hover:underline"
                        >
                          iniciar sesión
                        </button>{' '}
                        para dejar una reseña.
                      </p>
                    )}
                  </div>

                  {/* Lista de reseñas */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">
                        Aún no hay reseñas para este producto. ¡Sé el primero en opinar!
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.userName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/producto/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-1">{relatedProduct.brand}</p>
                      <h3 className="mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <span className="text-lg text-blue-600">
                        {formatPrice(relatedProduct.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
