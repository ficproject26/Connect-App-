import React, { useRef } from 'react';
import useAuth from '../hooks/useAuth';
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
  activeSubService,
  theme,
  toggleTheme,
  isJobsOpen,
  setIsJobsOpen,
  handleCategoryClick,
  handleHomeNavigate
}) {
  const { currentUser, login, logout, register } = useAuth();
  const isLoggingOutRef = useRef(false);

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // 1. Perform session invalidation / cleanup via authService
      try {
        if (authService && typeof authService.logout === 'function') {
          await authService.logout();
        }
      } catch (e) {}

      // 2. Clear authentication session state and tokens
      logout();

      // 3. Cleanly navigate directly to the public landing/home page
      if (handleHomeNavigate) {
        handleHomeNavigate();
      } else {
        setCurrentPage('home');
      }

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

  // Protected pages that require authenticated user session
  const protectedPages = ['dashboard', 'profile', 'orders', 'bookings', 'settings', 'membership', 'payments', 'wallet', 'myjobs', 'card'];

  // Protected route auth guard: unauthenticated access to protected routes redirects to LoginPage
  if (protectedPages.includes(currentPage) && !currentUser) {
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

  // Routing decisions
  if (currentPage === 'dashboard') {
    return (
      <CustomerLayout>
        <ErrorBoundary>
          <CustomerDashboard 
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
