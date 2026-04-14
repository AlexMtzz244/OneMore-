import { Product, User, Order, Review, Coupon, ActivityLog, SalesData } from '../types';

// Usuarios mock - Solo referencia ya que la autenticación usa Firebase
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@onemore.com',
    name: 'Administrador',
    role: 'administrador',
    addresses: [],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'cliente@example.com',
    name: 'Juan Pérez',
    role: 'cliente',
    addresses: [
      {
        id: 'a1',
        street: 'Calle Principal 123',
        city: 'Madrid',
        state: 'Madrid',
        zipCode: '28001',
        country: 'España',
        isDefault: true
      }
    ],
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'maria@example.com',
    name: 'María García',
    role: 'cliente',
    addresses: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // 15 días atrás
  }
];

// Productos mock
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Whey Protein Isolate',
    brand: 'ProMax',
    category: 'proteina',
    price: 1299,
    description: 'Proteína aislada de suero de alta pureza con 90% de contenido proteico. Ideal para recuperación muscular post-entrenamiento.',
    nutritionalInfo: {
      servingSize: '30g',
      servingsPerContainer: 33,
      protein: '27g',
      carbs: '1g',
      fats: '0.5g',
      calories: '110 kcal',
      otherIngredients: ['BCAA', 'Glutamina']
    },
    presentation: '1kg',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800'],
    goal: ['volumen', 'definicion'],
    featured: true,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 156,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'p2',
    name: 'Creatina Monohidratada',
    brand: 'PowerLift',
    category: 'creatina',
    price: 649,
    description: 'Creatina monohidratada micronizada de alta pureza. Aumenta la fuerza y el rendimiento en entrenamientos de alta intensidad.',
    nutritionalInfo: {
      servingSize: '5g',
      servingsPerContainer: 60,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Creatina Monohidrato 100%']
    },
    presentation: '300g',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'],
    goal: ['fuerza', 'volumen'],
    featured: true,
    bestSeller: true,
    discount: 15,
    rating: 4.9,
    reviewCount: 203,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 'p3',
    name: 'Pre-Workout Extreme',
    brand: 'EnergyMax',
    category: 'pre-workout',
    price: 799,
    description: 'Fórmula pre-entreno con cafeína, beta-alanina y citrulina para máxima energía y concentración.',
    nutritionalInfo: {
      servingSize: '15g',
      servingsPerContainer: 20,
      protein: '0g',
      carbs: '3g',
      fats: '0g',
      calories: '15 kcal',
      otherIngredients: ['Cafeína 200mg', 'Beta-Alanina', 'Citrulina', 'Taurina']
    },
    presentation: '300g',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800'],
    goal: ['fuerza', 'resistencia'],
    featured: true,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 89,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'p4',
    name: 'Shaker Premium',
    brand: 'FitGear',
    category: 'accesorios',
    price: 189,
    description: 'Shaker libre de BPA con compartimento para suplementos y bola mezcladora incluida. Capacidad 700ml.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: []
    },
    presentation: 'Unidad',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800'],
    goal: ['general'],
    featured: false,
    bestSeller: true,
    rating: 4.7,
    reviewCount: 124,
    createdAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'p5',
    name: 'Caseína Nocturna',
    brand: 'ProMax',
    category: 'proteina',
    price: 1399,
    description: 'Proteína de absorción lenta ideal para tomar antes de dormir. Libera aminoácidos durante toda la noche.',
    nutritionalInfo: {
      servingSize: '35g',
      servingsPerContainer: 28,
      protein: '24g',
      carbs: '3g',
      fats: '1g',
      calories: '120 kcal',
      otherIngredients: ['Caseína Micelar', 'Enzimas Digestivas']
    },
    presentation: '1kg',
    stock: 3, // Stock bajo
    images: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800'],
    goal: ['volumen', 'definicion'],
    featured: false,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 67,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p6',
    name: 'BCAA Recovery',
    brand: 'PowerLift',
    category: 'pre-workout',
    price: 699,
    description: 'Aminoácidos ramificados en ratio 2:1:1 para recuperación muscular y prevención del catabolismo.',
    nutritionalInfo: {
      servingSize: '10g',
      servingsPerContainer: 30,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Leucina', 'Isoleucina', 'Valina', 'Vitamina B6']
    },
    presentation: '300g',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800'],
    goal: ['volumen', 'definicion', 'resistencia'],
    featured: true,
    bestSeller: false,
    rating: 4.4,
    reviewCount: 98,
    createdAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'p7',
    name: 'Glutamina Ultra',
    brand: 'EnergyMax',
    category: 'proteina',
    price: 549,
    description: 'L-Glutamina pura para recuperación muscular y soporte del sistema inmunológico.',
    nutritionalInfo: {
      servingSize: '5g',
      servingsPerContainer: 60,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['L-Glutamina 100%']
    },
    presentation: '300g',
    stock: 2, // Stock bajo
    images: ['https://images.unsplash.com/photo-1610893687381-c488352f9a95?w=800'],
    goal: ['volumen', 'resistencia'],
    featured: false,
    bestSeller: false,
    rating: 4.3,
    reviewCount: 45,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'p8',
    name: 'Guantes de Entrenamiento',
    brand: 'FitGear',
    category: 'accesorios',
    price: 329,
    description: 'Guantes acolchados con soporte de muñeca para levantamiento de pesas. Material transpirable.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: []
    },
    presentation: 'Par',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
    goal: ['general'],
    featured: false,
    bestSeller: true,
    rating: 4.6,
    reviewCount: 112,
    createdAt: '2024-01-22T00:00:00Z'
  },
  {
    id: 'p9',
    name: 'Creatina HCL',
    brand: 'PowerLift',
    category: 'creatina',
    price: 759,
    description: 'Creatina HCL de alta biodisponibilidad. No requiere fase de carga y mejor absorción.',
    nutritionalInfo: {
      servingSize: '2g',
      servingsPerContainer: 75,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Creatina HCL 100%']
    },
    presentation: '150g',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'],
    goal: ['fuerza', 'volumen'],
    featured: false,
    bestSeller: false,
    rating: 4.7,
    reviewCount: 76,
    createdAt: '2024-01-25T00:00:00Z'
  },
  {
    id: 'p10',
    name: 'Pre-Workout Natural',
    brand: 'EnergyMax',
    category: 'pre-workout',
    price: 629,
    description: 'Pre-entreno con ingredientes naturales, sin estimulantes artificiales. Con cafeína de té verde.',
    nutritionalInfo: {
      servingSize: '12g',
      servingsPerContainer: 25,
      protein: '0g',
      carbs: '2g',
      fats: '0g',
      calories: '10 kcal',
      otherIngredients: ['Cafeína Natural 100mg', 'Extracto de Remolacha', 'L-Arginina']
    },
    presentation: '300g',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'],
    goal: ['resistencia', 'general'],
    featured: false,
    bestSeller: false,
    discount: 10,
    rating: 4.4,
    reviewCount: 54,
    createdAt: '2024-01-28T00:00:00Z'
  },
  {
    id: 'p11',
    name: 'Proteína Vegana',
    brand: 'ProMax',
    category: 'proteina',
    price: 1199,
    description: 'Proteína vegetal de guisante y arroz. 100% plant-based con perfil completo de aminoácidos.',
    nutritionalInfo: {
      servingSize: '30g',
      servingsPerContainer: 33,
      protein: '22g',
      carbs: '3g',
      fats: '2g',
      calories: '120 kcal',
      otherIngredients: ['Proteína de Guisante', 'Proteína de Arroz', 'Enzimas Digestivas']
    },
    presentation: '1kg',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800'],
    goal: ['volumen', 'definicion'],
    featured: true,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 89,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'p12',
    name: 'Cinturón de Levantamiento',
    brand: 'FitGear',
    category: 'accesorios',
    price: 999,
    description: 'Cinturón de cuero genuino para soporte lumbar en levantamientos pesados. Hebilla de doble cierre.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: []
    },
    presentation: 'Unidad',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
    goal: ['fuerza'],
    featured: false,
    bestSeller: false,
    rating: 4.8,
    reviewCount: 67,
    createdAt: '2024-02-03T00:00:00Z'
  }
];

// Reviews mock
export const mockReviews: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    userId: '2',
    userName: 'Juan Pérez',
    rating: 5,
    comment: 'Excelente proteína, se disuelve muy bien y el sabor es increíble. La uso después de cada entrenamiento.',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'r2',
    productId: 'p1',
    userId: '3',
    userName: 'María García',
    rating: 4,
    comment: 'Muy buena calidad, aunque el precio es un poco elevado. Los resultados son notorios.',
    createdAt: '2024-01-22T00:00:00Z'
  },
  {
    id: 'r3',
    productId: 'p2',
    userId: '2',
    userName: 'Juan Pérez',
    rating: 5,
    comment: 'La mejor creatina que he probado. Noté aumento en fuerza desde la primera semana.',
    createdAt: '2024-01-25T00:00:00Z'
  }
];

// Orders mock
export const mockOrders: Order[] = [
  {
    id: 'o1',
    userId: '2',
    items: [
      {
        product: mockProducts[0],
        quantity: 2
      },
      {
        product: mockProducts[1],
        quantity: 1
      }
    ],
    total: 3247,
    status: 'entregado',
    shippingAddress: {
      id: 'a1',
      street: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'España',
      isDefault: true
    },
    paymentMethod: 'Tarjeta de Crédito',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'o2',
    userId: '2',
    items: [
      {
        product: mockProducts[2],
        quantity: 1
      }
    ],
    total: 799,
    status: 'enviado',
    shippingAddress: {
      id: 'a1',
      street: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'España',
      isDefault: true
    },
    paymentMethod: 'PayPal',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-03T00:00:00Z'
  }
];

// Cupones mock
export const mockCoupons: Coupon[] = [
  {
    id: 'c1',
    code: 'BIENVENIDO10',
    discount: 10,
    validUntil: '2026-12-31T23:59:59Z',
    active: true
  },
  {
    id: 'c2',
    code: 'VERANO20',
    discount: 20,
    validUntil: '2026-06-30T23:59:59Z',
    active: true
  }
];

// Logs de actividad mock para el dashboard
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'al1',
    userId: '1',
    userName: 'Administrador',
    action: 'Actualizó producto',
    target: 'Whey Protein Isolate',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
  },
  {
    id: 'al2',
    userId: '1',
    userName: 'Administrador',
    action: 'Cambió estado de pedido',
    target: 'Pedido #o2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
  },
  {
    id: 'al3',
    userId: '1',
    userName: 'Administrador',
    action: 'Agregó producto',
    target: 'Proteína Vegana',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'al4',
    userId: '1',
    userName: 'Administrador',
    action: 'Actualizó stock',
    target: 'Creatina Monohidratada',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'al5',
    userId: '1',
    userName: 'Administrador',
    action: 'Eliminó producto',
    target: 'Pre-Workout Básico',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
  },
];

// Datos de ventas de los últimos 30 días
export const mockSalesData: SalesData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  
  // Generar datos aleatorios pero realistas
  const baseOrders = 4 + Math.floor(Math.random() * 9);
  const avgOrderValue = 750 + Math.random() * 1500;
  const sales = baseOrders * avgOrderValue;
  
  return {
    date: date.toISOString().split('T')[0],
    sales: Math.round(sales * 100) / 100,
    orders: baseOrders,
  };
});