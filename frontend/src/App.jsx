import React, { useState, useEffect } from 'react';
import SplashLoader from './components/common/Loader';
import JobsModal from './components/common/Modal';
import FloatingDock from './components/common/FloatingDock';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { VendorProvider } from './context/VendorContext';

// Routes
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const user = localStorage.getItem('connect_current_user');
      return user ? 'dashboard' : 'home';
    } catch (e) {
      return 'home';
    }
  }); // 'home' | 'details' | 'sub-details' | 'login' | 'join-now'
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubService, setActiveSubService] = useState(null);
  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

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
    if (categoryName === 'Jobs') {
      setIsJobsOpen(true);
    } else if (isSubService) {
      setActiveSubService(categoryName);
      setCurrentPage('sub-details');
    } else {
      setActiveCategory(categoryName);
      setCurrentPage('details');
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
    <AuthProvider>
      <CustomerProvider>
        <VendorProvider>
          <AppContent />
        </VendorProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}
