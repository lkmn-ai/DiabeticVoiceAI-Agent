import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductDetail } from './components/ProductDetail';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { DiabeticVoiceConsultant } from './components/DiabeticVoiceConsultant';
import { getHealth } from './services/api';
import './index.css';

const CONV_ID = `conv_${Date.now()}`;

export default function App() {
  const [page, setPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Backend health check
  useEffect(() => {
    const check = async () => {
      try {
        await getHealth();
        setBackendStatus('ok');
      } catch {
        setBackendStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, selectedProduct]);

  const navigate = useCallback((p, params = {}) => {
    setPage(p);
    setPageParams(params);
    setSelectedProduct(null);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProductBack = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // Render page content
  const renderPage = () => {
    // If a product is selected, always show detail
    if (selectedProduct) {
      return (
        <div style={{ paddingTop: 'var(--header-h)' }}>
          <ProductDetail
            product={selectedProduct}
            onBack={handleProductBack}
            onProductSelect={handleProductSelect}
          />
        </div>
      );
    }

    switch (page) {
      case 'home':
        return (
          <HomePage
            onNavigate={navigate}
            onProductSelect={handleProductSelect}
          />
        );
      case 'products':
        return (
          <ProductsPage
            onProductSelect={handleProductSelect}
            initialCategory={pageParams.category}
            initialConcern={pageParams.concern}
          />
        );
      case 'ingredients':
        return <IngredientsPage />;
      case 'routines':
        return <RoutinesPage onProductSelect={handleProductSelect} />;
      default:
        return (
          <HomePage
            onNavigate={navigate}
            onProductSelect={handleProductSelect}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        page={page}
        onNavigate={navigate}
        backendStatus={backendStatus}
      />

      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <Footer onNavigate={navigate} />

      <DiabeticVoiceConsultant />
    </div>
  );
}
