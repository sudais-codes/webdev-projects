/**
 * DummyJSON API Service for NEXORA ONLINE SHOP
 * Encapsulates all product and category network requests.
 * Uses fetch with async/await, proper HTTP status verification, signal support,
 * and automatic fallback between direct API and local proxy to prevent connection reset errors.
 */

const DIRECT_BASE_URL = 'https://dummyjson.com';
const PROXY_BASE_URL = '/dummyjson';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Execute single fetch with timeout
 */
async function fetchWithTimeout(url, { signal, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timed out')), timeout);

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw signal.reason || new Error('Request was aborted');
    }
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort(signal.reason);
    });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generic fetch wrapper with dual-path resilience:
 * Tries direct API first; if network or firewall connection reset occurs,
 * seamlessly falls back to the local dev proxy.
 */
async function apiRequest(endpoint, options = {}) {
  // Primary URL is direct DummyJSON API
  const directUrl = `${DIRECT_BASE_URL}${endpoint}`;
  // Resilient fallback URL proxied via Vite (dev) or Vercel edge rewrites (production)
  const proxyUrl = `${PROXY_BASE_URL}${endpoint}`;

  try {
    const response = await fetchWithTimeout(directUrl, options);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    // Dual-path resilience: retry via edge/local proxy if direct connection fails, times out, or resets
    if (proxyUrl) {
      try {
        console.warn(`[NEXORA API] Direct request failed (${error.message}). Retrying via proxy endpoint...`);
        const proxyResponse = await fetchWithTimeout(proxyUrl, options);
        if (proxyResponse.ok) {
          return await proxyResponse.json();
        }
      } catch (proxyError) {
        if (proxyError.name === 'AbortError') throw proxyError;
        console.error('[NEXORA API] Proxy retry also failed:', proxyError.message);
      }
    }

    console.error(`[NEXORA API] Request to ${endpoint} failed:`, error.message);
    throw new Error(error.message || 'Unable to fetch data from the server. Please check your internet connection.');
  }
}

/**
 * Normalizes image URLs to ensure valid, absolute HTTPS DummyJSON CDN links.
 * Handles migration for any legacy relative proxy paths (/cdn-images/) back to absolute CDN links.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/cdn-images/')) {
    return trimmed.replace('/cdn-images/', 'https://cdn.dummyjson.com/');
  }
  return trimmed;
}

export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  const thumbnail = normalizeImageUrl(product.thumbnail);
  const images = Array.isArray(product.images)
    ? product.images.map(normalizeImageUrl).filter(Boolean)
    : [];

  const resolvedThumbnail = thumbnail || (images.length > 0 ? images[0] : '');

  return {
    ...product,
    thumbnail: resolvedThumbnail,
    images: images.length > 0 ? images : (resolvedThumbnail ? [resolvedThumbnail] : []),
  };
}

/**
 * Fetch all products
 * Primary Endpoint: https://dummyjson.com/products?limit=0
 */
const PRODUCTS_CACHE_KEY = 'nexora_catalog_cache';
const CATEGORIES_CACHE_KEY = 'nexora_categories_cache';

/**
 * Fetch all products
 * Primary Endpoint: https://dummyjson.com/products?limit=0
 */
export async function fetchAllProducts({ signal } = {}) {
  try {
    const data = await apiRequest('/products?limit=0', { signal });
    let normalized = [];
    if (data && Array.isArray(data.products)) {
      normalized = data.products.map(normalizeProduct);
    } else if (Array.isArray(data)) {
      normalized = data.map(normalizeProduct);
    }
    if (normalized.length > 0) {
      try {
        sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(normalized));
      } catch (e) {
        // Ignore session quota errors
      }
      return normalized;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    try {
      const cached = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn('[NEXORA API] Serving products from session cache due to network failure');
          return parsed;
        }
      }
    } catch (e) {
      // Ignore cache read errors
    }
    throw err;
  }
  return [];
}

/**
 * Fetch categories dynamically
 * Primary Endpoint: https://dummyjson.com/products/category-list
 */
export async function fetchCategories({ signal } = {}) {
  try {
    const data = await apiRequest('/products/category-list', { signal });
    if (Array.isArray(data)) {
      const cats = data.map((item) => (typeof item === 'string' ? item : item.slug || item.name || String(item)));
      try {
        sessionStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cats));
      } catch (e) {}
      return cats;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[NEXORA API] /products/category-list fallback to /products/categories');
    try {
      const altData = await apiRequest('/products/categories', { signal });
      if (Array.isArray(altData)) {
        const cats = altData.map((item) => (typeof item === 'string' ? item : item.slug || item.name || String(item)));
        try {
          sessionStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cats));
        } catch (e) {}
        return cats;
      }
    } catch (altErr) {
      if (altErr.name === 'AbortError') throw altErr;
      try {
        const cached = sessionStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
  }
  return [];
}

/**
 * Fetch a single product by numeric ID
 * Primary Endpoint: https://dummyjson.com/products/{id}
 */
export async function fetchProductById(id, { signal } = {}) {
  if (!id) throw new Error('Product ID is required.');
  const data = await apiRequest(`/products/${id}`, { signal });
  return normalizeProduct(data);
}

/**
 * Fetch category-specific products
 * Primary Endpoint: https://dummyjson.com/products/category/{category}
 */
export async function fetchProductsByCategory(category, { signal } = {}) {
  if (!category || category === 'all') {
    return fetchAllProducts({ signal });
  }
  const data = await apiRequest(`/products/category/${encodeURIComponent(category)}?limit=0`, { signal });
  if (data && Array.isArray(data.products)) {
    return data.products.map(normalizeProduct);
  }
  return [];
}
