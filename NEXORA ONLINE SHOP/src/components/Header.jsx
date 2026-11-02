import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Sparkles, Home as HomeIcon, ShieldCheck } from 'lucide-react';
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

  // Lock body scroll and handle ESC key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
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
      </header>

      {/* Mobile Navigation Drawer rendered directly in document.body to escape header containing block */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className={`mobile-drawer-root ${mobileMenuOpen ? 'is-active' : ''}`} aria-hidden={!mobileMenuOpen}>
            <div
              className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
              onClick={closeMenu}
              aria-hidden="true"
            />
            <aside
              className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Drawer"
            >
              <div className="mobile-drawer-header">
                <Link to="/" className="brand-logo" onClick={closeMenu}>
                  <div className="brand-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="brand-name">
                    <span className="brand-title" style={{ fontSize: '1.15rem' }}>NEXORA</span>
                    <span className="brand-subtitle">ONLINE SHOP</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="mobile-nav-close"
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mobile-nav-links">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HomeIcon size={18} />
                    <span>Home</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/shop"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} />
                    <span>Shop Products</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/favorites"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Heart size={18} />
                    <span>Wishlist</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="mobile-nav-badge badge-favorite">{favoritesCount}</span>
                  )}
                </NavLink>

                <NavLink
                  to="/cart"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingBag size={18} />
                    <span>Shopping Cart</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="mobile-nav-badge">{itemCount}</span>
                  )}
                </NavLink>

                <NavLink
                  to="/checkout"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} />
                    <span>Checkout</span>
                  </div>
                </NavLink>
              </nav>

              <div className="mobile-drawer-footer">
                <div className="mobile-drawer-badge">
                  <Sparkles size={14} />
                  <span>Curated Modern Living Selection</span>
                </div>
                <p className="mobile-drawer-tagline">
                  Free shipping on orders over $100
                </p>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
