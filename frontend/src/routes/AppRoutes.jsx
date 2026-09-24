import React, { useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useCustomer from '../hooks/useCustomer';
import { authService } from '../services/authService';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import CustomerLayout from '../layouts/CustomerLayout';
// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import JoinNowPage from '../pages/auth/JoinNowPage';
import CustomerDashboard from '../pages/customer/Dashboard';
import CategoryDetails from '../pages/landing/CategoryDetails';
import SubServiceDetails from '../pages/landing/SubServiceDetails';

import ErrorBoundary from '../components/common/ErrorBoundary';

export default function AppRoutes({
  currentPage,
  setCurrentPage,
  activeCategory,
  setActiveCategory,
  activeSubService,
  setActiveSubService,
  theme,
  toggleTheme,
  isJobsOpen,
  setIsJobsOpen,
  handleCategoryClick,
  handleHomeNavigate
}) {
  const { currentUser, login, logout, register } = useAuth();
  const { resetCustomerData } = useCustomer ? useCustomer() : { resetCustomerData: () => {} };
  const isLoggingOutRef = useRef(false);

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // 1. Reset customer context (wallet balance, tier, transactions)
      try {
        if (typeof resetCustomerData === 'function') {
          resetCustomerData();
        }
      } catch (e) {}

      // 2. Perform backend session invalidation via authService
      try {
        if (authService && typeof authService.logout === 'function') {
          await authService.logout();
        }
      } catch (e) {}

      // 3. Completely clear all customer auth state, storage keys, and cookies
      logout();

      // 4. Clear storage page and tab tracking keys
      try {
        localStorage.removeItem('connect_current_page');
        localStorage.removeItem('connect_active_profile_tab');
        localStorage.removeItem('connect_profile_modal_open');
        localStorage.removeItem('connect_active_category');
        localStorage.removeItem('connect_active_sub_service');
      } catch (e) {}

      // 5. Update browser URL to public landing ('/') and replace history state
      // so browser back navigation cannot expose authenticated dashboard
      try {
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: 'home', category: null, subService: null }, '', '/');
        }
      } catch (e) {}

      // 6. Cleanly navigate directly to the public landing/home page
      if (handleHomeNavigate) {
        handleHomeNavigate();
      } else {
        setCurrentPage('home');
      }
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentPage('dashboard');
    try {
      if (typeof window !== 'undefined') {
        window.history.replaceState({ page: 'dashboard' }, '', '/dashboard');
      }
    } catch (e) {}
  };

  const effectiveUser = currentUser || null;

  // Protected pages that require authenticated user session
  const protectedPages = ['dashboard', 'profile', 'orders', 'bookings', 'settings', 'membership', 'payments', 'wallet', 'myjobs', 'card'];

  // Keep state and URL in sync when unauthenticated customer hits protected page
  useEffect(() => {
    if (protectedPages.includes(currentPage) && !currentUser) {
      setCurrentPage('home');
      try {
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: 'home', category: null, subService: null }, '', '/');
        }
      } catch (e) {}
    }
  }, [currentPage, currentUser, setCurrentPage]);

  // Protected route auth guard: unauthenticated access to protected routes strictly redirects to Landing Page ('/')
  if (protectedPages.includes(currentPage) && !currentUser) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      try {
        window.history.replaceState({ page: 'home', category: null, subService: null }, '', '/');
      } catch (e) {}
    }
    return (
      <LandingLayout
        theme={theme}
        toggleTheme={toggleTheme}
        onHomeClick={handleHomeNavigate} 
        onCategoryClick={handleCategoryClick}
        isJobsOpen={isJobsOpen}
        setIsJobsOpen={setIsJobsOpen}
        currentUser={null}
        onLogOut={handleLogout}
        onAuthClick={(tab) => {
          const target = tab === 'login' ? 'login' : 'join-now';
          setCurrentPage(target);
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: target }, '', `/${target}`);
          }
        }}
        onDashboardClick={() => {
          setCurrentPage('login');
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: 'login' }, '', '/login');
          }
        }}
      >
        <LandingPage
          onJoinClick={() => {
            setCurrentPage('join-now');
            if (typeof window !== 'undefined') {
              window.history.pushState({ page: 'join-now' }, '', '/join-now');
            }
          }}
          onCategoryClick={handleCategoryClick}
          theme={theme}
        />
      </LandingLayout>
    );
  }

  // Routing decisions
  if (currentPage === 'dashboard') {
    return (
      <CustomerLayout>
        <ErrorBoundary>
          <CustomerDashboard 
            key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
            currentUser={effectiveUser} 
            onLogOut={handleLogout} 
            onJobsClick={() => setIsJobsOpen(true)}
            onCategoryClick={handleCategoryClick}
          />
        </ErrorBoundary>
      </CustomerLayout>
    );
  }

  if (currentPage === 'login') {
    if (currentUser) {
      return (
        <CustomerLayout>
          <ErrorBoundary>
            <CustomerDashboard 
              key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
              currentUser={effectiveUser} 
              onLogOut={handleLogout} 
              onJobsClick={() => setIsJobsOpen(true)}
              onCategoryClick={handleCategoryClick}
            />
          </ErrorBoundary>
        </CustomerLayout>
      );
    }

    return (
      <AuthLayout>
        <LoginPage
          onAuthSuccess={handleAuthSuccess}
          onBackToHome={handleHomeNavigate}
          onNavigateToJoinNow={() => {
            setCurrentPage('join-now');
            try {
              if (typeof window !== 'undefined') {
                window.history.pushState({ page: 'join-now' }, '', '/join-now');
              }
            } catch (e) {}
          }}
        />
      </AuthLayout>
    );
  }

  if (currentPage === 'join-now') {
    return (
      <AuthLayout>
        <JoinNowPage
          onAuthSuccess={(user) => {
            register(user, user.role, handleAuthSuccess);
          }}
          onBackToHome={handleHomeNavigate}
          onNavigateToLoginPage={() => {
            setCurrentPage('login');
            try {
              if (typeof window !== 'undefined') {
                window.history.pushState({ page: 'login' }, '', '/login');
              }
            } catch (e) {}
          }}
        />
      </AuthLayout>
    );
  }

  // Details or Sub-details views
  if (currentPage === 'details' || currentPage === 'sub-details') {
    return (
      <LandingLayout
        theme={theme}
        toggleTheme={toggleTheme}
        onHomeClick={handleHomeNavigate} 
        onCategoryClick={handleCategoryClick}
        isJobsOpen={isJobsOpen}
        setIsJobsOpen={setIsJobsOpen}
        currentUser={currentUser}
        onLogOut={handleLogout}
        onAuthClick={(tab) => {
          const target = tab === 'login' ? 'login' : 'join-now';
          setCurrentPage(target);
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: target }, '', `/${target}`);
          }
        }}
        onDashboardClick={() => {
          setCurrentPage('dashboard');
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
          }
        }}
      >
        {currentPage === 'details' ? (
          <CategoryDetails
            category={activeCategory}
            onBack={handleHomeNavigate}
            onSubCategoryClick={(subTitle) => handleCategoryClick(subTitle, true)}
          />
        ) : (
          <SubServiceDetails
            title={activeSubService}
            onBack={handleHomeNavigate}
          />
        )}
      </LandingLayout>
    );
  }

  // Home / Landing Page: renders public LandingPage (Hero, Ecosystem, Pricing, Services, etc.)
  return (
    <LandingLayout
      theme={theme}
      toggleTheme={toggleTheme}
      onHomeClick={handleHomeNavigate} 
      onCategoryClick={handleCategoryClick}
      isJobsOpen={isJobsOpen}
      setIsJobsOpen={setIsJobsOpen}
      currentUser={currentUser}
      onLogOut={handleLogout}
      onAuthClick={(tab) => {
        const target = tab === 'login' ? 'login' : 'join-now';
        setCurrentPage(target);
        if (typeof window !== 'undefined') {
          window.history.pushState({ page: target }, '', `/${target}`);
        }
      }}
      onDashboardClick={() => {
        setCurrentPage('dashboard');
        if (typeof window !== 'undefined') {
          window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
        }
      }}
    >
      <LandingPage
        onJoinClick={() => {
          setCurrentPage('join-now');
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: 'join-now' }, '', '/join-now');
          }
        }}
        onCategoryClick={handleCategoryClick}
        theme={theme}
      />
    </LandingLayout>
  );
}
