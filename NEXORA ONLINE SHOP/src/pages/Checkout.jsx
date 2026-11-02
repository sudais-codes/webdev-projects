import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useCart, formatPrice } from '../context/StoreContext';
import { normalizeImageUrl } from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total, itemCount, clearCart } = useCart();

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });

  // Errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Order submission state
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Validation logic
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) {
          error = 'Full Name is required.';
        } else if (value.trim().length < 3) {
          error = 'Full Name must be at least 3 characters.';
        }
        break;

      case 'email':
        if (!value || !value.trim()) {
          error = 'Email Address is required.';
        } else {
          // Standard email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = 'Please enter a valid email address (e.g. name@example.com).';
          }
        }
        break;

      case 'phone':
        if (!value || !value.trim()) {
          error = 'Phone Number is required.';
        } else {
          // International or standard phone regex (at least 7 digits, permits +, -, spaces, parens)
          const phoneClean = value.replace(/[\s\-\(\)\+]/g, '');
          if (!/^\d{7,15}$/.test(phoneClean)) {
            error = 'Please enter a valid phone number (at least 7 digits).';
          }
        }
        break;

      case 'address':
        if (!value || !value.trim()) {
          error = 'Street Address is required.';
        } else if (value.trim().length < 8) {
          error = 'Address must be at least 8 characters.';
        }
        break;

      case 'city':
        if (!value || !value.trim()) {
          error = 'City is required.';
        }
        break;

      case 'postalCode':
        if (!value || !value.trim()) {
          error = 'Postal code is required.';
        } else if (value.trim().length < 3) {
          error = 'Postal code is too short.';
        }
        break;

      case 'country':
        if (!value || !value.trim()) {
          error = 'Country is required.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If already touched, validate dynamically to clear error
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Focus the first error field
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) element.focus();
      return;
    }

    // Success! Generate simulated order details
    const orderRef = `NEX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const confirmedOrder = {
      orderReference: orderRef,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      customer: { ...formData },
      items: [...cart],
      financials: {
        subtotal,
        shipping,
        total,
      },
    };

    setOrderConfirmed(confirmedOrder);
    clearCart(); // Clear cart as specified in PRD
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If order was placed successfully, display confirmation state
  if (orderConfirmed) {
    return (
      <div className="order-confirmation-card" role="region" aria-label="Order confirmation details">
        <div className="success-check-badge">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Thank You! Your NEXORA Order is Confirmed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A confirmation receipt and order summary have been created for your NEXORA purchase.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="order-reference-box">
          Order Reference: {orderConfirmed.orderReference}
        </div>

        {/* Security Notice */}
        <div className="alert alert-info" style={{ textAlign: 'left', width: '100%' }}>
          <Sparkles size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Order Status Confirmed:</strong> Your purchase has been logged successfully. Free express delivery estimated within 3-5 business days.
          </div>
        </div>

        {/* Recap details */}
        <div className="order-details-recap">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Delivery Details:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{orderConfirmed.date}</span>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>{orderConfirmed.customer.fullName}</strong></p>
            <p>{orderConfirmed.customer.email} • {orderConfirmed.customer.phone}</p>
            <p>{orderConfirmed.customer.address}, {orderConfirmed.customer.city}, {orderConfirmed.customer.postalCode}</p>
            <p>{orderConfirmed.customer.country}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Ordered Items ({orderConfirmed.items.length}):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orderConfirmed.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{item.title} (x{item.quantity})</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            <span>Total Paid</span>
            <span>{formatPrice(orderConfirmed.financials.total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          <span>Continue Shopping NEXORA</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Handle empty cart access
  if (!cart || cart.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon-wrap info">
          <AlertCircle size={36} />
        </div>
        <h2 className="state-title">Your Cart is Empty</h2>
        <p className="state-desc">
          You need items in your shopping cart before you can proceed with checkout.
        </p>
        <Link to="/" className="btn-primary btn-lg" style={{ marginTop: 'var(--spacing-sm)' }}>
          <ArrowLeft size={18} />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Complete your delivery details to finalize your order.
          </p>
        </div>
        <Link to="/cart" className="btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Security alert notice */}
      <div className="alert alert-info">
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Guaranteed Safe &amp; Secure Checkout:</strong> 256-Bit SSL Encrypted. Complete your delivery details below.
        </div>
      </div>

      <div className="checkout-layout">
        {/* Left: Controlled Checkout Form */}
        <form onSubmit={handleSubmit} className="checkout-form-section" noValidate>
          {/* Section 1: Customer Information */}
          <div>
            <h2 className="form-block-title">
              <User size={20} color="var(--color-brand)" />
              <span>Customer Information</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {/* Full Name */}
              <div className="form-field-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Muhammad Ali"
                  className={errors.fullName && touched.fullName ? 'input-error' : ''}
                  aria-invalid={Boolean(errors.fullName && touched.fullName)}
                  aria-describedby={errors.fullName && touched.fullName ? 'fullName-error' : undefined}
                  required
                />
                {errors.fullName && touched.fullName && (
                  <span id="fullName-error" className="form-error-msg" role="alert">
                    <AlertCircle size={14} /> {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email & Phone */}
              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="example@gmail.com"
                    className={errors.email && touched.email ? 'input-error' : ''}
                    aria-invalid={Boolean(errors.email && touched.email)}
                    aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                    required
                  />
                  {errors.email && touched.email && (
                    <span id="email-error" className="form-error-msg" role="alert">
                      <AlertCircle size={14} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="+92 300 1234567"
                    className={errors.phone && touched.phone ? 'input-error' : ''}
                    aria-invalid={Boolean(errors.phone && touched.phone)}
                    aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                    required
                  />
                  {errors.phone && touched.phone && (
                    <span id="phone-error" className="form-error-msg" role="alert">
                      <AlertCircle size={14} /> {errors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div>
            <h2 className="form-block-title">
              <MapPin size={20} color="var(--color-brand)" />
              <span>Delivery Address</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {/* Street Address */}
              <div className="form-field-group">
                <label htmlFor="address" className="form-label">
                  Complete Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="House # 12, Street 4, Block B, DHA Phase 5"
                  className={errors.address && touched.address ? 'input-error' : ''}
                  aria-invalid={Boolean(errors.address && touched.address)}
                  aria-describedby={errors.address && touched.address ? 'address-error' : undefined}
                  required
                />
                {errors.address && touched.address && (
                  <span id="address-error" className="form-error-msg" role="alert">
                    <AlertCircle size={14} /> {errors.address}
                  </span>
                )}
              </div>

              {/* City & Postal Code */}
              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="city" className="form-label">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Lahore"
                    className={errors.city && touched.city ? 'input-error' : ''}
                    aria-invalid={Boolean(errors.city && touched.city)}
                    aria-describedby={errors.city && touched.city ? 'city-error' : undefined}
                    required
                  />
                  {errors.city && touched.city && (
                    <span id="city-error" className="form-error-msg" role="alert">
                      <AlertCircle size={14} /> {errors.city}
                    </span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="postalCode" className="form-label">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="54000"
                    className={errors.postalCode && touched.postalCode ? 'input-error' : ''}
                    aria-invalid={Boolean(errors.postalCode && touched.postalCode)}
                    aria-describedby={errors.postalCode && touched.postalCode ? 'postalCode-error' : undefined}
                    required
                  />
                  {errors.postalCode && touched.postalCode && (
                    <span id="postalCode-error" className="form-error-msg" role="alert">
                      <AlertCircle size={14} /> {errors.postalCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="form-field-group">
                <label htmlFor="country" className="form-label">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="filter-select"
                  required
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h2 className="form-block-title">
              <CreditCard size={20} color="var(--color-brand)" />
              <span>Payment Option</span>
            </h2>
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>Zero-Fee Verified Checkout</span>
              </div>
              <p>Instant contactless verification with no extra hidden surcharges or payment fees.</p>
            </div>
          </div>

          {/* Submit Order Button */}
          <button type="submit" className="btn-primary btn-lg" style={{ width: '100%' }}>
            <span>Complete Order ({formatPrice(total)})</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Right: Order Summary Sidebar */}
        <aside className="checkout-summary-box" aria-label="Checkout order breakdown">
          <h2 className="summary-title">Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h2>

          {/* Itemized Mini List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {cart.map((item) => (
              <div key={item.id} className="mini-item-row">
                <div className="mini-item-info">
                  <img
                    src={normalizeImageUrl(item.thumbnail) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="%23F1F5F9"><rect width="42" height="42" fill="%23F1F5F9"/></svg>'}
                    alt={item.title}
                    className="mini-item-thumb"
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
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="%23F1F5F9"><rect width="42" height="42" fill="%23F1F5F9"/></svg>';
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {item.title}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Calculation lines */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="summary-line-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-line-row">
              <span>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--color-success)' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>

            <div className="summary-line-row total-row">
              <span>Final Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div
            style={{
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Truck size={16} color="var(--color-accent)" />
            <span>Standard delivery estimated within 3-5 business days.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
