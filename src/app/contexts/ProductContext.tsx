import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Review, Order } from '../types';
import { catalogProducts, initialReviews, initialOrders } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  reviews: Review[];
  orders: Order[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (review: Review) => void;
  getReviewsByProduct: (productId: string) => Review[];
  getProductById: (productId: string) => Product | undefined;
  updateOrder: (order: Order) => void;
  createOrder: (order: Order) => void;
  getOrdersByUser: (userId: string) => Order[];
  getAllOrders: () => Order[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Cargar desde localStorage o usar datos iniciales
    const storedProducts = localStorage.getItem('products');
    const storedReviews = localStorage.getItem('reviews');
    const storedOrders = localStorage.getItem('orders');

    setProducts(storedProducts ? JSON.parse(storedProducts) : catalogProducts);
    setReviews(storedReviews ? JSON.parse(storedReviews) : initialReviews);
    setOrders(storedOrders ? JSON.parse(storedOrders) : initialOrders);
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addReview = (review: Review) => {
    setReviews((prev) => [...prev, review]);
    
    // Actualizar rating del producto
    const productReviews = [...reviews, review].filter(r => r.productId === review.productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    
    setProducts((prev) =>
      prev.map((p) =>
        p.id === review.productId
          ? { ...p, rating: avgRating, reviewCount: productReviews.length }
          : p
      )
    );
  };

  const getReviewsByProduct = (productId: string): Review[] => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  const createOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
    
    // Actualizar stock de productos
    order.items.forEach(item => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.product.id
            ? { ...p, stock: p.stock - item.quantity }
            : p
        )
      );
    });
  };

  const updateOrder = (order: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? order : o))
    );
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
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
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
