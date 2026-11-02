import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { fetchProductById, normalizeImageUrl } from '../services/api';
import { useCart, useFavorites, formatPrice } from '../context/StoreContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, cart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Check how many of this item is already in cart to limit further additions
  const currentInCart = cart.find((item) => item.id === Number(id))?.quantity || 0;

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setQuantity(1);

    fetchProductById(id, { signal: controller.signal })
      .then((data) => {
        setProduct(data);
        const firstImg = (data.images && data.images[0]) || data.thumbnail || '';
        setSelectedImage(normalizeImageUrl(firstImg));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Product not found.');
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem', width: '120px', height: '24px' }} className="skeleton" />
        <div className="product-detail-layout" aria-busy="true">
          <div className="product-gallery">
            <div className="skeleton" style={{ height: '420px', borderRadius: 'var(--radius-lg)' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-md)' }} />
              <div className="skeleton" style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-md)' }} />
              <div className="skeleton" style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
          <div className="detail-content">
            <div className="skeleton" style={{ width: '40%', height: '24px' }} />
            <div className="skeleton" style={{ width: '80%', height: '40px' }} />
            <div className="skeleton" style={{ width: '50%', height: '28px' }} />
            <div className="skeleton" style={{ width: '100%', height: '120px' }} />
            <div className="skeleton" style={{ width: '60%', height: '48px', marginTop: 'auto' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="state-container" role="alert">
        <div className="state-icon-wrap error">
          <AlertCircle size={36} />
        </div>
        <h2 className="state-title">Product Not Found</h2>
        <p className="state-desc">
          {error || 'The requested product could not be found or may no longer be available.'}
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Product Store</span>
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    price = 0,
    discountPercentage = 0,
    rating = 0,
    stock = 0,
    brand,
    category,
    images = [],
    sku,
    warrantyInformation,
    shippingInformation,
    returnPolicy,
    reviews = [],
  } = product;

  const favorited = isFavorite(product.id);
  const availableStock = Math.max(0, stock - currentInCart);
  const isOutOfStock = stock <= 0 || availableStock <= 0;

  // Derive original price before discount
  const hasDiscount = discountPercentage > 0;
  const originalPrice = hasDiscount ? price / (1 - discountPercentage / 100) : price;

  const FALLBACK_DETAIL_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" fill="%23F1F5F9"><rect width="500" height="500" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="600" fill="%2364748B">NEXORA Product</text></svg>';

  const handleDetailImageError = (e) => {
    const src = e.target.src;
    if (!src || src.startsWith('data:image/svg+xml')) return;

    if (src.includes('cdn.dummyjson.com') && !src.includes('/cdn-images/')) {
      const proxied = src.replace(/https?:\/\/cdn\.dummyjson\.com\//, '/cdn-images/');
      if (proxied !== src) {
        e.target.src = proxied;
        return;
      }
    }
    e.target.src = FALLBACK_DETAIL_IMAGE;
  };

  const handleThumbnailError = (e) => {
    const src = e.target.src;
    if (!src || src.startsWith('data:image/svg+xml')) return;

    if (src.includes('cdn.dummyjson.com') && !src.includes('/cdn-images/')) {
      const proxied = src.replace(/https?:\/\/cdn\.dummyjson\.com\//, '/cdn-images/');
      if (proxied !== src) {
        e.target.src = proxied;
        return;
      }
    }
    e.target.src = FALLBACK_DETAIL_IMAGE;
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => Math.min(availableStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock || quantity < 1) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="footer-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span style={{ textTransform: 'capitalize' }}>{category}</span>
        <span className="breadcrumb-separator">/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="product-detail-layout">
        {/* Left: Gallery */}
        <div className="product-gallery">
          <div className="main-image-display">
            <img
              src={selectedImage || FALLBACK_DETAIL_IMAGE}
              alt={title}
              onError={handleDetailImageError}
            />
            {hasDiscount && (
              <span
                className="badge badge-accent"
                style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem', padding: '6px 12px' }}
              >
                Save {Math.round(discountPercentage)}%
              </span>
            )}
          </div>

          {/* Interactive Thumbnails */}
          {images && images.length > 1 && (
            <div className="thumbnails-row" aria-label="Product thumbnails">
              {images.map((imgUrl, idx) => {
                const normalizedImgUrl = normalizeImageUrl(imgUrl);
                return (
                  <button
                    type="button"
                    key={`thumb-${idx}`}
                    className={`thumbnail-btn ${selectedImage === normalizedImgUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImage(normalizedImgUrl)}
                    aria-label={`View image ${idx + 1} of ${images.length}`}
                  >
                    <img
                      src={normalizedImgUrl}
                      alt={`${title} thumbnail ${idx + 1}`}
                      onError={handleThumbnailError}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase */}
        <div className="detail-content">
          <div className="detail-meta-top">
            <span className="badge badge-brand">{category}</span>
            <button
              type="button"
              className={`favorite-toggle-btn ${favorited ? 'is-favorite' : ''}`}
              onClick={() => toggleFavorite(product)}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={favorited ? '#EF4444' : 'none'} />
            </button>
          </div>

          <h1 className="detail-title">{title}</h1>

          {brand && <p className="detail-brand">Brand: <strong>{brand}</strong></p>}

          {/* Rating */}
          <div className="detail-rating-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={18} className="rating-star-icon" />
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {Number(rating).toFixed(1)}
              </strong>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>Based on {reviews.length || 18} customer ratings</span>
          </div>

          {/* Price Box */}
          <div className="detail-price-box">
            <span className="detail-price">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="original-price" style={{ fontSize: '1.1rem' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
            <span
              className={`badge ${isOutOfStock ? 'badge-error' : stock < 10 ? 'badge-warning' : 'badge-success'}`}
              style={{ marginLeft: 'auto' }}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : stock < 10
                ? `Only ${stock} left`
                : 'In Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="detail-description">{description}</p>

          {/* Technical Specs & Details */}
          <div className="detail-specifications-grid">
            <div className="spec-item">
              <span className="spec-label">Warranty</span>
              <span className="spec-value">{warrantyInformation || '1-Year Warranty'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Shipping</span>
              <span className="spec-value">{shippingInformation || 'Standard 3-5 Days'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Return Policy</span>
              <span className="spec-value">{returnPolicy || '30 Days Return'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">SKU</span>
              <span className="spec-value">{sku || `SKU-${id}`}</span>
            </div>
          </div>

          {/* Stock info and current cart notice */}
          {currentInCart > 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-brand)', fontWeight: 500 }}>
              You currently have {currentInCart} in your shopping cart.
            </p>
          )}

          {/* Purchase Controller */}
          <div className="purchase-panel">
            {/* Quantity Controls */}
            <div className="quantity-controller" aria-label="Select quantity">
              <button
                type="button"
                className="qty-btn"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="qty-display" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="qty-btn"
                onClick={handleQuantityIncrease}
                disabled={quantity >= availableStock || isOutOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              className={`btn-primary btn-lg ${addedNotice ? 'btn-secondary' : ''}`}
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Item is out of stock' : 'Add item to cart'}
            >
              {addedNotice ? (
                <>
                  <Check size={18} color="var(--color-success)" />
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : isOutOfStock ? (
                <>
                  <Package size={18} />
                  <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Add {quantity} to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Return to Shop link */}
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Customer Guarantees Badges */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Truck size={16} color="var(--color-brand)" />
              <span>Free delivery on orders &gt; $100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} color="var(--color-accent)" />
              <span>Authentic Guarantee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={16} color="var(--color-warning)" />
              <span>Easy 30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
