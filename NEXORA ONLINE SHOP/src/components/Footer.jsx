import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }} aria-label="NEXORA Online Shop Homepage">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <div className="brand-name">
              <span className="brand-title">NEXORA</span>
              <span className="brand-subtitle">ONLINE SHOP</span>
            </div>
          </Link>
          <p className="footer-desc">
            NEXORA ONLINE SHOP delivers a curated, modern retail shopping experience featuring authentic
            products, real-time stock availability, and reliable client-side convenience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-column-title">Explore</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/" className="footer-link">Home Store</Link>
            </li>
            <li>
              <Link to="/favorites" className="footer-link">My Wishlist</Link>
            </li>
            <li>
              <Link to="/cart" className="footer-link">Shopping Cart</Link>
            </li>
            <li>
              <Link to="/checkout" className="footer-link">Express Checkout</Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="footer-column-title">Guarantees</h4>
          <ul className="footer-links-list">
            <li className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} className="text-teal-600" /> Free Shipping &gt; $100
            </li>
            <li className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className="text-teal-600" /> 30-Day Hassle-Free Returns
            </li>
            <li className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} className="text-teal-600" /> 256-Bit Encrypted Secure Checkout
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="footer-column-title">Stay Connected</h4>
          <p className="footer-desc" style={{ marginBottom: '10px' }}>
            Subscribe for seasonal updates, new collections, and exclusive discounts from NEXORA ONLINE SHOP.
          </p>
          {subscribed ? (
            <div className="badge badge-success" style={{ padding: '8px 12px', fontSize: '13px' }}>
              <CheckCircle2 size={16} /> Thank you for subscribing to NEXORA updates!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="btn-primary btn-sm" aria-label="Subscribe">
                <Mail size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom disclaimer bar */}
      <div className="footer-bottom-bar">
        <span>© {new Date().getFullYear()} NEXORA ONLINE SHOP. All rights reserved.</span>
        <span>Curated Luxury &amp; Everyday Modern Essentials</span>
      </div>
    </footer>
  );
}
