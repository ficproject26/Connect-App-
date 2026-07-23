import React, { useState, useEffect } from 'react';
import SplashLoader from './components/common/Loader';
import JobsModal from './components/common/Modal';
import FloatingDock from './components/common/FloatingDock';
import ErrorBoundary from './components/common/ErrorBoundary';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { VendorProvider } from './context/VendorContext';

// Routes
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const [loading, setLoading] = useState(() => {
    try {
      return sessionStorage.getItem('connect_has_seen_splash') !== 'true';
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (!loading) {
      try {
        sessionStorage.setItem('connect_has_seen_splash', 'true');
      } catch (e) {}
    }
  }, [loading]);

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const user = localStorage.getItem('connect_current_user');
      if (user) return 'dashboard';
      return localStorage.getItem('connect_current_page') || 'home';
    } catch (e) {
      return 'home';
    }
  }); // 'home' | 'details' | 'sub-details' | 'login' | 'join-now'

  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      return localStorage.getItem('connect_active_category') || null;
    } catch (e) {
      return null;
    }
  });

  const [activeSubService, setActiveSubService] = useState(() => {
    try {
      return localStorage.getItem('connect_active_sub_service') || null;
    } catch (e) {
      return null;
    }
  });

  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Persist Page Routing State
  useEffect(() => {
    try {
      localStorage.setItem('connect_current_page', currentPage);
    } catch (e) {}
  }, [currentPage]);

  useEffect(() => {
    try {
      if (activeCategory) {
        localStorage.setItem('connect_active_category', activeCategory);
      } else {
        localStorage.removeItem('connect_active_category');
      }
    } catch (e) {}
  }, [activeCategory]);

  useEffect(() => {
    try {
      if (activeSubService) {
        localStorage.setItem('connect_active_sub_service', activeSubService);
      } else {
        localStorage.removeItem('connect_active_sub_service');
      }
    } catch (e) {}
  }, [activeSubService]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleCategoryClick = (categoryName, isSubService = false) => {
    if (!categoryName) return;
    const nameLower = categoryName.toLowerCase();
    const MAIN_CATS = ['services', 'products', 'daily needs', 'food', 'stay', 'travel'];

    if (categoryName === 'Jobs' || nameLower === 'jobs') {
      setIsJobsOpen(true);
    } else if (MAIN_CATS.includes(nameLower) && !isSubService) {
      let canonicalName = 'Services';
      if (nameLower === 'daily needs') canonicalName = 'Daily Needs';
      else canonicalName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      
      setActiveCategory(canonicalName);
      setCurrentPage('details');
    } else {
      setActiveSubService(categoryName);
      setCurrentPage('sub-details');
    }
  };

  const handleHomeNavigate = () => {
    setCurrentPage('home');
    setActiveCategory(null);
    setActiveSubService(null);
  };

  return (
    <>
      {/* Intro Entrance Splash Screen Loader */}
      {loading && <SplashLoader onComplete={() => setLoading(false)} />}

      {/* Main Website Structure (reveals smoothly once loaded) */}
      <div className={`flex-grow flex flex-col transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <AppRoutes
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeSubService={activeSubService}
          setActiveSubService={setActiveSubService}
          theme={theme}
          toggleTheme={toggleTheme}
          isJobsOpen={isJobsOpen}
          setIsJobsOpen={setIsJobsOpen}
          handleCategoryClick={handleCategoryClick}
          handleHomeNavigate={handleHomeNavigate}
        />

        {/* Careers / Jobs Modal */}
        <JobsModal
          isOpen={isJobsOpen}
          onClose={() => setIsJobsOpen(false)}
        />

        {/* Global Floating Quick-Actions Contact Dock */}
        {currentPage === 'home' && <FloatingDock />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CustomerProvider>
          <VendorProvider>
            <AppContent />
          </VendorProvider>
        </CustomerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
