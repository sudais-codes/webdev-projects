import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCart, formatPrice } from '../context/StoreContext';
import { normalizeImageUrl } from '../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    shipping,
    discount,
    total,
    itemCount,
    amountUntilFreeShipping,
    freeShippingProgress,
    isFreeShippingUnlocked,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Empty cart view
  if (!cart || cart.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon-wrap info">
          <ShoppingBag size={36} />
        </div>
        <h2 className="state-title">Your Shopping Bag is Empty</h2>
        <p className="state-desc">
          Looks like you haven't added any items to your cart yet. Explore our curated catalog and
          find something you'll love!
        </p>
        <Link to="/" className="btn-primary btn-lg" style={{ marginTop: 'var(--spacing-sm)' }}>
          <span>Start Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review your selected items ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="btn-secondary btn-sm"
          style={{ color: 'var(--color-error)' }}
          aria-label="Clear all items from shopping cart"
        >
          <Trash2 size={14} />
          <span>Empty Cart</span>
        </button>
      </div>

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-list" aria-label="Shopping cart items">
          {cart.map((item) => {
            const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
            const isAtMaxStock = item.quantity >= item.stock;

            return (
              <div key={item.id} className="cart-item-card">
                {/* Thumbnail */}
                <Link to={`/product/${item.id}`} className="cart-item-thumb">
                  <img
                    src={normalizeImageUrl(item.thumbnail) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90" fill="%23F1F5F9"><rect width="90" height="90" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="%231D4ED8">Item</text></svg>'}
                    alt={item.title}
                    onError={(e) => {
                      const src = e.target.src;
                      if (!src || src.startsWith('data:image/svg+xml')) return;
                      if (src.includes('cdn.dummyjson.com') && !src.includes('/cdn-images/')) {
                        const proxied = src.replace(/https?:\/\/cdn\.dummyjson\.com\//, '/cdn-images/');
                        if (proxied !== src) {
                          e.target.src = proxied;
                          return;
                        }
                      }
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90" fill="%23F1F5F9"><rect width="90" height="90" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="%231D4ED8">Item</text></svg>';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="cart-item-details">
                  <span className="badge badge-subtle" style={{ width: 'fit-content' }}>
                    {item.category}
                  </span>
                  <Link to={`/product/${item.id}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <span className="cart-item-price-unit">
                    Unit Price: {formatPrice(item.price)}
                  </span>
                  {isAtMaxStock && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-warning)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertTriangle size={12} />
                      Max available stock reached ({item.stock})
                    </span>
                  )}
                </div>

                {/* Controls: Quantity, Subtotal, Remove */}
                <div className="cart-item-controls">
                  <div className="quantity-controller">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => decreaseQuantity(item.id)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      -
                    </button>
                    <span className="qty-display" aria-label={`Quantity: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => increaseQuantity(item.id)}
                      disabled={isAtMaxStock}
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      +
                    </button>
                  </div>

                  <span className="cart-item-subtotal">{formatPrice(itemSubtotal)}</span>

                  <button
                    type="button"
                    className="cart-item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.title} from cart`}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <Link to="/" className="btn-secondary">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Cart Summary Sidebar */}
        <aside className="cart-summary-card" aria-label="Order financial summary">
          <h2 className="summary-title">Order Summary</h2>

          {/* Free Shipping Tracker */}
          <div className="free-shipping-tracker">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Truck size={16} color={isFreeShippingUnlocked ? 'var(--color-success)' : 'var(--color-accent)'} />
              {isFreeShippingUnlocked ? (
                <strong style={{ color: 'var(--color-success)' }}>
                  You've unlocked Free Shipping!
                </strong>
              ) : (
                <span>
                  Add <strong>{formatPrice(amountUntilFreeShipping)}</strong> more to get{' '}
                  <strong>Free Shipping</strong>
                </span>
              )}
            </div>
            <div className="shipping-progress-bar">
              <div
                className="shipping-progress-fill"
                style={{
                  width: `${freeShippingProgress}%`,
                  backgroundColor: isFreeShippingUnlocked ? 'var(--color-success)' : 'var(--color-accent)',
                }}
              />
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div className="summary-line-row">
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="summary-line-row">
            <span>Estimated Shipping</span>
            <span style={{ fontWeight: 600, color: isFreeShippingUnlocked ? 'var(--color-success)' : 'var(--text-primary)' }}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </span>
          </div>

          {discount > 0 && (
            <div className="summary-line-row" style={{ color: 'var(--color-success)' }}>
              <span>Applied Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          {/* Final Calculated Total */}
          <div className="summary-line-row total-row">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {/* Summary Actions */}
          <div className="summary-actions">
            <button
              type="button"
              className="btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Reassurances */}
          <div
            style={{
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--color-success)" />
              <span>256-Bit SSL Encrypted &amp; Guaranteed Safe Checkout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="var(--color-brand)" />
              <span>Items saved to your private bag automatically</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
