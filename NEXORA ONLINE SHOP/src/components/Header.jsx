import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Sparkles } from 'lucide-react';
import { useCart, useFavorites } from '../context/StoreContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { itemCount } = useCart();
  const { favoritesCount } = useFavorites();

  // Add subtle shadow when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="NEXORA Online Shop Homepage">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <div className="brand-name">
            <span className="brand-title">NEXORA</span>
            <span className="brand-subtitle">ONLINE SHOP</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Shop Products
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Wishlist
          </NavLink>
        </nav>

        {/* Header Actions (Favorites, Cart, Mobile Toggle) */}
        <div className="header-actions">
          {/* Favorites Icon Button */}
          <Link
            to="/favorites"
            className="action-btn"
            aria-label={`Favorites with ${favoritesCount} items`}
            title="Saved Favorites"
          >
            <Heart size={22} className={favoritesCount > 0 ? 'text-red-500' : ''} />
            {favoritesCount > 0 && (
              <span className="action-badge badge-favorite" aria-hidden="true">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </Link>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="action-btn"
            aria-label={`Shopping cart with ${itemCount} items`}
            title="Shopping Cart"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="action-badge" aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="action-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <button
              type="button"
              className="action-btn mobile-nav-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={22} />
            </button>

            <nav className="mobile-nav-links">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Products
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist ({favoritesCount})
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shopping Cart ({itemCount})
              </NavLink>
              <NavLink
                to="/checkout"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Checkout
              </NavLink>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
