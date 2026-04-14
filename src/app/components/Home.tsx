import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from './ui/carousel';
import { Star, TrendingUp, Dumbbell, Zap, ShoppingBag } from 'lucide-react';
import { ProductCategory } from '../types';

export const Home: React.FC = () => {
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [api, setApi] = React.useState<CarouselApi>();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  // Imágenes del carrusel del hero - Puedes reemplazar estas URLs con tus propias imágenes
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=800&fit=crop',
      alt: 'Fitness y Suplementos 1',
    },
    {
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&h=800&fit=crop',
      alt: 'Fitness y Suplementos 2',
    },
    {
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&h=800&fit=crop',
      alt: 'Fitness y Suplementos 3',
    },
  ];

  // Autoplay del carrusel
  React.useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 3000); // Cambia cada 5 segundos

    return () => clearInterval(intervalId);
  }, [api]);

  const categories = [
    {
      id: 'proteina' as ProductCategory,
      name: 'Proteínas',
      description: 'Para recuperación y crecimiento muscular',
      icon: Dumbbell,
      color: 'bg-blue-500',
    },
    {
      id: 'creatina' as ProductCategory,
      name: 'Creatina',
      description: 'Aumenta fuerza y rendimiento',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'pre-workout' as ProductCategory,
      name: 'Pre-Workout',
      description: 'Energía y concentración',
      icon: Zap,
      color: 'bg-orange-500',
    },
    {
      id: 'accesorios' as ProductCategory,
      name: 'Accesorios',
      description: 'Equipamiento esencial',
      icon: ShoppingBag,
      color: 'bg-purple-500',
    },
  ];

  const testimonials = [
    {
      name: 'Carlos M.',
      text: 'Excelente calidad de productos y entrega rápida. Muy recomendable.',
      rating: 5,
    },
    {
      name: 'Ana L.',
      text: 'Los mejores suplementos que he probado. Resultados visibles en pocas semanas.',
      rating: 5,
    },
    {
      name: 'Roberto S.',
      text: 'Atención al cliente excepcional. Siempre dispuestos a ayudar.',
      rating: 5,
    },
  ];

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (discount) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner with Carousel */}
      <section className="relative bg-[#0F0F0F] text-white overflow-hidden">
        <Carousel
          opts={{ loop: true }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {heroImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[500px] md:h-[600px]">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/30 text-white border-none" />
          <CarouselNext className="right-4 bg-white/20 hover:bg-white/30 text-white border-none" />
        </Carousel>
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl mb-6 font-bold">
                Alcanza Tus Objetivos con los Mejores Suplementos
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Productos de calidad premium para deportistas que entrenan en serio
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/productos')}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Comprar Ahora
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/productos')}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Ver Catálogo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">Categorías Principales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} to={`/categorias/${category.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`${category.color} w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl mb-2">{category.name}</h3>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl">Productos Destacados</h2>
            <Button variant="link" onClick={() => navigate('/productos')}>
              Ver Todos
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.discount && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="mb-2 line-clamp-2">{product.name}</h3>
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
                        <span className="text-xl text-blue-600">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/producto/${product.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Más Vendidos */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl">Más Vendidos</h2>
            <Button variant="link" onClick={() => navigate('/productos')}>
              Ver Todos
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      Más Vendido
                    </Badge>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xl text-blue-600">{formatPrice(product.price)}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/producto/${product.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">Lo Que Dicen Nuestros Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <p className="font-medium">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl mb-4">¿Listo para Empezar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Descubre nuestra amplia gama de suplementos deportivos de calidad
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/productos')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Explorar Productos
          </Button>
        </div>
      </section>
    </div>
  );
};
