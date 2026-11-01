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
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Primary URL is direct DummyJSON API
  const directUrl = `${DIRECT_BASE_URL}${endpoint}`;
  // Fallback URL is local dev proxy if on localhost
  const proxyUrl = isLocalhost ? `${PROXY_BASE_URL}${endpoint}` : null;

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

    // If network connection reset or failed to fetch, and proxy is available, attempt fallback
    if (proxyUrl) {
      try {
        console.warn(`[NEXORA API] Direct request failed (${error.message}). Retrying via proxy...`);
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
 * Normalizes image URLs so they route through the local proxy (/cdn-images)
 * preventing firewall/network TCP connection resets on cdn.dummyjson.com in the browser
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('https://cdn.dummyjson.com/')) {
    return url.replace('https://cdn.dummyjson.com/', '/cdn-images/');
  }
  return url;
}

export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  return {
    ...product,
    thumbnail: normalizeImageUrl(product.thumbnail),
    images: Array.isArray(product.images)
      ? product.images.map(normalizeImageUrl)
      : product.images,
  };
}

/**
 * Fetch all products
 * Primary Endpoint: https://dummyjson.com/products?limit=0
 */
export async function fetchAllProducts({ signal } = {}) {
  const data = await apiRequest('/products?limit=0', { signal });
  if (data && Array.isArray(data.products)) {
    return data.products.map(normalizeProduct);
  }
  if (Array.isArray(data)) {
    return data.map(normalizeProduct);
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
      return data.map((item) => (typeof item === 'string' ? item : item.slug || item.name || String(item)));
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[NEXORA API] /products/category-list fallback to /products/categories');
    const altData = await apiRequest('/products/categories', { signal });
    if (Array.isArray(altData)) {
      return altData.map((item) => (typeof item === 'string' ? item : item.slug || item.name || String(item)));
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
