import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFavorites, useCart, formatPrice } from '../context/StoreContext';
import { normalizeImageUrl } from '../services/api';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  if (!favorites || favorites.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon-wrap" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
          <Heart size={36} fill="#EF4444" />
        </div>
        <h2 className="state-title">Your Wishlist is Empty</h2>
        <p className="state-desc">
          Save items you love by tapping the heart icon on any product card.
          They will stay right here for whenever you are ready to shop!
        </p>
        <Link to="/" className="btn-primary btn-lg" style={{ marginTop: 'var(--spacing-sm)' }}>
          <span>Explore Catalog</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Wishlist</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {favorites.length} {favorites.length === 1 ? 'saved product' : 'saved products'} in your personal list
          </p>
        </div>
        <button
          type="button"
          onClick={clearFavorites}
          className="btn-secondary btn-sm"
          style={{ color: 'var(--color-error)' }}
          aria-label="Remove all favorites"
        >
          <Trash2 size={14} />
          <span>Clear Wishlist</span>
        </button>
      </div>

      {/* Grid of Favorite Products */}
      <div className="product-grid">
        {favorites.map((product) => (
          <div key={product.id} className="product-card">
            <div className="card-top-bar">
              <span className="badge badge-subtle">{product.category}</span>
              <button
                type="button"
                className="favorite-toggle-btn is-favorite"
                onClick={() => removeFromFavorites(product.id)}
                aria-label={`Remove ${product.title} from favorites`}
                title="Remove from favorites"
              >
                <Heart size={16} fill="#EF4444" color="#EF4444" />
              </button>
            </div>

            <div
              className="product-image-container"
              onClick={() => navigate(`/product/${product.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/product/${product.id}`);
                }
              }}
              aria-label={`View details for ${product.title}`}
            >
              <img
                src={normalizeImageUrl(product.thumbnail) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23F1F5F9"><rect width="400" height="400" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="%231D4ED8">NEXORA</text></svg>'}
                alt={product.title}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23F1F5F9"><rect width="400" height="400" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="%231D4ED8">NEXORA</text></svg>';
                }}
              />
            </div>

            <div className="product-info">
              <h3
                className="product-card-title"
                onClick={() => navigate(`/product/${product.id}`)}
                title={product.title}
              >
                {product.title}
              </h3>

              <div className="product-card-footer">
                <span className="current-price">{formatPrice(product.price)}</span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => addToCart(product, 1)}
                    aria-label={`Add ${product.title} to cart`}
                  >
                    <ShoppingBag size={15} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => removeFromFavorites(product.id)}
                    aria-label={`Remove ${product.title} from favorites`}
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <Link to="/" className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
