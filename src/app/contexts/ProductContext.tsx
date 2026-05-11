import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Product, Review, Order } from '../types';
import { apiClient } from '../../lib/api-client';
import { db } from '../../lib/firebase';
import { useAuth } from './AuthContext';

interface ProductContextType {
  products: Product[];
  reviews: Review[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addReview: (review: Review) => Promise<void>;
  loadReviewsByProduct: (productId: string) => Promise<void>;
  getReviewsByProduct: (productId: string) => Review[];
  getProductById: (productId: string) => Product | undefined;
  updateOrder: (order: Order) => Promise<void>;
  createOrder: (order: Order) => Promise<void>;
  getOrdersByUser: (userId: string) => Order[];
  getAllOrders: () => Order[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Cargar productos desde la API (ruta pública)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<Product[]>('/api/products');

      if (res.ok && res.data) {
        setProducts(res.data);
      } else {
        setError(res.message ?? 'Error al cargar productos');
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Cargar órdenes según el rol del usuario autenticado.
  // Admin → todas las órdenes; Cliente → sólo las propias.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      const endpoint =
        user.role === 'administrador' ? '/api/admin/orders' : '/api/orders';

      const res = await apiClient.get<Order[]>(endpoint);
      if (res.ok && res.data) setOrders(res.data);
    };

    loadOrders();
  }, [user]);

  // Reviews se mantienen en memoria hasta tener endpoint.

  const setReviewsForProduct = (productId: string, productReviews: Review[]) => {
    setReviews((prev) => [
      ...prev.filter((review) => review.productId !== productId),
      ...productReviews,
    ]);
  };

  const updateProductRatings = (productId: string, productReviews: Review[]) => {
    const averageRating = productReviews.length
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : 0;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, rating: averageRating, reviewCount: productReviews.length }
          : product,
      ),
    );
  };

  // ── Mutaciones de productos (sólo admin) ──────────────────────

  const addProduct = async (product: Product): Promise<void> => {
    const { id: _id, createdAt: _createdAt, ...data } = product;
    const res = await apiClient.post<Product>('/api/admin/products', data);
    if (res.ok && res.data) {
      setProducts((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.message ?? 'Error al crear producto');
    }
  };

  const updateProduct = async (product: Product): Promise<void> => {
    const { id, createdAt: _createdAt, ...data } = product;
    const res = await apiClient.put<Product>(`/api/admin/products/${id}`, data);
    if (res.ok && res.data) {
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data! : p)));
    } else {
      throw new Error(res.message ?? 'Error al actualizar producto');
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    const res = await apiClient.delete(`/api/admin/products/${productId}`);
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      throw new Error(res.message ?? 'Error al eliminar producto');
    }
  };

  // ── Reviews (Firebase) ─────────────────────────────────────────

  const loadReviewsByProduct = async (productId: string): Promise<void> => {
    const reviewsRef = collection(db, 'products', productId, 'reviews');
    const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(reviewsQuery);

    const productReviews = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Review, 'id' | 'createdAt'> & {
        createdAt?: Timestamp | string;
      };

      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === 'string'
          ? data.createdAt
          : new Date().toISOString();

      return {
        ...data,
        id: doc.id,
        productId,
        createdAt,
      } as Review;
    });

    setReviewsForProduct(productId, productReviews);
    updateProductRatings(productId, productReviews);
  };

  const addReview = async (review: Review): Promise<void> => {
    const { id: _id, createdAt: _createdAt, ...data } = review;
    const reviewsRef = collection(db, 'products', review.productId, 'reviews');

    await addDoc(reviewsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    await loadReviewsByProduct(review.productId);
  };

  const getReviewsByProduct = (productId: string): Review[] => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  // ── Mutaciones de órdenes ─────────────────────────────────────

  const createOrder = async (order: Order): Promise<void> => {
    const res = await apiClient.post<Order>('/api/orders', order);
    if (res.ok && res.data) {
      setOrders((prev) => [res.data!, ...prev]);
      // Actualizar stock local de los productos afectados
      order.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.product.id
              ? { ...p, stock: p.stock - item.quantity }
              : p,
          ),
        );
      });
    } else {
      throw new Error(res.message ?? 'Error al crear la orden');
    }
  };

  const updateOrder = async (order: Order): Promise<void> => {
    const res = await apiClient.put<Order>(`/api/admin/orders/${order.id}`, {
      status: order.status,
    });
    if (res.ok && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.data! : o)));
    } else {
      throw new Error(res.message ?? 'Error al actualizar la orden');
    }
  };

  const getOrdersByUser = (userId: string): Order[] => {
    return orders.filter((o) => o.userId === userId);
  };

  const getAllOrders = (): Order[] => {
    return orders;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        reviews,
        orders,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        loadReviewsByProduct,
        getReviewsByProduct,
        getProductById,
        updateOrder,
        createOrder,
        getOrdersByUser,
        getAllOrders,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
