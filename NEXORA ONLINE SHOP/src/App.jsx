import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Scroll to top automatically on route transitions
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 404 Not Found Page Component
function NotFound() {
  return (
    <div className="state-container" role="alert">
      <div className="state-icon-wrap error">
        <AlertCircle size={36} />
      </div>
      <h1 className="state-title">Page Not Found</h1>
      <p className="state-desc">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Home Store</span>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-container">
          <Header />
          <main className="main-content" id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Home scrollToProducts={true} />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
