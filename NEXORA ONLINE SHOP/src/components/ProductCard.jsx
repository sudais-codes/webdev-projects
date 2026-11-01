import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart, useFavorites, formatPrice } from '../context/StoreContext';
import { normalizeImageUrl } from '../services/api';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const {
    id,
    title,
    price = 0,
    discountPercentage = 0,
    rating = 0,
    category = 'General',
    thumbnail,
    images = [],
    stock = 0,
  } = product;

  const favorited = isFavorite(id);
  const isOutOfStock = stock <= 0;

  // Derive original price before discount if discount exists
  const hasDiscount = discountPercentage > 0;
  const originalPrice = hasDiscount ? price / (1 - discountPercentage / 100) : price;

  const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23F8FAFC"><rect width="400" height="400" fill="%23F8FAFC"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="%231D4ED8">NEXORA</text></svg>';

  const rawImage = thumbnail || (images && images.length > 0 ? images[0] : '');
  const displayImage = imageError || !rawImage ? FALLBACK_IMAGE : normalizeImageUrl(rawImage);

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <article className="product-card" aria-labelledby={`product-title-${id}`}>
      {/* Top Bar: Category badge & Favorite Button */}
      <div className="card-top-bar">
        <span className="badge badge-subtle">{category}</span>
        <button
          type="button"
          className={`favorite-toggle-btn ${favorited ? 'is-favorite' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={favorited ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={favorited ? '#EF4444' : 'none'} />
        </button>
      </div>

      {/* Product Image Container */}
      <div
        className="product-image-container"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`View details for ${title}`}
      >
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {hasDiscount && (
          <span
            className="badge badge-accent"
            style={{ position: 'absolute', bottom: '8px', left: '8px' }}
          >
            -{Math.round(discountPercentage)}% OFF
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="product-info">
        <h3
          id={`product-title-${id}`}
          className="product-card-title"
          onClick={handleCardClick}
          title={title}
        >
          {title}
        </h3>

        {/* Rating and Stock indicator */}
        <div className="product-rating">
          <Star size={14} className="rating-star-icon" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {Number(rating).toFixed(1)}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: isOutOfStock ? 'var(--color-error)' : 'var(--text-secondary)' }}>
            {isOutOfStock ? 'Out of stock' : `${stock} in stock`}
          </span>
        </div>

        {/* Card Footer: Price and Add To Cart */}
        <div className="product-card-footer">
          <div className="price-wrap">
            <span className="current-price">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="original-price">{formatPrice(originalPrice)}</span>
            )}
          </div>

          <button
            type="button"
            className={`btn-primary card-add-btn ${justAdded ? 'btn-secondary' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${title} is out of stock` : `Add ${title} to shopping cart`}
          >
            {justAdded ? (
              <>
                <Check size={16} color="var(--color-success)" />
                <span>Added to Cart</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
