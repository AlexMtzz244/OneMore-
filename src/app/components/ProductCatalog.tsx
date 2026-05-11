import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useProducts } from '../contexts/ProductContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Star, SlidersHorizontal } from 'lucide-react';
import { ProductCategory, ProductGoal } from '../types';

export const ProductCatalog: React.FC = () => {
  const { products, loadReviewsByProduct } = useProducts();
  const { formatPrice } = useCurrency();
  const { category } = useParams<{ category: ProductCategory }>();
  const navigate = useNavigate();
  const loadedReviewIdsRef = React.useRef<Set<string>>(new Set());

  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(
    category ? [category] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<ProductGoal[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    // Filtrar por marca
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    // Filtrar por objetivo
    if (selectedGoals.length > 0) {
      filtered = filtered.filter((p) =>
        p.goal.some((g) => selectedGoals.includes(g))
      );
    }

    // Filtrar por precio
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategories, selectedBrands, selectedGoals, priceRange, sortBy]);

  React.useEffect(() => {
    const idsToLoad = products
      .map((product) => product.id)
      .filter((id) => !loadedReviewIdsRef.current.has(id));

    if (idsToLoad.length === 0) {
      return;
    }

    idsToLoad.forEach((id) => loadedReviewIdsRef.current.add(id));

    Promise.all(
      idsToLoad.map((id) =>
        loadReviewsByProduct(id).catch((error) => {
          console.error('Error loading reviews for catalog:', error);
        }),
      ),
    ).catch(() => undefined);
  }, [products, loadReviewsByProduct]);

  const toggleCategory = (cat: ProductCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleGoal = (goal: ProductGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (discount) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const getCategoryName = (cat: ProductCategory) => {
    const names: Record<ProductCategory, string> = {
      proteina: 'Proteína',
      creatina: 'Creatina',
      'pre-workout': 'Pre-Workout',
      accesorios: 'Accesorios',
    };
    return names[cat];
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            {category ? getCategoryName(category) : 'Todos los Productos'}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filtros - Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Categorías */}
                <div>
                  <Label className="text-base mb-3 block">Categorías</Label>
                  <div className="space-y-2">
                    {(['proteina', 'creatina', 'pre-workout', 'accesorios'] as ProductCategory[]).map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <label
                          htmlFor={`cat-${cat}`}
                          className="text-sm cursor-pointer"
                        >
                          {getCategoryName(cat)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marcas */}
                <div>
                  <Label className="text-base mb-3 block">Marcas</Label>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="text-sm cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objetivo */}
                <div>
                  <Label className="text-base mb-3 block">Objetivo</Label>
                  <div className="space-y-2">
                    {(['volumen', 'definicion', 'fuerza', 'resistencia', 'general'] as ProductGoal[]).map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={`goal-${goal}`}
                          checked={selectedGoals.includes(goal)}
                          onCheckedChange={() => toggleGoal(goal)}
                        />
                        <label
                          htmlFor={`goal-${goal}`}
                          className="text-sm cursor-pointer capitalize"
                        >
                          {goal}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rango de Precio */}
                <div>
                  <Label className="text-base mb-3 block">
                    Precio: {formatPrice(priceRange[0], 0)} - {formatPrice(priceRange[1], 0)}
                  </Label>
                  <Slider
                    min={0}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-2"
                  />
                </div>

                {/* Limpiar Filtros */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories(category ? [category] : []);
                    setSelectedBrands([]);
                    setSelectedGoals([]);
                    setPriceRange([0, 2000]);
                  }}
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Productos */}
          <div className="flex-1">
            {/* Controles superiores */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Más Popular</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="newest">Más Recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid de productos */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No se encontraron productos con los filtros seleccionados.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const displayedRating = product.reviewCount > 0 ? product.rating : 0;

                  return (
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
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                            <Badge variant="destructive" className="text-lg">Agotado</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                        <h3 className="mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/producto/${product.id}`)}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{displayedRating}</span>
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
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Agotado' : 'Ver Detalles'}
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
