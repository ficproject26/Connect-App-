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
  const { resetCustomerState } = useCustomer();
  const isLoggingOutRef = useRef(false);

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // 1. Immediately switch route to public landing page ('home')
      setCurrentPage('home');
      if (typeof handleHomeNavigate === 'function') {
        handleHomeNavigate();
      }

      // 2. Clear customer context state in memory and storage (wallet, tier, transactions)
      if (typeof resetCustomerState === 'function') {
        resetCustomerState();
      }

      // 3. Clear auth session state, cookies, storage, and tokens
      await logout();

      // 4. Update browser URL to public landing ('/') and replace history state
      // so browser back navigation cannot expose authenticated dashboard
      try {
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: 'home', category: null, subService: null }, '', '/');
        }
      } catch (e) {}
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentPage('dashboard');
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
      }
    } catch (e) {}
  };

  const effectiveUser = currentUser || null;

  // Protected pages that strictly require authenticated user session
  const protectedPages = [
    'dashboard', 'profile', 'orders', 'bookings', 'jobs', 'myjobs',
    'wallet', 'membership', 'membership-card', 'card', 'payments', 'settings'
  ];

  // Protected route auth guard: unauthenticated access to protected routes strictly redirects to Public Landing Page
  if (protectedPages.includes(currentPage) && !currentUser) {
    return (
      <CustomerLayout>
        <ErrorBoundary>
          <CustomerDashboard 
            key="guest"
            currentUser={null} 
            onLogOut={handleLogout} 
            onJobsClick={() => setIsJobsOpen(true)}
            onCategoryClick={handleCategoryClick}
            isLandingPage={true}
            hideProfile={true}
            onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
            onNavigateToJoinNow={() => setCurrentPage('join-now')}
          />
        </ErrorBoundary>
      </CustomerLayout>
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
          onNavigateToJoinNow={() => setCurrentPage('join-now')}
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
          onNavigateToLoginPage={() => setCurrentPage('login')}
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
        onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
        onDashboardClick={() => setCurrentPage('dashboard')}
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

  // Home / Landing Page: renders full Customer Dashboard experience (hiding profile when guest)
  return (
    <CustomerLayout>
      <ErrorBoundary>
        <CustomerDashboard 
          key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
          currentUser={currentUser} 
          onLogOut={handleLogout} 
          onJobsClick={() => setIsJobsOpen(true)}
          onCategoryClick={handleCategoryClick}
          isLandingPage={true}
          hideProfile={!currentUser}
          onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
          onNavigateToJoinNow={() => setCurrentPage('join-now')}
        />
      </ErrorBoundary>
    </CustomerLayout>
  );
}
