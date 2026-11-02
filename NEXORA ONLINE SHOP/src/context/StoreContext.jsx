import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const CART_STORAGE_KEY = 'ecommerce_cart';
const FAVORITES_STORAGE_KEY = 'ecommerce_favorites';
const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_FEE = 5;

// Helper to format currency consistently across the whole app
export const formatPrice = (amount) => {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numeric);
};

// Safe JSON parser for localStorage with corruption prevention and image URL migration
const sanitizeStoredItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  let thumb = item.thumbnail || '';
  if (thumb && thumb.startsWith('/cdn-images/')) {
    thumb = thumb.replace('/cdn-images/', 'https://cdn.dummyjson.com/');
  }
  return { ...item, thumbnail: thumb };
};

const getSafeStorageItem = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeStoredItem) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage, resetting to fallback:`, err);
    return fallback;
  }
};

// Initial state loaded from localStorage
const initialState = {
  cart: getSafeStorageItem(CART_STORAGE_KEY, []),
  favorites: getSafeStorageItem(FAVORITES_STORAGE_KEY, []),
};

// Action types
export const ACTION_TYPES = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  INCREASE_QUANTITY: 'INCREASE_QUANTITY',
  DECREASE_QUANTITY: 'DECREASE_QUANTITY',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  CLEAR_FAVORITES: 'CLEAR_FAVORITES',
};

// Reducer function
function storeReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_TO_CART: {
      const { product, quantity = 1 } = action.payload;
      if (!product || !product.id) return state;

      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
      const availableStock = typeof product.stock === 'number' ? product.stock : 999;
      const existingIndex = state.cart.findIndex((item) => item.id === product.id);

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = state.cart.map((item, idx) => {
          if (idx === existingIndex) {
            const currentQty = item.quantity || 1;
            const newQty = Math.min(currentQty + qtyToAdd, availableStock);
            return {
              ...item,
              quantity: newQty,
            };
          }
          return item;
        });
      } else {
        const initialQty = Math.min(qtyToAdd, availableStock);
        updatedCart = [
          ...state.cart,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
            stock: availableStock,
            category: product.category || 'General',
            brand: product.brand || '',
            quantity: initialQty,
          },
        ];
      }

      return { ...state, cart: updatedCart };
    }

    case ACTION_TYPES.REMOVE_FROM_CART: {
      const id = action.payload;
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== id),
      };
    }

    case ACTION_TYPES.INCREASE_QUANTITY: {
      const id = action.payload;
      return {
        ...state,
        cart: state.cart.map((item) => {
          if (item.id === id) {
            const maxStock = typeof item.stock === 'number' ? item.stock : 999;
            const newQty = Math.min(item.quantity + 1, maxStock);
            return { ...item, quantity: newQty };
          }
          return item;
        }),
      };
    }

    case ACTION_TYPES.DECREASE_QUANTITY: {
      const id = action.payload;
      return {
        ...state,
        cart: state.cart.map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity - 1);
            return { ...item, quantity: newQty };
          }
          return item;
        }),
      };
    }

    case ACTION_TYPES.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      const parsedQty = parseInt(quantity, 10);
      if (isNaN(parsedQty)) return state;

      return {
        ...state,
        cart: state.cart.map((item) => {
          if (item.id === id) {
            const maxStock = typeof item.stock === 'number' ? item.stock : 999;
            const clampedQty = Math.min(Math.max(1, parsedQty), maxStock);
            return { ...item, quantity: clampedQty };
          }
          return item;
        }),
      };
    }

    case ACTION_TYPES.CLEAR_CART: {
      return {
        ...state,
        cart: [],
      };
    }

    case ACTION_TYPES.ADD_TO_FAVORITES: {
      const product = action.payload;
      if (!product || !product.id) return state;
      const exists = state.favorites.some((item) => item.id === product.id);
      if (exists) return state;

      return {
        ...state,
        favorites: [
          ...state.favorites,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
            category: product.category || 'General',
            rating: product.rating || 0,
            stock: product.stock || 0,
            brand: product.brand || '',
          },
        ],
      };
    }

    case ACTION_TYPES.REMOVE_FROM_FAVORITES: {
      const id = action.payload;
      return {
        ...state,
        favorites: state.favorites.filter((item) => item.id !== id),
      };
    }

    case ACTION_TYPES.TOGGLE_FAVORITE: {
      const product = action.payload;
      if (!product || !product.id) return state;
      const exists = state.favorites.some((item) => item.id === product.id);

      if (exists) {
        return {
          ...state,
          favorites: state.favorites.filter((item) => item.id !== product.id),
        };
      }

      return {
        ...state,
        favorites: [
          ...state.favorites,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
            category: product.category || 'General',
            rating: product.rating || 0,
            stock: product.stock || 0,
            brand: product.brand || '',
          },
        ],
      };
    }

    case ACTION_TYPES.CLEAR_FAVORITES: {
      return {
        ...state,
        favorites: [],
      };
    }

    default:
      return state;
  }
}

// Create Context
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Sync cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
    } catch (err) {
      console.error('Failed to persist cart to localStorage:', err);
    }
  }, [state.cart]);

  // Sync favorites changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favorites));
    } catch (err) {
      console.error('Failed to persist favorites to localStorage:', err);
    }
  }, [state.favorites]);

  // Derived financial & cart calculations
  const cartSummary = useMemo(() => {
    const subtotal = state.cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);

    const itemCount = state.cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    // Free shipping if subtotal >= 100, otherwise $5 (if cart is empty, shipping is $0)
    const shipping = subtotal > 0 ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE) : 0;
    const discount = 0; // Strictly derived as per PRD: no discount unless rule specified
    const total = subtotal + shipping - discount;

    const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    return {
      subtotal,
      shipping,
      discount,
      total,
      itemCount,
      amountUntilFreeShipping,
      freeShippingProgress,
      isFreeShippingUnlocked: subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0,
    };
  }, [state.cart]);

  // Helper to check favorite status
  const isFavorite = (productId) => {
    return state.favorites.some((item) => item.id === productId);
  };

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { product, quantity } });
  };

  const removeFromCart = (id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: id });
  };

  const increaseQuantity = (id) => {
    dispatch({ type: ACTION_TYPES.INCREASE_QUANTITY, payload: id });
  };

  const decreaseQuantity = (id) => {
    dispatch({ type: ACTION_TYPES.DECREASE_QUANTITY, payload: id });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: ACTION_TYPES.UPDATE_QUANTITY, payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: ACTION_TYPES.CLEAR_CART });
  };

  // Favorites actions
  const addToFavorites = (product) => {
    dispatch({ type: ACTION_TYPES.ADD_TO_FAVORITES, payload: product });
  };

  const removeFromFavorites = (id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_FROM_FAVORITES, payload: id });
  };

  const toggleFavorite = (product) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_FAVORITE, payload: product });
  };

  const clearFavorites = () => {
    dispatch({ type: ACTION_TYPES.CLEAR_FAVORITES });
  };

  const contextValue = {
    cart: state.cart,
    favorites: state.favorites,
    cartSummary,
    isFavorite,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    dispatch,
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

// Custom hook to consume the full store context
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Specialized hook for cart operations
export function useCart() {
  const {
    cart,
    cartSummary,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
  } = useStore();

  return {
    cart,
    ...cartSummary,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
  };
}

// Specialized hook for favorites operations
export function useFavorites() {
  const {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
  } = useStore();

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
  };
}
